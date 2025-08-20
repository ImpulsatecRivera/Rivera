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
  "https://rivera-project-ecru.vercel.app",    // Prod/preview
  "https://rivera-project-uhuf.vercel.app",    // Otro preview
];

// Regex para permitir otros previews en Vercel si los usas
const ORIGIN_REGEX = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

// Headers de petición permitidos (no pongas Set-Cookie aquí; es de respuesta)
const ALLOWED_REQ_HEADERS = [
  "Content-Type",
  "Authorization",
  "Accept",
  "Origin",
  "X-Requested-With",
];

// CORS principal
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // móviles/curl
      const ok =
        ALLOWED_ORIGINS.includes(origin) || ORIGIN_REGEX.test(origin);
      return ok ? cb(null, true) : cb(new Error("No permitido por CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ALLOWED_REQ_HEADERS,
    exposedHeaders: ["Authorization"], // Set-Cookie no se puede leer en JS
    maxAge: 86400, // cache del preflight
  })
);

// Complemento: fijar headers y Vary: Origin (para respuestas cacheables con origen dinámico)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const ok =
    origin &&
    (ALLOWED_ORIGINS.includes(origin) || ORIGIN_REGEX.test(origin));

  if (ok) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      ALLOWED_REQ_HEADERS.join(", ")
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
  }

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ===================== Seguridad básica =====================
app.use((req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  next();
});

// ===================== Swagger =====================
let swaggerDocument = { openapi: "3.0.0", info: { title: "API", version: "1.0.0" }, paths: {} };
try {
  const raw = fs.readFileSync(path.resolve("./Documentacion.json"), "utf-8");
  swaggerDocument = JSON.parse(raw);
} catch (e) {
  console.warn("⚠️  No se pudo cargar Documentacion.json, usando stub básico.");
}
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ===================== Rutas =====================
app.use("/api/camiones", camionesRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/motoristas", motoristasRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/clientes", ClientesRoutes);
app.use("/api/login", LoginRoutes);
app.use("/api/logout", LogoutRoutes);
app.use("/api/register", RegisterRoutes);
app.use("/api/register-cliente", RegisterClienteRoutes);
app.use("/api/cotizaciones", CotizacionesRoutes);
app.use("/api/recovery", RecoveryRoutes);
app.use("/api/auto-update", autoUpdateRoutes);
app.use("/api/viajes", ViajesRoutes);

// ===================== Health Check =====================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    cors: "Configured",
  });
});

// ===================== Manejo de error CORS =====================
app.use((error, req, res, next) => {
  if (error && error.message === "No permitido por CORS") {
    return res.status(403).json({
      error: "CORS: Origen no permitido",
      origin: req.headers.origin || null,
    });
  }
  next(error);
});

export default app;
