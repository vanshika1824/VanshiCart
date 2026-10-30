import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  User,
  Mail,
  Lock,
  Phone,
  Image,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

import { register } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { apiError } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    profile_image: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await register({
        ...form,
        phone_number: form.phone_number.trim() || null,
        profile_image: form.profile_image.trim() || null,
      });

      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (e) {
      setError(apiError(e, "Registration failed. Please check your details."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12 sm:py-16">
      <div className="w-full max-w-lg">
        {/* LOGO & HEADING */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-card mb-4">
            <ShoppingBag size={28} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create VanshiCart Account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Join thousands enjoying fresh groceries delivered straight to their doorstep.
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  First Name *
                </label>
                <div className="relative mt-1.5">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vanshika"
                    value={form.first_name}
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Last Name *
                </label>
                <div className="relative mt-1.5">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maru"
                    value={form.last_name}
                    onChange={(e) =>
                      setForm({ ...form, last_name: e.target.value })
                    }
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Email Address *
              </label>
              <div className="relative mt-1.5">
                <Mail
                  size={16}
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
              <label className="block text-xs font-bold text-slate-700">
                Phone Number (Optional)
              </label>
              <div className="relative mt-1.5">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={form.phone_number}
                  onChange={(e) =>
                    setForm({ ...form, phone_number: e.target.value })
                  }
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Create Password *
              </label>
              <div className="relative mt-1.5">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  required
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Profile Image URL (Optional)
              </label>
              <div className="relative mt-1.5">
                <Image
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={form.profile_image}
                  onChange={(e) =>
                    setForm({ ...form, profile_image: e.target.value })
                  }
                  className="input pl-10"
                />
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
                  <span>Creating Account...</span>
                </span>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-brand-700 hover:text-brand-800 underline underline-offset-2"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
