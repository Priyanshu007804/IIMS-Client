import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkBackendHealth, HealthCheckResult } from '../../api/health';
import { RoleBadge } from '../common/Badge';
import { UserRole } from '../../types';
import {
  Activity,
  Server,
  LogOut,
  ChevronDown,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Settings,
  Sparkles,
  Menu,
} from 'lucide-react';
import { API_MODE_KEY } from '../../api/client';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateModal, onToggleSidebar }) => {
  const { user, activeRole, logout, coldStartActive } = useAuth();
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  const [apiMode, setApiMode] = useState<'proxied' | 'direct'>(() => {
    return (localStorage.getItem(API_MODE_KEY) as 'proxied' | 'direct') || 'proxied';
  });

  const runHealthPing = async () => {
    setIsPinging(true);
    const res = await checkBackendHealth();
    setHealth(res);
    setIsPinging(false);
  };

  useEffect(() => {
    runHealthPing();
    const interval = setInterval(runHealthPing, 25000);
    return () => clearInterval(interval);
  }, [apiMode]);

  const handleModeChange = (mode: 'proxied' | 'direct') => {
    localStorage.setItem(API_MODE_KEY, mode);
    setApiMode(mode);
    setShowSettingsMenu(false);
    // Reload health check
    setTimeout(runHealthPing, 200);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      {coldStartActive && (
        <div className="bg-indigo-950/80 border-b border-indigo-500/30 px-4 py-2 text-xs text-indigo-200 flex items-center justify-center gap-2 animate-pulse">
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span>Connecting to IIMS services on Render free tier (container warming up)...</span>
        </div>
      )}

      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: Mobile hamburger & breadcrumb or title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-white rounded-lg lg:hidden hover:bg-slate-900 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              ENV: PRODUCTION
            </span>
            <span>/</span>
            <span className="text-slate-200 font-semibold">SPRING BOOT LIVE</span>
          </div>
        </div>

        {/* Right: Actions, Backend Health Indicator, Role Switcher, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Backdrop for closing settings popover on outside click */}
          {showSettingsMenu && (
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => {
                setShowSettingsMenu(false);
              }}
            />
          )}

          {/* Real Backend Live Status */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
              title="Backend Connection Status & Settings"
            >
              <div className="relative flex items-center justify-center">
                <span
                  className={`w-2 h-2 rounded-full ${
                    health?.healthy ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                {health?.healthy && (
                  <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                )}
              </div>
              <span className="hidden md:inline font-mono font-medium">
                {health?.healthy ? 'Render Online' : 'Connecting...'}
              </span>
              {health?.latencyMs !== undefined && (
                <span className="hidden lg:inline text-[10px] text-slate-400 font-mono">
                  {health.latencyMs}ms
                </span>
              )}
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Connection settings popover */}
            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-white">
                  <span>Backend Integration</span>
                  <button
                    onClick={runHealthPing}
                    disabled={isPinging}
                    className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                </div>
                <div className="py-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Host:</span>
                    <span className="font-mono text-slate-200 truncate max-w-[140px]">
                      onrender.com
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Health Status:</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        health?.healthy ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {health?.healthy ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> 200 OK
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" /> Error
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Round-trip:</span>
                    <span className="font-mono text-slate-300">{health?.latencyMs ?? 0}ms</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-medium text-slate-400 mb-1.5">Connection Route:</div>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => handleModeChange('proxied')}
                      className={`py-1 px-2 rounded text-xs font-medium transition-colors ${
                        apiMode === 'proxied'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Proxied (No CORS)
                    </button>
                    <button
                      onClick={() => handleModeChange('direct')}
                      className={`py-1 px-2 rounded text-xs font-medium transition-colors ${
                        apiMode === 'direct'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Direct Remote
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Create Incident Button */}
          <button
            id="header-create-incident-btn"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-950/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Incident</span>
          </button>

          {/* Fixed Assigned Role Badge */}
          <div
            id="user-role-badge"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 select-none"
            title={`Assigned account role: ${activeRole}`}
          >
            <span className="text-slate-400 hidden sm:inline text-[11px]">Role:</span>
            <RoleBadge role={activeRole} />
          </div>

          {/* User Profile avatar & logout */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            <div
              className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-xs shadow-inner"
              title={user?.email || 'User'}
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <button
              id="header-logout-btn"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
