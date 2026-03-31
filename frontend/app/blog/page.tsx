"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/blog", { cache: "no-store" });
      const data = (await res.json()) as { posts: BlogPost[] };
      setPosts(data.posts ?? []);
    };
    void run();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="card p-5">
            <p className="text-xs text-gray-500 mb-2">{formatDate(post.createdAt)}</p>
            <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
            <p className="text-gray-600 mt-2">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="inline-block mt-3 text-blue-600 font-medium">
              Read more
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
