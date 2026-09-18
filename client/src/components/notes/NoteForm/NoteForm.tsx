import { useEffect, useState } from "react";
import type { NoteFormProps } from "../../../types/note-form-props";
import { Input, Button, Textarea } from "../../../components/common/index";

function NoteForm({ onAddNote, editingNote }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setDescription(editingNote.description);
      setCategory(editingNote.category);
      setTagsInput(editingNote.tags?.join(", "));
    } else {
      setTitle("");
      setDescription("");
      setCategory("");
      setTagsInput("");
    }
  }, [editingNote]);

  function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      alert("Please fill all fields");
      return;
    }

    const tags = tagsInput
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onAddNote(title.trim(), description.trim(), category, tags);

    setTitle("");
    setDescription("");
    setCategory("");
    setTagsInput("");
  }

  return (
    <div className="space-y-5">
      <Input
        label="Title"
        placeholder="Enter note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Textarea
        label="Description"
        placeholder="Write your note..."
        rows={7}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Input
        label="category"
        placeholder="react, JavaScript, DevOps, Database, Security, Auth"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <Input
        label="Tags"
        placeholder="react, hooks, interview"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
      />

      <p className="text-xs text-gray-500">
        Separate multiple tags with commas.
      </p>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSubmit}>
          {editingNote ? "Update Note" : "Add Note"}
        </Button>
      </div>
    </div>
  );
}

export default NoteForm;
