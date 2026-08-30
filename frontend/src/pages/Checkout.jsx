import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getAddresses } from "../services/addressService";
import { getCart } from "../services/cartService";
import { getProducts } from "../services/productService";
import { checkout } from "../services/orderService";

import LoadingSpinner from "../components/LoadingSpinner";
import { apiError } from "../services/api";

export default function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // --------------------------------------------------
  // LOAD CHECKOUT DATA
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        addressesResponse,
        cartResponse,
        productsResponse,
      ] = await Promise.all([
        getAddresses(),
        getCart(),
        getProducts(),
      ]);

      const addressesData = Array.isArray(addressesResponse?.data)
        ? addressesResponse.data
        : addressesResponse?.data?.items || [];

      const productsData = Array.isArray(productsResponse?.data)
        ? productsResponse.data
        : productsResponse?.data?.items || [];

      setAddresses(addressesData);
      setCart(cartResponse?.data || null);
      setProducts(productsData);

      // Automatically select default address
      const defaultAddress = addressesData.find(
        (item) => item.is_default
      );

      if (defaultAddress) {
        setAddress(String(defaultAddress.address_id));
      } else if (addressesData.length > 0) {
        setAddress(String(addressesData[0].address_id));
      }
    } catch (e) {
      console.error("CHECKOUT LOAD ERROR:", e);

      setError(
        apiError(
          e,
          "Could not load checkout information."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // CART ITEMS
  // --------------------------------------------------

  const items =
    cart?.items ||
    cart?.cart_items ||
    [];

  // --------------------------------------------------
  // FIND PRODUCT
  // --------------------------------------------------

  const getProduct = (item) => {
    return products.find(
      (product) =>
        String(product.product_id) ===
        String(item.product_id)
    );
  };

  // --------------------------------------------------
  // CALCULATE TOTAL
  // --------------------------------------------------

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = getProduct(item);

      const price = Number(
        product?.selling_price ||
        item.price ||
        0
      );

      const quantity = Number(
        item.quantity || 1
      );

      return sum + price * quantity;
    }, 0);
  }, [items, products]);

  // --------------------------------------------------
  // PLACE ORDER
  // --------------------------------------------------

  const placeOrder = async () => {
    if (!address) {
      setError("Please select a delivery address.");
      return;
    }

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    try {
      setBusy(true);
      setError("");

      const payload = {
        address_id: Number(address),
        payment_method: paymentMethod,
      };

      console.log("CHECKOUT PAYLOAD:", payload);

      await checkout(payload);

      navigate("/orders");

    } catch (e) {
      console.error("CHECKOUT ERROR:", e);

      setError(
        apiError(
          e,
          "Checkout failed. Please try again."
        )
      );
    } finally {
      setBusy(false);
    }
  };

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

  if (error && !cart) {
    return (
      <div className="container-page py-10">

        <div className="card p-8 text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-4 text-2xl font-black">
            Could not load checkout
          </h1>

          <p className="mt-2 text-slate-500">
            {error}
          </p>

          <button
            onClick={loadData}
            className="btn-primary mt-5"
          >
            Try again
          </button>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // EMPTY CART
  // --------------------------------------------------

  if (!items.length) {
    return (
      <div className="container-page py-10">

        <h1 className="text-3xl font-black">
          Checkout
        </h1>

        <div className="card mt-7 p-10 text-center">

          <div className="text-5xl">
            🛒
          </div>

          <h2 className="mt-4 text-xl font-black">
            Your cart is empty
          </h2>

          <p className="mt-2 text-slate-500">
            Add some products before checking out.
          </p>

          <Link
            to="/products"
            className="btn-primary mt-5 inline-block"
          >
            Browse products
          </Link>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // MAIN CHECKOUT
  // --------------------------------------------------

  return (
    <div className="container-page py-10">

      {/* HEADER */}

      <div className="mb-8">

        <p className="text-sm font-bold text-brand-600">
          ORDER
        </p>

        <h1 className="mt-1 text-3xl font-black">
          Checkout
        </h1>

        <p className="mt-2 text-slate-500">
          Review your order and choose your delivery address.
        </p>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

        {/* LEFT */}

        <div className="space-y-6">

          {/* ADDRESS */}

          <div className="card p-5">

            <h2 className="text-lg font-black">
              Delivery address
            </h2>

            {addresses.length === 0 ? (

              <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">

                <p className="text-sm text-slate-500">
                  You don't have a delivery address yet.
                </p>

                <Link
                  to="/addresses"
                  className="btn-primary mt-4 inline-block"
                >
                  Add address
                </Link>

              </div>

            ) : (

              <div className="mt-4 space-y-3">

                {addresses.map((item) => (

                  <label
                    key={item.address_id}
                    className={`block cursor-pointer rounded-xl border p-4 transition ${
                      String(address) ===
                      String(item.address_id)
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:border-brand-300"
                    }`}
                  >

                    <div className="flex gap-3">

                      <input
                        type="radio"
                        name="address"
                        value={item.address_id}
                        checked={
                          String(address) ===
                          String(item.address_id)
                        }
                        onChange={(e) =>
                          setAddress(e.target.value)
                        }
                        className="mt-1"
                      />

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="font-black">
                            {item.address_type ||
                              "Address"}
                          </span>

                          {item.is_default && (
                            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
                              Default
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-sm font-semibold">
                          {item.recipient_name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.recipient_phone}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.house_no},{" "}
                          {item.street}
                          <br />
                          {item.city},{" "}
                          {item.state} -{" "}
                          {item.pincode}
                          {item.landmark && (
                            <>
                              <br />
                              Landmark:{" "}
                              {item.landmark}
                            </>
                          )}
                        </p>

                      </div>

                    </div>

                  </label>

                ))}

                <Link
                  to="/addresses"
                  className="inline-block text-sm font-bold text-brand-700 hover:underline"
                >
                  Manage addresses
                </Link>

              </div>

            )}

          </div>

          {/* PAYMENT */}

          <div className="card p-5">

            <h2 className="text-lg font-black">
              Payment method
            </h2>

            <div className="mt-4 space-y-3">

              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                  paymentMethod === "COD"
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200"
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />

                <div>
                  <p className="font-bold">
                    Cash on Delivery
                  </p>

                  <p className="text-sm text-slate-500">
                    Pay when your order arrives.
                  </p>
                </div>

              </label>

              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                  paymentMethod === "ONLINE"
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200"
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={
                    paymentMethod === "ONLINE"
                  }
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />

                <div>
                  <p className="font-bold">
                    Online Payment
                  </p>

                  <p className="text-sm text-slate-500">
                    Demo payment option.
                  </p>
                </div>

              </label>

            </div>

          </div>

        </div>

        {/* RIGHT — ORDER SUMMARY */}

        <div className="card h-fit p-5">

          <h2 className="text-lg font-black">
            Order summary
          </h2>

          <div className="mt-5 space-y-4">

            {items.map((item, index) => {

              const product =
                getProduct(item);

              const name =
                product?.name ||
                item.product_name ||
                `Product #${item.product_id}`;

              const price = Number(
                product?.selling_price ||
                item.price ||
                0
              );

              const quantity =
                Number(item.quantity || 1);

              const image =
                product?.image_url ||
                product?.image ||
                product?.imageUrl ||
                "";

              const subtotal =
                price * quantity;

              return (
                <div
                  key={
                    item.cart_item_id ||
                    index
                  }
                  className="flex gap-3"
                >

                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">
                        🛒
                      </div>
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate font-bold">
                      {name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      ₹{price.toFixed(2)} ×{" "}
                      {quantity}
                    </p>

                  </div>

                  <p className="font-bold">
                    ₹{subtotal.toFixed(2)}
                  </p>

                </div>
              );
            })}

          </div>

          {/* TOTAL */}

          <div className="mt-5 border-t border-slate-200 pt-5">

            <div className="flex justify-between text-base">

              <span className="text-slate-500">
                Subtotal
              </span>

              <span className="font-semibold">
                ₹{total.toFixed(2)}
              </span>

            </div>

            <div className="mt-2 flex justify-between text-base">

              <span className="text-slate-500">
                Delivery
              </span>

              <span className="font-semibold text-brand-600">
                FREE
              </span>

            </div>

            <div className="mt-4 flex justify-between border-t pt-4">

              <span className="text-lg font-black">
                Total
              </span>

              <span className="text-xl font-black text-brand-600">
                ₹{total.toFixed(2)}
              </span>

            </div>

          </div>

          {/* PLACE ORDER */}

          <button
            disabled={
              busy ||
              !addresses.length ||
              !address
            }
            onClick={placeOrder}
            className="btn-primary mt-5 w-full"
          >
            {busy
              ? "Placing order..."
              : "Place order"}
          </button>

          {!addresses.length && (
            <p className="mt-3 text-center text-xs text-red-500">
              Add a delivery address before placing your order.
            </p>
          )}

        </div>

      </div>

    </div>
  );
}