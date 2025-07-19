import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotes } from '../useNotes';

// Mock localStorage/Мокаем localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('useNotes hook', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test/Очищаем мок перед каждым тестом
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockReturnValue('[]');
  });

  test('should add new note', () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      const noteId = result.current.addNote({
        title: 'Тестовая заметка',
        content: 'Содержимое тестовой заметки',
        tags: ['тест'],
        folderId: undefined,
        isFavorite: false,
        isArchived: false
      });
      expect(noteId).toBeDefined();
    });

    expect(result.current.allNotes).toHaveLength(1);
    expect(result.current.allNotes[0].title).toBe('Тестовая заметка');
  });

  test('should add multiple notes with unique IDs', () => {
    const { result } = renderHook(() => useNotes());

    let noteId1: string;
    let noteId2: string;

    act(() => {
      noteId1 = result.current.addNote({
        title: 'Первая заметка',
        content: 'Содержимое первой заметки',
        tags: [],
        folderId: undefined,
        isFavorite: false,
        isArchived: false
      });
    });

    act(() => {
      noteId2 = result.current.addNote({
        title: 'Вторая заметка',
        content: 'Содержимое второй заметки',
        tags: [],
        folderId: undefined,
        isFavorite: false,
        isArchived: false
      });
    });

    // Verify both notes were added with unique IDs/Проверяем что обе заметки добавлены с уникальными ID
    expect(result.current.allNotes).toHaveLength(2);
    expect(noteId1).not.toBe(noteId2);
    expect(result.current.allNotes.find(note => note.id === noteId1)).toBeDefined();
    expect(result.current.allNotes.find(note => note.id === noteId2)).toBeDefined();
  });

  test('should filter notes by search query', async () => {
    const { result } = renderHook(() => useNotes());

    // Add test notes with delay to ensure unique IDs/Добавляем тестовые заметки с задержкой для уникальных ID
    await act(async () => {
      result.current.addNote({
        title: 'React заметка',
        content: 'О React разработке',
        tags: [],
        folderId: undefined,
        isFavorite: false,
        isArchived: false
      });
      
      // Small delay to ensure different timestamps/Небольшая задержка для разных timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      
      result.current.addNote({
        title: 'Vue заметка',
        content: 'О Vue разработке',
        tags: [],
        folderId: undefined,
        isFavorite: false,
        isArchived: false
      });
    });

    // Verify notes were added/Проверяем что заметки добавлены
    expect(result.current.allNotes).toHaveLength(2);
    expect(result.current.notes).toHaveLength(2);

    // Test search with proper async handling/Тестируем поиск с корректной обработкой асинхронности
    await act(async () => {
      result.current.setSearchQuery('React');
    });

    expect(result.current.notes).toHaveLength(1);
    expect(result.current.notes[0].title).toBe('React заметка');
  });

  test('should toggle favorite status', () => {
    const { result } = renderHook(() => useNotes());

    let noteId: string;
    act(() => {
      noteId = result.current.addNote({
        title: 'Заметка для избранного',
        content: 'Содержимое',
        tags: [],
        folderId: undefined,
        isFavorite: false,
        isArchived: false
      });
    });

    act(() => {
      result.current.toggleFavorite(noteId);
    });

    expect(result.current.allNotes[0].isFavorite).toBe(true);

    act(() => {
      result.current.toggleFavorite(noteId);
    });

    expect(result.current.allNotes[0].isFavorite).toBe(false);
  });

  test('should archive and restore note', () => {
    const { result } = renderHook(() => useNotes());

    let noteId: string;
    act(() => {
      noteId = result.current.addNote({
        title: 'Заметка для архива',
        content: 'Содержимое',
        tags: [],
        folderId: undefined,
        isFavorite: false,
        isArchived: false
      });
    });

    // Archive note/Архивируем заметку
    act(() => {
      result.current.archiveNote(noteId);
    });

    expect(result.current.allNotes[0].isArchived).toBe(true);
    expect(result.current.notes).toHaveLength(0); // Не показывается в основном списке

    // Restore note/Восстанавливаем заметку
    act(() => {
      result.current.restoreNote(noteId);
    });

    expect(result.current.allNotes[0].isArchived).toBe(false);
    expect(result.current.notes).toHaveLength(1); // Снова показывается
  });

  test('should filter notes by folder', () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      result.current.addNote({
        title: 'Заметка в папке работа',
        content: 'Содержимое',
        tags: [],
        folderId: 'work',
        isFavorite: false,
        isArchived: false
      });
      
      result.current.addNote({
        title: 'Заметка в папке личное',
        content: 'Содержимое',
        tags: [],
        folderId: 'personal',
        isFavorite: false,
        isArchived: false
      });
    });

    // Filter by work folder/Фильтруем по папке работа
    act(() => {
      result.current.setSelectedFolder('work');
    });

    expect(result.current.notes).toHaveLength(1);
    expect(result.current.notes[0].folderId).toBe('work');
  });

  test('should filter notes by tag', () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      result.current.addNote({
        title: 'Заметка с тегом важное',
        content: 'Содержимое',
        tags: ['важное', 'срочно'],
        folderId: undefined,
        isFavorite: false,
        isArchived: false
      });
      
      result.current.addNote({
        title: 'Заметка с тегом идеи',
        content: 'Содержимое',
        tags: ['идеи'],
        folderId: undefined,
        isFavorite: false,
        isArchived: false
      });
    });

    // Filter by важное tag/Фильтруем по тегу важное
    act(() => {
      result.current.setSelectedTag('важное');
    });

    expect(result.current.notes).toHaveLength(1);
    expect(result.current.notes[0].tags).toContain('важное');
  });
});
