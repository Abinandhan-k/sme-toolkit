/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'glass': {
          'light': 'rgba(255, 255, 255, 0.1)',
          'lighter': 'rgba(255, 255, 255, 0.05)',
          'dark': 'rgba(0, 0, 0, 0.1)',
          'darker': 'rgba(0, 0, 0, 0.2)',
          'blue': 'rgba(59, 130, 246, 0.1)',
          'purple': 'rgba(168, 85, 247, 0.1)',
        },
      },
      backdropFilter: {
        'blur-none': 'none',
        'blur-xs': 'blur(2px)',
        'blur-sm': 'blur(4px)',
        'blur-base': 'blur(8px)',
        'blur-md': 'blur(12px)',
        'blur-lg': 'blur(16px)',
        'blur-xl': 'blur(24px)',
        'blur-2xl': 'blur(40px)',
        'blur-3xl': 'blur(64px)',
      },
      backdropBlur: {
        'xl': '32px',
        '2xl': '64px',
        '3xl': '128px',
      },
      backdropSaturate: {
        0: '0',
        50: '.5',
        100: '1',
        150: '1.5',
        200: '2',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'inner-glass': 'inset 0 0 30px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' },
        },
      },
      backgroundImage: {
        'shimmer': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
      },
      borderRadius: {
        '3xl': '1.875rem',
        '4xl': '2.5rem',
      },
    },
  },
  plugins: [],
}