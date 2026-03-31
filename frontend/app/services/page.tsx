"use client";

import { useEffect, useState } from "react";
import type { CmsContent } from "@/types";

export default function ServicesPage() {
  const [content, setContent] = useState<CmsContent | null>(null);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/cms/content?key=services", { cache: "no-store" });
      const data = (await res.json()) as { content: CmsContent | null };
      setContent(data.content);
    };
    void run();
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{content?.title ?? "Services"}</h1>
      <p className="text-lg leading-8 text-gray-600 whitespace-pre-wrap mb-8">
        {content?.body ?? "We provide end-to-end support from product consultation to deployment and after-sales care."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Device Consultation", "Setup and Installation", "Maintenance and Warranty"].map((item) => (
          <div key={item} className="card p-5">
            <h2 className="text-xl font-semibold text-gray-900">{item}</h2>
            <p className="text-sm text-gray-600 mt-2">Practical service tailored for home users, students, and growing teams.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
