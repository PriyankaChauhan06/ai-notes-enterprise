import { Router } from "express";

import {
  createNoteController,
  getNotesController,
  getNoteByIdController,
  updateNoteController,
  deleteNoteController,
} from "../controllers/note.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import {
  createNoteSchema,
  updateNoteSchema,
} from "../utils/validation/note.validation";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.use(authenticate);

router.post(
  "/create",
  validateBody(createNoteSchema),
  asyncHandler(createNoteController),
);

router.get("/fetchAll", asyncHandler(getNotesController));

router.get("/fetch/:id", asyncHandler(getNoteByIdController));

router.patch(
  "/update/:id",
  validateBody(updateNoteSchema),
  asyncHandler(updateNoteController),
);

router.delete("/delete/:id", asyncHandler(deleteNoteController));

export default router;
