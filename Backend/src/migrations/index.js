// 📁 src/migrations/index.js
// GESTOR PRINCIPAL DE MIGRACIONES (CORREGIDO)

import mongoose from 'mongoose';
import { upgradeCargaSchema } from './ActualizarEsquema.js';

// 📋 Lista de migraciones disponibles
const migrations = [
  {
    version: '001',
    name: 'upgrade_carga_schema',
    description: 'Actualizar esquema de carga a categorías específicas',
    handler: upgradeCargaSchema,
    date: '2025-08-02'
  }
  // Aquí puedes agregar más migraciones en el futuro
];

// 🏗️ Modelo para tracking de migraciones
const migrationSchema = new mongoose.Schema({
  version: { type: String, required: true, unique: true },
  name: String,
  description: String,
  executedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  error: String,
  recordsAffected: Number
});

const Migration = mongoose.model('Migration', migrationSchema);

// 🚀 Ejecutar migraciones pendientes
export const runMigrations = async () => {
  try {
    console.log('🔍 Verificando migraciones pendientes...');
    
    // Verificar qué migraciones ya se ejecutaron
    const executedMigrations = await Migration.find({ status: 'success' });
    const executedVersions = executedMigrations.map(m => m.version);
    
    // Filtrar migraciones pendientes
    const pendingMigrations = migrations.filter(m => !executedVersions.includes(m.version));
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No hay migraciones pendientes');
      return;
    }
    
    console.log(`📋 Encontradas ${pendingMigrations.length} migraciones pendientes`);
    
    // Ejecutar cada migración
    for (const migration of pendingMigrations) {
      await executeMigration(migration);
    }
    
    console.log('🎉 Todas las migraciones completadas');
    
  } catch (error) {
    console.error('💥 Error ejecutando migraciones:', error);
    throw error;
  }
};

// 🏃‍♂️ Ejecutar una migración específica (CORREGIDO)
const executeMigration = async (migration) => {
  let migrationRecord;
  
  try {
    console.log(`\n🚀 Ejecutando migración ${migration.version}: ${migration.name}`);
    
    // Crear registro de migración
    migrationRecord = new Migration({
      version: migration.version,
      name: migration.name,
      description: migration.description,
      status: 'pending'
    });
    await migrationRecord.save();
    
    // Ejecutar la migración
    const result = await migration.handler();
    
    // 🔧 CORRECCIÓN: Manejar diferentes tipos de resultado
    let recordsAffected = 0;
    if (result && typeof result === 'object') {
      recordsAffected = result.recordsAffected || 0;
    } else if (typeof result === 'number') {
      recordsAffected = result;
    }
    
    // Actualizar registro como exitoso
    migrationRecord.status = 'success';
    migrationRecord.recordsAffected = recordsAffected;
    await migrationRecord.save();
    
    console.log(`✅ Migración ${migration.version} completada exitosamente`);
    console.log(`   📊 Registros afectados: ${recordsAffected}`);
    
  } catch (error) {
    console.error(`❌ Error en migración ${migration.version}:`, error.message);
    
    // Actualizar registro como fallido
    if (migrationRecord) {
      migrationRecord.status = 'failed';
      migrationRecord.error = error.message;
      await migrationRecord.save();
    }
    
    throw error;
  }
};

// 🔄 Rollback de una migración específica
export const rollbackMigration = async (version) => {
  try {
    console.log(`🔄 Realizando rollback de migración ${version}...`);
    
    const migration = migrations.find(m => m.version === version);
    if (!migration) {
      throw new Error(`Migración ${version} no encontrada`);
    }
    
    if (migration.rollback) {
      await migration.rollback();
      
      // Marcar como no ejecutada
      await Migration.deleteOne({ version });
      
      console.log(`✅ Rollback de migración ${version} completado`);
    } else {
      console.log(`⚠️ Migración ${version} no tiene rollback definido`);
    }
    
  } catch (error) {
    console.error(`💥 Error en rollback:`, error);
    throw error;
  }
};

// 📊 Ver estado de migraciones
export const getMigrationStatus = async () => {
  try {
    const executed = await Migration.find().sort({ executedAt: 1 });
    const pending = migrations.filter(m => 
      !executed.find(e => e.version === m.version && e.status === 'success')
    );
    
    return {
      executed: executed.map(m => ({
        version: m.version,
        name: m.name,
        status: m.status,
        executedAt: m.executedAt,
        recordsAffected: m.recordsAffected
      })),
      pending: pending.map(m => ({
        version: m.version,
        name: m.name,
        description: m.description
      }))
    };
  } catch (error) {
    console.error('Error obteniendo estado de migraciones:', error);
    throw error;
  }
};

export default { runMigrations, rollbackMigration, getMigrationStatus };