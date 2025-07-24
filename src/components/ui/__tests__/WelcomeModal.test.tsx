import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WelcomeModal } from "../WelcomeModal";

describe("WelcomeModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders welcome modal when open", async () => {
    await act(async () => {
      render(<WelcomeModal {...defaultProps} />);
    });

    // Проверяем, что модал рендерится
    expect(screen.getByRole("heading")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /далее/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /пропустить/i }),
    ).toBeInTheDocument();
  });

  it("does not render when closed", async () => {
    await act(async () => {
      render(<WelcomeModal {...defaultProps} isOpen={false} />);
    });

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("has progress indicators", async () => {
    await act(async () => {
      render(<WelcomeModal {...defaultProps} />);
    });

    const progressDots = document.querySelectorAll(".w-2.h-2.rounded-full");
    expect(progressDots.length).toBeGreaterThan(0);
  });

  it("closes modal when skip button is clicked", async () => {
    await act(async () => {
      render(<WelcomeModal {...defaultProps} />);
    });

    const skipButton = screen.getByRole("button", { name: /пропустить/i });

    await act(async () => {
      await userEvent.click(skipButton);
    });

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("navigates through steps when next is clicked", async () => {
    await act(async () => {
      render(<WelcomeModal {...defaultProps} />);
    });

    const nextButton = screen.getByRole("button", { name: /далее/i });

    // Запоминаем текущий заголовок
    const initialHeading = screen.getByRole("heading").textContent;

    await act(async () => {
      await userEvent.click(nextButton);
    });

    // Проверяем, что содержимое изменилось (перешли на следующий шаг)
    await waitFor(() => {
      const currentHeading = screen.getByRole("heading").textContent;
      expect(currentHeading).not.toBe(initialHeading);
    });
  });

  it("has proper modal structure", async () => {
    await act(async () => {
      render(<WelcomeModal {...defaultProps} />);
    });

    const overlay = document.querySelector(".fixed.inset-0");
    expect(overlay).toBeInTheDocument();

    const modalContent = document.querySelector(".bg-gradient-accent");
    expect(modalContent).toBeInTheDocument();
  });

  it("has accessibility features", async () => {
    await act(async () => {
      render(<WelcomeModal {...defaultProps} />);
    });

    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("supports keyboard interaction", async () => {
    await act(async () => {
      render(<WelcomeModal {...defaultProps} />);
    });

    const nextButton = screen.getByRole("button", { name: /далее/i });

    await act(async () => {
      nextButton.focus();
    });

    expect(nextButton).toHaveFocus();
  });

  it("has proper styling", async () => {
    await act(async () => {
      render(<WelcomeModal {...defaultProps} />);
    });

    const overlay = document.querySelector(".fixed.inset-0");
    expect(overlay).toHaveClass("z-50");

    const content = document.querySelector(".bg-gradient-accent");
    expect(content).toHaveClass("text-white");
  });

  it("shows step indicators correctly", async () => {
    await act(async () => {
      render(<WelcomeModal {...defaultProps} />);
    });

    const indicators = document.querySelectorAll(".w-2.h-2.rounded-full");
    expect(indicators.length).toBe(4);

    // Хотя бы один индикатор должен быть активным
    const activeIndicators = document.querySelectorAll(
      ".w-2.h-2.rounded-full.bg-white",
    );
    expect(activeIndicators.length).toBeGreaterThan(0);
  });

  it("handles component lifecycle properly", async () => {
    const { rerender } = render(<WelcomeModal {...defaultProps} />);

    // Проверяем, что компонент отображается
    expect(screen.getByRole("heading")).toBeInTheDocument();

    // Закрываем модал
    await act(async () => {
      rerender(<WelcomeModal {...defaultProps} isOpen={false} />);
    });

    // Проверяем, что модал скрыт
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  // Базовый тест для проверки рендеринга
  it("renders without crashing", () => {
    expect(() => {
      render(<WelcomeModal isOpen={true} onClose={jest.fn()} />);
    }).not.toThrow();
  });
});
