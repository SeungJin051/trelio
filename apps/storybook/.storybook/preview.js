import '../styles/globals.css';
// Tailwind CSS가 적용될 수 있게 스타일 명시적 import
import '../../../packages/ui/src/styles/tailwind.css';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
