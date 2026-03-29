"use client";

import React from 'react';
import {
  Table as MuiTable,
  TableProps as MuiTableProps,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TablePagination,
  Box,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface TableColumn<T = any> {
  /**
   * Column ID (key)
   */
  id: string;
  /**
   * Column label
   */
  label: string;
  /**
   * Column width
   */
  width?: number | string;
  /**
   * Column alignment
   */
  align?: 'left' | 'right' | 'center';
  /**
   * Custom render function
   */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /**
   * Sortable column
   */
  sortable?: boolean;
}

export interface TableProps<T = any> extends Omit<MuiTableProps, 'children'> {
  /**
   * Table columns configuration
   */
  columns: TableColumn<T>[];
  /**
   * Table data (rows)
   */
  data: T[];
  /**
   * Loading state
   * @default false
   */
  loading?: boolean;
  /**
   * Empty state message
   */
  emptyMessage?: string;
  /**
   * Show pagination
   * @default false
   */
  pagination?: boolean;
  /**
   * Current page (for pagination)
   */
  page?: number;
  /**
   * Rows per page
   */
  rowsPerPage?: number;
  /**
   * Total rows count
   */
  totalRows?: number;
  /**
   * On page change handler
   */
  onPageChange?: (page: number) => void;
  /**
   * On rows per page change handler
   */
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  /**
   * Table size
   */
  size?: 'small' | 'medium';
  /**
   * Sticky header
   * @default false
   */
  stickyHeader?: boolean;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  width: '100%',
  overflowX: 'auto',
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.grey[50],
    '& .MuiTableCell-root': {
      fontWeight: 600,
      color: theme.palette.text.primary,
      borderBottom: `2px solid ${theme.palette.divider}`,
    },
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },

      '&:last-child .MuiTableCell-root': {
        borderBottom: 'none',
      },
    },
  },
}));

/**
 * Table component with pagination and loading states
 * 
 * @example
 * ```tsx
 * <Table
 *   columns={[
 *     { id: 'name', label: 'Name' },
 *     { id: 'email', label: 'Email' },
 *   ]}
 *   data={users}
 *   loading={isLoading}
 *   pagination
 *   page={page}
 *   rowsPerPage={10}
 *   totalRows={100}
 *   onPageChange={setPage}
 * />
 * ```
 */
export function Table<T = any>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  pagination = false,
  page = 0,
  rowsPerPage = 10,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  size = 'medium',
  stickyHeader = false,
  ...props
}: TableProps<T>) {
  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10));
  };

  const getCellValue = (row: T, column: TableColumn<T>, index: number) => {
    if (column.render) {
      return column.render((row as any)[column.id], row, index);
    }
    return (row as any)[column.id] ?? '-';
  };

  return (
    <Box>
      <StyledTableContainer>
        <MuiTable
          size={size}
          stickyHeader={stickyHeader}
          {...props}
          sx={{ width: '100%' }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Stack spacing={2} alignItems="center">
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index} hover>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      style={{ width: column.width }}
                    >
                      {getCellValue(row, column, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </StyledTableContainer>
      {pagination && (
        <TablePagination
          component="div"
          count={totalRows ?? data.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page:"
        />
      )}
    </Box>
  );
}

