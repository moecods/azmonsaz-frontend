"use client";

import { useEffect } from "react";

/**
 * Registers a minimal service worker so browsers can offer "Install app".
 * Does not cache assets or enable offline mode.
 */
export default function PwaServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Non-fatal: install UI may still work via "Add to Home Screen" on some platforms.
    });
  }, []);

  return null;
}
