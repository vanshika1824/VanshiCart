import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl p-4 text-sm font-medium shadow-card-hover border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "error"
                ? "bg-red-900 text-white border-red-800"
                : t.type === "info"
                ? "bg-slate-900 text-white border-slate-800"
                : "bg-forest-900 text-white border-emerald-950"
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === "error" ? (
                <AlertCircle className="text-red-400 shrink-0" size={19} />
              ) : t.type === "info" ? (
                <Info className="text-cyan-400 shrink-0" size={19} />
              ) : (
                <CheckCircle2 className="text-emerald-400 shrink-0" size={19} />
              )}
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/60 hover:text-white p-1 rounded-lg transition"
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if not inside provider
    return {
      success: (msg) => alert(msg),
      error: (msg) => alert(msg),
      info: (msg) => alert(msg),
    };
  }
  return context.toast;
};
