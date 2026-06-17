"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Toast, type ToastProps } from "@/components/feedback/Alert/Alert";

type ToastSeverity = NonNullable<ToastProps["severity"]>;

interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
}

interface ToastContextValue {
  show: (message: string, severity?: ToastSeverity) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info",
  });

  const show = useCallback((message: string, severity: ToastSeverity = "info") => {
    setState({ open: true, message, severity });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message) => show(message, "success"),
      error: (message) => show(message, "error"),
      warning: (message) => show(message, "warning"),
      info: (message) => show(message, "info"),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast
        open={state.open}
        message={state.message}
        severity={state.severity}
        onClose={() => setState((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
