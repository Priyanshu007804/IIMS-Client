import React from 'react';
import { DashboardSummaryResponse } from '../../types';
import {
  AlertOctagon,
  Clock,
  PlayCircle,
  CheckCircle2,
  Archive,
  Flame,
  TrendingUp,
} from 'lucide-react';

interface SummaryCardsProps {
  summary: DashboardSummaryResponse | null;
  isLoading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, isLoading = false }) => {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse h-28"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Incidents',
      value: summary.totalIncidents,
      icon: AlertOctagon,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950/40',
      border: 'border-indigo-500/30',
      sub: 'All logged tickets',
    },
    {
      label: 'Open',
      value: summary.openIncidents,
      icon: Clock,
      color: 'text-sky-400',
      bg: 'bg-sky-950/40',
      border: 'border-sky-500/30',
      sub: 'Awaiting triage',
    },
    {
      label: 'In Progress',
      value: summary.inProgressIncidents,
      icon: PlayCircle,
      color: 'text-amber-400',
      bg: 'bg-amber-950/40',
      border: 'border-amber-500/30',
      sub: 'Active investigation',
    },
    {
      label: 'Resolved',
      value: summary.resolvedIncidents,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-500/30',
      sub: 'Mitigations applied',
    },
    {
      label: 'Closed',
      value: summary.closedIncidents,
      icon: Archive,
      color: 'text-slate-400',
      bg: 'bg-slate-900/60',
      border: 'border-slate-800',
      sub: 'Post-mortem complete',
    },
    {
      label: 'Critical (P1)',
      value: summary.criticalIncidents,
      icon: Flame,
      color: 'text-rose-400',
      bg: 'bg-rose-950/50',
      border: 'border-rose-500/40',
      sub: 'Highest priority SLA',
      isHot: summary.criticalIncidents > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-slate-900/90 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
              card.border
            } ${card.isHot ? 'shadow-rose-950/40 border-rose-500/50 ring-1 ring-rose-500/30' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 truncate pr-1">{card.label}</span>
              <div className={`p-1.5 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                {card.value}
              </span>
              {card.isHot && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </div>

            <p className="mt-1 text-[10px] text-slate-500 truncate">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
};
