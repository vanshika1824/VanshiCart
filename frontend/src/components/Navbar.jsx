import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  ShoppingBag,
  ChevronDown,
  Layers,
  LocateFixed,
  Check,
  PackageCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getCart } from "../services/cartService";
import { getWishlist } from "../services/wishlistService";

const DEFAULT_LOCATION = "Connaught Place, New Delhi - 110001";

const POPULAR_LOCATIONS = [
  { area: "Connaught Place", city: "New Delhi", pincode: "110001" },
  { area: "Indiranagar", city: "Bengaluru", pincode: "560038" },
  { area: "Bandra West", city: "Mumbai", pincode: "400050" },
  { area: "Sector 62", city: "Noida", pincode: "201301" },
  { area: "Salt Lake Sector V", city: "Kolkata", pincode: "700064" },
  { area: "Jubilee Hills", city: "Hyderabad", pincode: "500033" },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Delivery Location State (persisted locally)
  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    return (
      localStorage.getItem("vanshicart_delivery_location") || DEFAULT_LOCATION
    );
  });
  const [customLocationInput, setCustomLocationInput] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);

  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const modalInputRef = useRef(null);

  // Fetch cart & wishlist count
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
            setCartCount(
              items.reduce(
                (sum, item) => sum + (Number(item.quantity) || 1),
                0
              )
            );
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
        // Silently ignore in header
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

  // Close menus and modal on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setLocationModalOpen(false);
  }, [location.pathname]);

  // Handle focus when location modal opens
  useEffect(() => {
    if (locationModalOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 50);
    }
  }, [locationModalOpen]);

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && locationModalOpen) {
        setLocationModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [locationModalOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
    } else {
      navigate("/products");
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    signOut();
    setUserDropdownOpen(false);
    navigate("/");
  };

  const saveLocation = (newLoc) => {
    const trimmed = newLoc.trim();
    if (!trimmed) return;
    setDeliveryLocation(trimmed);
    localStorage.setItem("vanshicart_delivery_location", trimmed);
    setLocationModalOpen(false);
    setCustomLocationInput("");
    toast.success(`Delivery address set to ${trimmed}`);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.info("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDetectingLocation(false);
        const lat = position.coords.latitude.toFixed(2);
        const lon = position.coords.longitude.toFixed(2);
        const loc = `Current Location (${lat}°N, ${lon}°E)`;
        saveLocation(loc);
      },
      () => {
        setDetectingLocation(false);
        toast.info("Location access denied. Please select from popular areas.");
      },
      { timeout: 8000 }
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-all shadow-subtle">
      {/* MAIN DESKTOP & TABLET NAV BAR */}
      <div className="container-page py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3 lg:gap-5">
          {/* LEFT: LOGO + LOCATION SELECTOR */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-2 transition-transform active:scale-98"
              aria-label="VanshiCart Home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm ring-1 ring-brand-700/20">
                <ShoppingBag size={20} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                  Vanshi<span className="text-brand-600">Cart</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  Grocery
                </span>
              </div>
            </Link>

            {/* VERTICAL DIVIDER */}
            <div className="hidden sm:block h-7 w-[1px] bg-slate-200" />

            {/* LOCATION SELECTOR (BLINKIT STYLE) */}
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="group flex items-center gap-2 text-left rounded-xl px-2 sm:px-2.5 py-1.5 hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              title="Change Delivery Location"
              aria-label="Select Delivery Location"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-brand-700 group-hover:bg-brand-100 transition">
                <MapPin size={17} className="text-brand-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-none">
                  Deliver to
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[110px] sm:max-w-[140px] lg:max-w-[170px]">
                    {deliveryLocation.split("-")[0].trim()}
                  </span>
                  <ChevronDown
                    size={14}
                    className="text-slate-400 group-hover:text-slate-700 transition shrink-0"
                  />
                </div>
              </div>
            </button>
          </div>

          {/* CENTER: SEARCH BAR (DESKTOP & TABLET) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-4 items-center relative"
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
                placeholder="Search 'milk', 'fresh apples', 'bread', 'snacks'..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-20 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-brand-700 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>

          {/* RIGHT: CATEGORIES + WISHLIST + CART + AUTH */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* CATEGORIES NAV LINK */}
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "text-brand-700 font-bold bg-brand-50"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                }`
              }
            >
              <Layers size={17} className="text-slate-400" />
              <span>Categories</span>
            </NavLink>

            {/* WISHLIST (WHEN LOGGED IN) */}
            {user && (
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <Heart size={20} strokeWidth={1.8} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* SHOPPING CART BUTTON (BLINKIT HIGH VISIBILITY STYLE) */}
            <Link
              to="/cart"
              className="flex items-center gap-2 sm:gap-2.5 rounded-xl bg-brand-600 px-3 sm:px-4 py-2 text-white shadow-sm hover:bg-brand-700 transition active:scale-95"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingCart size={19} strokeWidth={2.2} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-slate-900 shadow">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
                  My Cart
                </span>
                <span className="text-xs font-black text-white mt-0.5">
                  {cartCount} {cartCount === 1 ? "Item" : "Items"}
                </span>
              </div>
            </Link>

            {/* AUTH / USER PROFILE */}
            {user ? (
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

                {/* USER DROPDOWN MENU */}
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
                        <MapPin size={16} className="text-slate-400" />
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
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-3.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-3.5 hidden sm:inline-flex"
                >
                  Register
                </Link>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 md:hidden transition"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH BAR (ALWAYS VISIBLE ON MOBILE) */}
        <div className="mt-2.5 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fruits, veggies, milk, snacks..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-2 pl-9 pr-16 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-4 md:hidden animate-in fade-in slide-in-from-top-2 shadow-lg">
          <div className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-slate-50"
            >
              <Layers size={17} className="text-slate-400" />
              <span>Browse Categories</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setLocationModalOpen(true);
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-slate-50"
            >
              <span className="flex items-center gap-2.5">
                <MapPin size={17} className="text-brand-600" />
                <span>Delivery Location</span>
              </span>
              <span className="text-xs font-bold text-slate-400 truncate max-w-[140px]">
                {deliveryLocation.split("-")[0].trim()}
              </span>
            </button>

            {user ? (
              <>
                <div className="my-2 border-t border-slate-100" />
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingCart size={17} className="text-slate-400" />
                    <span>My Cart</span>
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
                  <span className="flex items-center gap-2.5">
                    <Heart size={17} className="text-slate-400" />
                    <span>Wishlist</span>
                  </span>
                  {wishlistCount > 0 && (
                    <span className="badge badge-amber">{wishlistCount}</span>
                  )}
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-slate-50"
                >
                  <PackageCheck size={17} className="text-slate-400" />
                  <span>My Orders</span>
                </Link>

                <Link
                  to="/addresses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-slate-50"
                >
                  <MapPin size={17} className="text-slate-400" />
                  <span>Saved Addresses</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-slate-50"
                >
                  <User size={17} className="text-slate-400" />
                  <span>Profile & Account</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl bg-brand-50 px-3 py-2.5 text-brand-800 font-bold"
                  >
                    <Shield size={17} className="text-brand-600" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div className="my-2 border-t border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-red-600 hover:bg-red-50"
                >
                  <LogOut size={17} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="mt-3 flex gap-2 pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary flex-1 text-center py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary flex-1 text-center py-2"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOCATION SELECTOR MODAL (BLINKIT STYLE) */}
      {locationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-modal-title"
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-brand-700">
                  <MapPin size={20} className="text-brand-600" />
                </div>
                <div>
                  <h3
                    id="location-modal-title"
                    className="text-base sm:text-lg font-black text-slate-900"
                  >
                    Select Delivery Location
                  </h3>
                  <p className="text-xs text-slate-400">
                    Choose your area to see accurate delivery details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* CUSTOM LOCATION INPUT */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveLocation(customLocationInput);
              }}
              className="mt-5"
            >
              <label className="text-xs font-bold text-slate-700">
                Enter Area, Street or Pincode
              </label>
              <div className="relative mt-1.5 flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    ref={modalInputRef}
                    type="text"
                    value={customLocationInput}
                    onChange={(e) => setCustomLocationInput(e.target.value)}
                    placeholder="e.g. Indiranagar, 560038"
                    className="input pl-10 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!customLocationInput.trim()}
                  className="btn-primary py-2.5 px-4 text-xs font-bold shrink-0 disabled:opacity-50"
                >
                  Set Location
                </button>
              </div>
            </form>

            {/* DETECT MY LOCATION BUTTON */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50/60 py-2.5 px-4 text-xs font-bold text-brand-800 hover:bg-brand-100/70 transition"
              >
                <LocateFixed
                  size={16}
                  className={
                    detectingLocation
                      ? "animate-spin text-brand-600"
                      : "text-brand-600"
                  }
                />
                <span>
                  {detectingLocation
                    ? "Detecting GPS location..."
                    : "Use Current Location (GPS)"}
                </span>
              </button>
            </div>

            {/* POPULAR LOCALITIES SECTION */}
            <div className="mt-6">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                Popular Delivery Areas
              </p>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {POPULAR_LOCATIONS.map((loc) => {
                  const full = `${loc.area}, ${loc.city} - ${loc.pincode}`;
                  const isSelected = deliveryLocation === full;

                  return (
                    <button
                      key={loc.pincode}
                      type="button"
                      onClick={() => saveLocation(full)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                        isSelected
                          ? "border-brand-500 bg-emerald-50/60 text-brand-900 shadow-sm"
                          : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                            isSelected
                              ? "bg-brand-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <MapPin size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">
                            {loc.area}, {loc.city}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Pincode: {loc.pincode}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Selected: {deliveryLocation.split("-")[0].trim()}</span>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="font-bold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
