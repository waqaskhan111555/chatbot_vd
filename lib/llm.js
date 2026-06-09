const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const LLM_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2:3b";

async function ollamaStream(prompt) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: LLM_MODEL, prompt, stream: true }),
  });
  if (!res.ok) throw new Error(`LLM request failed: ${res.statusText}`);
  return res.body;
}

export async function streamSummary(articleText) {
  const prompt = `Summarise the following article in 3-5 sentences. Be concise and factual.\n\nArticle:\n${articleText.slice(0, 3000)}`;
  return ollamaStream(prompt);
}

export async function streamChat(question, contextChunks) {
  const context = contextChunks.map((c) => c.text).join("\n\n---\n\n");
  const prompt = `You are a helpful assistant. Answer the question using ONLY the context below. If the answer is not in the context, say "I don't have enough information about that."\n\nContext:\n${context}\n\nQuestion: ${question}\nAnswer:`;
  return ollamaStream(prompt);
}
