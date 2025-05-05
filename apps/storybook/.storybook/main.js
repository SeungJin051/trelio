// apps/storybook/.storybook/main.js
module.exports = {
  framework: {
    name: '@storybook/nextjs',
    options: {}, // 기본 Next.js webpack 설정 그대로 사용
  },
  stories: ['../stories/**/*.stories.@(ts|tsx|js|jsx|mdx)'],
  addons: ['@storybook/addon-essentials'],
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@repo/ui': path.resolve(__dirname, '../../packages/ui/src'),
    };

    return config;
  },
};
