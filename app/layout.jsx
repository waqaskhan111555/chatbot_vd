import "./globals.css";

export const metadata = {
  title: "Wikipedia RAG Chat",
  description: "Chat with any Wikipedia article using a local LLM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
