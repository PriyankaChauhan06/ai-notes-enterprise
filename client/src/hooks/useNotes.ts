import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
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
      console.error("Load notes error:", error);
      toast.error("Failed to load notes.");
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

    setCategory((currentCategories) => {
      if (currentCategories.includes(newNote.category)) {
        return currentCategories;
      }

      return [...currentCategories, newNote.category];
    });
  }, []);

  const addNoteToState = useCallback((note: Note) => {
    setNotes((currentNotes) => [note, ...currentNotes]);

    setCategory((currentCategories) => {
      if (currentCategories.includes(note.category)) {
        return currentCategories;
      }

      return [...currentCategories, note.category];
    });
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

  const updateNoteInState = useCallback((updatedNote: Note) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note,
      ),
    );

    setCategory((currentCategories) => {
      if (currentCategories.includes(updatedNote.category)) {
        return currentCategories;
      }

      return [...currentCategories, updatedNote.category];
    });
  }, []);

  const deleteNote = useCallback(async (id: Note["id"]) => {
    await deleteNoteApi(id);

    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
  }, []);

  const removeNoteFromState = useCallback((noteId: Note["id"]) => {
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== noteId),
    );
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
    addNoteToState,
    updateNote,
    updateNoteInState,
    deleteNote,
    removeNoteFromState,
    toggleFavorite,
    loadNotes,
  };
}

export default useNotes;
