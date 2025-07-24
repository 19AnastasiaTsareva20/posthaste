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
      result.current.createNote("New Note", "<p>Content</p>", ["tag1"]);
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
      result.current.updateNote(
        mockNote.id,
        "Updated Title",
        "<p>Updated content</p>",
        ["updated"],
      );
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
      result.current.deleteNote(mockNote.id);
    });

    expect(mockedNoteStorage.deleteNote).toHaveBeenCalledWith(mockNote.id);
  });

  it("archives a note", () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      result.current.archiveNote(mockNote.id);
    });

    expect(mockedNoteStorage.archiveNote).toHaveBeenCalledWith(mockNote.id);
  });

  it("restores a note from archive", () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      result.current.restoreNote(mockNote.id);
    });

    expect(mockedNoteStorage.restoreNote).toHaveBeenCalledWith(mockNote.id);
  });

  it("toggles favorite status", () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      result.current.toggleFavorite(mockNote.id);
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
      result.current.loadArchivedNotes();
    });

    expect(mockedNoteStorage.loadNotes).toHaveBeenCalledWith(true);
  });

  it("handles storage errors gracefully", () => {
    mockedNoteStorage.saveNote.mockImplementation(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useNotes());

    expect(() => {
      act(() => {
        result.current.createNote("Test", "Content", []);
      });
    }).not.toThrow();
  });
});
