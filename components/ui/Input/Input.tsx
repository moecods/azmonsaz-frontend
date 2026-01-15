"use client";

import React from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  /**
   * Input variant
   * @default 'outlined'
   */
  variant?: 'outlined' | 'filled' | 'standard';
  /**
   * Show password toggle (only for type="password")
   * @default false
   */
  showPasswordToggle?: boolean;
  /**
   * Start adornment (icon or text)
   */
  startAdornment?: React.ReactNode;
  /**
   * End adornment (icon or text)
   */
  endAdornment?: React.ReactNode;
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiFilledInput-root': {
    borderRadius: 8,
    '&:before': {
      borderBottom: 'none',
    },
    '&:hover:before': {
      borderBottom: 'none',
    },
    '&:after': {
      borderBottom: '2px solid',
      borderBottomColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-root': {
    fontSize: '1rem',
  },
}));

/**
 * Input component with consistent styling and password toggle
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   fullWidth
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'outlined',
      type = 'text',
      showPasswordToggle = false,
      startAdornment,
      endAdornment,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    const handleTogglePassword = () => {
      setShowPassword((prev) => !prev);
    };

    const inputType = isPassword && showPassword ? 'text' : type;

    const inputProps: TextFieldProps['InputProps'] = {};

    if (startAdornment) {
      inputProps.startAdornment = (
        <InputAdornment position="start">{startAdornment}</InputAdornment>
      );
    }

    if (isPassword && showPasswordToggle) {
      inputProps.endAdornment = (
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={handleTogglePassword}
            edge="end"
            size="small"
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </InputAdornment>
      );
    } else if (endAdornment) {
      inputProps.endAdornment = (
        <InputAdornment position="end">{endAdornment}</InputAdornment>
      );
    }

    return (
      <StyledTextField
        ref={ref}
        variant={variant}
        type={inputType}
        InputProps={inputProps}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

