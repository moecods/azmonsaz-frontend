import { useState, useCallback } from 'react';

export interface UseDialogReturn {
  /**
   * Open state
   */
  open: boolean;
  /**
   * Open dialog
   */
  openDialog: () => void;
  /**
   * Close dialog
   */
  closeDialog: () => void;
  /**
   * Toggle dialog
   */
  toggleDialog: () => void;
}

/**
 * Custom hook for managing dialog state
 * 
 * @param initialOpen - Initial open state
 * @returns Dialog state and handlers
 * 
 * @example
 * ```tsx
 * const dialog = useDialog();
 * 
 * return (
 *   <>
 *     <Button onClick={dialog.openDialog}>Open</Button>
 *     <Dialog open={dialog.open} onClose={dialog.closeDialog}>
 *       Content
 *     </Dialog>
 *   </>
 * );
 * ```
 */
export function useDialog(initialOpen: boolean = false): UseDialogReturn {
  const [open, setOpen] = useState(initialOpen);

  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const toggleDialog = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return {
    open,
    openDialog,
    closeDialog,
    toggleDialog,
  };
}

