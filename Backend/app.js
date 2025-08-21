// app.js - Optimizado para Express 5.1.0
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import ViajesRoutes from "./src/Routes/ViajesRoutes.js";
import LoginRoutes from "./src/Routes/LoginRoutes.js";
import LogoutRoutes from "./src/Routes/Logout.js";
import RegisterRoutes from "./src/Routes/RegisterRoute.js";
import ClientesRoutes from "./src/Routes/clienteRoutes.js";
import RecoveryRoutes from "./src/Routes/Recovery.js";
import CotizacionesRoutes from "./src/Routes/cotizacionesRoutes.js";
import RegisterClienteRoutes from "./src/Routes/RegisterClienteRouter.js";
import camionesRoutes from "./src/Routes/camionesRoutes.js";
import empleadoRoutes from "./src/Routes/empleadosRoutes.js";
import motoristasRoutes from "./src/Routes/motoristaRoutes.js";
import proveedoresRoutes from "./src/Routes/proveedoresRoutes.js";
import autoUpdateRoutes from "./src/Routes/autoUpdateRoutes.js";

import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const app = express();

// ⭐ importante si estás detrás de proxy (Render/Vercel/NGINX)
app.set("trust proxy", 1);

// Middlewares base
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ====== CORS ======
const ALLOWED_ORIGINS = [
  "https://rivera-project-ecru.vercel.app",
  "https://rivera-project-uhuf.vercel.app"
];

// CORS principal - configuración mejorada para Express 5
const corsOptions = {
  origin: function(origin, callback) {
    // Permitir herramientas/healthchecks sin Origin y requests desde postman
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    // Para desarrollo local, permitir localhost en cualquier puerto
    if (process.env.NODE_ENV !== 'production' && origin && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    return callback(new Error(`CORS: Origen no permitido -> ${origin}`));
  },
  credentials: true, // 🔥 necesario para cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "Cache-Control",
    "Pragma",
    "X-Requested-With"
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // cachea preflight (OPTIONS) 24h
  optionsSuccessStatus: 200 // Para legacy browser support
};

app.use(cors(corsOptions));

// Manejo explícito de preflight OPTIONS para todas las rutas
app.options('*', cors(corsOptions));

// Fallback headers adicionales
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.includes(origin) || 
      (process.env.NODE_ENV !== 'production' && origin.includes('localhost')))) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Vary", "Origin");
  }
  next();
});

// ====== Swagger (opcional) ======
let swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Rivera Project API",
    version: "1.0.0",
    description: "API para gestión de transportes y logística",
  },
  paths: {},
  servers: [
    {
      url:
        process.env.NODE_ENV === "production"
          ? "https://riveraproject-5.onrender.com"
          : "http://localhost:3000",
      description:
        process.env.NODE_ENV === "production"
          ? "Servidor de Producción"
          : "Servidor de Desarrollo",
    },
  ],
};

try {
  const raw = fs.readFileSync(path.resolve("./Documentacion.json"), "utf-8");
  swaggerDocument = JSON.parse(raw);
  console.log("✅ Swagger cargado");
} catch (e) {
  console.warn("⚠️ No se pudo cargar Documentacion.json; usando base mínima.");
}

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ====== Endpoints utilitarios ======
app.get("/", (req, res) => {
  res.json({ 
    message: "Rivera Project API is running",
    status: "OK",
    version: "1.0.0",
    express: "5.1.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/test", (req, res) => {
  res.json({ 
    message: "Test with cookieParser",
    cookies: req.cookies || {},
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    platform: process.env.PLATFORM || 'local'
  });
});

app.get("/api/cors-info", (req, res) => {
  res.status(200).json({
    allowedOrigins: ALLOWED_ORIGINS,
    requestOrigin: req.headers.origin || null,
    userAgent: req.headers["user-agent"] || null,
    credentialsHeader: "true",
    corsEnabled: true
  });
});

// ====== Rutas de la app ======
app.use("/api/viajes", ViajesRoutes);
app.use("/api/login", LoginRoutes);
app.use("/api/logout", LogoutRoutes);
app.use("/api/register", RegisterRoutes);
app.use("/api/clientes", ClientesRoutes);
app.use("/api/recovery", RecoveryRoutes);
app.use("/api/cotizaciones", CotizacionesRoutes);
app.use("/api/register-cliente", RegisterClienteRoutes);
app.use("/api/camiones", camionesRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/motoristas", motoristasRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/auto-update", autoUpdateRoutes);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /test',
      'GET /api/cors-info',
      'POST /api/login',
      'POST /api/register',
      'GET /api/viajes',
      'GET /api/clientes',
      'GET /api/cotizaciones',
      'GET /api/camiones',
      'GET /api/empleados',
      'GET /api/motoristas',
      'GET /api/proveedores'
    ]
  });
});

// ✅ Express 5 maneja mejor las promesas rechazadas automáticamente
// Manejador de errores mejorado para Express 5
app.use((err, req, res, next) => {
  // CORS errors
  if (err?.message?.startsWith("CORS: Origen no permitido")) {
    return res.status(403).json({ 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      timestamp: new Date().toISOString()
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  // MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    return res.status(500).json({
      error: 'Error de base de datos',
      timestamp: new Date().toISOString()
    });
  }
  
  // Generic error
  console.error('❌ Error no manejado:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

export default app;