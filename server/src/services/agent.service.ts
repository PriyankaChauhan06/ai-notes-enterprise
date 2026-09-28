import { Types } from "mongoose";
import { openai } from "../config/ai";
import { agentTools } from "../ai/tool";
import { executeTool } from "../ai/executor";
import { AppError } from "../utils/app-error";
import { RunAgentData } from "../types/agent";
import { validateToolAccess } from "../ai/guardrail";
import AIConversation from "../models/AIConversation";
import { validateCreateIntent } from "../ai/action-guard";
import { deleteNote, getNoteById, updateNote } from "./note.service";

const AIModel: any = process.env.AI_MODEL;
const MAX_AGENT_TURNS = 5;
const AGENT_INSTRUCTIONS = `
  You are the AI assistant for a personal knowledge-management application.

  You have tools for searching, reading, creating, updating, and deleting the user's notes.

  Rules:
  - Use search_my_notes when the user's request depends on their saved notes.
  - Use get_note when you need the complete content of a specific note.
  - Use create_note only when the user explicitly asks to create, save, store, or add a note.
  - Use update_note only when the user explicitly asks to modify an existing note.
  - Before preparing an update, use get_note to retrieve the current note.
  - Never execute an update without user confirmation.
  - When preparing an update, preserve unchanged fields from the current note.
  - Use delete_note only when the user explicitly asks to delete a note.
  - Never create a note merely because the user asked for an explanation, summary, or answer.
  - When creating a note from existing notes, retrieve the relevant information first.
  - Never invent information and claim that it came from the user's notes.
  - Do not ask for userId. User ownership is handled by the application.
  - After successfully creating a note, clearly tell the user that it was saved.
  - Use tools only when necessary.
  - After gathering enough information or completing the requested action, provide a clear final response.
`;

const SUMMARIZE_INSTRUCTIONS = `
  Summarize this conversation for future assistant context.

  Keep:
  - important user goals
  - important decisions
  - relevant note names or IDs
  - important preferences mentioned in this conversation
  - unresolved tasks
  - important facts needed for future replies

  Do not add information that is not present.
  Keep the summary concise.
`;

function isConfirmation(question: string) {
  return /^(yes|y|confirm|confirmed|haan|ha|ji)$/i.test(question.trim());
}

function isCancellation(question: string) {
  return /^(no|n|cancel|cancelled|nahi|nahin)$/i.test(question.trim());
}

export async function runAgent({
  userId,
  question,
  conversationId,
}: RunAgentData) {
  let conversation;

  let createdNote;

  let deletedNote: any;

  // Existing conversation
  if (conversationId) {
    conversation = await AIConversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) throw new AppError("Conversation not found", 404);
  } else {
    conversation = await AIConversation.create({ userId, messages: [] });
  }

  /*
   * -------------------------------------------------------
   * HUMAN-IN-THE-LOOP
   * -------------------------------------------------------
   */

  const pendingAction: any = conversation.pendingAction;

  // User confirmed / rejected a pending delete action
  if (pendingAction?.actionType === "delete_note") {
    if (isConfirmation(question)) {
      const noteId = pendingAction.noteId?.toString();

      if (!noteId) {
        conversation.pendingAction = undefined;
        await conversation.save();

        throw new AppError("Pending note deletion is invalid", 400);
      }

      try {
        const note = await deleteNote(userId, noteId);

        const deletedNote = {
          id: note._id.toString(),
          title: note.title,
          description: note.description,
          category: note.category,
          tags: note.tags,
          isFavorite: note.isFavorite,
          source: note.source,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        };

        // Delete the complete AI conversation
        await AIConversation.deleteOne({
          _id: conversation._id,
          userId,
        });

        return {
          conversationId: conversation._id.toString(),
          answer: `Note "${note.title}" has been deleted.`,
          deletedNote,
          conversationDeleted: true,
        };
      } catch (error) {
        conversation.pendingAction = undefined;
        await conversation.save();

        throw error;
      }
    }

    if (isCancellation(question)) {
      conversation.pendingAction = undefined;
      await conversation.save();
      return {
        conversationId: conversation._id.toString(),
        answer: "Okay, I did not delete the note.",
      };
    }

    return {
      conversationId: conversation._id.toString(),
      answer: "Please confirm with Yes or No.",
    };
  }

  // User confirmed / rejected a pending update action
  if (pendingAction?.actionType === "update_note") {
    if (isConfirmation(question)) {
      const noteId = pendingAction.noteId?.toString();

      if (!noteId || !pendingAction.updates) {
        throw new AppError("Pending update data is incomplete", 400);
      }

      const updatedNote = await updateNote(
        userId,
        noteId,
        pendingAction.updates,
      );

      conversation.pendingAction = undefined;

      const answer = `Note "${updatedNote.title}" updated successfully.`;

      conversation.messages.push({
        role: "assistant",
        content: answer,
        noteId: updatedNote._id,
      });

      await conversation.save();

      return {
        conversationId: conversation._id.toString(),
        answer,
        updatedNote: {
          id: updatedNote._id.toString(),
          title: updatedNote.title,
          description: updatedNote.description,
          category: updatedNote.category,
          tags: updatedNote.tags,
          isFavorite: updatedNote.isFavorite,
          source: updatedNote.source,
          createdAt: updatedNote.createdAt,
          updatedAt: updatedNote.updatedAt,
        },
      };
    }

    if (isCancellation(question)) {
      conversation.pendingAction = undefined;
      await conversation.save();
      return {
        conversationId: conversation._id.toString(),
        answer: "Okay, the note was not updated.",
      };
    }

    return {
      conversationId: conversation._id.toString(),
      answer: "Please confirm with Yes or No.",
    };
  }

  /*
   * -------------------------------------------------------
   * NORMAL AGENT FLOW
   * -------------------------------------------------------
   */

  // Previous conversation + current question
  const recentMessages = conversation.messages.slice(-20);

  const input: any[] = [];

  // Save old summary
  if (conversation.summary) {
    input.push({
      role: "user",
      content: `Conversation summary:\n${conversation.summary}`,
    });
  }

  input.push(
    ...recentMessages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  );

  input.push({ role: "user", content: question });

  // Agent loop
  for (let turn = 0; turn < MAX_AGENT_TURNS; turn++) {
    const response = await openai.responses.create({
      model: AIModel,
      instructions: AGENT_INSTRUCTIONS,
      tools: agentTools,
      input,
    });

    // Add model output to current agent context
    input.push(...response.output);

    const toolCalls = response.output.filter(
      (item) => item.type === "function_call",
    );

    // No tool call → final answer
    if (toolCalls.length === 0) {
      const answer = response.output_text;

      // Save current question
      conversation.messages.push({ role: "user", content: question });

      // Save assistant answer
      conversation.messages.push({
        role: "assistant",
        content: answer,

        ...(createdNote?.id && {
          noteId: createdNote.id,
        }),

        ...(deletedNote?.id && {
          noteId: deletedNote.id,
        }),
      });

      await conversation.save();

      return {
        conversationId: conversation._id.toString(),
        answer,
        createdNote,
        deletedNote,
      };
    }

    // Execute requested tools
    for (const toolCall of toolCalls) {
      const args = JSON.parse(toolCall.arguments);

      const risk = validateToolAccess(toolCall.name);
      // console.log('Risk: ', risk);

      if (toolCall.name === "create_note") {
        validateCreateIntent(question);
      }

      try {
        /*
         * ---------------------------------------------------
         * DELETE NOTE
         *
         * Do NOT execute delete immediately.
         * Store it as a pending action first.
         * ---------------------------------------------------
         */

        if (toolCall.name === "delete_note") {
          const noteId = args.noteId;

          conversation.pendingAction = {
            actionType: "delete_note",
            noteId,
          };

          const result: any = await executeTool("get_note", userId, { noteId });

          const confirmationAnswer =
            `I found the note "${result.title}". ` +
            `Are you sure you want to delete it? Please reply with Yes or No.`;

          conversation.messages.push(
            { role: "user", content: question, noteId },
            { role: "assistant", content: confirmationAnswer, noteId },
          );

          await conversation.save();

          return {
            conversationId: conversation._id.toString(),
            answer: confirmationAnswer,
            pendingAction: conversation.pendingAction,
          };
        }

        /*
         * ---------------------------------------------------
         * UPDATE NOTE
         *
         * Do NOT execute update immediately.
         * Store it as a pending action first.
         * ---------------------------------------------------
         */

        if (toolCall.name === "update_note") {
          const noteId = args.noteId;

          if (!Types.ObjectId.isValid(noteId)) {
            throw new Error("Invalid note ID");
          }

          const currentNote = await getNoteById(userId, noteId);

          conversation.pendingAction = {
            actionType: "update_note",
            noteId: currentNote._id,

            updates: {
              title: args.title,
              description: args.description,
              category: args.category,
              tags: args.tags,
            },
          };

          // const answer = [
          //   `I’m ready to update the note "${currentNote.title}".`,
          //   "",
          //   `New title: ${args.title}`,
          //   `New description: ${args.description}`,
          //   `New category: ${args.category}`,
          //   `New tags: ${args.tags.join(", ") || "None"}`,
          //   "",
          //   "Do you want me to apply these changes? Please reply Yes or No.",
          // ].join("\n");

          const answer = `I’m ready to update the note "${currentNote.title}".`;

          conversation.messages.push({ role: "user", content: question });

          conversation.messages.push({
            role: "assistant",
            content: answer,
            noteId: currentNote._id,
          });

          await conversation.save();
          return {
            conversationId: conversation._id.toString(),
            answer,
            pendingAction: conversation.pendingAction,
          };
        }

        /*
         * ---------------------------------------------------
         * OTHER TOOLS
         * ---------------------------------------------------
         */

        const result: any = await executeTool(toolCall.name, userId, args);

        // If create_note tool created a note,
        // keep the created note so we can return it to the frontend.
        if (toolCall.name === "create_note") {
          createdNote = result?.note;
        }

        // Send tool result back to the model
        input.push({
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: JSON.stringify(result),
        });
      } catch (error) {
        // Send tool error back to the model
        input.push({
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: JSON.stringify({
            error:
              error instanceof Error ? error.message : "Tool execution failed",
          }),
        });
      }
    }
  }

  throw new AppError("AI agent reached its maximum tool-call limit", 503);
}

async function generateConversationSummary(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
) {
  const response = await openai.responses.create({
    model: AIModel,
    instructions: SUMMARIZE_INSTRUCTIONS,
    input: messages.map((msg) => ({ role: msg.role, content: msg.content })),
  });

  return response.output_text;
}
