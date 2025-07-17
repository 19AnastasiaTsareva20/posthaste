import React, { useState } from 'react';
import { Button } from './';

interface TableInserterProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (html: string) => void;
}

export const TableInserter: React.FC<TableInserterProps> = ({
  isOpen,
  onClose,
  onInsert
}) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);

  if (!isOpen) return null;

  // Generate table HTML/Генерация HTML таблицы
  const generateTable = () => {
    let html = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
    
    // Table header/Заголовок таблицы
    if (hasHeader) {
      html += '<thead><tr>';
      for (let j = 0; j < cols; j++) {
        html += `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5; font-weight: bold;">Заголовок ${j + 1}</th>`;
      }
      html += '</tr></thead>';
    }
    
    // Table body/Тело таблицы
    html += '<tbody>';
    const startRow = hasHeader ? 1 : 0;
    const totalRows = hasHeader ? rows : rows;
    
    for (let i = startRow; i < totalRows + startRow; i++) {
      html += '<tr>';
      for (let j = 0; j < cols; j++) {
        html += `<td style="border: 1px solid #ddd; padding: 8px;">Ячейка ${i + 1}-${j + 1}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    
    return html;
  };

  // Handle insert/Обработка вставки
  const handleInsert = () => {
    const tableHtml = generateTable();
    onInsert(tableHtml);
    onClose();
  };

  // Preview grid/Предварительный просмотр сетки
  const renderPreview = () => {
    const cells = [];
    const totalRows = hasHeader ? rows + 1 : rows;
    
    for (let i = 0; i < totalRows; i++) {
      for (let j = 0; j < cols; j++) {
        const isHeader = hasHeader && i === 0;
        cells.push(
          <div
            key={`${i}-${j}`}
            className={`w-6 h-6 border border-default ${
              isHeader ? 'bg-primary/20' : 'bg-surface'
            } hover:bg-accent/20 transition-colors`}
            style={{
              gridColumn: j + 1,
              gridRow: i + 1
            }}
          />
        );
      }
    }
    
    return (
      <div
        className="inline-grid gap-1 p-2 border border-default rounded"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${totalRows}, 1fr)`
        }}
      >
        {cells}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-text-primary">
            Вставить таблицу
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Size controls/Управление размером */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Строки
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rows}
                onChange={(e) => setRows(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Столбцы
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => setCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="input w-full"
              />
            </div>
          </div>

          {/* Header option/Опция заголовка */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasHeader"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="w-4 h-4 text-primary border-default rounded focus:ring-primary"
            />
            <label htmlFor="hasHeader" className="text-sm text-text-primary">
              Первая строка - заголовок
            </label>
          </div>

          {/* Preview/Предварительный просмотр */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Предварительный просмотр
            </label>
            <div className="flex justify-center">
              {renderPreview()}
            </div>
            <p className="text-xs text-text-muted mt-2 text-center">
              {hasHeader ? rows + 1 : rows} × {cols} 
              {hasHeader && ' (с заголовком)'}
            </p>
          </div>
        </div>

        {/* Actions/Действия */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleInsert}>
            Вставить таблицу
          </Button>
        </div>
      </div>
    </div>
  );
};
