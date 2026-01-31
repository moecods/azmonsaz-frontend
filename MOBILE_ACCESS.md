# دسترسی به وب‌سایت از گوشی موبایل

این راهنما توضیح می‌دهد که چگونه می‌توانید وب‌سایت را در محیط development از گوشی موبایل خود باز کنید.

## پیش‌نیازها

1. **گوشی و کامپیوتر باید در یک شبکه Wi-Fi باشند**
2. **فایروال باید اجازه اتصال را بدهد**

## مراحل راه‌اندازی

### 1. پیدا کردن IP Address کامپیوتر

#### در macOS:
```bash
# روش 1: استفاده از ifconfig
ifconfig | grep "inet " | grep -v 127.0.0.1

# روش 2: استفاده از ipconfig getifaddr
ipconfig getifaddr en0  # برای Wi-Fi
# یا
ipconfig getifaddr en1  # برای Ethernet
```

#### در Linux:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# یا
hostname -I
```

#### در Windows:
```cmd
ipconfig
# به دنبال "IPv4 Address" در بخش Wi-Fi یا Ethernet بگردید
```

مثال IP Address: `192.168.1.100`

### 2. اجرای سرور Next.js با دسترسی شبکه

```bash
npm run dev:network
```

این دستور سرور را با `hostname 0.0.0.0` اجرا می‌کند که به معنای پذیرش اتصال از تمام IP address های سیستم است.

### 3. پیدا کردن IP Address سرور Laravel (Backend)

اگر از Laravel Valet استفاده می‌کنید:
```bash
# IP address همان IP کامپیوتر شماست
# URL: http://YOUR_IP_ADDRESS (بدون پورت)
```

اگر از `php artisan serve` استفاده می‌کنید:
```bash
# باید سرور را با hostname 0.0.0.0 اجرا کنید:
php artisan serve --host=0.0.0.0 --port=8000
# URL: http://YOUR_IP_ADDRESS:8000
```

### 4. تنظیم Environment Variables

در فایل `.env.local`:

```env
# برای Laravel Valet
NEXT_PUBLIC_API_URL=http://YOUR_IP_ADDRESS/api

# برای php artisan serve
NEXT_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:8000/api
```

**مثال:**
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

### 5. دسترسی از گوشی

1. مطمئن شوید گوشی و کامپیوتر در یک شبکه Wi-Fi هستند
2. در مرورگر گوشی، آدرس زیر را باز کنید:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```
   
   **مثال:**
   ```
   http://192.168.1.100:3000
   ```

## تنظیم Laravel Backend برای دسترسی شبکه

### اگر از Laravel Valet استفاده می‌کنید:

Valet به صورت پیش‌فرض فقط از localhost قابل دسترسی است. برای دسترسی از شبکه:

1. اجرای Valet با `--host`:
   ```bash
   valet share
   ```
   یا استفاده از ngrok برای tunnel

### اگر از `php artisan serve` استفاده می‌کنید:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### تنظیم CORS در Laravel

مطمئن شوید که در فایل `config/cors.php` یا middleware CORS، IP address شما مجاز است:

```php
'allowed_origins' => [
    'http://localhost:3000',
    'http://YOUR_IP_ADDRESS:3000',
],
```

یا برای development:
```php
'allowed_origins' => ['*'], // فقط برای development
```

## عیب‌یابی

### مشکل: نمی‌توانم از گوشی به سرور دسترسی پیدا کنم

1. **بررسی فایروال:**
   - macOS: System Preferences > Security & Privacy > Firewall
   - Linux: `sudo ufw allow 3000`
   - Windows: Windows Defender Firewall > Allow an app

2. **بررسی اتصال شبکه:**
   ```bash
   # از گوشی، ping کنید:
   ping YOUR_IP_ADDRESS
   ```

3. **بررسی پورت:**
   ```bash
   # بررسی کنید که پورت 3000 باز است:
   lsof -i :3000
   ```

### مشکل: API calls کار نمی‌کند

1. مطمئن شوید که `NEXT_PUBLIC_API_URL` در `.env.local` به IP address صحیح اشاره می‌کند
2. سرور Laravel را با `--host=0.0.0.0` اجرا کنید
3. CORS را در Laravel بررسی کنید
4. بعد از تغییر `.env.local`، سرور Next.js را restart کنید

### مشکل: صفحه سفید یا خطاهای CORS

1. مطمئن شوید که IP address در CORS config مجاز است
2. Hard refresh در مرورگر گوشی (Ctrl+Shift+R)
3. Cache مرورگر را پاک کنید

## نکات امنیتی

⚠️ **توجه:** این تنظیمات فقط برای development هستند. در production:

- از HTTPS استفاده کنید
- CORS را به دامنه‌های خاص محدود کنید
- از فایروال مناسب استفاده کنید

## راه‌حل جایگزین: استفاده از ngrok

اگر نمی‌خواهید تنظیمات شبکه را تغییر دهید، می‌توانید از ngrok استفاده کنید:

```bash
# نصب ngrok
npm install -g ngrok

# ایجاد tunnel برای Next.js
ngrok http 3000

# ایجاد tunnel برای Laravel
ngrok http 8000
```

سپس از URL های ارائه شده توسط ngrok استفاده کنید.

