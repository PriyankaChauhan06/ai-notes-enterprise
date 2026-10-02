import { Router } from "express";

import authRoutes from "./auth.routes";
import noteRoutes from "./note.routes";
import aiRoutes from "./ai.routes";
import searchRoutes from "./search.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/note", noteRoutes);
router.use("/ai", aiRoutes);
router.use("/search", searchRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

export default router;
