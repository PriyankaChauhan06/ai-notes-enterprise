import { useMemo, useState } from "react";
import { Button, Card, Dialog, Input } from "../components/common/index";
import type { Note } from "../types/note";
import NoteForm from "../components/notes/NoteForm/NoteForm";
import { useNotesContext } from "../contexts/NotesContext";

const categories = ["all", "React", "Backend", "JavaScript", "DevOps"];

function Notes() {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const { notes, addNote, updateNote, deleteNote, toggleFavorite } =
    useNotesContext();

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };

  const handleSaveNote = (
    title: string,
    description: string,
    category: string,
    tags: string[],
  ) => {
    if (editingNote) {
      updateNote({
        ...editingNote,
        title,
        description,
        category,
        tags,
      });
    } else {
      addNote({
        title,
        description,
        category,
        tags,
        source: "manual",
      });
    }

    setIsNoteDialogOpen(false);
    setEditingNote(null);
  };

  const filteredNotes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return notes.filter((note) => {
      const matchesSearch =
        !normalizedSearch ||
        note.title.toLowerCase().includes(normalizedSearch) ||
        note.description.toLowerCase().includes(normalizedSearch) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      const matchesFavorite = !showFavoritesOnly || note.isFavorite;

      const matchesCategory =
        selectedCategory === categories[0] ||
        note.category === selectedCategory;

      return matchesSearch && matchesFavorite && matchesCategory;
    });
  }, [notes, searchTerm, showFavoritesOnly, selectedCategory]);

  return (
    <>
      <div>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notes</h1>

            <p className="mt-2 text-gray-500">
              Create, organize and manage your notes.
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingNote(null);
              setIsNoteDialogOpen(true);
            }}
          >
            + New Note
          </Button>
        </div>

        <Card className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex w-full mr-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 mr-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <Input
                placeholder="Search notes..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-lg"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Favorites
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={showFavoritesOnly}
                onClick={() => setShowFavoritesOnly((current) => !current)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showFavoritesOnly ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                    showFavoritesOnly ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 max-h-[60vh] overflow-x-hidden overflow-y-auto custom-scrollbar">
          {filteredNotes.map((note) => (
            <Card key={note.id}>
              <h3 className="text-lg font-semibold">{note.title}</h3>

              <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                {note.description}
              </p>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleEditNote(note)}
                >
                  Edit
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => toggleFavorite(note.id)}
                >
                  {note.isFavorite ? "⭐ Unfavorite" : "☆ Favorite"}
                </Button>

                <Button
                  variant="danger"
                  onClick={() => {
                    deleteNote(note.id);

                    if (editingNote?.id === note.id) {
                      setEditingNote(null);
                      setIsNoteDialogOpen(false);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Dialog
          open={isNoteDialogOpen}
          title={editingNote ? "Edit Note" : "Create Note"}
          onClose={() => {
            setIsNoteDialogOpen(false);
            setEditingNote(null);
          }}
        >
          <NoteForm editingNote={editingNote} onAddNote={handleSaveNote} />
        </Dialog>
      </div>
    </>
  );
}

export default Notes;
