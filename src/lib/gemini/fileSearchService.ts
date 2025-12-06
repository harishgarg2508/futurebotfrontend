/**
 * File Search Query Service
 * Single Responsibility: Execute queries against the file search store
 * 
 * This module:
 * - Takes optimized queries
 * - Calls Gemini with fileSearch tool enabled
 * - Returns grounded responses from indexed books
 */

import { geminiAI } from './client';
import { getStoreName, ensureStoreAndIndexBooks } from './fileSearchStore';
import { buildOptimizedQuery, buildFileSearchSystemPrompt, QueryContext } from './queryOptimizer';

export interface FileSearchRequest {
  query: string;
  toolData?: Record<string, any>;
  toolName?: string;
  userContext?: {
    name?: string;
    topic?: string;
  };
}

export interface FileSearchResponse {
  answer: string;
  storeName: string;
  success: boolean;
  error?: string;
}

/**
 * Execute a file search query
 * This is the main entry point for querying indexed books
 */
export async function executeFileSearch(request: FileSearchRequest): Promise<FileSearchResponse> {
  try {
    console.log('\n[STEP 4 - FileSearchService] executeFileSearch called');
    console.log('[STEP 4 - FileSearchService] Input query:', request.query);
    console.log('[STEP 4 - FileSearchService] Has tool data:', !!request.toolData);
    console.log('[STEP 4 - FileSearchService] Tool name:', request.toolName || 'none');
    
    // Ensure store exists
    let storeName = getStoreName();
    console.log('[STEP 4 - FileSearchService] Current store name:', storeName || 'NOT SET');
    
    if (!storeName) {
      console.log('[STEP 4 - FileSearchService] ⚠️ No store found, initializing...');
      // Auto-initialize store if needed
      const result = await ensureStoreAndIndexBooks();
      storeName = result.storeName;
      console.log('[STEP 4 - FileSearchService] ✓ Store initialized:', storeName);
    }

    // Build optimized query
    console.log('[STEP 4 - FileSearchService] Building optimized query...');
    const queryContext: QueryContext = {
      userQuery: request.query,
      toolData: request.toolData,
      toolName: request.toolName,
      userContext: request.userContext,
    };
    
    const optimizedQuery = buildOptimizedQuery(queryContext);
    const systemPrompt = buildFileSearchSystemPrompt(request.userContext);

    console.log('\n[STEP 5 - FileSearchService] 🚀 Calling Gemini API with File Search Tool');
    console.log('[STEP 5 - FileSearchService] Model: gemini-2.5-flash');
    console.log('[STEP 5 - FileSearchService] Store being queried:', storeName);
    console.log('[STEP 5 - FileSearchService] Optimized query (first 300 chars):', optimizedQuery.slice(0, 300));
    console.log('[STEP 5 - FileSearchService] System prompt length:', systemPrompt.length);

    const startTime = Date.now();

    // Call Gemini with file search tool
    const response = await geminiAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [optimizedQuery],
      config: {
        systemInstruction: systemPrompt,
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [storeName],
            },
          },
        ],
        temperature: 0.3,
        topP: 0.95,
        topK: 40,
      },
    });

    const endTime = Date.now();
    const answer = response.text || 'No response generated';
    
    console.log('\n[STEP 5 - FileSearchService] ✓ Gemini API response received');
    console.log('[STEP 5 - FileSearchService] Response time:', (endTime - startTime) + 'ms');
    console.log('[STEP 5 - FileSearchService] Answer length:', answer.length);
    console.log('[STEP 5 - FileSearchService] Answer preview (first 200 chars):', answer.slice(0, 200));
    
    return {
      answer,
      storeName,
      success: true,
    };

  } catch (error: any) {
    console.error('\n[STEP 5 - FileSearchService] ❌ ERROR occurred');
    console.error('[STEP 5 - FileSearchService] Error message:', error?.message);
    console.error('[STEP 5 - FileSearchService] Full error:', error);
    
    return {
      answer: '',
      storeName: '',
      success: false,
      error: error?.message || 'File search failed',
    };
  }
}

/**
 * Check if file search is available (store exists and has books)
 */
export async function isFileSearchAvailable(): Promise<boolean> {
  const storeName = getStoreName();
  return !!storeName;
}
