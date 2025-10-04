import React from 'react';
import SparklineGraph from './TrendGraph';

interface ParameterDetailCardProps {
    title: string;
    icon: React.ReactNode;
    value: string;
    label: string;
    trendData: any[];
    trendKey: string;
    children?: React.ReactNode;
    onClick: () => void;
    isActive: boolean;
    color: 'orange' | 'blue' | 'teal' | 'cyan' | 'violet' | 'green';
    paramKey: string;
    setDetailedView: (param: string) => void;
}

const colorClasses = {
    orange: { bg: 'bg-orange-500/10', ring: 'ring-orange-500', text: 'text-orange-400' },
    blue: { bg: 'bg-blue-500/10', ring: 'ring-blue-500', text: 'text-blue-400' },
    teal: { bg: 'bg-teal-500/10', ring: 'ring-teal-500', text: 'text-teal-400' },
    cyan: { bg: 'bg-cyan-500/10', ring: 'ring-cyan-500', text: 'text-cyan-400' },
    violet: { bg: 'bg-violet-500/10', ring: 'ring-violet-500', text: 'text-violet-400' },
    green: { bg: 'bg-green-500/10', ring: 'ring-green-500', text: 'text-green-400' },
};

const strokeColors = {
    orange: '#fb923c',
    blue: '#60a5fa',
    teal: '#2dd4bf',
    cyan: '#22d3ee',
    violet: '#a78bfa',
    green: '#4ade80',
};

const ParameterDetailCard: React.FC<ParameterDetailCardProps> = ({
    title, icon, value, label, trendData, trendKey, children, onClick, isActive, color, paramKey, setDetailedView
}) => {
    const classes = colorClasses[color];

    return (
        <div
            className={`p-4 rounded-lg shadow-md transition-all duration-300 text-left w-full h-full flex flex-col justify-between ${
                isActive ? `${classes.bg} ring-2 ${classes.ring}` : 'bg-gray-800 hover:bg-gray-700/50'
            }`}
        >
            <button
                onClick={onClick}
                className="w-full text-left focus:outline-none group rounded-md"
                aria-label={`Toggle ${title} on graph`}
            >
                <div className={`flex items-center space-x-2 mb-2 ${classes.text}`}>
                    {icon}
                    <h4 className="font-bold">{title}</h4>
                </div>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
                <div className="text-sm text-gray-400 mt-2 space-y-1">
                    {children}
                </div>
            </button>
            <div className="mt-auto pt-2">
                <SparklineGraph data={trendData} dataKey={trendKey} color={strokeColors[color]} />
                <div className="text-right mt-1">
                    <button
                        onClick={() => setDetailedView(paramKey)}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                        aria-label={`View details for ${title}`}
                    >
                        Details →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParameterDetailCard;
