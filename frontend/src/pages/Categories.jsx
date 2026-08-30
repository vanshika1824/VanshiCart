import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCategories } from "../services/productService";
import LoadingSpinner from "../components/LoadingSpinner";
import { apiError } from "../services/api";

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCategories();

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.items || [];

        setItems(data);
      } catch (e) {
        console.error("CATEGORIES PAGE ERROR:", e);
        setError(apiError(e, "Could not load categories."));
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="container-page py-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-10">
        <div className="card p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <p className="text-sm font-bold text-brand-600">
        EXPLORE
      </p>

      <h1 className="mt-1 text-3xl font-black">
        Categories
      </h1>

      <p className="mt-2 text-slate-500">
        Browse groceries by category.
      </p>

      {items.length === 0 ? (
        <div className="card mt-7 p-10 text-center">
          <div className="text-5xl">🛒</div>

          <h2 className="mt-4 text-xl font-black">
            No categories found
          </h2>

          <p className="mt-2 text-slate-500">
            Categories are currently unavailable.
          </p>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((category) => (
            <Link
              key={category.category_id}
              to={`/products?category_id=${category.category_id}`}
              className="card p-6 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:shadow-md"
            >
              <div className="text-3xl">
                🛒
              </div>

              <h2 className="mt-4 font-black">
                {category.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {category.description || "Browse products"}
              </p>

              <div className="mt-4 text-sm font-bold text-brand-600">
                Shop now →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}