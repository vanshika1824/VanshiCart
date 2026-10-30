import { Link } from "react-router-dom";
import {
  Package,
  Tags,
  Store,
  Shield,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const cards = [
    {
      icon: Package,
      title: "Products Catalog",
      description: "Add new products, adjust inventory stock, prices, and deactivate items.",
      path: "/admin/products",
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      icon: Tags,
      title: "Grocery Categories",
      description: "Manage supermarket departments like Fruits, Vegetables, Dairy, Snacks.",
      path: "/admin/categories",
      color: "text-blue-700 bg-blue-50",
    },
    {
      icon: Store,
      title: "Brand Partners",
      description: "Manage suppliers and brand labels such as FreshFarm, Amul, Tropicana, Lays.",
      path: "/admin/brands",
      color: "text-purple-700 bg-purple-50",
    },
  ];

  return (
    <div className="container-page py-10 sm:py-14">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 border border-brand-200">
            <Shield size={12} className="text-brand-600" />
            <span>Administrator Console</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Store Administration
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 max-w-xl">
            Control the catalog, modify inventory, and manage database records
            via protected FastAPI routes.
          </p>
        </div>

        <Link to="/products" className="btn-secondary text-xs sm:text-sm">
          <span>View Public Storefront</span>
          <ExternalLink size={15} />
        </Link>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid gap-6 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.path}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card hover:border-slate-300 hover:shadow-card-hover transition-all"
            >
              <div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.color}`}
                >
                  <Icon size={24} />
                </div>
                <h2 className="mt-5 text-lg font-black text-slate-900 group-hover:text-brand-700 transition">
                  {card.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-brand-700">
                <span>Manage records</span>
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
