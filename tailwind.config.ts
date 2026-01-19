import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F8F7F3',
        },
        primary: {
          dark: '#171512',
        },
        secondary: {
          dark: '#39342D',
        },
        light: {
          text: '#F0EFEB',
        },
        error: {
          red: '#DC2626',
        },
      },
    },
  },
  plugins: [],
};
export default config;
