import React from 'react';
import { Check, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ToastNotification: React.FC = () => {
  const { toast, dismissToast } = useStore();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-[#1C1A1D]/12 bg-[#1C1A1D] px-4 py-3 text-white shadow-xl"
    >
      <Check className="h-4 w-4 shrink-0 text-[#F2A6B4]" />
      <p className="text-xs font-medium leading-snug sm:text-sm">{toast.text}</p>
      {toast.actionLabel && toast.onAction && (
        <button
          type="button"
          onClick={() => {
            toast.onAction?.();
            dismissToast();
          }}
          className="ml-1 shrink-0 text-xs font-semibold text-[#F5B0BE] underline underline-offset-2 hover:text-white cursor-pointer"
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={dismissToast}
        aria-label="Закрыть уведомление"
        className="ml-1 shrink-0 text-white/60 hover:text-white cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
