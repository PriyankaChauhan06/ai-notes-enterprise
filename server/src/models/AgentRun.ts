import { Schema, model } from "mongoose";

const toolCallSchema = new Schema(
  {
    toolName: { type: String, required: true },

    risk: {
      type: String,
      enum: ["read", "low_write", "high_write", "destructive"],
      required: true,
    },

    durationMs: { type: Number, required: true },

    success: { type: Boolean, required: true },

    error: { type: String },
  },
  { _id: false },
);

const agentRunSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "AIConversation",
      required: true,
      index: true,
    },

    question: {
      type: String,
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    inputTokens: {
      type: Number,
      default: 0,
    },

    outputTokens: {
      type: Number,
      default: 0,
    },

    totalTokens: {
      type: Number,
      default: 0,
    },

    estimatedCost: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },

    durationMs: {
      type: Number,
      required: true,
    },

    toolCalls: {
      type: [toolCallSchema],
      default: [],
    },

    error: { type: String },
  },
  { timestamps: true },
);

const AgentRun = model("AgentRun", agentRunSchema);

export default AgentRun;
