import { useState } from "react";
import { Heart, ShoppingBag, Plus, Check } from "lucide-react";
import { Link } from "react-router-dom";
import ImageWithFallback from "./ImageWithFallback";

export default function ProductCard({
  product,
  onAdd,
  onWish,
  isWishlisted = false,
}) {
  const [adding, setAdding] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const sellingPrice = Number(product.selling_price || 0);
  const originalPrice = Number(product.original_price || 0);

  const discount =
    originalPrice > sellingPrice
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : 0;

  const stock = Number(product.stock_quantity ?? 0);
  const isOutOfStock = stock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    try {
      await onAdd?.(product);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1400);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onWish?.(product);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-card-hover">
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <Link
          to={`/products/${product.product_id}`}
          className="block h-full w-full"
        >
          <ImageWithFallback
            src={product.image_url}
            alt={product.name}
            productName={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* DISCOUNT BADGE */}
        {discount > 0 && !isOutOfStock && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlist}
          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-subtle transition-all duration-200 hover:scale-110 active:scale-95 ${
            isWishlisted
              ? "text-red-500 fill-red-500 hover:bg-red-50"
              : "text-slate-400 hover:text-red-500 hover:bg-white"
          }`}
        >
          <Heart
            size={16}
            className={isWishlisted ? "fill-red-500 stroke-red-500" : ""}
          />
        </button>

        {/* OUT OF STOCK OVERLAY */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
            <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          {/* PACK SIZE / UNIT */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span>
              {product.quantity
                ? `${product.quantity} ${product.unit || ""}`.trim()
                : product.unit || "Standard pack"}
            </span>

            {!isOutOfStock && stock <= 10 && (
              <span className="font-semibold text-amber-700">
                Only {stock} left
              </span>
            )}
          </div>

          {/* TITLE */}
          <h3 className="mt-1.5 text-sm sm:text-base font-semibold leading-snug text-slate-800 line-clamp-2 min-h-[2.5rem] group-hover:text-brand-700 transition-colors">
            <Link to={`/products/${product.product_id}`}>
              {product.name}
            </Link>
          </h3>
        </div>

        {/* PRICE AND CTA ROW */}
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                ₹{sellingPrice.toFixed(2)}
              </span>
              {originalPrice > sellingPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isOutOfStock || adding}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
              isOutOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : addedAnimation
                ? "bg-brand-700 text-white shadow-sm"
                : "bg-brand-50 text-brand-800 border border-brand-200 hover:bg-brand-600 hover:text-white hover:border-transparent shadow-subtle"
            }`}
          >
            {addedAnimation ? (
              <>
                <Check size={15} className="animate-bounce" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : adding ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Plus size={15} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
