/**
 * Gemini Module Index
 * Single Responsibility: Export all Gemini-related modules
 */

// Client
export { geminiAI } from './client';

// Book Tracker
export {
  readTrackerData,
  writeTrackerData,
  getStoreName,
  setStoreName,
  isBookIndexed,
  addIndexedBook,
  getIndexedBooks,
  findBooksToIndex,
  clearTrackerData,
  calculateFileHash,
  type IndexedBook,
  type BookIndexData,
} from './bookTracker';

// File Search Store
export {
  ensureStoreAndIndexBooks,
  forceIndexBook,
  getStoreStatus,
} from './fileSearchStore';

// Query Optimizer
export {
  buildOptimizedQuery,
  buildFileSearchSystemPrompt,
  type QueryContext,
} from './queryOptimizer';

// File Search Service
export {
  executeFileSearch,
  isFileSearchAvailable,
  type FileSearchRequest,
  type FileSearchResponse,
} from './fileSearchService';
