// Jest setup file for GitHub Actions testing
process.env.NODE_ENV = 'test';

// Mock environment variables that GitHub Actions would typically provide
process.env.GITHUB_REPOSITORY = 'test-org/test-repo';
process.env.GITHUB_REF = 'refs/heads/main';
process.env.GITHUB_HEAD_REF = 'feature-branch';

// Suppress console.log during tests unless explicitly needed
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
