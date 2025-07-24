import { renderHook, act } from "@testing-library/react";
import { useNotes } from "../useNotes";
import * as noteStorage from "../../utils/noteStorage";

// Mock the noteStorage module
jest.mock("../../utils/noteStorage");
const mockedNoteStorage = noteStorage as jest.Mocked<typeof noteStorage>;

describe("useNotes", () => {
  const mockNote = {
    id: "test-1",
    title: "Test Note",
    content: "<p>Test content</p>",
    tags: ["test"],
    isFavorite: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    isArchived: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedNoteStorage.loadNotes.mockReturnValue([]);
  });

  it("loads notes on initialization", () => {
    mockedNoteStorage.loadNotes.mockReturnValue([mockNote]);

    const { result } = renderHook(() => useNotes());

    expect(result.current.notes).toEqual([mockNote]);
    expect(mockedNoteStorage.loadNotes).toHaveBeenCalledWith(false);
  });

  it("creates a new note", () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      const noteId = result.current.createNote("New Note", "<p>Content</p>", ["tag1"]);
      expect(noteId).toBeTruthy();
    });

    expect(mockedNoteStorage.saveNote).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Note",
        content: "<p>Content</p>",
        tags: ["tag1"],
        isFavorite: false,
        isArchived: false,
      }),
    );
  });

  it("updates an existing note", () => {
    mockedNoteStorage.loadNotes.mockReturnValue([mockNote]);
    const { result } = renderHook(() => useNotes());

    act(() => {
      const success = result.current.updateNote(
        mockNote.id,
        "Updated Title",
        "<p>Updated content</p>",
        ["updated"],
      );
      expect(success).toBe(true);
    });

    expect(mockedNoteStorage.saveNote).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockNote.id,
        title: "Updated Title",
        content: "<p>Updated content</p>",
        tags: ["updated"],
        updatedAt: expect.any(String),
      }),
    );
  });

  it("deletes a note", () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      const success = result.current.deleteNote(mockNote.id);
      expect(success).toBe(true);
    });

    expect(mockedNoteStorage.deleteNote).toHaveBeenCalledWith(mockNote.id);
  });

  it("archives a note", () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      const success = result.current.archiveNote(mockNote.id);
      expect(success).toBe(true);
    });

    expect(mockedNoteStorage.archiveNote).toHaveBeenCalledWith(mockNote.id);
  });

  it("restores a note from archive", () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      const success = result.current.restoreNote(mockNote.id);
      expect(success).toBe(true);
    });

    expect(mockedNoteStorage.restoreNote).toHaveBeenCalledWith(mockNote.id);
  });

  it("toggles favorite status", () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      const success = result.current.toggleFavorite(mockNote.id);
      expect(success).toBe(true);
    });

    expect(mockedNoteStorage.toggleFavorite).toHaveBeenCalledWith(mockNote.id);
  });

  it("reloads notes", () => {
    const { result } = renderHook(() => useNotes());
    mockedNoteStorage.loadNotes.mockClear();

    act(() => {
      result.current.reloadNotes();
    });

    expect(mockedNoteStorage.loadNotes).toHaveBeenCalledWith(false);
  });

  it("loads archived notes", () => {
    const archivedNote = { ...mockNote, isArchived: true };
    mockedNoteStorage.loadNotes.mockReturnValue([archivedNote]);

    const { result } = renderHook(() => useNotes());

    act(() => {
      const archivedNotes = result.current.loadArchivedNotes();
      expect(archivedNotes).toEqual([archivedNote]);
    });

    expect(mockedNoteStorage.loadNotes).toHaveBeenCalledWith(true);
  });

  it("handles storage errors gracefully when creating note", () => {
    mockedNoteStorage.saveNote.mockImplementation(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useNotes());

    act(() => {
      const noteId = result.current.createNote("Test", "Content", []);
      expect(noteId).toBeNull(); // Should return null on error
    });

    // Проверяем, что ошибка установлена
    expect(result.current.error).toBe("Failed to create note");
  });

  it("handles storage errors gracefully when updating note", () => {
    mockedNoteStorage.loadNotes.mockReturnValue([mockNote]);
    mockedNoteStorage.saveNote.mockImplementation(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useNotes());

    act(() => {
      const success = result.current.updateNote(mockNote.id, "Title", "Content", []);
      expect(success).toBe(false); // Should return false on error
    });

    // Проверяем, что ошибка установлена
    expect(result.current.error).toBe("Failed to update note");
  });

  it("handles storage errors gracefully when deleting note", () => {
    mockedNoteStorage.deleteNote.mockImplementation(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useNotes());

    act(() => {
      const success = result.current.deleteNote(mockNote.id);
      expect(success).toBe(false); // Should return false on error
    });

    // Проверяем, что ошибка установлена
    expect(result.current.error).toBe("Failed to delete note");
  });

  it("handles storage errors gracefully when archiving note", () => {
    mockedNoteStorage.archiveNote.mockImplementation(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useNotes());

    act(() => {
      const success = result.current.archiveNote(mockNote.id);
      expect(success).toBe(false); // Should return false on error
    });

    // Проверяем, что ошибка установлена
    expect(result.current.error).toBe("Failed to archive note");
  });

  it("handles storage errors gracefully when restoring note", () => {
    mockedNoteStorage.restoreNote.mockImplementation(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useNotes());

    act(() => {
      const success = result.current.restoreNote(mockNote.id);
      expect(success).toBe(false); // Should return false on error
    });

    // Проверяем, что ошибка установлена
    expect(result.current.error).toBe("Failed to restore note");
  });

  it("handles storage errors gracefully when toggling favorite", () => {
    mockedNoteStorage.toggleFavorite.mockImplementation(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useNotes());

    act(() => {
      const success = result.current.toggleFavorite(mockNote.id);
      expect(success).toBe(false); // Should return false on error
    });

    // Проверяем, что ошибка установлена
    expect(result.current.error).toBe("Failed to toggle favorite");
  });
});
