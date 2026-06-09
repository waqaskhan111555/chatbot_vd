const SKIP_SECTIONS = new Set([
  "references", "see also", "external links",
  "notes", "further reading", "bibliography", "footnotes",
]);

export function extractTitle(url) {
  const match = url.match(/wikipedia\.org\/wiki\/(.+)$/i);
  if (!match) throw new Error("Not a valid Wikipedia URL");
  return decodeURIComponent(match[1].replace(/_/g, " "));
}

export async function scrapeWikipedia(url) {
  const title = extractTitle(url);
  const slug = encodeURIComponent(title.replace(/ /g, "_"));

  const [summaryRes, extractRes] = await Promise.all([
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`, {
      headers: { "User-Agent": "chatbot-vd/1.0" },
    }),
    fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${slug}&explaintext=true&exsectionformat=wiki&format=json`,
      { headers: { "User-Agent": "chatbot-vd/1.0" } }
    ),
  ]);

  if (!summaryRes.ok) throw new Error(`Article not found: "${title}"`);

  const sumData = await summaryRes.json();
  const lead = sumData.extract ?? "";

  const sections = [];

  if (extractRes.ok) {
    const extractData = await extractRes.json();
    const pages = extractData.query?.pages ?? {};
    const fullText = Object.values(pages)[0]?.extract ?? "";

    // Split on == Section == markers
    const parts = fullText.split(/^(={2,3}[^=]+={2,3})\s*$/m);

    for (let i = 1; i < parts.length - 1; i += 2) {
      const sTitle = parts[i].replace(/={2,3}/g, "").trim();
      if (SKIP_SECTIONS.has(sTitle.toLowerCase())) continue;

      const body = parts[i + 1] ?? "";
      const paragraphs = body
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter((p) => p.length > 30);

      if (paragraphs.length) sections.push({ title: sTitle, paragraphs });
    }
  }

  return { title, url, lead, sections };
}
