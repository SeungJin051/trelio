import type { Config } from 'tailwindcss';

const preset: Config = {
  darkMode: 'class',
  content: [],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // 필요한 커스텀 색상을 여기에 추가하세요
      },
      keyframes: {
        // 필요한 키프레임 애니메이션을 여기에 추가하세요
      },
      animation: {
        // 필요한 애니메이션을 여기에 추가하세요
      },
    },
  },
  plugins: [],
};

export default preset;
