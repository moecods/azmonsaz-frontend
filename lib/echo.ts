import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: Echo<'reverb'>;
  }
}

let echoInstance: Echo<'reverb'> | null = null;

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api';
}

function getBroadcastAuthUrl(): string {
  return `${getApiBaseUrl()}/broadcasting/auth`;
}

function isRealtimeConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_REVERB_APP_KEY &&
      process.env.NEXT_PUBLIC_REVERB_HOST &&
      process.env.NEXT_PUBLIC_REVERB_PORT
  );
}

export function isRealtimeEnabled(): boolean {
  return isRealtimeConfigured();
}

export function getEcho(): Echo<'reverb'> | null {
  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

export function connectEcho(token: string | null): Echo<'reverb'> | null {
  if (typeof window === 'undefined' || !token || !isRealtimeConfigured()) {
    disconnectEcho();
    return null;
  }

  if (echoInstance) {
    return echoInstance;
  }

  window.Pusher = Pusher;

  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http';
  const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080);
  const forceTLS = scheme === 'https';

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST!,
    wsPort: port,
    wssPort: port,
    forceTLS,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: getBroadcastAuthUrl(),
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
}

export function reconnectEcho(token: string | null): Echo<'reverb'> | null {
  disconnectEcho();
  return connectEcho(token);
}
