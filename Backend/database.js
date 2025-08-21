// database.js
import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";
import {config} from "./src/config.js";

// 🚨 COMENTAR TEMPORALMENTE PARA DEBUGGING
// import autoUpdateService from './src/services/autoUpdateService.js';

const URI = config.db.URI;

// Configuración mejorada para MongoDB
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout después de 5s en lugar del default de 30s
  socketTimeoutMS: 45000, // Cerrar sockets después de 45s de inactividad
  maxPoolSize: 10, // Mantener hasta 10 conexiones socket
  minPoolSize: 2, // Mantener un mínimo de 2 conexiones socket
  maxIdleTimeMS: 30000, // Cerrar conexiones después de 30s de inactividad
  bufferMaxEntries: 0,
  bufferCommands: false,
};

// Conectar con manejo de errores mejorado
mongoose.connect(URI, mongooseOptions);

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("✅ DB conectada exitosamente");
  console.log(`📍 Conectado a: ${URI.replace(/\/\/.*@/, '//***@')}`); // Ocultar credenciales en logs
  
  // 🚨 COMENTAR TODA LA INICIALIZACIÓN DEL SERVICIO HASTA QUE FUNCIONE EL DEPLOY BÁSICO
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
  console.log("⚠️ DB desconectada");
  
  // 🚨 COMENTAR
  // if (autoUpdateService) {
  //   console.log('⏹️ Deteniendo servicio de auto-actualización...');
  //   autoUpdateService.stop();
  // }
});

connection.on("error", (error) => {
  console.error("❌ Error de conexión a DB:", error.message);
  
  // 🚨 COMENTAR
  // if (autoUpdateService) {
  //   autoUpdateService.stop();
  // }
});

// ✅ CORREGIDO: Usar async/await y manejo de errores mejorado
process.on('SIGINT', async () => {
  console.log('🛑 SIGINT recibido. Cerrando aplicación gracefully...');
  
  // if (autoUpdateService) {
  //   autoUpdateService.stop();
  // }
  
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cerrando conexión a MongoDB:', error.message);
    process.exit(1);
  }
});

// ✅ CORREGIDO: Usar async/await y manejo de errores mejorado  
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM recibido. Cerrando aplicación gracefully...');
  
  // if (autoUpdateService) {
  //   autoUpdateService.stop();
  // }
  
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cerrando conexión a MongoDB:', error.message);
    process.exit(1);
  }
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error.message);
  console.error('Stack:', error.stack);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

export default mongoose;