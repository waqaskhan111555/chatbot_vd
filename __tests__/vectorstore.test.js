import { resetCollection, upsertChunks, searchSimilar } from "@/lib/vectorstore";

jest.mock("@qdrant/js-client-rest", () => ({
  QdrantClient: jest.fn().mockImplementation(() => ({
    getCollections: jest.fn().mockResolvedValue({ collections: [] }),
    deleteCollection: jest.fn().mockResolvedValue({}),
    createCollection: jest.fn().mockResolvedValue({}),
    upsert: jest.fn().mockResolvedValue({}),
    search: jest.fn().mockResolvedValue([
      { payload: { text: "Karachi is a city.", sectionTitle: "History" } },
    ]),
  })),
}));

test("resetCollection creates a fresh collection", async () => {
  await expect(resetCollection()).resolves.not.toThrow();
});

test("upsertChunks stores all chunks", async () => {
  const chunks = [
    { text: "chunk1", metadata: { articleTitle: "A", sectionTitle: "B", chunkIndex: 0, url: "u" } },
  ];
  await expect(upsertChunks(chunks, [[0.1, 0.2]])).resolves.not.toThrow();
});

test("searchSimilar returns matching chunks", async () => {
  const results = await searchSimilar([0.1, 0.2], 5);
  expect(results).toHaveLength(1);
  expect(results[0].text).toBe("Karachi is a city.");
  expect(results[0].sectionTitle).toBe("History");
});
