// app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

// ==== RUTAS (ajusta las rutas si tu proyecto difiere) ====
import camionesRoutes from "./src/Routes/camionesRoutes.js";
import empleadoRoutes from "./src/Routes/empleadosRoutes.js";
import motoristasRoutes from "./src/Routes/motoristaRoutes.js";
import proveedoresRoutes from "./src/Routes/proveedoresRoutes.js";
import ClientesRoutes from "./src/Routes/clienteRoutes.js";
import RegisterClienteRoutes from "./src/Routes/RegisterClienteRouter.js";
import CotizacionesRoutes from "./src/Routes/cotizacionesRoutes.js";
import autoUpdateRoutes from "./src/Routes/autoUpdateRoutes.js";
import LoginRoutes from "./src/Routes/LoginRoutes.js";
import LogoutRoutes from "./src/Routes/Logout.js";
import RecoveryRoutes from "./src/Routes/Recovery.js";
import RegisterRoutes from "./src/Routes/RegisterRoute.js";
import ViajesRoutes from "./src/Routes/ViajesRoutes.js";

const app = express();

// Si corre detrás de proxy (Render/Heroku), necesario para cookies "secure"
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

// ===================== CORS =====================
// Orígenes permitidos explícitos
const ALLOWED_ORIGINS = [
  "http://localhost:5173",                     // Dev Vite
  "http://localhost:3000",                     // Dev React/Next
  "https://rivera-project-ecru.vercel.app",    // Prod/preview
  "https://rivera-project-uhuf.vercel.app",    // Otro preview
];

// Regex para permitir otros previews en Vercel si los usas
const ORIGIN_REGEX = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

// Headers de petición permitidos - CORREGIDOS CON CASE CORRECTO
const ALLOWED_REQ_HEADERS = [
  "Content-Type",
  "Authorization", 
  "Accept",
  "Origin",
  "X-Requested-With",
  "Cache-Control",           // ← CORREGIDO: Con mayúscula como envía el frontend
  "cache-control",           // ← MANTENER: Por compatibilidad
  "Pragma",                  // ← CORREGIDO: Con mayúscula como envía el frontend  
  "pragma",                  // ← MANTENER: Por compatibilidad
  "Expires",
  "expires", 
  "If-Modified-Since",
  "if-modified-since",
  "If-None-Match",
  "if-none-match",
  "X-API-Key",
  "x-api-key",
  "User-Agent",
  "user-agent"
];

// CORS principal - CONFIGURACIÓN UNIFICADA
app.use(
  cors({
    origin(origin, cb) {
      // Permitir peticiones sin origin (móviles, Postman, curl)
      if (!origin) return cb(null, true);
      
      // Verificar si el origin está permitido
      const isAllowed =
        ALLOWED_ORIGINS.includes(origin) || ORIGIN_REGEX.test(origin);
      
      if (isAllowed) {
        return cb(null, true);
      } else {
        console.warn(`🚫 CORS: Origin no permitido: ${origin}`);
        return cb(new Error("No permitido por CORS"));
      }
    },
    credentials: true, // Permitir cookies y headers de auth
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ALLOWED_REQ_HEADERS,
    exposedHeaders: ["Authorization"], // Headers que el frontend puede leer
    maxAge: 86400, // Cache del preflight por 24 horas
    preflightContinue: false, // Manejar preflight automáticamente
    optionsSuccessStatus: 204 // Para navegadores legacy
  })
);

// ===================== Middleware de Headers Adicionales =====================
app.use((req, res, next) => {
  // Headers de seguridad
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  
  // Header Vary para cache correcto con múltiples origins
  res.header("Vary", "Origin");
  
  // Log para debugging (eliminar en producción)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📡 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  }
  
  next();
});

// ===================== Swagger =====================
let swaggerDocument = { 
  openapi: "3.0.0", 
  info: { 
    title: "Rivera Project API", 
    version: "1.0.0",
    description: "API para gestión de transportes y logística"
  }, 
  paths: {},
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://riveraproject-5.onrender.com'
        : 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' ? 'Servidor de Producción' : 'Servidor de Desarrollo'
    }
  ]
};

try {
  const raw = fs.readFileSync(path.resolve("./Documentacion.json"), "utf-8");
  swaggerDocument = JSON.parse(raw);
  console.log("✅ Documentación Swagger cargada correctamente");
} catch (e) {
  console.warn("⚠️  No se pudo cargar Documentacion.json, usando configuración básica.");
}

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ===================== Rutas de la API =====================
// 🔍 DEBUGGING: Solo mantener rutas esenciales para encontrar el error
app.use("/api/viajes", ViajesRoutes);

// 🚨 COMENTADAS TEMPORALMENTE PARA DEBUGGING:
// app.use("/api/camiones", camionesRoutes);
// app.use("/api/empleados", empleadoRoutes);
// app.use("/api/motoristas", motoristasRoutes);
// app.use("/api/proveedores", proveedoresRoutes);
// app.use("/api/clientes", ClientesRoutes);
// app.use("/api/login", LoginRoutes);
// app.use("/api/logout", LogoutRoutes);
// app.use("/api/register", RegisterRoutes);
// app.use("/api/register-cliente", RegisterClienteRoutes);
// app.use("/api/cotizaciones", CotizacionesRoutes);
// app.use("/api/recovery", RecoveryRoutes);
// app.use("/api/auto-update", autoUpdateRoutes);

// ===================== Health Check =====================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    cors: "Configured with cache-control support",
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins: ALLOWED_ORIGINS.length,
    allowedHeaders: ALLOWED_REQ_HEADERS.length
  });
});

// ===================== Ruta de información CORS (para debugging) =====================
app.get("/api/cors-info", (req, res) => {
  res.status(200).json({
    allowedOrigins: ALLOWED_ORIGINS,
    allowedHeaders: ALLOWED_REQ_HEADERS,
    requestOrigin: req.headers.origin || null,
    userAgent: req.headers['user-agent'] || null
  });
});

// ===================== Manejo de errores =====================
// Error handler para CORS
app.use((error, req, res, next) => {
  if (error && error.message === "No permitido por CORS") {
    return res.status(403).json({
      error: "CORS: Origen no permitido",
      origin: req.headers.origin || null,
      message: "Tu dominio no está autorizado para acceder a esta API",
      allowedOrigins: process.env.NODE_ENV !== 'production' ? ALLOWED_ORIGINS : undefined
    });
  }
  next(error);
});

// Error handler general
app.use((error, req, res, next) => {
  console.error("❌ Error no manejado:", error);
  res.status(500).json({
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === 'production' 
      ? "Algo salió mal en el servidor" 
      : error.message
  });
});

// Ruta 404 para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
    method: req.method,
    message: "La ruta solicitada no existe en esta API"
  });
});

export default app;