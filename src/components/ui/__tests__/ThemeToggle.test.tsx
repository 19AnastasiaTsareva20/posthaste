import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../ThemeToggle";
import { ThemeProvider } from "../../../contexts/ThemeContext";

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

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

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.className = "";
  });

  it("renders theme toggle buttons", () => {
    localStorageMock.getItem.mockReturnValue("light");

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  it("toggles theme when clicked", async () => {
    const user = userEvent.setup();
    localStorageMock.getItem.mockReturnValue("light");

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const buttons = screen.getAllByRole("button");
    const themeButton = buttons[0];
    await user.click(themeButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "posthaste-theme",
      "dark",
    );
  });
});
