import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock localStorage
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: mockGetItem,
    setItem: mockSetItem,
  },
});

// Mock window.matchMedia
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Test component that uses the theme context
const TestComponent: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="is-dark">{isDark.toString()}</span>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.className = '';
  });

  it('provides default light theme', () => {
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
  });

  it('loads theme from localStorage', () => {
    mockGetItem.mockReturnValue('dark');
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    expect(mockGetItem).toHaveBeenCalledWith('notesflow-theme');
  });

  it('detects system dark mode preference', () => {
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({
      matches: true, // system prefers dark mode
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
  });

  it('toggles theme when toggleTheme is called', async () => {
    const user = userEvent.setup();
    mockGetItem.mockReturnValue('light');
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    const toggleButton = screen.getByTestId('toggle-button');
    await user.click(toggleButton);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
  });

  it('saves theme to localStorage when changed', async () => {
    const user = userEvent.setup();
    mockGetItem.mockReturnValue('light');
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');
    await user.click(toggleButton);

    expect(mockSetItem).toHaveBeenCalledWith('notesflow-theme', 'dark');
  });

  it('applies theme class to document.documentElement', () => {
    mockGetItem.mockReturnValue('dark');
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class when switching to light theme', async () => {
    const user = userEvent.setup();
    mockGetItem.mockReturnValue('dark');
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const toggleButton = screen.getByTestId('toggle-button');
    await user.click(toggleButton);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('listens to system theme changes', () => {
    const mockAddEventListener = jest.fn();
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('responds to system theme change events', () => {
    let changeHandler: ((e: { matches: boolean }) => void) | null = null;
    
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: (event: string, handler: any) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      },
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    // Симулируем изменение системной темы на тёмную
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true });
      }
    });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('cleans up event listeners on unmount', () => {
    const mockRemoveEventListener = jest.fn();
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: mockRemoveEventListener,
    });

    const { unmount } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('throws error when useTheme is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });

  it('preserves user preference over system preference', async () => {
    const user = userEvent.setup();
    mockGetItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({
      matches: true, // system prefers dark
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially uses system preference
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    // User manually switches to light
    const toggleButton = screen.getByTestId('toggle-button');
    await user.click(toggleButton);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(mockSetItem).toHaveBeenCalledWith('notesflow-theme', 'light');
  });
});
