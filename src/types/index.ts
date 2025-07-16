// Note types/Типы заметок
export interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Folder types/Типы папок
export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

// Tag types/Типы тегов
export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}
