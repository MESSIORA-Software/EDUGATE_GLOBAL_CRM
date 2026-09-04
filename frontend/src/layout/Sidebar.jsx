import React from 'react';
import { NavLink } from 'react-router-dom';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import edugateLogo from '../assets/edugate_logo.jpeg';
import { Shield, Users, LayoutDashboard, Settings } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { name: 'System Roles', path: '/', icon: Shield },
    { name: 'User Accounts', path: '/users', icon: Users },
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

        {/* Footer Brand Info */}
        <div style={{ borderColor: COLORS.border }} className="p-3 border-t">
          <div
            style={{
              backgroundColor: COLORS.background,
              borderColor: COLORS.border,
            }}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl border"
          >
            <img
              src={edugateLogo}
              alt="System Logo"
              className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0"
            />
            <div className="overflow-hidden text-left">
              <p style={{ color: COLORS.foreground }} className="text-xs font-bold truncate">
                Edugate System
              </p>
              <p style={{ color: COLORS.secondary }} className="text-[10px] font-bold uppercase truncate">
                Global Roles API
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
