/**
 * Book Index Tracker
 * Single Responsibility: Track which books have been indexed to avoid re-indexing
 * 
 * This module maintains a JSON file that tracks:
 * - Store name (Gemini file search store ID)
 * - List of indexed books with their metadata
 * - Timestamps for auditing
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Path to the tracker file
const TRACKER_FILE = path.join(process.cwd(), '.book-index-tracker.json');

export interface IndexedBook {
  fileName: string;
  filePath: string;
  fileHash: string;
  indexedAt: string;
  fileSize: number;
}

export interface BookIndexData {
  storeName: string | null;
  createdAt: string;
  updatedAt: string;
  books: IndexedBook[];
}

const DEFAULT_DATA: BookIndexData = {
  storeName: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  books: [],
};

/**
 * Calculate MD5 hash of a file for change detection
 */
export function calculateFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Read the current tracker data
 */
export function readTrackerData(): BookIndexData {
  try {
    if (!fs.existsSync(TRACKER_FILE)) {
      return { ...DEFAULT_DATA };
    }
    const raw = fs.readFileSync(TRACKER_FILE, 'utf8');
    return JSON.parse(raw) as BookIndexData;
  } catch (error) {
    console.error('[BookTracker] Failed to read tracker file:', error);
    return { ...DEFAULT_DATA };
  }
}

/**
 * Write tracker data to file
 */
export function writeTrackerData(data: BookIndexData): void {
  try {
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(TRACKER_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('[BookTracker] Failed to write tracker file:', error);
    throw error;
  }
}

/**
 * Get the persisted store name
 */
export function getStoreName(): string | null {
  const data = readTrackerData();
  return data.storeName;
}

/**
 * Set the store name
 */
export function setStoreName(storeName: string): void {
  const data = readTrackerData();
  data.storeName = storeName;
  if (!data.createdAt) {
    data.createdAt = new Date().toISOString();
  }
  writeTrackerData(data);
}

/**
 * Check if a book is already indexed (by filename and hash)
 */
export function isBookIndexed(fileName: string, fileHash: string): boolean {
  const data = readTrackerData();
  return data.books.some(
    (book) => book.fileName === fileName && book.fileHash === fileHash
  );
}

/**
 * Add a book to the indexed list
 */
export function addIndexedBook(book: IndexedBook): void {
  const data = readTrackerData();
  // Remove existing entry with same filename (in case of update)
  data.books = data.books.filter((b) => b.fileName !== book.fileName);
  data.books.push(book);
  writeTrackerData(data);
}

/**
 * Get list of all indexed books
 */
export function getIndexedBooks(): IndexedBook[] {
  const data = readTrackerData();
  return data.books;
}

/**
 * Find books that need to be indexed
 * Returns books in the books directory that haven't been indexed yet
 */
export function findBooksToIndex(booksDir: string): string[] {
  if (!fs.existsSync(booksDir)) {
    return [];
  }

  const files = fs.readdirSync(booksDir).filter((f) => 
    f.endsWith('.pdf') || f.endsWith('.txt') || f.endsWith('.docx')
  );

  const toIndex: string[] = [];
  
  for (const fileName of files) {
    const filePath = path.join(booksDir, fileName);
    const fileHash = calculateFileHash(filePath);
    
    if (!isBookIndexed(fileName, fileHash)) {
      toIndex.push(filePath);
    }
  }

  return toIndex;
}

/**
 * Clear all tracker data (for reset)
 */
export function clearTrackerData(): void {
  if (fs.existsSync(TRACKER_FILE)) {
    fs.unlinkSync(TRACKER_FILE);
  }
}
