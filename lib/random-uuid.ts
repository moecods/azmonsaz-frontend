/**
 * UUID v4 helper. `crypto.randomUUID()` is only available in secure contexts
 * (HTTPS or localhost). Access via http://IP:port needs a polyfill — see layout Script.
 */
function generateUUIDv4(): string {
  const bytes = new Uint8Array(16);

  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function randomUUID(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      // non-secure context (e.g. http://194.x.x.x:3000)
    }
  }

  return generateUUIDv4();
}

/** Patch `crypto.randomUUID` for third-party bundles on non-HTTPS origins. */
export function installCryptoRandomUUIDPolyfill(): void {
  if (typeof globalThis === 'undefined') {
    return;
  }

  const cryptoRef = globalThis.crypto ?? (globalThis.crypto = {} as Crypto);

  if (typeof cryptoRef.randomUUID === 'function') {
    try {
      cryptoRef.randomUUID();
      return;
    } catch {
      // exists but throws in insecure context — replace below
    }
  }

  Object.defineProperty(cryptoRef, 'randomUUID', {
    value: generateUUIDv4,
    writable: true,
    configurable: true,
  });
}
