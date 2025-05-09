const path = require('path');

module.exports = {
  framework: {
    name: '@storybook/nextjs',
    options: {}, // 기본 Next.js webpack 설정 그대로 사용
  },
  stories: ['../stories/*.stories.@(ts|tsx|js|jsx|mdx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-themes'],
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@storybook': path.resolve(__dirname, '../src'),
      '@ui': path.resolve(__dirname, '../../../packages/ui/src'),
      '@ui/components': path.resolve(
        __dirname,
        '../../../packages/ui/src/components'
      ),
      '@ui/utils': path.resolve(__dirname, '../../../packages/ui/src/utils'),
      '@web': path.resolve(__dirname, '../../../apps/web/src'),
      '@web/components': path.resolve(
        __dirname,
        '../../../apps/web/src/components'
      ),
    };

    return config;
  },
};
