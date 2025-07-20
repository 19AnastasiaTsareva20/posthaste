import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../../../contexts/ThemeContext';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query.includes('dark'),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const renderWithTheme = (component: React.ReactElement, theme = 'light') => {
  // Mock localStorage
  const mockGetItem = jest.fn().mockReturnValue(theme);
  const mockSetItem = jest.fn();
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: mockGetItem,
      setItem: mockSetItem,
    },
  });

  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders theme toggle button', () => {
    renderWithTheme(<ThemeToggle />);
    
    expect(screen.getByRole('button', { name: /переключить тему/i })).toBeInTheDocument();
  });

  it('shows sun icon in light mode', () => {
    renderWithTheme(<ThemeToggle />, 'light');
    
    const button = screen.getByRole('button');
    const sunIcon = button.querySelector('[data-icon="sun"]');
    expect(sunIcon).toBeInTheDocument();
  });

  it('shows moon icon in dark mode', () => {
    renderWithTheme(<ThemeToggle />, 'dark');
    
    const button = screen.getByRole('button');
    const moonIcon = button.querySelector('[data-icon="moon"]');
    expect(moonIcon).toBeInTheDocument();
  });

  it('toggles theme when clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />, 'light');
    
    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);
    
    // После клика должна поменяться иконка
    const moonIcon = toggleButton.querySelector('[data-icon="moon"]');
    expect(moonIcon).toBeInTheDocument();
  });

  it('saves theme preference to localStorage', async () => {
    const mockSetItem = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('light'),
        setItem: mockSetItem,
      },
    });

    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);
    
    expect(mockSetItem).toHaveBeenCalledWith('notesflow-theme', 'dark');
  });

  it('applies theme class to document.documentElement', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />, 'light');
    
    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('has proper accessibility attributes', () => {
    renderWithTheme(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('title');
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    
    // Тема должна переключиться
    const moonIcon = button.querySelector('[data-icon="moon"]');
    expect(moonIcon).toBeInTheDocument();
  });

  it('handles space key activation', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    button.focus();
    
    await user.keyboard(' ');
    
    const moonIcon = button.querySelector('[data-icon="moon"]');
    expect(moonIcon).toBeInTheDocument();
  });

  it('detects system theme preference', () => {
    // Mock system dark mode preference
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query.includes('dark') ? true : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    // При отсутствии сохранённых настроек должна использоваться системная тема
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
      },
    });

    renderWithTheme(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    const moonIcon = button.querySelector('[data-icon="moon"]');
    expect(moonIcon).toBeInTheDocument();
  });

  it('responds to system theme changes', () => {
    const mockMatchMedia = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    window.matchMedia = jest.fn().mockReturnValue(mockMatchMedia);

    renderWithTheme(<ThemeToggle />);
    
    // Симулируем изменение системной темы
    const themeChangeEvent = { matches: true };
    mockMatchMedia.addEventListener.mock.calls[0][1](themeChangeEvent);
    
    const button = screen.getByRole('button');
    const moonIcon = button.querySelector('[data-icon="moon"]');
    expect(moonIcon).toBeInTheDocument();
  });

  it('has smooth transition animation', () => {
    renderWithTheme(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    const computedStyle = window.getComputedStyle(button);
    
    expect(computedStyle.transition).toContain('background-color');
  });

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    await user.hover(button);
    
    expect(screen.getByText(/переключить на тёмную тему/i)).toBeInTheDocument();
  });

  it('updates tooltip text based on current theme', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />, 'dark');
    
    const button = screen.getByRole('button');
    await user.hover(button);
    
    expect(screen.getByText(/переключить на светлую тему/i)).toBeInTheDocument();
  });

  it('maintains focus after theme change', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    button.focus();
    
    await user.click(button);
    
    expect(button).toHaveFocus();
  });
});
