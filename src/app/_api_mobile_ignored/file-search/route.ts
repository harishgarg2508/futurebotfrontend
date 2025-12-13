/**
 * File Search API Route
 * Single Responsibility: Handle file search HTTP requests
 * 
 * POST /api/file-search
 * - Accepts user query and optional tool data
 * - Returns answer from indexed books
 */

import { NextResponse } from 'next/server';
import { executeFileSearch } from '@/lib/gemini';

export const maxDuration = 60;

interface SearchRequestBody {
  query: string;
  toolData?: Record<string, any>;
  toolName?: string;
  userContext?: {
    name?: string;
    topic?: string;
  };
}

/**
 * POST /api/file-search
 * Execute a search query against indexed books
 */
export async function POST(req: Request) {
  try {
    console.log('\n========== FILE SEARCH API ==========');
    console.log('[STEP 1 - API Route] Request received at /api/file-search');
    
    const body: SearchRequestBody = await req.json();
    console.log('[STEP 1 - API Route] Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.query || typeof body.query !== 'string') {
      console.log('[STEP 1 - API Route] ❌ Validation failed: query is required');
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('[STEP 1 - API Route] ✓ Validation passed, calling executeFileSearch...');

    // Execute file search
    const result = await executeFileSearch({
      query: body.query,
      toolData: body.toolData,
      toolName: body.toolName,
      userContext: body.userContext,
    });

    console.log('[STEP 6 - API Route] Result received from executeFileSearch');
    console.log('[STEP 6 - API Route] Success:', result.success);
    console.log('[STEP 6 - API Route] Store used:', result.storeName);
    console.log('[STEP 6 - API Route] Answer length:', result.answer?.length || 0);

    if (!result.success) {
      console.log('[STEP 6 - API Route] ❌ Search failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Search failed' },
        { status: 500 }
      );
    }

    console.log('[STEP 6 - API Route] ✓ Returning successful response');
    console.log('========== FILE SEARCH COMPLETE ==========\n');
    
    return NextResponse.json({
      answer: result.answer,
      storeName: result.storeName,
    });

  } catch (error: any) {
    console.error('[API/file-search] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/file-search
 * Check if file search is available
 */
export async function GET() {
  try {
    const { getStoreStatus } = await import('@/lib/gemini');
    const status = getStoreStatus();

    return NextResponse.json({
      available: status.hasStore,
      storeName: status.storeName,
      booksCount: status.indexedBooks.length,
      books: status.indexedBooks.map((b) => ({
        name: b.fileName,
        indexedAt: b.indexedAt,
      })),
    });
  } catch (error: any) {
    console.error('[API/file-search] GET Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to get status' },
      { status: 500 }
    );
  }
}
