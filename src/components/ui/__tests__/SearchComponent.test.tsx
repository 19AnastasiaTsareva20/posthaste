import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchComponent } from '../SearchComponent';

describe('SearchComponent', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Search notes...'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with placeholder text', () => {
    render(<SearchComponent {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<SearchComponent {...defaultProps} value="test query" />);
    
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    render(<SearchComponent {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search notes...');
    await user.type(input, 'test');
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('test');
  });

  it('shows search icon', () => {
    render(<SearchComponent {...defaultProps} />);
    
    // Проверяем наличие SVG иконки поиска
    const searchIcon = screen.getByRole('textbox').parentElement?.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('shows clear button when there is text', () => {
    render(<SearchComponent {...defaultProps} value="some text" />);
    
    const clearButton = screen.getByTitle(/очистить/i);
    expect(clearButton).toBeInTheDocument();
  });

  it('does not show clear button when empty', () => {
    render(<SearchComponent {...defaultProps} value="" />);
    
    const clearButton = screen.queryByTitle(/очистить/i);
    expect(clearButton).not.toBeInTheDocument();
  });

  it('calls onChange with empty string when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchComponent {...defaultProps} value="some text" />);
    
    const clearButton = screen.getByTitle(/очистить/i);
    await user.click(clearButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('');
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<SearchComponent {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search notes...');
    await user.click(input);
    
    expect(input).toHaveFocus();
  });

  it('applies custom className when provided', () => {
    render(<SearchComponent {...defaultProps} className="custom-class" />);
    
    const container = screen.getByPlaceholderText('Search notes...').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('is accessible', () => {
    render(<SearchComponent {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });
});
