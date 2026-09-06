/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        main: {
          100: "#f5eee8",
          200: "#eaded1",
          300: "#e0cdbb",
          400: "#d5bda4",
          500: "#cbac8d",
          600: "#a28a71",
          700: "#7a6755",
          800: "#514538",
          900: "#29221c",
        },
      },
    },
  },
  plugins: [require("tailwindcss-primeui")],
};
