import { ArrowRight, ShieldCheck, Truck, Sparkles, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsResult, categoriesResult] = await Promise.allSettled([
          getProducts(),
          getCategories(),
        ]);

        if (productsResult.status === "fulfilled") {
          console.log("PRODUCTS API RESPONSE:", productsResult.value.data);
          const productsData = Array.isArray(productsResult.value.data)
            ? productsResult.value.data
            : productsResult.value.data?.items || [];
          setProducts(productsData);
        } else {
          console.error("PRODUCTS ERROR:", productsResult.reason);
          setError(
            productsResult.reason?.response?.data?.detail ||
              "Unable to load products. Please check the backend."
          );
        }

        if (categoriesResult.status === "fulfilled") {
          console.log("CATEGORIES API RESPONSE:", categoriesResult.value.data);
          const categoriesData = Array.isArray(categoriesResult.value.data)
            ? categoriesResult.value.data
            : categoriesResult.value.data?.items || [];
          setCategories(categoriesData);
        } else {
          console.error("CATEGORIES ERROR:", categoriesResult.reason);
          // Categories failing should not block the page
        }
      } catch (err) {
        console.error("HOME DATA ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    const query = search.trim();

    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-b from-brand-50 to-slate-50">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:items-center lg:py-24">

          {/* LEFT */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm">
              <Sparkles size={14} />
              Smart grocery shopping
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
              Everything you need.
              <br />
              <span className="text-brand-600">
                One simple cart.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Fresh groceries, everyday essentials and everything your kitchen
              needs — all in one simple shopping experience.
            </p>

            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              className="mt-7 flex max-w-2xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
            >
              <Search
                size={21}
                className="ml-3 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groceries..."
                className="flex-1 bg-transparent px-2 py-3 outline-none"
              />

              <button
                type="submit"
                className="btn-primary"
              >
                Search
              </button>
            </form>

            {/* BUTTONS */}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="btn-primary"
                to="/products"
              >
                Shop now
                <ArrowRight
                  className="ml-2"
                  size={18}
                />
              </Link>

              <Link
                className="btn-secondary"
                to="/categories"
              >
                Explore categories
              </Link>
            </div>
          </div>

          {/* HERO CATEGORY GRID */}
          <div className="grid grid-cols-2 gap-4">
            {(categories.length > 0 ? categories.slice(0, 4) : [
              { category_id: "fallback-1", name: "Vegetables" },
              { category_id: "fallback-2", name: "Fruits" },
              { category_id: "fallback-3", name: "Dairy" },
              { category_id: "fallback-4", name: "Snacks" },
            ]).map((category) => {
              const emojiMap = {
                Fruits: "🍎",
                Vegetables: "🥦",
                Dairy: "🥛",
                Snacks: "🍪",
                Beverages: "🧃",
              };

              const emoji = emojiMap[category.name] || "🛒";

              return (
                <Link
                  key={category.category_id}
                  to={
                    typeof category.category_id === "number"
                      ? `/products?category_id=${category.category_id}`
                      : "/categories"
                  }
                  className="group grid aspect-square place-items-center rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="text-center">
                    <div className="text-6xl transition-transform group-hover:scale-110">
                      {emoji}
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-600 group-hover:text-brand-700">
                      {category.name}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-brand-600 opacity-0 transition group-hover:opacity-100">
                      Shop now →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-3">

          <div className="card flex items-center gap-4 p-5">
            <Truck className="text-brand-600" />

            <div>
              <b>Easy ordering</b>
              <p className="text-sm text-slate-500">
                Fast cart-to-checkout flow.
              </p>
            </div>
          </div>

          <div className="card flex items-center gap-4 p-5">
            <ShieldCheck className="text-brand-600" />

            <div>
              <b>Secure accounts</b>
              <p className="text-sm text-slate-500">
                JWT protected API access.
              </p>
            </div>
          </div>

          <div className="card flex items-center gap-4 p-5">
            <Sparkles className="text-brand-600" />

            <div>
              <b>Smart experience</b>
              <p className="text-sm text-slate-500">
                Designed around everyday shopping.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* PRODUCTS */}
      <section className="container-page pb-16">

        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-brand-600">
              DISCOVER
            </p>

            <h2 className="text-2xl font-black">
              Popular products
            </h2>
          </div>

          <Link
            to="/products"
            className="text-sm font-bold text-brand-700"
          >
            View all →
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Could not load products:</strong> {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="py-10 text-center text-slate-500">
            Loading products...
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <p className="font-bold text-slate-700">
              No products found.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              The backend returned an empty product list.
            </p>
          </div>
        )}

        {/* PRODUCT GRID */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
              />
            ))}
          </div>
        )}

      </section>

      {/* CATEGORIES */}
      {!loading && categories.length > 0 && (
        <section className="container-page pb-16">

          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-brand-600">
                EXPLORE
              </p>

              <h2 className="text-2xl font-black">
                Shop by category
              </h2>
            </div>

            <Link
              to="/categories"
              className="text-sm font-bold text-brand-700"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.category_id}
                to={`/products?category_id=${category.category_id}`}
                className="card p-5 font-bold transition hover:border-brand-300 hover:bg-brand-50"
              >
                {category.name}
              </Link>
            ))}
          </div>

        </section>
      )}

    </div>
  );
}