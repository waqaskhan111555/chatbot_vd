import { QdrantClient } from "@qdrant/js-client-rest";

const COLLECTION = "article";
const VECTOR_SIZE = 768; // nomic-embed-text output dims

const client = new QdrantClient({
  url: process.env.QDRANT_URL ?? "http://localhost:6333",
});

export async function resetCollection() {
  const { collections } = await client.getCollections();
  if (collections.some((c) => c.name === COLLECTION)) {
    await client.deleteCollection(COLLECTION);
  }
  await client.createCollection(COLLECTION, {
    vectors: { size: VECTOR_SIZE, distance: "Cosine" },
  });
}

export async function upsertChunks(chunks, vectors) {
  const points = chunks.map((chunk, i) => ({
    id: i,
    vector: vectors[i],
    payload: { ...chunk.metadata, text: chunk.text },
  }));
  await client.upsert(COLLECTION, { points });
}

export async function searchSimilar(vector, topK = 5) {
  const results = await client.search(COLLECTION, {
    vector,
    limit: topK,
    with_payload: true,
  });
  return results.map((r) => ({
    text: r.payload?.text,
    sectionTitle: r.payload?.sectionTitle,
  }));
}
