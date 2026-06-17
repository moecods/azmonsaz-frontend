import type { UseMutationOptions } from "@tanstack/react-query";

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
};

export function mutationSuccessToast(
  toast: ToastApi,
  message: string
): Pick<UseMutationOptions<unknown, Error, unknown>, "onSuccess"> {
  return {
    onSuccess: () => {
      toast.success(message);
    },
  };
}

export function mutationErrorToast(
  toast: ToastApi,
  fallback = "خطا در انجام عملیات"
): Pick<UseMutationOptions<unknown, Error, unknown>, "onError"> {
  return {
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : fallback);
    },
  };
}

export function withMutationToasts(
  toast: ToastApi,
  successMessage: string,
  errorFallback?: string
): Pick<UseMutationOptions<unknown, Error, unknown>, "onSuccess" | "onError"> {
  return {
    ...mutationSuccessToast(toast, successMessage),
    ...mutationErrorToast(toast, errorFallback),
  };
}
