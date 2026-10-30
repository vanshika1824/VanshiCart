import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../services/cartService";
import { getProducts } from "../services/productService";

import ImageWithFallback from "../components/ImageWithFallback";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiError } from "../services/api";

export default function Cart() {
  const { user } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const loadCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [cartResponse, productsResponse] = await Promise.all([
        getCart(),
        getProducts(),
      ]);

      const cartData = cartResponse?.data || {};
      const productsData = Array.isArray(productsResponse?.data)
        ? productsResponse.data
        : productsResponse?.data?.items || [];

      setCart(cartData);
      setProducts(productsData);
    } catch (e) {
      console.error("CART LOAD ERROR:", e);
      setCart(null);
      setError(apiError(e, "Could not load your cart."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const items = cart?.items || cart?.cart_items || [];

  const findProduct = (item) => {
    return products.find(
      (product) => String(product.product_id) === String(item.product_id)
    );
  };

  const getProductName = (item) => {
    const product = findProduct(item);
    return product?.name || item.product_name || `Product #${item.product_id}`;
  };

  const getProductImage = (item) => {
    const product = findProduct(item);
    return product?.image_url || product?.image || "";
  };

  const getProductPrice = (item) => {
    const product = findProduct(item);
    return Number(
      item.price || item.selling_price || product?.selling_price || 0
    );
  };

  const getOriginalPrice = (item) => {
    const product = findProduct(item);
    return Number(product?.original_price || getProductPrice(item));
  };

  const total = items.reduce((sum, item) => {
    const price = getProductPrice(item);
    const quantity = Number(item.quantity || 1);
    return sum + price * quantity;
  }, 0);

  const originalTotal = items.reduce((sum, item) => {
    const price = getOriginalPrice(item);
    const quantity = Number(item.quantity || 1);
    return sum + price * quantity;
  }, 0);

  const totalSavings = originalTotal > total ? originalTotal - total : 0;
  const deliveryFee = 0;
  const finalPayable = total + deliveryFee;

  const changeQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setUpdatingId(item.cart_item_id);
      await updateCartItem(item.cart_item_id, {
        quantity: newQuantity,
      });
      window.dispatchEvent(new Event("cart-updated"));
      await loadCart();
    } catch (e) {
      toast.error(apiError(e, "Could not update quantity."));
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (item) => {
    try {
      setUpdatingId(item.cart_item_id);
      await removeCartItem(item.cart_item_id);
      window.dispatchEvent(new Event("cart-updated"));
      toast.info("Item removed from cart.");
      await loadCart();
    } catch (e) {
      toast.error(apiError(e, "Could not remove item."));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-16 sm:py-24">
        <div className="card max-w-lg mx-auto p-8 sm:p-12 text-center shadow-card-hover">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-700">
            <ShoppingCart size={38} strokeWidth={1.75} />
          </div>
          <h2 className="mt-6 text-2xl font-black text-slate-900">
            Sign In to View Your Cart
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Please log in with your VanshiCart account to access your saved grocery items and proceed to checkout.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/login" className="btn-primary">
              <span>Sign In</span>
              <ArrowRight size={17} />
            </Link>
            <Link to="/register" className="btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-16">
        <div className="card max-w-md mx-auto p-8 text-center bg-red-50/40 border-red-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <ShoppingCart size={28} />
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900">
            Could not load your cart
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">{error}</p>
          <button onClick={loadCart} className="btn-primary mt-6">
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
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-700">
            <ShoppingCart size={38} strokeWidth={1.75} />
          </div>
          <h2 className="mt-6 text-2xl font-black text-slate-900">
            Your Cart is Empty
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Looks like you haven't added any fresh groceries to your cart yet.
            Explore our daily harvest!
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/products" className="btn-primary">
              <span>Start Grocery Shopping</span>
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
            <ShoppingCart size={13} />
            <span>Shopping Cart</span>
          </div>
          <h1 className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
            Review Your Basket ({items.length} items)
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

      {/* DELIVERY INFO BANNER */}
      <div className="mb-8 rounded-2xl border border-brand-200/80 bg-brand-50/70 p-4 shadow-subtle flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <Truck size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-brand-900">
            Standard Delivery Available
          </p>
          <p className="text-[11px] text-brand-700/80">
            All orders qualify for standard doorstep delivery.
          </p>
        </div>
      </div>

      {/* MAIN TWO COLUMN LAYOUT */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: ITEM LIST */}
        <div className="space-y-4 lg:col-span-8">
          {items.map((item, index) => {
            const name = getProductName(item);
            const image = getProductImage(item);
            const price = getProductPrice(item);
            const originalPrice = getOriginalPrice(item);
            const quantity = Number(item.quantity || 1);
            const isUpdating = updatingId === item.cart_item_id;

            return (
              <div
                key={item.cart_item_id || index}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card hover:border-slate-300 transition-all"
              >
                {/* ITEM IMAGE & TITLE */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                    <ImageWithFallback
                      src={image}
                      alt={name}
                      productName={name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${item.product_id}`}
                      className="text-sm sm:text-base font-bold text-slate-900 hover:text-brand-700 transition line-clamp-1"
                    >
                      {name}
                    </Link>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm font-black text-slate-800">
                        ₹{price.toFixed(2)}
                      </span>
                      {originalPrice > price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">/ unit</span>
                    </div>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => removeItem(item)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* QUANTITY PICKER & ITEM TOTAL */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* QUANTITY CONTROLLER */}
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-subtle">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => changeQuantity(item, quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-8 text-center text-xs font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => changeQuantity(item, quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* ITEM TOTAL PRICE */}
                  <div className="text-right sm:min-w-24">
                    <span className="text-base font-black text-slate-900">
                      ₹{(price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
            <h2 className="text-lg font-black text-slate-900">Order Summary</h2>

            <div className="mt-5 space-y-3.5 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-800">
                  ₹{total.toFixed(2)}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-brand-700 font-semibold">
                  <span>Product Discount</span>
                  <span>- ₹{totalSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Doorstep Delivery</span>
                <span className="font-bold text-brand-700">FREE</span>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-base font-black text-slate-900">
                      Total Payable
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Inclusive of all taxes
                    </p>
                  </div>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{finalPayable.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="btn-primary mt-6 w-full py-3.5 text-base shadow-card-hover"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </Link>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <ShieldCheck size={16} className="text-brand-600" />
              <span>Safe & Simple Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
