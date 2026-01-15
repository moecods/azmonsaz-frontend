"use client";

import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, CardContent, CardHeader, CardActions } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface CardProps extends MuiCardProps {
  /**
   * Card variant
   * @default 'elevated'
   */
  variant?: 'elevated' | 'outlined' | 'flat';
  /**
   * Card title
   */
  title?: React.ReactNode;
  /**
   * Card subtitle
   */
  subtitle?: React.ReactNode;
  /**
   * Card actions (buttons, etc.)
   */
  actions?: React.ReactNode;
  /**
   * Card content
   */
  children: React.ReactNode;
  /**
   * Padding for card content
   * @default true
   */
  padding?: boolean;
}

const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== 'variant' || prop !== 'padding',
})<{ cardVariant?: 'elevated' | 'outlined' | 'flat' }>(({ theme, cardVariant = 'elevated' }) => {
  if (cardVariant === 'outlined') {
    return {
      boxShadow: 'none',
      border: `1px solid ${theme.palette.divider}`,
    };
  }
  if (cardVariant === 'flat') {
    return {
      boxShadow: 'none',
      border: 'none',
    };
  }
  return {};
});

/**
 * Card component with consistent styling and optional header/actions
 * 
 * @example
 * ```tsx
 * <Card 
 *   variant="elevated" 
 *   title="Card Title" 
 *   subtitle="Card Subtitle"
 *   actions={<Button>Action</Button>}
 * >
 *   Card content
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = 'elevated', 
    title, 
    subtitle, 
    actions, 
    children, 
    padding = true,
    ...props 
  }, ref) => {
    return (
      <StyledCard ref={ref} cardVariant={variant} {...props}>
        {title && (
          <CardHeader 
            title={title} 
            subheader={subtitle}
            titleTypographyProps={{ variant: 'h6' }}
            subheaderTypographyProps={{ variant: 'body2' }}
          />
        )}
        <CardContent sx={!padding ? { p: 0, '&:last-child': { pb: 0 } } : undefined}>
          {children}
        </CardContent>
        {actions && <CardActions>{actions}</CardActions>}
      </StyledCard>
    );
  }
);

Card.displayName = 'Card';

