const ADMIN_TOKEN_KEY = "impersonation_admin_token";

export function storeAdminTokenForImpersonation(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getStoredAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearStoredAdminToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export interface ImpersonationMeta {
  active: boolean;
  admin_id?: number;
  admin_name?: string;
}
