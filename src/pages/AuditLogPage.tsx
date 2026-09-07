import React, { useState, useEffect } from 'react';
import { getIncidentsApi, getAuditLogsApi } from '../api/incidents';
import { Incident, AuditLog } from '../types';
import { AuditTimeline } from '../components/incidents/AuditTimeline';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { History, Search, Shield, ArrowRight, Clock, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AuditLogPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [manualInputId, setManualInputId] = useState<string>('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  // Load available incidents for quick selector
  useEffect(() => {
    getIncidentsApi({ size: 20, sort: 'createdAt,desc' })
      .then((res) => {
        const list = res?.content || [];
        setIncidents(list);
        if (list.length > 0) {
          setSelectedIncidentId(list[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch incident list for audit', err);
      });
  }, []);

  // Whenever selected incident changes, load audit trail
  useEffect(() => {
    if (!selectedIncidentId) return;
    setIsLoading(true);
    setError(null);
    getAuditLogsApi(selectedIncidentId)
      .then((data) => {
        setLogs(data || []);
      })
      .catch((err) => {
        console.error('Failed to load audit trail', err);
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedIncidentId]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInputId.trim()) {
      setSelectedIncidentId(manualInputId.trim());
    }
  };

  const currentIncident = incidents.find((i) => i.id === selectedIncidentId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Compliance &amp; Audit Trail
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            Audit API
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically recorded operational changes, role actions, assignments, and status transitions
        </p>
      </div>

      {/* Incident Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dropdown Selector */}
        <div className="md:col-span-2 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm space-y-2">
          <label htmlFor="audit-incident-selector" className="block text-xs font-semibold text-slate-300">
            Select Incident to Inspect Audit Logs
          </label>
          <select
            id="audit-incident-selector"
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          >
            {incidents.length === 0 && <option value="">No incidents available</option>}
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                #{inc.id.slice(-6)}: {inc.title} ({inc.status})
              </option>
            ))}
          </select>
        </div>

        {/* Or direct ID search */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm space-y-2">
          <label htmlFor="audit-manual-id" className="block text-xs font-semibold text-slate-300">
            Or Enter Incident UUID
          </label>
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <input
              id="audit-manual-id"
              type="text"
              value={manualInputId}
              onChange={(e) => setManualInputId(e.target.value)}
              placeholder="e.g. 64d9f..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Selected Incident Context Bar */}
      {selectedIncidentId && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-white">
              {currentIncident ? currentIncident.title : `Incident #${selectedIncidentId}`}
            </span>
            <span className="text-slate-500 font-mono">({selectedIncidentId})</span>
          </div>

          <Link
            to={`/incidents/${selectedIncidentId}`}
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            <span>Open Incident View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {error && <ErrorBanner error={error} onRetry={() => setSelectedIncidentId(selectedIncidentId)} />}

      {/* Audit Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Audit Event Stream</h2>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {logs.length} Logged Entries
          </span>
        </div>

        <AuditTimeline logs={logs} isLoading={isLoading} />
      </div>
    </div>
  );
};
