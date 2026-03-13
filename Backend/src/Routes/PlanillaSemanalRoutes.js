/**
 * Rutas para el controlador de Planillas Semanales
 * 
 * Endpoints disponibles:
 * - POST   /                                      Crear nueva planilla semanal
 * - GET    /                                      Obtener todas las planillas (con filtros)
 * - GET    /:id                                   Obtener planilla por ID
 * - GET    /empleado/:empleadoId                  Obtener planillas de un empleado específico
 * - PATCH  /:id/estado                            Cambiar estado de planilla
 * - POST   /:id/empleado                          Agregar empleado a planilla existente
 * - PUT    /:id/empleado/:empleadoId              Actualizar datos completos de empleado
 * - PATCH  /:id/empleado/:empleadoId/dia/:dia     Actualizar viáticos de un día específico
 * - PATCH  /:id/empleado/:empleadoId/montos       Actualizar anticipos del empleado
 * - POST   /:id/empleado/:empleadoId/dia/:dia/falta    Marcar falta injustificada
 * - DELETE /:id/empleado/:empleadoId/dia/:dia/falta    Desmarcar falta injustificada
 * - DELETE /:id/empleado/:empleadoId              Eliminar empleado de planilla
 * - DELETE /:id                                   Eliminar planilla completa
 */

import express from 'express';
import PlanillaSemanalController from '../Controllers/PlanillaSemanalController.js';
import { validateAuthToken } from '../Middlewares/validateAuthToken.js';
const router = express.Router();

/**
 * POST /api/planillas/semanal
 * Crear nueva planilla semanal
 * 
 * Body:
 * {
 *   "fechaInicio": "2025-11-17",  // Debe ser LUNES
 *   "fechaFin": "2025-11-22",     // Debe ser SÁBADO
 *   "diasHabiles": 26,            // Días hábiles del mes (entre 20 y 31)
 *   "empleados": []               // Se pueden agregar después
 * }
 * 
 * Nota: La planilla se crea vacía y los empleados se agregan después con POST /:id/empleado
 */
router.post('/',validateAuthToken(["admin"]), PlanillaSemanalController.crear);

/**
 * GET /api/planillas/semanal
 * Obtener todas las planillas semanales con filtros opcionales
 * 
 * Query params:
 * - estado: string (pendiente, aprobada, pagada)
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * 
 * Ejemplo:
 * GET /api/planillas/semanal?estado=pendiente&page=1&limit=10
 */
router.get('/',validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]), PlanillaSemanalController.obtenerTodas);

/**
 * GET /api/planillas/semanal/:id
 * Obtener una planilla específica por ID
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Ejemplo:
 * GET /api/planillas/semanal/674abc123def456
 */
router.get('/:id',validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]), PlanillaSemanalController.obtenerPorId);

/**
 * PATCH /api/planillas/semanal/:id/estado
 * Cambiar el estado de la planilla
 * 
 * Transiciones válidas:
 * - pendiente   → aprobada, pagada
 * - aprobada    → pagada (NO puede regresar a pendiente)
 * - pagada      → NO puede cambiar (estado final)
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Body para cambiar el estado:
 * {
 *   "estado": "pendiente"
 * }
 * 
 * Body para cambiar a aprobada (fechaAprobacion opcional — si no se envía se asigna la fecha del servidor):
 * {
 *   "estado": "aprobada",
 *   "fechaAprobacion": "2025-12-10T14:00:00"
 * }
 * 
 * Body para cambiar a pagada (REQUIERE fechaPago):
 * {
 *   "estado": "pagada",
 *   "fechaPago": "2025-12-15T10:30:00"
 * }
 * 
 * Body alternativo para marcar como pagada (sin cambiar estado):
 * {
 *   "pagada": true,
 *   "fechaPago": "2025-12-15T10:30:00"
 * }
 * 
 * Nota: NO SE ACEPTAN FECHAS FUTURAS.
 */
router.patch('/:id/estado',validateAuthToken(["admin"]), PlanillaSemanalController.cambiarEstado);

/**
 * POST /api/planillas/semanal/:id/empleado
 * Agregar un nuevo empleado a la planilla
 * 
 * ⚠️ Solo se puede agregar si la planilla no está pagada
 * ❌ NO se puede agregar si está: pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Body:
 * {
 *   "empleadoId": "674def456..."
 * }
 * 
 * Nota: 
 * - El sistema detecta automáticamente si es Empleado o Motorista
 * - Se guarda el planillaTipo del empleado para calcular anticipos correctamente
 * - Si planillaTipo="Semanal": calcula base diaria = salarioMensual / diasHabiles
 * - Si planillaTipo="Quincenal": base = 0 (pero puede tener viáticos)
 * - Se crean automáticamente 6 días (lunes a sábado) con la base calculada
 * - Campo anticipos se inicializa en 0
 */
router.post('/:id/empleado',validateAuthToken(["admin"]), PlanillaSemanalController.agregarEmpleado);

/**
 * PUT /api/planillas/semanal/:id/empleado/:empleadoId
 * Actualizar datos de un empleado en la planilla
 * 
 * ⚠️ Solo se puede editar si la planilla no está pagada
 * ❌ NO se puede editar si está: pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * - empleadoId: ObjectId del empleado
 * 
 * Body:
 * {
 *   "dias": [
 *     {
 *       "dia": "lunes",
 *       "fecha": "2025-11-17T00:00:00.000Z",
 *       "base": 7.69,
 *       "viaticos": 10.00,
 *       "faltaInjustificada": false
 *     },
 *     {
 *       "dia": "martes",
 *       "fecha": "2025-11-18T00:00:00.000Z",
 *       "base": 7.69,
 *       "viaticos": 15.00,
 *       "faltaInjustificada": false
 *     }
 *     // ... resto de días
 *   ],
 *   "anticipos": 60.00,
 *   "descuentos": 0
 * }
 * 
 * Nota: 
 * - El campo "base" se calcula automáticamente si planillaTipo="Semanal"
 * - Para empleados con planillaTipo="Quincenal", base siempre es 0
 * - Los totales se recalculan automáticamente
 */
router.put('/:id/empleado/:empleadoId',validateAuthToken(["admin"]), PlanillaSemanalController.actualizarEmpleado);

/**
 * PATCH /api/planillas/semanal/:id/empleado/:empleadoId/dia/:dia
 * Actualizar un día específico (principalmente para agregar viáticos)
 * 
 * ⚠️ Solo se puede editar si la planilla no está pagada
 * ❌ NO se puede editar si está: pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * - empleadoId: ObjectId del empleado
 * - dia: Día de la semana (lunes, martes, miercoles, jueves, viernes, sabado)
 * 
 * Body:
 * {
 *   "viaticos": 15.00
 * }
 * 
 * Nota: 
 * - El campo "base" NO se edita aquí, se calculó al agregar el empleado
 * - Solo se actualiza el campo "viaticos"
 * - Los totales se recalculan automáticamente
 * 
 * Ejemplo:
 * PATCH /api/planillas/semanal/674abc123/empleado/674def456/dia/lunes
 * {
 *   "viaticos": 20.00
 * }
 */
router.patch('/:id/empleado/:empleadoId/dia/:dia',validateAuthToken(["admin"]), PlanillaSemanalController.actualizarDia);

/**
 * PATCH /api/planillas/semanal/:id/empleado/:empleadoId/montos
 * Actualizar anticipos de un empleado
 * 
 * ⚠️ Solo se puede editar si la planilla no está pagada
 * ❌ NO se puede editar si está: pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * - empleadoId: ObjectId del empleado
 * 
 * Body:
 * {
 *   "anticipos": 75.00
 * }
 * 
 * Nota: 
 * - El sistema decide automáticamente si suma o resta los anticipos según planillaTipo:
 *   · planillaTipo="Semanal": anticipos se RESTAN (ya recibieron dinero de esta semana)
 *   · planillaTipo="Quincenal/Mensual": anticipos se SUMAN (es un pago extra)
 * - Los totales se recalculan automáticamente
 * - Los valores no pueden ser negativos
 * 
 * Ejemplo:
 * PATCH /api/planillas/semanal/674abc123/empleado/674def456/montos
 * {
 *   "anticipos": 100.00
 * }
 */
router.patch('/:id/empleado/:empleadoId/montos',validateAuthToken(["admin"]), PlanillaSemanalController.actualizarMontos);

/**
 * DELETE /api/planillas/semanal/:id/empleado/:empleadoId
 * Eliminar un empleado de la planilla
 * 
 * ⚠️ Solo se puede eliminar si la planilla no está pagada
 * ❌ NO se puede eliminar si está: pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * - empleadoId: ObjectId del empleado
 * 
 * Ejemplo:
 * DELETE /api/planillas/semanal/674abc123/empleado/674def456
 */
router.delete('/:id/empleado/:empleadoId',validateAuthToken(["admin"]), PlanillaSemanalController.eliminarEmpleado);

/**
 * DELETE /api/planillas/semanal/:id
 * Eliminar una planilla completa
 * 
 * ⚠️ Solo se puede eliminar si está en estado: pendiente
 * ❌ NO se puede eliminar si está: aprobada o pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Ejemplo:
 * DELETE /api/planillas/semanal/674abc123
 */
router.delete('/:id',validateAuthToken(["admin"]), PlanillaSemanalController.eliminar);

/**
 * GET /api/planillas/semanal/empleado/:empleadoId
 * Obtener todas las planillas de un empleado específico
 * 
 * Params:
 * - empleadoId: ObjectId del empleado
 * 
 * Ejemplo:
 * GET /api/planillas/semanal/empleado/674abc123
 * 
 * Retorna todas las planillas donde aparece el empleado con sus datos específicos
 */
router.get('/empleado/:empleadoId',validateAuthToken(["admin"]), PlanillaSemanalController.obtenerPorEmpleado);

/**
 * POST /api/planillas/semanal/:id/empleado/:empleadoId/dia/:dia/falta
 * Marcar falta injustificada en un día específico
 * 
 * ⚠️ Solo se puede marcar si la planilla no está pagada
 * ❌ NO se puede marcar si está: pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * - empleadoId: ObjectId del empleado
 * - dia: Nombre del día (lunes, martes, miercoles, jueves, viernes, sabado)
 * 
 * Body:
 * {
 *   "descuentoFalta": 50.00   // Monto a descontar por la falta
 * }
 * 
 * Funcionalidad:
 * - Marca faltaInjustificada = true en el día especificado
 * - Asigna/actualiza el monto en el campo "descuentoFalta" del día
 * - Si ya existía un descuento, lo reemplaza con el nuevo valor
 * - Recalcula automáticamente totalDescuentos (anticipos + suma de todos los descuentoFalta)
 * - Recalcula totalAPagar del empleado
 * - Recalcula totales generales de la planilla
 * 
 * Ejemplo:
 * POST /api/planillas/semanal/674abc123/empleado/674def456/dia/lunes/falta
 * {
 *   "descuentoFalta": 25.50
 * }
 */
router.post('/:id/empleado/:empleadoId/dia/:dia/falta',validateAuthToken(["admin"]), PlanillaSemanalController.marcarFaltaInjustificada);

/**
 * DELETE /api/planillas/semanal/:id/empleado/:empleadoId/dia/:dia/falta
 * Desmarcar falta injustificada en un día específico
 * 
 * ⚠️ Solo se puede desmarcar si la planilla no está pagada
 * ❌ NO se puede desmarcar si está: pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * - empleadoId: ObjectId del empleado
 * - dia: Nombre del día (lunes, martes, miercoles, jueves, viernes, sabado)
 * 
 * Funcionalidad:
 * - Marca faltaInjustificada = false en el día especificado
 * - Limpia el campo "descuentoFalta" del día (lo pone en 0)
 * - Recalcula automáticamente totalDescuentos
 * - Recalcula totalAPagar del empleado
 * - Recalcula totales generales de la planilla
 * 
 * Ejemplo:
 * DELETE /api/planillas/semanal/674abc123/empleado/674def456/dia/lunes/falta
 */
router.delete('/:id/empleado/:empleadoId/dia/:dia/falta',validateAuthToken(["admin"]), PlanillaSemanalController.desmarcarFaltaInjustificada);

/**
 * GET /api/planillas/semanal/ultima
 * Obtener la última planilla semanal creada
 * 
 * Retorna: La planilla semanal más reciente con todos sus empleados
 */
router.get('/ultima', validateAuthToken(["admin"]), PlanillaSemanalController.obtenerUltima);

/**
 * POST /api/planillas/semanal/:id/copiar-datos-anteriores
 * Copiar empleados y estructura de la planilla anterior
 * 
 * Parámetros:
 * - id: ObjectId de la planilla nueva donde copiar los datos
 * 
 * Funcionalidad:
 * - Busca la última planilla anterior a la actual
 * - Copia los empleados manteniendo su salario y estructura
 * - Reinicia anticipos y valores de viaticos
 * - Genera nuevos días para la nueva semana
 */
router.post('/:id/copiar-datos-anteriores', validateAuthToken(["admin"]), PlanillaSemanalController.copiarDatosAnteriores);

export default router;