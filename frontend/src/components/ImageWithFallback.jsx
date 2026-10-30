import { useState, useEffect } from "react";
import { Package } from "lucide-react";

// Known broken or 404 seed image mapping to verified high-res grocery imagery
const KNOWN_REPLACEMENTS = {
  "https://images.unsplash.com/photo-1545281572-96c1c7e6f6e6":
    "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80",
};

// Category and generic fallback images
const GENERIC_FALLBACK = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";

export default function ImageWithFallback({
  src,
  alt = "Product",
  className = "",
  containerClassName = "",
  productName = "",
  categoryName = "",
  loading = "lazy",
}) {
  const [loaded, setLoaded] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Normalize initial source with known fix
  const getInitialSrc = () => {
    if (!src) return "";
    if (KNOWN_REPLACEMENTS[src]) return KNOWN_REPLACEMENTS[src];
    // Special check for Coconut Water if URL contains the broken photo ID
    if (
      String(productName).toLowerCase().includes("coconut water") &&
      String(src).includes("photo-1545281572")
    ) {
      return KNOWN_REPLACEMENTS["https://images.unsplash.com/photo-1545281572-96c1c7e6f6e6"];
    }
    return src;
  };

  const [currentSrc, setCurrentSrc] = useState(getInitialSrc);

  useEffect(() => {
    setCurrentSrc(getInitialSrc());
    setLoaded(false);
    setErrorCount(0);
  }, [src, productName]);

  const handleError = () => {
    if (errorCount === 0) {
      // First fallback: Try verified general grocery fallback
      setErrorCount(1);
      if (String(productName).toLowerCase().includes("coconut")) {
        setCurrentSrc("https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80");
      } else {
        setCurrentSrc(GENERIC_FALLBACK);
      }
    } else {
      // Second fallback: Give up image network and show elegant vector illustration
      setErrorCount(2);
      setLoaded(true);
    }
  };

  // If permanently failed or no src provided
  if (errorCount >= 2 || !currentSrc) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center bg-emerald-50/50 p-4 text-center ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-subtle text-brand-600">
          <Package size={24} strokeWidth={1.75} />
        </div>
        <span className="mt-2 text-xs font-semibold text-slate-500 line-clamp-1 max-w-[120px]">
          {productName || alt || "Fresh Grocery"}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-slate-50 ${containerClassName}`}>
      {/* Loading Shimmer */}
      {!loaded && (
        <div className="absolute inset-0 z-0 shimmer-placeholder" />
      )}

      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`${className} transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
