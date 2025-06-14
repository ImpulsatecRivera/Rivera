import express from "express";
import camionesRoutes from "./src/Routes/camionesRoutes.js"
import empleadoRoutes from "./src/Routes/empleadosRoutes.js"
import motoristasRoutes from "./src/Routes/motoristaRoutes.js"
import proveedoresRoutes from "./src/Routes/proveedoresRoutes.js"
import ClientesRoutes from "./src/Routes/clienteRoutes.js"
import LoginRoutes from "./src/Routes/LoginRoutes.js"
import cookieParser from "cookie-parser"
import Logout from "./src/Routes/Logout.js"


const app = express();
app.use(express.json());
app.use(cookieParser());


app.use("/api/camiones",camionesRoutes);
app.use("/api/empleados",empleadoRoutes);
app.use("/api/motoristas",motoristasRoutes);
app.use("/api/proveedores",proveedoresRoutes);
app.use("/api/clientes",ClientesRoutes);
app.use("/api/Login",LoginRoutes);
app.use("/api/Logout",Logout);

export default app;
