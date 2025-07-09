import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '../components/ui/NotificationSystem';

interface AutoSaveOptions {
  data: any;
  key: string;
  delay?: number;
  enabled?: boolean;
  onSave?: () => void;
  onChange?: (hasChanges: boolean) => void;
}

export const useAutoSave = ({
  data,
  key,
  delay = 3000,
  enabled = true,
  onSave,
  onChange
}: AutoSaveOptions) => {
  const toast = useToast();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const isFirstRender = useRef(true);
  const lastChangeNotifiedRef = useRef<boolean>(false); // Отслеживаем последнее состояние уведомления

  // Функция сохранения/Save function
  const save = useCallback(() => {
    try {
      const dataString = JSON.stringify(data);
      
      // Проверяем, изменились ли данные/Check if data changed
      if (dataString === lastSavedDataRef.current) {
        return;
      }

      localStorage.setItem(key, dataString);
      lastSavedDataRef.current = dataString;
      lastChangeNotifiedRef.current = false; // Сбрасываем флаг изменений
      
      onSave?.();
      
      // Уведомляем об отсутствии изменений только если состояние изменилось
      if (lastChangeNotifiedRef.current !== false) {
        onChange?.(false);
        lastChangeNotifiedRef.current = false;
      }
      
      toast.info('Автосохранение', 'Черновик сохранен автоматически');
    } catch (error) {
      console.error('Ошибка автосохранения:', error);
      toast.warning('Ошибка автосохранения', 'Не удалось сохранить черновик');
    }
  }, [data, key, onSave, onChange, toast]);

  // Функция проверки изменений без вызова onChange/Check changes without calling onChange
  const checkForChanges = useCallback(() => {
    const currentDataString = JSON.stringify(data);
    return currentDataString !== lastSavedDataRef.current;
  }, [data]);

  // Основной эффект автосохранения/Main autosave effect
  useEffect(() => {
    if (!enabled) return;

    // Пропускаем первый рендер/Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedDataRef.current = JSON.stringify(data);
      return;
    }

    // Очищаем предыдущий таймер/Clear previous timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Проверяем изменения/Check for changes
    const hasChanges = checkForChanges();
    
    // Уведомляем об изменениях только если состояние изменилось
    if (hasChanges !== lastChangeNotifiedRef.current) {
      onChange?.(hasChanges);
      lastChangeNotifiedRef.current = hasChanges;
    }
    
    if (hasChanges) {
      // Устанавливаем новый таймер/Set new timer
      timeoutRef.current = setTimeout(save, delay);
    }

    // Cleanup функция/Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, save, checkForChanges, onChange]);

  // Функция принудительного сохранения/Force save function
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    save();
  }, [save]);

  // Функция загрузки данных/Load data function
  const loadSaved = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsedData = JSON.parse(saved);
        lastSavedDataRef.current = saved;
        lastChangeNotifiedRef.current = false;
        return parsedData;
      }
    } catch (error) {
      console.error('Ошибка загрузки сохраненных данных:', error);
      toast.error('Ошибка загрузки', 'Не удалось загрузить сохраненные данные');
    }
    return null;
  }, [key, toast]);

  // Функция очистки сохраненных данных/Clear saved data function
  const clearSaved = useCallback(() => {
    localStorage.removeItem(key);
    lastSavedDataRef.current = '';
    lastChangeNotifiedRef.current = false;
    onChange?.(false);
    toast.info('Черновик очищен', 'Сохраненные данные удалены');
  }, [key, onChange, toast]);

  // Функция получения текущего состояния изменений/Get current changes state
  const hasUnsavedChanges = checkForChanges();

  return {
    forceSave,
    loadSaved,
    clearSaved,
    hasUnsavedChanges
  };
};
