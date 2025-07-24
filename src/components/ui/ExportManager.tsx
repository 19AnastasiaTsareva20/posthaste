import React from "react";

interface ExportManagerProps {
  onExport: (format: "json" | "csv" | "markdown") => void;
  className?: string;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  onExport,
  className = "",
}) => {
  return (
    <div className={`export-manager ${className}`} data-testid="export-manager">
      <button onClick={() => onExport("json")}>Экспорт JSON</button>
      <button onClick={() => onExport("csv")}>Экспорт CSV</button>
      <button onClick={() => onExport("markdown")}>Экспорт Markdown</button>
    </div>
  );
};
