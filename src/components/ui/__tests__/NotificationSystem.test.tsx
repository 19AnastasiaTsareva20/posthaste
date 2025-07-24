import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationSystem } from "../NotificationSystem";

describe("NotificationSystem", () => {
  const mockNotifications = [
    {
      id: "1",
      type: "success" as const,
      title: "Success",
      message: "Operation completed",
    },
    {
      id: "2",
      type: "error" as const,
      title: "Error",
      message: "Something went wrong",
    },
  ];

  it("renders notifications", () => {
    render(<NotificationSystem notifications={mockNotifications} />);

    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("renders nothing when no notifications", () => {
    render(<NotificationSystem notifications={[]} />);

    expect(screen.queryByTestId("notification-system")).not.toBeInTheDocument();
  });

  it("calls onRemove when close button clicked", async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();

    render(
      <NotificationSystem
        notifications={mockNotifications}
        onRemove={onRemove}
      />,
    );

    const closeButtons = screen.getAllByLabelText("Закрыть");
    await user.click(closeButtons[0]);

    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
