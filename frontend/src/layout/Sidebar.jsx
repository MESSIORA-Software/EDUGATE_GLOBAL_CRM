import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/Auth/useAuth';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import edugateLogo from '../assets/edugate_logo.jpeg';
import { Shield, Users, UserCheck, LayoutDashboard, Settings, LogOut } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, handleLogout } = useAuth();

  const navItems = [
    { name: 'System Roles', path: '/', icon: Shield },
    { name: 'User Accounts', path: '/users', icon: Users },
    { name: 'My Profile', path: '/profile', icon: UserCheck },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.sidebarBorder,
        }}
        className={`fixed top-0 left-0 z-40 h-screen w-60 border-r flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div
            style={{ borderColor: COLORS.border }}
            className="h-14 flex items-center gap-3 px-5 border-b"
          >
            <img
              src={edugateLogo}
              alt="EDUGATE Global"
              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0"
            />
            <div>
              <h2
                style={{ color: COLORS.primary }}
                className="font-extrabold text-xs tracking-wider leading-none"
              >
                EDUGATE GLOBAL
              </h2>
              <span
                style={{ color: COLORS.secondary }}
                className="text-[9px] font-bold tracking-widest uppercase mt-0.5 block"
              >
                CRM Portal
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <p className={`${TYPOGRAPHY.label} px-2 mb-1`}>
              Main Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? COLORS.primaryLight : COLORS.transparent,
                    color: isActive ? COLORS.primary : COLORS.muted,
                  })}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-slate-100 ${
                      isActive ? 'border-l-4 border-[#DC2626] font-bold shadow-sm' : ''
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div style={{ borderColor: COLORS.border }} className="p-3 border-t space-y-2">
          {user && (
            <NavLink
              to="/profile"
              onClick={onClose}
              style={{
                backgroundColor: COLORS.background,
                borderColor: COLORS.border,
              }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl border hover:bg-slate-100 transition-all cursor-pointer block"
              title="Click to view full profile"
            >
              <div
                style={{
                  backgroundColor: COLORS.primaryLight,
                  color: COLORS.primary,
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs border border-blue-200"
              >
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden text-left flex-1">
                <p style={{ color: COLORS.foreground }} className="text-xs font-bold truncate">
                  {user.name || user.email || 'Logged In User'}
                </p>
                <p style={{ color: COLORS.muted }} className="text-[10px] truncate">
                  {user.email || user.role || 'User'}
                </p>
              </div>
            </NavLink>
          )}

          {/* Logout Button */}
          <button
            onClick={() => handleLogout(onClose)}
            style={{
              borderColor: COLORS.secondaryBorder,
              color: COLORS.secondary,
              backgroundColor: COLORS.secondaryLight,
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-red-100 active:scale-98 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
