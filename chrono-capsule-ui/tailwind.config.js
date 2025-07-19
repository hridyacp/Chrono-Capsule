  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          mono: ['ui-monospace', 'Menlo', 'Monaco', 'Cascadia Mono', 'Segoe UI Mono', 'Roboto Mono', 'monospace'],
        },
        keyframes: {
          blob: {
            '0%': {
              transform: 'translate(0px, 0px) scale(1)',
            },
            '33%': {
              transform: 'translate(30px, -50px) scale(1.1)',
            },
            '66%': {
              transform: 'translate(-20px, 20px) scale(0.9)',
            },
            '100%': {
              transform: 'translate(0px, 0px) scale(1)',
            },
          },
        },
        animation: {
          'blob': 'blob 7s ease-in-out infinite',
        },
        animationDelay: {
          '2000': '2s',
          '4000': '4s',
        },
      },
    },
    plugins: [
      function ({ addUtilities, theme, e }) {
        const delays = theme('animationDelay');
        const utilities = Object.entries(delays).map(([key, value]) => ({
          [`.${e(`animation-delay-${key}`)}`]: {
            'animation-delay': value,
          },
        }));
        addUtilities(utilities);
      },
    ],
  };
