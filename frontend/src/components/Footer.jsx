import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200/80 bg-white">
      {/* VALUE HIGHLIGHTS BANNER */}
      <div className="border-b border-slate-100 bg-[#f9faf8] py-8">
        <div className="container-page grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <Truck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Doorstep Delivery</h4>
              <p className="text-xs text-slate-500">Delivered directly to your home</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Quality Assured</h4>
              <p className="text-xs text-slate-500">Carefully inspected grocery items</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <RefreshCw size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Customer Support</h4>
              <p className="text-xs text-slate-500">Assistance with your grocery orders</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <HeartHandshake size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Cash on Delivery</h4>
              <p className="text-xs text-slate-500">Pay when your order arrives</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER MAIN CONTENT */}
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                <ShoppingBag size={18} strokeWidth={2.2} />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Vanshi<span className="text-brand-600">Cart</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              Your neighborhood grocery store, delivered right to your doorstep.
              Handpicked fresh fruits, farm vegetables, wholesome dairy, and pantry
              essentials.
            </p>

            <div className="mt-6 flex flex-col gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-brand-600 shrink-0" />
                <span>Pan India Delivery across major metropolitan areas</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-brand-600 shrink-0" />
                <span>support@vanshicart.com</span>
              </div>
            </div>
          </div>

          {/* SHOP COLUMN */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Categories
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <Link to="/products?category_id=1" className="hover:text-brand-700 transition">
                  Fresh Fruits
                </Link>
              </li>
              <li>
                <Link to="/products?category_id=2" className="hover:text-brand-700 transition">
                  Farm Vegetables
                </Link>
              </li>
              <li>
                <Link to="/products?category_id=3" className="hover:text-brand-700 transition">
                  Dairy & Eggs
                </Link>
              </li>
              <li>
                <Link to="/products?category_id=4" className="hover:text-brand-700 transition">
                  Snacks & Biscuits
                </Link>
              </li>
              <li>
                <Link to="/products?category_id=5" className="hover:text-brand-700 transition">
                  Juices & Beverages
                </Link>
              </li>
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Account & Orders
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <Link to="/cart" className="hover:text-brand-700 transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-brand-700 transition">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-brand-700 transition">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/addresses" className="hover:text-brand-700 transition">
                  Delivery Addresses
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-brand-700 transition">
                  Profile Details
                </Link>
              </li>
            </ul>
          </div>

          {/* PLATFORM TECH */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Built with React, Vite, Tailwind CSS, FastAPI, and PostgreSQL. Demonstrates
              full e-commerce lifecycle with JWT authorization.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 border border-brand-200">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                API Connected & Healthy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <div className="container-page flex flex-col items-center justify-between gap-3 sm:flex-row">
          <span>
            © {new Date().getFullYear()} VanshiCart Grocery Inc. All rights reserved.
          </span>
          <span className="text-slate-400">
            Crafted for fresh living and simple everyday shopping.
          </span>
        </div>
      </div>
    </footer>
  );
}
