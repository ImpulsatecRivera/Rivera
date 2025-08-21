import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";
import {config} from "./src/config.js";

// 🚨 COMENTAR TEMPORALMENTE PARA DEBUGGING
// import autoUpdateService from './src/services/autoUpdateService.js';

const URI = config.db.URI;

mongoose.connect(URI);

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("DB conectada");
  
  // 🚨 COMENTAR TODA LA INICIALIZACIÓN DEL SERVICIO
  // setTimeout(() => {
  //   try {
  //     console.log('🔄 Iniciando servicio de actualización automática...');
  //     autoUpdateService.start();
  //     console.log('✅ Servicio de auto-actualización iniciado correctamente');
  //   } catch (error) {
  //     console.error('❌ Error iniciando servicio de auto-actualización:', error);
  //   }
  // }, 3000);
});

connection.on("disconnected", () => {
  console.log("DB is desconectada");
  
  // 🚨 COMENTAR
  // if (autoUpdateService) {
  //   console.log('⏹️ Deteniendo servicio de auto-actualización...');
  //   autoUpdateService.stop();
  // }
});

connection.on("error", (error) => {
  console.log("error encontrado" + error);
  
  // 🚨 COMENTAR
  // if (autoUpdateService) {
  //   autoUpdateService.stop();
  // }
});

// 🚨 COMENTAR TODAS LAS REFERENCIAS A autoUpdateService
process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido. Cerrando aplicación...');
  
  // if (autoUpdateService) {
  //   autoUpdateService.stop();
  // }
  
  mongoose.connection.close(() => {
    console.log('✅ Conexión a MongoDB cerrada');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido. Cerrando aplicación...');
  
  // if (autoUpdateService) {
  //   autoUpdateService.stop();
  // }
  
  mongoose.connection.close(() => {
    console.log('✅ Conexión a MongoDB cerrada');
    process.exit(0);
  });
});