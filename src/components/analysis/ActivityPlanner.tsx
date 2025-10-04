import React, { useState, useCallback } from 'react';
import type { AnalysisData, ActivityPlan } from '../../types';
import { getAIActivitySuggestions } from '../../services/geminiService';
import { OutdoorIcon, LeisureIcon, IndoorIcon } from '../ui/icons';

interface ActivityPlannerProps {
    analysisData: AnalysisData;
    // REMOVED: apiKey prop is no longer needed.
}

const SuitabilityBadge: React.FC<{ suitability: 'Good' | 'Caution' | 'Not Recommended' }> = ({ suitability }) => {
    const baseClasses = "text-xs font-bold px-2 py-0.5 rounded-full";
    const colorClasses = {
        'Good': 'bg-green-500/20 text-green-300',
        'Caution': 'bg-yellow-500/20 text-yellow-300',
        'Not Recommended': 'bg-red-500/20 text-red-300',
    };
    return <span className={`${baseClasses} ${colorClasses[suitability]}`}>{suitability}</span>;
};

const SkeletonLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="h-6 w-32 bg-gray-600 rounded mb-4"></div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, j) => (
                        <div key={j}>
                            <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                            <div className="h-3 w-full bg-gray-600 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);


// REMOVED: apiKey is no longer a prop.
const ActivityPlanner: React.FC<ActivityPlannerProps> = ({ analysisData }) => {
    const [plan, setPlan] = useState<ActivityPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePlan = useCallback(async () => {
        // REMOVED: apiKey check is no longer needed.
        setIsLoading(true);
        setError(null);
        setPlan(null);
        try {
            // REMOVED: apiKey is no longer passed to the service call.
            const result = await getAIActivitySuggestions(analysisData);
            setPlan(result);
        } catch (err: any) {
            setError(err.message || 'Could not generate activity suggestions.');
        } finally {
            setIsLoading(false);
        }
    // REMOVED: apiKey is no longer a dependency.
    }, [analysisData]);

    const categoryIcons: { [key: string]: React.ReactNode } = {
        "Outdoor Adventures": <OutdoorIcon />,
        "Relaxing & Leisure": <LeisureIcon />,
        "Indoor Options": <IndoorIcon />,
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">AI Activity Planner</h3>

            {!plan && !isLoading && (
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Get personalized activity suggestions based on the climate analysis.</p>
                    <button
                        onClick={handleGeneratePlan}
                        disabled={isLoading}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-violet-900/50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Generating...' : 'Generate Suggestions'}
                    </button>
                </div>
            )}

            {isLoading && <SkeletonLoader />}
            {error && <p className="text-red-400 text-center">{error}</p>}

            {plan && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plan.map(category => (
                        <div key={category.category} className="bg-gray-900/40 p-4 rounded-lg">
                            <h4 className="flex items-center space-x-2 text-lg font-semibold text-white mb-3">
                                {categoryIcons[category.category]}
                                <span>{category.category}</span>
                            </h4>
                            <ul className="space-y-3">
                                {category.suggestions.map(suggestion => (
                                    <li key={suggestion.name} className="text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-gray-200">{suggestion.name}</p>
                                            <SuitabilityBadge suitability={suggestion.suitability} />
                                        </div>
                                        <p className="text-gray-400 italic">"{suggestion.reason}"</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityPlanner;