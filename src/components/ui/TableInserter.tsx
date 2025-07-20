import React, { useState } from 'react';
import { Card, Button } from './';

interface TableInserterProps {
  onTableInsert: (tableHTML: string) => void;
  onClose: () => void;
  className?: string;
}

interface CellData {
  content: string;
  isHeader: boolean;
}

export const TableInserter: React.FC<TableInserterProps> = ({
  onTableInsert,
  onClose,
  className = ""
}) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);
  const [tableData, setTableData] = useState<CellData[][]>([]);
  const [currentStep, setCurrentStep] = useState<'size' | 'content'>('size');
  const [tableStyle, setTableStyle] = useState<'default' | 'striped' | 'bordered'>('default');

  const initializeTable = () => {
    const newTableData: CellData[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: CellData[] = [];
      for (let j = 0; j < cols; j++) {
        row.push({
          content: '',
          isHeader: hasHeader && i === 0
        });
      }
      newTableData.push(row);
    }
    setTableData(newTableData);
    setCurrentStep('content');
  };

  const updateCell = (rowIndex: number, colIndex: number, content: string) => {
    const newTableData = [...tableData];
    newTableData[rowIndex][colIndex].content = content;
    setTableData(newTableData);
  };

  const addRow = () => {
    const newRow: CellData[] = [];
    for (let j = 0; j < cols; j++) {
      newRow.push({
        content: '',
        isHeader: false
      });
    }
    setTableData([...tableData, newRow]);
    setRows(rows + 1);
  };

  const addColumn = () => {
    const newTableData = tableData.map((row, rowIndex) => [
      ...row,
      {
        content: '',
        isHeader: hasHeader && rowIndex === 0
      }
    ]);
    setTableData(newTableData);
    setCols(cols + 1);
  };

  const removeRow = (rowIndex: number) => {
    if (tableData.length > 1) {
      const newTableData = tableData.filter((_, index) => index !== rowIndex);
      setTableData(newTableData);
      setRows(rows - 1);
    }
  };

  const removeColumn = (colIndex: number) => {
    if (tableData[0]?.length > 1) {
      const newTableData = tableData.map(row => 
        row.filter((_, index) => index !== colIndex)
      );
      setTableData(newTableData);
      setCols(cols - 1);
    }
  };

  const generateTableHTML = () => {
    const styleClasses = {
      default: 'editor-table',
      striped: 'editor-table editor-table-striped',
      bordered: 'editor-table editor-table-bordered'
    };

    let html = `<table class="${styleClasses[tableStyle]}">`;
    
    if (hasHeader && tableData.length > 0) {
      html += '<thead><tr>';
      tableData[0].forEach(cell => {
        html += `<th>${cell.content || '&nbsp;'}</th>`;
      });
      html += '</tr></thead>';
    }
    
    const bodyStartIndex = hasHeader ? 1 : 0;
    if (tableData.length > bodyStartIndex) {
      html += '<tbody>';
      for (let i = bodyStartIndex; i < tableData.length; i++) {
        html += '<tr>';
        tableData[i].forEach(cell => {
          html += `<td>${cell.content || '&nbsp;'}</td>`;
        });
        html += '</tr>';
      }
      html += '</tbody>';
    }
    
    html += '</table>';
    return html;
  };

  const presetSizes = [
    { rows: 2, cols: 2, label: '2×2' },
    { rows: 3, cols: 3, label: '3×3' },
    { rows: 4, cols: 3, label: '4×3' },
    { rows: 3, cols: 4, label: '3×4' },
    { rows: 5, cols: 3, label: '5×3' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in ${className}`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary flex items-center gap-2">
              <svg className="h-6 w-6 text-primary dark:text-night-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Вставить таблицу
            </h2>
            <Button size="sm" variant="ghost" onClick={onClose} className="p-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {currentStep === 'size' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-text-primary dark:text-dark-text-primary">
                  Быстрый выбор:
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {presetSizes.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setRows(preset.rows);
                        setCols(preset.cols);
                      }}
                      className={`p-3 border-2 rounded-lg text-center transition-all hover:border-primary/50 hover:bg-primary/5 ${
                        rows === preset.rows && cols === preset.cols
                          ? 'border-primary bg-primary/10'
                          : 'border-border dark:border-dark-border'
                      }`}
                    >
                      <div className="font-medium text-text-primary dark:text-dark-text-primary">
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                    Количество строк:
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRows(Math.max(1, rows - 1))}
                      disabled={rows <= 1}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </Button>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={rows}
                      onChange={(e) => setRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                      className="input w-20 text-center"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRows(Math.min(20, rows + 1))}
                      disabled={rows >= 20}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                    Количество столбцов:
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCols(Math.max(1, cols - 1))}
                      disabled={cols <= 1}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </Button>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={cols}
                      onChange={(e) => setCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      className="input w-20 text-center"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCols(Math.min(10, cols + 1))}
                      disabled={cols >= 10}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasHeader"
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                    className="rounded border-border focus:ring-primary"
                  />
                  <label htmlFor="hasHeader" className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                    Первая строка — заголовок
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                    Стиль таблицы:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'default', label: 'Обычная' },
                      { key: 'striped', label: 'Полосатая' },
                      { key: 'bordered', label: 'С границами' }
                    ].map((style) => (
                      <button
                        key={style.key}
                        onClick={() => setTableStyle(style.key as any)}
                        className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                          tableStyle === style.key
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border dark:border-dark-border hover:border-primary/50'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={onClose} className="flex-1">
                  Отмена
                </Button>
                <Button variant="primary" onClick={initializeTable} className="flex-1">
                  Далее
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-text-primary dark:text-dark-text-primary">
                  Заполните содержимое таблицы:
                </h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={addRow}>
                    + Строка
                  </Button>
                  <Button size="sm" variant="outline" onClick={addColumn}>
                    + Столбец
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border dark:border-dark-border">
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border border-border dark:border-dark-border p-1">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={cell.content}
                              onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                              placeholder={cell.isHeader ? 'Заголовок' : 'Данные'}
                              className={`input text-sm ${cell.isHeader ? 'font-semibold' : ''}`}
                            />
                            {colIndex === row.length - 1 && row.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeColumn(colIndex)}
                                className="p-1 text-danger hover:bg-danger/10"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </Button>
                            )}
                          </div>
                        </td>
                      ))}
                      {rowIndex === tableData.length - 1 && tableData.length > 1 && (
                        <td className="border border-border dark:border-dark-border p-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeRow(rowIndex)}
                            className="p-1 text-danger hover:bg-danger/10"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </table>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setCurrentStep('size')} className="flex-1">
                  Назад
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    onTableInsert(generateTableHTML());
                    onClose();
                  }}
                  className="flex-1"
                >
                  Вставить таблицу
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
