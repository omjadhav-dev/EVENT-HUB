import { useContext } from "react";
import { ToastContext } from "./toastContextObject";

// Usage: const toast = useToast(); toast.success("Booked!"); toast.error("Oops");
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
