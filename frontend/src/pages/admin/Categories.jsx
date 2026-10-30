import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deactivateCategory,
} from "../../services/productService";
import ImageWithFallback from "../../components/ImageWithFallback";
import { useToast } from "../../context/ToastContext";
import { apiError } from "../../services/api";

const blankForm = {
  name: "",
  image_url: "",
};

export default function AdminCategories() {
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
      const res = await getCategories();
      setItems(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch (e) {
      toast.error(apiError(e, "Could not load categories."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      image_url: form.image_url.trim() || null,
    };

    try {
      if (editingId) {
        await updateCategory(editingId, payload);
        toast.success(`Category "${payload.name}" updated successfully.`);
      } else {
        await createCategory(payload);
        toast.success(`Category "${payload.name}" created successfully.`);
      }

      setForm(blankForm);
      setEditingId(null);
      await load();
    } catch (e) {
      toast.error(apiError(e, "Failed to save category."));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.category_id);
    setForm({
      name: category.name || "",
      image_url: category.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate category "${name}"?`)) return;
    try {
      await deactivateCategory(id);
      toast.info(`Category "${name}" deactivated.`);
      await load();
    } catch (e) {
      toast.error(apiError(e, "Could not deactivate category."));
    }
  };

  const filteredItems = items.filter((c) =>
    String(c.name || "").toLowerCase().includes(search.toLowerCase().trim())
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
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Manage Categories ({items.length})
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT: CATEGORIES LIST */}
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
              placeholder="Filter categories by name..."
              className="input pl-10"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Loading categories...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="card p-8 text-center text-sm text-slate-500">
              No categories found matching your filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((c) => (
                <div
                  key={c.category_id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-card hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      {c.image_url ? (
                        <ImageWithFallback
                          src={c.image_url}
                          alt={c.name}
                          productName={c.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Layers size={22} className="text-brand-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {c.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.is_active !== false
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {c.is_active !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        ID #{c.category_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(c)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      <Edit2 size={13} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    {c.is_active !== false && (
                      <button
                        onClick={() => handleDeactivate(c.category_id, c.name)}
                        className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                        title="Deactivate Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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
                {editingId ? "Edit Category" : "Add New Category"}
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

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Category Name *
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  placeholder="e.g. Organic Dairy & Eggs"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  className="input mt-1"
                  placeholder="https://images.unsplash.com/..."
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Provide a direct HTTPS photo URL to display as this category's banner.
                </p>
              </div>

              {form.image_url && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold text-slate-500 mb-2">
                    Image Preview:
                  </p>
                  <div className="h-28 w-full overflow-hidden rounded-xl bg-white border border-slate-200">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving || !form.name.trim()}
                className="btn-primary mt-2 w-full py-3"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Category"
                  : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
