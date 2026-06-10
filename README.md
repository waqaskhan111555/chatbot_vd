# chatbot-vd

A RAG-based chat application over Wikipedia articles, powered by a local LLM via Ollama and Qdrant as the vector store.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Ollama](https://ollama.com/download) (only needed for local dev without Docker)

## Run with Docker (recommended)

```bash
docker compose up
```

This starts:
- `app` — Next.js on http://localhost:3000
- `qdrant` — Qdrant vector DB on port 6333
- `ollama` — Ollama LLM runtime on port 11434

> **Note:** First run pulls `llama3.2:3b` (~2GB) and `nomic-embed-text` (~270MB). Takes a few minutes.

## Run locally (without Docker)

```bash
# 1. Install Ollama from https://ollama.com/download then:
ollama pull llama3.2:3b
ollama pull nomic-embed-text

# 2. Start Qdrant
docker run -d -p 6333:6333 qdrant/qdrant

# 3. Copy env and start app
cp .env.example .env.local
# edit .env.local: OLLAMA_BASE_URL=http://localhost:11434 and QDRANT_URL=http://localhost:6333

npm install
npm run dev
```

Open http://localhost:3000

## How to use

1. Paste a Wikipedia URL e.g. `https://en.wikipedia.org/wiki/Karachi`
2. Click **Load** — app scrapes, chunks, embeds, and stores the article
3. Read the generated summary
4. Ask questions in the chat box

## Run tests

```bash
npm test               # unit tests
npm run test:coverage  # with coverage report
```

Coverage: **95.58% lines** (requirement: 85%)

## Environment variables

See `.env.example` for all required variables.

## Caveats

- First LLM response is slow (~10-30s) — model loads into RAM on first call
- `llama3.2:3b` runs on CPU if no GPU — slower but functional
- Only English Wikipedia URLs supported
- Each new article replaces the previous one in Qdrant
