/**
 * Utility functions for User Role resolution and Dashboard routing
 */

export const getUserRole = (user, rolesList = []) => {
  if (!user) return 'SUPER_ADMIN';

  const rawRole = user.role_id || user.role || user.role_name || '';
  const strRole = String(rawRole).trim().toUpperCase();

  if (strRole.includes('SUPER')) return 'SUPER_ADMIN';
  if (strRole === 'ADMIN' || strRole === 'EDUGATE_ADMIN' || strRole.endsWith('_ADMIN')) return 'ADMIN';
  if (strRole === 'STAFF' || strRole === 'EDUGATE_STAFF' || strRole.endsWith('_STAFF')) return 'STAFF';

  // If numeric or matched against rolesList
  if (rolesList && rolesList.length > 0) {
    const found = rolesList.find(
      (r) =>
        String(r.role_id).toUpperCase() === strRole ||
        String(r.id) === strRole
    );
    if (found) {
      const matchKey = String(found.role_id || found.role_name || '').toUpperCase();
      if (matchKey.includes('SUPER')) return 'SUPER_ADMIN';
      if (matchKey === 'ADMIN' || matchKey === 'EDUGATE_ADMIN' || matchKey.endsWith('_ADMIN')) return 'ADMIN';
      if (matchKey === 'STAFF' || matchKey === 'EDUGATE_STAFF' || matchKey.endsWith('_STAFF')) return 'STAFF';
      return matchKey;
    }
  }

  return strRole || 'SUPER_ADMIN';
};

export const getRoleDashboardTitle = (user, rolesList = []) => {
  const role = getUserRole(user, rolesList);
  if (role === 'SUPER_ADMIN') return 'Super Admin Dashboard';
  if (role === 'ADMIN') return 'Admin Dashboard';
  if (role === 'STAFF') return 'Staff Dashboard';

  const formatted = role
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return `${formatted} Dashboard`;
};

export const isStaffUser = (user) => {
  if (!user) return false;
  const rawRole = user.role_id || user.role || user.role_name || '';
  const strRole = String(rawRole).trim().toUpperCase();
  return (
    strRole === 'STAFF' ||
    strRole === 'EDUGATE_STAFF' ||
    strRole.endsWith('_STAFF') ||
    strRole.includes('STAFF') ||
    strRole.includes('COUNSELOR') ||
    strRole.includes('OFFICER') ||
    strRole.includes('AGENT')
  );
};

