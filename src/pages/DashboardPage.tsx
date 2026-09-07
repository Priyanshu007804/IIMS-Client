import React, { useState, useEffect, useCallback } from 'react';
import {
  getDashboardSummaryApi,
  getIncidentsByCategoryApi,
  getIncidentsByPriorityApi,
} from '../api/dashboard';
import { getIncidentsApi } from '../api/incidents';
import {
  CategoryBreakdown,
  DashboardSummaryResponse,
  Incident,
  PriorityBreakdown,
} from '../types';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { PriorityChart } from '../components/dashboard/PriorityChart';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { RecentIncidents } from '../components/dashboard/RecentIncidents';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { useAuth } from '../context/AuthContext';
import {
  RotateCcw,
  Sparkles,
  Shield,
  Activity,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, activeRole } = useAuth();

  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [priorityData, setPriorityData] = useState<PriorityBreakdown | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const loadDashboardData = useCallback(async () => {
    setError(null);
    try {
      const [sumRes, prioRes, catRes, incRes] = await Promise.all([
        getDashboardSummaryApi(),
        getIncidentsByPriorityApi(),
        getIncidentsByCategoryApi(),
        getIncidentsApi({ page: 0, size: 5, sort: 'createdAt,desc' }),
      ]);

      setSummary(sumRes);
      setPriorityData(prioRes);
      setCategoryData(catRes);
      setRecentIncidents(incRes?.content || []);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Operational Command Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time incident volumes, severity distribution, and triage status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Error banner if any */}
      {error && <ErrorBanner error={error} onRetry={loadDashboardData} />}

      {/* KPI Stat Cards */}
      <SummaryCards summary={summary} isLoading={isLoading} />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PriorityChart data={priorityData} isLoading={isLoading} />
        <CategoryChart data={categoryData} isLoading={isLoading} />
      </div>

      {/* Recent Incidents Queue */}
      <RecentIncidents incidents={recentIncidents} isLoading={isLoading} />
    </div>
  );
};
