"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatDate, formatPrice, statusColor } from "@/lib/utils";
import type { Order } from "@/types";

type OrdersResponse = {
  orders: Order[];
  message?: string;
};

export default function OrdersPage() {
  const { status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = (await res.json()) as OrdersResponse;
        if (!res.ok) throw new Error(data.message || "Failed to load orders");
        setOrders(data.orders ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [status]);

  if (status !== "authenticated") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="card p-6 text-gray-600">Please log in to view your orders.</div>
      </div>
    );
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-10 text-gray-500">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">{error}</div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="card p-6 text-gray-600">You have no orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="card p-5">
              <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="text-sm font-mono text-gray-800">{order.id}</p>
                </div>
                <span className={`badge ${statusColor(order.status)}`}>{order.status}</span>
              </div>

              <p className="text-sm text-gray-500">Placed: {formatDate(order.createdAt)}</p>
              <p className="text-lg font-bold text-gray-900 mt-2">Total: {formatPrice(order.total)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
