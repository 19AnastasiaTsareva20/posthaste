export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  archivedAt?: string;
}

export const saveNote = (note: Note): void => {
  try {
    const existingNotes = loadNotes(true); // Include archived
    const noteIndex = existingNotes.findIndex(n => n.id === note.id);
    
    if (noteIndex >= 0) {
      existingNotes[noteIndex] = note;
    } else {
      existingNotes.unshift(note);
    }
    
    localStorage.setItem('notesflow-notes', JSON.stringify(existingNotes));
  } catch (error) {
    throw new Error(`Failed to save note: ${error}`);
  }
};

export const loadNotes = (includeArchived = false): Note[] => {
  try {
    const savedNotes = localStorage.getItem('notesflow-notes');
    if (!savedNotes) return [];
    
    const notes = JSON.parse(savedNotes);
    
    if (includeArchived) {
      return notes;
    }
    
    return notes.filter((note: Note) => !note.isArchived);
  } catch (error) {
    console.error('Failed to load notes:', error);
    return [];
  }
};

export const deleteNote = (noteId: string): void => {
  archiveNote(noteId); // Soft delete by archiving
};

export const archiveNote = (noteId: string): void => {
  try {
    const notes = loadNotes(true);
    const updatedNotes = notes.map(note =>
      note.id === noteId 
        ? { ...note, isArchived: true, archivedAt: new Date().toISOString() }
        : note
    );
    
    localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
  } catch (error) {
    throw new Error(`Failed to archive note: ${error}`);
  }
};

export const restoreNote = (noteId: string): void => {
  try {
    const notes = loadNotes(true);
    const updatedNotes = notes.map(note =>
      note.id === noteId 
        ? { ...note, isArchived: false, archivedAt: undefined }
        : note
    );
    
    localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
  } catch (error) {
    throw new Error(`Failed to restore note: ${error}`);
  }
};

export const toggleFavorite = (noteId: string): void => {
  try {
    const notes = loadNotes(true);
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note
    );
    
    localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
  } catch (error) {
    throw new Error(`Failed to toggle favorite: ${error}`);
  }
};
