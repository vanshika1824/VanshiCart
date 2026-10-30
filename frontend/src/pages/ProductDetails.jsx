import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Sparkles,
} from "lucide-react";

import { getProduct } from "../services/productService";
import { getProductReviews, createReview } from "../services/reviewService";
import { getOrders } from "../services/orderService";
import { getCart, addCartItem, createCart } from "../services/cartService";
import { getWishlist, addWishlistItem, createWishlist } from "../services/wishlistService";

import ImageWithFallback from "../components/ImageWithFallback";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiError } from "../services/api";

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [eligibleOrderItemId, setEligibleOrderItemId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProductData = async () => {
      try {
        setLoading(true);
        const [prodRes, reviewsRes] = await Promise.all([
          getProduct(id),
          getProductReviews(id),
        ]);

        if (isMounted) {
          setProduct(prodRes.data);
          const reviewItems = Array.isArray(reviewsRes.data)
            ? reviewsRes.data
            : reviewsRes.data?.items || [];
          setReviews(reviewItems);
        }

        // Check if current user is an eligible verified purchaser
        if (user) {
          try {
            const ordersRes = await getOrders();
            const ordersList = Array.isArray(ordersRes.data)
              ? ordersRes.data
              : ordersRes.data?.items || [];
            const matched = ordersList
              .flatMap((o) => o.items || [])
              .find((it) => it.product_id === Number(id));
            if (matched && isMounted) {
              setEligibleOrderItemId(matched.order_item_id);
            }
          } catch {
            // Non-blocking
          }
        }
      } catch (e) {
        console.error("PRODUCT DETAILS LOAD ERROR:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProductData();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  if (loading) {
    return (
      <div className="container-page py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-20 text-center">
        <div className="card max-w-md mx-auto p-10">
          <p className="text-4xl">🥬</p>
          <h2 className="mt-4 text-2xl font-black text-slate-900">
            Product Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This item may be temporarily unavailable or out of season.
          </p>
          <Link to="/products" className="btn-primary mt-6">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const sellingPrice = Number(product.selling_price || 0);
  const originalPrice = Number(product.original_price || 0);
  const discount =
    originalPrice > sellingPrice
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : 0;

  const stock = Number(product.stock_quantity ?? 0);
  const isOutOfStock = stock <= 0;

  // Add to cart
  const handleAddToCart = async () => {
    if (!user) {
      toast.info("Please sign in to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);
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
        product_id: Number(id),
        quantity: quantity,
      });

      window.dispatchEvent(new Event("cart-updated"));
      toast.success(`Added ${quantity} × ${product.name} to cart.`);
    } catch (e) {
      toast.error(apiError(e, "Could not add to cart."));
    } finally {
      setAddingToCart(false);
    }
  };

  // Add to wishlist
  const handleWishlist = async () => {
    if (!user) {
      toast.info("Please sign in to save items to your wishlist.");
      navigate("/login");
      return;
    }

    try {
      setWishlisting(true);
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
        product_id: Number(id),
      });

      window.dispatchEvent(new Event("wishlist-updated"));
      toast.success(`Saved ${product.name} to wishlist.`);
    } catch (e) {
      toast.error(apiError(e, "Could not add to wishlist."));
    } finally {
      setWishlisting(false);
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!eligibleOrderItemId) {
      toast.error("You can only review products from your purchased orders.");
      return;
    }

    try {
      setSubmittingReview(true);
      await createReview({
        product_id: Number(id),
        order_item_id: eligibleOrderItemId,
        rating,
        review_text: comment.trim(),
      });

      setComment("");
      toast.success("Thank you! Review submitted.");

      const updated = await getProductReviews(id);
      setReviews(
        Array.isArray(updated.data) ? updated.data : updated.data?.items || []
      );
    } catch (e) {
      toast.error(apiError(e, "Could not submit review."));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container-page py-8 sm:py-12">
      {/* BREADCRUMB */}
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-brand-700 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to All Products</span>
        </Link>
      </div>

      {/* MAIN PRODUCT SHOWCASE */}
      <div className="grid gap-10 lg:grid-cols-12">
        {/* LEFT: IMAGE BOX */}
        <div className="lg:col-span-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card p-4">
            <div className="h-full w-full overflow-hidden rounded-2xl bg-slate-50">
              <ImageWithFallback
                src={product.image_url}
                alt={product.name}
                productName={product.name}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>

            {/* DISCOUNT BADGE */}
            {discount > 0 && (
              <span className="absolute left-6 top-6 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-sm">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: DETAILS & ACTIONS */}
        <div className="flex flex-col justify-center lg:col-span-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 border border-brand-200">
              <Sparkles size={12} />
              <span>Verified Quality Item</span>
            </div>

            <h1 className="mt-3 text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
              {product.description ||
                "Fresh everyday grocery essential, carefully sourced and packed to ensure quality and freshness."}
            </p>
          </div>

          {/* PRICE & PACK SIZE */}
          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{sellingPrice.toFixed(2)}
              </span>
              {originalPrice > sellingPrice && (
                <span className="text-lg text-slate-400 line-through">
                  ₹{originalPrice.toFixed(2)}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
                  Save ₹{(originalPrice - sellingPrice).toFixed(2)}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
              <span>
                Package:{" "}
                <b className="text-slate-800">
                  {product.quantity} {product.unit || "unit"}
                </b>
              </span>
              <span>•</span>
              <span>
                Status:{" "}
                {isOutOfStock ? (
                  <b className="text-red-600">Out of Stock</b>
                ) : stock <= 10 ? (
                  <b className="text-amber-700">Only {stock} left in stock</b>
                ) : (
                  <b className="text-brand-700">In Stock ({stock} available)</b>
                )}
              </span>
            </div>
          </div>

          {/* QUANTITY & ACTIONS */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* QUANTITY PICKER */}
            {!isOutOfStock && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-1 shadow-subtle sm:w-36">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold text-slate-800 text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}

            {/* ADD TO CART BUTTON */}
            <button
              type="button"
              disabled={isOutOfStock || addingToCart}
              onClick={handleAddToCart}
              className="btn-primary flex-1 py-3 text-base shadow-card-hover"
            >
              <ShoppingCart size={19} />
              <span>
                {isOutOfStock
                  ? "Out of Stock"
                  : addingToCart
                  ? "Adding to Cart..."
                  : "Add to Cart"}
              </span>
            </button>

            {/* WISHLIST BUTTON */}
            <button
              type="button"
              disabled={wishlisting}
              onClick={handleWishlist}
              className="btn-secondary py-3 px-4"
              aria-label="Save to Wishlist"
            >
              <Heart size={19} />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>

          {/* SERVICE PERKS */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-6">
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50/60">
              <Truck size={20} className="text-brand-600" />
              <span className="mt-1 text-xs font-bold text-slate-800">
                Fast Delivery
              </span>
              <span className="text-[10px] text-slate-400">At your doorstep</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50/60">
              <ShieldCheck size={20} className="text-brand-600" />
              <span className="mt-1 text-xs font-bold text-slate-800">
                Quality Check
              </span>
              <span className="text-[10px] text-slate-400">Carefully Inspected</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50/60">
              <HeartHandshake size={20} className="text-brand-600" />
              <span className="mt-1 text-xs font-bold text-slate-800">
                Support Help
              </span>
              <span className="text-[10px] text-slate-400">Order Assistance</span>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <section className="mt-16 sm:mt-24 border-t border-slate-200/80 pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Real feedback from verified VanshiCart shoppers.
            </p>
          </div>
        </div>

        {/* WRITE A REVIEW */}
        {!user ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center text-xs text-slate-500">
            <Link to="/login" className="font-bold text-brand-700 hover:underline">
              Sign in
            </Link>{" "}
            to leave a review on purchased items.
          </div>
        ) : eligibleOrderItemId ? (
          <form
            onSubmit={handleReviewSubmit}
            className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-card"
          >
            <h3 className="text-sm font-bold text-slate-800 mb-3">
              Write a Review for {product.name}
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      size={20}
                      className={
                        star <= rating
                          ? "fill-amber-400 stroke-amber-500"
                          : "stroke-slate-300"
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-600">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the freshness, taste, and packaging?..."
                required
                className="input flex-1"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary"
              >
                {submittingReview ? "Posting..." : "Post Review"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 text-center text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Verified buyer reviews only.</span> Once you have ordered and received this item, you will be able to submit your rating and review.
          </div>
        )}

        {/* REVIEWS LIST */}
        <div className="mt-8 space-y-3.5">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-500 shadow-subtle">
              No reviews yet. Be the first to share your thoughts on this item!
            </div>
          ) : (
            reviews.map((r, i) => (
              <div
                key={r.review_id || i}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        size={15}
                        className={
                          s < Number(r.rating || 5)
                            ? "fill-amber-400 stroke-amber-500"
                            : "stroke-slate-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Verified Purchase
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {r.review_text || r.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
