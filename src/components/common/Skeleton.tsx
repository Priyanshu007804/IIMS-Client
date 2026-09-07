import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="w-full h-14 rounded-xl bg-slate-800/40 border border-slate-800/60 animate-pulse flex items-center px-4 gap-4"
        >
          <div className="w-20 h-4 bg-slate-700/50 rounded" />
          <div className="flex-1 h-4 bg-slate-700/50 rounded" />
          <div className="w-24 h-4 bg-slate-700/50 rounded" />
          <div className="w-20 h-5 bg-slate-700/50 rounded-full" />
          <div className="w-24 h-5 bg-slate-700/50 rounded-md" />
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-24 h-4 bg-slate-800 rounded" />
        <div className="w-8 h-8 bg-slate-800 rounded-xl" />
      </div>
      <div className="w-16 h-8 bg-slate-700 rounded" />
      <div className="w-32 h-3 bg-slate-800 rounded" />
    </div>
  );
};
