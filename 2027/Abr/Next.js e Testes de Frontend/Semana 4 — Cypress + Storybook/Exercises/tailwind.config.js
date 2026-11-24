/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // TailwindCSS 4.x supports CSS variables for theming
      colors: {
        // You can define custom colors using CSS variables
        // These will be available as utility classes
      },
      fontFamily: {
        // Define custom font families
      },
    },
  },
  plugins: [],
  // TailwindCSS 4.x supports CSS layers for better organization
  future: {
    hoverOnlyWhenSupported: true,
  },
};
