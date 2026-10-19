import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RotateCw, ArrowUpRight, BookOpen, FlaskConical, Sigma } from "lucide-react";
import { Button } from "@/components/ui/button";
import learningDesk from "@/assets/learning-desk.jpg";
import { canAccessLearningHub } from "@/lib/learning-entry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Learning Hub — Learn & connect" },
      { name: "description", content: "Learning Hub — a space for curiosity, learning and connecting with friends." },
      { property: "og:title", content: "Learning Hub — Learn & connect" },
      { property: "og:description", content: "A space for curiosity, learning and connecting with friends." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [access, setAccess] = useState(false);
  useEffect(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    setAccess(canAccessLearningHub(navigation instanceof PerformanceNavigationTiming ? navigation.type : undefined));
  }, []);

  if (!access) {
    return (
      <main className="learning-cover">
        <header className="learning-header">
          <div className="learning-wordmark"><span className="learning-logo">LH</span>Learning Hub</div>
          <span className="learning-header-note">A place for curious minds</span>
        </header>
        <section className="learning-hero">
          <img src={learningDesk} alt="Notebook, geometry tools, books and a solar system model on a study desk" width={1536} height={1024} />
          <div className="learning-hero-copy">
            <p className="learning-eyebrow">EXPLORE · DISCOVER · GROW</p>
            <h1>Learning Hub</h1>
            <p>A new perspective starts<br />with a little curiosity.</p>
          </div>
        </section>
        <section className="learning-subjects" aria-label="Learning subjects">
          <article><Sigma /><div><p>01 / MATHEMATICS</p><h2>Find the patterns.</h2><span>Numbers, shapes & everyday problems</span></div><ArrowUpRight /></article>
          <article><FlaskConical /><div><p>02 / SCIENCE</p><h2>Ask the big questions.</h2><span>Our planet, the universe & everything between</span></div><ArrowUpRight /></article>
          <article><BookOpen /><div><p>03 / LANGUAGE</p><h2>Open another world.</h2><span>Stories, ideas & the words that connect us</span></div><ArrowUpRight /></article>
        </section>
        <div className="learning-entry-shade" />
        <section className="learning-entry-prompt" role="dialog" aria-modal="true" aria-labelledby="entry-title">
          <span className="entry-symbol"><RotateCw aria-hidden="true" /></span>
          <p className="learning-eyebrow">WELCOME TO LEARNING HUB</p>
          <h2 id="entry-title">Reload the page<br />to access the site.</h2>
          <Button className="learning-reload" size="lg" onClick={() => window.location.reload()}><RotateCw />Reload page</Button>
        </section>
      </main>
    );
  }
  return (
    <iframe
      className="group-chat-website"
      title="Learning Hub"
      src="/group-chat.html"
      allow="microphone; camera; clipboard-read; clipboard-write; fullscreen"
    />
  );
}
