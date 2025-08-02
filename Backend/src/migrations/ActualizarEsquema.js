// 📁 Backend/src/migrations/001_upgrade_carga_schema.js
// MIGRACIÓN CORREGIDA PARA MANEJAR EL CAMPO VALOR EXISTENTE

import ViajesModel from '../Models/Viajes.js';

// 🗺️ Mapeos de conversión
const MAPEO_CATEGORIAS = {
  'general': 'otros',
  'fragil': 'electronicos',
  'peligrosa': 'quimicos', 
  'refrigerada': 'alimentos_perecederos',
  'liquida': 'bebidas'
};

const MAPEO_RIESGOS = {
  'general': 'normal',
  'fragil': 'fragil',
  'peligrosa': 'peligroso',
  'refrigerada': 'refrigerado',
  'liquida': 'normal'
};

const MAPEO_VEHICULOS = {
  'general': 'carga_seca',
  'fragil': 'carga_seca',
  'peligrosa': 'carga_seca',
  'refrigerada': 'refrigerado',
  'liquida': 'tanque'
};

// 🚀 Función principal de migración
export const upgradeCargaSchema = async () => {
  const session = await ViajesModel.startSession();
  
  try {
    await session.withTransaction(async () => {
      console.log('🔍 Buscando viajes con esquema antiguo...');
      
      // Buscar viajes que necesitan migración
      const viajesAntiguos = await ViajesModel.find({
        $or: [
          { 'carga.categoria': { $exists: false } },
          { 'carga.clasificacionRiesgo': { $exists: false } }
        ]
      }).session(session);
      
      console.log(`📦 Encontrados ${viajesAntiguos.length} viajes para migrar`);
      
      if (viajesAntiguos.length === 0) {
        return { recordsAffected: 0 };
      }
      
      let migrados = 0;
      let errores = 0;
      
      // Procesar en lotes de 10 (más pequeños para debugging)
      const BATCH_SIZE = 10;
      for (let i = 0; i < viajesAntiguos.length; i += BATCH_SIZE) {
        const lote = viajesAntiguos.slice(i, i + BATCH_SIZE);
        
        console.log(`⚙️ Procesando lote ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(viajesAntiguos.length/BATCH_SIZE)}`);
        
        const operaciones = [];
        
        for (const viaje of lote) {
          try {
            console.log(`🔧 Procesando viaje ${viaje._id}...`);
            console.log(`   Tipo actual: ${viaje.carga?.tipo}`);
            console.log(`   Valor actual: ${viaje.carga?.valor} (${typeof viaje.carga?.valor})`);
            
            const nuevaCarga = migrarEstructuraCarga(viaje.carga);
            
            operaciones.push({
              updateOne: {
                filter: { _id: viaje._id },
                update: {
                  $set: {
                    carga: nuevaCarga,
                    // Metadatos de migración
                    'metadata.migrated': true,
                    'metadata.migratedAt': new Date(),
                    'metadata.migratedFrom': 'schema_v1',
                    'metadata.migratedTo': 'schema_v2'
                  }
                }
              }
            });
            
            console.log(`   ✅ Viaje ${viaje._id} preparado para migración`);
            
          } catch (error) {
            console.error(`❌ Error preparando migración para viaje ${viaje._id}:`, error.message);
            errores++;
          }
        }
        
        if (operaciones.length > 0) {
          try {
            const resultado = await ViajesModel.bulkWrite(operaciones, { session });
            migrados += resultado.modifiedCount;
            
            console.log(`✅ Lote procesado: ${resultado.modifiedCount}/${operaciones.length} viajes migrados`);
          } catch (error) {
            console.error(`❌ Error ejecutando lote:`, error.message);
            errores += operaciones.length;
          }
        }
      }
      
      console.log(`\n🎉 Migración completada:`);
      console.log(`   ✅ Migrados exitosamente: ${migrados}`);
      console.log(`   ❌ Errores: ${errores}`);
      console.log(`   📊 Total procesados: ${viajesAntiguos.length}`);
      
      return { recordsAffected: migrados };
    });
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

// 🔧 Función para migrar estructura de carga individual (CORREGIDA)
const migrarEstructuraCarga = (cargaAntigua) => {
  const tipoAntiguo = cargaAntigua.tipo || 'general';
  
  // 🔍 Extraer valor existente correctamente
  let valorExistente = 0;
  if (cargaAntigua.valor !== undefined && cargaAntigua.valor !== null) {
    if (typeof cargaAntigua.valor === 'number') {
      valorExistente = cargaAntigua.valor;
    } else if (typeof cargaAntigua.valor === 'object' && cargaAntigua.valor.montoDeclarado) {
      valorExistente = cargaAntigua.valor.montoDeclarado;
    }
  }
  
  console.log(`   🔍 Valor extraído: ${valorExistente} (tipo: ${typeof valorExistente})`);
  
  // Estructura base migrada
  const nuevaCarga = {
    // 🏷️ Mantener campos existentes compatibles
    descripcion: cargaAntigua.descripcion || `Carga ${tipoAntiguo}`,
    peso: cargaAntigua.peso || { valor: 0, unidad: 'kg' },
    volumen: cargaAntigua.volumen || { valor: 0, unidad: 'm3' },
    
    // 🆕 Nuevos campos obligatorios
    categoria: MAPEO_CATEGORIAS[tipoAntiguo] || 'otros',
    clasificacionRiesgo: MAPEO_RIESGOS[tipoAntiguo] || 'normal',
    
    // 📦 Información de empaque por defecto
    empaque: {
      tipo: 'caja_carton',
      cantidad: 1,
      dimensiones: {}
    },
    
    // 💰 Valor de carga (CORREGIDO)
    valor: {
      montoDeclarado: valorExistente,
      moneda: 'USD',
      asegurado: false
    },
    
    // 🌡️ Condiciones especiales según tipo
    condicionesEspeciales: generarCondicionesEspeciales(tipoAntiguo),
    
    // 📋 Documentación por defecto
    documentacion: generarDocumentacionDefecto(tipoAntiguo),
    
    // 🚛 Requisitos de vehículo
    requisitoVehiculo: {
      tipoCarroceria: MAPEO_VEHICULOS[tipoAntiguo] || 'carga_seca'
    },
    
    // 🔍 Metadatos de migración
    _legacy: {
      tipoOriginal: tipoAntiguo,
      valorOriginal: cargaAntigua.valor,
      migratedAt: new Date()
    }
  };
  
  console.log(`   🎯 Nueva estructura valor: ${JSON.stringify(nuevaCarga.valor)}`);
  
  return nuevaCarga;
};

// 🌡️ Generar condiciones especiales según tipo
const generarCondicionesEspeciales = (tipo) => {
  const condiciones = {};
  
  switch (tipo) {
    case 'refrigerada':
      condiciones.temperaturaMinima = 2;
      condiciones.temperaturaMaxima = 8;
      condiciones.requiereVentilacion = true;
      break;
    case 'fragil':
      condiciones.evitarVibración = true;
      condiciones.posicionVertical = true;
      break;
    case 'peligrosa':
      condiciones.requiereVentilacion = true;
      condiciones.protegerDeLuz = true;
      break;
  }
  
  return condiciones;
};

// 📋 Generar documentación por defecto según tipo
const generarDocumentacionDefecto = (tipo) => {
  const doc = {
    facturaComercial: false,
    certificadoOrigen: false,
    permisoSanitario: false,
    licenciaImportacion: false,
    otros: []
  };
  
  // Documentación específica según tipo
  switch (tipo) {
    case 'peligrosa':
      doc.permisoSanitario = true;
      doc.otros.push('Hoja de seguridad MSDS');
      break;
    case 'refrigerada':
      doc.permisoSanitario = true;
      break;
  }
  
  return doc;
};

// 🔄 Función de rollback (opcional)
export const rollbackUpgradeCargaSchema = async () => {
  console.log('🔄 Ejecutando rollback de migración de esquema de carga...');
  
  try {
    const resultado = await ViajesModel.updateMany(
      { 'metadata.migrated': true, 'metadata.migratedFrom': 'schema_v1' },
      {
        $unset: {
          'carga.categoria': '',
          'carga.clasificacionRiesgo': '',
          'carga.empaque': '',
          'carga.condicionesEspeciales': '',
          'carga.documentacion': '',
          'carga.requisitoVehiculo': '',
          'carga._legacy': '',
          'metadata.migrated': '',
          'metadata.migratedAt': '',
          'metadata.migratedFrom': '',
          'metadata.migratedTo': ''
        },
        $set: {
          // Restaurar valor original si existe
          'carga.valor': '$carga._legacy.valorOriginal'
        }
      }
    );
    
    console.log(`✅ Rollback completado: ${resultado.modifiedCount} registros revertidos`);
    return { recordsAffected: resultado.modifiedCount };
    
  } catch (error) {
    console.error('❌ Error en rollback:', error);
    throw error;
  }
};

// 📊 Función para verificar estado de migración
// 🔧 REEMPLAZAR la función verificarMigracion en 001_upgrade_carga_schema.js

// 📊 Función para verificar estado de migración (CORREGIDA)
export const verificarMigracion = async () => {
  try {
    // Importar modelo
    const ViajesModel = (await import('../Models/Viajes.js')).default;
    
    const total = await ViajesModel.countDocuments();
    
    // Contar por diferentes criterios para debugging
    const conMetadataMigrated = await ViajesModel.countDocuments({ 'metadata.migrated': true });
    const conCategoria = await ViajesModel.countDocuments({ 'carga.categoria': { $exists: true } });
    const conClasificacionRiesgo = await ViajesModel.countDocuments({ 'carga.clasificacionRiesgo': { $exists: true } });
    
    // Los migrados son los que tienen AMBOS campos nuevos
    const migrados = await ViajesModel.countDocuments({
      $and: [
        { 'carga.categoria': { $exists: true } },
        { 'carga.clasificacionRiesgo': { $exists: true } }
      ]
    });
    
    // Los pendientes son los que NO tienen alguno de los campos nuevos
    const pendientes = await ViajesModel.countDocuments({
      $or: [
        { 'carga.categoria': { $exists: false } },
        { 'carga.clasificacionRiesgo': { $exists: false } }
      ]
    });
    
    console.log('\n📊 Estado de migración (DETALLADO):');
    console.log(`   📦 Total de viajes: ${total}`);
    console.log(`   🏷️ Con metadata.migrated: ${conMetadataMigrated}`);
    console.log(`   📦 Con categoria: ${conCategoria}`);
    console.log(`   🚨 Con clasificacionRiesgo: ${conClasificacionRiesgo}`);
    console.log(`   ✅ Migrados (ambos campos): ${migrados}`);
    console.log(`   ⏳ Pendientes: ${pendientes}`);
    console.log(`   📈 Progreso: ${total > 0 ? Math.round((migrados/total)*100) : 0}%`);
    
    // Validar que los números cuadren
    if (migrados + pendientes !== total) {
      console.log(`⚠️ ADVERTENCIA: Los números no cuadran. Migrados (${migrados}) + Pendientes (${pendientes}) ≠ Total (${total})`);
    }
    
    return { 
      total, 
      migrados, 
      pendientes,
      // Datos adicionales para debugging
      debug: {
        conMetadataMigrated,
        conCategoria,
        conClasificacionRiesgo
      }
    };
  } catch (error) {
    console.error('Error verificando migración:', error);
    throw error;
  }
};