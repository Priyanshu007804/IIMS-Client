import React from 'react';
import { PriorityBreakdown } from '../../types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { PRIORITY_CONFIG } from '../../utils/formatters';

interface PriorityChartProps {
  data: PriorityBreakdown | null;
  isLoading?: boolean;
}

export const PriorityChart: React.FC<PriorityChartProps> = ({ data, isLoading = false }) => {
  if (isLoading || !data) {
    return (
      <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center justify-center">
        <span className="text-xs text-slate-500">Loading priority analytics...</span>
      </div>
    );
  }

  const chartData = [
    { name: 'CRITICAL', value: data['CRITICAL'] || 0, color: '#EF4444' },
    { name: 'HIGH', value: data['HIGH'] || 0, color: '#F97316' },
    { name: 'MEDIUM', value: data['MEDIUM'] || 0, color: '#3B82F6' },
    { name: 'LOW', value: data['LOW'] || 0, color: '#10B981' },
  ].filter((item) => item.value > 0);

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Incidents by Priority</h3>
          <p className="text-xs text-slate-400">Severity tier distribution</p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {total} Active
        </span>
      </div>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500 min-h-[200px]">
          No priority data available
        </div>
      ) : (
        <div className="flex-1 min-h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0F172A" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700/80 p-2.5 rounded-xl text-xs shadow-xl">
                        <div className="font-semibold text-white">{d.name}</div>
                        <div className="text-slate-300 font-mono mt-0.5">
                          {d.value} incidents ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-slate-300 font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
