import express from "express";
<<<<<<< HEAD
import camionesRoutes from "./src/Routes/camionesRoutes.js"
import empleadoRoutes from "./src/Routes/empleadosRoutes.js"
import motoristasRoutes from "./src/Routes/motoristaRoutes.js"
import proveedoresRoutes from "./src/Routes/proveedoresRoutes.js"
import ClientesRoutes from "./src/Routes/clienteRoutes.js"
import RegisterClienteRoutes from "./src/Routes/RegisterClienteRouter.js"
import CotizacionesRoutes from "./src/Routes/cotizacionesRoutes.js"



//servicio de auto-actualización



// ✅ SOLO esta línea para las rutas (sin importar el servicio)
import autoUpdateRoutes from './src/Routes/autoUpdateRoutes.js';








import LoginRoutes from "./src/Routes/LoginRoutes.js" 
//servicio de auto-actualización




 
import LogoutRoutes from "./src/Routes/Logout.js" // ✅ Renombrado para claridad


import RecoveryRoutes from "./src/Routes/Recovery.js"
import RegisterRoutes from "./src/Routes/RegisterRoute.js"




import ViajesRoutes from "./src/Routes/ViajesRoutes.js"




import cookieParser from "cookie-parser"
import cors from "cors";
 
=======
import cookieParser from "cookie-parser";
import cors from "cors";  

// Rutas
import camionesRoutes from "./src/Routes/camionesRoutes.js";
import empleadoRoutes from "./src/Routes/empleadosRoutes.js";
import motoristasRoutes from "./src/Routes/motoristaRoutes.js";
import proveedoresRoutes from "./src/Routes/proveedoresRoutes.js";
import ClientesRoutes from "./src/Routes/clienteRoutes.js";
import LoginRoutes from "./src/Routes/LoginRoutes.js";
import LogoutRoutes from "./src/Routes/Logout.js";
import RecoveryRoutes from "./src/Routes/Recovery.js";
import RegisterRoutes from "./src/Routes/RegisterRoute.js";
import RegisterClienteRoutes from "./src/Routes/RegisterClienteRouter.js";
import CotizacionesRoutes from "./src/Routes/cotizacionesRoutes.js";
import autoUpdateRoutes from './src/Routes/autoUpdateRoutes.js';
import ViajesRoutes from "./src/Routes/ViajesRoutes.js";

>>>>>>> master
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173","http://localhost:5174"],
    credentials: true,
  })
);
<<<<<<< HEAD
 
=======

// ✅ Rutas API
>>>>>>> master
app.use("/api/camiones", camionesRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/motoristas", motoristasRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/clientes", ClientesRoutes);
app.use("/api/login", LoginRoutes);
app.use("/api/logout", LogoutRoutes);
<<<<<<< HEAD
app.use("/api/resgister",RegisterClienteRoutes);
app.use("/api/cotizaciones",CotizacionesRoutes);





 



app.use("/api/recovery", RecoveryRoutes);

// ✅ SOLO esta línea para las rutas
app.use('/api/auto-update', autoUpdateRoutes);

=======
app.use("/api/register", RegisterRoutes);
app.use("/api/register-cliente", RegisterClienteRoutes);
app.use("/api/recovery", RecoveryRoutes);
app.use("/api/cotizaciones", CotizacionesRoutes);
app.use("/api/auto-update", autoUpdateRoutes);
>>>>>>> master
app.use("/api/viajes", ViajesRoutes);

export default app;
