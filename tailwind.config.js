/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',  // Warna oranye di tombol
          dark: '#E25A2C',     // Warna oranye lebih gelap untuk hover
        },
        secondary: {
          DEFAULT: '#4A4A4A',  // Warna teks utama
          light: '#6B6B6B',    // Warna teks sekunder
        },
        background: {
          DEFAULT: '#F5F5F5',  // Warna latar belakang
          paper: '#FFFFFF',    // Warna kartu/form
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
