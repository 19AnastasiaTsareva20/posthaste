import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NoteCard } from '../NoteCard';
import { Note } from '../../../types';

const mockNote: Note = {
  id: '1',
  title: 'Тестовая заметка',
  content: 'Это содержимое тестовой заметки для проверки компонента.',
  tags: ['тест', 'react'],
  folderId: undefined,
  isFavorite: false,
  isArchived: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02')
};

const mockProps = {
  note: mockNote,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onToggleFavorite: jest.fn(),
  onArchive: jest.fn(),
  onClick: jest.fn()
};

describe('NoteCard component', () => {
  beforeEach(() => {
    // Clear all mocks before each test/Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  test('renders note title and content', () => {
    render(<NoteCard {...mockProps} />);
    
    expect(screen.getByText('Тестовая заметка')).toBeInTheDocument();
    expect(screen.getByText(/Это содержимое тестовой заметки/)).toBeInTheDocument();
  });

  test('renders tags correctly', () => {
    render(<NoteCard {...mockProps} />);
    
    expect(screen.getByText('#тест')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    render(<NoteCard {...mockProps} />);
    
    const editButton = screen.getByText('Изменить');
    fireEvent.click(editButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockNote);
  });

  test('calls onToggleFavorite when favorite button is clicked', () => {
    render(<NoteCard {...mockProps} />);
    
    // Use aria-label to find favorite button/Используем aria-label для поиска кнопки избранного
    const favoriteButton = screen.getByLabelText('Добавить в избранное');
    fireEvent.click(favoriteButton);
    
    expect(mockProps.onToggleFavorite).toHaveBeenCalledWith('1');
  });

  test('shows confirmation and calls onDelete when delete button is clicked', () => {
    // Mock window.confirm/Мокаем window.confirm
    window.confirm = jest.fn(() => true);
    
    render(<NoteCard {...mockProps} />);
    
    const deleteButton = screen.getByText('Удалить');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith('Удалить заметку?');
    expect(mockProps.onDelete).toHaveBeenCalledWith('1');
  });

  test('shows confirmation and calls onArchive when archive button is clicked', () => {
    window.confirm = jest.fn(() => true);
    
    render(<NoteCard {...mockProps} />);
    
    const archiveButton = screen.getByText('📁');
    fireEvent.click(archiveButton);
    
    expect(window.confirm).toHaveBeenCalledWith('Архивировать заметку?');
    expect(mockProps.onArchive).toHaveBeenCalledWith('1');
  });

  test('displays "Без названия" when title is empty', () => {
    const noteWithoutTitle = { ...mockNote, title: '' };
    render(<NoteCard {...mockProps} note={noteWithoutTitle} />);
    
    expect(screen.getByText('Без названия')).toBeInTheDocument();
  });

  test('shows favorite star when note is favorite', () => {
    const favoriteNote = { ...mockNote, isFavorite: true };
    render(<NoteCard {...mockProps} note={favoriteNote} />);
    
    // Find favorite button by aria-label and check color/Находим кнопку по aria-label и проверяем цвет
    const favoriteButton = screen.getByLabelText('Удалить из избранного');
    expect(favoriteButton).toHaveClass('text-yellow-500');
  });

  test('calls onClick when card is clicked', () => {
    render(<NoteCard {...mockProps} />);
    
    // Click on the card content area/Кликаем по области содержимого карточки
    const cardContent = screen.getByText('Тестовая заметка').closest('div');
    fireEvent.click(cardContent as Element);
    
    expect(mockProps.onClick).toHaveBeenCalledWith(mockNote);
  });

  test('does not show archive button when onArchive is not provided', () => {
    const propsWithoutArchive = { ...mockProps };
    delete propsWithoutArchive.onArchive;
    
    render(<NoteCard {...propsWithoutArchive} />);
    
    expect(screen.queryByText('📁')).not.toBeInTheDocument();
  });
});
