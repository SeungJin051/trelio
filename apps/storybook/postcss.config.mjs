import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: {
    '@tailwindcss/postcss': {
      config: path.resolve(__dirname, '../../tailwind.config.js'),
    },
    autoprefixer: {},
  },
};

export default config;
