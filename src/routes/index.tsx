import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Group Chat — Friends, rooms & messages" },
      { name: "description", content: "Connect with friends in Group Chat, join rooms, and share messages, photos, voice notes and games." },
      { property: "og:title", content: "Group Chat — Friends, rooms & messages" },
      { property: "og:description", content: "Your Group Chat website for friends, rooms, messages and shared moments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      className="group-chat-website"
      title="Group Chat"
      src="/group-chat.html"
      allow="microphone; camera; clipboard-read; clipboard-write; fullscreen"
    />
  );
}
