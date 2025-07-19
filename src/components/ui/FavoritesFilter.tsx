import React from 'react';
import { Card, Button } from './';

interface FavoritesFilterProps {
  showFavorites: boolean;
  onToggle: (show: boolean) => void;
  favoritesCount: number;
  className?: string;
}

export const FavoritesFilter: React.FC<FavoritesFilterProps> = ({
  showFavorites,
  onToggle,
  favoritesCount,
  className = ""
}) => {
  return (
    <Card className={`${className}`} hover={false}>
      <div className="space-y-4">
        {/* Заголовок / Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary flex items-center gap-2">
            <svg className="h-5 w-5 text-warning" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Избранное
          </h3>
          <span className="text-sm text-text-muted dark:text-dark-text-muted">
            {favoritesCount}
          </span>
        </div>

        {/* Переключатель избранного / Favorites toggle */}
        <button
          onClick={() => onToggle(!showFavorites)}
          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
            showFavorites
              ? 'bg-gradient-to-r from-warning to-orange-400 text-white shadow-lg shadow-warning/30'
              : 'hover:bg-neutral-100 dark:hover:bg-dark-surface text-text-primary dark:text-dark-text-primary border-2 border-dashed border-border dark:border-dark-border hover:border-warning/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`relative ${showFavorites ? 'animate-pulse' : ''}`}>
              <svg 
                className={`h-6 w-6 transition-all duration-300 ${
                  showFavorites 
                    ? 'text-white scale-110' 
                    : 'text-warning group-hover:text-warning group-hover:scale-110'
                }`} 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {/* Анимированные звездочки / Animated stars */}
              {showFavorites && (
                <>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                  <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white rounded-full animate-ping animation-delay-300" />
                </>
              )}
            </div>
            <div className="text-left">
              <div className="font-semibold">
                {showFavorites ? 'Показать все заметки' : 'Показать избранные'}
              </div>
              <div className={`text-sm ${
                showFavorites 
                  ? 'text-white/80' 
                  : 'text-text-muted dark:text-dark-text-muted group-hover:text-warning'
              }`}>
                {showFavorites 
                  ? `Избранных: ${favoritesCount}`
                  : `${favoritesCount} ${favoritesCount === 1 ? 'заметка' : favoritesCount < 5 ? 'заметки' : 'заметок'}`
                }
              </div>
            </div>
          </div>
          
          {/* Индикатор состояния / Status indicator */}
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
            showFavorites 
              ? 'bg-white' 
              : 'bg-warning group-hover:bg-warning/80'
          }`} />
        </button>

        {/* Статистика избранного / Favorites statistics */}
        {favoritesCount > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted dark:text-dark-text-muted">
                Избранных заметок:
              </span>
              <span className="font-semibold text-warning">
                {favoritesCount}
              </span>
            </div>
            
            {/* Прогресс-бар / Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-text-muted dark:text-dark-text-muted">
                <span>Цель: 10 избранных</span>
                <span>{Math.min(100, (favoritesCount / 10) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-dark-border rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-warning to-orange-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (favoritesCount / 10) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Быстрые действия / Quick actions */}
        <div className="space-y-2">
          {favoritesCount === 0 && (
            <div className="text-center py-4 text-text-muted dark:text-dark-text-muted">
              <svg className="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className="text-sm">Отметьте звездочкой важные заметки</p>
            </div>
          )}
          
          {showFavorites && favoritesCount > 0 && (
            <div className="bg-warning/10 dark:bg-warning/5 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-warning">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Показываются только избранные заметки</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
