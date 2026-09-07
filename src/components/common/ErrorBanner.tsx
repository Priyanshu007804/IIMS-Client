import React from 'react';
import { AlertCircle, ShieldAlert, RefreshCw } from 'lucide-react';
import { ApiError } from '../../api/client';

interface ErrorBannerProps {
  error: ApiError | Error | string | null;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onRetry, className = '' }) => {
  if (!error) return null;

  const isApiError = error instanceof ApiError;
  const status = isApiError ? error.status : null;
  const message = typeof error === 'string' ? error : error.message;

  const isForbidden = status === 403;
  const isNotFound = status === 404;
  const isConflict = status === 409;

  return (
    <div
      className={`p-4 rounded-xl border flex items-start justify-between gap-3 backdrop-blur-sm ${
        isForbidden
          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          : isConflict
          ? 'bg-orange-950/40 border-orange-500/40 text-orange-200'
          : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {isForbidden ? (
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-tight text-white">
            {isForbidden
              ? 'Access Denied (Role Restriction)'
              : isConflict
              ? 'Conflict / State Transition Rule'
              : isNotFound
              ? 'Resource Not Found'
              : 'Service Communication Error'}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">{message}</p>
          {isForbidden && (
            <p className="mt-2 text-[11px] text-amber-300/80 bg-amber-900/30 px-2.5 py-1 rounded-md border border-amber-500/20 inline-block">
              Tip: Newly registered accounts receive the USER role. You can switch your active role preview to ENGINEER or ADMIN in the top bar to evaluate permitted workflows.
            </p>
          )}
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};
