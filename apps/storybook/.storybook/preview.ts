import type { Preview } from '@storybook/react';

import '../styles/globals.css';

// GitHub Pages 배포를 위한 글로벌 타입 확장
declare global {
  interface Window {
    STORYBOOK_REACT_APP_BASE_PATH?: string;
  }
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      // GitHub Pages 배포를 위한 설정
      storySort: {
        order: ['Introduction', 'UI', 'Layout', 'Basic', '*'],
      },
    },
    // 이미지, 폰트 등의 정적 파일 URL 경로 처리
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
};

// 정적 에셋 로드를 위한 베이스 경로 설정
if (typeof window === 'object') {
  // GitHub Pages 배포 시 필요한 경로 설정 (/repository-name/)
  const basePath = window.STORYBOOK_REACT_APP_BASE_PATH || '/';

  // 이미지 등의 정적 에셋 경로에 베이스 경로 추가
  document.documentElement.style.setProperty('--storybook-base-url', basePath);
}

export default preview;
