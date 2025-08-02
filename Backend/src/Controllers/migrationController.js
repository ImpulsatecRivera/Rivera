// 📁 src/Controllers/MigrationController.js
// CONTROLLER PARA GESTIONAR MIGRACIONES DESDE API

import { runMigrations, rollbackMigration, getMigrationStatus } from '../migrations/index.js';
import { verificarMigracion } from '../migrations/ActualizarEsquema.js';

const MigrationController = {};

// 🚀 Ejecutar todas las migraciones pendientes
MigrationController.runMigrations = async (req, res) => {
  try {
    console.log('🔄 Iniciando migraciones desde API...');
    
    await runMigrations();
    
    res.status(200).json({
      success: true,
      message: 'Migraciones ejecutadas exitosamente',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error ejecutando migraciones',
      error: error.message
    });
  }
};

// 📊 Obtener estado de migraciones
MigrationController.getStatus = async (req, res) => {
  try {
    const status = await getMigrationStatus();
    
    res.status(200).json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado de migraciones',
      error: error.message
    });
  }
};

// 🔄 Hacer rollback de una migración específica
MigrationController.rollback = async (req, res) => {
  try {
    const { version } = req.params;
    
    if (!version) {
      return res.status(400).json({
        success: false,
        message: 'Versión de migración requerida'
      });
    }
    
    await rollbackMigration(version);
    
    res.status(200).json({
      success: true,
      message: `Rollback de migración ${version} completado`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en rollback:', error);
    res.status(500).json({
      success: false,
      message: 'Error ejecutando rollback',
      error: error.message
    });
  }
};

// 🔍 Verificar estado específico de migración de carga
MigrationController.verificarCarga = async (req, res) => {
  try {
    const estado = await verificarMigracion();
    
    res.status(200).json({
      success: true,
      data: estado,
      message: 'Estado de migración de carga verificado',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error verificando migración:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando migración de carga',
      error: error.message
    });
  }
};

// 🧪 Endpoint de prueba para migración (solo desarrollo)
MigrationController.testMigration = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Endpoint no disponible en producción'
    });
  }
  
  try {
    // Aquí puedes agregar lógica de prueba
    const { crear_datos_prueba } = req.query;
    
    if (crear_datos_prueba === 'true') {
      // Lógica para crear datos de prueba
      console.log('🧪 Creando datos de prueba...');
    }
    
    res.status(200).json({
      success: true,
      message: 'Modo de prueba - migración simulada',
      data: {
        environment: process.env.NODE_ENV,
        test_mode: true
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en prueba de migración',
      error: error.message
    });
  }
};

// 🧹 AÑADIR ESTE MÉTODO A TU MigrationController.js

// Método para limpiar migraciones fallidas
MigrationController.cleanFailedMigration = async (req, res) => {
  try {
    const { version } = req.params;
    
    if (!version) {
      return res.status(400).json({
        success: false,
        message: 'Versión de migración requerida'
      });
    }

    // Conectar a la base de datos directamente
    const mongoose = await import('mongoose');
    
    // Buscar la migración
    const Migration = mongoose.model('Migration');
    const migration = await Migration.findOne({ version });
    
    if (!migration) {
      return res.status(404).json({
        success: false,
        message: `Migración ${version} no encontrada`
      });
    }

    // Si está exitosa, no permitir limpiar
    if (migration.status === 'success') {
      return res.status(400).json({
        success: false,
        message: `Migración ${version} fue exitosa, no se puede limpiar`,
        migration: {
          version: migration.version,
          status: migration.status,
          executedAt: migration.executedAt
        }
      });
    }

    // Eliminar migración fallida
    await Migration.deleteOne({ version });
    
    res.status(200).json({
      success: true,
      message: `Migración ${version} limpiada exitosamente`,
      status: migration.status,
      error: migration.error
    });

  } catch (error) {
    console.error('❌ Error limpiando migración:', error);
    res.status(500).json({
      success: false,
      message: 'Error limpiando migración',
      error: error.message
    });
  }
};

// 🔍 MÉTODO PARA VER DETALLES DE UNA MIGRACIÓN ESPECÍFICA
MigrationController.getMigrationDetails = async (req, res) => {
  try {
    const { version } = req.params;
    
    const mongoose = await import('mongoose');
    const Migration = mongoose.model('Migration');
    
    const migration = await Migration.findOne({ version });
    
    if (!migration) {
      return res.status(404).json({
        success: false,
        message: `Migración ${version} no encontrada`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        version: migration.version,
        name: migration.name,
        description: migration.description,
        status: migration.status,
        executedAt: migration.executedAt,
        recordsAffected: migration.recordsAffected,
        error: migration.error
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo detalles de migración',
      error: error.message
    });
  }
};

// 🔧 AÑADIR ESTE MÉTODO TEMPORAL A TU MigrationController.js

// Método para ejecutar migración manual con debugging
MigrationController.manualMigration = async (req, res) => {
  try {
    console.log('🔧 Iniciando migración manual con debugging...');
    
    // Importar modelo
    const ViajesModel = (await import('../Models/Viajes.js')).default;
    
    // 1. Ver datos actuales
    const viajesActuales = await ViajesModel.find({}).select('carga').limit(2);
    console.log('📊 Datos actuales (muestra):');
    console.log(JSON.stringify(viajesActuales, null, 2));
    
    // 2. Buscar viajes sin migrar
    const viajes = await ViajesModel.find({
      $or: [
        { 'carga.categoria': { $exists: false } },
        { 'metadata.migrated': { $ne: true } }
      ]
    });
    
    console.log(`📦 Encontrados ${viajes.length} viajes para migrar`);
    
    if (viajes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay viajes para migrar',
        datosActuales: viajesActuales
      });
    }
    
    // 3. Migrar uno por uno con debugging
    let migrados = 0;
    const errores = [];
    
    for (let i = 0; i < Math.min(viajes.length, 3); i++) { // Solo los primeros 3 para testing
      const viaje = viajes[i];
      
      try {
        console.log(`\n🔧 Migrando viaje ${i + 1}: ${viaje._id}`);
        console.log('Carga original:', JSON.stringify(viaje.carga, null, 2));
        
        // Crear nueva estructura
        const tipoAntiguo = viaje.carga?.tipo || 'general';
        const valorAntiguo = viaje.carga?.valor;
        
        let valorExtraido = 0;
        if (typeof valorAntiguo === 'number') {
          valorExtraido = valorAntiguo;
        } else if (typeof valorAntiguo === 'object' && valorAntiguo?.montoDeclarado) {
          valorExtraido = valorAntiguo.montoDeclarado;
        }
        
        const nuevaCarga = {
          descripcion: viaje.carga?.descripcion || `Carga ${tipoAntiguo}`,
          peso: viaje.carga?.peso || { valor: 0, unidad: 'kg' },
          volumen: viaje.carga?.volumen || { valor: 0, unidad: 'm3' },
          categoria: tipoAntiguo === 'general' ? 'otros' : 'electronicos',
          clasificacionRiesgo: 'normal',
          empaque: {
            tipo: 'caja_carton',
            cantidad: 1
          },
          valor: {
            montoDeclarado: valorExtraido,
            moneda: 'USD',
            asegurado: false
          },
          condicionesEspeciales: {},
          documentacion: {
            facturaComercial: false,
            certificadoOrigen: false,
            permisoSanitario: false,
            licenciaImportacion: false,
            otros: []
          },
          requisitoVehiculo: {
            tipoCarroceria: 'carga_seca'
          }
        };
        
        console.log('Nueva carga:', JSON.stringify(nuevaCarga, null, 2));
        
        // Actualizar documento
        const resultado = await ViajesModel.findByIdAndUpdate(
          viaje._id,
          {
            $set: {
              carga: nuevaCarga,
              'metadata.migrated': true,
              'metadata.migratedAt': new Date()
            }
          },
          { new: true, runValidators: false } // Desactivar validadores por si acaso
        );
        
        if (resultado) {
          migrados++;
          console.log(`✅ Viaje ${viaje._id} migrado exitosamente`);
        } else {
          console.log(`❌ No se pudo actualizar viaje ${viaje._id}`);
          errores.push(`No se pudo actualizar ${viaje._id}`);
        }
        
      } catch (error) {
        console.error(`❌ Error migrando viaje ${viaje._id}:`, error.message);
        errores.push(`${viaje._id}: ${error.message}`);
      }
    }
    
    // 4. Verificar resultados
    const viajesDespues = await ViajesModel.find({}).select('carga metadata').limit(2);
    console.log('📊 Datos después (muestra):');
    console.log(JSON.stringify(viajesDespues, null, 2));
    
    res.status(200).json({
      success: true,
      message: 'Migración manual completada',
      migrados,
      errores,
      totalProcesados: Math.min(viajes.length, 3),
      datosAntes: viajesActuales,
      datosDespues: viajesDespues
    });
    
  } catch (error) {
    console.error('❌ Error en migración manual:', error);
    res.status(500).json({
      success: false,
      message: 'Error en migración manual',
      error: error.message
    });
  }
};


// 🔧 AÑADIR ESTE MÉTODO A TU MigrationController.js

// Método para marcar todos los viajes como migrados
MigrationController.markAllAsMigrated = async (req, res) => {
  try {
    console.log('🏷️ Marcando todos los viajes como migrados...');
    
    // Importar modelo
    const ViajesModel = (await import('../Models/Viajes.js')).default;
    
    // Buscar viajes que tienen la nueva estructura pero no están marcados como migrados
    const viajesConNuevaEstructura = await ViajesModel.find({
      'carga.categoria': { $exists: true },
      'carga.clasificacionRiesgo': { $exists: true },
      'metadata.migrated': { $ne: true }
    });
    
    console.log(`📦 Encontrados ${viajesConNuevaEstructura.length} viajes con nueva estructura`);
    
    if (viajesConNuevaEstructura.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Todos los viajes ya están marcados como migrados',
        migrados: 0
      });
    }
    
    // Marcar todos como migrados
    const resultado = await ViajesModel.updateMany(
      {
        'carga.categoria': { $exists: true },
        'carga.clasificacionRiesgo': { $exists: true }
      },
      {
        $set: {
          'metadata.migrated': true,
          'metadata.migratedAt': new Date(),
          'metadata.migratedFrom': 'schema_v1',
          'metadata.migratedTo': 'schema_v2'
        }
      }
    );
    
    console.log(`✅ ${resultado.modifiedCount} viajes marcados como migrados`);
    
    // Verificar estado después
    const verificacion = await ViajesModel.countDocuments({ 'metadata.migrated': true });
    
    res.status(200).json({
      success: true,
      message: 'Viajes marcados como migrados exitosamente',
      migrados: resultado.modifiedCount,
      totalMigrados: verificacion,
      detalles: {
        matchedCount: resultado.matchedCount,
        modifiedCount: resultado.modifiedCount
      }
    });
    
  } catch (error) {
    console.error('❌ Error marcando viajes como migrados:', error);
    res.status(500).json({
      success: false,
      message: 'Error marcando viajes como migrados',
      error: error.message
    });
  }
};

export default MigrationController;