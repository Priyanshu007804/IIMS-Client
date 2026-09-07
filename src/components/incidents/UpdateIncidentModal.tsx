import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import {
  Incident,
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
  IncidentUpdateRequest,
} from '../../types';
import { updateIncidentApi } from '../../api/incidents';
import { useToast } from '../../context/ToastContext';
import { ApiError } from '../../api/client';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { VALID_STATUS_TRANSITIONS } from '../../utils/formatters';

interface UpdateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  onSuccess: (updated: Incident) => void;
}

export const UpdateIncidentModal: React.FC<UpdateIncidentModalProps> = ({
  isOpen,
  onClose,
  incident,
  onSuccess,
}) => {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('HIGH');
  const [status, setStatus] = useState<IncidentStatus>('OPEN');
  const [category, setCategory] = useState<IncidentCategory>('APPLICATION');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (incident) {
      setTitle(incident.title || '');
      setDescription(incident.description || '');
      setPriority(incident.priority || 'HIGH');
      setStatus(incident.status || 'OPEN');
      setCategory(incident.category || 'APPLICATION');
      setErrorMessage(null);
    }
  }, [incident, isOpen]);

  if (!incident) return null;

  // Compute allowable status transitions based on current backend status
  const currentStatus = incident.status;
  const allowedNextStatuses = [
    currentStatus,
    ...(VALID_STATUS_TRANSITIONS[currentStatus] || []),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setIsSubmitting(true);
    try {
      const payload: IncidentUpdateRequest = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        category,
      };

      const updated = await updateIncidentApi(incident.id, payload);
      toast.success('Incident Updated', `Incident #${incident.id.slice(-6)} updated.`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error('Update incident error', err);
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrorMessage('State Conflict: Incident cannot undergo this status transition.');
        } else if (err.status === 403) {
          setErrorMessage('Access Denied (403): Only ENGINEER and ADMIN roles are permitted to edit or transition incidents.');
        } else {
          setErrorMessage(err.message || 'Update failed.');
        }
      } else {
        setErrorMessage('Failed to connect to backend.');
      }
      toast.error('Update Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title={`Update Incident #${incident.id.slice(-6)}`}
      subtitle="Modify incident details, priority, or transition lifecycle status"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Lifecycle Status Transition */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Status Transition Lifecycle
          </label>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-mono">
            <span className={currentStatus === 'OPEN' ? 'text-indigo-400 font-bold' : ''}>OPEN</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className={currentStatus === 'IN_PROGRESS' ? 'text-amber-400 font-bold' : ''}>IN_PROGRESS</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className={currentStatus === 'RESOLVED' ? 'text-emerald-400 font-bold' : ''}>RESOLVED</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className={currentStatus === 'CLOSED' ? 'text-slate-400 font-bold' : ''}>CLOSED</span>
          </div>

          <select
            id="update-incident-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as IncidentStatus)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {allowedNextStatuses.map((s) => (
              <option key={s} value={s}>
                {s === currentStatus ? `Current: ${s}` : `Transition to -> ${s}`}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="update-incident-title" className="block text-xs font-semibold text-slate-200 mb-1.5">
            Title
          </label>
          <input
            id="update-incident-title"
            type="text"
            required
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Priority and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="update-incident-priority" className="block text-xs font-semibold text-slate-200 mb-1.5">
              Priority
            </label>
            <select
              id="update-incident-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as IncidentPriority)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div>
            <label htmlFor="update-incident-category" className="block text-xs font-semibold text-slate-200 mb-1.5">
              Category
            </label>
            <select
              id="update-incident-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as IncidentCategory)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="PAYMENT">PAYMENT</option>
              <option value="NETWORK">NETWORK</option>
              <option value="DATABASE">DATABASE</option>
              <option value="SECURITY">SECURITY</option>
              <option value="APPLICATION">APPLICATION</option>
              <option value="HARDWARE">HARDWARE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="update-incident-description" className="block text-xs font-semibold text-slate-200 mb-1.5">
            Description
          </label>
          <textarea
            id="update-incident-description"
            rows={4}
            required
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="submit-update-incident-btn"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-950/50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating Incident...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
