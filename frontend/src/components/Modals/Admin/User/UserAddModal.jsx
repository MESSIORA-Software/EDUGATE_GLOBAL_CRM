import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../../actions/Admin/userActions';
import { fetchRoles } from '../../../../actions/Admin/roleActions';
import { fetchBranches } from '../../../../actions/Admin/branchAction';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import { X, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function UserAddModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting, error } = useSelector((state) => state.users);
  const { roles } = useSelector((state) => state.roles);
  const { list: branches } = useSelector((state) => state.branch ?? {});

  const [branchId, setBranchId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleId, setRoleId] = useState(1);
  const [status, setStatus] = useState('ACTIVE');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (!roles || roles.length === 0) {
        dispatch(fetchRoles());
      }
      if (!branches || branches.length === 0) {
        dispatch(fetchBranches());
      }
    }
  }, [isOpen, roles, branches, dispatch]);

  useEffect(() => {
    if (roles && roles.length > 0 && !roleId) {
      setRoleId(roles[0].role_id || roles[0].id || 1);
    }
  }, [roles, roleId]);

  useEffect(() => {
    if (branches && branches.length > 0 && !branchId) {
      setBranchId(branches[0].branch_id || branches[0].id || '');
    }
  }, [branches, branchId]);

  const selectedRoleObj = roles?.find(
    (r) => String(r.role_id) === String(roleId) || String(r.id) === String(roleId)
  );
  const selectedRoleKey = String(
    selectedRoleObj?.role_id || selectedRoleObj?.role_name || roleId || ''
  ).toUpperCase();
  const isStaffRole = selectedRoleKey.includes('STAFF');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (isStaffRole && !branchId) {
      setLocalError('Please select a branch location for the staff account.');
      return;
    }
    if (!name.trim()) {
      setLocalError('User name is required.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Email address is required.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Password is required.');
      return;
    }

    const defaultBranchId = branches?.[0]?.branch_id || branches?.[0]?.id || 1;
    const finalBranchId = isStaffRole ? (Number(branchId) || defaultBranchId) : defaultBranchId;

    const payload = {
      branch_id: finalBranchId,
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      password_hash: password.trim(),
      role_id: isNaN(Number(roleId)) ? roleId : Number(roleId),
      status: status,
      created_by: null,
    };

    const res = await dispatch(registerUser(payload));
    if (res.success) {
      setName('');
      setEmail('');
      setPassword('');
      setLocalError('');
      onSuccess?.('User created successfully!');
      onClose();
    } else {
      setLocalError(res.error || 'Failed to create user.');
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setLocalError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="rounded-2xl shadow-xl border border-blue-200/80 bg-white max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3 border-b"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            >
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Create New User</h3>
              <p className={TYPOGRAPHY.caption}>Add system user account</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{ color: COLORS.muted }}
            className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {(localError || error) && (
            <div
              style={{ backgroundColor: COLORS.secondaryLight, borderColor: COLORS.secondaryBorder, color: COLORS.secondary }}
              className="flex items-center gap-2 p-2.5 border rounded-xl text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <div className={isStaffRole ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
            <div>
              <label className={`${TYPOGRAPHY.label} block mb-1`}>
                Role ID <span style={{ color: COLORS.secondary }}>*</span>
              </label>
              {roles && roles.length > 0 ? (
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  {roles.map((r, i) => (
                    <option key={r.role_id || r.id || i} value={r.role_id || r.id || (i + 1)}>
                      {r.role_id || r.id} - {r.role_name || r.name || 'Role'}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              )}
            </div>

            {isStaffRole && (
              <div className="animate-in fade-in duration-150">
                <label className={`${TYPOGRAPHY.label} block mb-1`}>
                  Branch Location <span style={{ color: COLORS.secondary }}>*</span>
                </label>
                {branches && branches.length > 0 ? (
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    required
                  >
                    <option value="" disabled>Select a branch</option>
                    {branches.map((b, i) => {
                      const bId = b.branch_id || b.id || (i + 1);
                      const bName = b.branch_name || b.name || `Branch #${bId}`;
                      return (
                        <option key={bId} value={bId}>
                          {bName}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <select
                    disabled
                    style={{ backgroundColor: '#F8FAFC', borderColor: COLORS.border, color: COLORS.placeholder }}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs cursor-not-allowed"
                  >
                    <option>Loading branches...</option>
                  </select>
                )}
              </div>
            )}
          </div>

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Full Name <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kamal Perera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              required
            />
          </div>

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Email Address <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <input
              type="email"
              placeholder="e.g. kamal.perera@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              required
            />
          </div>

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Password <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                className="w-full pl-3 pr-10 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ borderColor: COLORS.border }} className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" type="button" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
