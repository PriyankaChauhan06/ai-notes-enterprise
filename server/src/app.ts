import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import passport from "./config/passport";

import { errorHandler } from "./middlewares/error.middleware";
import apiRoutes from "./routes";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api", apiRoutes);

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use(errorHandler);

export default app;
