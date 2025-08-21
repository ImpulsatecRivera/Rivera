// app.js
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
app.use(express.json());
app.use(cookieParser());

// ====== CORS ======
const ALLOWED_ORIGINS = [
  "https://rivera-project-ecru.vercel.app",
  "https://rivera-project-uhuf.vercel.app",
  // agrega tu localhost si lo usas:
  // "http://localhost:5173",
];

// CORS principal
app.use(
  cors({
    origin(origin, cb) {
      // permitir herramientas/healthchecks sin Origin
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: Origen no permitido -> ${origin}`));
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
    ],
    maxAge: 86400, // cachea preflight (OPTIONS) 24h
  })
);

// Fallback headers + preflight (por si algún CDN/proxy es quisquilloso)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, Origin, Cache-Control, Pragma"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.header("Vary", "Origin"); // buenas prácticas de caché
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
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
app.get("/test", (req, res) => {
  res.json({ message: "Test with cookieParser" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/cors-info", (req, res) => {
  res.status(200).json({
    allowedOrigins: ALLOWED_ORIGINS,
    requestOrigin: req.headers.origin || null,
    userAgent: req.headers["user-agent"] || null,
    credentialsHeader: "true",
  });
});

// ====== Rutas de la app (aquí “montas/exportas” tus routers) ======
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

// (opcional) manejador de errores CORS más claro
app.use((err, req, res, next) => {
  if (err?.message?.startsWith("CORS: Origen no permitido")) {
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

export default app;
