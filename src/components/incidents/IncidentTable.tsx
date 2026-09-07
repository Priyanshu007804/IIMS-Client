import React from 'react';
import { Incident, PageIncident, UserRole } from '../../types';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../common/Badge';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  UserCheck,
  Trash2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface IncidentTableProps {
  pageData: PageIncident | null;
  role: UserRole;
  isLoading?: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onEditIncident: (incident: Incident) => void;
  onAssignIncident: (incident: Incident) => void;
  onDeleteIncident: (incident: Incident) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  pageData,
  role,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  onEditIncident,
  onAssignIncident,
  onDeleteIncident,
}) => {
  const incidents = pageData?.content || [];
  const currentPage = pageData?.number ?? 0;
  const totalPages = pageData?.totalPages ?? 1;
  const totalElements = pageData?.totalElements ?? 0;
  const pageSize = pageData?.size ?? 10;

  const canEdit = role === 'ADMIN' || role === 'ENGINEER';
  const canAssign = role === 'ADMIN' || role === 'ENGINEER';
  const canDelete = role === 'ADMIN';

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm overflow-hidden flex flex-col">
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4 font-mono">Incident ID</th>
              <th className="py-3 px-4">Title &amp; Symptoms</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Reported By</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <AlertTriangle className="w-6 h-6 text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-300">No matching incidents found</p>
                    <p className="text-xs text-slate-500">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      #{incident.id ? incident.id.slice(-6) : '—'}
                    </Link>
                  </td>

                  {/* Title & Description preview */}
                  <td className="py-3.5 px-4 max-w-[260px]">
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="font-medium text-white hover:text-indigo-300 transition-colors block truncate"
                    >
                      {incident.title}
                    </Link>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {incident.description}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <CategoryBadge category={incident.category} />
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={incident.priority} size="sm" />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={incident.status} size="sm" />
                  </td>

                  {/* Reported By */}
                  <td className="py-3.5 px-4 font-mono text-slate-400 max-w-[140px] truncate text-[11px]">
                    {incident.reportedBy || <span className="text-slate-600">Unspecified</span>}
                  </td>

                  {/* Assigned To */}
                  <td className="py-3.5 px-4 font-mono max-w-[140px] truncate text-[11px]">
                    {incident.assignedTo ? (
                      <span className="text-sky-300 font-medium bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
                        {incident.assignedTo}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Created At */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    <span title={formatDate(incident.createdAt)}>
                      {formatRelativeTime(incident.createdAt)}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        to={`/incidents/${incident.id}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="View details & audit timeline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {canEdit && (
                        <button
                          onClick={() => onEditIncident(incident)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900/60 text-slate-300 hover:text-indigo-300 transition-colors"
                          title="Update ticket or transition status"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canAssign && (
                        <button
                          onClick={() => onAssignIncident(incident)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-900/60 text-slate-300 hover:text-sky-300 transition-colors"
                          title="Assign engineer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => onDeleteIncident(incident)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 transition-colors"
                          title="Delete incident (Admin only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-950/40 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="font-mono text-slate-300 ml-2">
            Showing {totalElements > 0 ? currentPage * pageSize + 1 : 0} -{' '}
            {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 0 || isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-slate-300">
            Page {currentPage + 1} of {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage + 1 >= totalPages || isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
