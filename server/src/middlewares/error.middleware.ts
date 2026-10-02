import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/app-error";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  logger.error(error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  res.status(500).json({ success: false, message: "Internal server error" });
};
