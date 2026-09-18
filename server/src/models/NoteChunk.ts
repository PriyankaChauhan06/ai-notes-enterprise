import { Schema, model } from "mongoose";

const noteChunkSchema = new Schema(
  {
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

const NoteChunk = model("NoteChunk", noteChunkSchema);

export default NoteChunk;
