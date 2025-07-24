import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../ThemeToggle";
import { ThemeProvider } from "../../context/ThemeContext";

// Mock для localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock для matchMedia
const mockMatchMedia = {
  matches: false,
  media: "(prefers-color-scheme: dark)",
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => mockMatchMedia),
});

// Компонент для тестирования с провайдером темы
const renderWithTheme = (
  component: React.ReactElement,
  initialTheme = "light",
) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockMatchMedia.matches = false;
  });

  it("renders theme toggle button", () => {
    renderWithTheme(<ThemeToggle />);

    // Ищем кнопку по title атрибуту
    const themeButton = screen.getByRole("button", {
      name: /переключить на тёмную тему/i,
    });
    expect(themeButton).toBeInTheDocument();
  });

  it("toggles theme when clicked", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);

    const themeButton = screen.getByRole("button", {
      name: /переключить на тёмную тему/i,
    });
    await user.click(themeButton);

    // После клика должна появиться кнопка для переключения на светлую тему
    expect(
      screen.getByRole("button", { name: /переключить на светлую тему/i }),
    ).toBeInTheDocument();
  });

  it("shows correct icon for light theme", () => {
    renderWithTheme(<ThemeToggle />);

    const themeButton = screen.getByRole("button", {
      name: /переключить на тёмную тему/i,
    });
    const moonIcon = themeButton.querySelector("svg");
    expect(moonIcon).toBeInTheDocument();
  });

  it("shows correct icon for dark theme", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);

    const lightThemeButton = screen.getByRole("button", {
      name: /переключить на тёмную тему/i,
    });
    await user.click(lightThemeButton);

    const darkThemeButton = screen.getByRole("button", {
      name: /переключить на светлую тему/i,
    });
    const sunIcon = darkThemeButton.querySelector("svg");
    expect(sunIcon).toBeInTheDocument();
  });

  it("detects system theme preference", () => {
    mockMatchMedia.matches = true; // темная тема в системе
    renderWithTheme(<ThemeToggle />);

    // Поскольку система предпочитает темную тему, должна быть кнопка для переключения на светлую
    const themeButton = screen.getByRole("button", {
      name: /переключить на светлую тему/i,
    });
    expect(themeButton).toBeInTheDocument();
  });

  it("responds to system theme changes", () => {
    renderWithTheme(<ThemeToggle />);

    // Проверяем, что addEventListener был вызван
    expect(mockMatchMedia.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("has smooth transition animation", () => {
    renderWithTheme(<ThemeToggle />);

    const themeButton = screen.getByRole("button", {
      name: /переключить на тёмную тему/i,
    });
    expect(themeButton).toHaveClass("transition-all", "duration-300");
  });

  it("shows tooltip on hover", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);

    const themeButton = screen.getByRole("button", {
      name: /переключить на тёмную тему/i,
    });
    expect(themeButton).toHaveAttribute("title", "Переключить на тёмную тему");
  });

  it("updates tooltip text based on current theme", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);

    const lightThemeButton = screen.getByRole("button", {
      name: /переключить на тёмную тему/i,
    });
    await user.click(lightThemeButton);

    const darkThemeButton = screen.getByRole("button", {
      name: /переключить на светлую тему/i,
    });
    expect(darkThemeButton).toHaveAttribute(
      "title",
      "Переключить на светлую тему",
    );
  });

  it("maintains focus after theme change", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);

    const initialButton = screen.getByRole("button", {
      name: /переключить на тёмную тему/i,
    });
    initialButton.focus();

    await user.click(initialButton);

    const newButton = screen.getByRole("button", {
      name: /переключить на светлую тему/i,
    });
    expect(newButton).toHaveFocus();
  });

  it("has accessible button structure", () => {
    renderWithTheme(<ThemeToggle />);

    const themeButton = screen.getByRole("button", {
      name: /переключить на тёмную тему/i,
    });
    expect(themeButton).toHaveAttribute("title");
    expect(themeButton.querySelector("svg")).toBeInTheDocument();
  });

  it("persists theme preference", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);

    const themeButton = screen.getByRole("button", {
      name: /переключить на тёмную тему/i,
    });
    await user.click(themeButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
  });
});
