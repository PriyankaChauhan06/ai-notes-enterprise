import { useEffect, useRef, useState } from "react";
import { askAI, generateAI, getAIHistory } from "../services/ai.service";
import { formatCost, formatTokens } from "../utils/helpers";
import { useNotesContext } from "../contexts/NotesContext";
import type { AnalyticsRange } from "../types/analytics";
import { getApiErrorMessage } from "../utils/api-error";
import { ANALYTICS } from "../constants/analytics";
import useAgentAnalytics from "../hooks/useAgentAnalytics";
import useAgentRuns from "../hooks/useAgentRuns";
import type {
  AIConversation,
  AINote,
  AISource,
  AskAIResult,
} from "../types/ai-assistant.props";
import {
  Button,
  Card,
  Textarea,
  Input,
  Dialog,
  Select,
} from "../components/common/index";

type AIMode = "ask" | "generate";
type PendingAction = NonNullable<AskAIResult["pendingAction"]>;

function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<AIMode>("generate");
  const [response, setResponse] = useState("");
  const [generatedNote, setGeneratedNote] = useState<AINote | null>(null);
  const [sources, setSources] = useState<AISource[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<AIConversation[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [error, setError] = useState("");
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAnalyticsSectionOpen, setIsAnalyticsSectionOpen] = useState(true);
  const [isToolUsageOpen, setIsToolUsageOpen] = useState(false);
  const [aIRundOpen, setAIRundOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const { addNote, addNoteToState, updateNoteInState, removeNoteFromState } =
    useNotesContext();

  const {
    analytics,
    analyticsRange,
    isAnalyticsLoading,
    analyticsError,
    loadAnalytics,
    changeAnalyticsRange,
  } = useAgentAnalytics();

  const {
    runs,
    isLoading: isRunsLoading,
    error: runsError,
    loadRuns,
  } = useAgentRuns();

  error && console.error("AIAssistant Error: ", error);

  useEffect(() => {
    async function loadHistory() {
      setIsHistoryLoading(true);
      try {
        const result = await getAIHistory();

        const sortedHistory = [...result].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        setHistory(sortedHistory);
      } catch (error) {
        console.error("Failed to load AI history:", error);
      } finally {
        setIsHistoryLoading(false);
      }
    }

    loadHistory();
    loadAnalytics();
  }, []);

  function getConversation(conversationId: string | null) {
    if (!conversationId) return null;

    return (
      history.find((conversation) => conversation._id === conversationId) ??
      null
    );
  }

  function getConversationTitle(conversation: AIConversation) {
    const firstUserMessage = conversation.messages.find(
      (message) => message.role === "user",
    );

    if (!firstUserMessage) {
      return "New Chat";
    }

    const title = firstUserMessage.content.trim();

    return title.length > 45 ? `${title.slice(0, 45)}...` : title;
  }

  async function handleGenerate() {
    if (!prompt.trim() || isGenerating) return;

    const currentPrompt = prompt.trim();

    setError("");
    setResponse("");
    setSources([]);
    setGeneratedNote(null);
    setIsGenerating(true);

    try {
      if (mode === "ask") {
        const result = await askAI({
          question: currentPrompt,
          conversationId,
        });

        // If AI created a note, immediately add it to NotesContext
        if (result.createdNote) {
          addNoteToState(result.createdNote);
        }

        if (result.deletedNote) {
          removeNoteFromState(result.deletedNote.id);
        }

        if (result.updatedNote) {
          updateNoteInState(result.updatedNote);
        }

        if (result.conversationDeleted) {
          setHistory((currentHistory) =>
            currentHistory.filter(
              (conversation) => conversation._id !== result.conversationId,
            ),
          );

          setConversationId(null);
        } else {
          applyAgentResult(result);
        }

        // applyAgentResult(result);
        await loadAnalytics(analyticsRange);
        await loadRuns();

        // Update history immediately without refreshing
        updateConversationHistory(
          result.conversationId,
          currentPrompt,
          result.answer,
        );
      } else {
        setConversationId(null);
        setResponse("");
        setSources([]);
        setGeneratedNote(null);
        setPendingAction(null);
        setError("");

        const result = await generateAI(currentPrompt);
        setResponse(result.response);
        setGeneratedNote(result.note);
      }
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveNote() {
    if (!generatedNote) return;

    if (!generatedNote.title.trim() || !generatedNote.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await addNote({
        title: generatedNote.title.trim(),
        description: generatedNote.description.trim(),
        category: generatedNote.category.trim(),
        tags: generatedNote.tags,
        source: "ai",
      });

      setGeneratedNote(null);
      setResponse("");
      setPrompt("");
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRegenerate() {
    if (!prompt.trim()) {
      setError("Enter a prompt first.");
      return;
    }

    await handleGenerate();
  }

  async function handleCopy() {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(response);
    } catch {
      setError("Unable to copy response.");
    }
  }

  async function handleConfirmAction() {
    if (!conversationId || !pendingAction) return;

    setError("");
    setIsGenerating(true);

    try {
      const result = await askAI({ question: "Yes", conversationId });

      if (result.updatedNote) {
        updateNoteInState(result.updatedNote);
      }

      if (result.deletedNote) {
        removeNoteFromState(result.deletedNote.id);
      }

      // applyAgentResult(result);
      await loadAnalytics(analyticsRange);
      await loadRuns();

      if (result.conversationDeleted) {
        setHistory((currentHistory) =>
          currentHistory.filter(
            (conversation) => conversation._id !== result.conversationId,
          ),
        );

        setConversationId(null);
        setPendingAction(null);
        setResponse("");
        setSources([]);
        setPrompt("");
      } else {
        applyAgentResult(result);

        updateConversationHistory(
          result.conversationId,
          undefined,
          result.answer,
        );
      }
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCancelAction() {
    if (!conversationId || !pendingAction) return;

    setError("");
    setIsGenerating(true);

    try {
      const result = await askAI({ question: "No", conversationId });

      applyAgentResult(result);
      await loadAnalytics(analyticsRange);
      await loadRuns();

      updateConversationHistory(
        result.conversationId,
        undefined,
        result.answer,
      );
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  }

  function handleModeChange(nextMode: AIMode) {
    if (nextMode === mode) return;

    setMode(nextMode);

    // Reset current chat
    setConversationId(null);

    // Reset prompt and generated content
    setPrompt("");
    setResponse("");
    setGeneratedNote(null);
    setSources([]);
    setPendingAction(null);
    setError("");
  }

  function handleNewChat() {
    setConversationId(null);
    setPrompt("");
    setResponse("");
    setSources([]);
    setGeneratedNote(null);
    setPendingAction(null);
    setError("");
  }

  function updateConversationHistory(
    conversationId: string,
    userMessage?: string,
    assistantMessage?: string,
  ) {
    setHistory((currentHistory) => {
      const existingConversation = currentHistory.find(
        (conversation) => conversation._id === conversationId,
      );

      if (existingConversation) {
        const updatedConversation: AIConversation = {
          ...existingConversation,
          messages: [
            ...existingConversation.messages,
            ...(userMessage
              ? [
                  {
                    role: "user" as const,
                    content: userMessage,
                  },
                ]
              : []),
            ...(assistantMessage
              ? [
                  {
                    role: "assistant" as const,
                    content: assistantMessage,
                  },
                ]
              : []),
          ],
          updatedAt: new Date().toISOString(),
        };

        return [
          updatedConversation,
          ...currentHistory.filter(
            (conversation) => conversation._id !== conversationId,
          ),
        ];
      }

      const now = new Date().toISOString();

      const newConversation: AIConversation = {
        _id: conversationId,
        messages: [
          ...(userMessage
            ? [
                {
                  role: "user" as const,
                  content: userMessage,
                },
              ]
            : []),
          ...(assistantMessage
            ? [
                {
                  role: "assistant" as const,
                  content: assistantMessage,
                },
              ]
            : []),
        ],
        createdAt: now,
        updatedAt: now,
      };

      return [newConversation, ...currentHistory];
    });
  }

  function applyAgentResult(result: AskAIResult) {
    setResponse(result.answer);
    setSources(result.sources ?? []);
    setPendingAction(result?.pendingAction ?? null);
    if (result.conversationId) {
      setConversationId(result.conversationId);
    }
  }

  const selectedConversation = getConversation(conversationId);

  useEffect(() => {
    if (mode !== "ask" || !selectedConversation) return;

    chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
  }, [conversationId, selectedConversation?.messages.length, mode]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Error }
      {error && (
        <div className="mb-5 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) */}

      {/* Mode Selector / Prompt Composer */}
      <div className="flex justify-end items-center mb-5">
        <div className="border rounded-xl border-gray-200 bg-white w-[-webkit-fill-available] flex items-end gap-3 p-2">
          <div className="flex-1">
            <Textarea
              placeholder={
                mode === "ask"
                  ? "Ask something about your notes..."
                  : "Ask Anything"
              }
              rows={1}
              value={prompt}
              disabled={isGenerating}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();

                  if (!isGenerating && prompt.trim()) {
                    handleGenerate();
                  }
                }
              }}
              className="resize-none border-0 px-2 py-2 shadow-none focus:ring-0 scrollbar-hide pl-1"
            />
          </div>

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="shrink-0"
          >
            {isGenerating ? "..." : mode === "ask" ? "Ask" : "Generate"}
          </Button>
        </div>

        <div className="border rounded-xl border-gray-200 bg-white min-w-max h-fit p-1 mx-5">
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => handleModeChange("ask")}
            className={`rounded-lg px-5 py-3 text-sm font-medium transition ${
              mode === "ask"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Ask My Notes
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={() => handleModeChange("generate")}
            className={`rounded-lg px-5 py-3 text-sm font-medium transition ${
              mode === "generate"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Generate Note
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsAnalyticsOpen(true)}
            title="click to Show Analytics"
            className="rounded-xl font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-7 w-7"
            >
              <rect x="3" y="3" width="7.5" height="7.5" rx="1" />
              <rect x="14" y="3" width="7.5" height="7.5" rx="1" />
              <rect x="3" y="14" width="7.5" height="7.5" rx="1" />
              <rect x="14" y="14" width="7.5" height="7.5" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Analytics Dialog */}
      <Dialog
        open={isAnalyticsOpen}
        title="AI Analytics"
        onClose={() => setIsAnalyticsOpen(false)}
        scrollable
      >
        <div className="space-y-4">
          {/* Time Range */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">Time Range</p>

            <Select
              value={analyticsRange ?? "all"}
              onChange={(e) => {
                const value = e.target.value;

                const nextRange: AnalyticsRange | undefined =
                  value === "all" ? undefined : (value as AnalyticsRange);

                changeAnalyticsRange(nextRange);
              }}
              disabled={isAnalyticsLoading}
              options={ANALYTICS}
            />
          </div>

          {/* Analytics Content */}
          {isAnalyticsLoading ? (
            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500">
              Loading analytics...
            </div>
          ) : analyticsError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {analyticsError}
            </div>
          ) : analytics ? (
            <div className="space-y-3">
              {/* Analytics Accordion */}
              <div className="rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() =>
                    setIsAnalyticsSectionOpen((current) => !current)
                  }
                  className="flex w-full items-center justify-between px-4 py-3 text-left bg-gray-100 rounded-tl-lg rounded-tr-lg"
                >
                  <span className="text-sm font-semibold">Analytics</span>

                  <span className="text-lg leading-none">
                    {isAnalyticsSectionOpen ? "−" : "+"}
                  </span>
                </button>

                {isAnalyticsSectionOpen && (
                  <div className="border-t border-gray-200 px-4 py-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Total Runs
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {analytics.totalRuns}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Successful
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {analytics.successfulRuns}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Failed</span>

                        <span className="text-sm font-medium text-gray-900">
                          {analytics.failedRuns}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Average Duration
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(analytics.averageDurationMs)} ms
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Input Tokens
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {formatTokens(analytics.totalInputTokens)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Output Tokens
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {formatTokens(analytics.totalOutputTokens)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Total Tokens
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {formatTokens(analytics.totalTokens)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Estimated Cost
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {formatCost(analytics.totalEstimatedCost)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Total Tool Calls
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {analytics.totalToolCalls}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tool Usage Accordion */}
              <div className="rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsToolUsageOpen((current) => !current)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left bg-gray-100 rounded-tl-lg rounded-tr-lg"
                >
                  <span className="text-sm font-semibold">Tool Usage</span>

                  <span className="text-lg leading-none">
                    {isToolUsageOpen ? "−" : "+"}
                  </span>
                </button>

                {isToolUsageOpen && (
                  <div className="border-t border-gray-200 px-4 py-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Search My Notes
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {analytics.toolUsage.search_my_notes}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Get Note</span>

                        <span className="text-sm font-medium text-gray-900">
                          {analytics.toolUsage.get_note}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Create Note
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {analytics.toolUsage.create_note}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Update Note
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {analytics.toolUsage.update_note}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Delete Note
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          {analytics.toolUsage.delete_note}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent AI Runs */}
              <div className="rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setAIRundOpen((current) => !current)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left bg-gray-100 rounded-tl-lg rounded-tr-lg"
                >
                  <span className="text-sm font-semibold">Recent AI Runs</span>

                  <span className="text-lg leading-none">
                    {aIRundOpen ? "−" : "+"}
                  </span>
                </button>

                {aIRundOpen && (
                  <div className="border-t border-gray-200 p-3">
                    {isRunsLoading ? (
                      <p className="text-sm text-gray-500">Loading runs...</p>
                    ) : runsError ? (
                      <p className="text-sm text-red-600">{runsError}</p>
                    ) : runs.length === 0 ? (
                      <p className="text-sm text-gray-500">No AI runs yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {runs.slice(0, 10).map((run) => (
                          <div
                            key={run.id}
                            className="rounded-lg border border-gray-200 p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="min-w-0 truncate text-sm font-medium text-gray-800">
                                {run.question}
                              </p>

                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                                  run.status === "success"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {run.status}
                              </span>
                            </div>

                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <span>{run.model}</span>

                              <span>{Math.round(run.durationMs)} ms</span>

                              <span>
                                {formatTokens(run.totalTokens)} tokens
                              </span>

                              <span className="mr-1">
                                {formatCost(run.estimatedCost)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </Dialog>

      {/* Scrollable Result Area */}
      <div className="flex items-start scrollbar-none overflow-y-auto pr-1">
        {/* All Chats */}
        <Card className="flex h-full min-h-0 w-52 flex-col scrollbar-none p-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleNewChat}
            disabled={isGenerating}
            className="mb-3"
          >
            New
          </Button>

          {isHistoryLoading ? (
            <p className="text-sm text-gray-500">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-500">No chats yet.</p>
          ) : (
            <div className="space-y-3 scrollbar-none overflow-auto w-[-webkit-fill-available]">
              {history?.map((conversation) => {
                const conversationTitle = getConversationTitle(conversation);
                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => {
                      setMode("ask");
                      setConversationId(conversation._id);
                      setPrompt("");
                      setResponse("");
                      setSources([]);
                      setGeneratedNote(null);
                      setPendingAction(null);
                      setError("");
                    }}
                    className={`w-full rounded-lg border p-2 text-left transition ${
                      conversation._id === conversationId
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <p
                      className="truncate text-sm font-medium text-gray-800"
                      title={conversationTitle}
                    >
                      {conversationTitle}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(conversation.updatedAt).toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* AI Response */}
        {(response || selectedConversation?.messages?.length) && (
          <Card className="flex h-full min-h-0 w-full flex-col ml-5">
            {/* Fixed Header */}
            <div className="mb-5 shrink-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      AI Response
                    </h2>

                    {mode === "ask" && (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        Based on your notes
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    {mode === "ask"
                      ? "Generated using your notes as context."
                      : "Generated by the AI assistant."}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  Copy
                </Button>
              </div>
            </div>

            {mode === "ask" && selectedConversation && (
              <div className="min-h-0 flex-1 space-y-4 scrollbar-none overflow-y-auto pr-1">
                {selectedConversation.messages.map((message, index) => (
                  <div
                    key={`${selectedConversation._id}-${index}`}
                    className={`rounded-lg p-4 ${
                      message.role === "user" ? "bg-blue-50" : "bg-gray-50"
                    }`}
                  >
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      {message.role === "user" ? "You" : "AI"}
                    </p>

                    <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                      {message.content}
                    </p>
                  </div>
                ))}

                {/* Auto-scroll target */}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Only Response Scrolls */}
            {mode === "generate" && response && (
              <div className="min-h-0 flex-1 scrollbar-none overflow-y-auto pr-1">
                <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-5 text-sm leading-7 text-gray-700">
                  {response}
                </div>
              </div>
            )}
          </Card>
        )}

        <Dialog
          open={Boolean(pendingAction)}
          title="Confirm action"
          onClose={handleCancelAction}
          scrollable
        >
          <div className="space-y-5">
            {/* Action description */}
            <div>
              <p className="text-sm text-gray-500">
                Are you sure you want to{" "}
                {pendingAction?.actionType === "delete_note"
                  ? "delete this note?"
                  : "update this note?"}
              </p>
            </div>

            {/* Update details */}
            {pendingAction?.actionType === "update_note" &&
              pendingAction.updates && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-800">
                    Proposed changes
                  </p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Title</p>
                      <p className="mt-1 text-gray-800">
                        {pendingAction.updates.title}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Category
                      </p>
                      <p className="mt-1 text-gray-800">
                        {pendingAction.updates.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500">Tags</p>
                      <p className="mt-1 text-gray-800">
                        {pendingAction.updates.tags?.join(", ") || "None"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelAction}
                disabled={isGenerating}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleConfirmAction}
                disabled={isGenerating}
              >
                {isGenerating ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Sources — only for RAG */}
        {mode === "ask" && sources?.length > 0 && (
          <Card className="flex h-full min-h-0 w-full flex-col ml-5">
            {/* Fixed Header */}
            <div className="mb-5 shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">Sources</h2>

              <p className="mt-1 text-sm text-gray-500">
                These notes were used to generate the answer.
              </p>
            </div>

            {/* Only Sources Scroll */}
            <div className="min-h-0 flex-1 scrollbar-none overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-2">
                {sources.map((source) => (
                  <div
                    key={source.noteId}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <p className="text-sm font-semibold text-gray-800">
                      {source.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {source.category}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Generated Note — only for Generate mode */}
        {mode === "generate" && generatedNote && (
          <Card className="flex flex-col h-full min-h-0 w-full ml-5">
            {/* Fixed Header + Actions */}
            <div className="mb-5 shrink-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Generated Note
                  </h2>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={
                      isSaving ||
                      !generatedNote.title.trim() ||
                      !generatedNote.description.trim()
                    }
                  >
                    {isSaving ? "Saving..." : "Save Note"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRegenerate}
                    disabled={isGenerating || isSaving || !prompt.trim()}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>

            {/* Only Note Content Scrolls */}
            <div className="min-h-0 flex-1 scrollbar-none overflow-y-auto pr-1">
              <div className="space-y-5">
                {/* Title */}
                <Input
                  label="Title"
                  value={generatedNote.title}
                  disabled={isSaving}
                  onChange={(e) =>
                    setGeneratedNote({
                      ...generatedNote,
                      title: e.target.value,
                    })
                  }
                />

                {/* Description */}
                <Textarea
                  label="Description"
                  rows={8}
                  value={generatedNote.description}
                  disabled={isSaving}
                  onChange={(e) =>
                    setGeneratedNote({
                      ...generatedNote,
                      description: e.target.value,
                    })
                  }
                />

                {/* Category */}
                <Input
                  label="Category"
                  value={generatedNote.category}
                  disabled={isSaving}
                  onChange={(e) =>
                    setGeneratedNote({
                      ...generatedNote,
                      category: e.target.value,
                    })
                  }
                />

                {/* Tags */}
                <Input
                  label="Tags"
                  value={generatedNote.tags.join(", ")}
                  disabled={isSaving}
                  onChange={(e) =>
                    setGeneratedNote({
                      ...generatedNote,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AIAssistant;
