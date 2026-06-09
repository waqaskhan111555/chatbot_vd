const MAX_CHARS = 1800; // ~500 tokens

export function chunkArticle(article) {
  const chunks = [];
  let idx = 0;

  if (article.lead.trim().length > 30) {
    chunks.push({
      id: `chunk-${idx++}`,
      text: `[${article.title}]\n\n${article.lead}`,
      metadata: { articleTitle: article.title, sectionTitle: "Introduction", chunkIndex: idx, url: article.url },
    });
  }

  for (const section of article.sections) {
    let buffer = "";

    for (const para of section.paragraphs) {
      if (buffer.length + para.length > MAX_CHARS && buffer.length > 0) {
        chunks.push({
          id: `chunk-${idx++}`,
          text: `[${section.title}]\n\n${buffer.trim()}`,
          metadata: { articleTitle: article.title, sectionTitle: section.title, chunkIndex: idx, url: article.url },
        });
        buffer = "";
      }
      buffer += para + "\n\n";
    }

    if (buffer.trim().length > 30) {
      chunks.push({
        id: `chunk-${idx++}`,
        text: `[${section.title}]\n\n${buffer.trim()}`,
        metadata: { articleTitle: article.title, sectionTitle: section.title, chunkIndex: idx, url: article.url },
      });
    }
  }

  return chunks;
}
