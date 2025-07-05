import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  reminder?: boolean;
  createdAt: string;
}

interface TodoListProps {
  isWidget?: boolean; // Для отображения как виджет на главной/For widget display on main page
  onClose?: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({ isWidget = false, onClose }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  // Загрузка задач из localStorage/Load todos from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem('posthaste-todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Сохранение задач в localStorage/Save todos to localStorage
  useEffect(() => {
    localStorage.setItem('posthaste-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const setDueDate = (id: string, date: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, dueDate: date } : todo
    ));
    setShowDatePicker(false);
    setSelectedTodoId(null);
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const displayTodos = isWidget ? activeTodos.slice(0, 3) : todos;

  const TodoItem = ({ todo }: { todo: TodoItem }) => (
    <div className={`flex items-center gap-3 p-2 rounded ${todo.completed ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="w-4 h-4 text-primary"
      />
      <span className={`flex-1 ${todo.completed ? 'line-through' : ''}`}>
        {todo.text}
      </span>
      {todo.dueDate && (
        <span className="text-xs text-text-secondary bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {new Date(todo.dueDate).toLocaleDateString()}
        </span>
      )}
      {!isWidget && (
        <div className="flex gap-1">
          <button
            onClick={() => {
              setSelectedTodoId(todo.id);
              setShowDatePicker(true);
            }}
            className="text-xs text-primary hover:underline"
            title="Установить дату"
          >
            📅
          </button>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="text-xs text-danger hover:underline"
            title="Удалить"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );

  if (isWidget) {
    return (
      <Card className="min-w-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">
            📝 Задачи ({activeTodos.length})
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {displayTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
          
          {activeTodos.length === 0 && (
            <p className="text-text-secondary text-sm text-center py-4">
              Все задачи выполнены! 🎉
            </p>
          )}
          
          {activeTodos.length > 3 && (
            <p className="text-xs text-text-secondary text-center">
              И ещё {activeTodos.length - 3} задач...
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">
        📝 Список задач
      </h2>
      
      {/* Добавление новой задачи/Add new task */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Добавить новую задачу..."
          className="flex-1 px-3 py-2 border border-border dark:border-dark-border rounded bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
        />
        <Button onClick={addTodo}>Добавить</Button>
      </div>
      
      {/* Список задач/Task list */}
      <div className="space-y-2">
        {todos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
        
        {todos.length === 0 && (
          <p className="text-text-secondary text-center py-8">
            Пока нет задач. Добавьте первую!
          </p>
        )}
      </div>
      
      {/* Модальное окно выбора даты/Date picker modal */}
      {showDatePicker && selectedTodoId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-sm w-full m-4">
            <h3 className="font-semibold mb-4">Установить дату выполнения</h3>
            <input
              type="datetime-local"
              onChange={(e) => setDueDate(selectedTodoId, e.target.value)}
              className="w-full px-3 py-2 border border-border rounded mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={() => setShowDatePicker(false)} variant="outline">
                Отмена
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};
