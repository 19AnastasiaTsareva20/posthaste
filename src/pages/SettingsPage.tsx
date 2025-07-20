import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  autoSaveInterval: number;
  defaultView: 'grid' | 'list';
  showPreview: boolean;
  fontSize: 'small' | 'medium' | 'large';
  exportFormat: 'markdown' | 'html' | 'text';
}

const defaultSettings: Settings = {
  theme: 'system',
  autoSave: true,
  autoSaveInterval: 2000,
  defaultView: 'grid',
  showPreview: true,
  fontSize: 'medium',
  exportFormat: 'markdown'
};

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Загрузка настроек / Load settings
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('notesflow-settings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  // Применение темы / Apply theme
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Обновление настройки / Update setting
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Сохранение настроек / Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('notesflow-settings', JSON.stringify(settings));
      setHasChanges(false);
      
      // Показать уведомление
      const event = new CustomEvent('notesflow-notification', {
        detail: {
          type: 'success',
          message: 'Настройки сохранены'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error saving settings:', error);
      const event = new CustomEvent('notesflow-notification', {
        detail: {
          type: 'error',
          message: 'Ошибка при сохранении настроек'
        }
      });
      window.dispatchEvent(event);
    } finally {
      setIsSaving(false);
    }
  };

  // Сброс настроек / Reset settings
  const handleReset = () => {
    if (window.confirm('Вы уверены, что хотите сбросить все настройки до значений по умолчанию?')) {
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  // Экспорт данных / Export data
  const handleExportData = () => {
    try {
      const notes = localStorage.getItem('notesflow-notes');
      const folders = localStorage.getItem('notesflow-folders');
      const settings = localStorage.getItem('notesflow-settings');
      
      const exportData = {
        notes: notes ? JSON.parse(notes) : [],
        folders: folders ? JSON.parse(folders) : [],
        settings: settings ? JSON.parse(settings) : {},
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `notesflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const event = new CustomEvent('notesflow-notification', {
        detail: {
          type: 'success',
          message: 'Данные экспортированы'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error exporting data:', error);
      const event = new CustomEvent('notesflow-notification', {
        detail: {
          type: 'error',
          message: 'Ошибка при экспорте данных'
        }
      });
      window.dispatchEvent(event);
    }
  };

  // Импорт данных / Import data
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        if (importData.notes) {
          localStorage.setItem('notesflow-notes', JSON.stringify(importData.notes));
        }
        if (importData.folders) {
          localStorage.setItem('notesflow-folders', JSON.stringify(importData.folders));
        }
        if (importData.settings) {
          localStorage.setItem('notesflow-settings', JSON.stringify(importData.settings));
          setSettings({ ...defaultSettings, ...importData.settings });
        }

        const event = new CustomEvent('notesflow-notification', {
          detail: {
            type: 'success',
            message: 'Данные импортированы'
          }
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('Error importing data:', error);
        const event = new CustomEvent('notesflow-notification', {
          detail: {
            type: 'error',
            message: 'Ошибка при импорте данных'
          }
        });
        window.dispatchEvent(event);
      }
    };
    reader.readAsText(file);
    
    // Очистка input
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Заголовок страницы / Page header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="p-2"
                title="Назад к заметкам"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary flex items-center gap-3">
                <svg className="h-8 w-8 text-primary dark:text-night-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Настройки
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-warning flex items-center gap-1">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                  Есть несохраненные изменения
                </span>
              )}
              
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Внешний вид / Appearance */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
              <svg className="h-6 w-6 text-primary dark:text-night-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              Внешний вид
            </h2>

            <div className="space-y-4">
              {/* Тема / Theme */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                  Тема оформления:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'light', label: 'Светлая', icon: '☀️' },
                    { key: 'dark', label: 'Темная', icon: '🌙' },
                    { key: 'system', label: 'Системная', icon: '💻' }
                  ].map((theme) => (
                    <button
                      key={theme.key}
                      onClick={() => updateSetting('theme', theme.key as any)}
                      className={`p-3 border rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        settings.theme === theme.key
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border dark:border-dark-border hover:border-primary/50'
                      }`}
                    >
                      <span>{theme.icon}</span>
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Размер шрифта / Font size */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                  Размер шрифта:
                </label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', e.target.value as any)}
                  className="input w-full"
                >
                  <option value="small">Маленький</option>
                  <option value="medium">Средний</option>
                  <option value="large">Большой</option>
                </select>
              </div>

              {/* Вид по умолчанию / Default view */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                  Вид списка заметок:
                </label>
                <div className="flex bg-neutral-100 dark:bg-dark-surface rounded-lg p-1">
                  <button
                    onClick={() => updateSetting('defaultView', 'grid')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      settings.defaultView === 'grid'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
                    }`}
                  >
                    Сетка
                  </button>
                  <button
                    onClick={() => updateSetting('defaultView', 'list')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      settings.defaultView === 'list'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
                    }`}
                  >
                    Список
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Редактор / Editor */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
              <svg className="h-6 w-6 text-primary dark:text-night-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Редактор
            </h2>

            <div className="space-y-4">
              {/* Автосохранение / Auto save */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                    Автосохранение:
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => updateSetting('autoSave', e.target.checked)}
                    className="rounded border-border focus:ring-primary"
                  />
                </div>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  Автоматически сохранять изменения во время редактирования
                </p>
              </div>

              {/* Интервал автосохранения / Auto save interval */}
              {settings.autoSave && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                    Интервал автосохранения (сек):
                  </label>
                  <select
                    value={settings.autoSaveInterval}
                    onChange={(e) => updateSetting('autoSaveInterval', parseInt(e.target.value))}
                    className="input w-full"
                  >
                    <option value={1000}>1 секунда</option>
                    <option value={2000}>2 секунды</option>
                    <option value={5000}>5 секунд</option>
                    <option value={10000}>10 секунд</option>
                  </select>
                </div>
              )}

              {/* Показывать превью / Show preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                    Показывать превью:
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.showPreview}
                    onChange={(e) => updateSetting('showPreview', e.target.checked)}
                    className="rounded border-border focus:ring-primary"
                  />
                </div>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  Отображать превью контента в карточках заметок
                </p>
              </div>

              {/* Формат экспорта / Export format */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                  Формат экспорта по умолчанию:
                </label>
                <select
                  value={settings.exportFormat}
                  onChange={(e) => updateSetting('exportFormat', e.target.value as any)}
                  className="input w-full"
                >
                  <option value="markdown">Markdown (.md)</option>
                  <option value="html">HTML (.html)</option>
                  <option value="text">Текст (.txt)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Данные / Data */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
              <svg className="h-6 w-6 text-primary dark:text-night-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Управление данными
            </h2>

            <div className="space-y-4">
              {/* Экспорт / Export */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="w-full flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Экспортировать все данные
                </Button>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  Скачать резервную копию всех заметок, папок и настроек
                </p>
              </div>

              {/* Импорт / Import */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-data"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('import-data')?.click()}
                  className="w-full flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Импортировать данные
                </Button>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  Восстановить данные из резервной копии
                </p>
              </div>
            </div>
          </Card>

          {/* Сброс / Reset */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
              <svg className="h-6 w-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Сброс настроек
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                Восстановить все настройки до значений по умолчанию. Ваши заметки не будут удалены.
              </p>
              
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full text-danger hover:bg-danger/10 border-danger/30"
              >
                Сбросить настройки
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
