const core = require('@actions/core');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { run } = require('../index.js');

// Mock axios and @actions/core
jest.mock('axios');
jest.mock('@actions/core');

const mockedAxios = axios;
const mockedCore = core;

// Load fixtures
const fixtures = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures', 'sample-payloads.json'), 'utf8')
);

describe('CircleCI Trigger Action', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock core.getInput default values
    mockedCore.getInput.mockImplementation((name) => {
      const inputs = {
        'user-token': 'test-token-123',
        'project-slug': 'test-org/test-repo',
        'branch': 'main',
        'definition-id': 'test-def-id-456',
        'payload': JSON.stringify(fixtures.basic)
      };
      return inputs[name] || '';
    });
  });

  describe('Input Validation', () => {
    test('should handle valid project slug format', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { id: 'pipeline-123' }
      });

      await run();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://circleci.com/api/v2/project/gh/test-org/test-repo/pipeline/run',
        expect.objectContaining({
          definition_id: 'test-def-id-456',
          config: { branch: 'main' },
          checkout: { branch: 'main' },
          parameters: fixtures.basic
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Circle-Token': 'test-token-123'
          })
        })
      );
    });

    test('should reject invalid project slug format', async () => {
      mockedCore.getInput.mockImplementation((name) => {
        if (name === 'project-slug') return 'invalid-slug';
        if (name === 'payload') return '{}';
        return 'test-value';
      });

      await expect(run()).rejects.toThrow('Invalid project slug format');
      expect(mockedCore.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Invalid project slug format')
      );
    });

    test('should handle invalid JSON payload', async () => {
      mockedCore.getInput.mockImplementation((name) => {
        if (name === 'payload') return 'invalid-json';
        return name === 'project-slug' ? 'test-org/test-repo' : 'test-value';
      });

      await expect(run()).rejects.toThrow('Unexpected token');
      expect(mockedCore.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected token')
      );
    });
  });

  describe('API Request Structure', () => {
    test('should build correct API request with minimal payload', async () => {
      mockedCore.getInput.mockImplementation((name) => {
        const inputs = {
          'user-token': 'token-123',
          'project-slug': 'org/repo',
          'branch': 'feature-branch',
          'definition-id': 'def-456',
          'payload': JSON.stringify(fixtures.minimal)
        };
        return inputs[name] || '';
      });

      mockedAxios.post.mockResolvedValue({
        status: 201,
        data: { id: 'new-pipeline' }
      });

      await run();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://circleci.com/api/v2/project/gh/org/repo/pipeline/run',
        {
          definition_id: 'def-456',
          config: { branch: 'feature-branch' },
          checkout: { branch: 'feature-branch' },
          parameters: fixtures.minimal
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Circle-Token': 'token-123'
          }
        }
      );
    });

    test('should build correct API request with complex payload', async () => {
      mockedCore.getInput.mockImplementation((name) => {
        const inputs = {
          'user-token': 'complex-token',
          'project-slug': 'myorg/myrepo',
          'branch': 'release/v1.0',
          'definition-id': 'complex-def',
          'payload': JSON.stringify(fixtures.complex)
        };
        return inputs[name] || '';
      });

      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { id: 'complex-pipeline' }
      });

      await run();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://circleci.com/api/v2/project/gh/myorg/myrepo/pipeline/run',
        {
          definition_id: 'complex-def',
          config: { branch: 'release/v1.0' },
          checkout: { branch: 'release/v1.0' },
          parameters: fixtures.complex
        },
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle HTTP errors gracefully', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        },
        message: 'Request failed with status code 401'
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      try {
        await run();
        fail('Expected run to throw');
      } catch (error) {
        expect(error.message).toBe('Request failed with status code 401');
        expect(mockedCore.setFailed).toHaveBeenCalledWith(
          'Request failed with status code 401'
        );
      }
    });

    test('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValue(networkError);

      await expect(run()).rejects.toThrow('Network Error');
      expect(mockedCore.setFailed).toHaveBeenCalledWith('Network Error');
    });

            test('should handle CircleCI API errors', async () => {
      const apiError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid pipeline definition',
            errors: ['Definition ID not found']
          }
        },
        message: 'Request failed with status code 400'
      };

      mockedAxios.post.mockRejectedValue(apiError);

      try {
        await run();
        fail('Expected run to throw');
      } catch (error) {
        expect(error.message).toBe('Request failed with status code 400');
        expect(mockedCore.setFailed).toHaveBeenCalledWith(
          'Request failed with status code 400'
        );
      }
    });
  });

  describe('Success Responses', () => {
    test('should handle successful pipeline trigger', async () => {
      const successResponse = {
        status: 201,
        data: {
          id: 'pipeline-uuid-123',
          number: 42,
          created_at: '2023-01-01T00:00:00Z'
        }
      };

      mockedAxios.post.mockResolvedValue(successResponse);

      await run();

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(mockedCore.setFailed).not.toHaveBeenCalled();
    });
  });

  describe('Special Characters and Edge Cases', () => {
    test('should handle special characters in payload', async () => {
      mockedCore.getInput.mockImplementation((name) => {
        const inputs = {
          'user-token': 'token',
          'project-slug': 'org/repo',
          'branch': 'main',
          'definition-id': 'def',
          'payload': JSON.stringify(fixtures.with_special_chars)
        };
        return inputs[name] || '';
      });

      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { id: 'special-pipeline' }
      });

      await run();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          parameters: fixtures.with_special_chars
        }),
        expect.any(Object)
      );
    });

    test('should handle empty string inputs', async () => {
      mockedCore.getInput.mockImplementation((name) => {
        if (name === 'user-token') return '';
        if (name === 'project-slug') return 'org/repo';
        if (name === 'payload') return '{}';
        return 'test-value';
      });

      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { id: 'empty-token-pipeline' }
      });

      await run();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          definition_id: 'test-value'
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Circle-Token': ''
          })
        })
      );
    });
  });
});
