import express from "express";
import camionesRoutes from "./src/Routes/camionesRoutes.js"
import empleadoRoutes from "./src/Routes/empleadosRoutes.js"
import motoristasRoutes from "./src/Routes/motoristaRoutes.js"
import proveedoresRoutes from "./src/Routes/proveedoresRoutes.js"

const app = express();
app.use(express.json());

app.use("/api/camiones",camionesRoutes);
app.use("/api/empleados",empleadoRoutes);
app.use("/api/motoristas",motoristasRoutes);
app.use("/api/proveedores",proveedoresRoutes);

export default app;
