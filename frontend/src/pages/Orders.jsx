import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getOrders } from "../services/orderService";
import LoadingSpinner from "../components/LoadingSpinner";
import { apiError } from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD ORDERS
  // --------------------------------------------------

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrders();

      const data = Array.isArray(response?.data)
        ? response.data
        : response?.data?.items || [];

      console.log("ORDERS DATA:", data);

      setOrders(data);
    } catch (e) {
      console.error("ORDERS LOAD ERROR:", e);

      setError(
        apiError(
          e,
          "Could not load your orders."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="container-page py-10">
        <LoadingSpinner />
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="container-page py-10">

        <div className="card p-8 text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-4 text-2xl font-black">
            Could not load your orders
          </h1>

          <p className="mt-2 text-slate-500">
            {error}
          </p>

          <button
            onClick={loadOrders}
            className="btn-primary mt-5"
          >
            Try again
          </button>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // EMPTY
  // --------------------------------------------------

  if (!orders.length) {
    return (
      <div className="container-page py-10">

        <p className="text-sm font-bold text-brand-600">
          PURCHASES
        </p>

        <h1 className="mt-1 text-3xl font-black">
          My Orders
        </h1>

        <div className="card mt-7 p-10 text-center">

          <div className="text-5xl">
            📦
          </div>

          <h2 className="mt-4 text-xl font-black">
            No orders yet
          </h2>

          <p className="mt-2 text-slate-500">
            Your completed orders will appear here.
          </p>

          <Link
            to="/products"
            className="btn-primary mt-5 inline-block"
          >
            Start shopping
          </Link>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // ORDERS
  // --------------------------------------------------

  return (
    <div className="container-page py-10">

      {/* HEADER */}

      <div className="mb-8">

        <p className="text-sm font-bold text-brand-600">
          PURCHASES
        </p>

        <h1 className="mt-1 text-3xl font-black">
          My Orders
        </h1>

        <p className="mt-2 text-slate-500">
          Track your orders and view your purchase details.
        </p>

      </div>

      {/* ORDER LIST */}

      <div className="space-y-5">

        {orders.map((order, index) => {

          const items =
            order.items ||
            order.order_items ||
            [];

          const total = Number(
            order.total_amount ||
            order.total ||
            0
          );

          const status =
            order.order_status ||
            order.status ||
            "PLACED";

          return (
            <div
              key={
                order.order_id ||
                index
              }
              className="card overflow-hidden"
            >

              {/* ORDER HEADER */}

              <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-lg font-black">
                    Order #{order.order_id}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleString()
                      : "Date unavailable"}
                  </p>

                </div>

                <span className="w-fit rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
                  {status}
                </span>

              </div>

              {/* ORDER ITEMS */}

              {items.length > 0 && (

                <div className="divide-y divide-slate-100">

                  {items.map((item, itemIndex) => {

                    const name =
                      item.product_name ||
                      item.product?.name ||
                      `Product #${item.product_id}`;

                    const quantity =
                      Number(
                        item.quantity || 1
                      );

                    const price =
                      Number(
                        item.price_at_purchase ||
                        item.price ||
                        item.product?.selling_price ||
                        0
                      );

                    const subtotal =
                      Number(
                        item.subtotal ||
                        price * quantity
                      );

                    return (
                      <div
                        key={
                          item.order_item_id ||
                          itemIndex
                        }
                        className="flex items-center justify-between gap-4 p-5"
                      >

                        <div className="min-w-0">

                          <p className="font-bold">
                            {name}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            ₹{price.toFixed(2)} ×{" "}
                            {quantity}
                          </p>

                        </div>

                        <p className="shrink-0 font-bold">
                          ₹{subtotal.toFixed(2)}
                        </p>

                      </div>
                    );
                  })}

                </div>

              )}

              {/* ORDER SUMMARY */}

              <div className="border-t border-slate-200 bg-slate-50 p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-slate-500">
                      Payment
                    </p>

                    <p className="font-semibold">
                      {order.payment_method ||
                        "Not specified"}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-sm text-slate-500">
                      Total
                    </p>

                    <p className="text-xl font-black text-brand-600">
                      ₹{total.toFixed(2)}
                    </p>

                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}