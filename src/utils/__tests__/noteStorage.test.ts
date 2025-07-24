import {
  Note,
  saveNote,
  loadNotes,
  deleteNote,
  archiveNote,
  restoreNote,
  toggleFavorite,
} from "../noteStorage";

describe("noteStorage", () => {
  const mockNote: Note = {
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
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("saves and loads notes", () => {
    saveNote(mockNote);
    const notes = loadNotes();
    expect(notes).toEqual([mockNote]);
  });

  it("loads notes including archived when requested", () => {
    const archivedNote = { ...mockNote, id: "test-2", isArchived: true };
    saveNote(mockNote);
    saveNote(archivedNote);

    const allNotes = loadNotes(true);
    const activeNotes = loadNotes(false);

    expect(allNotes).toEqual([archivedNote, mockNote]);
    expect(activeNotes).toEqual([mockNote]);
  });

  it("deletes note by archiving it", () => {
    saveNote(mockNote);
    
    deleteNote(mockNote.id);
    
    const notes = loadNotes(true);
    const deletedNote = notes.find(note => note.id === mockNote.id);
    
    expect(deletedNote).toBeDefined();
    expect(deletedNote?.isArchived).toBe(true);
  });

  it("archives and restores note", () => {
    saveNote(mockNote);
    
    // Archive the note
    archiveNote(mockNote.id);
    let notes = loadNotes(false);
    expect(notes).toEqual([]);
    
    notes = loadNotes(true);
    const archivedNote = notes.find(note => note.id === mockNote.id);
    expect(archivedNote?.isArchived).toBe(true);
    expect(archivedNote?.archivedAt).toBeDefined();
    
    // Restore the note
    restoreNote(mockNote.id);
    notes = loadNotes(false);
    const restoredNote = notes.find(note => note.id === mockNote.id);
    expect(restoredNote?.isArchived).toBe(false);
    expect(restoredNote?.archivedAt).toBeUndefined();
  });

  it("toggles favorite status", () => {
    saveNote(mockNote);
    
    // Toggle to favorite
    toggleFavorite(mockNote.id);
    let notes = loadNotes();
    let favoritedNote = notes.find(note => note.id === mockNote.id);
    expect(favoritedNote?.isFavorite).toBe(true);
    
    // Toggle back to not favorite
    toggleFavorite(mockNote.id);
    notes = loadNotes();
    favoritedNote = notes.find(note => note.id === mockNote.id);
    expect(favoritedNote?.isFavorite).toBe(false);
  });

  it("handles empty storage", () => {
    const notes = loadNotes();
    expect(notes).toEqual([]);
  });

  it("handles corrupted storage gracefully", () => {
    localStorage.setItem("notesflow-notes", "invalid json");
    const notes = loadNotes();
    expect(notes).toEqual([]);
  });
});
