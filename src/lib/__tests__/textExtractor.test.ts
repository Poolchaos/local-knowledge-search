import { describe, it, expect } from 'vitest';
import { SUPPORTED_FILE_TYPES } from '../types';

// Simple tests without complex mocking for now
describe('textExtractor', () => {
  describe('SUPPORTED_FILE_TYPES', () => {
    it('should include all required file types', () => {
      expect(SUPPORTED_FILE_TYPES).toMatchObject({
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'text/plain': 'txt',
        'text/markdown': 'md'
      });
    });

    it('should have correct MIME type mappings', () => {
      expect(Object.keys(SUPPORTED_FILE_TYPES)).toHaveLength(4);
      expect(Object.values(SUPPORTED_FILE_TYPES)).toEqual(['pdf', 'docx', 'txt', 'md']);
    });
  });
});