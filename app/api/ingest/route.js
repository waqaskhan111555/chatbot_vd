import { scrapeWikipedia } from "@/lib/scraper";
import { chunkArticle } from "@/lib/chunker";
import { embedBatch } from "@/lib/embedder";
import { resetCollection, upsertChunks } from "@/lib/vectorstore";

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) return Response.json({ error: "URL is required" }, { status: 400 });

    const article = await scrapeWikipedia(url);
    if (!article.lead && article.sections.length === 0) {
      return Response.json({ error: "Article has no content" }, { status: 422 });
    }

    const chunks = chunkArticle(article);
    const vectors = await embedBatch(chunks.map((c) => c.text));

    await resetCollection();
    await upsertChunks(chunks, vectors);

    return Response.json({ success: true, title: article.title, chunkCount: chunks.length });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
