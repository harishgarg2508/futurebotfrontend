/**
 * Books Index API Route
 * Single Responsibility: Handle book indexing operations (admin only)
 * 
 * POST /api/books/index - Index new books
 * GET /api/books/index - Get indexing status
 */

import { NextResponse } from 'next/server';
import { ensureStoreAndIndexBooks, getStoreStatus } from '@/lib/gemini';

export const maxDuration = 300; // 5 minutes for indexing

// Simple admin key check (in production, use proper auth)
const ADMIN_KEY = process.env.BOOKS_ADMIN_KEY || 'admin-secret-key';

/**
 * Validate admin authorization
 */
function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('x-admin-key');
  return authHeader === ADMIN_KEY;
}

/**
 * POST /api/books/index
 * Trigger indexing of new books in the books directory
 * 
 * Requires x-admin-key header for authorization
 */
export async function POST(req: Request) {
  try {
    // Check authorization
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide valid x-admin-key header.' },
        { status: 401 }
      );
    }

    console.log('[API/books/index] Starting book indexing...');

    // Index books
    const result = await ensureStoreAndIndexBooks();

    console.log(`[API/books/index] Indexing complete. New: ${result.newBooksIndexed}, Total: ${result.totalBooks}`);

    return NextResponse.json({
      success: true,
      message: result.newBooksIndexed > 0 
        ? `Successfully indexed ${result.newBooksIndexed} new book(s)` 
        : 'No new books to index',
      storeName: result.storeName,
      newBooksIndexed: result.newBooksIndexed,
      totalBooks: result.totalBooks,
    });

  } catch (error: any) {
    console.error('[API/books/index] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Indexing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/books/index
 * Get current indexing status
 */
export async function GET(req: Request) {
  try {
    // Check authorization for status
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide valid x-admin-key header.' },
        { status: 401 }
      );
    }

    const status = getStoreStatus();

    return NextResponse.json({
      hasStore: status.hasStore,
      storeName: status.storeName,
      indexedBooks: status.indexedBooks.map((b) => ({
        fileName: b.fileName,
        indexedAt: b.indexedAt,
        fileSize: b.fileSize,
      })),
      totalBooks: status.indexedBooks.length,
    });

  } catch (error: any) {
    console.error('[API/books/index] GET Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to get status' },
      { status: 500 }
    );
  }
}
