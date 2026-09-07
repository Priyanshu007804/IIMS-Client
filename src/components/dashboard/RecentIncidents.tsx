import React from 'react';
import { Incident } from '../../types';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../common/Badge';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { ArrowUpRight, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentIncidentsProps {
  incidents: Incident[];
  isLoading?: boolean;
}

export const RecentIncidents: React.FC<RecentIncidentsProps> = ({ incidents, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 animate-pulse space-y-3">
        <div className="w-48 h-5 bg-slate-800 rounded" />
        <div className="w-full h-36 bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Active Incident Queue</h3>
          <p className="text-xs text-slate-400">Recently logged operational issues</p>
        </div>
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>View All Queue</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {incidents.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No incidents logged in the system yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5 font-mono">ID</th>
                <th className="pb-2.5">Title</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Priority</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Created</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3 font-mono text-slate-400">
                    #{incident.id ? incident.id.slice(-6) : '—'}
                  </td>
                  <td className="py-3 font-medium text-white max-w-[200px] truncate">
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="hover:text-indigo-400 transition-colors"
                    >
                      {incident.title}
                    </Link>
                  </td>
                  <td className="py-3">
                    <CategoryBadge category={incident.category} />
                  </td>
                  <td className="py-3">
                    <PriorityBadge priority={incident.priority} size="sm" />
                  </td>
                  <td className="py-3">
                    <StatusBadge status={incident.status} size="sm" />
                  </td>
                  <td className="py-3 text-slate-400 font-mono text-[11px]">
                    {formatRelativeTime(incident.createdAt)}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
