"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Offer, Product } from "@/types";

type AdminStats = {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: string;
  discount: string;
};

type OfferForm = {
  title: string;
  description: string;
  discount: string;
  code: string;
  expiresAt: string;
};

const emptyProductForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  category: "",
  stock: "",
  discount: "0",
};

const emptyOfferForm: OfferForm = {
  title: "",
  description: "",
  discount: "",
  code: "",
  expiresAt: "",
};

function toProductForm(product: Product): ProductForm {
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    image: product.image,
    category: product.category,
    stock: String(product.stock),
    discount: String(product.discount ?? 0),
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [offerForm, setOfferForm] = useState<OfferForm>(emptyOfferForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const refreshAll = async () => {
    const [statsRes, productsRes, offersRes] = await Promise.all([
      fetch("/api/admin/stats", { cache: "no-store" }),
      fetch("/api/products", { cache: "no-store" }),
      fetch("/api/offers", { cache: "no-store" }),
    ]);

    const statsData = (await statsRes.json()) as AdminStats & { message?: string };
    const productsData = (await productsRes.json()) as { products?: Product[]; message?: string };
    const offersData = (await offersRes.json()) as { offers?: Offer[]; message?: string };

    if (!statsRes.ok) throw new Error(statsData.message || "Failed to load admin stats");
    if (!productsRes.ok) throw new Error(productsData.message || "Failed to load products");
    if (!offersRes.ok) throw new Error(offersData.message || "Failed to load offers");

    setStats(statsData);
    setProducts(productsData.products ?? []);
    setOffers(offersData.offers ?? []);
  };

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      setLoading(false);
      setError("You are not authorized to view the admin dashboard.");
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        await refreshAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [session, status]);

  const submitProduct = async () => {
    setError("");
    setSuccess("");
    try {
      const isEditing = !!editingProductId;
      const res = await fetch(isEditing ? `/api/products/${editingProductId}` : "/api/products", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });

      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Failed to save product");

      setSuccess(isEditing ? "Product updated." : "Product created.");
      setProductForm(emptyProductForm);
      setEditingProductId(null);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    }
  };

  const deleteProduct = async (id: string) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Failed to delete product");
      setSuccess("Product deleted.");
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const submitOffer = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerForm),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Failed to create offer");
      setOfferForm(emptyOfferForm);
      setSuccess("Offer created.");
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create offer");
    }
  };

  const toggleOffer = async (offer: Offer) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: offer.title,
          description: offer.description,
          discount: offer.discount,
          code: offer.code,
          expiresAt: offer.expiresAt,
          active: !offer.active,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Failed to update offer");
      setSuccess("Offer updated.");
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update offer");
    }
  };

  const deleteOffer = async (id: string) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/offers/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Failed to delete offer");
      setSuccess("Offer deleted.");
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete offer");
    }
  };

  if (status === "loading" || loading) {
    return <div className="max-w-7xl mx-auto px-4 py-10 text-gray-500">Loading dashboard...</div>;
  }

  if (status !== "authenticated") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="card p-6 text-gray-600">Please log in to access the admin dashboard.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="card p-6 text-gray-600">No data available.</div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(stats.totalRevenue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div className="card p-5 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingProductId ? "Edit Product" : "Add Product"}
          </h2>

          <input
            className="input-field"
            placeholder="Name"
            value={productForm.name}
            onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
          />
          <textarea
            className="input-field min-h-24"
            placeholder="Description"
            value={productForm.description}
            onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
          />
          <input
            className="input-field"
            placeholder="Image URL"
            value={productForm.image}
            onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className="input-field"
              placeholder="Category"
              value={productForm.category}
              onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
            />
            <input
              className="input-field"
              type="number"
              placeholder="Price"
              value={productForm.price}
              onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
            />
            <input
              className="input-field"
              type="number"
              placeholder="Stock"
              value={productForm.stock}
              onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))}
            />
            <input
              className="input-field"
              type="number"
              placeholder="Discount %"
              value={productForm.discount}
              onChange={(e) => setProductForm((p) => ({ ...p, discount: e.target.value }))}
            />
          </div>

          <div className="flex gap-3">
            <button className="btn-primary" onClick={submitProduct}>
              {editingProductId ? "Save Changes" : "Create Product"}
            </button>
            {editingProductId && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setEditingProductId(null);
                  setProductForm(emptyProductForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Create Offer</h2>

          <input
            className="input-field"
            placeholder="Title"
            value={offerForm.title}
            onChange={(e) => setOfferForm((o) => ({ ...o, title: e.target.value }))}
          />
          <textarea
            className="input-field min-h-24"
            placeholder="Description"
            value={offerForm.description}
            onChange={(e) => setOfferForm((o) => ({ ...o, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input-field"
              type="number"
              placeholder="Discount %"
              value={offerForm.discount}
              onChange={(e) => setOfferForm((o) => ({ ...o, discount: e.target.value }))}
            />
            <input
              className="input-field"
              placeholder="Promo code"
              value={offerForm.code}
              onChange={(e) => setOfferForm((o) => ({ ...o, code: e.target.value.toUpperCase() }))}
            />
          </div>
          <input
            className="input-field"
            type="date"
            value={offerForm.expiresAt}
            onChange={(e) => setOfferForm((o) => ({ ...o, expiresAt: e.target.value }))}
          />

          <button className="btn-primary" onClick={submitOffer}>Create Offer</button>
        </div>
      </div>

      <div className="card p-5 mt-6 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Products</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Category</th>
              <th className="py-2">Price</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b last:border-0">
                <td className="py-2 pr-3">{product.name}</td>
                <td className="py-2 pr-3">{product.category}</td>
                <td className="py-2 pr-3">{formatPrice(product.price)}</td>
                <td className="py-2 pr-3">{product.stock}</td>
                <td className="py-2 flex gap-2">
                  <button
                    className="btn-secondary px-3 py-1"
                    onClick={() => {
                      setEditingProductId(product.id);
                      setProductForm(toProductForm(product));
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn-danger px-3 py-1" onClick={() => deleteProduct(product.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5 mt-6 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Offers</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Code</th>
              <th className="py-2">Discount</th>
              <th className="py-2">Expires</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id} className="border-b last:border-0">
                <td className="py-2 pr-3">{offer.code}</td>
                <td className="py-2 pr-3">{offer.discount}%</td>
                <td className="py-2 pr-3">{formatDate(offer.expiresAt)}</td>
                <td className="py-2 pr-3">{offer.active ? "Active" : "Inactive"}</td>
                <td className="py-2 flex gap-2">
                  <button className="btn-secondary px-3 py-1" onClick={() => toggleOffer(offer)}>
                    {offer.active ? "Disable" : "Enable"}
                  </button>
                  <button className="btn-danger px-3 py-1" onClick={() => deleteOffer(offer.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
