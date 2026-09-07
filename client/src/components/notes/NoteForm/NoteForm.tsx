import { useEffect, useState } from "react";
import type { NoteFormProps } from "../../../types/note-form-props";
import {
  Input,
  Button,
  Textarea,
} from "../../../components/common/index";

const CATEGORIES = [
  "React",
  "JavaScript",
  "Backend",
  "Database",
  "DevOps",
  "Other",
];

function NoteForm({ onAddNote, editingNote }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
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
      setCategory("Other");
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
    setCategory("Other");
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

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="font-medium text-gray-700">
          Category
        </label>

        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

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
