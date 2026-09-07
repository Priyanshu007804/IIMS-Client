import { IncidentCategory, IncidentPriority, IncidentStatus } from '../types';

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export const PRIORITY_CONFIG: Record<
  IncidentPriority,
  { label: string; color: string; bg: string; border: string; badgeClass: string; dotClass: string }
> = {
  CRITICAL: {
    label: 'Critical',
    color: '#EF4444',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    badgeClass: 'text-rose-400 bg-rose-950/60 border-rose-500/30 font-semibold shadow-xs shadow-rose-900/40',
    dotClass: 'bg-rose-500 animate-pulse',
  },
  HIGH: {
    label: 'High',
    color: '#F97316',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    badgeClass: 'text-amber-400 bg-amber-950/60 border-amber-500/30 font-medium',
    dotClass: 'bg-amber-500',
  },
  MEDIUM: {
    label: 'Medium',
    color: '#3B82F6',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    badgeClass: 'text-sky-400 bg-sky-950/60 border-sky-500/30 font-medium',
    dotClass: 'bg-sky-500',
  },
  LOW: {
    label: 'Low',
    color: '#10B981',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badgeClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30 font-medium',
    dotClass: 'bg-emerald-500',
  },
};

export const STATUS_CONFIG: Record<
  IncidentStatus,
  { label: string; color: string; bg: string; border: string; badgeClass: string; step: number }
> = {
  OPEN: {
    label: 'Open',
    color: '#60A5FA',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    badgeClass: 'text-blue-400 bg-blue-950/60 border-blue-500/30',
    step: 1,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#F59E0B',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    badgeClass: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
    step: 2,
  },
  RESOLVED: {
    label: 'Resolved',
    color: '#10B981',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badgeClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
    step: 3,
  },
  CLOSED: {
    label: 'Closed',
    color: '#94A3B8',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    badgeClass: 'text-slate-400 bg-slate-800/80 border-slate-700/50',
    step: 4,
  },
};

export const CATEGORY_ICONS: Record<IncidentCategory, string> = {
  PAYMENT: 'CreditCard',
  NETWORK: 'Network',
  DATABASE: 'Database',
  SECURITY: 'ShieldAlert',
  APPLICATION: 'LayoutGrid',
  HARDWARE: 'Cpu',
  OTHER: 'HelpCircle',
};

// Lifecycle transition validation
export const VALID_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

export function canTransitionStatus(current: IncidentStatus, target: IncidentStatus): boolean {
  if (current === target) return true;
  return VALID_STATUS_TRANSITIONS[current]?.includes(target) ?? false;
}
