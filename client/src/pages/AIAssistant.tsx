import { useState } from "react";
import { Button, Card, Textarea, Input } from "../components/common/index";
import { useNotesContext } from "../contexts/NotesContext";

interface GeneratedNote {
  title: string;
  description: string;
  category: any;
  tags: string[];
}

function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const { addNote } = useNotesContext();

  function handleGenerate() {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    // Temporary mock AI response.
    // Later this will be replaced by our backend API.
    setTimeout(() => {
      setGeneratedNote({
        title: "",
        description: "",
        category: "React",
        tags: ["React", "Hooks", "Interview"],
      });

      setIsGenerating(false);
    }, 1000);
  }

  function handleSaveNote() {
    if (!generatedNote) {
      return;
    }

    addNote({
      title: generatedNote.title,
      description: generatedNote.description,
      category: generatedNote.category,
      tags: generatedNote.tags,
      source: "ai",
    });

    setGeneratedNote(null);
    setPrompt("");

    alert("Note saved successfully!");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>

        <p className="mt-2 text-gray-500">
          Generate structured notes from a simple prompt.
        </p>
      </div>

      <Card>
        <div className="space-y-6">
          <Textarea
            label="What do you want to create?"
            placeholder="Example: Create interview notes about React hooks..."
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            {isGenerating ? "Generating..." : "Generate Note"}
          </Button>
        </div>
      </Card>

      {generatedNote && (
        <Card className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Generated Note
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review the generated content before saving it.
            </p>
          </div>
          <div className="space-y-5">
            <Input
              label="Title"
              value={generatedNote.title}
              onChange={(e) =>
                setGeneratedNote({
                  ...generatedNote,
                  title: e.target.value,
                })
              }
            />

            <Textarea
              label="Description"
              rows={8}
              value={generatedNote.description}
              onChange={(e) =>
                setGeneratedNote({
                  ...generatedNote,
                  description: e.target.value,
                })
              }
            />

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handleSaveNote}>
                Save Note
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                Regenerate
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AIAssistant;
