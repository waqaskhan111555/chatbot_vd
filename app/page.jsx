"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [summary, setSummary] = useState("");
  const [articleText, setArticleText] = useState("");
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleIngest(e) {
    e.preventDefault();
    setStatus("Fetching article...");
    setSummary("");
    setMessages([]);
    setLoading(true);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus(`Ingested "${data.title}" (${data.chunkCount} chunks). Generating summary...`);
      setArticleText(url);

      // Stream summary
      const sumRes = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.title }),
      });
      const reader = sumRes.body.getReader();
      const decoder = new TextDecoder();
      let summaryText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        summaryText += decoder.decode(value);
        setSummary(summaryText);
      }
      setStatus("Ready. Ask a question below.");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleChat(e) {
    e.preventDefault();
    if (!question.trim()) return;

    const userMsg = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setMessages((prev) => [...prev, { role: "assistant", text: "..." }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", text: answer },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", text: `Error: ${err.message}` },
      ]);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>Wikipedia RAG Chat</h1>
      <p style={{ color: "#555", marginBottom: 20 }}>Paste a Wikipedia URL to summarise and chat with the article.</p>

      <form onSubmit={handleIngest} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="url"
          placeholder="https://en.wikipedia.org/wiki/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "8px 16px", background: "#0070f3", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </form>

      {status && <p style={{ color: "#444", marginBottom: 12 }}>{status}</p>}

      {summary && (
        <div style={{ background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 4, padding: 16, marginBottom: 24 }}>
          <strong>Summary</strong>
          <p style={{ marginTop: 8, lineHeight: 1.6 }}>{summary}</p>
        </div>
      )}

      {summary && (
        <>
          <div style={{ border: "1px solid #ddd", borderRadius: 4, padding: 12, minHeight: 200, marginBottom: 12, overflowY: "auto", maxHeight: 400 }}>
            {messages.length === 0 && <p style={{ color: "#999" }}>Ask a question about the article...</p>}
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 12, textAlign: m.role === "user" ? "right" : "left" }}>
                <span
                  style={{
                    display: "inline-block",
                    background: m.role === "user" ? "#0070f3" : "#eee",
                    color: m.role === "user" ? "#fff" : "#000",
                    padding: "6px 12px",
                    borderRadius: 4,
                    maxWidth: "80%",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleChat} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4 }}
            />
            <button
              type="submit"
              style={{ padding: "8px 16px", background: "#0070f3", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
            >
              Send
            </button>
          </form>
        </>
      )}
    </main>
  );
}
