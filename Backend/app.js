import express from "express";
import camionesRoutes from "./src/Routes/camionesRoutes.js"

const app = express();

app.use("/api/camiones",camionesRoutes);

export default app;
