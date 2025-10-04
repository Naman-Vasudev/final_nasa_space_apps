import React, { useState } from 'react';
import type { AnalysisData, Location } from '../../types';
import { getAiSummary } from '../../services/geminiService';
import { DynamicPrecipitationIcon, WeathervaneIcon, DynamicUvIcon, ComfortIcon } from '../ui/icons';
import FormattedText from '../ui/FormattedText';

interface SummaryCardProps {
    analysis: AnalysisData;
    date: string;
    location: Location;
    // REMOVED: apiKey prop is no longer needed.
}

const SummaryItem: React.FC<{ icon: React.ReactNode, value: string, label: string }> = ({ icon, value, label }) => (
    <div className="flex items-center space-x-3">
        <div className="p-2 bg-white/10 rounded-full">{icon}</div>
        <div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    </div>
);

// REMOVED: apiKey is no longer a prop.
export const SummaryCard: React.FC<SummaryCardProps> = ({ analysis, date, location }) => {
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    if (!analysis.temperature) return null;

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });

    const handleGenerateSummary = async () => {
        // REMOVED: apiKey check is no longer needed.
        setIsSummaryLoading(true);
        setSummaryError(null);
        try {
            // REMOVED: apiKey is no longer passed to the service call.
            const summary = await getAiSummary(analysis, location.name || 'this location');
            setAiSummary(summary);
        } catch (error: any) {
            setSummaryError(error.message);
        } finally {
            setIsSummaryLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-900/70 to-gray-900/50 p-6 rounded-lg shadow-2xl border border-blue-800/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">{location.name}</h2>
                    <p className="text-gray-300">{formattedDate}</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className="text-5xl font-bold text-white">{analysis.temperature.percentiles.max.p50.toFixed(0)}°C</p>
                    <p className="text-gray-300">Typical High</p>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                {analysis.comfort && (
                     <SummaryItem 
                        icon={<ComfortIcon />}
                        value={`${analysis.comfort.medianApparentTemp.toFixed(0)}°C`}
                        label="Feels Like"
                    />
                )}
                {analysis.precipitation && (
                    <SummaryItem 
                        icon={<DynamicPrecipitationIcon isSnowing={analysis.precipitation.hasSnow && analysis.precipitation.probSnow > analysis.precipitation.probRain} />}
                        value={`${analysis.precipitation.probRain.toFixed(0)}%`}
                        label="Chance of Rain"
                    />
                )}
                {analysis.wind && (
                    <SummaryItem 
                        icon={<WeathervaneIcon />}
                        value={`${analysis.wind.percentiles.max.p50.toFixed(0)} km/h`}
                        label="Max Wind"
                    />
                )}
                {analysis.uv && (
                    <SummaryItem 
                        icon={<DynamicUvIcon uvIndex={analysis.uv.medianClearSky} />}
                        value={analysis.uv.medianClearSky.toFixed(1)}
                        label="Clear Sky UV"
                    />
                )}
            </div>

            <div className="pt-6 mt-6 border-t border-white/10">
                {!aiSummary && !isSummaryLoading && (
                    <div className="text-center">
                        <button 
                            onClick={handleGenerateSummary}
                            disabled={isSummaryLoading}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                        >
                            {isSummaryLoading ? 'Generating...' : 'Generate AI Summary'}
                        </button>
                    </div>
                )}
                {isSummaryLoading && (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"></div>
                        <span className="text-gray-300">Generating insights...</span>
                    </div>
                )}
                {summaryError && <p className="text-red-400 text-center">{summaryError}</p>}
                {aiSummary && (
                    <div>
                        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                           <FormattedText text={aiSummary} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};