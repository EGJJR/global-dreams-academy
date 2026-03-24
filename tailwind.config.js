/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: [
          'var(--font-display)',
          'Futura',
          'Century Gothic',
          'Arial Narrow',
          'sans-serif',
        ],
        body: ['var(--font-body)', 'Helvetica', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      colors: {
        gda: {
          black: '#0a0a0a',
          white: '#f5f5f5',
          accent: '#ff6b00',
        },
      },
    },
  },
  plugins: [],
}
