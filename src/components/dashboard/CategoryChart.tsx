import React from 'react';
import { CategoryBreakdown } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface CategoryChartProps {
  data: CategoryBreakdown | null;
  isLoading?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  PAYMENT: '#10B981',
  NETWORK: '#06B6D4',
  DATABASE: '#A855F7',
  SECURITY: '#F43F5E',
  APPLICATION: '#6366F1',
  HARDWARE: '#F59E0B',
  OTHER: '#64748B',
};

export const CategoryChart: React.FC<CategoryChartProps> = ({ data, isLoading = false }) => {
  if (isLoading || !data) {
    return (
      <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center justify-center">
        <span className="text-xs text-slate-500">Loading category analytics...</span>
      </div>
    );
  }

  const chartData = Object.entries(data)
    .map(([category, count]) => ({
      category,
      count: Number(count),
      color: CATEGORY_COLORS[category] || '#6366F1',
    }))
    .sort((a, b) => b.count - a.count);

  const total = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Incidents by Category</h3>
          <p className="text-xs text-slate-400">Functional domain distribution</p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {chartData.length} Categories
        </span>
      </div>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500 min-h-[200px]">
          No category data available
        </div>
      ) : (
        <div className="flex-1 min-h-[220px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
            >
              <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="category"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={85}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700/80 p-2.5 rounded-xl text-xs shadow-xl">
                        <div className="font-semibold text-white">{d.category}</div>
                        <div className="text-slate-300 font-mono mt-0.5">{d.count} tickets</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
