import 'react-multi-date-picker/styles/layouts/mobile.css';
import 'react-multi-date-picker/styles/colors/purple.css';
import { Box, Typography } from '@mui/material';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/locales/persian_fa';
import persianCalendar from 'react-date-object/calendars/persian';
import type { Value, DateObject } from 'react-multi-date-picker';

interface PersianDatePickerProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  error?: boolean;
  errorMessage?: string;
}

const datePickerStyles = {
  width: '100%',
  padding: '16.5px 14px',
  border: '1px solid rgba(0, 0, 0, 0.23)',
  borderRadius: '4px',
  fontSize: '1rem',
};

const errorStyles = {
  ...datePickerStyles,
  border: '1px solid #d32f2f',
};

export function PersianDatePicker({
  label,
  value,
  onChange,
  error = false,
  errorMessage,
}: PersianDatePickerProps) {
  const handleChange = (date: Value) => {
    if (date) {
      const dateObj = date as DateObject;
      // Convert Persian date to Gregorian (miladi) date
      const gregorianDate = dateObj.toDate();
      // Return date in YYYY-MM-DD format (Gregorian/Miladi)
      const year = gregorianDate.getFullYear();
      const month = String(gregorianDate.getMonth() + 1).padStart(2, '0');
      const day = String(gregorianDate.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange(null);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          color: error ? 'error.main' : 'text.secondary',
        }}
      >
        {label}
      </Typography>
      <DatePicker
        value={value ? new Date(value) : undefined}
        onChange={handleChange}
        locale={persian}
        calendar={persianCalendar}
        format="YYYY/MM/DD"
        containerStyle={{ width: '100%' }}
        inputClass="form-control"
        style={error ? errorStyles : datePickerStyles}
      />
      {error && errorMessage && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
}
