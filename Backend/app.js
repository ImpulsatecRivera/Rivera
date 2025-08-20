// app.js - Versión completa basada en la configuración que funciona
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

// Imports de rutas
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

// Configuración para proxy (Render/Heroku)
app.set("trust proxy", 1);

// Middleware básico
app.use(express.json());
app.use(cookieParser());

// CORS - Configuración completa y funcional
const ALLOWED_ORIGINS = [
  "http://localhost:5173",                     // Desarrollo local Vite
  "http://localhost:3000",                     // Desarrollo local React/Next
  "https://rivera-project-ecru.vercel.app",    // Producción principal
  "https://rivera-project-uhuf.vercel.app",    // Preview adicional
];

// Regex para previews dinámicos de Vercel
const ORIGIN_REGEX = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const ALLOWED_REQ_HEADERS = [
  "Content-Type",
  "Authorization", 
  "Accept",
  "Origin",
  "X-Requested-With",
  "Cache-Control",
  "cache-control",
  "Pragma",
  "pragma",
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

app.use(cors({
  origin(origin, cb) {
    // Permitir peticiones sin origin (móviles, Postman, curl)
    if (!origin) return cb(null, true);
    
    // Verificar si el origin está permitido
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || ORIGIN_REGEX.test(origin);
    
    if (isAllowed) {
      return cb(null, true);
    } else {
      console.warn(`CORS: Origin no permitido: ${origin}`);
      return cb(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ALLOWED_REQ_HEADERS,
  exposedHeaders: ["Authorization"],
  maxAge: 86400, // Cache del preflight por 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Headers de seguridad
app.use((req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("Vary", "Origin");
  
  // Log para debugging en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  }
  
  next();
});

// Swagger - Configuración segura
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
  console.log("Documentación Swagger cargada correctamente");
} catch (e) {
  console.warn("No se pudo cargar Documentacion.json, usando configuración básica.");
}

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas básicas del sistema
app.get("/test", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente", timestamp: new Date().toISOString() });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    cors: "Configured with full headers support",
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins: ALLOWED_ORIGINS.length,
    allowedHeaders: ALLOWED_REQ_HEADERS.length
  });
});

app.get("/api/cors-info", (req, res) => {
  res.status(200).json({
    allowedOrigins: ALLOWED_ORIGINS,
    allowedHeaders: ALLOWED_REQ_HEADERS,
    requestOrigin: req.headers.origin || null,
    userAgent: req.headers['user-agent'] || null
  });
});

// Rutas de la API - En orden de importancia
app.use("/api/viajes", ViajesRoutes);           // Ruta principal para el mapa
app.use("/api/login", LoginRoutes);             // Autenticación
app.use("/api/logout", LogoutRoutes);
app.use("/api/register", RegisterRoutes);
app.use("/api/recovery", RecoveryRoutes);

// Rutas de recursos principales
app.use("/api/cotizaciones", CotizacionesRoutes);
app.use("/api/clientes", ClientesRoutes);
app.use("/api/register-cliente", RegisterClienteRoutes);
app.use("/api/camiones", camionesRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/motoristas", motoristasRoutes);
app.use("/api/proveedores", proveedoresRoutes);

// Rutas auxiliares
app.use("/api/auto-update", autoUpdateRoutes);

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
  console.error("Error no manejado:", error);
  res.status(500).json({
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === 'production' 
      ? "Algo salió mal en el servidor" 
      : error.message,
    timestamp: new Date().toISOString()
  });
});

// Ruta 404 para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
    method: req.method,
    message: "La ruta solicitada no existe en esta API",
    availableRoutes: [
      "/health",
      "/api/viajes/map-data",
      "/api/login",
      "/api/cotizaciones",
      "/api/clientes"
    ]
  });
});

export default app;