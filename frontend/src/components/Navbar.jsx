import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Sparkles,
  ShoppingBag,
  PackageCheck,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getCart } from "../services/cartService";
import { getWishlist } from "../services/wishlistService";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  // Fetch cart & wishlist count when user logs in or route changes
  useEffect(() => {
    if (!user) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const [cartRes, wishRes] = await Promise.allSettled([
          getCart(),
          getWishlist(),
        ]);

        if (isMounted) {
          if (cartRes.status === "fulfilled") {
            const items =
              cartRes.value?.data?.items ||
              cartRes.value?.data?.cart_items ||
              [];
            setCartCount(items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0));
          }
          if (wishRes.status === "fulfilled") {
            const items =
              wishRes.value?.data?.items ||
              wishRes.value?.data?.wishlist_items ||
              [];
            setWishlistCount(items.length);
          }
        }
      } catch {
        // Silently ignore count errors in navbar
      }
    };

    fetchCounts();

    const handleUpdate = () => fetchCounts();
    window.addEventListener("cart-updated", handleUpdate);
    window.addEventListener("wishlist-updated", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("cart-updated", handleUpdate);
      window.removeEventListener("wishlist-updated", handleUpdate);
    };
  }, [user, location.pathname]);

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
    } else {
      navigate("/products");
    }
  };

  const handleLogout = () => {
    signOut();
    setUserDropdownOpen(false);
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `relative py-1 text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? "text-brand-700 font-bold"
        : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-forest-900 py-1.5 px-4 text-center text-xs font-medium text-emerald-100">
        <div className="container-page flex items-center justify-between">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-300">
            <Sparkles size={13} className="text-emerald-400" />
            Quality Grocery & Fresh Produce
          </span>
          <span className="mx-auto sm:mx-0">
            Reliable doorstep delivery on every order
          </span>
          <Link
            to="/products"
            className="hidden sm:inline-block font-semibold text-emerald-300 hover:text-white underline underline-offset-2"
          >
            Shop Now →
          </Link>
        </div>
      </div>

      {/* MAIN NAV BAR */}
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-transform duration-200 active:scale-98"
          aria-label="VanshiCart Home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm ring-1 ring-brand-700/20">
            <ShoppingBag size={20} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
              Vanshi<span className="text-brand-600">Cart</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              Fresh Groceries
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden lg:flex items-center gap-7">
          <NavLink to="/products" className={navLinkClass}>
            All Products
          </NavLink>
          <NavLink to="/categories" className={navLinkClass}>
            Categories
          </NavLink>
        </nav>

        {/* SEARCH BAR */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md items-center relative"
        >
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fresh fruits, veggies, milk, snacks..."
              className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-20 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-brand-600 px-3.5 py-1 text-xs font-semibold text-white transition hover:bg-brand-700"
            >
              Search
            </button>
          </div>
        </form>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              {/* WISHLIST */}
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Heart size={20} strokeWidth={1.8} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* CART */}
              <Link
                to="/cart"
                aria-label="Shopping Cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <ShoppingCart size={20} strokeWidth={1.8} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white shadow-sm">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* USER PROFILE DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-1.5 pr-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-subtle transition"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-800 font-bold uppercase">
                    {user?.first_name ? user.first_name[0] : <User size={15} />}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">
                    {user?.first_name || "Account"}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* DROPDOWN MENU */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-dropdown z-50 animate-in fade-in slide-in-from-top-1"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="p-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-400">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                          <Shield size={10} /> Admin
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User size={16} className="text-slate-400" />
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <PackageCheck size={16} className="text-slate-400" />
                        My Orders
                      </Link>
                      <Link
                        to="/addresses"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User size={16} className="text-slate-400" />
                        Saved Addresses
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-brand-700 bg-brand-50/60 hover:bg-brand-50 transition mt-1"
                        >
                          <Shield size={16} className="text-brand-600" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="btn-secondary text-xs sm:text-sm py-2 px-3.5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary text-xs sm:text-sm py-2 px-3.5"
              >
                Register
              </Link>
            </div>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH & DRAWER */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-4 md:hidden animate-in fade-in slide-in-from-top-2">
          {/* MOBILE SEARCH */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groceries..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm"
              />
            </div>
          </form>

          {/* MOBILE LINKS */}
          <div className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50"
            >
              All Products
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50"
            >
              Categories
            </Link>

            {user ? (
              <>
                <div className="my-2 border-t border-slate-100" />
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart size={17} /> Cart
                  </span>
                  {cartCount > 0 && (
                    <span className="badge badge-emerald">{cartCount}</span>
                  )}
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <Heart size={17} /> Wishlist
                  </span>
                  {wishlistCount > 0 && (
                    <span className="badge badge-amber">{wishlistCount}</span>
                  )}
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-slate-50"
                >
                  <PackageCheck size={17} /> My Orders
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-slate-50"
                >
                  <User size={17} /> Profile & Settings
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-brand-800 font-bold"
                  >
                    <Shield size={17} /> Admin Panel
                  </Link>
                )}

                <div className="my-2 border-t border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-red-600 hover:bg-red-50"
                >
                  <LogOut size={17} /> Sign Out
                </button>
              </>
            ) : (
              <div className="mt-3 flex gap-2 pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary flex-1 text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary flex-1 text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
