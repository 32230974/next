"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Offer, Product } from "@/types";

type ProductsResponse = {
  products: Product[];
};

type OffersResponse = {
  offers: Offer[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    let active = true;

    const run = async (initial = false) => {
      try {
        if (initial) setLoading(true);
        const [productsRes, offersRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/offers", { cache: "no-store" }),
        ]);

        const productsData = (await productsRes.json()) as ProductsResponse & { message?: string };
        const offersData = (await offersRes.json()) as OffersResponse & { message?: string };

        if (!productsRes.ok) {
          throw new Error(productsData.message || "Failed to load products");
        }
        if (!offersRes.ok) {
          throw new Error(offersData.message || "Failed to load offers");
        }

        if (!active) return;

        setProducts(productsData.products ?? []);
        setOffers(offersData.offers ?? []);
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        if (initial && active) {
          setLoading(false);
        }
      }
    };

    void run(true);
    const interval = setInterval(() => {
      void run(false);
    }, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter((p) =>
      [p.name, p.description, p.category].some((v) => v.toLowerCase().includes(q))
    );
  }, [products, query]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Browse available items from your catalog.</p>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products"
          className="input-field max-w-sm"
        />
      </div>

      {!loading && !error && offers.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {offers.map((offer) => (
            <div key={offer.id} className="card p-4 border-blue-100 bg-blue-50/50">
              <p className="text-sm font-semibold text-blue-700">{offer.title}</p>
              <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                Code <span className="font-semibold">{offer.code}</span> · {offer.discount}% off · Expires {formatDate(offer.expiresAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="text-gray-500">Loading products...</p>}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card p-6 text-gray-500">No products found.</div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const hasDiscount = (product.discount ?? 0) > 0;
            const finalPrice = hasDiscount
              ? product.price - (product.price * (product.discount ?? 0)) / 100
              : product.price;

            return (
              <article key={product.id} className="card overflow-hidden">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h2>
                    <span className="badge bg-gray-100 text-gray-700">{product.category}</span>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>

                  <div className="flex items-end justify-between">
                    <div>
                      {hasDiscount && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
                      )}
                      <p className="text-lg font-bold text-gray-900">{formatPrice(finalPrice)}</p>
                    </div>
                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                  </div>

                  <button
                    className="btn-primary w-full"
                    disabled={product.stock <= 0}
                    onClick={() =>
                      addItem({
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        price: finalPrice,
                      })
                    }
                  >
                    {product.stock > 0 ? "Add to cart" : "Out of stock"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
