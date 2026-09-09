import { Schema, model } from "mongoose";

const noteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },

    source: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual",
    },
  },
  {
    timestamps: true,
  },
);

const Note = model("Note", noteSchema);

export default Note;
