import express from "express";
import camionesRoutes from "./src/Routes/camionesRoutes.js"
import empleadoRoutes from "./src/Routes/empleadosRoutes.js"
import motoristasRoutes from "./src/Routes/motoristaRoutes.js"
import proveedoresRoutes from "./src/Routes/proveedoresRoutes.js"
import ClientesRoutes from "./src/Routes/clienteRoutes.js"
<<<<<<< HEAD
import LoginRoutes from "./src/Routes/LoginRoutes.js" 
//servicio de auto-actualización
import autoUpdateRoutes from './src/Routes/servicesRouter.js';
=======
import LoginRoutes from "./src/Routes/LoginRoutes.js"
<<<<<<< HEAD
=======
import LogoutRoutes from "./src/Routes/Logout.js" 
import RecoveryRoutes from "./src/Routes/Recovery.js"
>>>>>>> master
>>>>>>> 4706c6c969a93576eb360082769273b31958e9d6

 
import LogoutRoutes from "./src/Routes/Logout.js" // ✅ Renombrado para claridad
import RecoveryRoutes from "./src/Routes/Recovery.js"
 
import RegisterRoutes from "./src/Routes/RegisterRoute.js"
<<<<<<< HEAD
import ViajesRoutes from "./src/Routes/ViajesRoutes.js"
=======
>>>>>>> master
import cookieParser from "cookie-parser"
import cors from "cors";
 
const app = express();
app.use(express.json());
app.use(cookieParser());
 
app.use(
  cors({
    origin: "http://localhost:5173",
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
app.use("/api/logout", LogoutRoutes);
app.use("/api/register",RegisterRoutes);
<<<<<<< HEAD
 
app.use("/api/recovery", RecoveryRoutes);
 
=======
app.use('/api/auto-update', autoUpdateRoutes);
app.use("/api/recovery", RecoveryRoutes);
app.use("/api/viajes", ViajesRoutes);

>>>>>>> 4706c6c969a93576eb360082769273b31958e9d6
export default app;
 
 