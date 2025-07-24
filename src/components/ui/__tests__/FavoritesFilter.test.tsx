import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FavoritesFilter } from "../FavoritesFilter";

describe("FavoritesFilter", () => {
  const defaultProps = {
    showFavoritesOnly: false,
    onToggle: jest.fn(),
    favoritesCount: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders favorites filter checkbox", () => {
    render(<FavoritesFilter {...defaultProps} />);

    expect(
      screen.getByRole("checkbox", { name: /показать только избранные/i }),
    ).toBeInTheDocument();
  });

  it("has unchecked state initially", () => {
    render(<FavoritesFilter {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("has checked state when showFavoritesOnly is true", () => {
    render(<FavoritesFilter {...defaultProps} showFavoritesOnly={true} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup();
    render(<FavoritesFilter {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(defaultProps.onToggle).toHaveBeenCalledWith(true);
  });

  it("toggles state when clicked multiple times", async () => {
    const user = userEvent.setup();
    render(<FavoritesFilter {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(defaultProps.onToggle).toHaveBeenCalledWith(true);

    await user.click(checkbox);
    expect(defaultProps.onToggle).toHaveBeenCalledWith(false);
  });

  it("has accessible label", () => {
    render(<FavoritesFilter {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAccessibleName();
    expect(checkbox.closest("label")).toHaveTextContent(
      "Показать только избранные",
    );
  });

  it("handles keyboard interaction", async () => {
    const user = userEvent.setup();
    render(<FavoritesFilter {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    checkbox.focus();

    expect(checkbox).toHaveFocus();

    await user.keyboard(" ");
    expect(defaultProps.onToggle).toHaveBeenCalledWith(true);
  });

  it("works with custom className", () => {
    render(<FavoritesFilter {...defaultProps} className="custom-class" />);

    const container = screen.getByTestId("favorites-filter");
    expect(container).toHaveClass("custom-class");
  });

  it("maintains state consistency", () => {
    const { rerender } = render(
      <FavoritesFilter {...defaultProps} showFavoritesOnly={false} />,
    );

    let checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    rerender(<FavoritesFilter {...defaultProps} showFavoritesOnly={true} />);
    checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("has proper component structure", () => {
    render(<FavoritesFilter {...defaultProps} />);

    const container = screen.getByTestId("favorites-filter");
    expect(container).toBeInTheDocument();

    const label = container.querySelector("label");
    expect(label).toBeInTheDocument();

    const checkbox = label?.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
  });
});
