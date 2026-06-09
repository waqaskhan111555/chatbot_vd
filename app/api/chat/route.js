import { embed } from "@/lib/embedder";
import { searchSimilar } from "@/lib/vectorstore";
import { streamChat } from "@/lib/llm";

export async function POST(request) {
  try {
    const { question } = await request.json();
    if (!question) return Response.json({ error: "question is required" }, { status: 400 });

    const queryVector = await embed(question);
    const chunks = await searchSimilar(queryVector, 5);

    if (chunks.length === 0) {
      return Response.json({ error: "No article ingested yet" }, { status: 422 });
    }

    const ollamaStream = await streamChat(question, chunks);

    return new Response(
      new ReadableStream({
        async start(controller) {
          const reader = ollamaStream.getReader();
          const decoder = new TextDecoder();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const lines = decoder.decode(value).split("\n").filter(Boolean);
              for (const line of lines) {
                try {
                  const json = JSON.parse(line);
                  if (json.response) controller.enqueue(new TextEncoder().encode(json.response));
                } catch {}
              }
            }
          } finally {
            controller.close();
          }
        },
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
