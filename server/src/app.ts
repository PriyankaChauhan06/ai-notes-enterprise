import cors from "cors";
import express from "express";

import noteRoutes from "./routes/note.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use("/api", noteRoutes);

export default app;
