"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { PortfolioProject } from "@/types";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      const res = await fetch(`/api/projects/${id}`, { cache: "no-store" });
      const data = (await res.json()) as { project?: PortfolioProject };
      setProject(data.project ?? null);
    };
    void run();
  }, [id]);

  const submitInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const res = await fetch(`/api/projects/${id}/interest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = (await res.json()) as { message?: string };
    if (!res.ok) {
      setMessage(data.message || "Failed to submit interest");
      return;
    }

    setForm({ name: "", email: "", phone: "", message: "" });
    setMessage("Your interest has been submitted.");
  };

  if (!project) {
    return <div className="max-w-5xl mx-auto px-4 py-12 text-gray-500">Loading project...</div>;
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="card overflow-hidden">
        <div className="aspect-video bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-600 mt-3">{project.summary}</p>
          <p className="text-gray-700 mt-4 whitespace-pre-wrap">{project.details}</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Interested in this project?</h2>
        <form onSubmit={submitInterest} className="space-y-3">
          <input className="input-field" placeholder="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className="input-field" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <input className="input-field" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <textarea className="input-field min-h-28" placeholder="Your message" required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          <button className="btn-primary" type="submit">Submit interest</button>
        </form>
        {message && <p className="text-sm text-gray-600 mt-3">{message}</p>}
      </div>
    </section>
  );
}
