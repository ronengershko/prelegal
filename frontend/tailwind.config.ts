import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e6f5fb",
          100: "#b3dff3",
          500: "#209dd7",
          600: "#1885b8",
        },
        accent: "#ecad0a",
        purple: "#753991",
        navy: "#032147",
      },
    },
  },
  plugins: [],
};

export default config;
