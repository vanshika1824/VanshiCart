import { useEffect, useMemo, useState } from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { getProducts, getCategories } from "../services/productService";
import { getCart, addCartItem, createCart } from "../services/cartService";
import { getWishlist, addWishlistItem, createWishlist } from "../services/wishlistService";

import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiError } from "../services/api";

export default function Products() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search, category, sort and stock states
  const categoryIdParam = searchParams.get("category_id");
  const searchParam = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortBy, setSortBy] = useState("default"); // default | price-asc | price-desc | name-asc
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Sync search state with URL search param
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  // Load products and categories from backend
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const params = categoryIdParam
          ? { category_id: Number(categoryIdParam) }
          : undefined;

        const [productsResponse, categoriesResponse] = await Promise.all([
          getProducts(params),
          getCategories(),
        ]);

        if (isMounted) {
          const productsData = Array.isArray(productsResponse.data)
            ? productsResponse.data
            : productsResponse.data?.items || [];

          const categoriesData = Array.isArray(categoriesResponse.data)
            ? categoriesResponse.data
            : categoriesResponse.data?.items || [];

          setProducts(productsData);
          setCategories(categoriesData);
        }
      } catch (e) {
        console.error("PRODUCTS PAGE ERROR:", e);
        if (isMounted) {
          setError(apiError(e, "Could not load products. Please check the backend."));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [categoryIdParam]);

  // Find currently selected category
  const selectedCategory = useMemo(() => {
    if (!categoryIdParam) return null;
    return categories.find(
      (cat) => Number(cat.category_id) === Number(categoryIdParam)
    );
  }, [categories, categoryIdParam]);

  // Handle category selection
  const selectCategory = (catId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!catId) {
      nextParams.delete("category_id");
    } else {
      nextParams.set("category_id", String(catId));
    }
    setSearchParams(nextParams);
  };

  // Search input handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      nextParams.set("search", searchQuery.trim());
    } else {
      nextParams.delete("search");
    }
    setSearchParams(nextParams);
  };

  const clearSearch = () => {
    setSearchQuery("");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    setSearchParams(nextParams);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          String(p.name || "").toLowerCase().includes(q) ||
          String(p.description || "").toLowerCase().includes(q)
      );
    }

    // In-stock filter
    if (onlyInStock) {
      list = list.filter((p) => Number(p.stock_quantity ?? 0) > 0);
    }

    // Sorting
    if (sortBy === "price-asc") {
      list.sort(
        (a, b) => Number(a.selling_price || 0) - Number(b.selling_price || 0)
      );
    } else if (sortBy === "price-desc") {
      list.sort(
        (a, b) => Number(b.selling_price || 0) - Number(a.selling_price || 0)
      );
    } else if (sortBy === "name-asc") {
      list.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      );
    }

    return list;
  }, [products, searchQuery, onlyInStock, sortBy]);

  // Add product to cart
  const handleAddToCart = async (product) => {
    if (!user) {
      toast.info("Please login to add items to your cart.");
      return;
    }

    try {
      let cart;
      try {
        cart = await createCart();
      } catch {
        cart = await getCart();
      }

      const cartId = cart?.data?.cart_id;
      if (!cartId) throw new Error("Could not find your cart.");

      await addCartItem({
        cart_id: cartId,
        product_id: product.product_id,
        quantity: 1,
      });

      window.dispatchEvent(new Event("cart-updated"));
      toast.success(`Added ${product.name} to cart.`);
    } catch (e) {
      toast.error(apiError(e, "Could not add to cart."));
    }
  };

  // Add product to wishlist
  const handleWishlist = async (product) => {
    if (!user) {
      toast.info("Please login to use wishlist.");
      return;
    }

    try {
      let wishlist;
      try {
        wishlist = await createWishlist();
      } catch {
        wishlist = await getWishlist();
      }

      const wishlistId = wishlist?.data?.wishlist_id;
      if (!wishlistId) throw new Error("Could not find your wishlist.");

      await addWishlistItem({
        wishlist_id: wishlistId,
        product_id: product.product_id,
      });

      window.dispatchEvent(new Event("wishlist-updated"));
      toast.success(`Saved ${product.name} to wishlist.`);
    } catch (e) {
      toast.error(apiError(e, "Could not update wishlist."));
    }
  };

  return (
    <div className="container-page py-8 sm:py-12">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
          <Sparkles size={13} />
          <span>Fresh Pantry</span>
        </div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {selectedCategory ? selectedCategory.name : "All Grocery Products"}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl">
          {selectedCategory
            ? selectedCategory.description ||
              `Explore fresh, handpicked items in ${selectedCategory.name}.`
            : "Browse farm-fresh produce, dairy, bakery, snacks, and wholesome kitchen staples."}
        </p>
      </div>

      {/* CATEGORY FILTER CHIPS */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => selectCategory(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
            !categoryIdParam
              ? "bg-forest-900 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          All Items ({products.length})
        </button>

        {categories.map((cat) => {
          const isSelected =
            String(cat.category_id) === String(categoryIdParam);
          return (
            <button
              key={cat.category_id}
              onClick={() => selectCategory(cat.category_id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                isSelected
                  ? "bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* CONTROLS BAR: SEARCH + FILTERS + SORT */}
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        {/* SINGLE SEARCH INPUT */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within this catalog..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-9 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </form>

        {/* CONTROLS: SORT + IN-STOCK */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* SORT DROPDOWN */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700">
            <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="default">Sort: Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          {/* IN STOCK TOGGLE */}
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>In stock only</span>
          </label>

          {/* ACTIVE COUNT */}
          <div className="text-xs font-semibold text-slate-500 px-1">
            {filteredProducts.length} items
          </div>
        </div>
      </div>

      {/* ACTIVE FILTER PILLS */}
      {(selectedCategory || searchQuery || onlyInStock || sortBy !== "default") && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400">Active filters:</span>

          {selectedCategory && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-800 border border-brand-200">
              Category: {selectedCategory.name}
              <button
                onClick={() => selectCategory(null)}
                className="hover:text-brand-950"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 border border-slate-200">
              Query: "{searchQuery}"
              <button onClick={clearSearch} className="hover:text-slate-900">
                <X size={12} />
              </button>
            </span>
          )}

          {onlyInStock && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 border border-slate-200">
              In stock only
              <button
                onClick={() => setOnlyInStock(false)}
                className="hover:text-slate-900"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            onClick={() => {
              selectCategory(null);
              clearSearch();
              setOnlyInStock(false);
              setSortBy("default");
            }}
            className="text-xs font-bold text-red-600 hover:underline ml-1"
          >
            Reset all
          </button>
        </div>
      )}

      {/* CONTENT REGION */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card"
            >
              <div className="aspect-square w-full rounded-xl shimmer-placeholder" />
              <div className="mt-4 h-4 w-1/3 rounded bg-slate-100" />
              <div className="mt-2 h-5 w-3/4 rounded bg-slate-100" />
              <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="h-5 w-16 rounded bg-slate-100" />
                <div className="h-8 w-16 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-red-700 bg-red-50/50">
          <p className="font-bold text-lg">Unable to load catalog</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-4"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-brand-600 text-3xl">
            🥬
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900">
            No matching products found
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            We couldn't find anything matching your filters or search term. Try
            adjusting your criteria.
          </p>
          <button
            onClick={() => {
              selectCategory(null);
              clearSearch();
              setOnlyInStock(false);
              setSortBy("default");
            }}
            className="btn-primary mt-6"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onAdd={handleAddToCart}
              onWish={handleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
