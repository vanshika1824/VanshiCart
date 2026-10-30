import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowRight, ArrowLeft, Package } from "lucide-react";

import {
  getWishlist,
  removeWishlistItem,
} from "../services/wishlistService";
import { getProducts } from "../services/productService";
import { getCart, addCartItem, createCart } from "../services/cartService";

import ImageWithFallback from "../components/ImageWithFallback";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { apiError } from "../services/api";

export default function Wishlist() {
  const toast = useToast();
  const [wishlist, setWishlist] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [wishlistResponse, productsResponse] = await Promise.all([
        getWishlist(),
        getProducts(),
      ]);

      const wishlistData = wishlistResponse?.data || {};
      const productsData = Array.isArray(productsResponse?.data)
        ? productsResponse.data
        : productsResponse?.data?.items || [];

      setWishlist(wishlistData);
      setProducts(productsData);
    } catch (e) {
      console.error("WISHLIST PAGE ERROR:", e);
      setError(apiError(e, "Could not load your wishlist."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const items = wishlist?.items || wishlist?.wishlist_items || [];

  const getProduct = (item) => {
    return products.find(
      (product) => String(product.product_id) === String(item.product_id)
    );
  };

  const remove = async (item) => {
    try {
      setBusyId(item.wishlist_item_id);
      await removeWishlistItem(item.wishlist_item_id);
      window.dispatchEvent(new Event("wishlist-updated"));
      toast.info("Item removed from wishlist.");
      await load();
    } catch (e) {
      toast.error(apiError(e, "Could not remove item."));
    } finally {
      setBusyId(null);
    }
  };

  const moveToCart = async (item) => {
    try {
      setBusyId(item.wishlist_item_id);
      let cart;
      try {
        cart = await createCart();
      } catch {
        cart = await getCart();
      }

      const cartId = cart?.data?.cart_id;
      if (!cartId) throw new Error("Could not find cart.");

      await addCartItem({
        cart_id: cartId,
        product_id: item.product_id,
        quantity: 1,
      });

      // Remove from wishlist after successful add
      await removeWishlistItem(item.wishlist_item_id);
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("wishlist-updated"));
      toast.success("Item moved to your shopping cart!");
      await load();
    } catch (e) {
      toast.error(apiError(e, "Could not move item to cart."));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-16">
        <div className="card max-w-md mx-auto p-8 text-center bg-red-50/40 border-red-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <Heart size={28} />
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900">
            Could not load your wishlist
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">{error}</p>
          <button onClick={load} className="btn-primary mt-6">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-page py-16 sm:py-24">
        <div className="card max-w-lg mx-auto p-8 sm:p-12 text-center shadow-card-hover">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
            <Heart size={38} strokeWidth={1.75} />
          </div>
          <h2 className="mt-6 text-2xl font-black text-slate-900">
            Your Wishlist is Empty
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Keep track of fresh fruits, seasonal veggies, and favorite snacks you
            love by tapping the heart icon.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/products" className="btn-primary">
              <span>Explore Products</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Heart size={13} className="fill-amber-700" />
            <span>Saved For Later</span>
          </div>
          <h1 className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
            My Wishlist ({items.length} items)
          </h1>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* ITEMS GRID */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => {
          const product = getProduct(item);
          const name =
            product?.name || item.product_name || `Product #${item.product_id}`;
          const price = Number(
            product?.selling_price || item.price || 0
          );
          const originalPrice = Number(product?.original_price || price);
          const image = product?.image_url || "";
          const isBusy = busyId === item.wishlist_item_id;
          const isOutOfStock = Number(product?.stock_quantity ?? 1) <= 0;

          return (
            <div
              key={item.wishlist_item_id || index}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card hover:border-slate-300 hover:shadow-card-hover transition-all"
            >
              {/* IMAGE */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
                <Link to={`/products/${item.product_id}`}>
                  <ImageWithFallback
                    src={image}
                    alt={name}
                    productName={name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => remove(item)}
                  aria-label="Remove item"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-400 hover:bg-white hover:text-red-600 shadow-subtle transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* BODY */}
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-brand-700 transition">
                    <Link to={`/products/${item.product_id}`}>{name}</Link>
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-base font-black text-slate-900">
                      ₹{price.toFixed(2)}
                    </span>
                    {originalPrice > price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isBusy || isOutOfStock}
                    onClick={() => moveToCart(item)}
                    className="btn-primary flex-1 py-2 text-xs font-semibold"
                  >
                    <ShoppingCart size={15} />
                    <span>{isOutOfStock ? "Out of Stock" : "Move to Cart"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
