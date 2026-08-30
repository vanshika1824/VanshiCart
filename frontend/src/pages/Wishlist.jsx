import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getWishlist,
  removeWishlistItem,
} from "../services/wishlistService";

import { getProducts } from "../services/productService";

import LoadingSpinner from "../components/LoadingSpinner";
import { apiError } from "../services/api";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD WISHLIST + PRODUCTS
  // --------------------------------------------------

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [wishlistResponse, productsResponse] =
        await Promise.all([
          getWishlist(),
          getProducts(),
        ]);

      const wishlistData =
        wishlistResponse?.data || {};

      const productsData =
        Array.isArray(productsResponse?.data)
          ? productsResponse.data
          : productsResponse?.data?.items || [];

      setWishlist(wishlistData);
      setProducts(productsData);

    } catch (e) {
      console.error("WISHLIST PAGE ERROR:", e);

      setError(
        apiError(
          e,
          "Could not load your wishlist."
        )
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --------------------------------------------------
  // ITEMS
  // --------------------------------------------------

  const items =
    wishlist?.items ||
    wishlist?.wishlist_items ||
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
  // REMOVE
  // --------------------------------------------------

  const remove = async (item) => {
    try {
      await removeWishlistItem(
        item.wishlist_item_id
      );

      await load();

    } catch (e) {
      console.error(
        "REMOVE WISHLIST ERROR:",
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

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-4 text-2xl font-black">
            Could not load wishlist
          </h1>

          <p className="mt-2 text-slate-500">
            {error}
          </p>

          <button
            onClick={load}
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

  if (!items.length) {
    return (
      <div className="container-page py-10">

        <p className="text-sm font-bold text-brand-600">
          SAVED ITEMS
        </p>

        <h1 className="mt-1 text-3xl font-black">
          Wishlist
        </h1>

        <div className="card mt-7 p-10 text-center">

          <div className="text-6xl">
            ♡
          </div>

          <h2 className="mt-4 text-xl font-black">
            Your wishlist is empty
          </h2>

          <p className="mt-2 text-slate-500">
            Save products you want to buy later.
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
  // MAIN
  // --------------------------------------------------

  return (
    <div className="container-page py-10">

      <p className="text-sm font-bold text-brand-600">
        SAVED ITEMS
      </p>

      <h1 className="mt-1 text-3xl font-black">
        Wishlist
      </h1>

      <p className="mt-2 text-slate-500">
        Products you've saved for later.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

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

          const image =
            product?.image_url ||
            product?.image ||
            product?.imageUrl ||
            "";

          return (
            <div
              key={
                item.wishlist_item_id ||
                index
              }
              className="card overflow-hidden"
            >

              {/* IMAGE */}

              <div className="h-52 w-full bg-slate-100">

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
                  <div className="flex h-full items-center justify-center text-6xl">
                    🥬
                  </div>
                )}

              </div>

              {/* DETAILS */}

              <div className="p-5">

                <h2 className="text-lg font-black">
                  {name}
                </h2>

                <p className="mt-2 text-lg font-bold text-brand-600">
                  ₹{price.toFixed(2)}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Product ID: {item.product_id}
                </p>

                <button
                  onClick={() =>
                    remove(item)
                  }
                  className="mt-4 text-sm font-bold text-red-600 hover:underline"
                >
                  Remove from wishlist
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}