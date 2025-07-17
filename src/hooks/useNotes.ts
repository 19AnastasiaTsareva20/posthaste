import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  // Load notes/Загрузка заметок
  useEffect(() => {
    const saved = localStorage.getItem('notesflow-notes');
    if (saved) {
      try {
        const parsedNotes = JSON.parse(saved).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
        setNotes([]);
      }
    }
  }, []);

  // Save notes/Сохранение заметок
  const saveNotes = useCallback((newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('notesflow-notes', JSON.stringify(newNotes));
  }, []);

  // Filter notes/Фильтрация заметок
  useEffect(() => {
    let filtered = notes.filter(note => !note.isArchived);

    // Search filter/Фильтр поиска
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Folder filter/Фильтр по папкам
    if (selectedFolder) {
      filtered = filtered.filter(note => note.folderId === selectedFolder);
    }

    // Tag filter/Фильтр по тегам
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    // Favorites filter/Фильтр избранных
    if (showFavorites) {
      filtered = filtered.filter(note => note.isFavorite);
    }

    // Sort by update date/Сортировка по дате обновления
    filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    setFilteredNotes(filtered);
  }, [notes, searchQuery, selectedFolder, selectedTag, showFavorites]);

  // Add note/Добавление заметки
  const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    saveNotes([newNote, ...notes]);
    return newNote.id;
  }, [notes, saveNotes]);

  // Update note/Обновление заметки
  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    );
    saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  // Delete note/Удаление заметки
  const deleteNote = useCallback((id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  // Toggle favorite/Переключение избранного
  const toggleFavorite = useCallback((id: string) => {
    updateNote(id, { 
      isFavorite: !notes.find(note => note.id === id)?.isFavorite 
    });
  }, [notes, updateNote]);

  // Archive note/Архивирование заметки
  const archiveNote = useCallback((id: string) => {
    updateNote(id, { isArchived: true });
  }, [updateNote]);

  return {
    notes: filteredNotes,
    allNotes: notes,
    searchQuery,
    setSearchQuery,
    selectedFolder,
    setSelectedFolder,
    selectedTag,
    setSelectedTag,
    showFavorites,
    setShowFavorites,
    addNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    archiveNote
  };
};
