import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

// Настройка для более быстрого выполнения тестов
configure({
  testIdAttribute: "data-testid",
  // Увеличиваем timeout для async операций
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

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(window, "URL", {
  value: {
    createObjectURL: jest.fn(),
    revokeObjectURL: jest.fn(),
  },
});

// Mock window.confirm
Object.defineProperty(window, "confirm", {
  value: jest.fn(),
});

// Mock window.alert
Object.defineProperty(window, "alert", {
  value: jest.fn(),
});

// Mock window.prompt
Object.defineProperty(window, "prompt", {
  value: jest.fn(),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock document.execCommand
Object.defineProperty(document, "execCommand", {
  value: jest.fn(),
});

// Mock document.queryCommandState
Object.defineProperty(document, "queryCommandState", {
  value: jest.fn(),
});

// Mock getSelection
Object.defineProperty(window, "getSelection", {
  value: jest.fn().mockReturnValue({
    rangeCount: 1,
    getRangeAt: jest.fn().mockReturnValue({
      collapsed: false,
      startContainer: { nodeType: 3, textContent: "test" },
      endContainer: { nodeType: 3, textContent: "test" },
    }),
    removeAllRanges: jest.fn(),
    addRange: jest.fn(),
  }),
});

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();

  // Reset document.body overflow
  document.body.style.overflow = "";

  // Clear document.documentElement classes
  document.documentElement.className = "";
});

// Подавляем React.act warnings для тестов
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("ReactDOMTestUtils.act") ||
        args[0].includes("Warning: An update to"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
