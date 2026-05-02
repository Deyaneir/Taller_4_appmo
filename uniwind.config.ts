import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', 
    './app/**/*.{js,jsx,ts,tsx}', 
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  important: true,
  theme: {
    extend: {
      colors: {
        primary: '#1A3A5C',
        secondary: '#2E6DA4',
        success: '#27AE60',
        warning: '#F39C12',
        error: '#E74C3C',
        background: '#F5F7FA',
        card: '#FFFFFF',
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '15px',
        lg: '16px',
        xl: '18px',
        '2xl': '22px',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '14px',
      },
    },
  },
};

export default config;