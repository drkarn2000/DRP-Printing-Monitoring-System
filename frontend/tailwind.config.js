/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        nav: 'var(--nav)',
        nav2: 'var(--nav2)',
        blue: 'var(--blue)',
        blue2: 'var(--blue2)',
        teal: 'var(--teal)',
        green: 'var(--green)',
        amber: 'var(--amber)',
        red: 'var(--red)',
      },
    },
  },
  plugins: [],
};
