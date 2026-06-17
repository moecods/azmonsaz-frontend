"use client";

import { useCallback, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { LoadingButton } from "@/components/feedback/LoadingButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { dialogTransitionProps } from "@/theme/motion";

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "error" | "warning" | "success";
  loading?: boolean;
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  open: boolean;
  resolve?: (confirmed: boolean) => void;
}

const defaultState: ConfirmDialogState = {
  open: false,
  title: "",
  message: "",
};

export function ConfirmDialog({
  state,
  onClose,
}: {
  state: ConfirmDialogState;
  onClose: (confirmed: boolean) => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <Dialog
      open={state.open}
      onClose={() => onClose(false)}
      maxWidth="xs"
      fullWidth
      TransitionProps={dialogTransitionProps(reducedMotion)}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{state.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{state.message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => onClose(false)} disabled={state.loading}>
          {state.cancelLabel ?? "لغو"}
        </Button>
        <LoadingButton
          variant="contained"
          color={state.confirmColor ?? "primary"}
          loading={state.loading}
          loadingText="در حال انجام..."
          onClick={() => onClose(true)}
        >
          {state.confirmLabel ?? "تأیید"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>(defaultState);

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        ...options,
        open: true,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback((confirmed: boolean) => {
    setState((prev) => {
      prev.resolve?.(confirmed);
      return defaultState;
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  return {
    confirm,
    setLoading,
    dialog: <ConfirmDialog state={state} onClose={handleClose} />,
  };
}
