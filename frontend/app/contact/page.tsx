"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [feedback, setFeedback] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = (await res.json()) as { message?: string };
    if (!res.ok) {
      setFeedback(data.message || "Failed to send message.");
      return;
    }

    setForm({ name: "", email: "", phone: "", message: "" });
    setFeedback("Message sent successfully.");
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact</h1>
      <form onSubmit={submit} className="card p-6 space-y-3">
        <input className="input-field" placeholder="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input className="input-field" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <input className="input-field" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <textarea className="input-field min-h-32" placeholder="Message" required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
        <button type="submit" className="btn-primary">Send message</button>
      </form>
      {feedback && <p className="text-sm text-gray-600 mt-3">{feedback}</p>}
    </section>
  );
}
