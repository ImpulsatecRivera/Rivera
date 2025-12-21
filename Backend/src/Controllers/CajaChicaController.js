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

    // VOUCHER ES OBLIGATORIO PARA EGRESOS


    // Determinar el empleado
    // Si no hay req.user, asumimos que es admin (sistema sin JWT)
    let finalEmployeeId = 'admin';

    if (req.user) {
      // Si HAY autenticación JWT
      const userType = req.user.userType;

      if (userType === 'admin') {
        // Admin puede especificar employeeId o usar 'admin'
        finalEmployeeId = employeeId || 'admin';
      } else {
        // Usuarios no-admin DEBEN proporcionar su employeeId
        if (!employeeId) {
          return res.status(400).json({
            message: "Se requiere employeeId para usuarios no admin"
          });
        }
        finalEmployeeId = employeeId;
      }
    } else {
      // Si NO hay autenticación JWT (sistema con password .env)
      // Usar employeeId si se proporciona, sino 'admin'
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

    // Subir voucher (OBLIGATORIO)
    // Subir voucher (OPCIONAL)
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

// Agregar al final de cajaChicaController


cajaChicaController.generarVale = async (req, res) => {
  let browser;

  try {
    const { id } = req.params;
    const { nombreBeneficiario, cantidadLetras } = req.body;

    if (!id || !nombreBeneficiario || !cantidadLetras) {
      return res.status(400).json({
        message: "Datos incompletos"
      });
    }

    const movement = await CajaChica.findById(id);
    if (!movement) {
      return res.status(404).json({ message: "Movimiento no encontrado" });
    }

    /* ===============================
       GENERAR NÚMERO DE VALE
    =============================== */
    const year = new Date().getFullYear();

    const ultimoVale = await CajaChica.findOne({
      vale: { $regex: `^CC-${year}-` }
    }).sort({ vale: -1 });

    let correlativo = 1;
    if (ultimoVale?.vale) {
      correlativo = parseInt(ultimoVale.vale.split('-')[2]) + 1;
    }

    const numeroVale = `CC-${year}-${correlativo.toString().padStart(3, '0')}`;

    /* ===============================
       GENERAR PDF
    =============================== */
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(/* TU HTML COMPLETO */ { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true
    });

    await browser.close();

    /* ===============================
       SUBIR PDF A CLOUDINARY
    =============================== */
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'caja_chica/vales',
          resource_type: 'raw',
          public_id: `vale_${numeroVale}`,
          format: 'pdf'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(pdfBuffer).pipe(stream);
    });

    /* ===============================
       GUARDAR EN DB
    =============================== */
  movement.voucher = movement.voucher; // comprobante original
movement.ticket = uploadResult.secure_url; // PDF del vale
movement.vale = numeroVale;
                // 🔢 Número de vale
    await movement.save();

    /* ===============================
       RESPONDER PDF
    =============================== */
  res.json({
  message: 'Vale generado correctamente',
  vale: numeroVale,
  voucher: uploadResult.secure_url
});


  } catch (error) {
    if (browser) await browser.close();
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export default cajaChicaController;