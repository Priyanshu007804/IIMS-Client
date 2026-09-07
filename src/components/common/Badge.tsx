import React from 'react';
import { IncidentCategory, IncidentPriority, IncidentStatus, UserRole } from '../../types';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../utils/formatters';
import {
  CreditCard,
  Network,
  Database,
  ShieldAlert,
  LayoutGrid,
  Cpu,
  HelpCircle,
  Shield,
  Wrench,
  User as UserIcon,
} from 'lucide-react';

interface PriorityBadgeProps {
  priority: IncidentPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors ${config.badgeClass} ${
        isSm ? 'text-[11px] px-2 py-0.2' : ''
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
};

interface StatusBadgeProps {
  status: IncidentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${config.badgeClass} ${
        isSm ? 'text-[11px] px-2 py-0.2' : ''
      }`}
    >
      {config.label}
    </span>
  );
};

interface CategoryBadgeProps {
  category: IncidentCategory | string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const getIcon = () => {
    switch (category) {
      case 'PAYMENT':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-400" />;
      case 'NETWORK':
        return <Network className="w-3.5 h-3.5 text-cyan-400" />;
      case 'DATABASE':
        return <Database className="w-3.5 h-3.5 text-purple-400" />;
      case 'SECURITY':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'APPLICATION':
        return <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />;
      case 'HARDWARE':
        return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800/70 border border-slate-700/60 rounded-md px-2.5 py-0.5">
      {getIcon()}
      <span>{category}</span>
    </span>
  );
};

interface RoleBadgeProps {
  role: UserRole;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 rounded-md px-2 py-0.5 tracking-wider uppercase">
        <Shield className="w-3 h-3 text-amber-400" />
        ADMIN
      </span>
    );
  }
  if (role === 'ENGINEER') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-300 bg-sky-950/70 border border-sky-500/40 rounded-md px-2 py-0.5 tracking-wider uppercase">
        <Wrench className="w-3 h-3 text-sky-400" />
        ENGINEER
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-800/80 border border-slate-600/50 rounded-md px-2 py-0.5 tracking-wider uppercase">
      <UserIcon className="w-3 h-3 text-slate-400" />
      USER
    </span>
  );
};
