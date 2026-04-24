// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const CODE_FILES = ['**/*.{ts,tsx,js,jsx}'];

const FORBIDDEN_FROM_FEATURES = [
  '@widgets/*',
  '@pages/*',
  '@/widgets/*',
  '@/pages/*',
  '**/widgets/**',
  '**/pages/**',
];

const FORBIDDEN_FROM_ENTITIES = [
  '@features/*',
  '@widgets/*',
  '@pages/*',
  '@/features/*',
  '@/widgets/*',
  '@/pages/*',
  '**/features/**',
  '**/widgets/**',
  '**/pages/**',
];

const FORBIDDEN_FROM_SHARED = [
  '@entities/*',
  '@features/*',
  '@widgets/*',
  '@pages/*',
  '@/entities/*',
  '@/features/*',
  '@/widgets/*',
  '@/pages/*',
  '**/entities/**',
  '**/features/**',
  '**/widgets/**',
  '**/pages/**',
];

const FORBIDDEN_FROM_WIDGETS = [
  '@pages/*',
  '@/pages/*',
  '**/pages/**',
];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['src/features/' + CODE_FILES[0]],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: FORBIDDEN_FROM_FEATURES,
      }],
    },
  },
  {
    files: ['src/entities/' + CODE_FILES[0]],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: FORBIDDEN_FROM_ENTITIES,
      }],
    },
  },
  {
    files: ['src/shared/' + CODE_FILES[0]],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: FORBIDDEN_FROM_SHARED,
      }],
    },
  },
  {
    files: ['src/widgets/' + CODE_FILES[0]],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: FORBIDDEN_FROM_WIDGETS,
      }],
    },
  },
]);
