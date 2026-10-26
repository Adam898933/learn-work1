import { createFileRoute } from "@tanstack/react-router";

// Public GIF search proxy: keeps the GIPHY key server-side. Read-only, no user data.
export const Route = createFileRoute("/api/public/gifs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = process.env["GIPHY_API_KEY"];
        if (!key) return Response.json({ error: "not_configured" }, { status: 503 });
        const q = (new URL(request.url).searchParams.get("q") || "").slice(0, 100).trim();
        const url = q
          ? `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&limit=24&rating=pg-13`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${encodeURIComponent(key)}&limit=24&rating=pg-13`;
        const r = await fetch(url);
        const body = await r.text();
        return new Response(body, {
          status: r.ok ? 200 : 502,
          headers: { "content-type": "application/json", "cache-control": "public, max-age=300" },
        });
      },
    },
  },
});
