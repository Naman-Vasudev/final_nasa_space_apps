import React from 'react';
import type { TemperatureAnalysis } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Scatter, Line } from 'recharts';
import ChartTitle from './ChartTitle';

interface TemperatureDetailProps {
    data: TemperatureAnalysis;
}

interface TrendPoint {
    year: number;
    'Median Max Temp': number;
    'Median Min Temp': number;
    'Max Trend'?: number;
    'Min Trend'?: number;
}

const TemperatureDetail: React.FC<TemperatureDetailProps> = ({ data }) => {
    const percentileData = [
        {
            name: 'High Temp',
            range: [data.percentiles.max.p10, data.percentiles.max.p90],
            median: data.percentiles.max.p50
        },
        {
            name: 'Low Temp',
            range: [data.percentiles.min.p10, data.percentiles.min.p90],
            median: data.percentiles.min.p50
        },
         {
            name: 'Avg Temp',
            range: [data.percentiles.avg.p10, data.percentiles.avg.p90],
            median: data.percentiles.avg.p50
        },
    ];
    
    const probabilityData = [
        ...data.heatProbabilities.map(p => ({ name: `>${p.threshold}°C`, probability: p.probability, fill: '#f87171' })),
        ...data.coldProbabilities.map(p => ({ name: `<${p.threshold}°C`, probability: p.probability, fill: '#60a5fa' }))
    ].filter(p => p.probability > 1);

    const trendData: TrendPoint[] = data.yearlyStats.map(d => ({
        year: d.year,
        'Median Max Temp': d.T2M_MAX_median,
        'Median Min Temp': d.T2M_MIN_median,
    }));
    
    // Calculate trend line points
    if (data.trends.max.slope !== null && data.trends.max.significant && trendData.length > 0) {
        const firstYear = trendData[0].year;
        const lastYear = trendData[trendData.length - 1].year;
        const firstY = trendData[0]['Median Max Temp'];
        if (typeof firstY === 'number' && !isNaN(firstY)) {
            trendData[0]['Max Trend'] = firstY;
            trendData[trendData.length - 1]['Max Trend'] = firstY + data.trends.max.slope * (lastYear - firstYear);
        }
    }
    if (data.trends.min.slope !== null && data.trends.min.significant && trendData.length > 0) {
        const firstYear = trendData[0].year;
        const lastYear = trendData[trendData.length - 1].year;
        const firstY = trendData[0]['Median Min Temp'];
        if (typeof firstY === 'number' && !isNaN(firstY)) {
            trendData[0]['Min Trend'] = firstY;
            trendData[trendData.length - 1]['Min Trend'] = firstY + data.trends.min.slope * (lastYear - firstYear);
        }
    }


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Typical Temperature Range</ChartTitle>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={percentileData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis type="number" unit="°C" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} width={80} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} 
                                formatter={(value: unknown, name: string) => {
                                    if (name === 'P10-P90 Range' && Array.isArray(value) && typeof value[0] === 'number' && typeof value[1] === 'number') {
                                        return [`${value[0].toFixed(1)} - ${value[1].toFixed(1)}°C`, 'P10-P90 Range'];
                                    }
                                    if (name === 'Median' && typeof value === 'number') {
                                        return [`${value.toFixed(1)}°C`, 'Median'];
                                    }
                                    return ['N/A', null];
                                }}
                            />
                            <Bar dataKey="range" name="P10-P90 Range" fill="#fb923c" opacity={0.4} />
                             <Bar dataKey="median" name="Median" fill="#fb923c" barSize={10} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Extreme Temperature Probabilities</ChartTitle>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={probabilityData} margin={{ top: 5, right: 20, left: 10, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis unit="%" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <Tooltip 
                                formatter={(value: unknown) => {
                                    if (typeof value === 'number') {
                                        return [`${value.toFixed(1)}%`, 'Probability'];
                                    }
                                    return ['N/A', 'Probability'];
                                }} 
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} 
                            />
                            <Bar dataKey="probability" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="lg:col-span-2 bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Yearly Median Temperature Trend</ChartTitle>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} unit="°C" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} 
                                formatter={(value: unknown) => typeof value === 'number' ? `${value.toFixed(1)}°C` : null}
                            />
                            <Legend />
                            <Scatter name="Max Temp Data" dataKey="Median Max Temp" fill="#fb923c" shape="circle" />
                             <Scatter name="Min Temp Data" dataKey="Median Min Temp" fill="#60a5fa" shape="circle" />
                            <Line dataKey="Max Trend" stroke="#e11d48" strokeWidth={3} dot={false} activeDot={false} legendType="none" connectNulls/>
                            <Line dataKey="Min Trend" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={false} legendType="none" connectNulls/>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default TemperatureDetail;