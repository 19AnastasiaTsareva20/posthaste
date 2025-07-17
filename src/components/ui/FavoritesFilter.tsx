import React from 'react';
import { Card, Button } from './';

interface FavoritesFilterProps {
  showFavorites: boolean;
  onToggle: (show: boolean) => void;
  favoritesCount: number;
}

export const FavoritesFilter: React.FC<FavoritesFilterProps> = ({
  showFavorites,
  onToggle,
  favoritesCount
}) => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-text-primary">Избранные</h3>
        <span className="text-text-muted text-sm">({favoritesCount})</span>
      </div>

      <div className="space-y-2">
        <Button
          variant={!showFavorites ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onToggle(false)}
          className="w-full"
        >
          Все заметки
        </Button>
        <Button
          variant={showFavorites ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onToggle(true)}
          className="w-full"
        >
          Только избранные
        </Button>
      </div>

      {favoritesCount === 0 && (
        <p className="text-text-muted text-xs mt-3">
          Нет избранных заметок. Нажмите ⭐ на заметке, чтобы добавить в избранное.
        </p>
      )}
    </Card>
  );
};
