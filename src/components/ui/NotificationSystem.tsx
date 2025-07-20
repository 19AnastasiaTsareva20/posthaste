import React, { useState, useEffect } from 'react';
import { Card } from './Card';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const { type, message, duration = 4000 } = event.detail;
      const id = `notification-${Date.now()}-${Math.random()}`;
      
      const notification: Notification = {
        id,
        type,
        message,
        duration
      };

      setNotifications(prev => [...prev, notification]);

      // Автоматическое удаление уведомления / Auto remove notification
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    };

    window.addEventListener('notesflow-notification', handleNotification as EventListener);

    return () => {
      window.removeEventListener('notesflow-notification', handleNotification as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-5 w-5 text-success" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-danger" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-warning" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="h-5 w-5 text-primary dark:text-night-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        );
    }
  };

  const getNotificationColors = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/20 text-success';
      case 'error':
        return 'bg-danger/10 border-danger/20 text-danger';
      case 'warning':
        return 'bg-warning/10 border-warning/20 text-warning';
      case 'info':
      default:
        return 'bg-primary/10 border-primary/20 text-primary dark:bg-night-primary/10 dark:border-night-primary/20 dark:text-night-primary';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`p-4 border animate-slide-in-right ${getNotificationColors(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium break-words">
                {notification.message}
              </p>
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Хелпер функции для отправки уведомлений / Helper functions for sending notifications
export const showNotification = {
  success: (message: string, duration?: number) => {
    const event = new CustomEvent('notesflow-notification', {
      detail: { type: 'success', message, duration }
    });
    window.dispatchEvent(event);
  },
  
  error: (message: string, duration?: number) => {
    const event = new CustomEvent('notesflow-notification', {
      detail: { type: 'error', message, duration }
    });
    window.dispatchEvent(event);
  },
  
  warning: (message: string, duration?: number) => {
    const event = new CustomEvent('notesflow-notification', {
      detail: { type: 'warning', message, duration }
    });
    window.dispatchEvent(event);
  },
  
  info: (message: string, duration?: number) => {
    const event = new CustomEvent('notesflow-notification', {
      detail: { type: 'info', message, duration }
    });
    window.dispatchEvent(event);
  }
};
