import "@emotion/react";
import { Theme as MuiTheme } from "@mui/material/styles";

declare module "@emotion/react" {
  export interface Theme extends MuiTheme {
    // Add custom theme properties here if needed
    customProperty?: string;
  }
}


