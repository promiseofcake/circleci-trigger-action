module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['__tests__/setup.js', '__tests__/fixtures/'],
  collectCoverageFrom: [
    'index.js',
    '!dist/**',
    '!node_modules/**',
    '!__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  clearMocks: true,
  restoreMocks: true,
  verbose: true
};
