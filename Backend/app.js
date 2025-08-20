import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import ViajesRoutes from "./src/Routes/ViajesRoutes.js"

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["https://rivera-project-ecru.vercel.app"],
  credentials: true
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

export default app;