import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navigation } from "../Navigation";

// Обернуть рендер в MemoryRouter с future пропсами для устранения предупреждений
const renderWithRouter = (
  component: React.ReactElement,
  initialEntries = ["/"],
) => {
  return render(
    // Добавлены future пропсы для подавления предупреждений React Router v6
    <MemoryRouter 
      initialEntries={initialEntries}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      {component}
    </MemoryRouter>,
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
    // Уточнить селекторы в зависимости от реальной разметки Navigation
    // Этот тест может потребовать адаптации
    expect(nav).toHaveClass("hidden", "md:block"); 
  });

  it("shows mobile navigation menu", () => {
    renderWithRouter(<Navigation />);

    // Уточнить селектор в зависимости от реальной разметки Navigation
    const mobileNavContainer = document.querySelector(".md\\:hidden");
    expect(mobileNavContainer).toBeInTheDocument();
  });

  it("has proper button structure in desktop view", () => {
    renderWithRouter(<Navigation />);

    // Уточнить селекторы в зависимости от реальной разметки Navigation
    const buttonContainer = document.querySelector(".flex.flex-col.gap-1");
    expect(buttonContainer).toBeInTheDocument();

    const buttons = buttonContainer?.querySelectorAll("button");
    expect(buttons?.length).toBeGreaterThan(0);
  });
});
