/**
 * File Search Store
 * Single Responsibility: Manage file search UI state
 * 
 * This store is decoupled from the main app store and handles:
 * - Loading states for file search
 * - Search results caching
 * - Error states
 */

import { create } from 'zustand';

export interface FileSearchResult {
  id: string;
  query: string;
  answer: string;
  timestamp: number;
  toolData?: Record<string, any>;
}

interface FileSearchState {
  // Status
  isAvailable: boolean;
  setIsAvailable: (available: boolean) => void;
  
  // Loading state
  isSearching: boolean;
  setIsSearching: (loading: boolean) => void;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
  
  // Results cache (last 10 results)
  results: FileSearchResult[];
  addResult: (result: FileSearchResult) => void;
  clearResults: () => void;
  
  // Store info
  storeName: string | null;
  setStoreName: (name: string | null) => void;
  booksCount: number;
  setBooksCount: (count: number) => void;
}

export const useFileSearchStore = create<FileSearchState>((set) => ({
  // Status
  isAvailable: false,
  setIsAvailable: (available) => set({ isAvailable: available }),
  
  // Loading state
  isSearching: false,
  setIsSearching: (loading) => set({ isSearching: loading }),
  
  // Error state
  error: null,
  setError: (error) => set({ error }),
  
  // Results cache
  results: [],
  addResult: (result) => set((state) => ({
    results: [result, ...state.results].slice(0, 10), // Keep last 10
  })),
  clearResults: () => set({ results: [] }),
  
  // Store info
  storeName: null,
  setStoreName: (name) => set({ storeName: name }),
  booksCount: 0,
  setBooksCount: (count) => set({ booksCount: count }),
}));

/**
 * Hook to execute file search
 * This is a convenience hook that handles loading states
 */
export async function searchBooks(
  query: string,
  toolData?: Record<string, any>,
  toolName?: string,
  userContext?: { name?: string }
): Promise<{ answer: string; success: boolean; error?: string }> {
  const { setIsSearching, setError, addResult, setStoreName } = useFileSearchStore.getState();
  
  setIsSearching(true);
  setError(null);
  
  try {
    const response = await fetch('/api/file-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        toolData,
        toolName,
        userContext,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Search failed');
    }

    const data = await response.json();
    
    // Cache result
    addResult({
      id: Date.now().toString(),
      query,
      answer: data.answer,
      timestamp: Date.now(),
      toolData,
    });
    
    // Update store name
    if (data.storeName) {
      setStoreName(data.storeName);
    }

    setIsSearching(false);
    return { answer: data.answer, success: true };

  } catch (error: any) {
    const errorMessage = error?.message || 'Search failed';
    setError(errorMessage);
    setIsSearching(false);
    return { answer: '', success: false, error: errorMessage };
  }
}

/**
 * Hook to check file search availability
 */
export async function checkFileSearchStatus(): Promise<void> {
  const { setIsAvailable, setStoreName, setBooksCount } = useFileSearchStore.getState();
  
  try {
    const response = await fetch('/api/file-search');
    
    if (response.ok) {
      const data = await response.json();
      setIsAvailable(data.available);
      setStoreName(data.storeName);
      setBooksCount(data.booksCount || 0);
    } else {
      setIsAvailable(false);
    }
  } catch {
    setIsAvailable(false);
  }
}
