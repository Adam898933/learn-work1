import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifyFirebaseIdToken } from "@/lib/firebase-token";

// Saves and restores a signed-in Group Chat account's data (profile, friends, rooms, chat history).
// Callers prove who they are with their Firebase ID token; each account only ever touches its own row.

const MAX_BODY_BYTES = 40 * 1024 * 1024;
const keySchema = z.string().min(11).max(300).regex(/^groupchat_/);
const bodySchema = z.object({
  set: z.record(keySchema, z.string().max(20 * 1024 * 1024)).default({}),
  remove: z.array(keySchema).max(5000).default([]),
  replace: z.boolean().default(false),
});

async function callerUid(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token || token.length > 4096) return null;
  return verifyFirebaseIdToken(token);
}

const noStore = { "cache-control": "no-store" };

export const Route = createFileRoute("/api/public/account-data")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const uid = await callerUid(request);
        if (!uid) return Response.json({ error: "unauthorized" }, { status: 401, headers: noStore });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("account_data")
          .select("data, updated_at")
          .eq("firebase_uid", uid)
          .maybeSingle();
        if (error) {
          console.error("account-data load failed", error);
          return Response.json({ error: "load_failed" }, { status: 500, headers: noStore });
        }
        return Response.json(
          { data: data?.data ?? null, updatedAt: data?.updated_at ?? null },
          { headers: noStore },
        );
      },
      PUT: async ({ request }) => {
        const uid = await callerUid(request);
        if (!uid) return Response.json({ error: "unauthorized" }, { status: 401, headers: noStore });
        const length = Number(request.headers.get("content-length") || 0);
        if (length > MAX_BODY_BYTES) return Response.json({ error: "too_large" }, { status: 413, headers: noStore });
        const text = await request.text();
        if (text.length > MAX_BODY_BYTES) return Response.json({ error: "too_large" }, { status: 413, headers: noStore });
        let parsed;
        try {
          parsed = bodySchema.safeParse(JSON.parse(text));
        } catch {
          return Response.json({ error: "bad_request" }, { status: 400, headers: noStore });
        }
        if (!parsed.success) return Response.json({ error: "bad_request" }, { status: 400, headers: noStore });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.rpc("merge_account_data", {
          _uid: uid,
          _set: parsed.data.set,
          _remove: parsed.data.remove,
          _replace: parsed.data.replace,
        });
        if (error) {
          console.error("account-data save failed", error);
          return Response.json({ error: "save_failed" }, { status: 500, headers: noStore });
        }
        return Response.json({ updatedAt: data }, { headers: noStore });
      },
    },
  },
});
