import { describe, it, expect, vi, beforeEach } from 'vitest';
import { embeddingService, EMBEDDING_CONFIG } from '../embeddingService';

// Mock Transformers.js
vi.mock('@xenova/transformers', () => ({
  pipeline: vi.fn(),
  env: {
    allowRemoteModels: false,
    allowLocalModels: true,
  },
}));

describe('EmbeddingService', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('configuration', () => {
    it('should have correct embedding configuration', () => {
      expect(EMBEDDING_CONFIG.model).toBe('Xenova/all-MiniLM-L6-v2');
      expect(EMBEDDING_CONFIG.maxTokens).toBe(384);
      expect(EMBEDDING_CONFIG.dimensions).toBe(384);
      expect(EMBEDDING_CONFIG.batchSize).toBe(5);
    });
  });

  describe('initialization', () => {
    it('should not be ready initially', () => {
      expect(embeddingService.isReady()).toBe(false);
    });

    it('should return model info', () => {
      const info = embeddingService.getModelInfo();
      expect(info).toEqual({
        model: 'Xenova/all-MiniLM-L6-v2',
        maxTokens: 384,
        dimensions: 384,
        isReady: false,
      });
    });
  });

  describe('error handling', () => {
    it('should handle initialization errors gracefully', async () => {
      const { pipeline } = await import('@xenova/transformers');
      vi.mocked(pipeline).mockRejectedValue(new Error('Model loading failed'));

      const { EmbeddingService } = await import('../embeddingService');
      const newService = new EmbeddingService();

      await expect(newService.initialize()).rejects.toThrow(
        'Embedding service initialization failed'
      );
    });

    it('should throw error when service fails to initialize', async () => {
      const { pipeline } = await import('@xenova/transformers');
      vi.mocked(pipeline).mockRejectedValue(new Error('Model loading failed'));

      const { EmbeddingService } = await import('../embeddingService');
      const newService = new EmbeddingService();

      await expect(
        newService.generateEmbedding('test text', 'test-id')
      ).rejects.toThrow('Embedding service initialization failed');
    });
  });

  describe('batch processing', () => {
    it('should handle empty chunk arrays without initialization', async () => {
      const { pipeline } = await import('@xenova/transformers');
      vi.mocked(pipeline).mockRejectedValue(new Error('Model loading failed'));

      const { EmbeddingService } = await import('../embeddingService');
      const newService = new EmbeddingService();

      await expect(
        newService.generateBatchEmbeddings([])
      ).rejects.toThrow('Embedding service initialization failed');
    });
  });
});