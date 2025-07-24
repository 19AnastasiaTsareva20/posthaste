import React from "react";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

interface NotificationSystemProps {
  notifications?: Notification[];
  onRemove?: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications = [],
  onRemove,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-2"
      data-testid="notification-system"
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border-l-4 bg-white ${
            notification.type === "success"
              ? "border-green-500"
              : notification.type === "error"
                ? "border-red-500"
                : notification.type === "warning"
                  ? "border-yellow-500"
                  : "border-blue-500"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">
                {notification.title}
              </h4>
              {notification.message && (
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
              )}
            </div>
            {onRemove && (
              <button
                onClick={() => onRemove(notification.id)}
                className="ml-4 text-gray-400 hover:text-gray-600"
                aria-label="Закрыть"
              >
                ×
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
