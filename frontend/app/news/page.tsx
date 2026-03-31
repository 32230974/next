"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import type { NewsPost } from "@/types";

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/news", { cache: "no-store" });
      const data = (await res.json()) as { posts: NewsPost[] };
      setPosts(data.posts ?? []);
    };
    void run();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">News</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="card p-5">
            <p className="text-xs text-gray-500 mb-2">{formatDate(post.createdAt)}</p>
            <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
            <p className="text-gray-600 mt-2">{post.excerpt}</p>
            <Link href={`/news/${post.slug}`} className="inline-block mt-3 text-blue-600 font-medium">
              Read details
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
