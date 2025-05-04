import preset from '../../packages/ui/tailwind.preset';

const config = {
  presets: [preset],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../storybook/styles/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

export default config;
