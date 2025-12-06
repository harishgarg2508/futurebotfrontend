/**
 * File Search Store Manager
 * Single Responsibility: Manage Gemini file search store lifecycle
 * 
 * This module handles:
 * - Store creation
 * - File uploads to store
 * - Incremental indexing (only new books)
 */

import fs from 'fs';
import path from 'path';
import { geminiAI } from './client';
import {
  readTrackerData,
  writeTrackerData,
  getStoreName,
  setStoreName,
  isBookIndexed,
  addIndexedBook,
  calculateFileHash,
  findBooksToIndex,
  IndexedBook,
} from './bookTracker';

// Default books directory
const BOOKS_DIR = path.join(process.cwd(), 'books');

/**
 * Upload a single file to the file search store
 * Polls until upload is complete (with 10 minute timeout)
 */
async function uploadFileToStore(
  filePath: string,
  storeName: string,
  displayName: string
): Promise<void> {
  console.log(`[FileSearchStore] Uploading: ${displayName}`);
  
  const uploadOperation = await geminiAI.fileSearchStores.uploadToFileSearchStore({
    file: filePath,
    fileSearchStoreName: storeName,
    config: { displayName },
  });

  // Poll until operation completes
  let operation = uploadOperation;
  const start = Date.now();
  const timeout = 10 * 60 * 1000; // 10 minutes
  
  while (!operation.done) {
    await new Promise((r) => setTimeout(r, 2000));
    operation = await geminiAI.operations.get({ operation: operation });
    
    if (Date.now() - start > timeout) {
      throw new Error(`Upload timed out after 10 minutes for: ${displayName}`);
    }
  }

  console.log(`[FileSearchStore] Upload complete: ${displayName}`);
}

/**
 * Create a new file search store in Gemini
 */
async function createNewStore(): Promise<string> {
  console.log('[FileSearchStore] Creating new store...');
  
  const fileSearchStore = await geminiAI.fileSearchStores.create({
    config: { displayName: 'Vedic-Astrology-Books-Store' },
  });

  const storeName = fileSearchStore.name;
  if (!storeName) {
    throw new Error('Failed to create file search store');
  }

  console.log(`[FileSearchStore] Store created: ${storeName}`);
  setStoreName(storeName);
  
  return storeName;
}

/**
 * Ensure store exists and upload any new books
 * This is the main entry point for store management
 * 
 * @returns Object with store name and count of newly indexed books
 */
export async function ensureStoreAndIndexBooks(): Promise<{
  storeName: string;
  newBooksIndexed: number;
  totalBooks: number;
}> {
  // Get or create store
  let storeName = getStoreName();
  
  if (!storeName) {
    storeName = await createNewStore();
  }

  // Find books that need indexing
  const booksToIndex = findBooksToIndex(BOOKS_DIR);
  console.log(`[FileSearchStore] Found ${booksToIndex.length} new book(s) to index`);

  // Upload each new book
  for (const filePath of booksToIndex) {
    const fileName = path.basename(filePath);
    const fileHash = calculateFileHash(filePath);
    const stats = fs.statSync(filePath);

    // Upload to store
    await uploadFileToStore(filePath, storeName, fileName);

    // Track the indexed book
    const indexedBook: IndexedBook = {
      fileName,
      filePath,
      fileHash,
      indexedAt: new Date().toISOString(),
      fileSize: stats.size,
    };
    addIndexedBook(indexedBook);
  }

  const trackerData = readTrackerData();
  
  return {
    storeName,
    newBooksIndexed: booksToIndex.length,
    totalBooks: trackerData.books.length,
  };
}

/**
 * Force re-index a specific book (even if already indexed)
 */
export async function forceIndexBook(filePath: string): Promise<void> {
  let storeName = getStoreName();
  
  if (!storeName) {
    storeName = await createNewStore();
  }

  const fileName = path.basename(filePath);
  const fileHash = calculateFileHash(filePath);
  const stats = fs.statSync(filePath);

  await uploadFileToStore(filePath, storeName, fileName);

  const indexedBook: IndexedBook = {
    fileName,
    filePath,
    fileHash,
    indexedAt: new Date().toISOString(),
    fileSize: stats.size,
  };
  addIndexedBook(indexedBook);
}

/**
 * Get current store status
 */
export function getStoreStatus(): {
  hasStore: boolean;
  storeName: string | null;
  indexedBooks: IndexedBook[];
} {
  const data = readTrackerData();
  return {
    hasStore: !!data.storeName,
    storeName: data.storeName,
    indexedBooks: data.books,
  };
}

/**
 * Get store name (for queries)
 */
export { getStoreName };
