'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface MasteryHistoryPoint {
  date: string;
  overall: number;
  regularization: number;
  precisionRecall: number;
  optimization: number;
}

const DEFAULT_HISTORY: MasteryHistoryPoint[] = [
  { date: 'Sep 28', overall: 35, regularization: 25, precisionRecall: 40, optimization: 45 },
  { date: 'Sep 30', overall: 42, regularization: 32, precisionRecall: 48, optimization: 58 },
  { date: 'Oct 01', overall: 51, regularization: 38, precisionRecall: 52, optimization: 68 },
  { date: 'Oct 02', overall: 58, regularization: 40, precisionRecall: 55, optimization: 74 },
  { date: 'Today', overall: 64, regularization: 42, precisionRecall: 58, optimization: 78 },
];

export function MasteryChart({ data = DEFAULT_HISTORY }: { data?: MasteryHistoryPoint[] }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#1D2024" opacity={0.8} />
          <XAxis dataKey="date" stroke="#7E8078" tick={{ fontSize: 11, fill: '#7E8078' }} />
          <YAxis domain={[0, 100]} stroke="#7E8078" tick={{ fontSize: 11, fill: '#7E8078' }} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            formatter={(value) => [`${value}%`, '']}
            contentStyle={{
              borderRadius: '8px',
              fontSize: '12px',
              backgroundColor: '#141619',
              border: '1px solid #1D2024',
              color: '#F6F5EE',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#C8C6B9' }} />
          <Line
            type="monotone"
            dataKey="overall"
            name="Overall Mastery"
            stroke="#E06D3B"
            strokeWidth={3}
            dot={{ r: 4, fill: '#E06D3B' }}
          />
          <Line
            type="monotone"
            dataKey="regularization"
            name="Regularization"
            stroke="#C94A44"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="precisionRecall"
            name="Precision vs Recall"
            stroke="#D48838"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="optimization"
            name="Optimization & GD"
            stroke="#3E8E68"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
