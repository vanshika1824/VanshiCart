import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { apiError } from "../services/api";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await signIn(form);
      const destination = location.state?.from || "/products";
      navigate(destination, { replace: true });
    } catch (e) {
      setError(apiError(e, e.message || "Invalid email or password."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page flex min-h-[75vh] items-center justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        {/* LOGO & HEADING */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-card mb-4">
            <ShoppingBag size={28} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome to VanshiCart
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Sign in to access your cart, saved addresses, and past orders.
          </p>
        </div>

        {/* CARD */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-card">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative mt-1.5">
                <Lock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-primary mt-6 w-full py-3 text-sm font-bold shadow-card-hover"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span>Sign In to Account</span>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Don't have an account yet? </span>
            <Link
              to="/register"
              className="font-bold text-brand-700 hover:text-brand-800 underline underline-offset-2"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
