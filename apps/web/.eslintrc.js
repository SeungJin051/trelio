module.exports = {
  extends: ['../../.eslintrc.js', 'next/core-web-vitals'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@next/next/no-html-link-for-pages': 'off',
  },
};
