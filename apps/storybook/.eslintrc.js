/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.js', 'plugin:storybook/recommended'],
  ignorePatterns: ['.*.js', '*.config.js'],
};
