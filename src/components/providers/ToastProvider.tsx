"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface Toast { id: string; type: ToastType; title: string; message?: string; }
interface ToastCtx { toast: (type: ToastType, title: string, message?: string) => void; }

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, title, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
  const COLORS = {
    success: "border-emerald-400/30 text-emerald-400",
    error: "border-red-400/30 text-red-400",
    info: "border-crown-gold/30 text-crown-gold",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[300] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id}
                 className={`glass-card border px-4 py-3 flex items-start gap-3 shadow-lg
                             animate-slide-in ${COLORS[t.type]}`}>
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-sans text-xs font-medium text-crown-ivory">{t.title}</p>
                {t.message && <p className="font-sans text-[10px] text-crown-ash mt-0.5">{t.message}</p>}
              </div>
              <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
                      className="text-crown-ash hover:text-crown-ivory transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
