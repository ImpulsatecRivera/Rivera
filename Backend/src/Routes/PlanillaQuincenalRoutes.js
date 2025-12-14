/**
 * Rutas para el controlador de Planillas Quincenales
 * 
 * Endpoints disponibles:
 * - POST   /                          Crear nueva planilla quincenal
 * - GET    /                          Obtener todas las planillas (con filtros)
 * - GET    /:id                       Obtener planilla por ID
 * - GET    /empleado/:empleadoId      Obtener planillas de un empleado específico
 * - PUT    /:id/empleado/:empleadoId  Actualizar datos de empleado en planilla
 * - POST   /:id/empleado              Agregar empleado a planilla existente
 * - DELETE /:id/empleado/:empleadoId  Eliminar empleado de planilla
 * - PATCH  /:id/estado                Cambiar estado de planilla
 * - DELETE /:id                       Eliminar planilla completa
 */

import express from 'express';
import PlanillaQuincenalController from '../Controllers/PlanillaQuincenalController.js';

const router = express.Router();

/**
 * POST /api/planillas/quincenal
 * Crear nueva planilla quincenal
 * 
 * Body:
 * {
 *   "año": 2025,
 *   "mes": 12,
 *   "quincena": 1,
 *   "empleados": [
 *     {
 *       "empleadoId": "674abc123...",
 *       "tipoEmpleado": "Empleado",
 *       "viaticos": 65.80,
 *       "trabajoSabadoDomingo": 0,
 *       "otrosDescuentos": {
 *         "anticipos": 50,
 *         "prestamos": 0,
 *         "camisas": 0,
 *         "otros": 0
 *       }
 *     }
 *   ]
 * }
 */
router.post('/', PlanillaQuincenalController.crear);

/**
 * GET /api/planillas/quincenal
 * Obtener todas las planillas quincenales con filtros opcionales
 * 
 * Query params:
 * - año: number (ej: 2025)
 * - mes: number (1-12)
 * - quincena: number (1 o 2)
 * - estado: string (borrador, pendiente, pagada, cerrada)
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * 
 * Ejemplo:
 * GET /api/planillas/quincenal?año=2025&mes=12&quincena=1&estado=borrador
 */
router.get('/', PlanillaQuincenalController.obtenerTodas);

/**
 * GET /api/planillas/quincenal/:id
 * Obtener una planilla específica por ID
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Ejemplo:
 * GET /api/planillas/quincenal/674abc123def456
 */
router.get('/:id', PlanillaQuincenalController.obtenerPorId);

/**
 * GET /api/planillas/quincenal/empleado/:empleadoId
 * Obtener todas las planillas de un empleado específico
 * 
 * Params:
 * - empleadoId: ObjectId del empleado
 * 
 * Query params opcionales:
 * - año: number
 * - mes: number
 * 
 * Ejemplo:
 * GET /api/planillas/quincenal/empleado/674abc123?año=2025&mes=12
 */
router.get('/empleado/:empleadoId', PlanillaQuincenalController.obtenerPorEmpleado);

/**
 * PUT /api/planillas/quincenal/:id/empleado/:empleadoId
 * Actualizar datos de un empleado en la planilla
 * 
 * ⚠️ Solo se puede editar si la planilla está en estado: borrador o pendiente
 * ❌ NO se puede editar si está: pagada o cerrada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * - empleadoId: ObjectId del empleado
 * +
 * 
 * Body:
 * {
 *   "viaticos": 75.00,
 *   "trabajoSabadoDomingo": 0,
 *   "otrosDescuentos": {
 *     "anticipos": 60,
 *     "prestamos": 25,
 *     "camisas": 0,
 *     "otros": 0
 *   }
 * }
 * 
 * Nota: El salario quincenal, ISSS, AFP y Renta se recalculan automáticamente
 */
router.put('/:id/empleado/:empleadoId', PlanillaQuincenalController.actualizarEmpleado);

/**
 * POST /api/planillas/quincenal/:id/empleado
 * Agregar un nuevo empleado a la planilla
 * 
 * ⚠️ Solo se puede agregar si la planilla está en estado: borrador o pendiente
 * ❌ NO se puede agregar si está: pagada o cerrada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Body:
 * {
 *   "empleadoId": "674def456...",
 *   "tipoEmpleado": "Motorista",
 *   "viaticos": 150.00,
 *   "trabajoSabadoDomingo": 0,
 *   "otrosDescuentos": {
 *     "anticipos": 100,
 *     "prestamos": 0,
 *     "camisas": 0,
 *     "otros": 0
 *   }
 * }
 */
router.post('/:id/empleado', PlanillaQuincenalController.agregarEmpleado);

/**
 * DELETE /api/planillas/quincenal/:id/empleado/:empleadoId
 * Eliminar un empleado de la planilla
 * 
 * ⚠️ Solo se puede eliminar si la planilla está en estado: borrador o pendiente
 * ❌ NO se puede eliminar si está: pagada o cerrada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * - empleadoId: ObjectId del empleado
 * 
 * Ejemplo:
 * DELETE /api/planillas/quincenal/674abc123/empleado/674def456
 */
router.delete('/:id/empleado/:empleadoId', PlanillaQuincenalController.eliminarEmpleado);

/**
 * PATCH /api/planillas/quincenal/:id/estado
 * Cambiar el estado de la planilla
 * 
 * Transiciones válidas:
 * - borrador    → pendiente, cerrada
 * - pendiente   → borrador, pagada, cerrada
 * - aprobada   → pagada , cerrada (NO puede regresar a pendiente o borrador)
 * - pagada      → cerrada (NO puede regresar a pendiente o borrador)
 * - cerrada     → NO puede cambiar (estado final)
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Body para cambiar a pendiente/borrador/:
 * {
 *   "estado": "pendiente"
 * }
 * Body para cambiar a aprobada (fechaAprobacion opcional — si no se envía se asigna la fecha del servidor). No se permiten fechas futuras:
 * {
 *   "estado": "aprobada",
 *   "fechaAprobacion": "2025-12-10T14:00:00"
 * }
 * 
 * Body para cambiar a pagada (REQUIERE fechaPago, en zona 'America/El_Salvador'):
 * {
 *   "estado": "pagada",
 *   "fechaPago": "2025-12-15T10:30:00"
 * }
 * 
 * Body para cambiar a cerrada (REQUIERE fechaCierre — tomada desde el frontend; no se aceptan fechas futuras):
 * {
 *   "estado": "cerrada",
 *   "fechaCierre": "2025-12-15T10:30:00"
 * }
 * 
 * Nota: Las fechas se validan en la zona de El Salvador (America/El_Salvador). NO SE ACEPTAN FECHAS FUTURAS.
 */
router.patch('/:id/estado', PlanillaQuincenalController.cambiarEstado);

/**
 * DELETE /api/planillas/quincenal/:id
 * Eliminar una planilla completa
 * 
 * ⚠️ Solo se puede eliminar si está en estado: borrador
 * ❌ NO se puede eliminar si está: pendiente, pagada o cerrada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Ejemplo:
 * DELETE /api/planillas/quincenal/674abc123
 */
router.delete('/:id', PlanillaQuincenalController.eliminar);

export default router;