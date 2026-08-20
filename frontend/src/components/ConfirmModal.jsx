import { AlertTriangle } from "lucide-react";

// Generic yes/no confirmation modal. Pass `tone="danger"` for destructive
// actions (red confirm button) - default is the violet brand color.
function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Never mind",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmClasses =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-500"
      : "bg-violet-600 hover:bg-violet-500";

  return (
    <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#13131b] border border-gray-800 rounded-2xl w-full max-w-sm p-6 text-center">
        <AlertTriangle className="text-amber-400 mx-auto mb-4" size={32} />
        <h3 className="text-xl font-bold">{title}</h3>
        {message && <p className="text-gray-400 mt-2 text-sm">{message}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-700 hover:bg-gray-800 py-2 rounded-lg font-semibold cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg font-semibold cursor-pointer disabled:opacity-50 ${confirmClasses}`}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
