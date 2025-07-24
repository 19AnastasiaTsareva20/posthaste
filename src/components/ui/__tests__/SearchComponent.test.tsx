import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchComponent } from "../SearchComponent";

describe("SearchComponent", () => {
  const defaultProps = {
    value: "",
    onChange: jest.fn(),
    placeholder: "Поиск заметок...",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search input", () => {
    render(<SearchComponent {...defaultProps} />);

    const searchInput = screen.getByRole("textbox");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("placeholder", "Поиск заметок...");
  });

  it("shows current search value", () => {
    render(<SearchComponent {...defaultProps} value="test query" />);

    const searchInput = screen.getByDisplayValue("test query");
    expect(searchInput).toBeInTheDocument();
  });

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    render(<SearchComponent {...defaultProps} />);

    const searchInput = screen.getByRole("textbox");
    await user.type(searchInput, "new search");

    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("has search icon", () => {
    render(<SearchComponent {...defaultProps} />);

    const searchIcon = document.querySelector("svg");
    expect(searchIcon).toBeInTheDocument();
  });

  it("has proper styling", () => {
    render(<SearchComponent {...defaultProps} />);

    const searchInput = screen.getByRole("textbox");
    expect(searchInput).toHaveClass("w-full");
  });
});
