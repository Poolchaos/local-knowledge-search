/**
 * Generate a unique ID for documents and chunks
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}