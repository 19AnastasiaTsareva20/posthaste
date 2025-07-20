import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WelcomeModal } from '../WelcomeModal';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('WelcomeModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome modal when open', () => {
    render(<WelcomeModal {...defaultProps} />);
    
    expect(screen.getByText(/добро пожаловать в notesflow/i)).toBeInTheDocument();
    expect(screen.getByText(/начать работу/i)).toBeInTheDocument();
    expect(screen.getByText(/не показывать снова/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<WelcomeModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText(/добро пожаловать/i)).not.toBeInTheDocument();
  });

  it('shows app features', () => {
    render(<WelcomeModal {...defaultProps} />);
    
    expect(screen.getByText(/создавайте заметки/i)).toBeInTheDocument();
    expect(screen.getByText(/организуйте с помощью тегов/i)).toBeInTheDocument();
    expect(screen.getByText(/ищите и фильтруйте/i)).toBeInTheDocument();
    expect(screen.getByText(/экспортируйте в разных форматах/i)).toBeInTheDocument();
  });

  it('has feature icons', () => {
    render(<WelcomeModal {...defaultProps} />);
    
    // Проверяем наличие SVG иконок для каждой функции
    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons.length).toBeGreaterThan(0);
  });

  it('closes modal when start button is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);
    
    const startButton = screen.getByRole('button', { name: /начать работу/i });
    await user.click(startButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /закрыть/i });
    await user.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('closes modal when ESC key is pressed', () => {
    render(<WelcomeModal {...defaultProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('closes modal when overlay is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);
    
    const overlay = screen.getByTestId('modal-overlay');
    await user.click(overlay);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not close when modal content is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);
    
    const modalContent = screen.getByRole('dialog');
    await user.click(modalContent);
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('saves preference when "do not show again" is checked', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox', { name: /не показывать снова/i });
    await user.click(checkbox);
    
    const startButton = screen.getByRole('button', { name: /начать работу/i });
    await user.click(startButton);
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'notesflow-hide-welcome', 
      'true'
    );
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(<WelcomeModal {...defaultProps} />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-labelledby');
    expect(modal).toHaveAttribute('aria-describedby');
    
    const title = screen.getByRole('heading');
    expect(title).toHaveAttribute('id');
  });

  it('traps focus within modal', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);
    
    const firstButton = screen.getByRole('button', { name: /начать работу/i });
    const lastButton = screen.getByRole('button', { name: /закрыть/i });
    
    // Focus должен быть на первом элементе
    expect(firstButton).toHaveFocus();
    
    // Tab должен перемещать фокус по элементам
    await user.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
    
    await user.tab();
    expect(lastButton).toHaveFocus();
    
    // Shift+Tab должен вернуть фокус назад
    await user.tab({ shift: true });
    expect(screen.getByRole('checkbox')).toHaveFocus();
  });

  it('prevents background scrolling when open', () => {
    render(<WelcomeModal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores background scrolling when closed', () => {
    const { rerender } = render(<WelcomeModal {...defaultProps} />);
    
    rerender(<WelcomeModal {...defaultProps} isOpen={false} />);
    
    expect(document.body.style.overflow).toBe('');
  });

  it('shows different content for returning users', () => {
    localStorage.getItem = jest.fn().mockReturnValue('true');
    
    render(<WelcomeModal {...defaultProps} />);
    
    expect(screen.getByText(/с возвращением/i)).toBeInTheDocument();
  });

  it('has smooth animations', () => {
    render(<WelcomeModal {...defaultProps} />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('animate-in');
  });

  it('shows keyboard shortcuts tip', () => {
    render(<WelcomeModal {...defaultProps} />);
    
    expect(screen.getByText(/горячие клавиши/i)).toBeInTheDocument();
    expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
  });
});
