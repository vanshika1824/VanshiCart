import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

import { getAddresses } from "../services/addressService";
import { getCart } from "../services/cartService";
import { getProducts } from "../services/productService";
import { checkout } from "../services/orderService";

import ImageWithFallback from "../components/ImageWithFallback";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { apiError } from "../services/api";

export default function Checkout() {
  const toast = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [addressesResponse, cartResponse, productsResponse] =
        await Promise.all([getAddresses(), getCart(), getProducts()]);

      const addressesData = Array.isArray(addressesResponse?.data)
        ? addressesResponse.data
        : addressesResponse?.data?.items || [];

      const productsData = Array.isArray(productsResponse?.data)
        ? productsResponse.data
        : productsResponse?.data?.items || [];

      setAddresses(addressesData);
      setCart(cartResponse?.data || null);
      setProducts(productsData);

      // Select default address if present
      const defaultAddress = addressesData.find((item) => item.is_default);
      if (defaultAddress) {
        setAddress(String(defaultAddress.address_id));
      } else if (addressesData.length > 0) {
        setAddress(String(addressesData[0].address_id));
      }
    } catch (e) {
      console.error("CHECKOUT LOAD ERROR:", e);
      setError(apiError(e, "Could not load checkout information."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const items = cart?.items || cart?.cart_items || [];

  const getProduct = (item) => {
    return products.find(
      (p) => String(p.product_id) === String(item.product_id)
    );
  };

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = getProduct(item);
      const price = Number(product?.selling_price || item.price || 0);
      const quantity = Number(item.quantity || 1);
      return sum + price * quantity;
    }, 0);
  }, [items, products]);

  const placeOrder = async () => {
    if (!address) {
      setError("Please select a delivery address.");
      return;
    }

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setBusy(true);
      setError("");

      const payload = {
        address_id: Number(address),
        payment_method: paymentMethod,
      };

      await checkout(payload);

      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Order placed successfully! Thank you for shopping with us.");
      navigate("/orders");
    } catch (e) {
      console.error("CHECKOUT ERROR:", e);
      setError(apiError(e, "Checkout failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="container-page py-16">
        <div className="card max-w-md mx-auto p-8 text-center bg-red-50/40 border-red-200">
          <p className="text-3xl">⚠️</p>
          <h2 className="mt-4 text-xl font-black text-slate-900">
            Could not load checkout
          </h2>
          <p className="mt-2 text-xs text-slate-600">{error}</p>
          <button onClick={loadData} className="btn-primary mt-6">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-page py-16 sm:py-24">
        <div className="card max-w-lg mx-auto p-8 sm:p-12 text-center shadow-card">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-700">
            <ShoppingBag size={38} strokeWidth={1.75} />
          </div>
          <h2 className="mt-6 text-2xl font-black text-slate-900">
            Your Cart is Empty
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Please add grocery items to your basket before proceeding to checkout.
          </p>
          <div className="mt-8">
            <Link to="/products" className="btn-primary">
              <span>Browse Catalog</span>
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
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
            <CheckCircle2 size={13} />
            <span>Secure Order</span>
          </div>
          <h1 className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
            Checkout
          </h1>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <ArrowLeft size={16} />
          <span>Edit Cart</span>
        </Link>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: ADDRESS & PAYMENT */}
        <div className="space-y-6 lg:col-span-8">
          {/* 1. DELIVERY ADDRESS SELECTION */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-bold text-sm">
                  1
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Select Delivery Address
                </h2>
              </div>
              <Link
                to="/addresses"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
              >
                <Plus size={14} />
                <span>Add / Manage</span>
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <MapPin size={28} className="mx-auto text-slate-400" />
                <p className="mt-2 text-sm font-bold text-slate-700">
                  No delivery address saved
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Please add your home or work address to receive your groceries.
                </p>
                <Link to="/addresses" className="btn-primary mt-4 text-xs">
                  Add Delivery Address
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {addresses.map((item) => {
                  const isSelected = String(address) === String(item.address_id);
                  return (
                    <label
                      key={item.address_id}
                      className={`block cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-brand-600 bg-brand-50/50 shadow-subtle ring-1 ring-brand-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="radio"
                          name="address"
                          value={item.address_id}
                          checked={isSelected}
                          onChange={(e) => setAddress(e.target.value)}
                          className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              {item.recipient_name}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              {item.address_type || "Home"}
                            </span>
                            {item.is_default && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.recipient_phone}
                          </p>
                          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                            {item.house_no}, {item.street}, {item.city},{" "}
                            {item.state} - {item.pincode}
                            {item.landmark && ` (Near ${item.landmark})`}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. PAYMENT METHOD SELECTION */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-card">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-bold text-sm">
                2
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Payment Method
              </h2>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {/* COD OPTION */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                  paymentMethod === "COD"
                    ? "border-brand-600 bg-brand-50/50 shadow-subtle ring-1 ring-brand-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <Banknote size={17} className="text-brand-700" />
                    <span className="font-bold text-sm text-slate-900">
                      Cash on Delivery
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Pay securely in cash or UPI when your groceries arrive at your
                    door.
                  </p>
                </div>
              </label>

              {/* ONLINE DEMO OPTION */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                  paymentMethod === "ONLINE"
                    ? "border-brand-600 bg-brand-50/50 shadow-subtle ring-1 ring-brand-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={paymentMethod === "ONLINE"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard size={17} className="text-brand-700" />
                    <span className="font-bold text-sm text-slate-900">
                      Online / Cards
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Instant verified checkout demo (No real charge deducted).
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-card">
            <h2 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
              Items in Order ({items.length})
            </h2>

            {/* MINI ITEM LIST */}
            <div className="mt-4 max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {items.map((item, index) => {
                const product = getProduct(item);
                const name = product?.name || `Product #${item.product_id}`;
                const price = Number(product?.selling_price || item.price || 0);
                const quantity = Number(item.quantity || 1);
                const image = product?.image_url || "";

                return (
                  <div
                    key={item.cart_item_id || index}
                    className="flex items-center gap-3 text-xs"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                      <ImageWithFallback
                        src={image}
                        alt={name}
                        productName={name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">
                        {name}
                      </p>
                      <p className="text-slate-400">
                        {quantity} × ₹{price.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ₹{(price * quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* TOTALS */}
            <div className="mt-5 border-t border-slate-100 pt-4 space-y-2.5 text-xs sm:text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-800">
                  ₹{total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-brand-700">FREE</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-slate-900">
                    Grand Total
                  </span>
                  <p className="text-[10px] text-slate-400">All taxes included</p>
                </div>
                <span className="text-xl font-black text-slate-900">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* PLACE ORDER BUTTON */}
            <button
              type="button"
              disabled={busy || !addresses.length || !address}
              onClick={placeOrder}
              className="btn-primary mt-6 w-full py-3.5 text-sm sm:text-base shadow-card-hover"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Confirming Order...</span>
                </span>
              ) : (
                <span>Confirm & Place Order</span>
              )}
            </button>

            {!addresses.length && (
              <p className="mt-3 text-center text-xs font-semibold text-red-600">
                Please add a delivery address above.
              </p>
            )}

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <ShieldCheck size={14} className="text-brand-600" />
              <span>Safe & Simple Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
