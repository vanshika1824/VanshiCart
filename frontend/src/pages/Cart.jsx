import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
} from "lucide-react";

import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../services/cartService";

import { getProducts } from "../services/productService";

import LoadingSpinner from "../components/LoadingSpinner";
import { apiError } from "../services/api";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD CART + PRODUCTS
  // --------------------------------------------------

  const loadCart = async () => {
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

      console.log("CART DATA:", cartData);
      console.log("PRODUCTS DATA:", productsData);
    } catch (e) {
      console.error("CART LOAD ERROR:", e);

      setCart(null);

      setError(
        apiError(
          e,
          "Could not load your cart."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // IMPORTANT:
  // Do NOT use useEffect(loadCart, []) because loadCart is async.
  useEffect(() => {
    loadCart();
  }, []);

  // --------------------------------------------------
  // CART ITEMS
  // --------------------------------------------------

  const items =
    cart?.items ||
    cart?.cart_items ||
    [];

  // --------------------------------------------------
  // FIND PRODUCT FROM PRODUCT ID
  // --------------------------------------------------

  const findProduct = (item) => {
    return products.find(
      (product) =>
        String(product.product_id) ===
        String(item.product_id)
    );
  };

  // --------------------------------------------------
  // GET PRODUCT NAME
  // --------------------------------------------------

  const getProductName = (item) => {
    const product = findProduct(item);

    return (
      product?.name ||
      item.product_name ||
      `Product #${item.product_id}`
    );
  };

  // --------------------------------------------------
  // GET PRODUCT IMAGE
  // --------------------------------------------------

  const getProductImage = (item) => {
    const product = findProduct(item);

    return (
      product?.image_url ||
      product?.image ||
      product?.imageUrl ||
      ""
    );
  };

  // --------------------------------------------------
  // GET PRODUCT PRICE
  // --------------------------------------------------

  const getProductPrice = (item) => {
    const product = findProduct(item);

    return Number(
      item.price ||
      item.selling_price ||
      product?.selling_price ||
      0
    );
  };

  // --------------------------------------------------
  // CALCULATE TOTAL
  // --------------------------------------------------

  const total = items.reduce(
    (sum, item) => {
      const price = getProductPrice(item);
      const quantity = Number(item.quantity || 1);

      return sum + price * quantity;
    },
    0
  );

  // --------------------------------------------------
  // CHANGE QUANTITY
  // --------------------------------------------------

  const changeQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem(
        item.cart_item_id,
        {
          quantity: newQuantity,
        }
      );

      await loadCart();
    } catch (e) {
      console.error(
        "UPDATE CART ITEM ERROR:",
        e
      );

      alert(
        apiError(
          e,
          "Could not update quantity."
        )
      );
    }
  };

  // --------------------------------------------------
  // REMOVE ITEM
  // --------------------------------------------------

  const removeItem = async (item) => {
    try {
      await removeCartItem(
        item.cart_item_id
      );

      await loadCart();
    } catch (e) {
      console.error(
        "REMOVE CART ITEM ERROR:",
        e
      );

      alert(
        apiError(
          e,
          "Could not remove item."
        )
      );
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

  if (error) {
    return (
      <div className="container-page py-10">

        <div className="card p-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShoppingCart size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Could not load your cart
          </h1>

          <p className="mt-2 text-slate-500">
            {error}
          </p>

          <button
            onClick={loadCart}
            className="btn-primary mt-5"
          >
            Try again
          </button>

          <div className="mt-4">
            <Link
              to="/products"
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              Continue shopping
            </Link>
          </div>

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

        <p className="text-sm font-bold text-brand-600">
          SHOPPING CART
        </p>

        <h1 className="mt-1 text-3xl font-black">
          Your cart
        </h1>

        <div className="card mt-7 p-10 text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <ShoppingCart size={38} />
          </div>

          <h2 className="mt-5 text-xl font-black">
            Your cart is empty
          </h2>

          <p className="mt-2 text-slate-500">
            Add some products to your cart and they will appear here.
          </p>

          <Link
            to="/products"
            className="btn-primary mt-5 inline-flex items-center gap-2"
          >
            Start shopping
            <ArrowRight size={17} />
          </Link>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // MAIN CART
  // --------------------------------------------------

  return (
    <div className="container-page py-10">

      {/* HEADER */}

      <div>
        <p className="text-sm font-bold text-brand-600">
          SHOPPING CART
        </p>

        <h1 className="mt-1 text-3xl font-black">
          Your cart
        </h1>

        <p className="mt-2 text-slate-500">
          Review your items before checkout.
        </p>
      </div>

      {/* CART */}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">

        {/* ITEMS */}

        <div className="space-y-4">

          {items.map((item, index) => {

            const name =
              getProductName(item);

            const image =
              getProductImage(item);

            const price =
              getProductPrice(item);

            const quantity =
              Number(item.quantity || 1);

            return (
              <div
                key={
                  item.cart_item_id ||
                  index
                }
                className="card overflow-hidden p-4"
              >

                <div className="flex gap-4">

                  {/* IMAGE */}

                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">

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
                      <div className="flex h-full items-center justify-center text-4xl">
                        🥬
                      </div>
                    )}

                  </div>

                  {/* DETAILS */}

                  <div className="min-w-0 flex-1">

                    <Link
                      to={`/products/${item.product_id}`}
                      className="font-black hover:text-brand-600"
                    >
                      {name}
                    </Link>

                    <p className="mt-1 text-sm text-slate-500">
                      ₹{price.toFixed(2)} each
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">

                      {/* QUANTITY */}

                      <div className="flex items-center rounded-xl border border-slate-200 bg-white">

                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item,
                              Math.max(
                                1,
                                quantity - 1
                              )
                            )
                          }
                          className="p-2 text-slate-600 hover:bg-slate-50"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="min-w-8 text-center text-sm font-bold">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item,
                              quantity + 1
                            )
                          }
                          className="p-2 text-slate-600 hover:bg-slate-50"
                        >
                          <Plus size={16} />
                        </button>

                      </div>

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item)
                        }
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:underline"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>

                    </div>

                  </div>

                  {/* ITEM TOTAL */}

                  <div className="shrink-0 text-right">

                    <p className="font-black">
                      ₹{(
                        price *
                        quantity
                      ).toFixed(2)}
                    </p>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

        {/* SUMMARY */}

        <div className="card h-fit p-6">

          <h2 className="text-xl font-black">
            Order summary
          </h2>

          <div className="mt-5 space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-slate-500">
                Items
              </span>

              <span className="font-semibold">
                {items.length}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Subtotal
              </span>

              <span className="font-semibold">
                ₹{total.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-4">

              <div className="flex justify-between">

                <span className="font-black">
                  Total
                </span>

                <span className="text-lg font-black">
                  ₹{total.toFixed(2)}
                </span>

              </div>

            </div>

          </div>

          <Link
            to="/checkout"
            className="btn-primary mt-6 flex w-full items-center justify-center gap-2"
          >
            Proceed to checkout
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/products"
            className="mt-4 block text-center text-sm font-semibold text-slate-500 hover:text-brand-600"
          >
            Continue shopping
          </Link>

        </div>

      </div>

    </div>
  );
}