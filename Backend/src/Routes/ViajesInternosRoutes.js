import { Router } from "express";
import ViajesController from "../Controllers/ViajesControllerPRocesosInterno.js";

const router = Router();

// ============================================
// RUTAS GET - Obtener viajes
// ============================================

// GET ALL: Obtener todos los viajes con filtros y paginación
// Query params: ?fechaInicio=2025-01-01&fechaFin=2025-01-31&clienteId=xxx&estado=COMPLETADO&pagado=true&limite=50&pagina=1
router.get("/", ViajesController.getViajes);

// GET: Obtener viajes pendientes de pago
router.get("/pendientes-pago", ViajesController.getPendientesPago);

// GET: Obtener reporte de periodo
// Query params: ?fechaInicio=2025-01-01&fechaFin=2025-01-31
router.get("/reporte-periodo", ViajesController.getReportePeriodo);

// GET: Obtener viajes por fecha
// Query params: ?fechaInicio=2025-01-01&fechaFin=2025-01-31
router.get("/por-fecha", ViajesController.getViajesPorFecha);

// GET: Obtener viajes por cliente
// Params: clienteId
// Query params: ?fechaInicio=2025-01-01&fechaFin=2025-01-31
router.get("/cliente/:clienteId", ViajesController.getViajesPorCliente);

// GET ONE: Obtener un viaje específico por ID
router.get("/:id", ViajesController.getViajeById);

// ============================================
// RUTAS POST - Crear viajes
// ============================================

// POST: Crear nuevo viaje
router.post("/", ViajesController.createViaje);

// ============================================
// RUTAS PUT - Actualizar viajes
// ============================================

// PUT: Actualizar viaje
router.put("/:id", ViajesController.updateViaje);

// PUT: Marcar viaje como pagado
router.put("/:id/marcar-pagado", ViajesController.marcarComoPagado);

// PUT: Cancelar viaje
router.put("/:id/cancelar", ViajesController.cancelarViaje);

// ============================================
// RUTAS DELETE - Eliminar viajes
// ============================================

// DELETE: Eliminar o cancelar viaje
// Query params: ?eliminarPermanente=true
router.delete("/:id", ViajesController.deleteViaje);

export default router;

/* 
EJEMPLOS DE USO:

// 1. Crear viaje con ubicaciones recurrentes
POST /api/viajes
{
  "clienteNombre": "DIANA",
  "origen": {
    "nombreUbicacion": "DIANA",
    "esRecurrente": true
  },
  "destino": {
    "nombreUbicacion": "SARAM",
    "esRecurrente": true
  },
  "monto": 105.00,
  "fecha": "2025-01-15",
  "hora": "08:30 AM"
}

// 2. Crear viaje esporádico (sin ubicaciones registradas)
POST /api/viajes
{
  "clienteNombre": "JUAN PEREZ",
  "origen": {
    "texto": "CASA DE JUAN, COL. MIRAMONTE",
    "esRecurrente": false
  },
  "destino": {
    "texto": "AEROPUERTO INTERNACIONAL",
    "esRecurrente": false
  },
  "monto": 150.00
}

// 3. Obtener viajes del mes
GET /api/viajes?fechaInicio=2025-01-01&fechaFin=2025-01-31

// 4. Obtener viajes de un cliente
GET /api/viajes/cliente/64abc123xyz

// 5. Marcar viaje como pagado
PUT /api/viajes/64abc123xyz/marcar-pagado

// 6. Cancelar viaje
PUT /api/viajes/64abc123xyz/cancelar
{
  "motivo": "Cliente canceló"
}

// 7. Obtener pendientes de pago
GET /api/viajes/pendientes-pago

// 8. Obtener reporte del periodo
GET /api/viajes/reporte-periodo?fechaInicio=2025-01-01&fechaFin=2025-01-31
*/