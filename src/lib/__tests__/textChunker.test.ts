import { describe, it, expect } from 'vitest';
import { chunkText, validateChunks } from '../textChunker';
import { CHUNKING_CONFIG } from '../types';

describe('textChunker', () => {
  const documentId = 'test-doc-123';

  describe('chunkText', () => {
    it('should create a single chunk for short text', () => {
      const shortText = 'This is a very short text with only a few words.';
      const chunks = chunkText(shortText, documentId);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toMatchObject({
        documentId,
        chunkIndex: 0,
        text: shortText.trim(),
        startPosition: 0,
        endPosition: shortText.length
      });
      expect(chunks[0].wordCount).toBeLessThan(CHUNKING_CONFIG.minChunkWords);
    });

    it('should create multiple chunks for long text with overlap', () => {
      // Create text with exactly 600 words
      const words = Array.from({ length: 600 }, (_, i) => `word${i + 1}`);
      const longText = words.join(' ');

      const chunks = chunkText(longText, documentId);

      expect(chunks.length).toBeGreaterThan(1);

      // Check first chunk
      expect(chunks[0].chunkIndex).toBe(0);
      expect(chunks[0].wordCount).toBeLessThanOrEqual(CHUNKING_CONFIG.maxWordsPerChunk);

      // Check that chunks have overlap
      if (chunks.length > 1) {
        const firstChunkWords = chunks[0].text.split(/\s+/);
        const secondChunkWords = chunks[1].text.split(/\s+/);

        // Should have some overlapping words
        const hasOverlap = firstChunkWords.some(word =>
          secondChunkWords.includes(word)
        );
        expect(hasOverlap).toBe(true);
      }
    });

    it('should maintain chunk index sequence', () => {
      const mediumText = Array.from({ length: 300 }, (_, i) => `word${i + 1}`).join(' ');
      const chunks = chunkText(mediumText, documentId);

      chunks.forEach((chunk, index) => {
        expect(chunk.chunkIndex).toBe(index);
        expect(chunk.documentId).toBe(documentId);
        expect(chunk.id).toBeTruthy();
      });
    });

    it('should handle text with special characters and punctuation', () => {
      const textWithPunctuation = `
        This is a test document! It contains various punctuation marks:
        commas, periods, semicolons; and even em-dashes — like this one.
        Numbers like 123, 456.789, and percentages like 50% should be handled correctly.
        Special characters @#$%^&*() should not break the chunking algorithm.
      `;

      const chunks = chunkText(textWithPunctuation, documentId);

      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach(chunk => {
        expect(chunk.text).toBeTruthy();
        expect(chunk.wordCount).toBeGreaterThan(0);
        expect(chunk.startPosition).toBeGreaterThanOrEqual(0);
        expect(chunk.endPosition).toBeGreaterThan(chunk.startPosition);
      });
    });

    it('should generate unique chunk IDs', () => {
      const text = Array.from({ length: 100 }, (_, i) => `word${i + 1}`).join(' ');
      const chunks = chunkText(text, documentId);

      const chunkIds = chunks.map(chunk => chunk.id);
      const uniqueIds = new Set(chunkIds);

      expect(uniqueIds.size).toBe(chunkIds.length);
    });
  });

  describe('validateChunks', () => {
    it('should pass validation for well-formed chunks', () => {
      const text = Array.from({ length: 200 }, (_, i) => `word${i + 1}`).join(' ');
      const chunks = chunkText(text, documentId);

      const validation = validateChunks(chunks);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect empty chunks', () => {
      const validChunk = {
        id: 'chunk-1',
        documentId,
        chunkIndex: 0,
        text: 'Valid chunk text',
        wordCount: 3,
        startPosition: 0,
        endPosition: 18
      };

      const emptyChunk = {
        id: 'chunk-2',
        documentId,
        chunkIndex: 1,
        text: '   ', // Empty/whitespace only
        wordCount: 0,
        startPosition: 18,
        endPosition: 21
      };

      const validation = validateChunks([validChunk, emptyChunk]);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Found 1 empty chunks');
    });

    it('should detect chunk index sequence errors', () => {
      const chunks = [
        {
          id: 'chunk-1',
          documentId,
          chunkIndex: 0,
          text: 'First chunk',
          wordCount: 2,
          startPosition: 0,
          endPosition: 11
        },
        {
          id: 'chunk-2',
          documentId,
          chunkIndex: 2, // Should be 1
          text: 'Second chunk',
          wordCount: 2,
          startPosition: 11,
          endPosition: 23
        }
      ];

      const validation = validateChunks(chunks);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error =>
        error.includes('Chunk index mismatch')
      )).toBe(true);
    });

    it('should handle validation of single chunk', () => {
      const singleChunk = {
        id: 'chunk-1',
        documentId,
        chunkIndex: 0,
        text: 'Single chunk text with enough words to meet minimum requirements',
        wordCount: 11,
        startPosition: 0,
        endPosition: 64
      };

      const validation = validateChunks([singleChunk]);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });
});