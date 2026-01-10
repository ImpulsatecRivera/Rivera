import CajaChicaConfig from '../Models/CajaChicaConfig.js';
import CajaChica from '../Models/CajaChica.js';
import { config } from '../config.js';

const CajaChicaConfigController = {};

// =====================================================
// 1. OBTENER CONFIGURACIÓN ACTUAL
// =====================================================
// GET /api/caja-chica-config
// Retorna la configuración actual de caja chica
// Si no existe, retorna null
// =====================================================
CajaChicaConfigController.obtenerConfiguracion = async (req, res) => {
    try {
        const configuracion = await CajaChicaConfig.obtenerConfiguracion();
        
        if (!configuracion) {
            return res.json({
                success: true,
                data: null,
                message: 'No hay configuración establecida. Debe crear una primero.'
            });
        }
        
        res.json({
            success: true,
            data: configuracion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener configuración',
            error: error.message
        });
    }
};

// =====================================================
// 2. ACTUALIZAR O CREAR CONFIGURACIÓN (REQUIERE PASSWORD)
// =====================================================
// PUT /api/caja-chica-config
// Body: { 
//   maximoPermitido: 250, 
//   minimoReintegro: 50,
//   password: "contraseña-del-env"
// }
// Actualiza o crea la configuración (solo con password correcta)
// =====================================================
CajaChicaConfigController.actualizarConfiguracion = async (req, res) => {
    try {
        const { maximoPermitido, minimoReintegro, password } = req.body;
        
        // VALIDACIÓN DE PASSWORD
        if (!password) {
            return res.status(401).json({
                success: false,
                message: 'Se requiere contraseña para actualizar la configuración'
            });
        }
        
        if (password !== config.CAJA_CHICA.passwordReintegro) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }
        
        // Validación de maximoPermitido (obligatorio)
        if (maximoPermitido === undefined || maximoPermitido === null) {
            return res.status(400).json({
                success: false,
                message: 'El campo maximoPermitido es obligatorio'
            });
        }
        
        if (maximoPermitido < 0) {
            return res.status(400).json({
                success: false,
                message: 'El máximo permitido debe ser mayor o igual a 0'
            });
        }
        
        // Validación de minimoReintegro
        if (minimoReintegro !== undefined && minimoReintegro < 0) {
            return res.status(400).json({
                success: false,
                message: 'El mínimo de reintegro debe ser mayor o igual a 0'
            });
        }
        
        if (minimoReintegro !== undefined && minimoReintegro > maximoPermitido) {
            return res.status(400).json({
                success: false,
                message: 'El mínimo de reintegro no puede ser mayor al máximo permitido'
            });
        }
        
        // Obtener o crear configuración
        let configuracion = await CajaChicaConfig.obtenerConfiguracion();
        
        if (!configuracion) {
            // Crear nueva configuración
            configuracion = new CajaChicaConfig({
                maximoPermitido: maximoPermitido,
                minimoReintegro: minimoReintegro !== undefined ? minimoReintegro : 0
            });
        } else {
            // Actualizar configuración existente
            configuracion.maximoPermitido = maximoPermitido;
            if (minimoReintegro !== undefined) {
                configuracion.minimoReintegro = minimoReintegro;
            }
            configuracion.ultimaActualizacion = new Date();
        }
        
        await configuracion.save();
        
        res.json({
            success: true,
            message: 'Configuración actualizada exitosamente',
            data: configuracion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar configuración',
            error: error.message
        });
    }
};

// =====================================================
// 3. CALCULAR REINTEGRO NECESARIO
// =====================================================
// GET /api/caja-chica-config/calcular-reintegro
// Retorna cuánto dinero se necesita para llenar la caja
// hasta el máximo permitido
// =====================================================
CajaChicaConfigController.calcularReintegro = async (req, res) => {
    try {
        // Obtener configuración
        const config = await CajaChicaConfig.obtenerConfiguracion();
        
        // Obtener balance actual de caja chica
        const ultimoMovimiento = await CajaChica.findOne()
            .sort({ date: -1, createdAt: -1 })
            .select('currentBalance');
        
        const balanceActual = ultimoMovimiento ? ultimoMovimiento.currentBalance : 0;
        
        // Calcular reintegro usando el método del modelo
        const calculoReintegro = config.calcularReintegro(balanceActual);
        
        res.json({
            success: true,
            data: calculoReintegro
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al calcular reintegro',
            error: error.message
        });
    }
};

// =====================================================
// 4. VERIFICAR SI NECESITA REINTEGRO
// =====================================================
// GET /api/caja-chica-config/verificar-reintegro
// Retorna true/false si el balance actual está por debajo
// del mínimo configurado
// =====================================================
CajaChicaConfigController.verificarReintegro = async (req, res) => {
    try {
        const config = await CajaChicaConfig.obtenerConfiguracion();
        
        const ultimoMovimiento = await CajaChica.findOne()
            .sort({ date: -1, createdAt: -1 })
            .select('currentBalance');
        
        const balanceActual = ultimoMovimiento ? ultimoMovimiento.currentBalance : 0;
        
        const necesitaReintegro = balanceActual < config.minimoReintegro;
        
        res.json({
            success: true,
            data: {
                necesitaReintegro,
                balanceActual,
                minimoReintegro: config.minimoReintegro,
                maximoPermitido: config.maximoPermitido,
                mensaje: necesitaReintegro 
                    ? `El balance actual ($${balanceActual.toFixed(2)}) está por debajo del mínimo ($${config.minimoReintegro.toFixed(2)})`
                    : 'El balance está dentro del rango normal'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al verificar reintegro',
            error: error.message
        });
    }
};

// =====================================================
// 5. REGISTRAR REINTEGRO AUTOMÁTICO (REQUIERE PASSWORD)
// =====================================================
// POST /api/caja-chica-config/registrar-reintegro
// Body: { password: "contraseña-del-env" }
// Calcula automáticamente cuánto se gastó y registra
// un ingreso por ese monto para reponer la caja
// =====================================================
CajaChicaConfigController.registrarReintegro = async (req, res) => {
    try {
        const { password, monto } = req.body;

        // VALIDAR PASSWORD
        if (!password) {
            return res.status(401).json({
                success: false,
                message: 'Se requiere contraseña para registrar reintegro'
            });
        }

        if (password !== config.CAJA_CHICA.passwordReintegro) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }

        // Obtener configuración
        const configuracion = await CajaChicaConfig.obtenerConfiguracion();
        
        if (!configuracion) {
            return res.status(400).json({
                success: false,
                message: 'No hay configuración establecida. Debe configurar el máximo permitido primero.'
            });
        }
        
        // Obtener balance actual
        const ultimoMovimiento = await CajaChica.findOne()
            .sort({ date: -1, createdAt: -1 })
            .select('currentBalance');
        
        const balanceActual = ultimoMovimiento ? ultimoMovimiento.currentBalance : 0;
        
        // Determinar monto a reintegrar
        let montoReintegro;
        if (monto !== undefined && monto !== null) {
            const parsed = Number(monto);
            if (isNaN(parsed) || parsed <= 0) {
                return res.status(400).json({ success: false, message: 'El monto proporcionado debe ser un número mayor a 0' });
            }
            montoReintegro = parsed;
        } else {
            montoReintegro = configuracion.maximoPermitido - balanceActual;
        }
        
        if (montoReintegro <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto calculado para reintegro es menor o igual que 0. Por favor indique un monto a reintegrar.'
            });
        }
        
        // Crear el movimiento de ingreso (reintegro)
        const nuevoMovimiento = new CajaChica({
            date: new Date(),
            employeeId: 'admin',
            amount: montoReintegro,
            reason: `REINTEGRO DE CAJA CHICA - Reposición de gastos ($${montoReintegro.toFixed(2)})`,
            type: 'income',
            previousBalance: balanceActual,
            currentBalance: balanceActual + montoReintegro
        });
        
        await nuevoMovimiento.save();
        
        res.json({
            success: true,
            message: 'Reintegro registrado exitosamente',
            data: {
                balanceAnterior: balanceActual,
                montoReintegro: montoReintegro,
                balanceNuevo: balanceActual + montoReintegro,
                movimiento: nuevoMovimiento
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar reintegro',
            error: error.message
        });
    }
};

export default CajaChicaConfigController;