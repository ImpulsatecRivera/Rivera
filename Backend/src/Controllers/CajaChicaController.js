// Importación del modelo de caja chica
import CajaChica from '../Models/CajaChica.js';
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import fs from 'fs/promises';

const cajaChicaController = {};

// Configurar Cloudinary (igual que en CamionesController)
cloudinary.config({
    cloud_name: config.cloudinary.cloudinary_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret,
});

// CONTROLADOR PARA OBTENER TODOS LOS MOVIMIENTOS DE CAJA CHICA
cajaChicaController.getAllMovements = async (req, res) => {
    try {
        // Buscar todos los movimientos ordenados por fecha descendente (más recientes primero)
        const movements = await CajaChica.find().sort({ date: -1 });

        // HACER POPULATE MANUAL SOLO PARA OBJECTIDS VÁLIDOS
        // Se usa Promise.all para procesar todos los movimientos en paralelo
        const populatedMovements = await Promise.all(
            movements.map(async (movement) => {
                // Verificar si el employeeId no es 'admin' y existe
                if (movement.employeeId !== 'admin' && movement.employeeId) {
                    try {
                        // VALIDAR QUE SEA UN OBJECTID VÁLIDO ANTES DE HACER POPULATE
                        // Regex para verificar formato de ObjectId de MongoDB (24 caracteres hexadecimales)
                        if (movement.employeeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
                            // Hacer populate solo de los campos necesarios
                            await movement.populate('employeeId', 'name email');
                        }
                    } catch (error) {
                        // Log del error sin interrumpir el proceso
                        console.log('Error en populate:', error);
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

// CONTROLADOR PARA OBTENER EL BALANCE ACTUAL DE CAJA CHICA
cajaChicaController.getCurrentBalance = async (req, res) => {
    try {
        // BUSCAR EL ÚLTIMO MOVIMIENTO PARA OBTENER EL BALANCE ACTUAL
        // Se ordena por fecha y fecha de creación para obtener el más reciente
        const lastMovement = await CajaChica.findOne()
            .sort({ date: -1, createdAt: -1 })
            .select('currentBalance');        // Solo seleccionar el campo necesario

        // Si no hay movimientos, el balance es 0
        const currentBalance = lastMovement ? lastMovement.currentBalance : 0;

        res.json({ currentBalance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =====================================================
// NUEVO: CONTROLADOR PARA INGRESOS (CON PASSWORD)
// =====================================================
cajaChicaController.registrarIngreso = async (req, res) => {
    try {
        // Extraer datos de la operación del cuerpo de la petición
        const { amount, reason, password } = req.body;

        // VALIDAR PASSWORD
        if (!password) {
            return res.status(401).json({
                message: 'Se requiere contraseña para registrar ingresos'
            });
        }

        if (password !== config.CAJA_CHICA.passwordReintegro) {
            return res.status(401).json({
                message: 'Contraseña incorrecta'
            });
        }

        // VALIDAR CAMPOS REQUERIDOS
        if (!amount || !reason) {
            return res.status(400).json({
                message: 'Todos los campos son requeridos: amount, reason, password'
            });
        }

        // VALIDAR QUE LA CANTIDAD SEA POSITIVA
        if (amount <= 0) {
            return res.status(400).json({
                message: 'La cantidad debe ser mayor a 0'
            });
        }

        // OBTENER EL BALANCE ACTUAL DE CAJA CHICA
        const lastMovement = await CajaChica.findOne()
            .sort({ date: -1, createdAt: -1 })
            .select('currentBalance');

        const previousBalance = lastMovement ? lastMovement.currentBalance : 0;
        
        // CALCULAR BALANCE DESPUÉS DEL INGRESO
        const currentBalance = previousBalance + amount;

        // VALIDAR QUE NO SOBREPASE EL MÁXIMO PERMITIDO
        // Importar el modelo de configuración
        const CajaChicaConfig = (await import('../Models/CajaChicaConfig.js')).default;
        const configuracion = await CajaChicaConfig.obtenerConfiguracion();
        
        if (configuracion && configuracion.maximoPermitido) {
            if (currentBalance > configuracion.maximoPermitido) {
                return res.status(400).json({
                    message: `El ingreso excede el máximo permitido. Balance actual: $${previousBalance.toFixed(2)}, Ingreso solicitado: $${amount.toFixed(2)}, Balance resultante: $${currentBalance.toFixed(2)}, Máximo permitido: $${configuracion.maximoPermitido.toFixed(2)}`,
                    data: {
                        balanceActual: previousBalance,
                        montoIngreso: amount,
                        balanceResultante: currentBalance,
                        maximoPermitido: configuracion.maximoPermitido,
                        excedente: currentBalance - configuracion.maximoPermitido
                    }
                });
            }
        }

        // Manejar subida de voucher (si se envía archivo)
        let voucherUrl = undefined;
        if (req.file) {
            try {
                const uploadOptions = {
                    folder: "vouchers",
                    resource_type: "auto"
                };
                const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
                voucherUrl = result.secure_url;
            } catch (uploadError) {
                return res.status(400).json({
                    message: "Error al subir el voucher",
                    error: uploadError.message
                });
            }
        }

        // CREAR NUEVO MOVIMIENTO DE CAJA CHICA
        const newMovement = new CajaChica({
            date: new Date(),
            employeeId: 'admin',  // Los ingresos siempre son del admin
            amount,
            reason,
            type: 'income',
            previousBalance,
            currentBalance,
            voucher: voucherUrl
        });

        // Guardar el movimiento en la base de datos
        await newMovement.save();

        res.json({
            message: 'Ingreso registrado exitosamente',
            movement: newMovement
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =====================================================
// ACTUALIZADO: CONTROLADOR SOLO PARA EGRESOS (SIN PASSWORD)
// =====================================================
cajaChicaController.cashOperation = async (req, res) => {
    try {
        // Extraer datos de la operación del cuerpo de la petición
        const { amount, reason, employeeId } = req.body;
        // Obtener información del usuario autenticado (puede no existir)
        const userType = req.user?.userType;
        const user = req.user?.user;

        // VALIDAR CAMPOS REQUERIDOS
        if (!amount || !reason) {
            return res.status(400).json({
                message: 'Todos los campos son requeridos: amount, reason'
            });
        }

        // VALIDAR QUE USUARIOS NO ADMIN PROPORCIONEN EMPLOYEEID
        if (userType !== 'admin' && !employeeId) {
            return res.status(400).json({
                message: 'Se requiere employeeId para usuarios no admin'
            });
        }

        // VALIDAR QUE LA CANTIDAD SEA POSITIVA
        if (amount <= 0) {
            return res.status(400).json({
                message: 'La cantidad debe ser mayor a 0'
            });
        }

        // VALIDAR QUE SE HAYA SUBIDO EL VOUCHER (OBLIGATORIO PARA EGRESOS)
        if (!req.file) {
            return res.status(400).json({
                message: 'El voucher es obligatorio para registrar egresos'
            });
        }

        // OBTENER EL BALANCE ACTUAL DE CAJA CHICA
        const lastMovement = await CajaChica.findOne()
            .sort({ date: -1, createdAt: -1 })
            .select('currentBalance');

        const previousBalance = lastMovement ? lastMovement.currentBalance : 0;

        // VERIFICAR SI HAY FONDOS SUFICIENTES PARA EL EGRESO
        if (previousBalance < amount) {
            return res.status(400).json({
                message: `Fondos insuficientes. Balance actual: ${previousBalance}, Cantidad solicitada: ${amount}`
            });
        }

        // OPERACIÓN DE EGRESO: restar del balance
        const currentBalance = previousBalance - amount;

        // Subir voucher (SIEMPRE presente porque es obligatorio)
        let voucherUrl;
        try {
            // resource_type: 'auto' permite imágenes y PDFs (Cloudinary detecta tipo)
            const uploadOptions = {
                folder: "vouchers",
                resource_type: "auto"
            };
            const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
            voucherUrl = result.secure_url;
        } catch (uploadError) {
            return res.status(400).json({
                message: "Error al subir el voucher",
                error: uploadError.message
            });
        }

        // CREAR NUEVO MOVIMIENTO DE CAJA CHICA
        const newMovement = new CajaChica({
            date: new Date(),
            // Determinar employeeId según el tipo de usuario
            employeeId: userType === 'admin' ? 'admin' : (employeeId || user),
            amount,
            reason,
            type: 'expense',  // Siempre es egreso
            previousBalance,
            currentBalance,
            voucher: voucherUrl  // Siempre presente en egresos
        });

        // Guardar el movimiento en la base de datos
        await newMovement.save();

        // POBLAR EL EMPLEADO SOLO SI NO ES ADMIN
        if (userType !== 'admin' && newMovement.employeeId && newMovement.employeeId !== 'admin') {
            try {
                // Solo intentar populate si parece un ObjectId (24 hex chars)
                if (newMovement.employeeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
                    await newMovement.populate('employeeId', 'name email');
                }
            } catch (err) {
                console.log('populate error:', err);
            }
        }

        res.json({
            message: 'Egreso registrado exitosamente',
            movement: newMovement
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default cajaChicaController;