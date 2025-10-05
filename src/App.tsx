import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeatherData, fetchSingleDayWeatherData } from './services/nasaPowerService';
import { analyzeAll } from './services/analysisService';
import type { AnalysisData, Location, HistoricalData } from './types';

import ControlPanel from './components/controls/ControlPanel';
import MapController from './components/map/MapController';
import AnalysisGrid from './components/analysis/AnalysisGrid';
// FIX: Changed import to be a named import.
import { SummaryCard } from './components/analysis/SummaryCard';
import InteractiveGraph from './components/analysis/InteractiveGraph';
import Chatbot from './components/chatbot/Chatbot';
import DetailModal from './components/details/DetailModal';
import ActivityPlanner from './components/analysis/ActivityPlanner';
import DataExporter from './components/analysis/DataExporter';
import HistoricalDisplay from './components/analysis/HistoricalDisplay';

const logoUrl = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cdefs%3e%3clinearGradient id='logo-border-gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' stop-color='%233B4D66'/%3e%3cstop offset='100%25' stop-color='%23111827'/%3e%3c/linearGradient%3e%3c/defs%3e%3crect x='5' y='5' width='90' height='90' rx='20' ry='20' fill='white' /%3e%3crect x='5' y='5' width='90' height='90' rx='20' ry='20' fill='transparent' stroke='url(%23logo-border-gradient)' stroke-width='8'/%3e%3cpath d='M25 68 L45 48 L60 58 L75 43' stroke='%233B4D66' stroke-width='10' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e";

const App: React.FC = () => {
    const [location, setLocation] = useState<Location>({ lat: 34.0522, lon: -118.2437, name: 'Los Angeles, USA' });
    const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
    const [windowDays, setWindowDays] = useState<number>(15);
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [libsLoaded, setLibsLoaded] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(true);
    const [visibleParameters, setVisibleParameters] = useState<Record<string, boolean>>({
        temperature: true,
        precipitation: true,
        wind: false,
        humidity: false,
        uv: false,
        comfort: false,
    });
    
    const [detailedView, setDetailedView] = useState<string | null>(null);
    // REMOVED: apiKey state and modal logic are no longer needed.

    const resultsRef = useRef<HTMLDivElement>(null);

    // REMOVED: API key loading from localStorage is no longer necessary.

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.L) {
                setLibsLoaded(true);
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // REMOVED: API key save handler is no longer needed.

    const runAnalysis = useCallback(async (locToAnalyze: Location) => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setHistoricalData(null);
        setIsControlsOpen(false);

        // Get the selected date as a Date object at UTC midnight.
        const selectedDate = new Date(`${date}T00:00:00Z`);

        // Get today's date at UTC midnight for a clean comparison.
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        try {
            if (selectedDate < today) {
                // It's a past date, attempt to fetch the single day's data.
                // The service will throw an error if data is not yet available.
                const data = await fetchSingleDayWeatherData(locToAnalyze.lat, locToAnalyze.lon, date);
                setHistoricalData(data);
            } else {
                // It's today or a future date, run the climatological analysis.
                const weatherData = await fetchWeatherData(locToAnalyze.lat, locToAnalyze.lon);
                const analysisResult = analyzeAll(weatherData, date, windowDays, locToAnalyze);
                setAnalysis(analysisResult);
            }
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setIsControlsOpen(true);
        } finally {
            setIsLoading(false);
        }
    }, [date, windowDays]);

    return (
        <div className="bg-gray-900 min-h-screen font-sans text-gray-200">
            {/* REMOVED: ApiKeyModal component is no longer needed. */}
            <header className="bg-gray-800/50 backdrop-blur-sm shadow-md sticky top-0 z-20 border-b border-gray-700">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img src={logoUrl} alt="ClimaCast Logo" className="w-10 h-10" />
                        <div>
                            <h1 className="text-3xl font-semibold text-white tracking-tight leading-tight">ClimaCast</h1>
                            <p className="text-sm text-gray-200 opacity-60 font-normal">History predicts the future</p>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto p-4 lg:p-6 space-y-6">
                <ControlPanel
                    location={location}
                    date={date}
                    setDate={setDate}
                    windowDays={windowDays}
                    setWindowDays={setWindowDays}
                    runAnalysis={runAnalysis}
                    isLoading={isLoading}
                    setLocation={setLocation}
                    isControlsOpen={isControlsOpen}
                    setIsControlsOpen={setIsControlsOpen}
                />

                <MapController 
                    location={location}
                    setLocation={setLocation}
                    libsLoaded={libsLoaded}
                />
                
                {isLoading && (
                    <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                        <p className="text-lg">Loading data and generating insights...</p>
                        <p className="text-sm text-gray-400">This may take a moment.</p>
                    </div>
                )}
                {error && <div className="p-4 bg-red-900/50 border border-red-600 text-red-200 rounded-lg">{error}</div>}
                
                {analysis && !isLoading && !error && (
                    <div ref={resultsRef} className="space-y-6">
                        {/* REMOVED: apiKey prop is no longer passed. */}
                        <SummaryCard analysis={analysis} date={date} location={location} />
                        <DataExporter analysis={analysis} location={location} date={date} />
                        <InteractiveGraph 
                            analysis={analysis} 
                            visibleParameters={visibleParameters} 
                        />
                        <AnalysisGrid
                            analysis={analysis}
                            visibleParameters={visibleParameters}
                            setVisibleParameters={setVisibleParameters}
                            setDetailedView={setDetailedView}
                        />
                        {/* REMOVED: apiKey prop is no longer passed. */}
                        <ActivityPlanner analysisData={analysis} />
                    </div>
                )}

                {historicalData && !isLoading && !error && (
                    <div ref={resultsRef}>
                        <HistoricalDisplay historicalData={historicalData} location={location} date={date} />
                    </div>
                )}
            </main>
            
            {analysis && !isLoading && !error && (
                 // REMOVED: apiKey prop is no longer passed.
                <Chatbot analysisData={analysis} locationName={location.name || 'the selected location'} />
            )}

            {detailedView && analysis && (
                <DetailModal 
                    parameter={detailedView}
                    analysis={analysis}
                    onClose={() => setDetailedView(null)}
                />
            )}
        </div>
    );
};

export default App;