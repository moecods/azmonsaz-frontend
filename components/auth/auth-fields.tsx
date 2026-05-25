"use client";

import { useState } from "react";
import {
  IconButton,
  InputAdornment,
  TextField,
  useTheme,
  type TextFieldProps,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { authPageSx } from "@/components/auth/auth-layout";

const fieldSx = authPageSx.field;

function VisibilityToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <IconButton
      aria-label={show ? "مخفی کردن رمز" : "نمایش رمز"}
      onClick={onToggle}
      edge="end"
      size="small"
      tabIndex={-1}
    >
      {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
    </IconButton>
  );
}

export function PhoneField({
  "data-cy": dataCy,
  showCountryPrefix = true,
  ...props
}: TextFieldProps & { showCountryPrefix?: boolean }) {
  return (
    <TextField
      type="tel"
      fullWidth
      dir="ltr"
      inputProps={{ "data-cy": dataCy, inputMode: "tel", autoComplete: "tel" }}
      InputProps={
        showCountryPrefix
          ? {
              startAdornment: (
                <InputAdornment position="start">
                  <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>+98</span>
                </InputAdornment>
              ),
            }
          : undefined
      }
      sx={fieldSx}
      {...props}
    />
  );
}

export function PasswordField({
  "data-cy": dataCy,
  autoComplete = "current-password",
  InputProps: inputPropsProp,
  sx,
  ...props
}: TextFieldProps) {
  const [show, setShow] = useState(false);
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const visibilityAdornment = (
    <InputAdornment position="end" sx={{ ml: 0, mr: 0 }}>
      <VisibilityToggle show={show} onToggle={() => setShow((v) => !v)} />
    </InputAdornment>
  );

  return (
    <TextField
      fullWidth
      dir="ltr"
      type={show ? "text" : "password"}
      autoComplete={autoComplete}
      inputProps={{ "data-cy": dataCy, ...props.inputProps }}
      InputProps={{
        ...inputPropsProp,
        endAdornment: visibilityAdornment,
      }}
      sx={[
        fieldSx,
        /* RTL app + LTR input: reserve space on the right for the eye icon */
        {
          "& .MuiOutlinedInput-root": {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
          "& .MuiOutlinedInput-input": {
            paddingInlineEnd: "44px",
            paddingInlineStart: "14px",
          },
        },
        ...(sx ? [sx] : []),
      ]}
      {...props}
    />
  );
}

export function OtpCodeField({
  "data-cy": dataCy,
  ...props
}: TextFieldProps) {
  return (
    <TextField
      fullWidth
      dir="ltr"
      placeholder="• • • • • •"
      inputProps={{
        "data-cy": dataCy,
        maxLength: 6,
        inputMode: "numeric",
        style: { letterSpacing: "0.45em", textAlign: "center", fontSize: "1.25rem" },
      }}
      sx={fieldSx}
      {...props}
    />
  );
}
