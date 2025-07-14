import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules 환경에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../../web/src'),
        '@/components': path.resolve(__dirname, '../../web/src/components'),
        '@/utils': path.resolve(__dirname, '../../web/src/utils'),
        '@/hooks': path.resolve(__dirname, '../../web/src/hooks'),
        '@/styles': path.resolve(__dirname, '../../web/src/styles'),
      };
    }
    return config;
  },
  managerHead: (head) => {
    return `
      ${head}
      <script>
        // GitHub Pages에서 올바른 경로를 사용하기 위한 설정
        window.STORYBOOK_REACT_APP_BASE_PATH = '/trelio/';
      </script>
    `;
  },
};
export default config;
