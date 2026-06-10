import { embed, embedBatch } from "@/lib/embedder";

global.fetch = jest.fn();

afterEach(() => jest.clearAllMocks());

test("embed returns a vector array", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ embedding: [0.1, 0.2, 0.3] }),
  });

  const result = await embed("test text");
  expect(result).toEqual([0.1, 0.2, 0.3]);
});

test("embed throws on failed request", async () => {
  fetch.mockResolvedValueOnce({ ok: false, statusText: "Service Unavailable" });
  await expect(embed("test")).rejects.toThrow("Embed failed");
});

test("embedBatch returns one vector per text", async () => {
  fetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ embedding: [0.1] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ embedding: [0.2] }) });

  const result = await embedBatch(["text1", "text2"]);
  expect(result).toHaveLength(2);
  expect(result[0]).toEqual([0.1]);
  expect(result[1]).toEqual([0.2]);
});
