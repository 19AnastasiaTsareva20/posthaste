import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArchiveManager } from '../ArchiveManager';
import * as noteStorage from '../../../utils/noteStorage';

// Mock the noteStorage module
jest.mock('../../../utils/noteStorage');
const mockedNoteStorage = noteStorage as jest.Mocked<typeof noteStorage>;

const mockArchivedNotes = [
  {
    id: 'archived-1',
    title: 'Archived Note 1',
    content: '<p>First archived note</p>',
    tags: ['work'],
    isFavorite: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isArchived: true,
    archivedAt: '2024-01-10T00:00:00.000Z'
  },
  {
    id: 'archived-2',
    title: 'Archived Note 2',
    content: '<p>Second archived note</p>',
    tags: ['personal'],
    isFavorite: true,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    isArchived: true,
    archivedAt: '2024-01-11T00:00:00.000Z'
  }
];

describe('ArchiveManager', () => {
  const defaultProps = {
    onNotesChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedNoteStorage.loadNotes.mockImplementation((includeArchived) => 
      includeArchived ? mockArchivedNotes : []
    );
  });

  it('renders archived notes list', async () => {
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
      expect(screen.getByText('Archived Note 2')).toBeInTheDocument();
    });
  });

  it('shows archived notes count', async () => {
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/2 заметки в архиве/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no archived notes', () => {
    mockedNoteStorage.loadNotes.mockReturnValue([]);
    render(<ArchiveManager {...defaultProps} />);
    
    expect(screen.getByText(/архив пуст/i)).toBeInTheDocument();
    expect(screen.getByText(/нет архивированных заметок/i)).toBeInTheDocument();
  });

  it('restores single note', async () => {
    const user = userEvent.setup();
    mockedNoteStorage.restoreNote.mockImplementation(() => {});
    
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
    });

    const restoreButtons = screen.getAllByRole('button', { name: /восстановить/i });
    await user.click(restoreButtons[0]);
    
    expect(mockedNoteStorage.restoreNote).toHaveBeenCalledWith('archived-1');
    expect(defaultProps.onNotesChange).toHaveBeenCalled();
  });

  it('permanently deletes single note with confirmation', async () => {
    const user = userEvent.setup();
    mockedNoteStorage.deleteNote.mockImplementation(() => {});
    window.confirm = jest.fn().mockReturnValue(true);
    
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /удалить навсегда/i });
    await user.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('удалить навсегда')
    );
    expect(mockedNoteStorage.deleteNote).toHaveBeenCalledWith('archived-1');
    expect(defaultProps.onNotesChange).toHaveBeenCalled();
  });

  it('cancels permanent deletion when not confirmed', async () => {
    const user = userEvent.setup();
    mockedNoteStorage.deleteNote.mockImplementation(() => {});
    window.confirm = jest.fn().mockReturnValue(false);
    
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /удалить навсегда/i });
    await user.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockedNoteStorage.deleteNote).not.toHaveBeenCalled();
    expect(defaultProps.onNotesChange).not.toHaveBeenCalled();
  });

  it('restores all notes', async () => {
    const user = userEvent.setup();
    mockedNoteStorage.restoreNote.mockImplementation(() => {});
    window.confirm = jest.fn().mockReturnValue(true);
    
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
    });

    const restoreAllButton = screen.getByRole('button', { name: /восстановить все/i });
    await user.click(restoreAllButton);
    
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('восстановить все заметки')
    );
    expect(mockedNoteStorage.restoreNote).toHaveBeenCalledTimes(2);
    expect(defaultProps.onNotesChange).toHaveBeenCalled();
  });

  it('clears entire archive', async () => {
    const user = userEvent.setup();
    mockedNoteStorage.deleteNote.mockImplementation(() => {});
    window.confirm = jest.fn().mockReturnValue(true);
    
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
    });

    const clearAllButton = screen.getByRole('button', { name: /очистить архив/i });
    await user.click(clearAllButton);
    
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('удалить все заметки из архива навсегда')
    );
    expect(mockedNoteStorage.deleteNote).toHaveBeenCalledTimes(2);
    expect(defaultProps.onNotesChange).toHaveBeenCalled();
  });

  it('searches archived notes', async () => {
    const user = userEvent.setup();
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
      expect(screen.getByText('Archived Note 2')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/поиск в архиве/i);
    await user.type(searchInput, 'First');
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
      expect(screen.queryByText('Archived Note 2')).not.toBeInTheDocument();
    });
  });

  it('shows archive date for each note', async () => {
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/архивировано: 10.01.2024/i)).toBeInTheDocument();
      expect(screen.getByText(/архивировано: 11.01.2024/i)).toBeInTheDocument();
    });
  });

  it('sorts archived notes by different criteria', async () => {
    const user = userEvent.setup();
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
    });

    const sortSelect = screen.getByDisplayValue(/по архивации/i);
    await user.selectOptions(sortSelect, 'title');
    
    expect(sortSelect).toHaveValue('title');
    
    // После сортировки по названию порядок должен измениться
    const notes = screen.getAllByText(/Archived Note/);
    expect(notes[0]).toHaveTextContent('Archived Note 1');
    expect(notes[1]).toHaveTextContent('Archived Note 2');
  });

  it('handles storage errors gracefully', async () => {
    const user = userEvent.setup();
    mockedNoteStorage.restoreNote.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
    });

    const restoreButtons = screen.getAllByRole('button', { name: /восстановить/i });
    await user.click(restoreButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/ошибка при восстановлении/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while processing', async () => {
    const user = userEvent.setup();
    
    // Mock delayed response
    mockedNoteStorage.restoreNote.mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });
    
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
    });

    const restoreButtons = screen.getAllByRole('button', { name: /восстановить/i });
    await user.click(restoreButtons[0]);
    
    expect(screen.getByText(/восстанавливаем/i)).toBeInTheDocument();
  });

  it('updates notes count after operations', async () => {
    const user = userEvent.setup();
    
    // Mock restore operation that removes one note
    mockedNoteStorage.restoreNote.mockImplementation(() => {
      mockedNoteStorage.loadNotes.mockImplementation((includeArchived) => 
        includeArchived ? [mockArchivedNotes[1]] : []
      );
    });
    
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/2 заметки в архиве/i)).toBeInTheDocument();
    });

    const restoreButtons = screen.getAllByRole('button', { name: /восстановить/i });
    await user.click(restoreButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/1 заметка в архиве/i)).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', async () => {
    render(<ArchiveManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Archived Note 1')).toBeInTheDocument();
    });

    const restoreButtons = screen.getAllByRole('button', { name: /восстановить/i });
    expect(restoreButtons[0]).toHaveAttribute('aria-label');
    
    const deleteButtons = screen.getAllByRole('button', { name: /удалить навсегда/i });
    expect(deleteButtons[0]).toHaveAttribute('aria-label');
  });
});
