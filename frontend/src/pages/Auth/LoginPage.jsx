import React from 'react';
import useAuth from '../../hooks/Auth/useAuth';
import { COLORS } from '../../constants/colors';
import edugateLogo from '../../assets/edugate_logo.jpeg';
import Button from '../../components/ui/Button';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    loading,
    displayError,
    handleLogin,
  } = useAuth();

  return (
    <div
      style={{ backgroundColor: COLORS.background }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
          className="rounded-2xl border shadow-lg p-6 sm:p-8"
        >
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <img
              src={edugateLogo}
              alt="Edugate Global"
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm mx-auto mb-3"
            />
            <div
              style={{
                backgroundColor: COLORS.primaryLight,
                borderColor: COLORS.primaryBorder,
                color: COLORS.primary,
              }}
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border mb-2"
            >
              <Sparkles className="w-3 h-3 text-[#DC2626]" />
              <span>Edugate Global CRM</span>
            </div>
            <h1
              style={{ color: COLORS.foreground }}
              className="text-xl font-extrabold tracking-tight"
            >
              Sign in to your account
            </h1>
            <p style={{ color: COLORS.muted }} className="text-xs mt-1">
              Enter your credentials to access the CRM portal
            </p>
          </div>

          {/* Error Message */}
          {displayError && (
            <div
              style={{
                backgroundColor: COLORS.dangerLight,
                borderColor: COLORS.secondaryBorder,
                color: COLORS.secondary,
              }}
              className="flex items-start gap-2.5 p-3 rounded-xl border text-xs font-medium mb-5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{displayError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                style={{ color: COLORS.foreground }}
                className="block text-xs font-semibold mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  style={{ color: COLORS.placeholder }}
                  className="w-4 h-4 absolute left-3.5 top-3 pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  style={{
                    backgroundColor: COLORS.background,
                    borderColor: COLORS.border,
                    color: COLORS.foreground,
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label
                style={{ color: COLORS.foreground }}
                className="block text-xs font-semibold mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  style={{ color: COLORS.placeholder }}
                  className="w-4 h-4 absolute left-3.5 top-3 pointer-events-none"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    backgroundColor: COLORS.background,
                    borderColor: COLORS.border,
                    color: COLORS.foreground,
                  }}
                  className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  style={{ color: COLORS.placeholder }}
                  className="absolute right-3.5 top-2.5 p-0.5 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Demo Hint */}
          <div
            style={{
              backgroundColor: COLORS.background,
              borderColor: COLORS.border,
            }}
            className="mt-6 p-3 rounded-xl border text-[11px] text-slate-500 text-center"
          >
            <span className="font-semibold text-slate-700">Default Demo Account:</span>
            <div className="mt-0.5 text-slate-500 font-mono text-[10px]">
              kamal@example.com / 1234
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
