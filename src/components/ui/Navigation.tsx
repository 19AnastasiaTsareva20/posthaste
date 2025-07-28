import React from "react";
import { Link } from "react-router-dom";
// Если Card и Button используются, импортируем их правильно
// import { Card } from "./card";
// import { Button } from "./button";

export const Navigation: React.FC = () => {
  return (
    <nav className="hidden md:block" role="navigation">
      <div className="flex flex-col gap-1 p-2">
        <Link to="/">
          <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            Главная
          </button>
        </Link>
        <Link to="/create">
          <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            Создать
          </button>
        </Link>
        <Link to="/archive">
          <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            Архив
          </button>
        </Link>
        <Link to="/settings">
          <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            Настройки
          </button>
        </Link>
      </div>
    </nav>
  );
};
