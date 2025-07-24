import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { ArchivePage } from "../ArchivePage";
import * as noteStorage from "../../utils/noteStorage";

// Mock the noteStorage module
jest.mock("../../utils/noteStorage");
const mockedNoteStorage = noteStorage as jest.Mocked<typeof noteStorage>;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockArchivedNotes = [
  {
    id: "archived-1",
    title: "Archived Note 1",
    content: "<p>First archived note</p>",
    tags: ["work"],
    isFavorite: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    isArchived: true,
    archivedAt: "2024-01-10T00:00:00.000Z",
  },
  {
    id: "archived-2",
    title: "Archived Note 2",
    content: "<p>Second archived note</p>",
    tags: ["personal"],
    isFavorite: true,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    isArchived: true,
    archivedAt: "2024-01-11T00:00:00.000Z",
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ArchivePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNoteStorage.loadNotes.mockImplementation((includeArchived) =>
      includeArchived ? mockArchivedNotes : [],
    );
  });

  it("renders archive page correctly", async () => {
    renderWithRouter(<ArchivePage />);

    await waitFor(() => {
      expect(screen.getByText("Архив заметок")).toBeInTheDocument();
      expect(screen.getByText("Archived Note 1")).toBeInTheDocument();
      expect(screen.getByText("Archived Note 2")).toBeInTheDocument();
    });
  });

  it("shows archived notes count", async () => {
    renderWithRouter(<ArchivePage />);

    await waitFor(() => {
      expect(screen.getByText("В архиве: 2")).toBeInTheDocument();
    });
  });

  it("restores note when restore button is clicked", async () => {
    const user = userEvent.setup();
    mockedNoteStorage.restoreNote.mockImplementation(() => {});

    renderWithRouter(<ArchivePage />);

    await waitFor(() => {
      expect(screen.getByText("Archived Note 1")).toBeInTheDocument();
    });

    const restoreButtons = screen.getAllByRole("button", {
      name: /восстановить/i,
    });
    await user.click(restoreButtons[0]);

    expect(mockedNoteStorage.restoreNote).toHaveBeenCalledWith("archived-1");
  });

  it("permanently deletes note when delete button is clicked", async () => {
    const user = userEvent.setup();
    mockedNoteStorage.deleteNote.mockImplementation(() => {});
    window.confirm = jest.fn().mockReturnValue(true);

    renderWithRouter(<ArchivePage />);

    await waitFor(() => {
      expect(screen.getByText("Archived Note 1")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", {
      name: /удалить навсегда/i,
    });
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("удалить навсегда"),
    );
    expect(mockedNoteStorage.deleteNote).toHaveBeenCalledWith("archived-1");
  });

  it("searches archived notes", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArchivePage />);

    await waitFor(() => {
      expect(screen.getByText("Archived Note 1")).toBeInTheDocument();
      expect(screen.getByText("Archived Note 2")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/поиск в архиве/i);
    await user.type(searchInput, "First");

    await waitFor(() => {
      expect(screen.getByText("Archived Note 1")).toBeInTheDocument();
      expect(screen.queryByText("Archived Note 2")).not.toBeInTheDocument();
    });
  });

  it("shows empty archive state", () => {
    mockedNoteStorage.loadNotes.mockReturnValue([]);

    renderWithRouter(<ArchivePage />);

    expect(screen.getByText(/архив пуст/i)).toBeInTheDocument();
    expect(screen.getByText(/вернуться к заметкам/i)).toBeInTheDocument();
  });

  it("shows archive date for each note", async () => {
    renderWithRouter(<ArchivePage />);

    await waitFor(() => {
      expect(screen.getByText(/архивировано:/i)).toBeInTheDocument();
      expect(screen.getByText("10.01.2024")).toBeInTheDocument();
    });
  });

  it("restores all notes when restore all button is clicked", async () => {
    const user = userEvent.setup();
    mockedNoteStorage.restoreNote.mockImplementation(() => {});
    window.confirm = jest.fn().mockReturnValue(true);

    renderWithRouter(<ArchivePage />);

    await waitFor(() => {
      expect(screen.getByText("Archived Note 1")).toBeInTheDocument();
    });

    const restoreAllButton = screen.getByRole("button", {
      name: /восстановить все/i,
    });
    await user.click(restoreAllButton);

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("восстановить все"),
    );
    expect(mockedNoteStorage.restoreNote).toHaveBeenCalledTimes(2);
  });

  it("clears entire archive when clear all button is clicked", async () => {
    const user = userEvent.setup();
    mockedNoteStorage.deleteNote.mockImplementation(() => {});
    window.confirm = jest.fn().mockReturnValue(true);

    renderWithRouter(<ArchivePage />);

    await waitFor(() => {
      expect(screen.getByText("Archived Note 1")).toBeInTheDocument();
    });

    const clearAllButton = screen.getByRole("button", {
      name: /очистить архив/i,
    });
    await user.click(clearAllButton);

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("очистить весь архив"),
    );
    expect(mockedNoteStorage.deleteNote).toHaveBeenCalledTimes(2);
  });

  it("navigates back to main page", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArchivePage />);

    const backButton = screen.getByRole("button", { name: /назад/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/articles");
  });

  it("sorts archived notes by archive date", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArchivePage />);

    await waitFor(() => {
      expect(screen.getByText("Archived Note 1")).toBeInTheDocument();
    });

    const sortSelect = screen.getByDisplayValue(/по архивации/i);
    await user.selectOptions(sortSelect, "title");

    expect(sortSelect).toHaveValue("title");
  });
});
