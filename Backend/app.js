import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

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

export default app;