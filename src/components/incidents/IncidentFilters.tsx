import React from 'react';
import { IncidentCategory, IncidentPriority, IncidentQueryParams, IncidentStatus } from '../../types';
import { Search, Filter, RotateCcw, ArrowUpDown, X } from 'lucide-react';

interface IncidentFiltersProps {
  filters: IncidentQueryParams;
  onChange: (newFilters: IncidentQueryParams) => void;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({
  filters,
  onChange,
  onReset,
  onRefresh,
  isRefreshing = false,
}) => {
  const hasActiveFilters = Boolean(
    filters.search || filters.priority || filters.status || filters.category
  );

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm space-y-3">
      {/* Top Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="incident-search-input"
            type="text"
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 0 })}
            placeholder="Search by title, description or keywords..."
            className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '', page: 0 })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.sort || 'createdAt,desc'}
              onChange={(e) => onChange({ ...filters, sort: e.target.value, page: 0 })}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="createdAt,desc" className="bg-slate-900">Newest First</option>
              <option value="createdAt,asc" className="bg-slate-900">Oldest First</option>
              <option value="priority,desc" className="bg-slate-900">Highest Priority</option>
              <option value="status,asc" className="bg-slate-900">Status A-Z</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/80"
            title="Refresh incident list"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80">
        {/* Priority Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) =>
              onChange({ ...filters, priority: (e.target.value as IncidentPriority) || '', page: 0 })
            }
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) =>
              onChange({ ...filters, status: (e.target.value as IncidentStatus) || '', page: 0 })
            }
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) =>
              onChange({ ...filters, category: (e.target.value as IncidentCategory) || '', page: 0 })
            }
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="NETWORK">NETWORK</option>
            <option value="DATABASE">DATABASE</option>
            <option value="SECURITY">SECURITY</option>
            <option value="APPLICATION">APPLICATION</option>
            <option value="HARDWARE">HARDWARE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        {/* Reset Filters */}
        <div className="flex items-end">
          {hasActiveFilters ? (
            <button
              onClick={onReset}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              Reset Filters
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 py-1.5 px-1 font-mono">
              Real-time API filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
