// app.js - VERSION MINIMA PARA DEBUGGING
import express from "express";

const app = express();

// Solo middleware básico de Express
app.use(express.json());

// Una ruta de prueba simple
app.get("/test", (req, res) => {
  res.json({ message: "Test working" });
});

export default app;