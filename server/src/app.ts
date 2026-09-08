import cors from "cors";
import express from "express";

import noteRoutes from "./routes/note.routes";
import { errorHandler } from "./middlewares/error.middleware";

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

app.use("/api/note", noteRoutes);
app.use(errorHandler);

export default app;
