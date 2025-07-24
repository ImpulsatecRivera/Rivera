import express from "express";
import camionesRoutes from "./src/Routes/camionesRoutes.js"
import empleadoRoutes from "./src/Routes/empleadosRoutes.js"
import motoristasRoutes from "./src/Routes/motoristaRoutes.js"
import proveedoresRoutes from "./src/Routes/proveedoresRoutes.js"
import ClientesRoutes from "./src/Routes/clienteRoutes.js"
import LoginRoutes from "./src/Routes/LoginRoutes.js"
<<<<<<< HEAD
import LogoutRoutes from "./src/Routes/Logout.js" // ✅ Renombrado para claridad
import RecoveryRoutes from "./src/Routes/Recovery.js"
=======
import LogoutRoutes from "./src/Routes/Logout.js" 
import RecoveryRoutes from "./src/Routes/Recovery.js"
import RegisterRoutes from "./src/Routes/RegisterRoute.js"
>>>>>>> 32c94ab92a55539026f958b94589d7d3bf77a044
import cookieParser from "cookie-parser"
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
<<<<<<< HEAD
    origin: "http://localhost:5173", 
=======
    origin: ["http://localhost:5173","http://localhost:5174"], 
>>>>>>> 32c94ab92a55539026f958b94589d7d3bf77a044
    credentials: true, 
  })
);

app.use("/api/camiones", camionesRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/motoristas", motoristasRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/clientes", ClientesRoutes);
app.use("/api/login", LoginRoutes);
<<<<<<< HEAD
app.use("/api/logout", LogoutRoutes); // ✅ Aquí corregido
=======
app.use("/api/register",RegisterRoutes);
app.use("/api/logout", LogoutRoutes); 
>>>>>>> 32c94ab92a55539026f958b94589d7d3bf77a044
app.use("/api/recovery", RecoveryRoutes);

export default app;
