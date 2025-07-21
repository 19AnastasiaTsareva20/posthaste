import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { SettingsPage } from '../SettingsPage';
import { ThemeProvider } from '../../contexts/ThemeContext';
import * as noteStorage from '../../utils/noteStorage';

// Mock the noteStorage module
jest.mock('../../utils/noteStorage');
const mockedNoteStorage = noteStorage as jest.Mocked<typeof noteStorage>;

// Mock window.matchMedia for theme context
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedNoteStorage.loadNotes.mockReturnValue([]);
  });

  it('renders settings page title', () => {
    renderWithProviders(<SettingsPage />);
    
    expect(screen.getByText('Настройки')).toBeInTheDocument();
  });

  it('shows theme settings section', () => {
    renderWithProviders(<SettingsPage />);
    
    expect(screen.getByText('Тема оформления')).toBeInTheDocument();
    expect(screen.getByText('Выберите тему интерфейса')).toBeInTheDocument();
  });

  it('shows data management section', () => {
    renderWithProviders(<SettingsPage />);
    
    expect(screen.getByText('Управление данными')).toBeInTheDocument();
    expect(screen.getByText('Экспорт и импорт заметок')).toBeInTheDocument();
  });

  it('shows general settings section', () => {
    renderWithProviders(<SettingsPage />);
    
    expect(screen.getByText('Общие настройки')).toBeInTheDocument();
    expect(screen.getByText('Персонализация интерфейса')).toBeInTheDocument();
  });

  it('has theme toggle functionality', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);
    
    const themeToggle = screen.getByRole('button', { name: /переключить тему/i });
    await user.click(themeToggle);
    
    // Проверяем, что тема изменилась
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('shows current theme status', () => {
    localStorage.setItem('notesflow-theme', 'light');
    renderWithProviders(<SettingsPage />);
    
    expect(screen.getByText(/текущая тема: светлая/i)).toBeInTheDocument();
  });

  it('exports all notes', async () => {
    const user = userEvent.setup();
    const mockNotes = [
      {
        id: '1',
        title: 'Test Note',
        content: '<p>Content</p>',
        tags: ['test'],
        isFavorite: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isArchived: false
      }
    ];
    
    mockedNoteStorage.loadNotes.mockReturnValue(mockNotes);
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    
    renderWithProviders(<SettingsPage />);
    
    const exportButton = screen.getByRole('button', { name: /экспортировать все заметки/i });
    await user.click(exportButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('imports notes from file', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['{"notes": []}'], 'notes.json', { type: 'application/json' });
    
    renderWithProviders(<SettingsPage />);
    
    const fileInput = screen.getByLabelText(/импортировать заметки/i);
    await user.upload(fileInput, mockFile);
    
    await waitFor(() => {
      expect(screen.getByText(/импорт завершён/i)).toBeInTheDocument();
    });
  });

  it('validates imported file format', async () => {
    const user = userEvent.setup();
    const invalidFile = new File(['invalid json'], 'notes.txt', { type: 'text/plain' });
    
    renderWithProviders(<SettingsPage />);
    
    const fileInput = screen.getByLabelText(/импортировать заметки/i);
    await user.upload(fileInput, invalidFile);
    
    await waitFor(() => {
      expect(screen.getByText(/неверный формат файла/i)).toBeInTheDocument();
    });
  });

  it('clears all data with confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn().mockReturnValue(true);
    
    renderWithProviders(<SettingsPage />);
    
    const clearButton = screen.getByRole('button', { name: /очистить все данные/i });
    await user.click(clearButton);
    
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('удалить все заметки')
    );
    expect(localStorage.clear).toHaveBeenCalled();
  });

  it('cancels data clearing when not confirmed', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn().mockReturnValue(false);
    
    renderWithProviders(<SettingsPage />);
    
    const clearButton = screen.getByRole('button', { name: /очистить все данные/i });
    await user.click(clearButton);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(localStorage.clear).not.toHaveBeenCalled();
  });

  it('shows application statistics', () => {
    const mockNotes = Array.from({ length: 10 }, (_, i) => ({
      id: `note-${i}`,
      title: `Note ${i}`,
      content: '<p>Content</p>',
      tags: ['test'],
      isFavorite: i < 3,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      isArchived: i > 7
    }));
    
    mockedNoteStorage.loadNotes.mockImplementation((includeArchived) => 
      includeArchived ? mockNotes : mockNotes.filter(n => !n.isArchived)
    );
    
    renderWithProviders(<SettingsPage />);
    
    expect(screen.getByText(/всего заметок: 8/i)).toBeInTheDocument();
    expect(screen.getByText(/избранных: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/в архиве: 2/i)).toBeInTheDocument();
  });

  it('toggles auto-save setting', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);
    
    const autoSaveToggle = screen.getByRole('checkbox', { name: /автосохранение/i });
    await user.click(autoSaveToggle);
    
    expect(localStorage.setItem).toHaveBeenCalledWith('notesflow-autosave', 'true');
  });

  it('loads saved auto-save preference', () => {
    localStorage.setItem('notesflow-autosave', 'true');
    renderWithProviders(<SettingsPage />);
    
    const autoSaveToggle = screen.getByRole('checkbox', { name: /автосохранение/i });
    expect(autoSaveToggle).toBeChecked();
  });

  it('changes default view mode', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);
    
    const viewModeSelect = screen.getByLabelText(/режим просмотра по умолчанию/i);
    await user.selectOptions(viewModeSelect, 'list');
    
    expect(localStorage.setItem).toHaveBeenCalledWith('notesflow-default-view', 'list');
  });

  it('sets notes per page limit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);
    
    const notesPerPageInput = screen.getByLabelText(/заметок на странице/i);
    await user.clear(notesPerPageInput);
    await user.type(notesPerPageInput, '25');
    
    expect(localStorage.setItem).toHaveBeenCalledWith('notesflow-notes-per-page', '25');
  });

  it('validates notes per page input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);
    
    const notesPerPageInput = screen.getByLabelText(/заметок на странице/i);
    await user.clear(notesPerPageInput);
    await user.type(notesPerPageInput, '0');
    
    await waitFor(() => {
      expect(screen.getByText(/минимум 5 заметок/i)).toBeInTheDocument();
    });
  });

  it('shows welcome modal toggle', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);
    
    const welcomeToggle = screen.getByRole('checkbox', { name: /показывать приветствие/i });
    await user.click(welcomeToggle);
    
    expect(localStorage.setItem).toHaveBeenCalledWith('notesflow-show-welcome', 'false');
  });

  it('resets all settings', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn().mockReturnValue(true);
    
    renderWithProviders(<SettingsPage />);
    
    const resetButton = screen.getByRole('button', { name: /сбросить настройки/i });
    await user.click(resetButton);
    
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('сбросить все настройки')
    );
    
    // Проверяем, что настройки были очищены
    expect(localStorage.removeItem).toHaveBeenCalledWith('notesflow-autosave');
    expect(localStorage.removeItem).toHaveBeenCalledWith('notesflow-default-view');
  });

  it('shows keyboard shortcuts section', () => {
    renderWithProviders(<SettingsPage />);
    
    expect(screen.getByText('Горячие клавиши')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+F')).toBeInTheDocument();
  });

  it('shows application version', () => {
    renderWithProviders(<SettingsPage />);
    
    expect(screen.getByText(/версия/i)).toBeInTheDocument();
    expect(screen.getByText(/notesflow/i)).toBeInTheDocument();
  });

  it('has proper section organization', () => {
    renderWithProviders(<SettingsPage />);
    
    const sections = screen.getAllByRole('region');
    expect(sections.length).toBeGreaterThan(0);
    
    sections.forEach(section => {
      expect(section).toHaveAttribute('aria-labelledby');
    });
  });

  it('handles storage errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock localStorage error
    const mockSetItem = jest.fn().mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    Object.defineProperty(window, 'localStorage', {
      value: { setItem: mockSetItem, getItem: jest.fn() },
    });
    
    renderWithProviders(<SettingsPage />);
    
    const autoSaveToggle = screen.getByRole('checkbox', { name: /автосохранение/i });
    await user.click(autoSaveToggle);
    
    await waitFor(() => {
      expect(screen.getByText(/ошибка сохранения настроек/i)).toBeInTheDocument();
    });
  });

  it('has accessible form elements', () => {
    renderWithProviders(<SettingsPage />);
    
    const formElements = screen.getAllByRole('checkbox').concat(
      screen.getAllByRole('combobox'),
      screen.getAllByRole('spinbutton')
    );
    
    formElements.forEach(element => {
      expect(element).toHaveAccessibleName();
    });
  });
});
