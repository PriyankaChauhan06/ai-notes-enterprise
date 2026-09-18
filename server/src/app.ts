import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import noteRoutes from "./routes/note.routes";
import { errorHandler } from "./middlewares/error.middleware";
import passport from "./config/passport";
import aiRoutes from "./routes/ai.routes";
import searchRoutes from "./routes/search.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/ai", aiRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/note", noteRoutes);
app.use("/api/search", searchRoutes);

app.use(errorHandler);

export default app;
