import React from 'react';
import type { ComfortAnalysis } from '../../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import ChartTitle from './ChartTitle';

interface ComfortDetailProps {
    data: ComfortAnalysis;
}

const ComfortDetail: React.FC<ComfortDetailProps> = ({ data }) => {
    const distributionData = [
        { name: 'Comfortable', value: data.comfortDistribution.comfortable, color: '#4ade80' },
        { name: 'Hot', value: data.comfortDistribution.hot, color: '#f87171' },
        { name: 'Cold', value: data.comfortDistribution.cold, color: '#60a5fa' },
    ].filter(d => d.value > 0);

    const trendData = data.yearlyStats.map(d => ({
        year: d.year,
        'Heat Index (98th percentile)': d.HI_max,
        'Wind Chill (2nd percentile)': d.WC_min,
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Comfort Distribution</ChartTitle>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            {/* Fix: The 'percent' prop from recharts can be undefined. Coalesce to 0 before performing arithmetic operations. */}
                            <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                {distributionData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Yearly Extreme "Feels Like" Trend</ChartTitle>
                 <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} unit="°C" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} formatter={(value: number) => [`${value.toFixed(1)}°C`]} />
                            <Legend />
                            <Line type="monotone" dataKey="Heat Index (98th percentile)" stroke="#f87171" strokeWidth={2} dot={false} connectNulls />
                            <Line type="monotone" dataKey="Wind Chill (2nd percentile)" stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {data.heatIndexDistribution.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                    <ChartTitle>Heat Index vs Actual Temp Distribution</ChartTitle>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.heatIndexDistribution} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} />
                                <Legend />
                                <Bar dataKey="Actual Temp" fill="#fb923c" opacity={0.6} />
                                <Bar dataKey="Heat Index" fill="#f87171" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
             {data.windChillDistribution.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                    <ChartTitle>Wind Chill vs Actual Temp Distribution</ChartTitle>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.windChillDistribution} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} />
                                <Legend />
                                <Bar dataKey="Actual Temp" fill="#81d4fa" opacity={0.6} />
                                <Bar dataKey="Wind Chill" fill="#60a5fa" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

             {data.humidityEffectOnHeat.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                    <ChartTitle>Humidity's Effect on Heat</ChartTitle>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={data.humidityEffectOnHeat} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="bin" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} unit="°C" label={{ value: 'Apparent Temp Increase', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                                <Tooltip formatter={(value: number) => [`+${value.toFixed(1)}°C`, "Feels Hotter"]} />
                                <Bar dataKey="value" name="Feels Hotter" fill="#f87171" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
             {data.windEffectOnCold.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                    <ChartTitle>Wind's Effect on Cold</ChartTitle>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={data.windEffectOnCold} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="bin" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} unit="°C" label={{ value: 'Apparent Temp Decrease', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}°C`, "Feels Colder"]} />
                                <Bar dataKey="value" name="Feels Colder" fill="#60a5fa" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComfortDetail;