import React, { useState, useEffect, useCallback } from 'react';
import { getIncidentsApi, deleteIncidentApi } from '../api/incidents';
import { Incident, IncidentQueryParams, PageIncident } from '../types';
import { IncidentFilters } from '../components/incidents/IncidentFilters';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { UpdateIncidentModal } from '../components/incidents/UpdateIncidentModal';
import { AssignEngineerModal } from '../components/incidents/AssignEngineerModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { TableSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../api/client';
import { AlertOctagon, Plus, Shield } from 'lucide-react';
import { CreateIncidentModal } from '../components/incidents/CreateIncidentModal';

export const IncidentsPage: React.FC = () => {
  const { activeRole } = useAuth();
  const toast = useToast();

  const [filters, setFilters] = useState<IncidentQueryParams>({
    search: '',
    priority: '',
    status: '',
    category: '',
    page: 0,
    size: 10,
    sort: 'createdAt,desc',
  });

  const [pageData, setPageData] = useState<PageIncident | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedIncidentForEdit, setSelectedIncidentForEdit] = useState<Incident | null>(null);
  const [selectedIncidentForAssign, setSelectedIncidentForAssign] = useState<Incident | null>(null);
  const [selectedIncidentForDelete, setSelectedIncidentForDelete] = useState<Incident | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchIncidents = useCallback(async () => {
    setError(null);
    try {
      const data = await getIncidentsApi(filters);
      setPageData(data);
    } catch (err: any) {
      console.error('Failed to fetch incidents', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchIncidents();
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      priority: '',
      status: '',
      category: '',
      page: 0,
      size: 10,
      sort: 'createdAt,desc',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedIncidentForDelete) return;
    setIsDeleting(true);

    try {
      await deleteIncidentApi(selectedIncidentForDelete.id);
      toast.success(
        'Incident Deleted',
        `Incident #${selectedIncidentForDelete.id.slice(-6)} was permanently removed.`
      );
      setSelectedIncidentForDelete(null);
      fetchIncidents();
    } catch (err: any) {
      console.error('Delete error', err);
      if (err instanceof ApiError && err.status === 403) {
        toast.error('Access Denied', 'Only ADMIN role is authorized on the backend to delete incidents.');
      } else {
        toast.error('Delete Failed', err.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Incident Management Queue
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {pageData?.totalElements ?? 0} Tickets
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, assign, and transition incident states through the enterprise lifecycle
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-950/50 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Incident</span>
        </button>
      </div>

      {/* Error display */}
      {error && <ErrorBanner error={error} onRetry={fetchIncidents} />}

      {/* Filter Toolbar */}
      <IncidentFilters
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Table or Loading Skeleton */}
      {isLoading ? (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4">
          <TableSkeleton rows={8} />
        </div>
      ) : (
        <IncidentTable
          pageData={pageData}
          role={activeRole}
          isLoading={isRefreshing}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onPageSizeChange={(s) => setFilters((prev) => ({ ...prev, size: s, page: 0 }))}
          onEditIncident={(inc) => setSelectedIncidentForEdit(inc)}
          onAssignIncident={(inc) => setSelectedIncidentForAssign(inc)}
          onDeleteIncident={(inc) => setSelectedIncidentForDelete(inc)}
        />
      )}

      {/* Create Incident Modal */}
      <CreateIncidentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchIncidents}
      />

      {/* Update Incident Modal */}
      <UpdateIncidentModal
        isOpen={Boolean(selectedIncidentForEdit)}
        onClose={() => setSelectedIncidentForEdit(null)}
        incident={selectedIncidentForEdit}
        onSuccess={() => {
          setSelectedIncidentForEdit(null);
          fetchIncidents();
        }}
      />

      {/* Assign Engineer Modal */}
      <AssignEngineerModal
        isOpen={Boolean(selectedIncidentForAssign)}
        onClose={() => setSelectedIncidentForAssign(null)}
        incident={selectedIncidentForAssign}
        onSuccess={() => {
          setSelectedIncidentForAssign(null);
          fetchIncidents();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedIncidentForDelete)}
        onClose={() => setSelectedIncidentForDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Incident"
        message={`Are you sure you want to permanently delete incident #${
          selectedIncidentForDelete?.id.slice(-6) || ''
        }: "${selectedIncidentForDelete?.title}"? This action cannot be undone.`}
        confirmText="Permanently Delete"
        cancelText="Keep Incident"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
