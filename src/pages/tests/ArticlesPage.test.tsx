import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ArticlesPage } from '../ArticlesPage';
import * as noteStorage from '../../utils/noteStorage';

// Mock the noteStorage module
jest.mock('../../utils/noteStorage');
const mockedNoteStorage = noteStorage as jest.Mocked<typeof noteStorage>;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockNotes = [
  {
    id: 'note-1',
    title: 'First Note',
    content: '<p>First note content</p>',
    tags: ['work', 'important'],
    isFavorite: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isArchived: false
  },
  {
    id: 'note-2',
    title: 'Second Note',
    content: '<p>Second note content</p>',
    tags: ['personal'],
    isFavorite: false,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    isArchived: false
  }
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ArticlesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNoteStorage.loadNotes.mockReturnValue(mockNotes);
  });

  it('renders page title and statistics', async () => {
    renderWithRouter(<ArticlesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('NotesFlow')).toBeInTheDocument();
      expect(screen.getByText('Всего: 2')).toBeInTheDocument();
      expect(screen.getByText('Избранных: 1')).toBeInTheDocument();
    });
  });

  it('displays notes list', async () => {
    renderWithRouter(<ArticlesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });
  });

  it('filters notes by search query', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArticlesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/поиск по заметкам/i);
    await user.type(searchInput, 'First');
    
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.queryByText('Second Note')).not.toBeInTheDocument();
    });
  });

  it('filters notes by favorites', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArticlesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });

    const favoritesButton = screen.getByText('Избранные');
    await user.click(favoritesButton);
    
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.queryByText('Second Note')).not.toBeInTheDocument();
    });
  });

  it('filters notes by tags', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArticlesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('#work')).toBeInTheDocument();
    });

    const workTag = screen.getByText('#work');
    await user.click(workTag);
    
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.queryByText('Second Note')).not.toBeInTheDocument();
    });
  });

  it('changes view mode between grid and list', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArticlesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    // Предполагаем, что есть кнопки переключения вида
    const listViewButton = screen.getByRole('button', { name: /список/i });
    await user.click(listViewButton);
    
    // Проверяем, что вид изменился (это зависит от реализации)
    expect(listViewButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('sorts notes by different criteria', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArticlesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const sortSelect = screen.getByDisplayValue(/по изменению/i);
    await user.selectOptions(sortSelect, 'title');
    
    // Проверяем, что сортировка применилась
    expect(sortSelect).toHaveValue('title');
  });

  it('clears all filters', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArticlesPage />);
    
    // Применяем фильтры
    const searchInput = screen.getByPlaceholderText(/поиск по заметкам/i);
    await user.type(searchInput, 'test');
    
    const favoritesButton = screen.getByText('Избранные');
    await user.click(favoritesButton);
    
    // Очищаем фильтры
    const clearButton = screen.getByText(/очистить фильтры/i);
    await user.click(clearButton);
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });

  it('shows empty state when no notes exist', () => {
    mockedNoteStorage.loadNotes.mockReturnValue([]);
    renderWithRouter(<ArticlesPage />);
    
    expect(screen.getByText(/заметок пока нет/i)).toBeInTheDocument();
    expect(screen.getByText(/создать заметку/i)).toBeInTheDocument();
  });

  it('shows no results state when search returns no results', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArticlesPage />);
    
    const searchInput = screen.getByPlaceholderText(/поиск по заметкам/i);
    await user.type(searchInput, 'nonexistent');
    
    await waitFor(() => {
      expect(screen.getByText(/заметки не найдены/i)).toBeInTheDocument();
    });
  });

  it('navigates to note view when note is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArticlesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const noteCard = screen.getByText('First Note');
    await user.click(noteCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('/view/note-1');
  });
});
