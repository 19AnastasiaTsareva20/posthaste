/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Основные цвета для светлой темы/primary colors for a light theme
        background: '#FAFBFC',
        surface: '#FFFFFF',
        'text-primary': '#1A202C',
        'text-secondary': '#4A5568',
        border: '#E2E8F0',
        
        // Основные цвета для тёмной темы/primary colors for a dark theme
        'dark-background': '#1A202C',
        'dark-surface': '#2D3748',
        'dark-text-primary': '#F7FAFC',
        'dark-text-secondary': '#CBD5E0',
        'dark-border': '#4A5568',
        
        // Акцентные цвета/accent colors
        primary: '#3889F2',
        success: '#15B9A7',
        info: '#94E1F2',
        danger: '#F54364',
        
        // Градиенты/gradients
        'gradient-start': '#2193b0',
        'gradient-end': '#6dd5ed',
        'gradient-premium-start': '#1488CC',
        'gradient-premium-end': '#2B32B2',
      },
      backgroundImage: {
        'gradient-header': 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
        'gradient-premium': 'linear-gradient(135deg, #1488CC 0%, #2B32B2 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
