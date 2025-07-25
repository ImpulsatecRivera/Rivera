import express from "express";
import camionesRoutes from "./src/Routes/camionesRoutes.js"
import empleadoRoutes from "./src/Routes/empleadosRoutes.js"
import motoristasRoutes from "./src/Routes/motoristaRoutes.js"
import proveedoresRoutes from "./src/Routes/proveedoresRoutes.js"
import ClientesRoutes from "./src/Routes/clienteRoutes.js"
import LoginRoutes from "./src/Routes/LoginRoutes.js"
import LogoutRoutes from "./src/Routes/Logout.js" 
import RecoveryRoutes from "./src/Routes/Recovery.js"
import RegisterRoutes from "./src/Routes/RegisterRoute.js"
import ViajesRoutes from "./src/Routes/ViajesRoutes.js"
import cookieParser from "cookie-parser"
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173","http://localhost:5174"], 
    credentials: true, 
  })
);

app.use("/api/camiones", camionesRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/motoristas", motoristasRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/clientes", ClientesRoutes);
app.use("/api/login", LoginRoutes);
app.use("/api/register",RegisterRoutes);
app.use("/api/logout", LogoutRoutes); 
app.use("/api/recovery", RecoveryRoutes);
app.use("/api/viajes", ViajesRoutes);

export default app;
