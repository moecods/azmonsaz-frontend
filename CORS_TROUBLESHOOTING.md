# CORS Troubleshooting Guide

## Problem
You're seeing this error:
```
Access to fetch at 'http://localhost:3000/' (redirected from 'http://azmonsaz.test/api/questions') 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

## Root Cause
The request is being redirected from `http://azmonsaz.test/api/questions` to `http://localhost:3000/`, which suggests:
1. The API URL might be misconfigured
2. The backend might be redirecting requests
3. CORS headers might not be set correctly

## Solutions

### Solution 1: Check Your API URL Configuration

1. **Check your `.env.local` file** in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://azmonsaz.test/api
   ```
   
   OR if using Laravel's built-in server:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

2. **Restart your Next.js dev server** after changing the environment variable:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Solution 2: Verify Backend is Running

Make sure your Laravel backend is accessible:

```bash
# Test if the backend is responding
curl http://azmonsaz.test/api/question-categories

# Or if using Laravel's built-in server:
curl http://localhost:8000/api/question-categories
```

### Solution 3: Clear Laravel Config Cache

If you've updated CORS settings, clear the cache:

```bash
cd azmonsaz
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Solution 4: Check Web Server Configuration

If using Apache/Nginx with `azmonsaz.test`, make sure there are no redirect rules that might interfere with API routes.

### Solution 5: Verify CORS Middleware

The CORS middleware should be registered in `bootstrap/app.php`. Verify it's active:

```php
$middleware->api(prepend: [
    \App\Http\Middleware\HandleCors::class,
]);
```

### Solution 6: Test CORS Headers

Test if CORS headers are being sent:

```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://azmonsaz.test/api/questions \
     -v
```

You should see `Access-Control-Allow-Origin` in the response headers.

## Quick Fix Checklist

- [ ] `.env.local` has correct `NEXT_PUBLIC_API_URL`
- [ ] Next.js dev server restarted after env change
- [ ] Laravel backend is running and accessible
- [ ] Laravel config cache cleared
- [ ] CORS middleware is registered
- [ ] Browser cache cleared (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)

## Common Issues

### Issue: "Redirected from X to Y"
**Cause**: API URL is wrong or backend is redirecting
**Fix**: Check `.env.local` and verify backend URL is correct

### Issue: "No 'Access-Control-Allow-Origin' header"
**Cause**: CORS middleware not working or origin not allowed
**Fix**: Clear Laravel cache and verify CORS config

### Issue: "Preflight request failed"
**Cause**: OPTIONS request not handled properly
**Fix**: Verify HandleCors middleware handles OPTIONS requests

## Still Having Issues?

1. Check browser console for full error details
2. Check Laravel logs: `storage/logs/laravel.log`
3. Check network tab in browser DevTools to see actual request/response
4. Verify both frontend and backend are running

