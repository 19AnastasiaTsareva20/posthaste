import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportManager } from "../ExportManager";

const mockNote = {
  id: "test-1",
  title: "Test Note",
  content: "<p>This is <strong>bold</strong> content</p>",
  tags: ["test", "export"],
  isFavorite: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  isArchived: false,
};

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = jest.fn().mockReturnValue("blob:mock-url");
const mockRevokeObjectURL = jest.fn();

Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: mockCreateObjectURL,
});

Object.defineProperty(global.URL, 'revokeObjectURL', {
  writable: true,
  value: mockRevokeObjectURL,
});

// Mock document.createElement('a') правильно
const mockClick = jest.fn();
const mockAnchor = {
  href: '',
  download: '',
  click: mockClick,
  style: {},
  setAttribute: jest.fn(),
};

const originalCreateElement = document.createElement;

beforeEach(() => {
  jest.clearAllMocks();
  // Восстанавливаем оригинальный createElement перед каждым тестом
  document.createElement = originalCreateElement;
  
  // Мокируем только для создания <a> элемента
  document.createElement = jest.fn().mockImplementation((tagName) => {
    if (tagName === 'a') {
      return mockAnchor;
    }
    // Для всех остальных элементов используем оригинальную реализацию
    return originalCreateElement.call(document, tagName);
  });
});

describe("ExportManager", () => {
  it("renders export options", () => {
    const mockOnExport = jest.fn();
    render(<ExportManager onExport={mockOnExport} />);

    expect(screen.getByText(/Экспорт JSON/i)).toBeInTheDocument();
    expect(screen.getByText(/Экспорт CSV/i)).toBeInTheDocument();
    expect(screen.getByText(/Экспорт Markdown/i)).toBeInTheDocument();
  });

  it("calls onExport with correct format when JSON button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnExport = jest.fn();
    render(<ExportManager onExport={mockOnExport} />);

    const jsonButton = screen.getByText("Экспорт JSON");
    await user.click(jsonButton);

    expect(mockOnExport).toHaveBeenCalledWith("json");
  });

  it("calls onExport with correct format when CSV button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnExport = jest.fn();
    render(<ExportManager onExport={mockOnExport} />);

    const csvButton = screen.getByText("Экспорт CSV");
    await user.click(csvButton);

    expect(mockOnExport).toHaveBeenCalledWith("csv");
  });

  it("calls onExport with correct format when Markdown button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnExport = jest.fn();
    render(<ExportManager onExport={mockOnExport} />);

    const markdownButton = screen.getByText("Экспорт Markdown");
    await user.click(markdownButton);

    expect(mockOnExport).toHaveBeenCalledWith("markdown");
  });
});
