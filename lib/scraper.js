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

  const [sumRes, secRes] = await Promise.all([
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`, {
      headers: { "User-Agent": "chatbot-vd/1.0" },
    }),
    fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${slug}`, {
      headers: { "User-Agent": "chatbot-vd/1.0" },
    }),
  ]);

  if (!sumRes.ok) throw new Error(`Article not found: "${title}"`);

  const sumData = await sumRes.json();
  const lead = sumData.extract ?? "";
  const sections = [];

  if (secRes.ok) {
    const secData = await secRes.json();
    for (const s of (secData?.remaining?.sections ?? [])) {
      const sTitle = (s.line ?? "").replace(/<[^>]+>/g, "").trim();
      if (SKIP_SECTIONS.has(sTitle.toLowerCase())) continue;

      const paragraphs = (s.text ?? "")
        .replace(/<[^>]+>/g, "")
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter((p) => p.length > 30);

      if (paragraphs.length) sections.push({ title: sTitle, paragraphs });
    }
  }

  return { title, url, lead, sections };
}
