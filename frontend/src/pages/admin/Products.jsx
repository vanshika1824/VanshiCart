import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deactivateProduct,
} from "../../services/productService";
import ImageWithFallback from "../../components/ImageWithFallback";
import { useToast } from "../../context/ToastContext";
import { apiError } from "../../services/api";

const blankForm = {
  name: "",
  description: "",
  selling_price: "",
  original_price: "",
  quantity: "",
  unit: "",
  stock_quantity: "",
  brand_id: "",
  image_url: "",
};

export default function AdminProducts() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setItems(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch (e) {
      toast.error(apiError(e, "Could not load products."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || null,
      selling_price: Number(form.selling_price),
      original_price: form.original_price ? Number(form.original_price) : null,
      quantity: Number(form.quantity),
      unit: form.unit.trim(),
      stock_quantity: Number(form.stock_quantity),
      brand_id: form.brand_id ? Number(form.brand_id) : null,
      image_url: form.image_url?.trim() || null,
    };

    try {
      if (editingId) {
        await updateProduct(editingId, data);
        toast.success(`Updated "${data.name}"`);
      } else {
        await createProduct(data);
        toast.success(`Created "${data.name}"`);
      }

      setForm(blankForm);
      setEditingId(null);
      await load();
    } catch (e) {
      toast.error(apiError(e, "Could not save product."));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.product_id);
    setForm({
      name: p.name || "",
      description: p.description || "",
      selling_price: p.selling_price || "",
      original_price: p.original_price || "",
      quantity: p.quantity || "",
      unit: p.unit || "",
      stock_quantity: p.stock_quantity ?? "",
      brand_id: p.brand_id || "",
      image_url: p.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate product "${name}"?`)) return;
    try {
      await deactivateProduct(id);
      toast.info(`Product deactivated.`);
      await load();
    } catch (e) {
      toast.error(apiError(e, "Could not deactivate product."));
    }
  };

  const filteredItems = items.filter((p) =>
    String(p.name || "").toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="container-page py-8 sm:py-12">
      {/* BREADCRUMB & HEADER */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-brand-700 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Admin Dashboard</span>
        </Link>
        <h1 className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
          Manage Catalog Products ({items.length})
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT: PRODUCTS LIST */}
        <div className="space-y-4 lg:col-span-7">
          {/* SEARCH BOX */}
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter products by name..."
              className="input pl-10"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Loading catalog items...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="card p-8 text-center text-sm text-slate-500">
              No products found matching your filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((p) => (
                <div
                  key={p.product_id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-card hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                      <ImageWithFallback
                        src={p.image_url}
                        alt={p.name}
                        productName={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ₹{Number(p.selling_price).toFixed(2)} · Stock:{" "}
                        <span
                          className={
                            Number(p.stock_quantity) <= 0
                              ? "text-red-600 font-bold"
                              : "text-slate-700 font-semibold"
                          }
                        >
                          {p.stock_quantity}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(p)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      <Edit2 size={13} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeactivate(p.product_id, p.name)}
                      className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                      title="Deactivate Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: CREATE/EDIT FORM */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(blankForm);
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Product Name *
                </label>
                <input
                  className="input mt-1"
                  placeholder="e.g. Fresh Red Apples"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Description
                </label>
                <textarea
                  className="input mt-1"
                  rows={2}
                  placeholder="Crisp, fresh, farm-picked..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input mt-1"
                    placeholder="120.00"
                    value={form.selling_price}
                    onChange={(e) =>
                      setForm({ ...form, selling_price: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input mt-1"
                    placeholder="150.00"
                    value={form.original_price}
                    onChange={(e) =>
                      setForm({ ...form, original_price: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Qty *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="input mt-1"
                    placeholder="1"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Unit *
                  </label>
                  <input
                    className="input mt-1"
                    placeholder="kg / L / dozen"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Stock *
                  </label>
                  <input
                    type="number"
                    className="input mt-1"
                    placeholder="50"
                    value={form.stock_quantity}
                    onChange={(e) =>
                      setForm({ ...form, stock_quantity: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Brand ID
                  </label>
                  <input
                    type="number"
                    className="input mt-1"
                    placeholder="Optional (e.g. 1)"
                    value={form.brand_id}
                    onChange={(e) =>
                      setForm({ ...form, brand_id: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    className="input mt-1"
                    placeholder="https://images.unsplash..."
                    value={form.image_url}
                    onChange={(e) =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary mt-4 w-full py-3"
              >
                {saving
                  ? "Saving Product..."
                  : editingId
                    ? "Update Product Record"
                    : "Create New Product"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
