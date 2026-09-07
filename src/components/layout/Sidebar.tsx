import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  AlertOctagon,
  PlusCircle,
  History,
  User,
  Shield,
  FileCode2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DIRECT_BACKEND_BASE_URL } from '../../api/client';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenCreateModal }) => {
  const { user, activeRole, logout } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'ENGINEER', 'USER'],
      description: 'Metrics & health analytics',
    },
    {
      to: '/incidents',
      label: 'Incidents',
      icon: AlertOctagon,
      roles: ['ADMIN', 'ENGINEER', 'USER'],
      description: 'Lifecycle & ticket queue',
    },
    {
      to: '/audit',
      label: 'Audit & Activity',
      icon: History,
      roles: ['ADMIN', 'ENGINEER', 'USER'],
      description: 'Immutable compliance trail',
    },
    {
      to: '/profile',
      label: 'Profile & RBAC',
      icon: User,
      roles: ['ADMIN', 'ENGINEER', 'USER'],
      description: 'Session & permissions matrix',
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(activeRole));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80 bg-slate-950">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wider text-white font-mono">IIMS</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PROD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[150px]">Incident &amp; Service Mgmt</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <button
            id="sidebar-create-incident-btn"
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-950/60 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Incident</span>
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Navigation
          </div>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold border border-slate-700/80 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-indigo-400" />
                  <div className="truncate">
                    <div>{item.label}</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
              </NavLink>
            );
          })}
        </div>

        {/* Backend & Swagger quick links */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <FileCode2 className="w-3.5 h-3.5 text-indigo-400" /> OpenAPI Spec
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">v3.0</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Directly connected to live Spring Boot controller endpoints.
          </p>
          <a
            href={`${DIRECT_BACKEND_BASE_URL}/swagger-ui/index.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <span>Open Swagger UI</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-semibold text-white truncate">{user?.email || 'User'}</div>
            <div className="text-[10px] font-mono text-indigo-400 font-semibold">{activeRole}</div>
          </div>
          <button
            onClick={logout}
            className="text-[11px] text-slate-400 hover:text-rose-400 font-medium transition-colors p-1"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};
