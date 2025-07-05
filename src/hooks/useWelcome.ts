import { useState, useEffect } from 'react';

export const useWelcome = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    // Проверяем был ли пользователь раньше/Check if user visited before
    const hasVisited = localStorage.getItem('posthaste-has-visited');
    
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);
  
  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('posthaste-has-visited', 'true');
  };
  
  const resetWelcome = () => {
    localStorage.removeItem('posthaste-has-visited');
    setShowWelcome(true);
  };
  
  return {
    showWelcome,
    closeWelcome,
    resetWelcome
  };
};
