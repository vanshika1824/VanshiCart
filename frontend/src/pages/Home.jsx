import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Search,
  Clock,
  CheckCircle2,
  Leaf,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

import { getProducts, getCategories } from "../services/productService";
import { getCart, addCartItem, createCart } from "../services/cartService";
import { getWishlist, addWishlistItem, createWishlist } from "../services/wishlistService";

import ProductCard from "../components/ProductCard";
import ImageWithFallback from "../components/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiError } from "../services/api";

const CATEGORY_VISUALS = {
  Fruits: {
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=500&q=80",
    bg: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-200/60",
    text: "text-amber-900",
    emoji: "🍎",
  },
  Vegetables: {
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80",
    bg: "from-emerald-500/10 to-green-500/10",
    border: "border-emerald-200/60",
    text: "text-emerald-900",
    emoji: "🥦",
  },
  Dairy: {
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80",
    bg: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-200/60",
    text: "text-blue-900",
    emoji: "🥛",
  },
  Snacks: {
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80",
    bg: "from-yellow-500/10 to-amber-500/10",
    border: "border-yellow-200/60",
    text: "text-yellow-900",
    emoji: "🍪",
  },
  Beverages: {
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=500&q=80",
    bg: "from-purple-500/10 to-pink-500/10",
    border: "border-purple-200/60",
    text: "text-purple-900",
    emoji: "🧃",
  },
};

export default function Home() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsResult, categoriesResult] = await Promise.allSettled([
          getProducts({ limit: 12 }),
          getCategories(),
        ]);

        if (isMounted) {
          if (productsResult.status === "fulfilled") {
            const data = Array.isArray(productsResult.value.data)
              ? productsResult.value.data
              : productsResult.value.data?.items || [];
            setProducts(data);
          } else {
            console.error("HOME PRODUCTS ERROR:", productsResult.reason);
            setError(
              productsResult.reason?.response?.data?.detail ||
              "Unable to load products. Please check the backend."
            );
          }

          if (categoriesResult.status === "fulfilled") {
            const data = Array.isArray(categoriesResult.value.data)
              ? categoriesResult.value.data
              : categoriesResult.value.data?.items || [];
            setCategories(data);
          } else {
            console.error("HOME CATEGORIES ERROR:", categoriesResult.reason);
          }
        }
      } catch (err) {
        console.error("HOME LOAD ERROR:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = search.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/products");
    }
  };

  // Add to cart handler
  const handleAddToCart = async (product) => {
    if (!user) {
      toast.info("Please login to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
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
        product_id: product.product_id,
        quantity: 1,
      });

      window.dispatchEvent(new Event("cart-updated"));
      toast.success(`Added ${product.name} to cart.`);
    } catch (e) {
      toast.error(apiError(e, "Could not add to cart."));
    }
  };

  // Wishlist handler
  const handleWishlist = async (product) => {
    if (!user) {
      toast.info("Please login to use your wishlist.");
      navigate("/login");
      return;
    }

    try {
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
        product_id: product.product_id,
      });

      window.dispatchEvent(new Event("wishlist-updated"));
      toast.success(`Saved ${product.name} to wishlist.`);
    } catch (e) {
      toast.error(apiError(e, "Could not update wishlist."));
    }
  };

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f9f4] via-[#f7fbf8] to-transparent pt-3 sm:pt-4 md:pt-5 lg:pt-6 pb-10 sm:pb-12 md:pb-14">
        {/* Subtle decorative background blur */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 -z-10 h-64 w-full max-w-7xl opacity-40 blur-3xl pointer-events-none">
          <div className="h-full w-full bg-gradient-to-r from-emerald-200 via-brand-100 to-amber-100 rounded-full" />
        </div>

        <div className="container-page grid gap-8 lg:gap-12 lg:grid-cols-12 lg:items-center">
          {/* LEFT HERO COPY */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-xs font-bold text-brand-800 shadow-subtle">
              <Sparkles size={14} className="text-brand-600" />
              <span>Smart Everyday Grocery Shopping</span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.12]">
              Fresh farm food,
              <br />
              <span className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
                delivered in minutes.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
              Crisp seasonal fruits, tender greens, wholesome dairy, and kitchen
              essentials. Handpicked with care and brought straight to your table.
            </p>

            {/* HERO SEARCH BAR */}
            <form
              onSubmit={handleSearch}
              className="mt-6 flex max-w-xl items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-card-hover transition-all focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10"
            >
              <Search size={20} className="ml-3 text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fresh apples, milk, bread, snacks..."
                className="flex-1 bg-transparent px-3 py-2.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 outline-none"
              />
              <button
                type="submit"
                className="btn-primary rounded-xl px-5 py-2.5 text-sm sm:text-base shrink-0"
              >
                Search
              </button>
            </form>

            {/* TRUST BADGES & CTA */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5 text-brand-800">
                <CheckCircle2 size={16} className="text-brand-600" />
                100% Quality Checked
              </span>
              <span className="flex items-center gap-1.5 text-brand-800">
                <Clock size={16} className="text-brand-600" />
                Quick Doorstep Delivery
              </span>
              <span className="flex items-center gap-1.5 text-brand-800">
                <Leaf size={16} className="text-brand-600" />
                Farm Direct Sourcing
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary">
                Explore Full Catalog
                <ArrowRight size={17} />
              </Link>
              <Link to="/categories" className="btn-secondary">
                View All Categories
              </Link>
            </div>
          </div>

          {/* RIGHT HERO VISUAL COMPOSITION */}
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-md lg:max-w-none">
              {/* CLEAN STRUCTURED HERO CARD */}
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card hover:border-slate-300 transition-all duration-300 p-3 sm:p-4">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-emerald-50">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                    alt="Fresh organic produce in crate"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>

                <div className="p-4 pt-4 sm:pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                        Today's Fresh Harvest
                      </span>
                      <h3 className="mt-1 text-lg font-black text-slate-900">
                        Seasonal Fresh Basket
                      </h3>
                    </div>
                    <Link
                      to="/products"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm hover:bg-brand-700 transition"
                      aria-label="Shop harvest"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
                    Hand-selected crispy apples, fresh milk, and daily essentials
                    from trusted suppliers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="container-page py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Department Aisle
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="group inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 transition"
          >
            <span>View All</span>
            <ChevronRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* CATEGORY GRID */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {(categories.length > 0
            ? categories.slice(0, 5)
            : [
              { category_id: 1, name: "Fruits" },
              { category_id: 2, name: "Vegetables" },
              { category_id: 3, name: "Dairy" },
              { category_id: 4, name: "Snacks" },
              { category_id: 5, name: "Beverages" },
            ]
          ).map((cat) => {
            const visual = CATEGORY_VISUALS[cat.name] || {
              image:
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
              bg: "from-slate-100 to-slate-200",
              border: "border-slate-200",
              text: "text-slate-800",
              emoji: "🛒",
            };

            const targetUrl =
              typeof cat.category_id === "number"
                ? `/products?category_id=${cat.category_id}`
                : `/products?search=${encodeURIComponent(cat.name)}`;

            return (
              <Link
                key={cat.category_id}
                to={targetUrl}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-card-hover"
              >
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-50">
                  <ImageWithFallback
                    src={cat.image_url || visual.image}
                    alt={cat.name}
                    categoryName={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Explore shelf →
                    </p>
                  </div>
                  <span className="text-lg" role="img" aria-label={cat.name}>
                    {visual.emoji}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* POPULAR PRODUCTS SECTION */}
      <section className="container-page pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Handpicked Essentials
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Popular Grocery Items
            </h2>
          </div>
          <Link
            to="/products"
            className="group inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 transition"
          >
            <span>Browse Catalog</span>
            <ChevronRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            <p className="font-bold">Could not load all products</p>
            <p className="mt-1 text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* SKELETON LOADING STATE */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card"
              >
                <div className="aspect-square w-full rounded-xl shimmer-placeholder" />
                <div className="mt-4 h-4 w-1/3 rounded bg-slate-100" />
                <div className="mt-2 h-5 w-3/4 rounded bg-slate-100" />
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="h-5 w-16 rounded bg-slate-100" />
                  <div className="h-8 w-16 rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 text-2xl">
              🛒
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-800">
              No products found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              The catalog is currently being updated.
            </p>
          </div>
        )}

        {/* PRODUCT GRID */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onAdd={handleAddToCart}
                onWish={handleWishlist}
              />
            ))}
          </div>
        )}
      </section>

      {/* WHY CHOOSE VANSHICART BANNER */}
      <section className="border-t border-slate-200/80 bg-gradient-to-b from-white to-[#f6faf8] py-16">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Why Shop With VanshiCart?
            </h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              We take the hassle out of grocery runs with fresh selections,
              transparent prices, and quick delivery directly to your door.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card hover:shadow-card-hover transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-brand-700 font-bold">
                <Truck size={24} />
              </div>
              <h3 className="mt-5 text-base font-black text-slate-900">
                Reliable Doorstep Delivery
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
                Carefully packed groceries delivered quickly to ensure optimum
                crispness and quality.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card hover:shadow-card-hover transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-brand-700 font-bold">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mt-5 text-base font-black text-slate-900">
                Verified Farm Quality
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
                Direct connections with top orchards and verified suppliers for
                wholesome ingredients.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card hover:shadow-card-hover transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-brand-700 font-bold">
                <ShoppingBag size={24} />
              </div>
              <h3 className="mt-5 text-base font-black text-slate-900">
                One Simple Cart Experience
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
                Intuitive checkout, order tracking, and flexible cash on delivery
                for complete peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
