/**
 * Utility functions for User Role resolution and Dashboard routing
 */

export const getUserRole = (user, rolesList = []) => {
  if (!user) return 'SUPER_ADMIN';

  const rawRole = user.role_id || user.role || user.role_name || '';
  const strRole = String(rawRole).trim().toUpperCase();

  if (strRole.includes('SUPER')) return 'SUPER_ADMIN';
  if (strRole === 'ADMIN') return 'ADMIN';
  if (strRole === 'STAFF') return 'STAFF';

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
      if (matchKey === 'ADMIN') return 'ADMIN';
      if (matchKey === 'STAFF') return 'STAFF';
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
