import React, { useState, useEffect } from 'react';
import { Card, Button } from './';

interface Folder {
  id: string;
  name: string;
  color: string;
  noteCount: number;
  createdAt: Date;
}

interface FolderManagerProps {
  onFolderSelect: (folderId: string | undefined) => void;
  selectedFolderId?: string;
  className?: string;
}

export const FolderManager: React.FC<FolderManagerProps> = ({
  onFolderSelect,
  selectedFolderId,
  className = ""
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2D9EE0');

  // Цвета для папок / Colors for folders
  const folderColors = [
    '#2D9EE0', '#3854F2', '#576EF2', '#2193B0', '#6DD5ED',
    '#15B9A7', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
  ];

  // Загрузка папок / Load folders
  useEffect(() => {
    const savedFolders = localStorage.getItem('notesflow-folders');
    if (savedFolders) {
      try {
        const parsedFolders = JSON.parse(savedFolders).map((folder: any) => ({
          ...folder,
          createdAt: new Date(folder.createdAt)
        }));
        setFolders(parsedFolders);
      } catch (error) {
        console.error('Error loading folders:', error);
      }
    }
  }, []);

  // Сохранение папок / Save folders
  const saveFolders = (updatedFolders: Folder[]) => {
    localStorage.setItem('notesflow-folders', JSON.stringify(updatedFolders));
    setFolders(updatedFolders);
  };

  // Создание новой папки / Create new folder
  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      color: selectedColor,
      noteCount: 0,
      createdAt: new Date()
    };

    const updatedFolders = [...folders, newFolder];
    saveFolders(updatedFolders);
    
    setNewFolderName('');
    setIsCreating(false);
    setSelectedColor('#2D9EE0');
  };

  // Удаление папки / Delete folder
  const deleteFolder = (folderId: string) => {
    if (window.confirm('Удалить папку? Заметки останутся, но будут перемещены в "Без папки".')) {
      const updatedFolders = folders.filter(f => f.id !== folderId);
      saveFolders(updatedFolders);
      
      if (selectedFolderId === folderId) {
        onFolderSelect(undefined);
      }
    }
  };

  // Переименование папки / Rename folder
  const renameFolder = (folderId: string, newName: string) => {
    const updatedFolders = folders.map(folder =>
      folder.id === folderId ? { ...folder, name: newName } : folder
    );
    saveFolders(updatedFolders);
  };

  return (
    <Card className={`${className}`} hover={false}>
      <div className="space-y-4">
        {/* Заголовок / Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary flex items-center gap-2">
            <svg className="h-5 w-5 text-primary dark:text-night-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Папки
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(true)}
            className="p-2"
            title="Создать папку"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>

        {/* Все заметки / All notes */}
        <button
          onClick={() => onFolderSelect(undefined)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
            !selectedFolderId
              ? 'bg-gradient-primary text-white shadow-primary'
              : 'hover:bg-neutral-100 dark:hover:bg-dark-surface text-text-primary dark:text-dark-text-primary'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              !selectedFolderId ? 'bg-white' : 'bg-gradient-accent'
            }`} />
            <span className="font-medium">Все заметки</span>
          </div>
          <span className={`text-sm px-2 py-1 rounded-full ${
            !selectedFolderId 
              ? 'bg-white/20 text-white' 
              : 'bg-neutral-200 dark:bg-dark-border text-text-muted dark:text-dark-text-muted group-hover:bg-primary group-hover:text-white'
          }`}>
            {folders.reduce((total, folder) => total + folder.noteCount, 0)}
          </span>
        </button>

        {/* Список папок / Folders list */}
        <div className="space-y-2">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                selectedFolderId === folder.id
                  ? 'bg-gradient-primary text-white shadow-primary'
                  : 'hover:bg-neutral-100 dark:hover:bg-dark-surface text-text-primary dark:text-dark-text-primary'
              }`}
              onClick={() => onFolderSelect(folder.id)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: selectedFolderId === folder.id ? 'white' : folder.color }}
                />
                <span className="font-medium truncate">{folder.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  selectedFolderId === folder.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-neutral-200 dark:bg-dark-border text-text-muted dark:text-dark-text-muted'
                }`}>
                  {folder.noteCount}
                </span>
                
                {/* Меню действий / Actions menu */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder.id);
                    }}
                    className="p-1 text-danger hover:bg-danger/10"
                    title="Удалить папку"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Форма создания папки / Create folder form */}
        {isCreating && (
          <div className="border border-border dark:border-dark-border rounded-lg p-4 space-y-3 bg-gradient-card dark:bg-gradient-card-dark animate-slide-up">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Название папки..."
              className="input w-full"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
            />
            
            {/* Выбор цвета / Color selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                Цвет папки:
              </label>
              <div className="flex flex-wrap gap-2">
                {folderColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full transition-all duration-200 ${
                      selectedColor === color 
                        ? 'ring-2 ring-offset-2 ring-primary dark:ring-night-primary scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            
            {/* Кнопки действий / Action buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="flex-1"
              >
                Создать
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setNewFolderName('');
                  setSelectedColor('#2D9EE0');
                }}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        )}

        {/* Пустое состояние / Empty state */}
        {folders.length === 0 && !isCreating && (
          <div className="text-center py-6 text-text-muted dark:text-dark-text-muted">
            <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-sm">Папки помогают организовать заметки</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreating(true)}
              className="mt-3"
            >
              Создать первую папку
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
