import { TextField } from '@mui/material';

interface PersianTimePickerProps {
  label: string;
  value: string | null; // Format: "HH:mm"
  onChange: (value: string | null) => void;
  error?: boolean;
  errorMessage?: string;
}

export function PersianTimePicker({
  label,
  value,
  onChange,
  error = false,
  errorMessage,
}: PersianTimePickerProps) {
  // Convert "HH:mm" to "HH:mm" format for input type="time"
  const timeValue = value || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue === '' ? null : newValue);
  };

  return (
    <TextField
      label={label}
      type="time"
      value={timeValue}
        onChange={handleChange}
      error={error}
      helperText={error ? errorMessage : undefined}
      fullWidth
      InputLabelProps={{
        shrink: true,
      }}
      inputProps={{
        step: 60, // 1 minute
      }}
    />
  );
}
