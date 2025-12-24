import { Router } from "express";
import UbicacionesController from "../Controllers/UbicacionesCon.js";

const router = Router();

// ============================================
// RUTAS GET - Obtener ubicaciones
// ============================================

// GET ALL: Obtener todas las ubicaciones
// Query params: ?activa=true&tipo=RESIDENCIAL&municipio=SAN_SALVADOR&limite=10
router.get("/", UbicacionesController.getUbicaciones);

// GET ONE: Obtener una ubicación específica
// Query params: ?nombre=DIANA (buscar por nombre)
router.get("/:id", UbicacionesController.getUbicacionById);

// ============================================
// RUTAS POST - Crear ubicaciones
// ============================================

// POST: Crear nueva ubicación
router.post("/", UbicacionesController.createUbicacion);

// ============================================
// RUTAS PUT - Actualizar ubicaciones
// ============================================

// PUT: Actualizar ubicación
router.put("/:id", UbicacionesController.updateUbicacion);

// ============================================
// RUTAS DELETE - Eliminar ubicaciones
// ============================================

// DELETE: Eliminar o desactivar ubicación
// Query params: ?eliminarPermanente=true
router.delete("/:id", UbicacionesController.deleteUbicacion);

export default router;

/* 
EJEMPLOS DE USO:

// 1. Crear ubicación recurrente
POST /api/ubicaciones
{
  "nombre": "DIANA",
  "direccion": "COL. ESCALÓN, CALLE PRINCIPAL #123",
  "tipo": "RESIDENCIAL",
  "municipio": "SAN SALVADOR",
  "departamento": "SAN SALVADOR",
  "referencias": "CASA COLOR BLANCO, PORTÓN NEGRO",
  "contacto": {
    "nombre": "DIANA MARTINEZ",
    "telefono": "7890-1234",
    "relacion": "PROPIETARIA"
  },
  "coordenadas": {
    "latitud": 13.6929,
    "longitud": -89.2182
  }
}

// 2. Obtener todas las ubicaciones activas
GET /api/ubicaciones?activa=true

// 3. Obtener las 10 ubicaciones más frecuentes
GET /api/ubicaciones?limite=10

// 4. Buscar ubicación por nombre
GET /api/ubicaciones/64abc123xyz?nombre=DIANA

// 5. Actualizar ubicación
PUT /api/ubicaciones/64abc123xyz
{
  "direccion": "NUEVA DIRECCIÓN",
  "telefono": "7890-5678"
}

// 6. Desactivar ubicación (soft delete)
DELETE /api/ubicaciones/64abc123xyz

// 7. Eliminar permanentemente
DELETE /api/ubicaciones/64abc123xyz?eliminarPermanente=true

// 8. Filtrar por tipo
GET /api/ubicaciones?tipo=HOSPITAL

// 9. Filtrar por municipio
GET /api/ubicaciones?municipio=ANTIGUO_CUSCATLAN
*/