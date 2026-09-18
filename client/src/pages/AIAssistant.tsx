import { useState } from "react";
import { Button, Card, Textarea, Input } from "../components/common/index";
import { useNotesContext } from "../contexts/NotesContext";
import { askAI, generateAI } from "../services/ai.service";
import { getApiErrorMessage } from "../utils/api-error";
import type { AINote, AISource } from "../types/ai-assistant.props";

type AIMode = "ask" | "generate";

function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<AIMode>("generate");
  const [response, setResponse] = useState("");
  const [generatedNote, setGeneratedNote] = useState<AINote | null>(null);
  const [sources, setSources] = useState<AISource[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const { addNote } = useNotesContext();

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    const currentPrompt = prompt.trim();

    setError("");
    setResponse("");
    setSources([]);
    setGeneratedNote(null);
    setIsGenerating(true);

    try {
      if (mode === "ask") {
        const result: any = await askAI(currentPrompt);
        setResponse(result.answer);
        setSources(result.sources);
      } else {
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

  function handleModeChange(nextMode: AIMode) {
    if (nextMode === mode) return;

    setMode(nextMode);

    setResponse("");
    setGeneratedNote(null);
    setSources([]);
    setError("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Error }
      {error && (
        <div className="mb-6 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) */}

      {/* Mode Selector / Prompt Composer */}
      <div className="flex justify-end items-center mb-6">
        <div className="border rounded-xl border-gray-200 bg-white w-[-webkit-fill-available] flex items-end gap-3 mr-6 p-2">
          <div className="flex-1">
            <Textarea
              placeholder={
                mode === "ask"
                  ? "Ask something about your notes..."
                  : "What do you want to create?"
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
              className="resize-none border-0 px-2 py-2 shadow-none focus:ring-0 scrollbar-hide"
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

        <div className="border rounded-xl border-gray-200 bg-white min-w-max h-fit p-1">
          <button
            type="button"
            onClick={() => handleModeChange("ask")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
              mode === "ask"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Ask My Notes
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("generate")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
              mode === "generate"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Generate Note
          </button>
        </div>
      </div>

      {/* Scrollable Result Area */}
      <div className="flex items-center overflow-y-auto pr-1 h-[74vh]">
        {/* AI Response */}
        {response && (
          <Card className="mr-4 flex h-full min-h-0 w-full flex-col">
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

            {/* Only Response Scrolls */}
            <div className="min-h-0 flex-1 scrollbar-none overflow-y-auto pr-1">
              <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-5 text-sm leading-7 text-gray-700">
                {response}
              </div>
            </div>
          </Card>
        )}

        {/* Sources — only for RAG */}
        {mode === "ask" && sources.length > 0 && (
          <Card className="flex h-full min-h-0 w-full flex-col">
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
          <Card className="flex flex-col h-full min-h-0 w-full">
            {/* Fixed Header + Actions */}
            <div className="mb-6 shrink-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Generated Note
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Review and edit the generated note before saving it to your
                    knowledge base.
                  </p>
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
