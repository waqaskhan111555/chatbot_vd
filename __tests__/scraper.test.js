import { extractTitle, scrapeWikipedia } from "@/lib/scraper";

global.fetch = jest.fn();

afterEach(() => jest.clearAllMocks());

test("extractTitle parses a normal Wikipedia URL", () => {
  expect(extractTitle("https://en.wikipedia.org/wiki/Karachi")).toBe("Karachi");
});

test("extractTitle decodes underscores to spaces", () => {
  expect(extractTitle("https://en.wikipedia.org/wiki/Python_(programming_language)")).toBe(
    "Python (programming language)"
  );
});

test("extractTitle throws on non-Wikipedia URL", () => {
  expect(() => extractTitle("https://google.com")).toThrow("Not a valid Wikipedia URL");
});

test("scrapeWikipedia returns article with lead and sections", async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ extract: "Karachi is a city in Pakistan." }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        query: {
          pages: {
            "1": {
              extract:
                "Karachi is a city.\n\n== History ==\n\nFounded in 1729 as a settlement.\n\n== See also ==\nNothing.",
            },
          },
        },
      }),
    });

  const article = await scrapeWikipedia("https://en.wikipedia.org/wiki/Karachi");
  expect(article.title).toBe("Karachi");
  expect(article.lead).toBe("Karachi is a city in Pakistan.");
  expect(article.sections).toHaveLength(1);
  expect(article.sections[0].title).toBe("History");
});

test("scrapeWikipedia throws when article not found", async () => {
  fetch.mockResolvedValueOnce({ ok: false });
  await expect(scrapeWikipedia("https://en.wikipedia.org/wiki/Nonexistent999")).rejects.toThrow(
    "Article not found"
  );
});
