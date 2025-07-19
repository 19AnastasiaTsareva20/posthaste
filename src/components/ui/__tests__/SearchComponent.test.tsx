import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchComponent } from '../SearchComponent';

describe('SearchComponent', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders search input with placeholder', () => {
    render(<SearchComponent onSearch={mockOnSearch} placeholder="Поиск тестов..." />);
    
    expect(screen.getByPlaceholderText('Поиск тестов...')).toBeInTheDocument();
  });

  test('calls onSearch with debounced input', async () => {
    render(<SearchComponent onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'тест поиска' } });
    
    // Fast-forward timer/Ускоряем таймер
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('тест поиска');
    });
  });

  test('shows clear button when there is input', () => {
    render(<SearchComponent onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'тест' } });
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('clears input when clear button is clicked', () => {
    render(<SearchComponent onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'тест' } });
    
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);
    
    expect(input.value).toBe('');
  });
});
