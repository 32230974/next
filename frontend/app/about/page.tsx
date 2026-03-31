"use client";

import { useEffect, useState } from "react";
import type { CmsContent } from "@/types";

export default function AboutPage() {
  const [content, setContent] = useState<CmsContent | null>(null);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/cms/content?key=about", { cache: "no-store" });
      const data = (await res.json()) as { content: CmsContent | null };
      setContent(data.content);
    };
    void run();
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{content?.title ?? "About"}</h1>
      <p className="text-lg leading-8 text-gray-600 whitespace-pre-wrap">
        {content?.body ?? "About content will appear here once configured from dashboard."}
      </p>
    </section>
  );
}
