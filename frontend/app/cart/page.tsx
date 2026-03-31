"use client";

import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const { status } = useSession();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = useCartStore((s) => s.total());

  const placeOrder = async () => {
    if (status !== "authenticated") {
      setError("Please log in to place your order.");
      return;
    }

    setPlacing(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        }),
      });

      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Failed to place order");

      clearCart();
      setSuccess("Order placed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cart</h1>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">{error}</div>}

      {items.length === 0 ? (
        <div className="card p-6 text-gray-600">Your cart is empty.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">{item.name}</h2>
                <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
              </div>

              <div className="flex items-center gap-2">
                <button className="btn-secondary px-3 py-1" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button className="btn-secondary px-3 py-1" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>

              <div className="flex items-center gap-4">
                <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                <button className="btn-danger px-3 py-1" onClick={() => removeItem(item.id)}>Remove</button>
              </div>
            </article>
          ))}

          <div className="card p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <p className="text-xl font-bold text-gray-900">Total: {formatPrice(total)}</p>
            <button className="btn-primary" disabled={placing} onClick={placeOrder}>
              {placing ? "Placing order..." : "Place order"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
