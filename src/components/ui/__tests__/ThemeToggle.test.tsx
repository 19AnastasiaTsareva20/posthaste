import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../ThemeToggle";
// Исправляем путь к ThemeProvider
import { ThemeProvider } from "../../../contexts/ThemeContext";

// Mock для localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // устаревший метод
    removeListener: jest.fn(), // устаревший метод
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Сбрасываем классы на html элементе
    document.documentElement.className = "";
  });

  it("renders theme toggle button", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toBeInTheDocument();
  });

  it("shows sun icon in light theme", () => {
    localStorageMock.getItem.mockReturnValue("light");
    window.matchMedia.mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: light)",
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const sunIcon = screen.getByLabelText(/светлая тема/i);
    expect(sunIcon).toBeInTheDocument();
  });

  it("shows moon icon in dark theme", () => {
    localStorageMock.getItem.mockReturnValue("dark");
    window.matchMedia.mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const moonIcon = screen.getByLabelText(/тёмная тема/i);
    expect(moonIcon).toBeInTheDocument();
  });

  it("toggles theme when clicked", async () => {
    const user = userEvent.setup();
    localStorageMock.getItem.mockReturnValue("light");

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggleButton = screen.getByRole("button");
    await user.click(toggleButton);

    // После клика должна быть тёмная тема
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "posthaste-theme",
      "dark",
    );
  });

  it("applies dark theme class to document", async () => {
    const user = userEvent.setup();
    localStorageMock.getItem.mockReturnValue("light");

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggleButton = screen.getByRole("button");
    await user.click(toggleButton);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("applies light theme class to document", async () => {
    const user = userEvent.setup();
    localStorageMock.getItem.mockReturnValue("dark");

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggleButton = screen.getByRole("button");
    await user.click(toggleButton);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("detects system theme preference", () => {
    localStorageMock.getItem.mockReturnValue(null);
    window.matchMedia.mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)", // Система предпочитает тёмную тему
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Должна примениться тёмная тема
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("has accessible labels", () => {
    localStorageMock.getItem.mockReturnValue("light");

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toHaveAttribute("aria-label");
  });
});
