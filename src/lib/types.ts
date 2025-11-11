// Document metadata interface
export interface DocumentMetadata {
  id: string;
  filename: string;
  fileSize: number;
  fileType: 'pdf' | 'docx' | 'txt' | 'md';
  uploadedAt: Date;
  lastIndexed: Date;
  chunkCount: number;
  extractedText?: string;
  errorMessage?: string;
}

// Document chunk interface
export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  wordCount: number;
  startPosition: number;
  endPosition: number;
  embedding?: number[];
}

// Processing result interface
export interface ProcessingResult {
  success: boolean;
  metadata: DocumentMetadata;
  chunks: DocumentChunk[];
  error?: string;
}

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'text/markdown': 'md'
} as const;

// Chunking configuration
export const CHUNKING_CONFIG = {
  maxWordsPerChunk: 500,
  overlapWords: 50,
  minChunkWords: 50
} as const;