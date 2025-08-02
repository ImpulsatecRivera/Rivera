// 📁 src/Routes/migrationRoutes.js
// RUTAS PARA GESTIÓN DE MIGRACIONES

import { Router } from 'express';
// Cambia esta línea en src/Routes/migrationRoutes.js:
import MigrationController from '../Controllers/MigrationController.js';
//                                                    ↑ Mayúscula
const router = Router();

// 🚀 Ejecutar migraciones
router.post('/run', MigrationController.runMigrations);

// 📊 Ver estado de migraciones
router.get('/status', MigrationController.getStatus);

// 🔄 Rollback de migración específica
router.post('/rollback/:version', MigrationController.rollback);

// 🔍 Verificar migración de carga específicamente
router.get('/verify/carga', MigrationController.verificarCarga);

// 🧪 Endpoint de prueba (solo desarrollo)
router.get('/test', MigrationController.testMigration);

// En src/Routes/migrationRoutes.js, agrega estas líneas:

// 🧹 Limpiar migración fallida
router.delete('/clean/:version', MigrationController.cleanFailedMigration);

// 🔍 Ver detalles de migración específica
router.get('/details/:version', MigrationController.getMigrationDetails);


// 🔧 Migración manual para debugging
router.post('/manual', MigrationController.manualMigration);

// 🏷️ Marcar todos como migrados
router.post('/mark-migrated', MigrationController.markAllAsMigrated);
export default router;