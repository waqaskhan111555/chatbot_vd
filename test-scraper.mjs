// Quick scraper test — run with: node test-scraper.mjs
// Remove this file before final submission

import { scrapeWikipedia } from "./lib/scraper.js";

const URLS = [
  "https://en.wikipedia.org/wiki/Karachi",
  "https://en.wikipedia.org/wiki/Python_(programming_language)",
  "https://en.wikipedia.org/wiki/Artificial_intelligence",
];

for (const url of URLS) {
  console.log("\n" + "=".repeat(60));
  console.log("URL:", url);
  try {
    const article = await scrapeWikipedia(url);
    console.log("✓ Title:", article.title);
    console.log("✓ Lead length:", article.lead.length, "chars");
    console.log("✓ Sections:", article.sections.length);
    article.sections.slice(0, 3).forEach((s) => {
      console.log(`  - [${s.title}] ${s.paragraphs.length} paragraph(s), first 80 chars: "${s.paragraphs[0]?.slice(0, 80)}..."`);
    });
  } catch (err) {
    console.error("✗ Error:", err.message);
  }
}
