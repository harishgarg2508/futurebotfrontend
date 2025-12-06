/**
 * File Search Tool Handler
 * Single Responsibility: Execute file search queries against indexed books
 */

import { ToolResult, UserData } from './types';

export interface FileSearchParams {
  query: string;
  topic?: string;
}

/**
 * Handler for File Search queries
 */
export class FileSearchHandler {
  async execute(
    params: FileSearchParams,
    userData: UserData,
    toolData?: Record<string, any>,
    toolName?: string
  ): Promise<ToolResult> {
    try {
      console.log('\n[STEP 2 - FileSearchHandler] Tool handler invoked');
      console.log('[STEP 2 - FileSearchHandler] Query:', params.query);
      console.log('[STEP 2 - FileSearchHandler] Topic:', params.topic || 'none');
      console.log('[STEP 2 - FileSearchHandler] User:', userData.name || 'anonymous');
      console.log('[STEP 2 - FileSearchHandler] Has tool data:', !!toolData);
      
      // Import dynamically to avoid circular dependencies
      const { executeFileSearch } = await import('@/lib/gemini');
      console.log('[STEP 2 - FileSearchHandler] Calling executeFileSearch...');

      const result = await executeFileSearch({
        query: params.query,
        toolData,
        toolName,
        userContext: {
          name: userData.name,
          topic: params.topic,
        },
      });

      console.log('[STEP 2 - FileSearchHandler] Result received');
      console.log('[STEP 2 - FileSearchHandler] Success:', result.success);

      if (result.success) {
        console.log('[STEP 2 - FileSearchHandler] ✓ Returning successful result');
        return {
          success: true,
          data: {
            answer: result.answer,
            storeName: result.storeName,
            source: 'indexed_books',
          },
        };
      }

      console.log('[STEP 2 - FileSearchHandler] ❌ Search failed:', result.error);
      return {
        success: false,
        error: result.error || 'File search failed',
      };
    } catch (error: any) {
      console.error('[STEP 2 - FileSearchHandler] ❌ Exception:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error in file search',
      };
    }
  }
}

// Export singleton instance
export const fileSearchHandler = new FileSearchHandler();
