import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ViewArticlePage } from '../ViewArticlePage';
import * as noteStorage from '../../utils/noteStorage';

// Mock the noteStorage module
jest.mock('../../utils/noteStorage');
const mockedNoteStorage = noteStorage as jest.Mocked<typeof noteStorage>;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'test-note-1' }),
}));

const mockNote = {
  id: 'test-note-1',
  title: 'Test Note Title',
  content: '<p>This is the note content with <strong>bold text</strong></p>',
  tags: ['work', 'important'],
  isFavorite: false,
  createdAt: '2024-01-01T10:00:00.000Z',
  updatedAt: '2024-01-02T15:30:00.000Z',
  isArchived: false
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ViewArticlePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNoteStorage.loadNotes.mockReturnValue([mockNote]);
  });

  it('renders note content correctly', async () => {
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Note Title')).toBeInTheDocument();
      expect(screen.getByText('This is the note content with')).toBeInTheDocument();
      expect(screen.getByText('bold text')).toBeInTheDocument();
      expect(screen.getByText('#work')).toBeInTheDocument();
      expect(screen.getByText('#important')).toBeInTheDocument();
    });
  });

  it('shows note metadata', async () => {
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/создано:/i)).toBeInTheDocument();
      expect(screen.getByText(/изменено:/i)).toBeInTheDocument();
      expect(screen.getByText('01.01.2024')).toBeInTheDocument();
      expect(screen.getByText('02.01.2024')).toBeInTheDocument();
    });
  });

  it('navigates to edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /редактировать/i });
    await user.click(editButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/create/test-note-1');
  });

  it('toggles favorite status', async () => {
    const user = userEvent.setup();
    mockedNoteStorage.toggleFavorite.mockImplementation(() => {});
    
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    });

    const favoriteButton = screen.getByRole('button', { name: /добавить в избранное/i });
    await user.click(favoriteButton);
    
    expect(mockedNoteStorage.toggleFavorite).toHaveBeenCalledWith('test-note-1');
  });

  it('archives note when archive button is clicked', async () => {
    const user = userEvent.setup();
    mockedNoteStorage.archiveNote.mockImplementation(() => {});
    window.confirm = jest.fn().mockReturnValue(true);
    
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    });

    const archiveButton = screen.getByRole('button', { name: /архивировать/i });
    await user.click(archiveButton);
    
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('архивировать')
    );
    expect(mockedNoteStorage.archiveNote).toHaveBeenCalledWith('test-note-1');
    expect(mockNavigate).toHaveBeenCalledWith('/articles');
  });

  it('deletes note when delete button is clicked', async () => {
    const user = userEvent.setup();
    mockedNoteStorage.deleteNote.mockImplementation(() => {});
    window.confirm = jest.fn().mockReturnValue(true);
    
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /удалить/i });
    await user.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('удалить')
    );
    expect(mockedNoteStorage.deleteNote).toHaveBeenCalledWith('test-note-1');
    expect(mockNavigate).toHaveBeenCalledWith('/articles');
  });

  it('shows export options', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /экспорт/i });
    await user.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText(/экспортировать как/i)).toBeInTheDocument();
      expect(screen.getByText('Markdown')).toBeInTheDocument();
      expect(screen.getByText('HTML')).toBeInTheDocument();
      expect(screen.getByText('Текст')).toBeInTheDocument();
    });
  });

  it('exports note in different formats', async () => {
    const user = userEvent.setup();
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /экспорт/i });
    await user.click(exportButton);
    
    const markdownButton = screen.getByText('Markdown');
    await user.click(markdownButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('shows 404 when note is not found', () => {
    mockedNoteStorage.loadNotes.mockReturnValue([]);
    
    renderWithRouter(<ViewArticlePage />);
    
    expect(screen.getByText(/заметка не найдена/i)).toBeInTheDocument();
    expect(screen.getByText(/вернуться к списку/i)).toBeInTheDocument();
  });

  it('navigates back to articles list', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /назад/i });
    await user.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/articles');
  });

  it('shows favorite star when note is favorite', async () => {
    const favoriteNote = { ...mockNote, isFavorite: true };
    mockedNoteStorage.loadNotes.mockReturnValue([favoriteNote]);
    
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /удалить из избранного/i })).toBeInTheDocument();
    });
  });

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    });

    // Ctrl+E для редактирования
    await user.keyboard('{Control>}e{/Control}');
    expect(mockNavigate).toHaveBeenCalledWith('/create/test-note-1');
  });

  it('shows reading time estimate', async () => {
    renderWithRouter(<ViewArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/время чтения/i)).toBeInTheDocument();
      expect(screen.getByText(/мин/i)).toBeInTheDocument();
    });
  });
});
