import React from 'react';
import type { HumidityAnalysis } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import ChartTitle from './ChartTitle';

interface HumidityDetailProps {
    data: HumidityAnalysis;
}

const HumidityDetail: React.FC<HumidityDetailProps> = ({ data }) => {
    const trendData = data.yearlyStats.map(d => ({
        year: d.year,
        'Relative Humidity': d.RH_median,
        'Specific Humidity': d.QV_median,
    }));
    
    const exceedanceData = data.exceedanceProbabilities.relative.map((rh, index) => ({
        name: rh.category.replace('_', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
        'Relative Humidity': rh.probability,
        'Specific Humidity': data.exceedanceProbabilities.specific[index].probability,
    }));


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                 <ChartTitle>Relative Humidity Distribution</ChartTitle>
                 <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.humidityDistribution} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                             <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                             <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} label={{ value: 'Number of Days', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                             <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} formatter={(value: number) => [`${value} days`]} />
                             <Bar dataKey="count" fill="#22d3ee" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>High Humidity Exceedance Probability</ChartTitle>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={exceedanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis unit="%" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} formatter={(value: number) => `${value.toFixed(1)}%`} />
                            <Legend />
                            <Bar dataKey="Relative Humidity" fill="#22d3ee" />
                            <Bar dataKey="Specific Humidity" fill="#a78bfa" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-2 bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Yearly Median Humidity Trend</ChartTitle>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9ca3af' }} unit="%" />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} unit="g/kg" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} formatter={(value: number, name: string) => [`${value.toFixed(2)} ${name.includes('Relative') ? '%' : 'g/kg'}`]} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="Relative Humidity" stroke="#22d3ee" strokeWidth={2} dot={false} connectNulls />
                            <Line yAxisId="right" type="monotone" dataKey="Specific Humidity" stroke="#a78bfa" strokeWidth={2} dot={false} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default HumidityDetail;