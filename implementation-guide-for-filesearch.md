# File Search & RAG Implementation Guide

## Complete Technical Documentation for Gemini File Search Store Integration

This document provides a comprehensive, step-by-step implementation guide for the File Search Store system. It explains how files are uploaded, indexed, stored, and searched using Google's Gemini AI with the File Search tool.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Core Dependencies](#2-core-dependencies)
3. [File Structure](#3-file-structure)
4. [Implementation Details](#4-implementation-details)
   - [4.1 Gemini Client Setup](#41-gemini-client-setup)
   - [4.2 File Search Store Management](#42-file-search-store-management)
   - [4.3 File Upload API](#43-file-upload-api)
   - [4.4 Setup Store API](#44-setup-store-api)
   - [4.5 Search API](#45-search-api)
   - [4.6 LangChain Agent (Query Processing)](#46-langchain-agent-query-processing)
   - [4.7 Frontend Integration](#47-frontend-integration)
   - [4.8 Redux State Management](#48-redux-state-management)
5. [Data Flow Diagram](#5-data-flow-diagram)
6. [Step-by-Step Execution Flow](#6-step-by-step-execution-flow)
7. [How Context is Retrieved and Passed to LLM](#7-how-context-is-retrieved-and-passed-to-llm)
8. [Code Implementation](#8-code-implementation)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React/Next.js)                        │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐        │
│  │  ChatInterface  │────▶│   Redux Store   │────▶│   fetchAnswer   │        │
│  │   Component     │     │   (chatSlice)   │     │   AsyncThunk    │        │
│  └─────────────────┘     └─────────────────┘     └────────┬────────┘        │
└───────────────────────────────────────────────────────────┼─────────────────┘
                                                            │
                                                            ▼ POST /api/search
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Next.js API Routes)                    │
│                                                                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐        │
│  │  /api/upload    │     │ /api/setup-store│     │   /api/search   │        │
│  │  (GET)          │     │     (GET)       │     │     (POST)      │        │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘        │
│           │                       │                       │                  │
│           ▼                       ▼                       ▼                  │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │                     file-search-store.ts                        │         │
│  │  - ensureStoreAndUpload()                                       │         │
│  │  - getPersistedStoreName()                                      │         │
│  │  - uploadFileToStore()                                          │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │                     langchain-agent.ts                          │         │
│  │  - queryAIBook() ─────────────────▶ Gemini API with FileSearch │         │
│  └────────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE GEMINI AI SERVICE                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐        │
│  │ File Search     │     │   Vector Store  │     │   Gemini LLM    │        │
│  │ Store (Cloud)   │────▶│   (Embeddings)  │────▶│  (gemini-2.5)   │        │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘        │
│                                                                              │
│  PDFs are indexed and searchable. LLM retrieves relevant chunks             │
│  automatically when fileSearch tool is enabled.                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Dependencies

```json
{
  "dependencies": {
    "@google/genai": "^x.x.x",          // Google Generative AI SDK
    "@reduxjs/toolkit": "^x.x.x",       // State management
    "next": "^14.x.x",                   // Next.js framework
    "react": "^18.x.x",                  // React
    "react-redux": "^x.x.x"              // React Redux bindings
  }
}
```

**Environment Variables Required:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 3. File Structure

```
src/
├── lib/
│   ├── gemini-client.ts          # Gemini AI client initialization
│   ├── file-search-store.ts      # File store management (upload, persist, retrieve)
│   └── langchain-agent.ts        # Query processing with file search
│
├── app/
│   └── api/
│       ├── upload/
│       │   └── route.ts          # File upload endpoint (GET)
│       ├── setup-store/
│       │   └── route.ts          # Store setup endpoint (GET)
│       └── search/
│           └── route.ts          # Search/Query endpoint (POST)
│
├── store/
│   ├── index.ts                  # Redux store configuration
│   └── chatSlice.ts              # Chat state management
│
├── components/
│   └── ChatInterface.tsx         # Main chat UI component
│
public/
└── pdfs/                         # Directory containing PDF files to index
    └── *.pdf                     # Your PDF files go here
```

---

## 4. Implementation Details

### 4.1 Gemini Client Setup

**File: `src/lib/gemini-client.ts`**

**Purpose:** Initialize the Google Generative AI client that will be used throughout the application.

```typescript
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI client with API key from environment
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
```

**Key Points:**
- Single instance of `GoogleGenAI` exported for use across all modules
- API key must be set in environment variables
- This client provides access to:
  - `ai.models.generateContent()` - For LLM queries
  - `ai.fileSearchStores.create()` - For creating file stores
  - `ai.fileSearchStores.uploadToFileSearchStore()` - For uploading files
  - `ai.operations.get()` - For checking upload operation status

---

### 4.2 File Search Store Management

**File: `src/lib/file-search-store.ts`**

**Purpose:** Manage the lifecycle of file search stores - creation, file uploads, and persistence.

```typescript
import fs from 'fs';
import path from 'path';
import { ai } from './gemini-client';

// Local file to persist store name (survives server restarts)
const STORE_FILE = path.join(process.cwd(), '.file_search_store.json');

/**
 * Persist the store name to local filesystem
 * This ensures we don't create duplicate stores on server restart
 */
function persistStoreName(name: string) {
  fs.writeFileSync(STORE_FILE, JSON.stringify({ storeName: name }), { encoding: 'utf8' });
}

/**
 * Read persisted store name from filesystem
 * Returns null if no store was previously created
 */
function readPersistedStoreName(): string | null {
  try {
    if (!fs.existsSync(STORE_FILE)) return null;
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed?.storeName ?? null;
  } catch (e) {
    console.error('Failed to read persisted store file', e);
    return null;
  }
}

/**
 * Upload a single file to the file search store
 * Polls until upload is complete (with 10 minute timeout)
 * 
 * @param filePath - Absolute path to the file on disk
 * @param storeName - The Gemini file search store name/ID
 * @param displayName - Human-readable name for the file
 */
async function uploadFileToStore(filePath: string, storeName: string, displayName: string) {
  // Start the upload operation
  const uploadOperation = await ai.fileSearchStores.uploadToFileSearchStore({
    file: filePath,
    fileSearchStoreName: storeName,
    config: { displayName },
  });

  // Poll until operation completes
  let operation = uploadOperation;
  const start = Date.now();
  while (!operation.done) {
    await new Promise((r) => setTimeout(r, 2000)); // Wait 2 seconds between checks
    operation = await ai.operations.get({ operation: operation });
    if (Date.now() - start > 1000 * 60 * 10) {
      throw new Error('Upload timed out after 10 minutes');
    }
  }
  return operation;
}

/**
 * MAIN FUNCTION: Ensure store exists and all PDFs are uploaded
 * 
 * Logic:
 * 1. Check if we have a persisted store name → return it if exists
 * 2. If no store exists, create a new one
 * 3. Upload all PDFs from public/pdfs directory
 * 4. Persist the store name for future use
 * 
 * @returns The store name (ID) to use for queries
 */
export async function ensureStoreAndUpload(): Promise<string> {
  // STEP 1: Return persisted store if present (avoid duplicate stores)
  const persisted = readPersistedStoreName();
  if (persisted) return persisted;

  // STEP 2: Create a new File Search store in Gemini
  const fileSearchStore = await ai.fileSearchStores.create({ 
    config: { displayName: 'My-PDF-Store' } 
  });
  const storeName = fileSearchStore.name;
  if (!storeName) throw new Error('Failed to create file search store');

  // STEP 3: Upload all PDFs from the public/pdfs directory
  const pdfDir = path.join(process.cwd(), 'public', 'pdfs');
  const files = fs.existsSync(pdfDir) 
    ? fs.readdirSync(pdfDir).filter((f) => f.endsWith('.pdf')) 
    : [];

  for (const fileName of files) {
    const filePath = path.join(pdfDir, fileName);
    await uploadFileToStore(filePath, storeName, fileName);
  }

  // STEP 4: Persist the store name for future server restarts
  persistStoreName(storeName);
  return storeName;
}

/**
 * Get the current persisted store name (if any)
 * Used to check if store already exists without creating one
 */
export function getPersistedStoreName(): string | null {
  return readPersistedStoreName();
}
```

**Key Concepts:**

| Function | Purpose | When Called |
|----------|---------|-------------|
| `persistStoreName()` | Save store ID to disk | After creating new store |
| `readPersistedStoreName()` | Load store ID from disk | On every request |
| `uploadFileToStore()` | Upload single file to Gemini | During store initialization |
| `ensureStoreAndUpload()` | Main orchestrator | On first search or setup |
| `getPersistedStoreName()` | Quick check for existing store | Before creating new store |

---

### 4.3 File Upload API

**File: `src/app/api/upload/route.ts`**

**Purpose:** HTTP endpoint to trigger file upload (useful for manual uploads or on-demand indexing).

```typescript
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini-client';
import { ensureStoreAndUpload, getPersistedStoreName } from '@/lib/file-search-store';

// Duplicate helper (same as in file-search-store.ts)
async function uploadFileToStore(filePath: string, storeName: string, displayName: string) {
  const uploadOperation = await ai.fileSearchStores.uploadToFileSearchStore({
    file: filePath,
    fileSearchStoreName: storeName,
    config: { displayName },
  });

  let operation = uploadOperation;
  while (!operation.done) {
    await new Promise((r) => setTimeout(r, 3000));
    operation = await ai.operations.get({ operation: operation });
  }
  return operation;
}

/**
 * GET /api/upload
 * 
 * Triggers upload of PDFs to file search store
 * If store already exists, returns existing store name
 */
export async function GET() {
  try {
    // Check if already uploaded
    const persisted = getPersistedStoreName();
    if (persisted) {
      return NextResponse.json({ message: 'Already uploaded', storeName: persisted });
    }

    // Create store and upload files
    const storeName = await ensureStoreAndUpload();
    return NextResponse.json({ message: 'PDFs uploaded', storeName });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

**Usage:**
```bash
# Trigger upload via HTTP
curl http://localhost:3000/api/upload
```

---

### 4.4 Setup Store API

**File: `src/app/api/setup-store/route.ts`**

**Purpose:** Force re-create the file search store (delete old cache and create fresh).

```typescript
import { ensureStoreAndUpload } from '@/lib/file-search-store';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/setup-store
 * 
 * IMPORTANT: This endpoint DELETES the existing store cache and creates a NEW store.
 * Use this when:
 * - You've added new PDFs to public/pdfs
 * - You want to re-index all files
 * - The existing store is corrupted
 */
export async function GET() {
  try {
    // STEP 1: Force delete the existing cache file
    const STORE_FILE = path.join(process.cwd(), '.file_search_store.json');
    if (fs.existsSync(STORE_FILE)) {
      fs.unlinkSync(STORE_FILE);
      console.log('Deleted old .file_search_store.json');
    }

    // STEP 2: Trigger fresh creation and upload
    console.log('Starting store creation and upload...');
    const storeName = await ensureStoreAndUpload();
    
    return NextResponse.json({ 
      success: true, 
      message: 'File store created and book uploaded successfully',
      storeName 
    });
  } catch (error) {
    console.error('Setup failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
```

**Usage:**
```bash
# Force re-create store
curl http://localhost:3000/api/setup-store
```

---

### 4.5 Search API

**File: `src/app/api/search/route.ts`**

**Purpose:** Main endpoint for querying the LLM with file search context.

```typescript
import { queryAIBook } from '@/lib/langchain-agent';
import { ensureStoreAndUpload, getPersistedStoreName } from '@/lib/file-search-store';
import { NextResponse } from 'next/server';

/**
 * POST /api/search
 * 
 * Request Body:
 * {
 *   "query": "What is the concept of agents?",
 *   "storeName": "optional-store-name",  // If not provided, uses persisted or creates new
 *   "options": {                         // Optional query customization
 *     "mode": "learning" | "interview-prep" | "implementation" | "review",
 *     "userRole": "developer" | "architect" | "student",
 *     "focusArea": "agent-systems" | "deep-learning" | "planning" | "uncertainty" | "general",
 *     "includeCode": true | false,
 *     "includeRealWorld": true | false
 *   }
 * }
 * 
 * Response:
 * {
 *   "answer": "The LLM's response with file context...",
 *   "storeName": "the-store-name-used"
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, storeName, options } = body;

    // Validate required field
    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    // STEP 1: Determine which store to use
    // Priority: request body > persisted store > create new
    let effectiveStoreName = storeName ?? getPersistedStoreName();
    if (!effectiveStoreName) {
      effectiveStoreName = await ensureStoreAndUpload();
    }

    // STEP 2: Query the LLM with file search tool
    const answer = await queryAIBook(effectiveStoreName, query, options);
    
    // STEP 3: Return answer with store name (for client caching)
    return NextResponse.json({ answer, storeName: effectiveStoreName });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}
```

---

### 4.6 LangChain Agent (Query Processing)

**File: `src/lib/langchain-agent.ts`**

**Purpose:** The core module that sends queries to Gemini with the File Search tool enabled.

```typescript
import { ai } from "./gemini-client";

/**
 * Query the AI book with comprehensive prompting
 * 
 * THIS IS WHERE THE MAGIC HAPPENS:
 * 1. We construct a detailed system instruction
 * 2. We pass the user's query
 * 3. We enable the fileSearch tool with our store
 * 4. Gemini automatically retrieves relevant chunks from PDFs
 * 5. LLM generates response based on retrieved context
 * 
 * @param storeName - The Gemini file search store ID
 * @param query - User's question
 * @param context - Optional customization options
 */
export async function queryAIFoundationsBook(storeName: string, query: string, context?: {
  userRole?: 'developer' | 'architect' | 'student';
  focusArea?: 'agent-systems' | 'deep-learning' | 'planning' | 'uncertainty' | 'general';
  includeCode?: boolean;
  includeRealWorld?: boolean;
}) {
  // Extract options with defaults
  const userRole = context?.userRole || 'developer';
  const focusArea = context?.focusArea || 'general';
  const includeCode = context?.includeCode ?? true;
  const includeRealWorld = context?.includeRealWorld ?? true;

  // Build role-specific context
  const roleMap = {
    'developer': 'full-stack developer transitioning to AI architecture',
    'architect': 'AI architect',
    'student': 'student learning AI fundamentals'
  };
  const userContext = roleMap[userRole];

  // Build focus area context
  const focusContext = focusArea !== 'general' 
    ? `\n\nFOCUS AREA: The user is particularly interested in ${focusArea.replace('-', ' ')} aspects.`
    : '';

  // Construct comprehensive system instruction
  const systemInstruction = `You are an expert mentor...
    USER CONTEXT: You are helping a ${userContext}...
    ${focusContext}
    
    RESPONSE STRUCTURE:
    1. **Core Concept** (2-3 sentences)
    2. **Key Points** (Clear bullet points)
    3. **Practical Application**
    ${includeCode ? `4. **Implementation Guidance** (Python & TypeScript)` : ''}
    ${includeRealWorld ? `5. **Real-World Application**` : ''}
    
    CRITICAL: Base your answer ONLY on the book content provided in context.
  `;

  // ==========================================
  // KEY API CALL - This is where context is passed to LLM
  // ==========================================
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',  // The LLM model to use
    contents: [query],          // User's question
    config: {
      systemInstruction: systemInstruction,  // How LLM should behave
      tools: [
        {
          fileSearch: {
            fileSearchStoreNames: [storeName],  // ← THIS ENABLES FILE CONTEXT RETRIEVAL
          },
        },
      ],
      temperature: 0.3,  // Lower = more factual
      topP: 0.95,
      topK: 40,
    },
  });

  return response.text;
}

/**
 * Convenience wrapper with mode presets
 */
export async function queryAIBook(
  storeName: string, 
  query: string, 
  options?: {
    mode?: 'learning' | 'interview-prep' | 'implementation' | 'review';
    userRole?: 'developer' | 'architect' | 'student';
    focusArea?: 'agent-systems' | 'deep-learning' | 'planning' | 'uncertainty' | 'general';
    includeCode?: boolean;
    includeRealWorld?: boolean;
  }
) {
  // Mode presets for common use cases
  const modePresets = {
    'learning': {
      userRole: 'developer' as const,
      focusArea: 'general' as const,
      includeCode: true,
      includeRealWorld: true,
    },
    'interview-prep': {
      userRole: 'architect' as const,
      focusArea: 'general' as const,
      includeCode: false,
      includeRealWorld: true,
    },
    'implementation': {
      userRole: 'developer' as const,
      focusArea: 'general' as const,
      includeCode: true,
      includeRealWorld: true,
    },
    'review': {
      userRole: 'architect' as const,
      focusArea: 'general' as const,
      includeCode: false,
      includeRealWorld: false,
    },
  };

  // Merge mode preset with custom options
  const context = options?.mode 
    ? { ...modePresets[options.mode], ...options }
    : options;

  return queryAIFoundationsBook(storeName, query, context);
}

// Specialized query functions
export async function explainConcept(storeName: string, concept: string) { /* ... */ }
export async function compareToLLMs(storeName: string, concept: string) { /* ... */ }
export async function getInterviewQuestion(storeName: string, topic: string) { /* ... */ }
export async function findImplementation(storeName: string, concept: string) { /* ... */ }
export async function getChapterSummary(storeName: string, chapterNumber: number) { /* ... */ }
```

---

### 4.7 Frontend Integration

**File: `src/components/ChatInterface.tsx`**

**Purpose:** React component that provides the chat UI and triggers API calls.

```typescript
'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { addMessage, fetchAnswer } from '@/store/chatSlice';

export default function ChatInterface() {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading, error } = useSelector((state: RootState) => state.chat);
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat immediately
    dispatch(addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    }));

    // Trigger API call to get answer
    // This dispatches the fetchAnswer async thunk
    dispatch(fetchAnswer({ query: userMessage, language: selectedLanguage }));
  };

  return (
    <div>
      {/* Messages display */}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      
      {/* Input area */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

---

### 4.8 Redux State Management

**File: `src/store/chatSlice.ts`**

**Purpose:** Manage chat state and handle async API calls.

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  storeName: string | null;  // ← Cached store name from API response
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  storeName: null,
};

/**
 * Async thunk to fetch answer from the API
 * 
 * This function:
 * 1. Gets the cached storeName from Redux state (if any)
 * 2. Sends POST request to /api/search
 * 3. Returns the answer and storeName for caching
 */
export const fetchAnswer = createAsyncThunk(
  'chat/fetchAnswer',
  async ({ query, language }: { query: string; language: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const storeName = state.chat.storeName;  // ← Use cached store name

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, storeName, language }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch answer');
      }

      const data = await response.json();
      return { answer: data.answer, storeName: data.storeName };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearChat: (state) => {
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnswer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnswer.fulfilled, (state, action) => {
        state.loading = false;
        state.storeName = action.payload.storeName;  // ← Cache for subsequent queries
        state.messages.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: action.payload.answer,
          timestamp: Date.now(),
        });
      })
      .addCase(fetchAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
```

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: INITIALIZATION (One-time or on-demand)
═══════════════════════════════════════════════

   ┌─────────────────┐
   │  Admin/User     │
   │  triggers setup │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ GET /api/       │
   │ setup-store     │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │  ensureStoreAndUpload()                                         │
   │  ┌─────────────────────────────────────────────────────────┐   │
   │  │ 1. Delete .file_search_store.json (if exists)           │   │
   │  │ 2. Create new FileSearchStore in Gemini Cloud           │   │
   │  │ 3. Read all PDFs from public/pdfs/                      │   │
   │  │ 4. For each PDF:                                        │   │
   │  │    - Call ai.fileSearchStores.uploadToFileSearchStore() │   │
   │  │    - Poll ai.operations.get() until done                │   │
   │  │ 5. Save storeName to .file_search_store.json            │   │
   │  └─────────────────────────────────────────────────────────┘   │
   └────────┬────────────────────────────────────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │  GEMINI CLOUD                                                   │
   │  ┌─────────────────────────────────────────────────────────┐   │
   │  │ FileSearchStore: "stores/abc123..."                     │   │
   │  │ ├── document1.pdf (vectorized, indexed)                 │   │
   │  │ ├── document2.pdf (vectorized, indexed)                 │   │
   │  │ └── document3.pdf (vectorized, indexed)                 │   │
   │  └─────────────────────────────────────────────────────────┘   │
   └─────────────────────────────────────────────────────────────────┘


PHASE 2: QUERY PROCESSING (Every user question)
════════════════════════════════════════════════

   ┌──────────────────┐
   │  User types      │
   │  question in     │
   │  ChatInterface   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  dispatch(       │
   │  fetchAnswer())  │
   │  Redux Thunk     │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐      ┌──────────────────────────────────┐
   │  POST /api/      │      │  Request Body:                   │
   │  search          │◀─────│  { query: "What is...",          │
   │                  │      │    storeName: "cached-or-null",  │
   │                  │      │    options: { mode: "learning" } }│
   └────────┬─────────┘      └──────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  /api/search/route.ts                                        │
   │  ┌────────────────────────────────────────────────────────┐  │
   │  │ 1. Extract query, storeName, options from body         │  │
   │  │ 2. If no storeName:                                    │  │
   │  │    - Check getPersistedStoreName()                     │  │
   │  │    - If still null: ensureStoreAndUpload()             │  │
   │  │ 3. Call queryAIBook(storeName, query, options)         │  │
   │  └────────────────────────────────────────────────────────┘  │
   └────────┬─────────────────────────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  langchain-agent.ts :: queryAIBook()                         │
   │  ┌────────────────────────────────────────────────────────┐  │
   │  │ 1. Build systemInstruction (role, focus, format)       │  │
   │  │ 2. Call Gemini API:                                    │  │
   │  │                                                        │  │
   │  │    ai.models.generateContent({                         │  │
   │  │      model: 'gemini-2.5-flash',                        │  │
   │  │      contents: [query],                                │  │
   │  │      config: {                                         │  │
   │  │        systemInstruction: systemInstruction,           │  │
   │  │        tools: [{                                       │  │
   │  │          fileSearch: {                                 │  │
   │  │            fileSearchStoreNames: [storeName] ← KEY!    │  │
   │  │          }                                             │  │
   │  │        }]                                              │  │
   │  │      }                                                 │  │
   │  │    })                                                  │  │
   │  │                                                        │  │
   │  │ 3. Return response.text                                │  │
   │  └────────────────────────────────────────────────────────┘  │
   └────────┬─────────────────────────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  GEMINI API INTERNAL PROCESSING                              │
   │  ┌────────────────────────────────────────────────────────┐  │
   │  │ 1. Receive query + fileSearch tool config              │  │
   │  │ 2. AUTOMATIC RETRIEVAL:                                │  │
   │  │    - Embed user query                                  │  │
   │  │    - Search FileSearchStore for similar chunks         │  │
   │  │    - Retrieve top-k relevant passages from PDFs        │  │
   │  │ 3. AUGMENTED GENERATION:                               │  │
   │  │    - Combine retrieved context with system instruction │  │
   │  │    - Generate response based on retrieved content      │  │
   │  │ 4. Return generated text                               │  │
   │  └────────────────────────────────────────────────────────┘  │
   └────────┬─────────────────────────────────────────────────────┘
            │
            ▼
   ┌──────────────────┐
   │  Response JSON:  │
   │  {               │
   │   answer: "...", │
   │   storeName: ""  │
   │  }               │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  Redux reducer   │
   │  fulfilled       │
   │  - Cache store   │
   │  - Add message   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  UI Updates      │
   │  ChatInterface   │
   │  shows answer    │
   └──────────────────┘
```

---

## 6. Step-by-Step Execution Flow

### First Query (Cold Start)

```
1. User opens app
2. User types: "What is an agent?"
3. ChatInterface.handleSend()
4. dispatch(addMessage({ role: 'user', content: 'What is an agent?' }))
5. dispatch(fetchAnswer({ query: 'What is an agent?', language: 'en-IN' }))
6. fetchAnswer async thunk:
   - state.chat.storeName is null (first time)
   - POST /api/search with { query, storeName: null }
7. /api/search handler:
   - query = "What is an agent?"
   - storeName = null
   - getPersistedStoreName() returns null (no cache file)
   - ensureStoreAndUpload() is called:
     a. Create new FileSearchStore in Gemini
     b. Read PDFs from public/pdfs/
     c. Upload each PDF to the store
     d. Save storeName to .file_search_store.json
     e. Return storeName
   - queryAIBook(storeName, query) is called
8. langchain-agent.ts:
   - Build system instruction
   - Call ai.models.generateContent() with fileSearch tool
9. Gemini processes:
   - Retrieves relevant chunks from indexed PDFs
   - Generates response using retrieved context
10. Response returned to frontend
11. Redux state updated:
    - state.chat.storeName = "stores/abc123..."
    - New assistant message added
12. UI re-renders with answer
```

### Subsequent Queries (Warm)

```
1. User types: "Explain planning in AI"
2. ChatInterface.handleSend()
3. dispatch(fetchAnswer({ query: 'Explain planning in AI' }))
4. fetchAnswer async thunk:
   - state.chat.storeName = "stores/abc123..." (cached from before)
   - POST /api/search with { query, storeName: "stores/abc123..." }
5. /api/search handler:
   - storeName = "stores/abc123..." (from request body)
   - No need to create/upload - store exists!
   - queryAIBook(storeName, query) is called directly
6-12. Same as steps 8-12 above
```

---

## 7. How Context is Retrieved and Passed to LLM

### The Key Mechanism: Gemini File Search Tool

The Gemini API handles context retrieval **automatically** when you enable the `fileSearch` tool. Here's what happens under the hood:

```typescript
// When you call this:
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [query],  // User's question
  config: {
    systemInstruction: systemInstruction,
    tools: [
      {
        fileSearch: {
          fileSearchStoreNames: [storeName],  // Your indexed PDFs
        },
      },
    ],
  },
});
```

### Internal Flow:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  GEMINI FILE SEARCH INTERNAL PROCESS                                         │
│                                                                              │
│  ┌─────────────┐                                                             │
│  │ User Query  │ "What is an agent in AI?"                                   │
│  └──────┬──────┘                                                             │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ STEP 1: Query Embedding                                              │    │
│  │ Convert "What is an agent in AI?" to vector embedding               │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ STEP 2: Vector Search                                                │    │
│  │ Search FileSearchStore "stores/abc123..." for similar vectors        │    │
│  │                                                                      │    │
│  │ FileSearchStore contains:                                            │    │
│  │ ├── Chunk 1: "An agent is an entity that perceives..." [0.89 sim]   │    │
│  │ ├── Chunk 2: "Agents act rationally to achieve..." [0.85 sim]       │    │
│  │ ├── Chunk 3: "The agent design space includes..." [0.82 sim]        │    │
│  │ └── ... (thousands of indexed chunks from PDFs)                      │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ STEP 3: Context Augmentation                                         │    │
│  │                                                                      │    │
│  │ System Instruction: "You are an expert AI mentor..."                 │    │
│  │ +                                                                    │    │
│  │ Retrieved Context:                                                   │    │
│  │ "An agent is an entity that perceives its environment through       │    │
│  │  sensors and acts upon that environment through actuators..."        │    │
│  │ +                                                                    │    │
│  │ User Query: "What is an agent in AI?"                                │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ STEP 4: LLM Generation                                               │    │
│  │                                                                      │    │
│  │ LLM generates response based on:                                     │    │
│  │ 1. System instruction (how to format response)                       │    │
│  │ 2. Retrieved PDF content (factual grounding)                         │    │
│  │ 3. User query (what to answer)                                       │    │
│  │                                                                      │    │
│  │ Output: "An agent in AI is a computational entity that..."           │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What You DON'T Need to Do:

1. ❌ Manually chunk documents
2. ❌ Create embeddings yourself
3. ❌ Store vectors in a database
4. ❌ Retrieve chunks manually
5. ❌ Inject context into prompts yourself

### What Gemini Does For You:

1. ✅ Automatically chunks uploaded documents
2. ✅ Creates embeddings for each chunk
3. ✅ Stores in cloud vector database
4. ✅ Retrieves relevant chunks based on query
5. ✅ Injects context into LLM context window
6. ✅ Generates grounded response

---

## 8. Code Implementation

### Complete Implementation Checklist

To implement this system in your codebase, follow these steps:

#### Step 1: Install Dependencies

```bash
npm install @google/genai @reduxjs/toolkit react-redux
```

#### Step 2: Set Environment Variables

```env
# .env.local
GEMINI_API_KEY=your_api_key_here
```

#### Step 3: Create Gemini Client

```typescript
// src/lib/gemini-client.ts
import { GoogleGenAI } from '@google/genai';

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
```

#### Step 4: Create File Search Store Manager

```typescript
// src/lib/file-search-store.ts
// (See Section 4.2 for complete code)
```

#### Step 5: Create API Routes

```typescript
// src/app/api/setup-store/route.ts
// src/app/api/upload/route.ts
// src/app/api/search/route.ts
// (See Sections 4.3, 4.4, 4.5 for complete code)
```

#### Step 6: Create Query Agent

```typescript
// src/lib/langchain-agent.ts
// (See Section 4.6 for complete code)
```

#### Step 7: Create Redux Store

```typescript
// src/store/chatSlice.ts
// src/store/index.ts
// (See Section 4.8 for complete code)
```

#### Step 8: Create UI Component

```typescript
// src/components/ChatInterface.tsx
// (See Section 4.7 for complete code)
```

#### Step 9: Add PDFs to Index

```
public/
└── pdfs/
    ├── book1.pdf
    ├── book2.pdf
    └── guide.pdf
```

#### Step 10: Initialize Store

```bash
# Call this once to create store and upload files
curl http://localhost:3000/api/setup-store
```

---

## Summary

| Component | File | Purpose |
|-----------|------|---------|
| Gemini Client | `gemini-client.ts` | Initialize AI SDK |
| Store Manager | `file-search-store.ts` | Create, upload, persist store |
| Setup API | `/api/setup-store` | Force re-create store |
| Upload API | `/api/upload` | Trigger uploads |
| Search API | `/api/search` | Query with context |
| Query Agent | `langchain-agent.ts` | LLM call with fileSearch tool |
| Redux Slice | `chatSlice.ts` | State management |
| Chat UI | `ChatInterface.tsx` | User interface |

**The key insight:** Gemini's `fileSearch` tool handles all RAG complexity internally. You just:
1. Upload files to a store (once)
2. Pass the store name when generating content
3. Gemini automatically retrieves relevant context and grounds the response
