import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Incident } from '../../types';
import { assignIncidentApi } from '../../api/incidents';
import { useToast } from '../../context/ToastContext';
import { ApiError } from '../../api/client';
import { UserCheck, AlertCircle } from 'lucide-react';

interface AssignEngineerModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  onSuccess: (updated: Incident) => void;
}

export const AssignEngineerModal: React.FC<AssignEngineerModalProps> = ({
  isOpen,
  onClose,
  incident,
  onSuccess,
}) => {
  const toast = useToast();
  const [engineerEmail, setEngineerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!incident) return null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!engineerEmail.trim()) {
      setErrorMessage('Engineer email is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await assignIncidentApi(incident.id, engineerEmail.trim());
      toast.success('Engineer Assigned', `Assigned to ${engineerEmail.trim()}`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error('Assign error', err);
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setErrorMessage('Access Denied (403): You must have ENGINEER or ADMIN role on the backend to assign incidents.');
        } else {
          setErrorMessage(err.message || 'Assignment failed.');
        }
      } else {
        setErrorMessage('Failed to connect to backend.');
      }
      toast.error('Assignment Failed', err.message);
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
      title="Assign Incident to Engineer"
      subtitle={`Ticket #${incident.id.slice(-6)} - ${incident.title}`}
      maxWidth="md"
    >
      <form onSubmit={handleAssign} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {incident.assignedTo && (
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-500">Currently Assigned: </span>
            <span className="font-semibold text-white font-mono">{incident.assignedTo}</span>
          </div>
        )}

        <div>
          <label htmlFor="engineer-email" className="block text-xs font-semibold text-slate-200 mb-1.5">
            Engineer Email Address <span className="text-rose-400">*</span>
          </label>
          <input
            id="engineer-email"
            type="email"
            required
            value={engineerEmail}
            onChange={(e) => setEngineerEmail(e.target.value)}
            placeholder="engineer@iims.com"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <div className="text-[11px] text-slate-400 mb-1.5">Quick team suggestions:</div>
          <div className="flex flex-wrap gap-1.5">
            {['engineer_demo@iims.com', 'devops@iims.com', 'sre-oncall@iims.com'].map((email) => (
              <button
                key={email}
                type="button"
                onClick={() => setEngineerEmail(email)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-mono transition-colors"
              >
                {email}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="submit-assign-engineer-btn"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-950/50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Assigning...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Assign Engineer</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
