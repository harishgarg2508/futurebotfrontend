# File Search Implementation

## Overview
This implementation adds a RAG (Retrieval Augmented Generation) system using Gemini's File Search Store to search indexed astrology books.

## Architecture

```
User Query → Agent → searchBooks Tool → File Search Service → Gemini File Search → Response
                                              ↓
                                         Query Optimizer
                                         (combines user query + tool data)
```

## File Structure

```
src/lib/gemini/
├── client.ts           # Gemini AI client initialization
├── bookTracker.ts      # JSON-based tracking of indexed books
├── fileSearchStore.ts  # Store creation & file upload management
├── queryOptimizer.ts   # Builds optimized queries for search
├── fileSearchService.ts # Executes queries against store
└── index.ts            # Module exports

src/lib/
└── fileSearchStore.ts  # Zustand store for UI state

src/app/api/
├── file-search/route.ts  # Search endpoint (public)
└── books/index/route.ts  # Index endpoint (admin-protected)

src/lib/agent/
└── fileSearchHandler.ts  # Tool handler for agent integration
```

## Key Features

1. **Incremental Indexing**: Only new books are indexed (tracked via `.book-index-tracker.json`)
2. **Decoupled Modules**: Each module has single responsibility
3. **Query Optimization**: Combines user query + astrological context for better search
4. **Admin Protection**: Book indexing requires `x-admin-key` header

## API Endpoints

### POST /api/file-search
Search indexed books.
```json
{
  "query": "What are remedies for Mangal Dosha?",
  "userContext": { "name": "User Name" }
}
```

### POST /api/books/index
Index new books (admin only).
```bash
curl -X POST http://localhost:3000/api/books/index \
  -H "x-admin-key: your-admin-key"
```

### GET /api/books/index
Get indexing status (admin only).

## Usage

1. Add PDF books to `books/` folder
2. Set `GEMINI_API_KEY` in `.env.local`
3. Set `BOOKS_ADMIN_KEY` in `.env.local` for admin protection
4. Call POST `/api/books/index` to index books
5. Users can now ask questions via the chat interface

## Flow

1. User asks question through chat
2. Agent identifies if book search is needed
3. Agent calls `searchBooks` tool with optimized query
4. File Search Service queries Gemini with store reference
5. Gemini retrieves relevant chunks from indexed PDFs
6. Response returned to user with grounded information

## Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
BOOKS_ADMIN_KEY=your_admin_secret_key
```
