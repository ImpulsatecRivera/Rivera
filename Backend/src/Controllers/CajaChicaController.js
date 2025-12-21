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
// FUNCIÓN GENERAR VALE - VERSIÓN COMPLETA Y CORREGIDA
// ========================================
cajaChicaController.generarVale = async (req, res) => {
  let browser;

  try {
    const { id } = req.params;
    const { nombreBeneficiario, cantidadLetras } = req.body;

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
    
    // ✅ HTML DEL VALE - COMPLETAMENTE FORMATEADO
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
            font-family: 'Arial', sans-serif;
            padding: 40px;
            background: white;
            color: #000;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            border: 3px solid #000;
            padding: 30px;
            background: white;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: bold;
            letter-spacing: 2px;
          }
          
          .header .numero-vale {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            background: #f0f0f0;
            padding: 8px 15px;
            display: inline-block;
            border: 1px solid #000;
          }
          
          .content {
            padding: 20px 0;
          }
          
          .row {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            padding: 12px;
            border-bottom: 1px solid #ddd;
          }
          
          .row strong {
            font-weight: bold;
            color: #000;
            font-size: 14px;
            width: 40%;
          }
          
          .row span {
            color: #333;
            font-size: 14px;
            width: 60%;
            text-align: right;
          }
          
          .amount-box {
            background: #f5f5f5;
            padding: 25px;
            margin: 30px 0;
            border: 3px double #000;
            text-align: center;
          }
          
          .amount-box .label {
            font-size: 16px;
            margin-bottom: 15px;
            font-weight: bold;
            color: #555;
          }
          
          .amount-box .amount {
            font-size: 40px;
            font-weight: bold;
            color: #000;
            font-family: 'Courier New', monospace;
          }
          
          .concepto-box {
            background: #fff;
            padding: 15px;
            margin: 20px 0;
            border: 2px solid #000;
            min-height: 80px;
          }
          
          .concepto-box .label {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 14px;
          }
          
          .concepto-box .text {
            font-size: 14px;
            line-height: 1.6;
          }
          
          .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 80px;
            padding-top: 40px;
          }
          
          .signature-box {
            text-align: center;
            width: 45%;
          }
          
          .signature-line {
            border-top: 2px solid #000;
            margin-bottom: 10px;
            padding-top: 60px;
          }
          
          .signature-box label {
            font-size: 13px;
            font-weight: bold;
            color: #000;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 11px;
            color: #666;
          }
          
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- ENCABEZADO -->
          <div class="header">
            <h1>VALE DE CAJA CHICA</h1>
            <div class="numero-vale">No. ${numeroVale}</div>
          </div>
          
          <!-- CONTENIDO -->
          <div class="content">
            <!-- Fecha -->
            <div class="row">
              <strong>Fecha:</strong>
              <span>${new Date().toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}</span>
            </div>
            
            <!-- Beneficiario -->
            <div class="row">
              <strong>Beneficiario:</strong>
              <span>${nombreBeneficiario}</span>
            </div>
            
            <!-- Monto -->
            <div class="amount-box">
              <div class="label">MONTO A PAGAR</div>
              <div class="amount">$${movement.amount.toFixed(2)}</div>
            </div>
            
            <!-- Concepto -->
            <div class="concepto-box">
              <div class="label">CONCEPTO:</div>
              <div class="text">${movement.reason}</div>
            </div>
            
            <!-- Cantidad en letras -->
            <div class="row">
              <strong>Cantidad en letras:</strong>
              <span>${cantidadLetras || 'PENDIENTE'}</span>
            </div>
          </div>
          
          <!-- FIRMAS -->
          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line"></div>
              <label>Firma del Beneficiario</label>
            </div>
            
            <div class="signature-box">
              <div class="signature-line"></div>
              <label>Firma Autorizada</label>
            </div>
          </div>
          
          <!-- PIE DE PÁGINA -->
          <div class="footer">
            <p><strong>Rivera Transportes</strong></p>
            <p>Sistema de Caja Chica</p>
            <p>Generado el ${new Date().toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
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