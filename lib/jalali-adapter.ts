import dayjs from 'dayjs';
import jalali from 'jalali-dayjs';
import 'dayjs/locale/fa';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Extend dayjs with jalali plugin
dayjs.extend(jalali);

// Set locale to Persian
dayjs.locale('fa');

// Export the adapter instance configured for Jalali calendar
export const jalaliAdapter = new AdapterDayjs({ locale: 'fa' });

