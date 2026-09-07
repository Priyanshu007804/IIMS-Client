import React from 'react';
import { AuditLog } from '../../types';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import {
  History,
  PlusCircle,
  FileEdit,
  UserCheck,
  ArrowRightCircle,
  Trash2,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';

interface AuditTimelineProps {
  logs: AuditLog[];
  isLoading?: boolean;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 bg-slate-800 rounded" />
              <div className="w-48 h-3 bg-slate-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="py-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 p-6">
        <History className="w-7 h-7 text-slate-500 mx-auto mb-2" />
        <p className="text-xs font-medium text-slate-300">No audit records recorded yet</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Backend will record an immutable log entry on lifecycle transitions, edits, or assignments.
        </p>
      </div>
    );
  }

  // Sort chronologically (latest first or earliest first - let's do newest first with clean index)
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const getActionConfig = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE')) {
      return {
        icon: PlusCircle,
        badgeClass: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40',
        lineColor: 'border-emerald-500/30',
      };
    }
    if (act.includes('ASSIGN')) {
      return {
        icon: UserCheck,
        badgeClass: 'text-sky-400 bg-sky-950/80 border-sky-500/40',
        lineColor: 'border-sky-500/30',
      };
    }
    if (act.includes('STATUS')) {
      return {
        icon: ArrowRightCircle,
        badgeClass: 'text-amber-400 bg-amber-950/80 border-amber-500/40',
        lineColor: 'border-amber-500/30',
      };
    }
    if (act.includes('DELETE')) {
      return {
        icon: Trash2,
        badgeClass: 'text-rose-400 bg-rose-950/80 border-rose-500/40',
        lineColor: 'border-rose-500/30',
      };
    }
    return {
      icon: FileEdit,
      badgeClass: 'text-indigo-400 bg-indigo-950/80 border-indigo-500/40',
      lineColor: 'border-indigo-500/30',
    };
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {sortedLogs.map((log, index) => {
        const config = getActionConfig(log.action);
        const Icon = config.icon;

        return (
          <div key={log.id || index} className="relative group">
            {/* Timeline icon node */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center bg-slate-950 ${config.badgeClass} shadow-md`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Event content box */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 transition-all shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${config.badgeClass}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-xs font-semibold text-white tracking-tight">
                    {log.details || 'Event logged'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span title={formatDate(log.timestamp)}>{formatRelativeTime(log.timestamp)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                <User className="w-3 h-3 text-slate-500" />
                <span className="text-slate-500">Actor:</span>
                <span className="text-slate-200">{log.performedBy || 'System/Service'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
