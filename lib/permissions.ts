/**
 * Permission-based access control utilities
 */

export type Permission =
  | 'manage users'
  | 'assign roles'
  | 'deactivate users'
  | 'view exams'
  | 'create exams'
  | 'edit exams'
  | 'delete exams'
  | 'manage questions'
  | 'manage participants'
  | 'grade exams'
  | 'view exam reports'
  | 'manage partners';

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: string[] | undefined | null,
  permission: Permission
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return userPermissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: string[] | undefined | null,
  permissions: Permission[]
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return permissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: string[] | undefined | null,
  permissions: Permission[]
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return permissions.every((permission) => userPermissions.includes(permission));
}

/**
 * Permission to role mapping (for backward compatibility and display)
 */
export const PERMISSION_TO_ROLE: Record<Permission, string[]> = {
  'manage users': ['admin'],
  'assign roles': ['admin'],
  'deactivate users': ['admin'],
  'view exams': ['admin', 'creator'],
  'create exams': ['admin', 'creator'],
  'edit exams': ['admin', 'creator'],
  'delete exams': ['admin'],
  'manage questions': ['admin', 'content_manager'],
  'manage participants': ['admin', 'creator'],
  'grade exams': ['admin', 'creator'],
  'view exam reports': ['admin', 'creator'],
  'manage partners': ['admin'],
};
