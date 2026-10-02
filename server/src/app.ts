import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import passport from "./config/passport";
import { errorHandler } from "./middlewares/error.middleware";
import apiRoutes from "./routes";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(helmet());

app.use(express.json({ limit: "1mb" }));

app.use(cookieParser());

app.use(passport.initialize());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use("/api", apiRoutes);

app.use(errorHandler);

export default app;
