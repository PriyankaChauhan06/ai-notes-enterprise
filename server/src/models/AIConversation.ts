import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: false,
    },
  },
  { _id: false },
);

// Only exists when user needs to confirm an action
const pendingActionSchema = new Schema(
  {
    actionType: {
      type: String,
      enum: ["delete_note", "update_note"],
      required: true,
    },

    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },

    updates: {
      title: String,
      description: String,
      category: String,
      tags: [String],
    },
  },
  { _id: false },
);

const aiConversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    messages: {
      type: [messageSchema],
      default: [],
    },

    summary: {
      type: String,
      default: "",
    },

    pendingAction: {
      type: pendingActionSchema,
      default: undefined,
    },
  },
  { timestamps: true },
);

const AIConversation = model("AIConversation", aiConversationSchema);

export default AIConversation;
