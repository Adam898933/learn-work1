import { createFileRoute } from "@tanstack/react-router";

// Public GIF search proxy: keeps the GIPHY key server-side. Read-only, no user data.
export const Route = createFileRoute("/api/public/gifs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = process.env["GIPHY_API_KEY"];
        if (!key) return Response.json({ error: "not_configured" }, { status: 503 });
        const q = (new URL(request.url).searchParams.get("q") || "").slice(0, 100).trim();
        const k = encodeURIComponent(key);
        const search = (term: string) =>
          `https://api.giphy.com/v1/gifs/search?api_key=${k}&q=${encodeURIComponent(term)}&limit=30&rating=pg-13`;
        let r = await fetch(q ? search(q) : `https://api.giphy.com/v1/gifs/trending?api_key=${k}&limit=30&rating=pg-13`);
        let body = await r.text();
        // Blank picker should never be empty: fall back to a popular search.
        const empty = () => { try { return !(JSON.parse(body).data || []).length; } catch { return true; } };
        if (!q && (!r.ok || empty())) {
          r = await fetch(search("funny"));
          body = await r.text();
        }
        return new Response(body, {
          status: r.ok ? 200 : 502,
          headers: { "content-type": "application/json", "cache-control": "public, max-age=300" },
        });
      },
    },
  },
});
