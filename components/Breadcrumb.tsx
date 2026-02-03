"use client";

import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import HomeIcon from '@mui/icons-material/Home';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = React.memo(function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <MuiBreadcrumbs
      separator={<NavigateBeforeIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <Link
        component="button"
        variant="body2"
        onClick={() => handleClick('/dashboard')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        <HomeIcon fontSize="small" />
        داشبورد
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast || !item.href) {
          return (
            <Typography key={index} color="text.primary" variant="body2">
              {item.label}
            </Typography>
          );
        }
        return (
          <Link
            key={index}
            component="button"
            variant="body2"
            onClick={() => item.href && handleClick(item.href)}
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
});

export default Breadcrumb;

