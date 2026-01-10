// Importación del modelo de caja chica
import CajaChica from '../Models/CajaChica.js';
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import streamifier from 'streamifier';

const cajaChicaController = {};

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

const numeroALetras = (num) => {
  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = { 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE' };
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  const convertir = (n) => {
    if (n === 0) return 'CERO';
    if (n === 100) return 'CIEN';
    if (n < 10) return unidades[n];
    if (n >= 11 && n <= 15) return especiales[n];
    if (n < 20) return 'DIECI' + unidades[n - 10];
    if (n < 30) return n === 20 ? 'VEINTE' : 'VEINTI' + unidades[n - 20];
    if (n < 100) return decenas[Math.floor(n / 10)] + (n % 10 ? ' Y ' + unidades[n % 10] : '');
    if (n < 1000) return centenas[Math.floor(n / 100)] + (n % 100 ? ' ' + convertir(n % 100) : '');
    if (n < 10000) {
      const mil = Math.floor(n / 1000);
      const resto = n % 1000;
      const milTexto = mil === 1 ? 'MIL' : unidades[mil] + ' MIL';
      return milTexto + (resto ? ' ' + convertir(resto) : '');
    }
    return 'VALOR MUY ALTO';
  };

  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);

  return `${convertir(entero)} DÓLARES CON ${centavos.toString().padStart(2, '0')}/100`;
};

// =====================================================
// OBTENER TODOS LOS MOVIMIENTOS
// =====================================================
cajaChicaController.getAllMovements = async (req, res) => {
  try {
    const movements = await CajaChica.find().sort({ date: -1 });

    const populatedMovements = await Promise.all(
      movements.map(async (movement) => {
        if (movement.employeeId && movement.employeeId !== 'admin') {
          if (/^[0-9a-fA-F]{24}$/.test(movement.employeeId.toString())) {
            try {
              await movement.populate('employeeId', 'name email');
            } catch (err) {
              console.warn('Populate error:', err.message);
            }
          }
        }
        return movement;
      })
    );

    res.json(populatedMovements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// OBTENER BALANCE ACTUAL
// =====================================================
cajaChicaController.getCurrentBalance = async (req, res) => {
  try {
    const lastMovement = await CajaChica.findOne()
      .sort({ date: -1, createdAt: -1 })
      .select('currentBalance');

    res.json({
      currentBalance: lastMovement ? lastMovement.currentBalance : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// REGISTRAR INGRESO (CON PASSWORD)
// =====================================================
cajaChicaController.registrarIngreso = async (req, res) => {
  try {
    const { amount, reason, password } = req.body;
    const monto = Number(amount);

    console.log('📥 INGRESO - Datos recibidos:');
    console.log('   - amount:', amount);
    console.log('   - reason:', reason);
    console.log('   - hasPassword:', !!password);
    console.log('   - hasFile:', !!req.file);

    // Validaciones base
    if (!amount || !reason) {
      console.log('❌ Faltan campos requeridos');
      return res.status(400).json({
        message: "Monto y razón son obligatorios"
      });
    }

    if (isNaN(monto) || monto <= 0) {
      console.log('❌ Monto inválido');
      return res.status(400).json({
        message: "El monto debe ser un número mayor a 0"
      });
    }

    // Verificar que existe la configuración de password
    if (!config.CAJA_CHICA?.passwordReintegro) {
      console.log('❌ Password no configurado en servidor');
      return res.status(500).json({
        message: "La contraseña de caja chica no está configurada en el servidor"
      });
    }

    // Validar password
    if (!password) {
      console.log('❌ Password no proporcionado');
      return res.status(401).json({
        message: "Se requiere contraseña para registrar ingresos"
      });
    }

    if (password !== config.CAJA_CHICA.passwordReintegro) {
      console.log('❌ Password incorrecto');
      return res.status(401).json({
        message: "Contraseña incorrecta"
      });
    }

    // Obtener balance actual
    const lastMovement = await CajaChica.findOne()
      .sort({ date: -1, createdAt: -1 })
      .select('currentBalance');

    const previousBalance = lastMovement ? lastMovement.currentBalance : 0;
    const currentBalance = previousBalance + monto;

    console.log('💰 Balance:', { previousBalance, monto, currentBalance });

    // Validar máximo permitido
    const CajaChicaConfig = (await import('../Models/CajaChicaConfig.js')).default;
    const configuracion = await CajaChicaConfig.obtenerConfiguracion();

    if (
      configuracion?.maximoPermitido &&
      currentBalance > configuracion.maximoPermitido
    ) {
      return res.status(400).json({
        message: "El ingreso excede el máximo permitido",
        data: {
          balanceActual: previousBalance,
          balanceResultante: currentBalance,
          maximoPermitido: configuracion.maximoPermitido
        }
      });
    }

    // Subir voucher (opcional para ingresos)
    let voucherUrl = null;
    if (req.file) {
      try {
        console.log('📎 Subiendo voucher...');
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "vouchers",
          resource_type: "auto"
        });
        voucherUrl = result.secure_url;
        await fs.unlink(req.file.path);
        console.log('✅ Voucher subido');
      } catch (err) {
        console.warn("⚠️ Error subiendo voucher:", err.message);
      }
    }

    // Crear movimiento
    const movement = new CajaChica({
      date: new Date(),
      employeeId: 'admin',
      amount: monto,
      reason,
      type: 'income',
      previousBalance,
      currentBalance,
      voucher: voucherUrl
    });

    await movement.save();
    console.log('✅ Ingreso registrado exitosamente');

    res.json({
      message: "Ingreso registrado exitosamente",
      movement
    });

  } catch (error) {
    console.error('❌ Error en registrarIngreso:', error);
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// REGISTRAR EGRESO (SIN PASSWORD) - SIN AUTH REQUERIDA
// =====================================================
cajaChicaController.cashOperation = async (req, res) => {
  try {
    console.log('📤 EGRESO - Iniciando...');
    console.log('   Body:', req.body);
    console.log('   File:', req.file ? 'Presente' : 'Ausente');
    console.log('   User:', req.user || 'No autenticado');

    const { amount, reason, employeeId } = req.body;

    // Convertir amount a número
    const monto = parseFloat(amount);

    console.log('   Parsed amount:', monto);

    // Validaciones base
    if (!amount) {
      console.log('❌ Falta el monto');
      return res.status(400).json({
        message: "El monto es obligatorio",
        received: { amount, reason, hasFile: !!req.file }
      });
    }

    if (!reason) {
      console.log('❌ Falta la razón');
      return res.status(400).json({
        message: "La razón es obligatoria",
        received: { amount, reason, hasFile: !!req.file }
      });
    }

    if (isNaN(monto) || monto <= 0) {
      console.log('❌ Monto inválido:', monto);
      return res.status(400).json({
        message: "El monto debe ser un número mayor a 0",
        received: { amount, monto, type: typeof amount }
      });
    }

    // Determinar el empleado
    let finalEmployeeId = 'admin';

    if (req.user) {
      const userType = req.user.userType;

      if (userType === 'admin') {
        finalEmployeeId = employeeId || 'admin';
      } else {
        if (!employeeId) {
          return res.status(400).json({
            message: "Se requiere employeeId para usuarios no admin"
          });
        }
        finalEmployeeId = employeeId;
      }
    } else {
      finalEmployeeId = employeeId || 'admin';
    }

    console.log('👤 Usuario final:', finalEmployeeId);

    // Obtener balance actual
    const lastMovement = await CajaChica.findOne()
      .sort({ date: -1, createdAt: -1 })
      .select('currentBalance');

    const previousBalance = lastMovement ? lastMovement.currentBalance : 0;

    console.log('💰 Balance actual:', previousBalance);

    // Validar fondos suficientes
    if (previousBalance < monto) {
      console.log('❌ Fondos insuficientes');
      return res.status(400).json({
        message: "Fondos insuficientes en caja chica",
        data: {
          balanceActual: previousBalance,
          montoSolicitado: monto,
          faltante: monto - previousBalance
        }
      });
    }

    const currentBalance = previousBalance - monto;
    console.log('💰 Nuevo balance:', currentBalance);

    // Subir voucher (OPCIONAL)
    let voucherUrl = null;

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "vouchers",
          resource_type: "auto"
        });
        voucherUrl = result.secure_url;

        await fs.unlink(req.file.path);
      } catch (err) {
        console.warn('⚠️ Error subiendo comprobante:', err.message);

        if (req.file?.path) {
          try {
            await fs.unlink(req.file.path);
          } catch {}
        }
      }
    }

    // Crear movimiento
    const movement = new CajaChica({
      date: new Date(),
      employeeId: finalEmployeeId,
      amount: monto,
      reason,
      type: 'expense',
      previousBalance,
      currentBalance,
      voucher: voucherUrl
    });

    await movement.save();
    console.log('✅ Movimiento guardado en DB');

    // Intentar popular si no es admin
    if (movement.employeeId !== 'admin' &&
      /^[0-9a-fA-F]{24}$/.test(movement.employeeId.toString())) {
      try {
        await movement.populate('employeeId', 'name email');
        console.log('✅ EmployeeId populado');
      } catch (err) {
        console.warn('⚠️ No se pudo popular employeeId');
      }
    }

    console.log('✅✅✅ Egreso registrado exitosamente');

    res.json({
      message: "Egreso registrado exitosamente",
      movement
    });

  } catch (error) {
    console.error('❌❌❌ Error en cashOperation:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// =====================================================
// ELIMINAR MOVIMIENTO
// =====================================================
cajaChicaController.deleteMovement = async (req, res) => {
  try {
    const { id } = req.params;

    const movement = await CajaChica.findById(id);

    if (!movement) {
      return res.status(404).json({
        message: "Movimiento no encontrado"
      });
    }

    await CajaChica.findByIdAndDelete(id);

    res.json({
      message: "Movimiento eliminado exitosamente"
    });

  } catch (error) {
    console.error('❌ Error eliminando movimiento:', error);
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// SUBIR/ACTUALIZAR VOUCHER DE UN MOVIMIENTO EXISTENTE
// =====================================================
cajaChicaController.uploadVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📎 UPLOAD VOUCHER - Iniciando...');
    console.log('   Movement ID:', id);
    console.log('   File:', req.file ? 'Presente' : 'Ausente');

    // Validar que se envió un archivo
    if (!req.file) {
      console.log('❌ No se proporcionó archivo');
      return res.status(400).json({
        message: "Se requiere un archivo de comprobante"
      });
    }

    // Buscar el movimiento
    const movement = await CajaChica.findById(id);

    if (!movement) {
      console.log('❌ Movimiento no encontrado');
      
      // Eliminar archivo temporal si el movimiento no existe
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (err) {
          console.warn('⚠️ Error eliminando archivo temporal:', err.message);
        }
      }

      return res.status(404).json({
        message: "Movimiento no encontrado"
      });
    }

    console.log('✅ Movimiento encontrado');

    // Si ya existe un voucher, eliminar el anterior de Cloudinary (opcional)
    if (movement.voucher) {
      try {
        // Extraer public_id del URL de Cloudinary
        const urlParts = movement.voucher.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `vouchers/${fileName.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
        console.log('🗑️ Voucher anterior eliminado de Cloudinary');
      } catch (err) {
        console.warn('⚠️ Error eliminando voucher anterior:', err.message);
      }
    }

    // Subir nuevo voucher a Cloudinary
    let voucherUrl = null;
    try {
      console.log('📤 Subiendo nuevo voucher...');
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "vouchers",
        resource_type: "auto"
      });
      voucherUrl = result.secure_url;
      console.log('✅ Voucher subido exitosamente');
    } catch (err) {
      console.error('❌ Error subiendo a Cloudinary:', err.message);
      
      // Eliminar archivo temporal
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch {}
      }

      return res.status(500).json({
        message: "Error al subir el comprobante a la nube",
        error: err.message
      });
    }

    // Eliminar archivo temporal del servidor
    try {
      await fs.unlink(req.file.path);
      console.log('🗑️ Archivo temporal eliminado');
    } catch (err) {
      console.warn('⚠️ Error eliminando archivo temporal:', err.message);
    }

    // Actualizar el movimiento con el nuevo voucher
    movement.voucher = voucherUrl;
    await movement.save();

    console.log('✅✅✅ Voucher actualizado exitosamente');

    // Popular employeeId si es necesario
    if (movement.employeeId !== 'admin' &&
      /^[0-9a-fA-F]{24}$/.test(movement.employeeId.toString())) {
      try {
        await movement.populate('employeeId', 'name email');
      } catch (err) {
        console.warn('⚠️ No se pudo popular employeeId');
      }
    }

    res.json({
      message: "Comprobante subido exitosamente",
      movement
    });

  } catch (error) {
    console.error('❌❌❌ Error en uploadVoucher:', error);
    console.error('Stack:', error.stack);

    // Limpiar archivo temporal en caso de error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }

    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// ========================================
// FUNCIÓN GENERAR VALE - FORMATO RIVERA TRANSPORTES
// ========================================
cajaChicaController.generarVale = async (req, res) => {
  let browser;

  try {
    const { id } = req.params;
const { nombreBeneficiario } = req.body;

    console.log('📄 Generando vale para movimiento:', id);
    console.log('👤 Beneficiario:', nombreBeneficiario);

    // Validar datos
    if (!id || !nombreBeneficiario) {
      return res.status(400).json({
        message: "Datos incompletos: se requiere ID y nombre del beneficiario"
      });
    }

    // Buscar el movimiento
    const movement = await CajaChica.findById(id);
    if (!movement) {
      return res.status(404).json({ 
        message: "Movimiento no encontrado" 
      });
    }

    // Verificar que sea un egreso
    if (movement.type !== 'expense') {
      return res.status(400).json({
        message: "Solo se pueden generar vales para egresos"
      });
    }

    /* ===============================
       GENERAR NÚMERO DE VALE
    =============================== */
    const year = new Date().getFullYear();

    // Buscar el último vale del año
    const ultimoVale = await CajaChica.findOne({
      vale: { $regex: `^CC-${year}-` }
    }).sort({ vale: -1 });

    let correlativo = 1;
    if (ultimoVale?.vale) {
      const partes = ultimoVale.vale.split('-');
      correlativo = parseInt(partes[2]) + 1;
    }

    const numeroVale = `CC-${year}-${correlativo.toString().padStart(3, '0')}`;
    console.log('🔢 Número de vale generado:', numeroVale);

    /* ===============================
       GENERAR PDF CON PUPPETEER
    =============================== */
    console.log('🚀 Iniciando Puppeteer...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const cantidadEnLetras = numeroALetras(movement.amount);

    // ✅ HTML DEL VALE - FORMATO RIVERA TRANSPORTES
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vale ${numeroVale}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: white;
          }
          
          .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
          }
          
          .header {
            background: #D4A574;
            padding: 15px;
            text-align: center;
            border-bottom: 2px solid #000;
          }
          
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            color: #000;
            margin: 0;
          }
          
          .fecha-section {
            display: flex;
            border-bottom: 2px solid #000;
          }
          
          .fecha-label {
            background: #E8E8E8;
            padding: 8px 12px;
            border-right: 2px solid #000;
            font-weight: bold;
            font-size: 12px;
            min-width: 100px;
          }
          
          .fecha-fields {
            display: flex;
            flex: 1;
          }
          
          .fecha-field {
            flex: 1;
            padding: 8px;
            border-right: 2px solid #000;
            text-align: center;
          }
          
          .fecha-field:last-child {
            border-right: none;
          }
          
          .fecha-field-label {
            font-size: 10px;
            color: #666;
            margin-bottom: 2px;
          }
          
          .fecha-field-value {
            font-size: 14px;
            font-weight: bold;
          }
          
          .numero-section {
            display: flex;
            border-bottom: 2px solid #000;
          }
          
          .numero-label {
            background: #E8E8E8;
            padding: 8px 12px;
            border-right: 2px solid #000;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
            min-width: 100px;
          }
          
          .numero-value {
            flex: 1;
            padding: 8px 12px;
            font-size: 16px;
            font-weight: bold;
          }
          
          .monto-section {
            display: flex;
            align-items: center;
            border-bottom: 2px solid #000;
            padding: 10px 12px;
          }
          
          .monto-symbol {
            font-size: 20px;
            font-weight: bold;
            margin-right: 10px;
          }
          
          .monto-value {
            font-size: 24px;
            font-weight: bold;
          }
          
          .concepto-section {
            border-bottom: 2px solid #000;
          }
          
          .concepto-label {
            background: #E8E8E8;
            padding: 8px 12px;
            font-weight: bold;
            font-size: 12px;
            border-bottom: 1px solid #000;
          }
          
          .concepto-value {
            padding: 15px 12px;
            min-height: 80px;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .cantidad-letras-section {
            border-bottom: 2px solid #000;
          }
          
          .cantidad-letras-label {
            background: #E8E8E8;
            padding: 8px 12px;
            font-weight: bold;
            font-size: 12px;
            border-bottom: 1px solid #000;
          }
          
          .cantidad-letras-value {
            padding: 12px;
            min-height: 60px;
            font-size: 14px;
          }
          
          .firma-section {
            display: flex;
            border-bottom: 2px solid #000;
          }
          
          .logo-container {
            width: 200px;
            border-right: 2px solid #000;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #F5F5F5;
          }
          
          .logo-text {
            text-align: center;
          }
          
          .logo-name {
            font-size: 18px;
            font-weight: bold;
            color: #2E5C8A;
          }
          
          .logo-subtitle {
            font-size: 10px;
            color: #666;
          }
          
          .firma-beneficiario {
            flex: 1;
            padding: 15px;
          }
          
          .firma-label {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 50px;
          }
          
          .firma-line {
            border-top: 2px solid #000;
            margin-top: 50px;
          }
          
          .footer-info {
            padding: 10px 12px;
            text-align: center;
            font-size: 10px;
            color: #666;
            background: #F9F9F9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- ENCABEZADO -->
          <div class="header">
            <h1>VALE DE CAJA CHICA</h1>
          </div>
          
          <!-- FECHA -->
          <div class="fecha-section">
            <div class="fecha-label">FECHA:</div>
            <div class="fecha-fields">
              <div class="fecha-field">
                <div class="fecha-field-label">DÍA</div>
                <div class="fecha-field-value">${new Date().getDate().toString().padStart(2, '0')}</div>
              </div>
              <div class="fecha-field">
                <div class="fecha-field-label">MES</div>
                <div class="fecha-field-value">${(new Date().getMonth() + 1).toString().padStart(2, '0')}</div>
              </div>
              <div class="fecha-field">
                <div class="fecha-field-label">AÑO</div>
                <div class="fecha-field-value">${new Date().getFullYear()}</div>
              </div>
            </div>
          </div>
          
          <!-- NÚMERO DE VALE -->
          <div class="numero-section">
            <div class="numero-label">No.</div>
            <div class="numero-value">${numeroVale}</div>
          </div>
          
          <!-- PAGADO A -->
          <div class="numero-section">
            <div class="numero-label">PAGADO A:</div>
            <div class="numero-value">${nombreBeneficiario}</div>
          </div>
          
          <!-- MONTO -->
          <div class="monto-section">
            <span class="monto-symbol">$</span>
            <span class="monto-value">${movement.amount.toFixed(2)}</span>
          </div>
          
          <!-- CONCEPTO -->
          <div class="concepto-section">
            <div class="concepto-label">POR CONCEPTO DE:</div>
            <div class="concepto-value">${movement.reason}</div>
          </div>
          
          <!-- CANTIDAD EN LETRAS -->
          <div class="cantidad-letras-section">
            <div class="cantidad-letras-label">CANTIDAD EN LETRAS:</div>
<div class="cantidad-letras-value">
  ${cantidadEnLetras}
</div>
          </div>
          
          <!-- FIRMA DEL BENEFICIARIO -->
          <div class="firma-section">
            <div class="logo-container">
              <div class="logo-text">
                <div class="logo-name">RIVERA</div>
                <div class="logo-subtitle">Combustibles y Transportes</div>
              </div>
            </div>
            <div class="firma-beneficiario">
              <div class="firma-label">FIRMA DEL BENEFICIARIO:</div>
              <div class="firma-line"></div>
            </div>
          </div>
          
          <!-- FOOTER -->
          <div class="footer-info">
            Generado el ${new Date().toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })} a las ${new Date().toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </body>
      </html>
    `;

    // ✅ ESTABLECER EL CONTENIDO HTML
    console.log('📝 Estableciendo contenido HTML...');
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // ✅ GENERAR PDF
    console.log('🖨️ Generando PDF...');
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      preferCSSPageSize: false
    });

    await browser.close();
    browser = null;
    console.log('✅ PDF generado exitosamente');

    /* ===============================
       SUBIR PDF A CLOUDINARY
    =============================== */
    console.log('📤 Subiendo PDF a Cloudinary...');
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'caja_chica/vales',
          resource_type: 'raw',
          public_id: `vale_${numeroVale}_${Date.now()}`,
          format: 'pdf'
        },
        (error, result) => {
          if (error) {
            console.error('❌ Error en Cloudinary:', error);
            reject(error);
          } else {
            console.log('✅ PDF subido a Cloudinary');
            resolve(result);
          }
        }
      );

      streamifier.createReadStream(pdfBuffer).pipe(stream);
    });

    console.log('🔗 URL del PDF:', uploadResult.secure_url);

    /* ===============================
       GUARDAR EN BASE DE DATOS
    =============================== */
    console.log('💾 Guardando en base de datos...');
    movement.ticket = uploadResult.secure_url; // URL del PDF del vale
    movement.vale = numeroVale; // Número de vale
    await movement.save();

    console.log('✅✅✅ Vale guardado exitosamente en DB');

    /* ===============================
       RESPONDER AL FRONTEND
    =============================== */
    res.json({
      message: 'Vale generado correctamente',
      vale: numeroVale,
      voucher: uploadResult.secure_url
    });

  } catch (error) {
    // Cerrar browser si quedó abierto
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error cerrando browser:', e);
      }
    }

    console.error('💥💥💥 Error generando vale:', error);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Error al generar el vale',
      error: error.message 
    });
  }
};

export default cajaChicaController;