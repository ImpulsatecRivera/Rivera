import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import ViajesRoutes from "./src/Routes/ViajesRoutes.js"
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

const app = express();

//comentRIO PARA COMMI 
//pruerba verce
//djsjdjsj

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "https://rivera-project-ecru.vercel.app",
    "https://rivera-project-uhuf.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
   allowedHeaders: [
    "Content-Type",
    "Authorization", 
    "Accept",
    "Origin",
    "Cache-Control",
    "cache-control", 
    "Pragma",
    "pragma"
  ]
}));

app.get("/test", (req, res) => {
  res.json({ message: "Test with cookieParser" });
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

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

export default app;