import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";
import {config} from "./src/config.js";

// 🆕 IMPORTAR SERVICIO DE AUTO-ACTUALIZACIÓN
import autoUpdateService from './src/services/services.js';

const URI = config.db.URI;

mongoose.connect(URI);

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("DB conectada");
  
  // 🚀 INICIALIZAR SERVICIO DE AUTO-ACTUALIZACIÓN DESPUÉS DE CONECTAR DB
  setTimeout(() => {
    try {
      console.log('🔄 Iniciando servicio de actualización automática...');
      autoUpdateService.start();
      console.log('✅ Servicio de auto-actualización iniciado correctamente');
    } catch (error) {
      console.error('❌ Error iniciando servicio de auto-actualización:', error);
    }
  }, 3000); // 3 segundos de delay para asegurar que la DB esté completamente lista
});

connection.on("disconnected", () => {
  console.log("DB is desconectada");
  
  // 🛑 DETENER SERVICIO CUANDO SE DESCONECTE LA DB
  if (autoUpdateService) {
    console.log('⏹️ Deteniendo servicio de auto-actualización...');
    autoUpdateService.stop();
  }
});

connection.on("error", (error) => {
  console.log("error encontrado" + error);
  
  // 🛑 DETENER SERVICIO EN CASO DE ERROR
  if (autoUpdateService) {
    autoUpdateService.stop();
  }
});

// 🛑 Manejo de cierre graceful del proceso
process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido. Cerrando aplicación...');
  
  // Detener servicio de auto-actualización
  if (autoUpdateService) {
    autoUpdateService.stop();
  }
  
  // Cerrar conexión a la base de datos
  mongoose.connection.close(() => {
    console.log('✅ Conexión a MongoDB cerrada');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido. Cerrando aplicación...');
  
  if (autoUpdateService) {
    autoUpdateService.stop();
  }
  
  mongoose.connection.close(() => {
    console.log('✅ Conexión a MongoDB cerrada');
    process.exit(0);
  });
});