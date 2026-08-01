import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        khmer: ['"Noto Sans Khmer"', 'Khmer', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: '#fffbeedb',
          100: '#fff4c6',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          900: '#451a03',
        },
      },
    },
  },
  plugins: [],
};
export default config;
