module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  plugins: ['@typescript-eslint', 'jest'],
  extends: ['eslint:recommended', 'plugin:jest/recommended'],
  rules: {
    // Best practices
    'no-console': 'off', // CLI tool, console is expected
    'prefer-const': 'error',
    'no-var': 'error',

    // Jest best practices
    'jest/expect-expect': 'warn',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
  },
  overrides: [
    {
      // TypeScript files with type checking
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        project: ['./tsconfig.base.json', './packages/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jest/recommended',
      ],
      rules: {
        // Catch implicit any (would catch Issue #1)
        '@typescript-eslint/no-explicit-any': 'warn', // Warn, not error (any is sometimes needed)
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',

        // Catch promise issues
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',

        // General code quality
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],

        // Best practices
        'no-console': 'off',
        'prefer-const': 'error',
        'no-var': 'error',

        // Jest best practices
        'jest/expect-expect': 'warn',
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
      },
    },
    {
      // More lenient rules for test files
      files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.js'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.config.js',
    '.eslintrc.js',
    'jest.config.js',
    'jest.config.base.js',
    '.changeset/',
  ],
};
