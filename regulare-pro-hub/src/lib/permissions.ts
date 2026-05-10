export type Role = 'admin' | 'manager' | 'operator' | 'client';

export interface Permissions {
  canAccessBI: boolean;
  canManageUsers: boolean;
  canManageFinance: boolean;
  canManageConfig: boolean;
  canCreateProcess: boolean;
  canDeleteProcess: boolean;
  canEditProcess: boolean;
  canUploadDocs: boolean;
}

const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  admin: {
    canAccessBI: true,
    canManageUsers: true,
    canManageFinance: true,
    canManageConfig: true,
    canCreateProcess: true,
    canDeleteProcess: true,
    canEditProcess: true,
    canUploadDocs: true,
  },
  manager: {
    canAccessBI: true,
    canManageUsers: false,
    canManageFinance: true,
    canManageConfig: false,
    canCreateProcess: true,
    canDeleteProcess: false,
    canEditProcess: true,
    canUploadDocs: true,
  },
  operator: {
    canAccessBI: false,
    canManageUsers: false,
    canManageFinance: false,
    canManageConfig: false,
    canCreateProcess: false,
    canDeleteProcess: false,
    canEditProcess: true,
    canUploadDocs: true,
  },
  client: {
    canAccessBI: false,
    canManageUsers: false,
    canManageFinance: false,
    canManageConfig: false,
    canCreateProcess: false,
    canDeleteProcess: false,
    canEditProcess: false,
    canUploadDocs: false,
  }
};

export function getPermissions(role: Role): Permissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.operator;
}

export function hasPermission(role: Role, permission: keyof Permissions): boolean {
  return getPermissions(role)[permission];
}
