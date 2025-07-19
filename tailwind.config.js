/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Основные цвета для светлой темы / Primary colors for the light theme
        background: '#FAFBFC',
        surface: '#FFFFFF',
        'text-primary': '#1A202C',
        'text-secondary': '#4A5568',
        'text-muted': '#718096',
        border: '#E2E8F0',
        
        // Темная тема / Dark theme
        'dark-background': '#0F172A',
        'dark-surface': '#1E293B',
        'dark-text-primary': '#F1F5F9',
        'dark-text-secondary': '#CBD5E0',
        'dark-text-muted': '#94A3B8',
        'dark-border': '#334155',
        
        // Ваша любимая палитра / Your favorite palette
        primary: '#2D9EE0',
        'primary-dark': '#091E3A',
        'primary-light': '#6DD5ED',
        
        // Ночная тема цвета / Night theme colors
        'night-primary': '#3854F2',
        'night-secondary': '#576EF2',
        'night-accent': '#0820A6',
        'night-background': '#212940',
        
        // Акценты / Accents
        accent: '#2193B0',
        success: '#15B9A7',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        
        // Дополнительные оттенки / Additional shades
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E0',
          400: '#A0AEC0',
          500: '#718096',
          600: '#4A5568',
          700: '#2D3748',
          800: '#1A202C',
          900: '#171923'
        }
      },
      backgroundImage: {
        // Ваш любимый градиент / Your favorite gradient
        'gradient-primary': 'linear-gradient(135deg, #091E3A 0%, #2D9EE0 100%)',
        'gradient-header': 'linear-gradient(135deg, #091E3A 0%, #2D9EE0 100%)',
        
        // Дополнительные градиенты / Additional gradients
        'gradient-accent': 'linear-gradient(135deg, #2193B0 0%, #6DD5ED 100%)',
        'gradient-night': 'linear-gradient(135deg, #0820A6 0%, #3854F2 100%)',
        'gradient-soft': 'linear-gradient(135deg, #576EF2 0%, #212940 100%)',
        
        // Тонкие градиенты для карточек / Subtle gradients for cards
        'gradient-card': 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        'gradient-card-dark': 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      },
      boxShadow: {
        // Современные тени / Modern shadows
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'large': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'primary': '0 10px 25px -3px rgba(45, 158, 224, 0.3)',
        'accent': '0 10px 25px -3px rgba(33, 147, 176, 0.3)',
      },
      animation: {
        // Анимации для интерактивности / Animations for interactivity
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      fontSize: {
        // Размеры шрифтов для читаемости / Font sizes for readability
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.6' }],
        '2xl': ['1.5rem', { lineHeight: '1.5' }],
        '3xl': ['1.875rem', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
