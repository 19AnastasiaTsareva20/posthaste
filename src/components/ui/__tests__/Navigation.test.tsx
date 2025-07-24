import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navigation } from "../Navigation";

const renderWithRouter = (
  component: React.ReactElement,
  initialEntries = ["/"],
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>,
  );
};

describe("Navigation", () => {
  it("renders navigation component", () => {
    renderWithRouter(<Navigation />);

    // Проверяем, что навигация рендерится
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
  });

  it("has proper navigation structure", () => {
    renderWithRouter(<Navigation />);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass("hidden", "md:block");
  });

  it("shows mobile navigation menu", () => {
    renderWithRouter(<Navigation />);

    const mobileNavContainer = document.querySelector(".md\\:hidden");
    expect(mobileNavContainer).toBeInTheDocument();
  });

  it("has proper button structure in desktop view", () => {
    renderWithRouter(<Navigation />);

    // Проверяем наличие кнопок через селекторы классов
    const buttonContainer = document.querySelector(".flex.flex-col.gap-1");
    expect(buttonContainer).toBeInTheDocument();

    const buttons = buttonContainer?.querySelectorAll("button");
    expect(buttons?.length).toBeGreaterThan(0);
  });
});
