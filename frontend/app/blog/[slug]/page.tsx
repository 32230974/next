"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

export default function BlogDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (!slug) return;
    const run = async () => {
      const res = await fetch(`/api/blog/slug/${slug}`, { cache: "no-store" });
      const data = (await res.json()) as { post?: BlogPost };
      setPost(data.post ?? null);
    };
    void run();
  }, [slug]);

  if (!post) {
    return <div className="max-w-5xl mx-auto px-4 py-12 text-gray-500">Loading article...</div>;
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <p className="text-sm text-gray-500 mb-2">{formatDate(post.createdAt)}</p>
      <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
      <p className="text-lg text-gray-600 mt-4">{post.excerpt}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={post.image} alt={post.title} className="w-full rounded-xl mt-6" />
      <div className="text-gray-700 leading-8 mt-6 whitespace-pre-wrap">{post.content}</div>
    </article>
  );
}
