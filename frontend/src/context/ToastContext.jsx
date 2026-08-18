import { useCallback, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { ToastContext } from "./toastContextObject";

const STYLES = {
  success: {
    icon: CheckCircle2,
    ring: "ring-emerald-500/40",
    bar: "bg-emerald-400",
    iconColor: "text-emerald-400",
  },
  error: {
    icon: XCircle,
    ring: "ring-red-500/40",
    bar: "bg-red-400",
    iconColor: "text-red-400",
  },
  info: {
    icon: Info,
    ring: "ring-violet-500/40",
    bar: "bg-violet-400",
    iconColor: "text-violet-400",
  },
};

function ToastItem({ toast, onDismiss }) {
  const { icon: Icon, ring, bar, iconColor } = STYLES[toast.type] || STYLES.info;

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative w-80 max-w-[90vw] overflow-hidden rounded-2xl bg-[#15151f]/95 backdrop-blur-md border border-gray-800 shadow-2xl ring-1 ${ring} animate-[toast-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)]`}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={`${iconColor} shrink-0 mt-0.5`} size={22} />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="font-semibold text-white text-sm">{toast.title}</p>
          )}
          <p className="text-gray-300 text-sm mt-0.5 break-words">{toast.message}</p>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-gray-500 hover:text-white transition cursor-pointer shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Countdown bar */}
      <div
        className={`h-1 ${bar}`}
        style={{
          animation: `toast-shrink ${toast.duration}ms linear forwards`,
        }}
      />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message, opts = {}) => {
      const id = ++idRef.current;
      const duration = opts.duration ?? 4000;
      setToasts((prev) => [...prev, { id, type, message, title: opts.title, duration }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const toast = {
    success: (message, opts) => push("success", message, opts),
    error: (message, opts) => push("error", message, opts),
    info: (message, opts) => push("info", message, opts),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
