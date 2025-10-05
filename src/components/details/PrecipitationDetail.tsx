import React from 'react';
import type { PrecipitationAnalysis } from '../../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import ChartTitle from './ChartTitle';

interface PrecipitationDetailProps {
    data: PrecipitationAnalysis;
}

const PrecipitationDetail: React.FC<PrecipitationDetailProps> = ({ data }) => {
    const hasData = data.probRain > 0 || data.probSnow > 0;
    const probDry = 100 - data.probRain - data.probSnow;

    const conditionData = [
        { name: 'Rain', value: data.probRain, color: '#60a5fa' },
        { name: 'Snow', value: data.probSnow, color: '#a78bfa' },
        { name: 'Dry', value: probDry, color: '#6b7280' },
    ].filter(d => d.value > 1);

    const trendData = data.yearlyStats.map(d => ({
        year: d.year,
        'Total Rain': d.total_rain,
        'Total Snow': d.total_snow,
    }));

    const humidityEffectData = data.humidityEffect.map(d => ({
        name: d.bin,
        'Rain Chance': d.rainProb,
        'Snow Chance': d.snowProb,
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Chance of Weather Condition</ChartTitle>
                {hasData ? (
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                {/* Fix: The 'percent' prop from recharts can be undefined. Coalesce to 0 before performing arithmetic operations. */}
                                <Pie data={conditionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    {conditionData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : <p className="text-center text-gray-400 m-auto">No precipitation recorded.</p>}
            </div>
            
             <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Rainfall Intensity Distribution</ChartTitle>
                {data.rainIntensityDistribution.length > 0 ? (
                    <div className="flex-grow">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.rainIntensityDistribution} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} label={{ value: 'Number of Days', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} />
                                <Bar dataKey="count" fill="#60a5fa" name="Days" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ): <p className="text-center text-gray-400 m-auto">Not enough rain days for distribution.</p>}
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Humidity Effect on Precipitation</ChartTitle>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={humidityEffectData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis unit="%" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} formatter={(value: number) => `${value.toFixed(1)}%`} />
                            <Legend />
                            <Bar dataKey="Rain Chance" fill="#60a5fa" />
                            {data.hasSnow && <Bar dataKey="Snow Chance" fill="#a78bfa" />}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Temperature Effect on Rain Intensity</ChartTitle>
                 {data.temperatureEffect.rain.length > 0 ? (
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.temperatureEffect.rain} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="bin" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <YAxis unit="mm" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} formatter={(value: number) => [`${value.toFixed(1)} mm`, "Median Amount"]} />
                                <Bar dataKey="value" fill="#fb923c" name="Median Rainfall" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 ) : <p className="text-center text-gray-400 m-auto">Not enough data for temp/rain analysis.</p>}
            </div>

            <div className="lg:col-span-2 bg-gray-800/50 p-4 rounded-lg h-96 flex flex-col">
                <ChartTitle>Yearly Total Precipitation Trend</ChartTitle>
                 <div className="flex-grow">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} unit="mm" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4b5563' }} formatter={(value: number) => `${value.toFixed(1)} mm`} />
                            <Legend />
                            <Line type="monotone" dataKey="Total Rain" stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls />
                            {data.hasSnow && <Line type="monotone" dataKey="Total Snow" stroke="#a78bfa" strokeWidth={2} dot={false} connectNulls />}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default PrecipitationDetail;