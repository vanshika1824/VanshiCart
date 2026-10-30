/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          25: "#f7fdf9",
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        forest: {
          800: "#0f3d2e",
          900: "#09261d",
          950: "#051711",
        },
        warm: {
          50: "#fafaf8",
          100: "#f4f4f0",
          200: "#eaeae3",
          300: "#d6d6cb",
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        "subtle": "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        "card": "0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 12px 24px -6px rgba(15, 23, 42, 0.1), 0 4px 8px -3px rgba(15, 23, 42, 0.06)",
        "dropdown": "0 10px 30px -5px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      }
    }
  },
  plugins: []
};
