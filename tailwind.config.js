/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PostHaste цветовая схема/PostHaste color scheme
        background: '#FAFBFC',
        surface: '#FFFFFF',
        'text-primary': '#1A202C',
        'text-secondary': '#4A5568',
        border: '#E2E8F0',
        
        'dark-background': '#1A202C',
        'dark-surface': '#2D3748',
        'dark-text-primary': '#F7FAFC',
        'dark-text-secondary': '#CBD5E0',
        'dark-border': '#4A5568',
        
        primary: '#3889F2',
        success: '#15B9A7',
        info: '#94E1F2',
        danger: '#F54364',
      },
    },
  },
  plugins: [],
}
