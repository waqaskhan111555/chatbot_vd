# TASKS.md

## Execution Log

Tasks decomposed with AI agent assistance (GitHub Copilot). Sequenced for minimal rework: lib layer first (independently testable), then API routes, then UI, then infra.

---

| # | Task | Status | Notes |
|---|------|--------|-------|
| T-01 | Scaffold Next.js 14 project (TypeScript, Tailwind, App Router) | ✅ Done | `create-next-app` into `chatbot-vd/` subfolder (parent dir has spaces) |
| T-02 | Install runtime deps: `@qdrant/js-client-rest`, `cheerio` | ✅ Done | engine warnings are non-fatal |
| T-03 | Install test deps: `jest`, `ts-jest`, `@testing-library/react` | ✅ Done | |
| T-04 | Write REQUIREMENTS.md | ✅ Done | Functional + NFRs, in/out of scope, assumptions |
| T-05 | Write DESIGN.md | ✅ Done | Architecture diagram, chunking strategy, component contracts |
| T-06 | Write TASKS.md (this file) | ✅ Done | Updated incrementally as tasks complete |
| T-07 | `lib/scraper.ts` — Wikipedia REST API fetcher | ✅ Done | Uses `/api/rest_v1/page/mobile-sections/` for structured sections |
| T-08 | `lib/chunker.ts` — section-aware hierarchical chunker | ✅ Done | Skips noise sections, prepends section title to chunk text |
| T-09 | `lib/embedder.ts` — Ollama nomic-embed-text client | ✅ Done | Single + batch embed functions |
| T-10 | `lib/vectorstore.ts` — Qdrant client wrapper | ✅ Done | upsert, search, reset collection |
| T-11 | `lib/llm.ts` — Ollama LLM streaming client | ✅ Done | streamSummary + streamChat |
| T-12 | `app/api/ingest/route.ts` | ✅ Done | Orchestrates scrape → chunk → embed → store |
| T-13 | `app/api/summary/route.ts` | ✅ Done | Full article text → streaming summary |
| T-14 | `app/api/chat/route.ts` | ✅ Done | Query → embed → retrieve → streaming answer |
| T-15 | `app/page.tsx` — simple single-page UI | ✅ Done | URL form, summary panel, chat box |
| T-16 | Jest config + `jest.setup.ts` | ✅ Done | ts-jest, jsdom env, coverage thresholds |
| T-17 | Unit tests for `lib/scraper.ts` | ✅ Done | Mocked fetch |
| T-18 | Unit tests for `lib/chunker.ts` | ✅ Done | Pure function, no mocks needed |
| T-19 | Unit tests for `lib/embedder.ts` | ✅ Done | Mocked Ollama HTTP |
| T-20 | Unit tests for `lib/vectorstore.ts` | ✅ Done | Mocked Qdrant client |
| T-21 | Unit tests for `lib/llm.ts` | ✅ Done | Mocked Ollama HTTP |
| T-22 | Unit tests for API routes | ✅ Done | Mocked lib layer |
| T-23 | Integration test — ingest + search | ✅ Done | Requires running Qdrant + Ollama |
| T-24 | `Dockerfile` | ✅ Done | Multi-stage, non-root user |
| T-25 | `docker-compose.yml` | ✅ Done | app + qdrant + ollama + volume for model weights |
| T-26 | `.env.example` | ✅ Done | All required env vars documented |
| T-27 | `README.md` | ✅ Done | Prerequisites, run instructions, caveats |
| T-28 | `NOTES.md` | ✅ Done | What AI got wrong, what I'd change with more time |
| T-29 | Run coverage report, commit artefact | ✅ Done | `coverage/` committed |
| T-30 | Final git push to public repo | ✅ Done | |

---

## What Was Delegated to AI

- Initial REQUIREMENTS.md, DESIGN.md, TASKS.md structure and content
- Boilerplate for all `lib/` modules
- Jest config and test scaffolding
- Dockerfile and docker-compose.yml
- UI layout structure

## What Was Written / Corrected by Hand

- Chunking logic edge cases (empty sections, sections with single-line paragraphs)
- Qdrant collection schema (vector size must match embedding model output: 768)
- Streaming response handling in API routes (Next.js ReadableStream pattern)
- Integration test setup and teardown
- All RAG prompt templates (AI drafts were too verbose; trimmed for context window)
