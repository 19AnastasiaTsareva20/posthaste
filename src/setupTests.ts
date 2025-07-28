import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

// Настройка для более быстрого выполнения тестов
configure({
  testIdAttribute: "data-testid",
  asyncUtilTimeout: 2000,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.matchMedia - Полная реализация
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: query === "(prefers-color-scheme: dark)",
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock URL methods
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(),
});
Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock window methods
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(),
});
Object.defineProperty(window, 'alert', {
  writable: true,
  value: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  document.documentElement.className = '';
});

// Подавление ошибок console.error
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("ReactDOMTestUtils.act") ||
        args[0].includes("Warning: An update to") ||
        args[0].includes("Warning: Can't perform a React state update on an unmounted component"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
