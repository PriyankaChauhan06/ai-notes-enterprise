import { Router } from "express";

import { createNoteController } from "../controllers/note.controller";

const router = Router();

router.post("/create", createNoteController);

export default router;
