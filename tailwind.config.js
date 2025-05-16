/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-mode="dark"]'],
  content: [
    './apps/web/**/*.{js,ts,jsx,tsx}',
    './packages/ui/src/**/*.{js,ts,jsx,tsx}',
    './packages/ui/src/components/**/*.{js,ts,jsx,tsx}',
    './packages/ui/src/components/button/**/*.{js,ts,jsx,tsx}',
    './.storybook/**/*.{js,ts,jsx,tsx}',
    './apps/storybook/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/storybook/stories/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
        // 여기에 필요한 색상을 추가하세요
      },
      keyframes: {
        // 여기에 필요한 키프레임을 추가하세요
      },
      animation: {
        // 여기에 필요한 애니메이션을 추가하세요
      },
    },
  },
  plugins: [],
};
