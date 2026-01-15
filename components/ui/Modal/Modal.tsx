"use client";

import React from 'react';
import {
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

export interface ModalProps extends Omit<DialogProps, 'title'> {
  /**
   * Modal title
   */
  title?: React.ReactNode;
  /**
   * Modal content
   */
  children: React.ReactNode;
  /**
   * Modal actions (buttons, etc.)
   */
  actions?: React.ReactNode;
  /**
   * Show close button
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Full width modal
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Max width
   * @default 'sm'
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /**
   * On close handler
   */
  onClose?: () => void;
  /**
   * Open state
   */
  open: boolean;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 12,
    padding: theme.spacing(1),
  },
  '& .MuiDialogTitle-root': {
    padding: theme.spacing(2, 3),
    paddingBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2, 3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2, 3),
    paddingTop: theme.spacing(1),
  },
}));

/**
 * Modal/Dialog component with consistent styling
 * 
 * @example
 * ```tsx
 * <Modal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Confirm Action"
 *   actions={
 *     <>
 *       <Button onClick={() => setOpen(false)}>Cancel</Button>
 *       <Button variant="contained" onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   Are you sure you want to proceed?
 * </Modal>
 * ```
 */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      title,
      children,
      actions,
      showCloseButton = true,
      fullWidth = false,
      maxWidth = 'sm',
      onClose,
      open,
      ...props
    },
    ref
  ) => {
    return (
      <StyledDialog
        ref={ref}
        open={open}
        onClose={onClose}
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        {...props}
      >
        {title && (
          <DialogTitle>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {showCloseButton && onClose && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                size="small"
                sx={{
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </DialogTitle>
        )}
        <DialogContent>{children}</DialogContent>
        {actions && <DialogActions>{actions}</DialogActions>}
      </StyledDialog>
    );
  }
);

Modal.displayName = 'Modal';

