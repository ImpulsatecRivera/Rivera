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

// CONTROLADOR PARA OPERACIONES UNIFICADAS DE CAJA CHICA (INGRESOS Y EGRESOS)
cajaChicaController.cashOperation = async (req, res) => {
    try {
        // Extraer datos de la operación del cuerpo de la petición
        const { operationType, amount, reason, employeeId } = req.body;
        // Obtener información del usuario autenticado (puede no existir)
        const userType = req.user?.userType;
        const user = req.user?.user;

        // VALIDAR CAMPOS REQUERIDOS
        if (!operationType || !amount || !reason) {
            return res.status(400).json({
                message: 'Todos los campos son requeridos: operationType, amount, reason'
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

        // OBTENER EL BALANCE ACTUAL DE CAJA CHICA
        const lastMovement = await CajaChica.findOne()
            .sort({ date: -1, createdAt: -1 })
            .select('currentBalance');

        const previousBalance = lastMovement ? lastMovement.currentBalance : 0;
        let currentBalance;
        let type;
        let message = '';

        // SWITCH PARA MANEJAR DIFERENTES TIPOS DE OPERACIONES
        switch (operationType) {
            case 'ingreso':
                // OPERACIÓN DE INGRESO: sumar al balance
                currentBalance = previousBalance + amount;
                type = 'income';
                message = 'Ingreso registrado exitosamente';
                break;

            case 'egreso':
                // VERIFICAR SI HAY FONDOS SUFICIENTES PARA EL EGRESO
                if (previousBalance < amount) {
                    return res.status(400).json({
                        message: `Fondos insuficientes. Balance actual: ${previousBalance}, Cantidad solicitada: ${amount}`
                    });
                }

                // OPERACIÓN DE EGRESO: restar del balance
                currentBalance = previousBalance - amount;
                type = 'expense';
                message = 'Egreso registrado exitosamente';
                break;

            default:
                // TIPO DE OPERACIÓN NO VÁLIDO
                return res.status(400).json({
                    message: 'Tipo de operación no válido. Use: ingreso, egreso'
                });
        }

        // Manejar subida de voucher (si se envía archivo)
        let voucherUrl = undefined;
        if (req.file) {
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
        }

        // CREAR NUEVO MOVIMIENTO DE CAJA CHICA
        const newMovement = new CajaChica({
            date: new Date(),           // Siempre usar la fecha del sistema
            // Determinar employeeId según el tipo de usuario
            employeeId: userType === 'admin' ? 'admin' : (employeeId || user),
            amount,
            reason,
            type,                       // 'income' o 'expense'
            previousBalance,            // Balance antes de la operación
            currentBalance,             // Balance después de la operación
            voucher: voucherUrl
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
            message,
            movement: newMovement
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default cajaChicaController;