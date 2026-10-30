import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Edit2,
  Award,
  ExternalLink,
} from "lucide-react";

import {
  getBrands,
  createBrand,
  updateBrand,
} from "../../services/productService";
import { useToast } from "../../context/ToastContext";
import { apiError } from "../../services/api";

const blankForm = {
  name: "",
  logo_url: "",
  description: "",
};

export default function AdminBrands() {
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
      const res = await getBrands();
      setItems(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch (e) {
      toast.error(apiError(e, "Could not load brands."));
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
      logo_url: form.logo_url.trim() || null,
      description: form.description.trim() || null,
    };

    try {
      if (editingId) {
        await updateBrand(editingId, payload);
        toast.success(`Brand "${payload.name}" updated successfully.`);
      } else {
        await createBrand(payload);
        toast.success(`Brand "${payload.name}" created successfully.`);
      }

      setForm(blankForm);
      setEditingId(null);
      await load();
    } catch (e) {
      toast.error(apiError(e, "Failed to save brand."));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingId(brand.brand_id);
    setForm({
      name: brand.name || "",
      logo_url: brand.logo_url || "",
      description: brand.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredItems = items.filter((b) =>
    String(b.name || "").toLowerCase().includes(search.toLowerCase().trim())
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
            Manage Brands ({items.length})
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT: BRANDS LIST */}
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
              placeholder="Filter brands by name..."
              className="input pl-10"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Loading brands...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="card p-8 text-center text-sm text-slate-500">
              No brands found matching your filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((b) => (
                <div
                  key={b.brand_id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-card hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      {b.logo_url ? (
                        <img
                          src={b.logo_url}
                          alt={b.name}
                          className="h-full w-full object-contain p-1"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Award size={22} className="text-brand-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {b.name}
                      </h3>
                      {b.description ? (
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                          {b.description}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-0.5">
                          ID #{b.brand_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(b)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      <Edit2 size={13} />
                      <span className="hidden sm:inline">Edit</span>
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
                {editingId ? "Edit Brand" : "Add New Brand"}
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
                  Brand Name *
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  placeholder="e.g. Organic Tattva, Amul"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  className="input mt-1"
                  placeholder="https://..."
                  value={form.logo_url}
                  onChange={(e) =>
                    setForm({ ...form, logo_url: e.target.value })
                  }
                />
              </div>

              {form.logo_url && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold text-slate-500 mb-2">
                    Logo Preview:
                  </p>
                  <div className="h-16 w-32 overflow-hidden rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center">
                    <img
                      src={form.logo_url}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Description (Optional)
                </label>
                <textarea
                  className="input mt-1"
                  rows={3}
                  placeholder="Brief summary of the brand..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={saving || !form.name.trim()}
                className="btn-primary mt-2 w-full py-3"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Brand"
                  : "Create Brand"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
