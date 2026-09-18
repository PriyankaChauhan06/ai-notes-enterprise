import { Schema, model } from "mongoose";

const aiConversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
    },

    sources: [
      {
        noteId: {
          type: Schema.Types.ObjectId,
          ref: "Note",
          required: true,
        },

        title: {
          type: String,
          required: true,
        },

        score: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const AIConversation = model("AIConversation", aiConversationSchema);

export default AIConversation;
