/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Основные цвета/Primary colors
        background: '#FAFBFC',
        surface: '#FFFFFF',
        'text-primary': '#1A202C',
        'text-secondary': '#4A5568',
        border: '#E2E8F0',
        
        // Тёмная тема/Dark theme
        'dark-background': '#1A202C',
        'dark-surface': '#2D3748',
        'dark-text-primary': '#F7FAFC',
        'dark-text-secondary': '#CBD5E0',
        'dark-border': '#4A5568',
        
        // Акценты/Accents
        primary: '#3889F2',
        success: '#15B9A7',
        info: '#94E1F2',
        danger: '#F54364',
      },
      backgroundImage: {
        // Основной градиент для хэдера/Main header gradient
        'gradient-header': 'linear-gradient(135deg, #3889F2 0%, #15B9A7 100%)',
        
        // Ваш любимый градиент (уменьшенной интенсивности)/Your favorite gradient (reduced intensity)
        'gradient-accent': 'linear-gradient(135deg, #9796F0 0%, #FBC7D4 100%)',
        
        // Дополнительные градиенты (более мягкие)/Additional gradients (softer)
        'gradient-premium': 'linear-gradient(135deg, #3889F2 0%, #9796F0 100%)',
        'gradient-gentle': 'linear-gradient(135deg, #E2E8F0 0%, #FBC7D4 50%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
