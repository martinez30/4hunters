/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      colors: {
        ink:     '#1c1712',
        cream:   '#f7f3ec',
        paper:   '#faf8f4',
        accent:  '#c8402a',
        gold:    '#c9913a',
        muted:   '#8a7f74',
        border:  '#e0dbd2',
      },
    },
  },
  plugins: [],
}
