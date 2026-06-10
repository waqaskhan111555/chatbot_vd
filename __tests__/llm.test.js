import { streamSummary, streamChat } from "@/lib/llm";

global.fetch = jest.fn();

afterEach(() => jest.clearAllMocks());

function makeStream(text) {
  const lines = text.split(" ").map((word) => JSON.stringify({ response: word + " " }));
  const body = lines.join("\n");
  return {
    ok: true,
    body: {
      getReader: () => {
        let done = false;
        return {
          read: async () => {
            if (done) return { done: true };
            done = true;
            return { done: false, value: new TextEncoder().encode(body) };
          },
        };
      },
    },
  };
}

test("streamSummary calls Ollama with article text", async () => {
  fetch.mockResolvedValueOnce(makeStream("Nice summary"));
  const stream = await streamSummary("Karachi is a city.");
  expect(stream).toBeDefined();
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("/api/generate"),
    expect.objectContaining({ method: "POST" })
  );
});

test("streamChat calls Ollama with question and context", async () => {
  fetch.mockResolvedValueOnce(makeStream("The answer is yes"));
  const stream = await streamChat("What is Karachi?", [{ text: "Karachi is a city." }]);
  expect(stream).toBeDefined();
  const body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body.prompt).toContain("What is Karachi?");
  expect(body.prompt).toContain("Karachi is a city.");
});

test("streamSummary throws when Ollama is down", async () => {
  fetch.mockResolvedValueOnce({ ok: false, statusText: "Service Unavailable" });
  await expect(streamSummary("text")).rejects.toThrow("LLM request failed");
});
