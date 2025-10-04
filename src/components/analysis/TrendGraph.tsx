import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface SparklineGraphProps {
    data: any[];
    dataKey: string;
    color: string;
}

const SparklineGraph: React.FC<SparklineGraphProps> = ({ data, dataKey, color }) => {
    const validData = data.filter(d => d[dataKey] !== null && !isNaN(d[dataKey]));

    if (validData.length < 2) {
        return <div className="h-10 w-full flex items-center justify-center text-xs text-gray-500">Not enough data</div>;
    }

    return (
        <div className="h-10 w-full -ml-3">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={validData}>
                    <YAxis domain={['dataMin', 'dataMax']} hide={true} />
                    <Line 
                        type="monotone" 
                        dataKey={dataKey} 
                        stroke={color} 
                        strokeWidth={2} 
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SparklineGraph;
