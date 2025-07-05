import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { RichTextEditor } from '../components/editor/RichTextEditor';
import { TodoList } from '../components/ui/TodoList';

export const TestPage: React.FC = () => {
  const [editorContent, setEditorContent] = useState('');
  const [showTodoWidget, setShowTodoWidget] = useState(false);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
          🧪 Тестовая страница функций
        </h1>
        <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
          Здесь можно протестировать редактор и список задач.
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button onClick={() => setShowTodoWidget(!showTodoWidget)}>
            {showTodoWidget ? 'Скрыть' : 'Показать'} список задач
          </Button>
        </div>
      </Card>

      {/* Виджет задач/Todo widget */}
      {showTodoWidget && (
        <div className="fixed top-20 right-4 z-40">
          <TodoList 
            isWidget={true} 
            onClose={() => setShowTodoWidget(false)} 
          />
        </div>
      )}

      {/* Редактор/Editor */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">📝 Тест редактора</h2>
        <RichTextEditor
          content={editorContent}
          onChange={setEditorContent}
          placeholder="Напишите что-нибудь для тестирования..."
        />
        
        {editorContent && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <h3 className="font-semibold mb-2">HTML вывод:</h3>
            <pre className="text-sm overflow-x-auto">
              {editorContent}
            </pre>
          </div>
        )}
      </Card>

      {/* Полный список задач/Full todo list */}
      <div className="mt-6">
        <TodoList />
      </div>
    </div>
  );
};
