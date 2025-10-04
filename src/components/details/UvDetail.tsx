import React from 'react';
import type { UvAnalysis } from '../../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import ChartTitle from './ChartTitle';

interface UvDetailProps {
    data: UvAnalysis;
}

const UvDetail: React.FC<UvDetailProps> = ({ data }) => {
    const distributionData = data.distribution
        .map(d => ({ ...d, name: d.name, value: d.probability, color: d.color }))
        .filter(d => d.value > 1);

    const trendData = data.yearlyStats.map(d => ({
        year: d.year,
        'Median Clear Sky UV': d.UV_clearsky_median,
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col">
                <ChartTitle>Clear Sky UV Index Distribution</ChartTitle>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            {/* FIX: The 'percent' prop from recharts can be undefined. Coalesce to 0 before performing arithmetic operations to prevent type errors. */}
                            <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                {distributionData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col">
                <ChartTitle>Yearly Median Clear Sky UV Trend</ChartTitle>
                 <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <Tooltip
                                 contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563', borderRadius: '0.5rem' }}
                                 labelStyle={{ color: '#e5e7eb' }}
                                 formatter={(value: number) => [`${value.toFixed(1)}`]}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="Median Clear Sky UV" stroke="#a78bfa" strokeWidth={2} dot={false} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default UvDetail;
