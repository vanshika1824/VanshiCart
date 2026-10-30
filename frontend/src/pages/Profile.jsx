import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  PackageCheck,
  Heart,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="container-page py-8 sm:py-12">
      {/* HEADER */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
          <User size={13} />
          <span>My Account</span>
        </div>
        <h1 className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
          Personal Profile
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Manage your personal information, saved addresses, and active orders.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: PROFILE CARD */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-card">
            {/* AVATAR + NAME BANNER */}
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-brand-100 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 border-2 border-brand-100 text-brand-700 text-2xl font-black uppercase shadow-subtle">
                  {user?.first_name ? user.first_name[0] : "U"}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-brand-800 border border-brand-200">
                      <Shield size={11} /> Admin
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                  {user?.email}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <Sparkles size={11} />
                  <span>VanshiCart Verified Member</span>
                </div>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <User size={14} /> Full Name
                </span>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {user?.first_name} {user?.last_name}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Mail size={14} /> Email Address
                </span>
                <p className="mt-1 text-sm font-bold text-slate-800 truncate">
                  {user?.email}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Phone size={14} /> Phone Number
                </span>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {user?.phone_number || "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Shield size={14} /> Account Role
                </span>
                <p className="mt-1 text-sm font-bold text-slate-800 capitalize">
                  {user?.role || "Customer"}
                </p>
              </div>
            </div>

            {/* LOGOUT */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Need to switch accounts?
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100/60 transition"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SHORTCUT TILES */}
        <div className="space-y-4 lg:col-span-5">
          <Link
            to="/orders"
            className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card hover:border-slate-300 hover:shadow-card-hover transition"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <PackageCheck size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition">
                  My Orders
                </h3>
                <p className="text-xs text-slate-400">
                  Track delivery progress and order receipts
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/addresses"
            className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card hover:border-slate-300 hover:shadow-card-hover transition"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition">
                  Delivery Addresses
                </h3>
                <p className="text-xs text-slate-400">
                  Manage saved home and work locations
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/wishlist"
            className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card hover:border-slate-300 hover:shadow-card-hover transition"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <Heart size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition">
                  Saved Wishlist
                </h3>
                <p className="text-xs text-slate-400">
                  Favorites saved for future grocery runs
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition" />
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="group flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50/50 p-5 shadow-card hover:bg-brand-50 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-brand-900">
                    Admin Management Console
                  </h3>
                  <p className="text-xs text-brand-700">
                    Manage catalog products, categories, and brands
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-brand-700 group-hover:translate-x-1 transition" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
