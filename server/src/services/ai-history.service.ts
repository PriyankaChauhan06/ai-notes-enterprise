import { Types } from "mongoose";
import AIConversation from "../models/AIConversation";

export async function getAIHistory(userId: string) {
  const conversations = await AIConversation.find({
    userId: new Types.ObjectId(userId),
  })
    .sort({ updatedAt: -1 })
    .limit(50)
    .select("_id messages createdAt updatedAt")
    .lean();

  return conversations.map((conversation) => ({
    _id: conversation._id.toString(),
    messages: conversation.messages,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  }));
}
