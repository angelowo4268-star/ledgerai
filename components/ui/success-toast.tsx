"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface SuccessToastProps {
  message: string | null;
  onDismiss?: () => void;
}

export function SuccessToast({ message, onDismiss }: SuccessToastProps) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onDismiss?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg",
        "animate-fade-in sm:left-auto sm:right-6"
      )}
      role="status"
    >
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
      <p className="text-sm font-medium text-emerald-800">{message}</p>
    </div>
  );
}

export function useSuccessToast() {
  const [message, setMessage] = useState<string | null>(null);

  return {
    message,
    show: (text: string) => setMessage(text),
    dismiss: () => setMessage(null),
  };
}
