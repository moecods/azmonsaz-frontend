export const ADMIN_ASSIGNABLE_ROLES = ['admin', 'content_manager', 'creator'] as const;
export type AdminAssignableRole = (typeof ADMIN_ASSIGNABLE_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminAssignableRole, string> = {
  admin: 'مدیر',
  content_manager: 'مدیر محتوا',
  creator: 'سازنده',
};

export const ADMIN_ROLE_CHIP_COLOR: Record<AdminAssignableRole, 'error' | 'primary' | 'success'> = {
  admin: 'error',
  content_manager: 'primary',
  creator: 'success',
};

export function filterAssignableRoles(roles: string[] | undefined): AdminAssignableRole[] {
  return (roles ?? []).filter((r): r is AdminAssignableRole =>
    ADMIN_ASSIGNABLE_ROLES.includes(r as AdminAssignableRole)
  );
}

export function getAdminRoleLabel(role: string): string {
  return ADMIN_ROLE_LABELS[role as AdminAssignableRole] ?? role;
}

export function getAdminRoleChipColor(role: string): 'error' | 'primary' | 'success' | 'default' {
  return ADMIN_ROLE_CHIP_COLOR[role as AdminAssignableRole] ?? 'default';
}
