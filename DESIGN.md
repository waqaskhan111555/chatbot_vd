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

**Method: Section-Aware Hierarchical Chunking**

Each Wikipedia section becomes one or more chunks (max 1800 chars / ~500 tokens). If a section exceeds that, it splits on paragraph boundaries — never mid-sentence.

The section title is prepended to every chunk:
```
[History]

In 1947, the city was designated as the capital...
```

**Why this method over alternatives:**

| Method | Why rejected |
|---|---|
| Fixed-size (500 tokens) | Cuts mid-sentence and mid-concept, destroys context |
| Recursive character split | Ignores Wikipedia's natural structure |
| Section-aware (chosen) | Wikipedia sections are topically coherent by design — perfect retrieval boundaries |

Prepending the section title improves embedding quality — the model encodes the topic alongside the content, making similarity search more precise.

Skipped sections: References, See also, External links, Notes, Further reading — these are noise for RAG.

---

## Qdrant: How Data Is Stored and Queried

### Storage (during ingest)

Each chunk is stored as a **point**:
```json
{
  "id": 3,
  "vector": [0.021, -0.045, 0.198, ...],
  "payload": {
    "text": "[History]\n\nIn 1947...",
    "articleTitle": "Karachi",
    "sectionTitle": "History",
    "chunkIndex": 3,
    "url": "https://en.wikipedia.org/wiki/Karachi"
  }
}
```

- `vector` — 768-dimensional float array from `nomic-embed-text`
- `payload.text` — the full chunk text, returned at query time and fed to the LLM
- `payload.sectionTitle` — which section it came from (useful for debugging)

Collection config:
```js
{ vectors: { size: 768, distance: "Cosine" } }
```

The collection is named `"article"` and is **wiped and recreated** on every new ingest — no stale data from previous articles.

### Retrieval (during chat)

```
User question: "What is the history of Karachi?"
       ↓
embed(question) → 768-dim vector
       ↓
Qdrant cosine similarity search → top 5 closest chunk vectors
       ↓
Return payload.text of those 5 chunks
       ↓
Inject into LLM prompt as context → grounded answer
```

Top-K is 5 — enough context without overflowing the LLM's context window.

---

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
| T-04 | lib/scraper.ts � Wikipedia REST API fetcher | ? Done |
| T-05 | lib/chunker.ts � section-aware chunker | ? Done |
| T-06 | lib/embedder.ts � Ollama embed client | ? Done |
| T-07 | lib/vectorstore.ts � Qdrant wrapper | ? Done |
| T-08 | lib/llm.ts � Ollama streaming client | ? Done |
| T-09 | app/api/ingest/route.ts | ? Done |
| T-10 | app/api/summary/route.ts | ? Done |
| T-11 | app/api/chat/route.ts | ? Done |
| T-12 | app/page.tsx � simple UI | ? Done |
| T-13 | Unit tests (lib layer, mocked) | ? Done |
| T-14 | Integration test (real Qdrant + Ollama) | ? Done |
| T-15 | Dockerfile + docker-compose.yml | ? Done |
| T-16 | README.md + .env.example + NOTES.md | ? Done |
| T-17 | Coverage report committed | ? Done |
| T-18 | Final push to GitHub | ? Done |
