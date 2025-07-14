import path from 'path';
import { fileURLToPath } from 'url';

// ES modules 환경에서 현재 디렉토리 경로 생성
const currentFileUrl = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFileUrl);

const config = {
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
  webpackFinal: async (config: any) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(currentDir, '../../web/src'),
        '@/components': path.resolve(currentDir, '../../web/src/components'),
        '@/utils': path.resolve(currentDir, '../../web/src/utils'),
        '@/hooks': path.resolve(currentDir, '../../web/src/hooks'),
        '@/styles': path.resolve(currentDir, '../../web/src/styles'),
      };
    }
    return config;
  },
  managerHead: (head: string) => {
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
