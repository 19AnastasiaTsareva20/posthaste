import { useState, useEffect, useMemo } from 'react';
import { Note, CreateNoteData } from '../types';

// Counter for unique ID generation/Счетчик для генерации уникальных ID
let noteIdCounter = 0;

// Generate unique ID/Генерация уникального ID
const generateUniqueId = (): string => {
  const timestamp = Date.now();
  const counter = ++noteIdCounter;
  return `${timestamp}-${counter}`;
};

export const useNotes = () => {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [showFavorites, setShowFavorites] = useState(false);

  // Load notes from localStorage on mount/Загрузка заметок из localStorage при монтировании
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        setAllNotes(parsedNotes);
      } catch (error) {
        console.error('Error parsing notes from localStorage:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever allNotes changes/Сохранение заметок в localStorage при изменении allNotes
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(allNotes));
  }, [allNotes]);

  // Filtered notes based on search and filters/Отфильтрованные заметки на основе поиска и фильтров
  const notes = useMemo(() => {
    return allNotes.filter(note => {
      // Skip archived notes/Пропускаем архивированные заметки
      if (note.isArchived) return false;
      
      // Search filter/Фильтр поиска
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesContent = note.content.toLowerCase().includes(query);
        const matchesTags = note.tags.some(tag => 
          tag.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesContent && !matchesTags) {
          return false;
        }
      }
      
      // Folder filter/Фильтр папок
      if (selectedFolder && note.folderId !== selectedFolder) {
        return false;
      }
      
      // Tag filter/Фильтр тегов
      if (selectedTag && !note.tags.includes(selectedTag)) {
        return false;
      }
      
      // Favorites filter/Фильтр избранного
      if (showFavorites && !note.isFavorite) {
        return false;
      }
      
      return true;
    }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [allNotes, searchQuery, selectedFolder, selectedTag, showFavorites]);

  // Add new note/Добавление новой заметки
  const addNote = (noteData: CreateNoteData): string => {
    const now = new Date();
    const newNote: Note = {
      id: generateUniqueId(),
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      folderId: noteData.folderId,
      isFavorite: noteData.isFavorite,
      isArchived: noteData.isArchived,
      createdAt: now,
      updatedAt: now
    };
    
    setAllNotes(prev => [newNote, ...prev]);
    return newNote.id;
  };

  // Update existing note/Обновление существующей заметки
  const updateNote = (id: string, updates: Partial<Note>): void => {
    setAllNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  };

  // Delete note/Удаление заметки
  const deleteNote = (id: string): void => {
    setAllNotes(prev => prev.filter(note => note.id !== id));
  };

  // Toggle favorite status/Переключение статуса избранного
  const toggleFavorite = (id: string): void => {
    updateNote(id, { 
      isFavorite: !allNotes.find(note => note.id === id)?.isFavorite 
    });
  };

  // Archive note/Архивирование заметки
  const archiveNote = (id: string): void => {
    updateNote(id, { isArchived: true });
  };

  // Restore note from archive/Восстановление заметки из архива
  const restoreNote = (id: string): void => {
    updateNote(id, { isArchived: false });
  };

  // Permanently delete note/Окончательное удаление заметки
  const permanentlyDeleteNote = (id: string): void => {
    deleteNote(id);
  };

  // Get note by ID/Получение заметки по ID
  const getNoteById = (id: string): Note | undefined => {
    return allNotes.find(note => note.id === id);
  };

  // Get all folders/Получение всех папок
  const folders = useMemo(() => {
    const folderMap = new Map<string, { id: string; name: string; count: number }>();
    
    allNotes.forEach(note => {
      if (note.folderId && !note.isArchived) {
        const existing = folderMap.get(note.folderId);
        if (existing) {
          existing.count++;
        } else {
          folderMap.set(note.folderId, {
            id: note.folderId,
            name: note.folderId, // В будущем можно добавить mapping названий
            count: 1
          });
        }
      }
    });
    
    return Array.from(folderMap.values());
  }, [allNotes]);

  // Get all tags/Получение всех тегов
  const tags = useMemo(() => {
    const tagMap = new Map<string, number>();
    
    allNotes.forEach(note => {
      if (!note.isArchived) {
        note.tags.forEach(tag => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      }
    });
    
    return Array.from(tagMap.entries()).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  }, [allNotes]);

  return {
    // State/Состояние
    allNotes,
    notes,
    folders,
    tags,
    
    // Filters/Фильтры
    searchQuery,
    selectedFolder,
    selectedTag,
    showFavorites,
    
    // Filter setters/Сеттеры фильтров
    setSearchQuery,
    setSelectedFolder,
    setSelectedTag,
    setShowFavorites,
    
    // Actions/Действия
    addNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    archiveNote,
    restoreNote,
    permanentlyDeleteNote,
    getNoteById
  };
};
