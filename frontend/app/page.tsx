"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Zap, Shield, Headphones } from "lucide-react";
import type { CmsContent } from "@/types";

const features = [
  {
    icon: Zap,
    title: "Latest tech lineup",
    desc: "Shop curated laptops, desktops, monitors, and accessories from trusted brands.",
  },
  {
    icon: Shield,
    title: "Warranty and support",
    desc: "Get reliable after-sales assistance, setup guidance, and smooth replacements.",
  },
  {
    icon: Headphones,
    title: "Deals that matter",
    desc: "Save more with seasonal offers, bundle discounts, and student-friendly pricing.",
  },
];

export default function HomePage() {
  const [homeContent, setHomeContent] = useState<CmsContent | null>(null);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/cms/content?key=home", { cache: "no-store" });
      const data = (await res.json()) as { content: CmsContent | null };
      setHomeContent(data.content);
    };
    void run();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            {homeContent?.title ?? "Power your work and play with the right tech"}
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            {homeContent?.body ?? "TechShop helps you choose, buy, and maintain high-performance devices for office, learning, and gaming."}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Shop products <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
          Why customers choose TechShop
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="card p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl mb-4">
                <f.icon size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to upgrade your setup?</h2>
          <p className="text-gray-400 mb-8">Tell us your budget and use case, and we will recommend the best-value configuration.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" className="btn-primary">
              Contact us
            </Link>
            <Link href="/services" className="btn-secondary text-gray-900">
              Explore services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
