"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PortfolioProject } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = (await res.json()) as { projects: PortfolioProject[] };
      setProjects(data.projects ?? []);
    };
    void run();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <article key={project.id} className="card overflow-hidden">
            <div className="aspect-video bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
              <p className="text-gray-600 mt-2">{project.summary}</p>
              <Link href={`/projects/${project.id}`} className="inline-block mt-4 text-blue-600 font-medium">
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
