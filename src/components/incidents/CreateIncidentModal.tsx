import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { IncidentCategory, IncidentPriority, IncidentRequest } from '../../types';
import { createIncidentApi } from '../../api/incidents';
import { useToast } from '../../context/ToastContext';
import { ApiError } from '../../api/client';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('HIGH');
  const [category, setCategory] = useState<IncidentCategory>('APPLICATION');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('HIGH');
    setCategory('APPLICATION');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Incident title is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Detailed incident description is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: IncidentRequest = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
      };

      const created = await createIncidentApi(payload);
      toast.success('Incident Created', `Incident #${created.id?.slice(-6) || ''} logged successfully.`);
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Incident creation error', err);
      if (err instanceof ApiError) {
        setErrorMessage(err.message || 'Backend rejected incident creation.');
      } else {
        setErrorMessage('Failed to connect to the backend.');
      }
      toast.error('Creation Failed', err.message);
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
      title="Create New Incident"
      subtitle="Report an operational interruption or service outage directly to the queue"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="incident-title" className="text-xs font-semibold text-slate-200">
              Incident Summary / Title <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">{title.length}/150</span>
          </div>
          <input
            id="incident-title"
            type="text"
            required
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Latency Spike on Payment Gateway API"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Priority and Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="incident-priority" className="block text-xs font-semibold text-slate-200 mb-1.5">
              Severity / Priority <span className="text-rose-400">*</span>
            </label>
            <select
              id="incident-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as IncidentPriority)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
            >
              <option value="LOW">LOW - Minimal operational impact</option>
              <option value="MEDIUM">MEDIUM - Degraded component performance</option>
              <option value="HIGH">HIGH - Critical service impaired</option>
              <option value="CRITICAL">CRITICAL - Complete system outage</option>
            </select>
          </div>

          <div>
            <label htmlFor="incident-category" className="block text-xs font-semibold text-slate-200 mb-1.5">
              Service Category <span className="text-rose-400">*</span>
            </label>
            <select
              id="incident-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as IncidentCategory)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="incident-description" className="text-xs font-semibold text-slate-200">
              Detailed Description &amp; Symptoms <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">{description.length}/2000</span>
          </div>
          <textarea
            id="incident-description"
            rows={4}
            required
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the observed issue, affected systems, error traces, and steps to reproduce..."
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-y"
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
            id="submit-create-incident-btn"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-950/50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Publishing to Queue...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Incident</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
