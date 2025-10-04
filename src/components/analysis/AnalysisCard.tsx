import React, { useState } from 'react';
import SparklineGraph from './TrendGraph';

interface AnalysisCardProps {
    title: string;
    children: React.ReactNode;
    trendData?: any[];
    trendXKey?: string;
    trendYKey?: string;
    trendName?: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, children, trendData, trendXKey, trendYKey, trendName }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasTrendData = trendData && trendData.length > 0 && trendXKey && trendYKey && trendName;

    return (
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                {children}
            </div>
            {hasTrendData && (
                <>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-500 dark:text-blue-400 text-sm mt-3 hover:underline">
                        {isExpanded ? 'Hide' : 'Show'} Trend Graph
                    </button>
                    {isExpanded && <SparklineGraph data={trendData!} dataKey={trendYKey!} color="#8884d8" />}
                </>
            )}
        </div>
    );
};

export default AnalysisCard;