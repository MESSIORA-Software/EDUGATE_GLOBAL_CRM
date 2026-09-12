import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/Auth/useAuth';
import { COLORS } from '../constants/colors';
import edugateLogo from '../assets/edugate_logo.jpeg';
import { Bell, Search, Menu, Sparkles, User } from 'lucide-react';

export default function Header({ toggleSidebar }) {
  const { user } = useAuth();

  return (
    <header
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
      }}
      className="h-14 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          style={{ color: COLORS.muted }}
          className="p-1.5 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block w-64 md:w-72">
          <Search style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search CRM modules..."
            style={{
              backgroundColor: COLORS.background,
              borderColor: COLORS.border,
              color: COLORS.foreground,
            }}
            className="w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live System Indicator Badge */}
        <div
          style={{
            backgroundColor: COLORS.primaryLight,
            borderColor: COLORS.primaryBorder,
            color: COLORS.primary,
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Edugate Global CRM</span>
        </div>

        {/* Notification bell */}
        <button
          style={{ color: COLORS.muted }}
          className="relative p-1.5 rounded-lg hover:text-[#1E3A8A] hover:bg-slate-100 cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span
            style={{ backgroundColor: COLORS.secondary }}
            className="absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-white"
          />
        </button>

        <div style={{ backgroundColor: COLORS.border }} className="h-5 w-px mx-0.5" />

        {/* User Profile Quick Link */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          title="View My Profile"
        >
          <div
            style={{
              backgroundColor: COLORS.primaryLight,
              color: COLORS.primary,
              borderColor: COLORS.primaryBorder,
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border"
          >
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
        </NavLink>

        {/* Logo Badge */}
        <div className="flex items-center gap-2">
          <img
            src={edugateLogo}
            alt="Edugate Logo"
            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}
