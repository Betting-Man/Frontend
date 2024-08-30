/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary: '#33533D',  //  배경색
        secondary: '#202D24', // 베팅 보드 배경색
        third: '#81A58C',   // 모달 배경색, 유저카드 배경색
      }
    },
  },
  plugins: [],
}

