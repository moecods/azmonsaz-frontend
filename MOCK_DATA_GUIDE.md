# Mock Data Development Guide

This guide explains how to switch between mock data and real API calls during development.

## Quick Setup

### 1. Create your `.env.local` file

Create a `.env.local` file in your project root with the following content:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Data Source Configuration
# Set to 'true' to use mock data, 'false' or remove to use real API
NEXT_PUBLIC_USE_MOCK_DATA=true

# Application Configuration
NEXT_PUBLIC_APP_NAME=Azmoon-Saz
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Configuration
NODE_ENV=development
```

## How to Switch Data Sources

### Using Mock Data (for frontend-only development)
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### Using Real API (when backend is ready)
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
# or simply remove the line
```

### After changing the environment variable:
1. Save the `.env.local` file
2. Restart your development server (`npm run dev` or `yarn dev`)

## Visual Indicator

When running in development mode, you'll see a colored indicator in the top-right corner:
- 🧪 **Orange**: Mock Data
- 🌐 **Green**: Real API

## Mock Data Features

The mock data includes:
- **Questions**: Sample questions with different types (multiple choice, true/false, multiple select)
- **Categories**: Mathematics, Science, History
- **Partners**: Sample partner organizations
- **Users**: Admin and content manager users
- **Exams**: Sample exam with questions

All mock data includes realistic delays to simulate real API calls.

## Benefits

- ✅ **No Backend Required**: Develop frontend features without waiting for backend
- ✅ **Consistent Data**: Same data structure as real API
- ✅ **Easy Switching**: One environment variable change
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Realistic Behavior**: Includes loading states and delays

## Troubleshooting

### If you don't see the data source indicator:
- Make sure `NODE_ENV=development` in your `.env.local`
- Restart your development server

### If mock data isn't loading:
- Check that `NEXT_PUBLIC_USE_MOCK_DATA=true` in your `.env.local`
- Restart your development server
- Check the browser console for any errors

### If real API isn't working:
- Verify `NEXT_PUBLIC_API_URL` points to your backend
- Check that `NEXT_PUBLIC_USE_MOCK_DATA=false` or is removed
- Ensure your backend server is running
