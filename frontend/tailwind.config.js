const { gray, blue, emerald } = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: { 
    extend: {
      colors: {
        gray,                   // keeps your bg-gray-50, etc.
        spaBlue:   '#A3BFD9',
        spaGreen:  '#A8D5BA',
        spaGray:   '#F4F6F8',
        spaTaupe:  '#D9CAB0',
        primary:   blue,        // enables bg-primary-500…900
        secondary: emerald,     // enables bg-secondary-200,300, text-secondary-900
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
