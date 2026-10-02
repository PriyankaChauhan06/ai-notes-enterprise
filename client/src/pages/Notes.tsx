import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Dialog,
  Input,
  Select,
} from "../components/common/index";
import type { Note } from "../types/note";
import NoteForm from "../components/notes/NoteForm/NoteForm";
import { useNotesContext } from "../contexts/NotesContext";

function Notes() {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { notes, categories, addNote, updateNote, deleteNote, toggleFavorite } =
    useNotesContext();

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };

  const handleSaveNote = async (
    title: string,
    description: string,
    category: string,
    tags: string[],
  ) => {
    try {
      if (editingNote) {
        await updateNote({
          ...editingNote,
          title,
          description,
          category,
          tags,
        });
      } else {
        await addNote({
          title,
          description,
          category,
          tags,
          source: "manual",
        });
      }

      setIsNoteDialogOpen(false);
      setEditingNote(null);
    } catch (error) {
      console.error("Failed to save note:", error);
    }
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

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between mb-5">
          <Card className="w-[-webkit-fill-available] mr-5 p-3">
            <div className="flex justify-between items-center">
              <div className="flex w-full mr-4">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={categories.map((category) => ({
                    label: category,
                    value: category,
                  }))}
                  className="mr-4 w-40"
                />

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

          <Button
            onClick={() => {
              setEditingNote(null);
              setIsNoteDialogOpen(true);
            }}
            className="min-w-max"
          >
            + New Note
          </Button>
        </div>

        {/* Notes */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="grid grid-cols-1 gap-5 pb-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="flex flex-col h-52.5">
                <h3 className="text-lg font-semibold">{note.title}</h3>

                <p className="mt-2 line-clamp-4 text-sm text-gray-600">
                  {note.description}
                </p>

                <div className="mt-auto flex gap-2">
                  {/* Edit */}
                  <Button
                    variant="secondary"
                    onClick={() => handleEditNote(note)}
                  >
                    Edit
                  </Button>

                  {/* Favorite */}
                  <Button
                    variant="secondary"
                    onClick={() => toggleFavorite(note.id)}
                  >
                    {note.isFavorite ? "⭐ Unfavorite" : "☆ Favorite"}
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="danger"
                    onClick={async () => {
                      try {
                        await deleteNote(note.id);

                        if (editingNote?.id === note.id) {
                          setEditingNote(null);
                          setIsNoteDialogOpen(false);
                        }
                      } catch (error) {
                        console.error("Failed to delete note:", error);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Dialog
          open={isNoteDialogOpen}
          title={editingNote ? "Edit Note" : "Create Note"}
          onClose={() => {
            setIsNoteDialogOpen(false);
            setEditingNote(null);
          }}
          scrollable
        >
          <NoteForm editingNote={editingNote} onAddNote={handleSaveNote} />
        </Dialog>
      </div>
    </>
  );
}

export default Notes;
