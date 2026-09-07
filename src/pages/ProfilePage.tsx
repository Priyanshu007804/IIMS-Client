import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/Badge';
import { UserRole } from '../types';
import {
  User,
  Shield,
  Key,
  Lock,
  Check,
  X,
  ExternalLink,
  Server,
  Terminal,
  LogOut,
} from 'lucide-react';
import { DIRECT_BACKEND_BASE_URL } from '../api/client';

export const ProfilePage: React.FC = () => {
  const { user, activeRole, logout } = useAuth();

  const permissionsMatrix = [
    {
      action: 'View Incident Queue & Detail',
      user: true,
      engineer: true,
      admin: true,
      note: 'All authenticated personnel can monitor operational health',
    },
    {
      action: 'Create New Incident',
      user: true,
      engineer: true,
      admin: true,
      note: 'Any user can submit a ticket into the triage pipeline',
    },
    {
      action: 'View Dashboard & Aggregates',
      user: true,
      engineer: true,
      admin: true,
      note: 'Real-time telemetry and KPI metrics',
    },
    {
      action: 'Update Incident Fields',
      user: false,
      engineer: true,
      admin: true,
      note: 'Restricted to operational responders and administrators',
    },
    {
      action: 'Status Transition Lifecycle',
      user: false,
      engineer: true,
      admin: true,
      note: 'Moving from OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED',
    },
    {
      action: 'Assign Incidents to Engineers',
      user: false,
      engineer: true,
      admin: true,
      note: 'Assigning responsible owner to tickets',
    },
    {
      action: 'Delete Incident Record',
      user: false,
      engineer: false,
      admin: true,
      note: 'Permanently deletes ticket (Admin only)',
    },
    {
      action: 'View Compliance Audit Logs',
      user: true,
      engineer: true,
      admin: true,
      note: 'Immutable record of modifications',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Operator Profile &amp; Role-Based Access Control (RBAC)
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Session security, active identity mode, and backend authorization policy
        </p>
      </div>

      {/* User Info Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-bold text-lg font-mono">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">{user?.email}</h2>
                <RoleBadge role={activeRole} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authentication Source: Spring Boot JWT Token
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-300 text-xs font-semibold transition-colors border border-slate-700/80"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Assigned Role Security Status */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Assigned Role &amp; Security Scope</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Your account role is determined upon authentication and is locked for the duration of the active session:
          </p>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <RoleBadge role={activeRole} />
              <div>
                <div className="text-xs font-bold text-white">
                  {activeRole === 'ADMIN' && 'System Administrator Privileges'}
                  {activeRole === 'ENGINEER' && 'Operational Responder Privileges'}
                  {activeRole === 'USER' && 'Standard User Privileges'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {activeRole === 'ADMIN' && 'Full enterprise management rights including ticket deletion and team assignments.'}
                  {activeRole === 'ENGINEER' && 'Authorized to assign tickets and advance the incident status lifecycle.'}
                  {activeRole === 'USER' && 'Authorized to create incidents and monitor ongoing operational telemetry.'}
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 shrink-0 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>ROLE LOCKED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Spring Security Authorization Policy Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Enforced server-side on each REST controller endpoint
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Action / Operation</th>
                <th className="pb-3 text-center">USER</th>
                <th className="pb-3 text-center">ENGINEER</th>
                <th className="pb-3 text-center">ADMIN</th>
                <th className="pb-3">Backend Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-semibold text-white">{item.action}</td>
                  <td className="py-3 text-center">
                    {item.user ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {item.engineer ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {item.admin ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 text-[11px] text-slate-400">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backend & Swagger Info */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Live Spring Boot Architecture
            </h3>
          </div>
          <a
            href={`${DIRECT_BACKEND_BASE_URL}/swagger-ui/index.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            <span>Open Swagger UI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
          <div><span className="text-slate-500">BASE URL:</span> {DIRECT_BACKEND_BASE_URL}</div>
          <div><span className="text-slate-500">OPENAPI:</span> {DIRECT_BACKEND_BASE_URL}/v3/api-docs</div>
          <div><span className="text-slate-500">AUTH TYPE:</span> Bearer JWT (HMAC/RSA Signed)</div>
        </div>
      </div>
    </div>
  );
};
