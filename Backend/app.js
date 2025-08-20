import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/test", (req, res) => {
  res.json({ message: "Test with cookieParser" });
});

export default app;