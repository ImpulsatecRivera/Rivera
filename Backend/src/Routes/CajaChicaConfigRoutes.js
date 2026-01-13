import express from 'express';
import CajaChicaConfigController from '../Controllers/CajaChicaConfigController.js';
import { authMiddleware } from "../Middleware/auth.js";
import { requireAdmin } from "../Middleware/roleMiddleware.js";

const router = express.Router();

// =====================================================
// 1. OBTENER CONFIGURACIÓN ACTUAL
// =====================================================
// GET /api/caja-chica-config
// Retorna: { maximoPermitido, minimoReintegro, etc. }
// Uso: Mostrar la configuración actual en el frontend
router.get('/', authMiddleware, CajaChicaConfigController.obtenerConfiguracion);

// =====================================================
// 2. ACTUALIZAR CONFIGURACIÓN
// =====================================================
// PUT /api/caja-chica-config
// Body: { "maximoPermitido": 250, "minimoReintegro": 50 }
// Uso: Cuando el admin cambia el máximo de caja chica
router.put('/', authMiddleware, requireAdmin, CajaChicaConfigController.actualizarConfiguracion);

// =====================================================
// 3. CALCULAR REINTEGRO NECESARIO
// =====================================================
// GET /api/caja-chica-config/calcular-reintegro
// Retorna: {
//   maximoPermitido: 250,
//   balanceActual: 14.69,
//   reintegroNecesario: 235.31,
//   necesitaReintegro: true,
//   porcentajeDisponible: "5.88"
// }
// Uso: Mostrar cuánto dinero hace falta para llenar la caja
router.get('/calcular-reintegro', authMiddleware, CajaChicaConfigController.calcularReintegro);

// =====================================================
// 4. VERIFICAR SI NECESITA REINTEGRO
// =====================================================
// GET /api/caja-chica-config/verificar-reintegro
// Retorna: { necesitaReintegro: true/false, mensaje, etc. }
// Uso: Mostrar alerta en el dashboard si necesita reintegro
router.get('/verificar-reintegro', authMiddleware, CajaChicaConfigController.verificarReintegro);

// =====================================================
// 5. REGISTRAR REINTEGRO AUTOMÁTICO ⭐ NUEVO
// =====================================================
// POST /api/caja-chica-config/registrar-reintegro
// Calcula automáticamente lo que se gastó y registra el ingreso
// Ejemplo:
//   Balance actual: $14.69
//   Máximo: $250.00
//   Acción: Crea ingreso de $235.31 (lo gastado)
//   Resultado: Balance nuevo = $250.00
// Uso: Botón "Registrar Reintegro" en el frontend
router.post('/registrar-reintegro', authMiddleware, CajaChicaConfigController.registrarReintegro);

export default router;