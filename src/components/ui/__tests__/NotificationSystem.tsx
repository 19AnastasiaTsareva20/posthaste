import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationSystem } from '../NotificationSystem';

describe('NotificationSystem', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders without notifications initially', () => {
    render(<NotificationSystem />);
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows success notification', () => {
    render(<NotificationSystem />);
    
    // Симулируем добавление уведомления через глобальный метод
    act(() => {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'success',
          message: 'Заметка сохранена'
        }
      }));
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Заметка сохранена')).toBeInTheDocument();
  });

  it('shows error notification', () => {
    render(<NotificationSystem />);
    
    act(() => {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'error',
          message: 'Ошибка сохранения'
        }
      }));
    });
    
    expect(screen.getByText('Ошибка сохранения')).toBeInTheDocument();
  });

  it('shows info notification', () => {
    render(<NotificationSystem />);
    
    act(() => {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'info',
          message: 'Черновик сохранён'
        }
      }));
    });
    
    expect(screen.getByText('Черновик сохранён')).toBeInTheDocument();
  });

  it('auto-hides notification after timeout', async () => {
    render(<NotificationSystem />);
    
    act(() => {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'success',
          message: 'Тестовое уведомление'
        }
      }));
    });
    
    expect(screen.getByText('Тестовое уведомление')).toBeInTheDocument();
    
    // Ждём 3 секунды (стандартное время автоскрытия)
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Тестовое уведомление')).not.toBeInTheDocument();
    });
  });

  it('allows manual dismissal', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<NotificationSystem />);
    
    act(() => {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'success',
          message: 'Тестовое уведомление'
        }
      }));
    });
    
    expect(screen.getByText('Тестовое уведомление')).toBeInTheDocument();
    
    const closeButton = screen.getByRole('button', { name: /закрыть/i });
    await user.click(closeButton);
    
    expect(screen.queryByText('Тестовое уведомление')).not.toBeInTheDocument();
  });

  it('shows multiple notifications', () => {
    render(<NotificationSystem />);
    
    act(() => {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'success',
          message: 'Первое уведомление'
        }
      }));
      
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'error',
          message: 'Второе уведомление'
        }
      }));
    });
    
    expect(screen.getByText('Первое уведомление')).toBeInTheDocument();
    expect(screen.getByText('Второе уведомление')).toBeInTheDocument();
  });

  it('limits maximum number of notifications', () => {
    render(<NotificationSystem />);
    
    // Добавляем 6 уведомлений (лимит обычно 5)
    act(() => {
      for (let i = 1; i <= 6; i++) {
        window.dispatchEvent(new CustomEvent('notification', {
          detail: {
            type: 'info',
            message: `Уведомление ${i}`
          }
        }));
      }
    });
    
    // Должно быть только 5 уведомлений
    expect(screen.queryByText('Уведомление 1')).not.toBeInTheDocument();
    expect(screen.getByText('Уведомление 6')).toBeInTheDocument();
  });

  it('has different styles for different notification types', () => {
    render(<NotificationSystem />);
    
    act(() => {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'success',
          message: 'Успех'
        }
      }));
    });
    
    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('shows custom duration notifications', async () => {
    render(<NotificationSystem />);
    
    act(() => {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'info',
          message: 'Долгое уведомление',
          duration: 5000
        }
      }));
    });
    
    expect(screen.getByText('Долгое уведомление')).toBeInTheDocument();
    
    // Через 3 секунды всё ещё должно быть видно
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(screen.getByText('Долгое уведомление')).toBeInTheDocument();
    
    // Через 5 секунд должно исчезнуть
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Долгое уведомление')).not.toBeInTheDocument();
    });
  });
});
