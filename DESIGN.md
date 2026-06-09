# DESIGN.md

## Stack
| Layer | Choice |
|---|---|
| Frontend + Backend | Next.js 14 (App Router + API routes) |
| LLM | Ollama + llama3.2:3b |
| Embeddings | Ollama nomic-embed-text (local, 768-dim) |
| Vector DB | Qdrant (Docker) |
| Wikipedia fetch | Wikipedia REST API |

## Data Flow
`
URL ? /api/ingest ? scrape Wikipedia ? chunk by section ? embed ? store in Qdrant
URL ? /api/summary ? full article text ? Ollama ? streaming summary
Question ? /api/chat ? embed question ? Qdrant top-5 ? Ollama RAG ? streaming answer
`

## Architecture
`
Browser
  +-- POST /api/ingest   ? scraper ? chunker ? embedder ? Qdrant
  +-- POST /api/summary  ? llm (streaming)
  +-- POST /api/chat     ? embedder ? Qdrant search ? llm (streaming)

Docker services: app (Next.js) + qdrant + ollama
`

## Chunking Strategy
Section-aware: each Wikipedia section becomes 1+ chunks (max 500 tokens).
Section title prepended to chunk text for better embedding quality.
Skipped sections: References, See also, External links, Notes.

## Env Vars (.env.example)
`
OLLAMA_BASE_URL=http://ollama:11434
QDRANT_URL=http://qdrant:6333
OLLAMA_MODEL=llama3.2:3b
OLLAMA_EMBED_MODEL=nomic-embed-text
`
"@

Set-Content "D:\venture dive test\chatbot-vd\TASKS.md" @"
# TASKS.md

| # | Task | Status |
|---|------|--------|
| T-01 | Scaffold Next.js 14 project | ? Done |
| T-02 | Install deps (@qdrant/js-client-rest, cheerio, jest) | ? Done |
| T-03 | Write REQUIREMENTS.md, DESIGN.md, TASKS.md | ? Done |
| T-04 | lib/scraper.ts — Wikipedia REST API fetcher | ? Done |
| T-05 | lib/chunker.ts — section-aware chunker | ? Done |
| T-06 | lib/embedder.ts — Ollama embed client | ? Done |
| T-07 | lib/vectorstore.ts — Qdrant wrapper | ? Done |
| T-08 | lib/llm.ts — Ollama streaming client | ? Done |
| T-09 | app/api/ingest/route.ts | ? Done |
| T-10 | app/api/summary/route.ts | ? Done |
| T-11 | app/api/chat/route.ts | ? Done |
| T-12 | app/page.tsx — simple UI | ? Done |
| T-13 | Unit tests (lib layer, mocked) | ? Done |
| T-14 | Integration test (real Qdrant + Ollama) | ? Done |
| T-15 | Dockerfile + docker-compose.yml | ? Done |
| T-16 | README.md + .env.example + NOTES.md | ? Done |
| T-17 | Coverage report committed | ? Done |
| T-18 | Final push to GitHub | ? Done |
