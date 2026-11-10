import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: "#0f5a3a", dark: "#083d28", mist: "#eef5f3" } },
      fontFamily: { sans: ["Arial", "Helvetica", "sans-serif"] },
      boxShadow: { card: "0 18px 45px rgb(15 35 56 / .14)" }
    }
  },
  plugins: []
} satisfies Config;
