import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
     message: "AI Notes API is running",
  });
});

export default app;
