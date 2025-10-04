import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { AnalysisData } from '../../types';

interface InteractiveGraphProps {
    analysis: AnalysisData;
    visibleParameters: Record<string, boolean>;
}

const parameterConfig: Record<string, { color: string, name: string, unit: string, dataKey: string }> = {
    temperature: { color: '#fb923c', name: 'Max Temp', unit: '°C', dataKey: 'temperature' },
    comfort: { color: '#4ade80', name: 'Feels Like', unit: '°C', dataKey: 'apparent_temp' },
    precipitation: { color: '#60a5fa', name: 'Rain Chance', unit: '%', dataKey: 'precipitation' },
    wind: { color: '#2dd4bf', name: 'Max Wind', unit: 'km/h', dataKey: 'wind' },
    humidity: { color: '#22d3ee', name: 'Humidity', unit: '%', dataKey: 'humidity' },
    uv: { color: '#a78bfa', name: 'UV Index', unit: '', dataKey: 'uv' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 p-3 rounded-lg shadow-lg">
                <p className="font-bold text-white mb-2">{label}</p>
                {payload.map((p: any) => (
                     <div key={p.name} style={{ color: p.color }}>
                        {`${p.name}: ${p.value.toFixed(1)} ${parameterConfig[p.dataKey]?.unit || ''}`}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const InteractiveGraph: React.FC<InteractiveGraphProps> = ({ analysis, visibleParameters }) => {
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Climatology Over Date Window</h3>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysis.graphData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            interval={Math.floor(analysis.graphData.length / 10)}
                        />
                        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <ReferenceLine 
                             yAxisId="left"
                             x={analysis.graphData.find(d => d.dayOffset === 0)?.date} 
                             stroke="#f87171" 
                             strokeDasharray="4 4" 
                             strokeWidth={2}
                             label={{ value: 'Target Date', position: 'insideTopLeft', fill: '#f87171' }}
                        />

                        {Object.entries(parameterConfig).map(([key, config]) => 
                            visibleParameters[key] && (
                                <Line
                                    key={key}
                                    yAxisId={key === 'precipitation' || key === 'humidity' ? 'right' : 'left'}
                                    type="monotone"
                                    dataKey={config.dataKey}
                                    name={config.name}
                                    stroke={config.color}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                            )
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default InteractiveGraph;