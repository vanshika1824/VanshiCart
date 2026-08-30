import { Heart, ShoppingCart, Package } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCard({ product, onAdd, onWish }) {
  const sellingPrice = Number(product.selling_price || 0);
  const originalPrice = Number(product.original_price || 0);

  const discount =
    originalPrice > sellingPrice
      ? Math.round((1 - sellingPrice / originalPrice) * 100)
      : 0;

  const stock = Number(product.stock_quantity || 0);
  const isOutOfStock = stock <= 0;

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* IMAGE */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Link to={`/products/${product.product_id}`}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-6xl">
              🥬
            </div>
          )}
        </Link>

        {/* DISCOUNT */}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}

        {/* WISHLIST */}
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={() => onWish?.(product)}
          className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-sm transition hover:bg-slate-50 hover:text-red-500"
        >
          <Heart size={17} />
        </button>

        {/* OUT OF STOCK */}
        {isOutOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-4">
        <Link
          to={`/products/${product.product_id}`}
          className="line-clamp-2 min-h-[40px] font-bold text-slate-900 transition hover:text-brand-600"
        >
          {product.name}
        </Link>

        {/* UNIT */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Package size={13} />

          <span>
            {product.quantity
              ? `${product.quantity} ${product.unit || ""}`
              : product.unit || "Standard pack"}
          </span>
        </div>

        {/* STOCK */}
        {!isOutOfStock && stock <= 10 && (
          <p className="mt-2 text-xs font-semibold text-orange-600">
            Only {stock} left
          </p>
        )}

        {/* PRICE + CART */}
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <div className="font-black text-slate-900">
              ₹{sellingPrice.toFixed(2)}
            </div>

            {originalPrice > sellingPrice && (
              <div className="mt-0.5 text-xs text-slate-400 line-through">
                ₹{originalPrice.toFixed(2)}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => onAdd?.(product)}
            className={`rounded-xl p-2.5 transition ${
              isOutOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-300"
                : "bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}