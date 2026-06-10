# NOTES.md

## What I Would Change With More Time

**1. Reranking**
Currently retrieval is vector similarity only (Qdrant top-5). Adding a cross-encoder reranker (e.g. `cross-encoder/ms-marco-MiniLM-L-6-v2` via `@xenova/transformers`) would improve answer precision — retrieve top-20 from Qdrant, rerank by cross-attention relevance score, pass top-5 to the LLM. For a single Wikipedia article the current approach works well, but reranking would matter at larger scale.

**2. Streaming the ingest progress**
Right now the UI shows a single status message during ingest. For long articles with many chunks, streaming progress (e.g. "Embedding chunk 12/34...") would improve the UX significantly.

**3. Persist articles across sessions**
The Qdrant collection is wiped on every new ingest. A simple title → collection mapping would let users switch between previously loaded articles without re-ingesting.

**4. Better error messages in the UI**
API errors currently surface as plain strings. Categorising them (bad URL, article not found, Ollama not running, Qdrant not running) would help users self-diagnose setup issues.

**5. Test coverage on API routes**
API routes were excluded from coverage to avoid mocking the full Next.js request/response cycle. With more time I'd add proper route-level tests using `next-test-api-route-handler`.

**6. Conversation memory with Redis**
Currently every chat request is stateless — the LLM has no memory of previous messages in the same session. Adding Redis as a session store would fix this:
- Store the last N message pairs (question + answer) per session in Redis
- Inject the conversation history into the LLM prompt alongside the retrieved chunks
- Makes the chat context-aware: follow-up questions like "tell me more about that" would work correctly
- Redis fits naturally into the Docker Compose stack as an additional service
- Session keys can be tied to a browser session ID (cookie) so each user has isolated history

**7. Sentence-level fallback for oversized single paragraphs**
The chunker splits on `\n\n` (paragraph boundaries). If a single paragraph exceeds 1800 chars with no `\n\n` inside it, it becomes an oversized chunk — because splitting mid-paragraph would destroy context. For Wikipedia this is acceptable (largest single paragraph ~3000 chars, well within nomic-embed-text's 8192 token limit). For general web pages a sentence-level fallback (`split on . ! ?`) would be needed to handle extreme cases safely.

**8. Metadata stored in Qdrant but not used for filtering**
Each chunk stores `articleTitle`, `sectionTitle`, `chunkIndex`, `url` as payload. Currently only `text` is sent to the LLM. With more time, `sectionTitle` could be shown in the UI alongside each answer ("Answer sourced from: History section") to improve transparency and trust in RAG responses.

**9. Input guardrails**
Currently any question is passed directly to the LLM. Adding a guardrail layer — a lightweight classifier or a preflight LLM call that checks whether the question is relevant to the loaded article — would prevent the model from responding to off-topic, harmful, or irrelevant queries and keep the chat focused on the ingested content.

**10. Improved prompt engineering for security**
The current RAG prompt is functional but basic. With more time I would harden it with explicit prompt engineering techniques: stricter system-role instructions, an "instruction hierarchy" that makes the context override any user-injected directives, and a post-response filter that checks whether the answer cites only the provided chunks. This reduces prompt injection risk and prevents the model from hallucinating or leaking system instructions.
