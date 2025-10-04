import React from 'react';
import type { WindAnalysis } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Cell } from 'recharts';
import ChartTitle from './ChartTitle';

interface WindDetailProps {
    data: WindAnalysis;
}

const WindDetail: React.FC<WindDetailProps> = ({ data }) => {
    const beaufortData = data.beaufortDistribution.filter(d => d.probability > 1);
    
    const trendData = data.yearlyStats.map(d => ({
        year: d.year,
        'Median Max Wind': d.WS_MAX_median,
        'Median Avg Wind': d.WS_median,
    }));
    
    const beaufortColors = ['#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Max Wind Speed Distribution</ChartTitle>
                <div className="flex-grow">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.windSpeedDistribution} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} label={{ value: 'Number of Days', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} formatter={(value: number) => `${value} days`} />
                            <Bar dataKey="count" fill="#2dd4bf" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Beaufort Scale Distribution (Max Wind)</ChartTitle>
                <div className="flex-grow">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={beaufortData} margin={{ top: 5, right: 20, left: 10, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis unit="%" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} formatter={(value: number) => `${value.toFixed(1)}%`} />
                            <Bar dataKey="probability">
                                {beaufortData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={beaufortColors[index % beaufortColors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="lg:col-span-2 bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Yearly Median Wind Speed Trend</ChartTitle>
                <div className="flex-grow">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} unit=" km/h" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} formatter={(value: number) => `${value.toFixed(1)} km/h`} />
                            <Legend />
                            <Line type="monotone" dataKey="Median Max Wind" stroke="#2dd4bf" strokeWidth={2} dot={false} connectNulls />
                            <Line type="monotone" dataKey="Median Avg Wind" stroke="#a78bfa" strokeWidth={2} dot={false} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default WindDetail;