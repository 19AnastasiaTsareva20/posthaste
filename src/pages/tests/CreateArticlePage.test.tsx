import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { CreateArticlePage } from "../CreateArticlePage";
import * as noteStorage from "../../utils/noteStorage";

// Mock the noteStorage module
jest.mock("../../utils/noteStorage");
const mockedNoteStorage = noteStorage as jest.Mocked<typeof noteStorage>;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: undefined }),
}));

// Mock the rich text editor
jest.mock("../../components/editor/RichTextEditor", () => ({
  RichTextEditor: ({ value, onChange, placeholder }: any) => (
    <textarea
      data-testid="rich-text-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("CreateArticlePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNoteStorage.saveNote.mockImplementation(() => {});
  });

  it("renders create page correctly", () => {
    renderWithRouter(<CreateArticlePage />);

    expect(screen.getByText("Создать заметку")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Заголовок заметки"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
    expect(screen.getByText("Сохранить")).toBeInTheDocument();
    expect(screen.getByText("Отмена")).toBeInTheDocument();
  });

  it("allows typing in title input", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateArticlePage />);

    const titleInput = screen.getByPlaceholderText("Заголовок заметки");
    await user.type(titleInput, "My New Note");

    expect(titleInput).toHaveValue("My New Note");
  });

  it("allows typing in content editor", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateArticlePage />);

    const contentEditor = screen.getByTestId("rich-text-editor");
    await user.type(contentEditor, "This is my note content");

    expect(contentEditor).toHaveValue("This is my note content");
  });

  it("adds tags when entered", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateArticlePage />);

    const tagInput = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(tagInput, "work");
    await user.keyboard("{Enter}");

    expect(screen.getByText("#work")).toBeInTheDocument();
  });

  it("removes tags when clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateArticlePage />);

    // Добавляем тег
    const tagInput = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(tagInput, "work");
    await user.keyboard("{Enter}");

    expect(screen.getByText("#work")).toBeInTheDocument();

    // Удаляем тег
    const removeButton = screen.getByRole("button", {
      name: /удалить тег work/i,
    });
    await user.click(removeButton);

    expect(screen.queryByText("#work")).not.toBeInTheDocument();
  });

  it("saves note when save button is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateArticlePage />);

    // Заполняем форму
    const titleInput = screen.getByPlaceholderText("Заголовок заметки");
    await user.type(titleInput, "Test Note");

    const contentEditor = screen.getByTestId("rich-text-editor");
    await user.type(contentEditor, "Test content");

    const tagInput = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(tagInput, "test");
    await user.keyboard("{Enter}");

    // Сохраняем
    const saveButton = screen.getByText("Сохранить");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockedNoteStorage.saveNote).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Note",
          content: "Test content",
          tags: ["test"],
          isFavorite: false,
          isArchived: false,
        }),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/articles");
    });
  });

  it("shows validation error for empty title", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateArticlePage />);

    const saveButton = screen.getByText("Сохранить");
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/заголовок обязателен/i)).toBeInTheDocument();
    });

    expect(mockedNoteStorage.saveNote).not.toHaveBeenCalled();
  });

  it("shows validation error for empty content", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateArticlePage />);

    const titleInput = screen.getByPlaceholderText("Заголовок заметки");
    await user.type(titleInput, "Test Note");

    const saveButton = screen.getByText("Сохранить");
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/содержание обязательно/i)).toBeInTheDocument();
    });

    expect(mockedNoteStorage.saveNote).not.toHaveBeenCalled();
  });

  it("navigates back when cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateArticlePage />);

    const cancelButton = screen.getByText("Отмена");
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith("/articles");
  });

  it("shows unsaved changes warning", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateArticlePage />);

    // Начинаем печатать
    const titleInput = screen.getByPlaceholderText("Заголовок заметки");
    await user.type(titleInput, "Test");

    // Пытаемся отменить
    const cancelButton = screen.getByText("Отмена");
    await user.click(cancelButton);

    // Должно появиться подтверждение
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("несохранённые изменения"),
    );
  });

  it("handles save errors gracefully", async () => {
    const user = userEvent.setup();
    mockedNoteStorage.saveNote.mockImplementation(() => {
      throw new Error("Save failed");
    });

    renderWithRouter(<CreateArticlePage />);

    const titleInput = screen.getByPlaceholderText("Заголовок заметки");
    await user.type(titleInput, "Test Note");

    const contentEditor = screen.getByTestId("rich-text-editor");
    await user.type(contentEditor, "Test content");

    const saveButton = screen.getByText("Сохранить");
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/ошибка сохранения/i)).toBeInTheDocument();
    });
  });

  it("auto-saves draft periodically", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();

    renderWithRouter(<CreateArticlePage />);

    const titleInput = screen.getByPlaceholderText("Заголовок заметки");
    await user.type(titleInput, "Draft Note");

    // Ждём автосохранение (30 секунд)
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(screen.getByText(/черновик сохранён/i)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});
