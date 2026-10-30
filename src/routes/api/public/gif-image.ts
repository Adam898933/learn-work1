import { createFileRoute } from "@tanstack/react-router";

// Public GIF image relay: serves GIPHY images from our own site so networks that block
// GIPHY's image hosts (e.g. school Chromebooks) still show them. Only GIPHY media by ID —
// never an arbitrary URL — so this can't be used as an open proxy.
const FILES = new Set(["200w.gif", "200.gif", "giphy.gif", "giphy-downsized.gif", "100.gif"]);

export const Route = createFileRoute("/api/public/gif-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const id = params.get("id") || "";
        const file = params.get("f") || "200w.gif";
        if (!/^[A-Za-z0-9]{4,64}$/.test(id) || !FILES.has(file)) {
          return new Response("bad request", { status: 400 });
        }
        // Some GIFs have no small rendition. Try another rendition on our origin
        // rather than sending the browser back to a potentially blocked host.
        const files = [...new Set([file, "200w.gif", "giphy-downsized.gif", "giphy.gif"])];
        for (const candidate of files) {
        for (const host of ["media.giphy.com", "media1.giphy.com"]) {
          try {
            const r = await fetch(`https://${host}/media/${id}/${candidate}`, {
              signal: AbortSignal.timeout(8000),
            });
            const type = r.headers.get("content-type") || "";
            if (r.ok && r.body && type.startsWith("image/")) {
              return new Response(r.body, {
                status: 200,
                headers: { "content-type": type, "cache-control": "public, max-age=86400", "x-content-type-options": "nosniff" },
              });
            }
            await r.body?.cancel();
          } catch {
            // try the next host
          }
        }
        }
        return new Response("not found", { status: 404, headers: { "cache-control": "no-store" } });
      },
    },
  },
});
