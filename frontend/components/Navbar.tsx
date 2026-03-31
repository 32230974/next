"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Monitor, User, LogOut, LayoutDashboard } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export function Navbar() {
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Monitor size={24} />
            TechShop
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-gray-600">
            <Link href="/about" className="hover:text-blue-600">About</Link>
            <Link href="/services" className="hover:text-blue-600">Services</Link>
            <Link href="/projects" className="hover:text-blue-600">Projects</Link>
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <Link href="/news" className="hover:text-blue-600">News</Link>
            <Link href="/contact" className="hover:text-blue-600">Contact</Link>
            {session && (
              <Link href="/orders" className="hover:text-blue-600">My Orders</Link>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin/cms" className="flex items-center gap-1 hover:text-blue-600">
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-blue-600">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {session ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600">
                  <User size={15} />
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary text-sm py-1.5 px-3">
                  Log in
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm py-1.5 px-3">
                  Sign up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
