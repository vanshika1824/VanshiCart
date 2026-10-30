import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Layers } from "lucide-react";

import { getCategories } from "../services/productService";
import ImageWithFallback from "../components/ImageWithFallback";
import { apiError } from "../services/api";

const CATEGORY_META = {
  Fruits: {
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=700&q=80",
    badge: "Apples, Bananas & Seasonal",
    emoji: "🍎",
  },
  Vegetables: {
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80",
    badge: "Tomatoes, Potatoes, Greens",
    emoji: "🥦",
  },
  Dairy: {
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=700&q=80",
    badge: "Milk, Butter, Cheese & More",
    emoji: "🥛",
  },
  Snacks: {
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=700&q=80",
    badge: "Crisps, Biscuits & Savory",
    emoji: "🍪",
  },
  Beverages: {
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=700&q=80",
    badge: "Cold Juices, Water & Drinks",
    emoji: "🧃",
  },
};

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCategories();

        if (isMounted) {
          const data = Array.isArray(response.data)
            ? response.data
            : response.data?.items || [];

          setItems(data);
        }
      } catch (e) {
        console.error("CATEGORIES PAGE ERROR:", e);
        if (isMounted) {
          setError(apiError(e, "Could not load categories."));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="container-page py-10 sm:py-14">
      {/* HEADER */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold text-brand-700 border border-brand-200">
          <Sparkles size={13} />
          <span>Aisles & Departments</span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Explore by Category
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
          Find exactly what your pantry needs. From morning milk to fresh evening
          salads, everything organized for effortless grocery shopping.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="card p-6 text-center text-red-700 bg-red-50/60 max-w-lg mx-auto mb-8">
          <p className="font-bold">Error loading categories</p>
          <p className="mt-1 text-xs">{error}</p>
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-card"
            >
              <div className="aspect-[16/10] w-full rounded-2xl shimmer-placeholder" />
              <div className="mt-4 h-6 w-1/2 rounded bg-slate-100" />
              <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-14 text-center max-w-lg mx-auto shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-brand-600 text-3xl">
            <Layers size={32} />
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900">
            No categories available
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Categories are currently being updated in the system.
          </p>
        </div>
      )}

      {/* CATEGORY CARDS */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((cat) => {
            const meta = CATEGORY_META[cat.name] || {
              image:
                cat.image_url ||
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80",
              badge: "Everyday essentials",
              emoji: "🛒",
            };

            return (
              <Link
                key={cat.category_id}
                to={`/products?category_id=${cat.category_id}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-card-hover"
              >
                {/* IMAGE BOX */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50">
                  <ImageWithFallback
                    src={cat.image_url || meta.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />

                  {/* BADGE ON IMAGE */}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
                    <span>{meta.emoji}</span>
                    <span>{meta.badge}</span>
                  </span>
                </div>

                {/* CARD BODY */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 group-hover:text-brand-700 transition">
                      {cat.name}
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {cat.description ||
                        `Browse our curated collection of fresh ${cat.name.toLowerCase()} sourced for quality.`}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-brand-700 group-hover:text-brand-800">
                      Explore aisle
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
