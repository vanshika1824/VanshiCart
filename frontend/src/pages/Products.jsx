import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { getProducts, getCategories } from "../services/productService";
import { addCartItem, createCart } from "../services/cartService";
import {
  addWishlistItem,
  createWishlist,
} from "../services/wishlistService";

import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { apiError } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Products() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read category_id from URL
  const categoryId = searchParams.get("category_id");

  // Load products and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const params = categoryId
          ? { category_id: Number(categoryId) }
          : undefined;

        const [productsResponse, categoriesResponse] =
          await Promise.all([
            getProducts(params),
            getCategories(),
          ]);

        const productsData = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data?.items || [];

        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : categoriesResponse.data?.items || [];

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (e) {
        console.error("PRODUCTS PAGE ERROR:", e);
        console.error("ERROR RESPONSE:", e.response?.data);
        setError(apiError(e));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  // Find selected category
  const selectedCategory = useMemo(() => {
    if (!categoryId) return null;

    return categories.find(
      (category) =>
        Number(category.category_id) === Number(categoryId)
    );
  }, [categories, categoryId]);

  // Search within products already filtered by backend
  const filtered = useMemo(() => {
    if (!q.trim()) {
      return products;
    }

    const searchText = q.toLowerCase().trim();

    return products.filter((product) =>
      String(product.name || "")
        .toLowerCase()
        .includes(searchText)
    );
  }, [products, q]);

  // Clear category filter
  const clearCategory = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("category_id");
    setSearchParams(newParams);
  };

  // Add product to cart
  const add = async (product) => {
    if (!user) {
      alert("Please login to add items to your cart.");
      return;
    }

    try {
      let cart;

      try {
        cart = await createCart();
      } catch {
        const { getCart } = await import("../services/cartService");
        cart = await getCart();
      }

      const cartId = cart?.data?.cart_id;

      if (!cartId) {
        throw new Error("Could not find your cart.");
      }

      await addCartItem({
        cart_id: cartId,
        product_id: product.product_id,
        quantity: 1,
      });

      alert("Added to cart.");
    } catch (e) {
      alert(apiError(e, "Could not add to cart."));
    }
  };

  // Add product to wishlist
  const wish = async (product) => {
    if (!user) {
      alert("Please login to use wishlist.");
      return;
    }

    try {
      let wishlist;

      try {
        wishlist = await createWishlist();
      } catch {
        const { getWishlist } = await import("../services/wishlistService");
        wishlist = await getWishlist();
      }

      const wishlistId = wishlist?.data?.wishlist_id;

      if (!wishlistId) {
        throw new Error("Could not find your wishlist.");
      }

      await addWishlistItem({
        wishlist_id: wishlistId,
        product_id: product.product_id,
      });

      alert("Added to wishlist.");
    } catch (e) {
      alert(apiError(e, "Could not add to wishlist."));
    }
  };

  return (
    <div className="container-page py-10">

      {/* PAGE HEADER */}
      <div className="mb-8">
        <p className="text-sm font-bold text-brand-600">
          SHOP
        </p>

        <h1 className="text-3xl font-black">
          {selectedCategory
            ? selectedCategory.name
            : "All products"}
        </h1>

        <p className="mt-2 text-slate-500">
          {selectedCategory
            ? `Browse products in ${selectedCategory.name}.`
            : "Browse the catalog from your VanshiCart backend."}
        </p>
      </div>

      {/* SEARCH + COUNT */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">

        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-3.5 text-slate-400"
            size={18}
          />

          <input
            className="input pl-10"
            placeholder="Search products..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          {filtered.length} products
        </div>

      </div>

      {/* CATEGORY FILTER */}
      {selectedCategory && (
        <div className="mb-6 flex items-center gap-2">

          <span className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
            {selectedCategory.name}
          </span>

          <button
            onClick={clearCategory}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            <X size={15} />
            Clear
          </button>

        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <LoadingSpinner />

      ) : error ? (
        <div className="card p-6 text-red-600">
          {error}
        </div>

      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">

          <div className="text-5xl">
            🛒
          </div>

          <h2 className="mt-4 text-xl font-black">
            No products found
          </h2>

          <p className="mt-2 text-slate-500">
            Try another search or category.
          </p>

          {selectedCategory && (
            <button
              onClick={clearCategory}
              className="btn-primary mt-5"
            >
              View all products
            </button>
          )}

        </div>

      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

          {filtered.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onAdd={add}
              onWish={wish}
            />
          ))}

        </div>
      )}

    </div>
  );
}