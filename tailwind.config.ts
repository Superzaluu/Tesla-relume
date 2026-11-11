import type { Config } from "tailwindcss";

// Design tokens mirror the CSS custom properties in src/styles/legacy.css (:root),
// so Tailwind utilities and the migrated component CSS share one palette.
export default {
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  // The migrated CSS ships its own base styles and a `.container` class;
  // Tailwind's preflight and container utility would override them.
  corePlugins: { preflight: false, container: false },
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: { DEFAULT: "var(--color-surface)", hover: "var(--color-surface-hover)" },
        ink: { DEFAULT: "var(--color-text)", secondary: "var(--color-text-secondary)", muted: "var(--color-text-muted)" },
        line: "var(--color-border)",
        primary: { DEFAULT: "var(--color-primary)", hover: "var(--color-primary-hover)" }
      },
      borderRadius: { button: "var(--radius-button)", card: "var(--radius-card)" },
      fontFamily: { sans: ["var(--font-body)"] },
      fontSize: {
        h1: "var(--heading-1)", h2: "var(--heading-2)", h5: "var(--heading-5)", h6: "var(--heading-6)",
        medium: "var(--text-medium)", regular: "var(--text-regular)", small: "var(--text-small)", tiny: "var(--text-tiny)"
      },
      spacing: {
        global: "var(--padding-global)", "section-lg": "var(--padding-section-large)",
        "section-md": "var(--padding-section-medium)", navbar: "var(--navbar-height)"
      }
    }
  },
  plugins: []
} satisfies Config;
