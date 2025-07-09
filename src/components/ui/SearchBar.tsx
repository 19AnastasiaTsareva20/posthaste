import React, { useState } from 'react';
import { Button } from './Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onTagFilter: (tag: string) => void;
  availableTags: string[];
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onTagFilter,
  availableTags,
  placeholder = "Поиск статей...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    onTagFilter(tag);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedTag('');
    onSearch('');
    onTagFilter('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Поисковая строка/Search input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-border dark:border-dark-border rounded-lg bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary placeholder-text-secondary"
        />
        <Button type="submit" size="sm">
          🔍 Поиск
        </Button>
        {(searchQuery || selectedTag) && (
          <Button variant="outline" size="sm" onClick={clearSearch}>
            ✕ Очистить
          </Button>
        )}
      </form>

      {/* Фильтр по тегам/Tag filter */}
      {availableTags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
            Фильтр по тегам:
          </h4>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleTagSelect('')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTag === ''
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Все
            </button>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary text-white'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Активные фильтры/Active filters */}
      {(searchQuery || selectedTag) && (
        <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
          Активные фильтры: 
          {searchQuery && <span className="ml-1 font-medium">поиск: "{searchQuery}"</span>}
          {searchQuery && selectedTag && <span>, </span>}
          {selectedTag && <span className="ml-1 font-medium">тег: #{selectedTag}</span>}
        </div>
      )}
    </div>
  );
};
