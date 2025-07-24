import React from "react";

interface FavoritesFilterProps {
  showFavoritesOnly: boolean;
  onToggle: (show: boolean) => void;
  favoritesCount?: number;
  className?: string;
}

export const FavoritesFilter: React.FC<FavoritesFilterProps> = ({
  showFavoritesOnly,
  onToggle,
  favoritesCount,
  className = "",
}) => {
  return (
    <div
      className={`favorites-filter ${className}`}
      data-testid="favorites-filter"
    >
      <label>
        <input
          type="checkbox"
          checked={showFavoritesOnly}
          onChange={(e) => onToggle(e.target.checked)}
        />
        Показать только избранные
        {favoritesCount !== undefined && (
          <span className="ml-1">({favoritesCount})</span>
        )}
      </label>
    </div>
  );
};
