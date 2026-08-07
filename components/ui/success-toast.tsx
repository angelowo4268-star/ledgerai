"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

interface SuccessToastProps {
  message: string | null;
  variant?: ToastVariant;
  onDismiss?: () => void;
}

export function SuccessToast({
  message,
  variant = "success",
  onDismiss,
}: SuccessToastProps) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onDismiss?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  const isError = variant === "error";

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-lg",
        "animate-fade-in sm:left-auto sm:right-6",
        isError
          ? "border-red-200 bg-red-50"
          : "border-emerald-200 bg-emerald-50"
      )}
      role="status"
    >
      {isError ? (
        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
      ) : (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
      )}
      <p
        className={cn(
          "text-sm font-medium",
          isError ? "text-red-800" : "text-emerald-800"
        )}
      >
        {message}
      </p>
    </div>
  );
}

export function useSuccessToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<ToastVariant>("success");

  return {
    message,
    variant,
    show: (text: string) => {
      setVariant("success");
      setMessage(text);
    },
    showError: (text: string) => {
      setVariant("error");
      setMessage(text);
    },
    dismiss: () => setMessage(null),
  };
}
