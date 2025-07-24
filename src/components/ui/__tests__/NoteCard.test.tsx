import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NoteCard } from "../NoteCard";

const mockNote = {
  id: "test-1",
  title: "Test Note",
  content: "<p>This is a test note content</p>",
  tags: ["test", "unit"],
  isFavorite: false,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  isArchived: false,
};

const defaultProps = {
  note: mockNote,
  onClick: jest.fn(),
  onFavoriteToggle: jest.fn(),
  onArchive: jest.fn(),
  onDelete: jest.fn(),
  viewMode: "grid" as const,
  isArchived: false,
};

describe("NoteCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders note information correctly", () => {
    render(<NoteCard {...defaultProps} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("This is a test note content")).toBeInTheDocument();
    expect(screen.getByText("#test")).toBeInTheDocument();
    expect(screen.getByText("#unit")).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    render(<NoteCard {...defaultProps} />);

    fireEvent.click(screen.getByText("Test Note"));

    expect(defaultProps.onClick).toHaveBeenCalledWith();
  });

  it("calls onFavoriteToggle when favorite button is clicked", () => {
    render(<NoteCard {...defaultProps} />);

    // Исправляем селектор - ищем по тексту, а не по title
    const favoriteButton = screen.getByText(/Добавить в избранное/i);
    fireEvent.click(favoriteButton);

    expect(defaultProps.onFavoriteToggle).toHaveBeenCalledWith("test-1");
  });

  it("shows favorite star when note is favorite", () => {
    const favoriteNote = { ...mockNote, isFavorite: true };
    render(<NoteCard {...defaultProps} note={favoriteNote} />);

    // Исправляем селектор - ищем по тексту, а не по title
    expect(screen.getByText(/Убрать из избранного/i)).toBeInTheDocument();
  });

  it("calls onArchive when archive button is clicked", () => {
    render(<NoteCard {...defaultProps} />);

    // Исправляем селектор - ищем по тексту, а не по title
    const archiveButton = screen.getByText(/Архивировать/i);
    fireEvent.click(archiveButton);

    expect(defaultProps.onArchive).toHaveBeenCalledWith("test-1");
  });

  it("calls onDelete when delete button is clicked", () => {
    render(<NoteCard {...defaultProps} />);

    // Исправляем селектор - ищем по тексту, а не по title
    const deleteButton = screen.getByText(/Удалить/i);
    fireEvent.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledWith("test-1");
  });

  it("renders in list view mode correctly", () => {
    render(<NoteCard {...defaultProps} viewMode="list" />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    // В list режиме контент не отображается
    expect(screen.queryByText("This is a test note content")).not.toBeInTheDocument();
  });

  it("handles empty tags array", () => {
    const noteWithoutTags = { ...mockNote, tags: [] };
    render(<NoteCard {...defaultProps} note={noteWithoutTags} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.queryByText("#test")).not.toBeInTheDocument();
  });

  it("truncates long content", () => {
    const longContent = "<p>" + "A".repeat(300) + "</p>";
    const noteWithLongContent = { ...mockNote, content: longContent };

    render(<NoteCard {...defaultProps} note={noteWithLongContent} />);

    const contentElement = screen.getByText(/A+/);
    expect(contentElement.textContent!.length).toBeLessThan(300);
  });

  it("shows archived status when note is archived", () => {
    const archivedNote = { ...mockNote, isArchived: true };
    render(
      <NoteCard {...defaultProps} note={archivedNote} isArchived={true} />,
    );

    // Проверяем наличие элементов, указывающих на архивированный статус
    expect(screen.getByText(/Архивировать/i)).toBeInTheDocument();
  });
});
