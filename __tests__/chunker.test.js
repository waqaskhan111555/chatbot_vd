import { chunkArticle } from "@/lib/chunker";

const article = {
  title: "Karachi",
  url: "https://en.wikipedia.org/wiki/Karachi",
  lead: "Karachi is the largest city in Pakistan.",
  sections: [
    { title: "History", paragraphs: ["Founded in 1729.", "Became capital in 1947."] },
    { title: "Economy", paragraphs: ["A".repeat(1900)] }, // oversized single paragraph
  ],
};

test("first chunk is always the lead", () => {
  const chunks = chunkArticle(article);
  expect(chunks[0].metadata.sectionTitle).toBe("Introduction");
  expect(chunks[0].text).toContain("Karachi is the largest city");
});

test("section title is prepended to chunk text", () => {
  const chunks = chunkArticle(article);
  const historyChunk = chunks.find((c) => c.metadata.sectionTitle === "History");
  expect(historyChunk.text).toMatch(/^\[History\]/);
});

test("small section produces one chunk", () => {
  const chunks = chunkArticle(article);
  const historChunks = chunks.filter((c) => c.metadata.sectionTitle === "History");
  expect(historChunks).toHaveLength(1);
});

test("oversized single paragraph is kept as one chunk", () => {
  const chunks = chunkArticle(article);
  const economyChunks = chunks.filter((c) => c.metadata.sectionTitle === "Economy");
  expect(economyChunks).toHaveLength(1);
  expect(economyChunks[0].text.length).toBeGreaterThan(1800);
});

test("each chunk has required metadata fields", () => {
  const chunks = chunkArticle(article);
  chunks.forEach((c) => {
    expect(c).toHaveProperty("id");
    expect(c).toHaveProperty("text");
    expect(c.metadata).toHaveProperty("articleTitle");
    expect(c.metadata).toHaveProperty("sectionTitle");
    expect(c.metadata).toHaveProperty("url");
  });
});
