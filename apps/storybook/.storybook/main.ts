import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-actions',
    '@storybook/addon-viewport',
    '@storybook/addon-docs',
    '@storybook/addon-backgrounds',
    '@storybook/addon-controls',
    '@storybook/addon-outline',
    '@storybook/addon-measure',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  managerHead: (head) => {
    return `
      ${head}
      <script>
        // GitHub Pages에서 올바른 경로를 사용하기 위한 설정
        window.STORYBOOK_REACT_APP_BASE_PATH = '/pack-and-go/';
      </script>
    `;
  },
};
export default config;
