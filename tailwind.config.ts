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
        maroon:   "var(--maroon)",
        maroon2:  "var(--maroon2)",
        gold:     "var(--gold)",
        gold2:    "var(--gold2)",
        cream:    "var(--cream)",
        cream2:   "var(--cream2)",
        ink:      "var(--text)",
        muted:    "var(--muted)",
        border:   "var(--border)",
        sb:       "var(--sb)",
        sb2:      "var(--sb2)",
        bg:       "var(--bg)",
        card:     "var(--card)",
        ok:       "var(--green)",
        danger:   "var(--red)",
        info:     "var(--blue)",
        warn:     "var(--amber)",
        accent:   "var(--purple)",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "serif"],
        sans:  ["var(--font-jost)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
