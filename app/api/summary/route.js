import { streamSummary } from "@/lib/llm";

export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text) return Response.json({ error: "text is required" }, { status: 400 });

    const ollamaStream = await streamSummary(text);

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
