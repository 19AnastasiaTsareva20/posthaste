import React, { useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Шаги инструктажа/Tutorial steps
  const steps = [
    {
      title: "Добро пожаловать в PostHaste! 🎉",
      content: "Создавайте и публикуйте статьи легко и быстро.",
      buttonText: "Далее",
    },
    {
      title: "Создание контента ✍️",
      content: "Используйте наш редактор для создания красивых статей.",
      buttonText: "Далее",
    },
    {
      title: "Публикация 📤",
      content: "Делитесь статьями с друзьями или публикуйте для всех.",
      buttonText: "Далее",
    },
    {
      title: "Начнём! 🚀",
      content: "Всё готово! Создайте свою первую статью.",
      buttonText: "Начать",
    },
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full bg-gradient-accent text-white border-0">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {steps[currentStep].title}
          </h2>
          <p className="text-white/90 mb-6">{steps[currentStep].content}</p>

          {/* Индикатор прогресса/Progress indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            {currentStep > 0 && (
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Назад
              </Button>
            )}
            <Button
              className="bg-white text-gray-900 hover:bg-gray-100"
              onClick={handleNext}
            >
              {steps[currentStep].buttonText}
            </Button>
          </div>

          <button
            onClick={onClose}
            className="mt-4 text-white/70 hover:text-white text-sm underline"
          >
            Пропустить инструктаж
          </button>
        </div>
      </Card>
    </div>
  );
};
