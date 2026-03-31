import Link from "next/link";
import { Monitor } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-blue-600">
            <Monitor size={20} />
            TechShop
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/about" className="hover:text-blue-600">About</Link>
            <Link href="/services" className="hover:text-blue-600">Services</Link>
            <Link href="/projects" className="hover:text-blue-600">Projects</Link>
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <Link href="/news" className="hover:text-blue-600">News</Link>
            <Link href="/contact" className="hover:text-blue-600">Contact</Link>
          </nav>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} TechShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
