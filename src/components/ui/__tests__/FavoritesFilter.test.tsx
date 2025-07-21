import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FavoritesFilter } from '../FavoritesFilter';

describe('FavoritesFilter', () => {
  const defaultProps = {
    showFavoritesOnly: false,
    onChange: jest.fn(),
    favoritesCount: 5
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders favorites filter button', () => {
    render(<FavoritesFilter {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /избранные/i })).toBeInTheDocument();
  });

  it('shows favorites count', () => {
    render(<FavoritesFilter {...defaultProps} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows zero count when no favorites', () => {
    render(<FavoritesFilter {...defaultProps} favoritesCount={0} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('has inactive state initially', () => {
    render(<FavoritesFilter {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /избранные/i });
    expect(button).not.toHaveClass('bg-yellow-100');
    expect(button).toHaveClass('bg-gray-100');
  });

  it('has active state when favorites filter is enabled', () => {
    render(<FavoritesFilter {...defaultProps} showFavoritesOnly={true} />);
    
    const button = screen.getByRole('button', { name: /избранные/i });
    expect(button).toHaveClass('bg-yellow-100');
    expect(button).not.toHaveClass('bg-gray-100');
  });

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup();
    render(<FavoritesFilter {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /избранные/i });
    await user.click(button);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(true);
  });

  it('toggles state when clicked multiple times', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FavoritesFilter {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /избранные/i });
    await user.click(button);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(true);
    
    // Перерендериваем с новым состоянием
    rerender(<FavoritesFilter {...defaultProps} showFavoritesOnly={true} />);
    
    await user.click(button);
    expect(defaultProps.onChange).toHaveBeenCalledWith(false);
  });

  it('shows star icon', () => {
    render(<FavoritesFilter {...defaultProps} />);
    
    const starIcon = screen.getByRole('button').querySelector('[data-icon="star"]');
    expect(starIcon).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<FavoritesFilter {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /избранные/i });
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('title');
  });

  it('shows correct aria-pressed state', () => {
    const { rerender } = render(<FavoritesFilter {...defaultProps} />);
    
    let button = screen.getByRole('button', { name: /избранные/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    
    rerender(<FavoritesFilter {...defaultProps} showFavoritesOnly={true} />);
    
    button = screen.getByRole('button', { name: /избранные/i });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('handles keyboard interaction', async () => {
    const user = userEvent.setup();
    render(<FavoritesFilter {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /избранные/i });
    button.focus();
    
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(defaultProps.onChange).toHaveBeenCalledWith(true);
    
    await user.keyboard(' ');
    expect(defaultProps.onChange).toHaveBeenCalledTimes(2);
  });

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup();
    render(<FavoritesFilter {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /избранные/i });
    await user.hover(button);
    
    expect(screen.getByText(/показать только избранные/i)).toBeInTheDocument();
  });

  it('updates tooltip text when active', async () => {
    const user = userEvent.setup();
    render(<FavoritesFilter {...defaultProps} showFavoritesOnly={true} />);
    
    const button = screen.getByRole('button', { name: /избранные/i });
    await user.hover(button);
    
    expect(screen.getByText(/показать все заметки/i)).toBeInTheDocument();
  });

  it('handles large favorites count', () => {
    render(<FavoritesFilter {...defaultProps} favoritesCount={999} />);
    
    expect(screen.getByText('999')).toBeInTheDocument();
  });

  it('handles very large favorites count with abbreviation', () => {
    render(<FavoritesFilter {...defaultProps} favoritesCount={1234} />);
    
    expect(screen.getByText('999+')).toBeInTheDocument();
  });

  it('has smooth transition animations', () => {
    render(<FavoritesFilter {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /избранные/i });
    const computedStyle = window.getComputedStyle(button);
    
    expect(computedStyle.transition).toContain('background-color');
    expect(computedStyle.transition).toContain('color');
  });

  it('maintains focus after state change', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FavoritesFilter {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /избранные/i });
    button.focus();
    
    await user.click(button);
    
    // Перерендериваем с новым состоянием
    rerender(<FavoritesFilter {...defaultProps} showFavoritesOnly={true} />);
    
    expect(screen.getByRole('button', { name: /избранные/i })).toHaveFocus();
  });

  it('works with custom className', () => {
    render(<FavoritesFilter {...defaultProps} className="custom-class" />);
    
    const button = screen.getByRole('button', { name: /избранные/i });
    expect(button).toHaveClass('custom-class');
  });
});
