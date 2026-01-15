import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // ✅ FALTA ESTA LÍNEA


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
import callRoutes from "./src/Routes/callRoutes.js";

import MantoRouter from "./src/Routes/MantenimientoRoutes.js";
import Reportesroutes from "./src/Routes/ReportesRoutes.js";
import ResumenRoutes from "./src/Routes/ResumenDieselRoutes.js";
import ResumenDieselReporte from "./src/Routes/ResumenReportesRoutes.js";

import cajachicaRoutes from "./src/Routes/cajaChicaRoutes.js";
import reportesCajaChicaRoutes from "./src/Routes/ReportesCajaChicaRoutes.js";
import CajaChicaConfigRoutes from "./src/Routes/CajaChicaConfigRoutes.js";

import PlanillaQuincenalRoutes from "./src/Routes/PlanillaQuincenalRoutes.js";
import ReportesPlanillaQuincenalRoutes from "./src/Routes/ReportesPlanillaQuincenalRoutes.js";

import PlanillaSemanalRoutes from "./src/Routes/PlanillaSemanalRoutes.js";
import ReportesPlanillaSemanalRoutes from "./src/Routes/ReportesPlanillaSemanalRoutes.js";

// ✅ Rutas nuevas que venían en master
import viajesOperativosRoutes from "./src/Routes/ViajesOperativosRoutes.js";
import reportesViajesDirectoRoutes from "./src/Routes/ReportesViajesDirectoRoutes.js";
import ReporteViajesYGastosSemanalesRoutes from "./src/Routes/ReporteViajesYGastosSemanales.js";
import ReportesGastosMesRoutes from "./src/Routes/ReportesGastosMesRoutes.js";

//Nuevo: reporte consolidado
import ReporteConsolidadoRoutes from "./src/Routes/Reporteconsolidadoroutes.js";

import { validateAuthToken } from "./src/Middlewares/validateAuthToken.js";
// (si luego usas swagger en tu proyecto)


const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "https://rivera-test.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // requests sin origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "Cache-Control",
      "Pragma",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);

// 👇 ESTO ES CLAVE EN CLOUD RUN
app.options("*", cors());


app.get("/test", (req, res) => {
  res.json({ message: "Test with cookieParser" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/public", express.static(path.join(__dirname, "public")));

// -------------------- ROUTES --------------------
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

app.use("/api/cajaChica", cajachicaRoutes);
app.use("/api/cajaChicaConfig", CajaChicaConfigRoutes);
app.use("/api/reportesCajaChica", reportesCajaChicaRoutes);
app.use("/api/planillas/quincenal",  PlanillaQuincenalRoutes);
app.use("/api/reportes/planilla/quincenal", validateAuthToken(["admin"]), ReportesPlanillaQuincenalRoutes);

app.use("/api/planillas/semanal",PlanillaSemanalRoutes);
app.use("/api/reportes/planilla/semanal",validateAuthToken(["admin"]), ReportesPlanillaSemanalRoutes);

app.use("/api/auto-update", autoUpdateRoutes);
app.use("/api/call", callRoutes);

app.use("/api/mantenimientos", MantoRouter);
app.use("/api/reporte", Reportesroutes);
app.use("/api/resumen", ResumenRoutes);
app.use("/api/resumenReporte", ResumenDieselReporte);

// ✅ nuevas
app.use("/api/viajes-operativos", viajesOperativosRoutes);
app.use("/api/reportes-directos", reportesViajesDirectoRoutes);
app.use("/api/reporte/viajesGastos", ReporteViajesYGastosSemanalesRoutes);
app.use("/api/reporte/gastosMes", ReportesGastosMesRoutes);

// Nuevo: reporte consolidado
app.use("/api/reporte-consolidado", ReporteConsolidadoRoutes);

export default app;
