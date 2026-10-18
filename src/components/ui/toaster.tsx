"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, X, AlertCircle, Info } from "lucide-react";

type Toast = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

type ToastContextType = {
  toasts: Toast[];
  toast: (message: string, type?: Toast["type"]) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let idCounter = 0;

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed top-4 left-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto animate-slide-in-right flex items-center gap-3 rounded-2xl bg-white shadow-xl border border-slate-200 px-4 py-3 min-w-[280px] max-w-[400px]"
          style={{ animationDuration: "0.3s" }}
        >
          {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          {t.type === "info" && <Info className="w-5 h-5 text-sky-600 shrink-0" />}
          <span className="text-sm font-medium text-slate-800 flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return a no-op context for SSR / when provider isn't mounted
    return {
      toasts: [] as Toast[],
      toast: () => {},
      dismiss: () => {},
    } as ToastContextType;
  }
  return ctx;
}
