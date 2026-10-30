import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PackageCheck,
  Calendar,
  CreditCard,
  Banknote,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { getOrders } from "../services/orderService";
import LoadingSpinner from "../components/LoadingSpinner";
import { apiError } from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrders();
      const data = Array.isArray(response?.data)
        ? response.data
        : response?.data?.items || [];

      setOrders(data);
    } catch (e) {
      console.error("ORDERS LOAD ERROR:", e);
      setError(apiError(e, "Could not load your orders."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

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
          <p className="text-3xl">⚠️</p>
          <h2 className="mt-4 text-xl font-black text-slate-900">
            Could not load orders
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">{error}</p>
          <button onClick={loadOrders} className="btn-primary mt-6">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="container-page py-16 sm:py-24">
        <div className="card max-w-lg mx-auto p-8 sm:p-12 text-center shadow-card-hover">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-700">
            <PackageCheck size={38} strokeWidth={1.75} />
          </div>
          <h2 className="mt-6 text-2xl font-black text-slate-900">
            No Orders Placed Yet
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your fresh grocery orders and receipt tracking history will show up
            right here once placed.
          </p>
          <div className="mt-8">
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
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
          <PackageCheck size={13} />
          <span>Purchase History</span>
        </div>
        <h1 className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
          My Orders ({orders.length})
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Track the status of your recent grocery deliveries and order receipts.
        </p>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-6">
        {orders.map((order, index) => {
          const items = order.items || order.order_items || [];
          const total = Number(order.total_amount || order.total || 0);
          const status = (order.order_status || order.status || "PLACED").toUpperCase();

          const formattedDate = order.created_at
            ? new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Recent";

          return (
            <div
              key={order.order_id || index}
              className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card transition-all"
            >
              {/* ORDER HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 bg-[#fafbfa] p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900">
                      Order #{order.order_id}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-800 border border-brand-200">
                      <CheckCircle2 size={12} className="text-brand-600" />
                      {status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={13} />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total Amount</span>
                    <div className="text-lg font-black text-slate-900">
                      ₹{total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* ITEMS IN THIS ORDER */}
              {items.length > 0 && (
                <div className="divide-y divide-slate-100 p-2 sm:p-5">
                  {items.map((item, itemIdx) => {
                    const name =
                      item.product_name ||
                      item.product?.name ||
                      `Product #${item.product_id}`;
                    const quantity = Number(item.quantity || 1);
                    const price = Number(
                      item.price_at_purchase ||
                        item.price ||
                        item.product?.selling_price ||
                        0
                    );
                    const subtotal = Number(
                      item.subtotal || price * quantity
                    );

                    return (
                      <div
                        key={item.order_item_id || itemIdx}
                        className="flex items-center justify-between gap-4 py-3 px-3 hover:bg-slate-50/50 rounded-xl transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Package size={17} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {name}
                            </p>
                            <p className="text-xs text-slate-400">
                              Qty: {quantity} × ₹{price.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right font-black text-sm text-slate-900 shrink-0">
                          ₹{subtotal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ORDER FOOTER */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  {order.payment_method === "COD" ? (
                    <Banknote size={15} className="text-brand-600" />
                  ) : (
                    <CreditCard size={15} className="text-brand-600" />
                  )}
                  <span>
                    Payment:{" "}
                    <b className="text-slate-800">
                      {order.payment_method === "COD"
                        ? "Cash on Delivery"
                        : order.payment_method || "Online"}
                    </b>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Clock size={13} />
                  <span>Doorstep delivery scheduled</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
