import express from 'express';
import PlanillaSemanalController from '../Controllers/PlanillaSemanalController.js';

const router = express.Router();

// ============================================
// RUTAS DE PLANILLA SEMANAL
// ============================================

// Crear nueva planilla
router.post('/', PlanillaSemanalController.crearPlanilla);

// Obtener todas las planillas (con filtros)
router.get('/', PlanillaSemanalController.obtenerPlanillas);

// Obtener planilla por ID
router.get('/:id', PlanillaSemanalController.obtenerPlanillaPorId);

// Cambiar estado de planilla
router.put('/:id/estado', PlanillaSemanalController.cambiarEstado);

// Agregar empleado a planilla
router.post('/:planillaId/empleado', PlanillaSemanalController.agregarEmpleado);

// Eliminar empleado de planilla
router.delete('/:planillaId/empleado/:empleadoIndex', PlanillaSemanalController.eliminarEmpleado);

// Registrar día de trabajo
router.put('/:planillaId/empleado/:empleadoIndex/dia', PlanillaSemanalController.registrarDia);

// Actualizar anticipos/descuentos
router.put('/:planillaId/empleado/:empleadoIndex/anticipos-descuentos', PlanillaSemanalController.actualizarAnticiposDescuentos);

export default router;