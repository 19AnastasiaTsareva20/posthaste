// src/components/ui/index.ts

// Основные UI компоненты / Main UI components
export { NoteCard } from "./NoteCard";
export { Navigation } from "./Navigation";
export { SearchComponent } from "./SearchComponent";
export { TagManager } from "./TagManager";
export { ThemeToggle } from "./ThemeToggle";
export { NotificationSystem } from "./NotificationSystem";
export { WelcomeModal } from "./WelcomeModal";
export { ExportManager } from "./ExportManager";
export { ArchiveManager } from "./ArchiveManager";
export { FavoritesFilter } from "./FavoritesFilter";
// Экспорт недостающих базовых компонентов
export { Card } from "./card";
export { Button } from "./button";
// Если CardContent используется отдельно
// export { CardContent } from "./card";

// Компоненты редактора / Editor components
// Убедитесь, что пути верны. Если файлы находятся в src/components/editor/, путь будет ../editor/
export { RichTextEditor } from "../editor/RichTextEditor";
// export { FormattingToolbar } from "../editor/FormattingToolbar"; // Если нужен

// Закомментированные экспорт, если компоненты еще не готовы
// export { FolderManager } from "./FolderManager";
// export { ImageUploader } from "./ImageUploader";
// export { TableInserter } from "./TableInserter";
// export { QuickNote } from "./QuickNote";
