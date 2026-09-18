import { useCallback, useEffect, useState } from "react";
import {
  createNote as createNoteApi,
  deleteNote as deleteNoteApi,
  getNotes,
  getAllCategory,
  updateNote as updateNoteApi,
} from "../services/note.service";
import { useAuth } from "../contexts/AuthContext";
import type { CreateNoteData, Note } from "../types/note";

function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated } = useAuth();

  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);

      const note = await getNotes();
      setNotes(note);

      const category = await getAllCategory();
      setCategory(category);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotes([]);
      return;
    }
    loadNotes();
  }, [isAuthenticated]);

  const addNote = useCallback(async (data: CreateNoteData) => {
    const newNote = await createNoteApi(data);

    setNotes((currentNotes) => [newNote, ...currentNotes]);
  }, []);

  const updateNote = useCallback(async (updatedNote: Note) => {
    const savedNote = await updateNoteApi(updatedNote.id, {
      title: updatedNote.title,
      description: updatedNote.description,
      category: updatedNote.category,
      tags: updatedNote.tags,
      isFavorite: updatedNote.isFavorite,
      source: updatedNote.source,
    });

    setNotes((currentNotes) =>
      currentNotes.map((note) => (note.id === savedNote.id ? savedNote : note)),
    );
  }, []);

  const deleteNote = useCallback(async (id: Note["id"]) => {
    await deleteNoteApi(id);

    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
  }, []);

  const toggleFavorite = useCallback(
    async (id: Note["id"]) => {
      const currentNote = notes.find((note) => note.id === id);

      if (!currentNote) return;

      await updateNote({
        ...currentNote,
        isFavorite: !currentNote.isFavorite,
      });
    },
    [notes, updateNote],
  );

  return {
    notes,
    categories,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    loadNotes,
  };
}

export default useNotes;
