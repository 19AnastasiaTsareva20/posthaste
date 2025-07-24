import { useState, useEffect, useCallback } from "react";
import {
  Note,
  saveNote,
  loadNotes,
  deleteNote,
  archiveNote,
  restoreNote,
  toggleFavorite,
} from "../utils/noteStorage";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notes from storage
  const reloadNotes = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedNotes = loadNotes(false);
      setNotes(loadedNotes);
    } catch (err) {
      setError("Failed to load notes");
      console.error("Error loading notes:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load archived notes
  const loadArchivedNotes = useCallback(() => {
    try {
      setError(null);
      const archivedNotes = loadNotes(true).filter((note) => note.isArchived);
      return archivedNotes;
    } catch (err) {
      setError("Failed to load archived notes");
      console.error("Error loading archived notes:", err);
      return [];
    }
  }, []);

  // Create new note
  const createNote = useCallback(
    (title: string, content: string, tags: string[]) => {
      try {
        const newNote: Note = {
          id: `note-${Date.now()}`,
          title,
          content,
          tags,
          isFavorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isArchived: false,
        };

        saveNote(newNote);
        reloadNotes();
        return newNote.id;
      } catch (err) {
        setError("Failed to create note");
        console.error("Error creating note:", err);
        // Исправлено: возвращаем null вместо выбрасывания ошибки
        return null;
      }
    },
    [reloadNotes],
  );

  // Update existing note
  const updateNote = useCallback(
    (id: string, title: string, content: string, tags: string[]) => {
      try {
        const existingNotes = loadNotes(true);
        const existingNote = existingNotes.find((note) => note.id === id);

        if (!existingNote) {
          throw new Error("Note not found");
        }

        const updatedNote: Note = {
          ...existingNote,
          title,
          content,
          tags,
          updatedAt: new Date().toISOString(),
        };

        saveNote(updatedNote);
        reloadNotes();
        return true;
      } catch (err) {
        setError("Failed to update note");
        console.error("Error updating note:", err);
        return false;
      }
    },
    [reloadNotes],
  );

  // Delete note (archive)
  const deleteNoteHandler = useCallback(
    (id: string) => {
      try {
        deleteNote(id);
        reloadNotes();
        return true;
      } catch (err) {
        setError("Failed to delete note");
        console.error("Error deleting note:", err);
        return false;
      }
    },
    [reloadNotes],
  );

  // Archive note
  const archiveNoteHandler = useCallback(
    (id: string) => {
      try {
        archiveNote(id);
        reloadNotes();
        return true;
      } catch (err) {
        setError("Failed to archive note");
        console.error("Error archiving note:", err);
        return false;
      }
    },
    [reloadNotes],
  );

  // Restore note from archive
  const restoreNoteHandler = useCallback(
    (id: string) => {
      try {
        restoreNote(id);
        reloadNotes();
        return true;
      } catch (err) {
        setError("Failed to restore note");
        console.error("Error restoring note:", err);
        return false;
      }
    },
    [reloadNotes],
  );

  // Toggle favorite status
  const toggleFavoriteHandler = useCallback(
    (id: string) => {
      try {
        toggleFavorite(id);
        reloadNotes();
        return true;
      } catch (err) {
        setError("Failed to toggle favorite");
        console.error("Error toggling favorite:", err);
        return false;
      }
    },
    [reloadNotes],
  );

  // Get note by ID
  const getNoteById = useCallback((id: string): Note | null => {
    try {
      const allNotes = loadNotes(true);
      return allNotes.find((note) => note.id === id) || null;
    } catch (err) {
      setError("Failed to get note");
      console.error("Error getting note:", err);
      return null;
    }
  }, []);

  // Initialize notes on mount
  useEffect(() => {
    reloadNotes();
  }, [reloadNotes]);

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote: deleteNoteHandler,
    archiveNote: archiveNoteHandler,
    restoreNote: restoreNoteHandler,
    toggleFavorite: toggleFavoriteHandler,
    reloadNotes,
    loadArchivedNotes,
    getNoteById,
  };
};
