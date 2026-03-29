"use client";

import React from 'react';
import {
  Card,
  CardContent,
  Collapse,
} from '@mui/material';

interface FilterContainerProps {
  children: React.ReactNode;
  open: boolean;
}

export function FilterContainer({ children, open }: FilterContainerProps) {
  return (
    <Collapse in={open}>
      <Card>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </Collapse>
  );
}