import React, { useState, useCallback } from 'react';
import type { Location } from '../../types';

interface ControlPanelProps {
    location: Location;
    date: string;
    setDate: (date: string) => void;
    windowDays: number;
    setWindowDays: (days: number) => void;
    runAnalysis: (location: Location) => void;
    isLoading: boolean;
    setLocation: React.Dispatch<React.SetStateAction<Location>>;
    isControlsOpen: boolean;
    setIsControlsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WindowButton: React.FC<{value: number, current: number, set: (v:number) => void}> = ({ value, current, set }) => (
    <button 
        onClick={() => set(value)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            current === value ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
    >
        ±{value}d
    </button>
);


const ControlPanel: React.FC<ControlPanelProps> = ({
    location,
    date,
    setDate,
    windowDays,
    setWindowDays,
    runAnalysis,
    isLoading,
    setLocation,
    isControlsOpen,
    setIsControlsOpen,
}) => {
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchInput, setSearchInput] = useState('Los Angeles, USA');
    const [error, setError] = useState<string | null>(null);
    
    const handleSearch = useCallback(async () => {
        if (!searchInput) return;
        setIsSearching(true);
        setError(null);
        try {
            const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchInput)}&limit=1`);
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const [lon, lat] = feature.geometry.coordinates;
                const props = feature.properties;
                const displayName = [props.name, props.city, props.state, props.country].filter(Boolean).join(', ');
                setLocation({ lat, lon, name: displayName || 'Unknown Location' });
            } else {
                setError('Location not found.');
            }
        } catch (err) {
            setError('Failed to fetch location.');
        } finally {
            setIsSearching(false);
        }
    }, [searchInput, setLocation]);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-4 rounded-lg shadow-lg">
             <button onClick={() => setIsControlsOpen(!isControlsOpen)} className="w-full flex justify-between items-center text-left text-lg font-bold text-white mb-2">
                <span>Analysis Controls</span>
                <span className={`transform transition-transform duration-300 ${isControlsOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
            </button>
             <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isControlsOpen ? 'max-h-[500px] opacity-100 pt-4' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-300">Search Location</label>
                        <div className="flex flex-wrap gap-2">
                            <input id="search" type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} placeholder="Enter city or address" className="flex-grow p-2 border border-gray-600 rounded-md bg-gray-700 text-white min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            <button onClick={handleSearch} disabled={isSearching} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Target Date</label>
                            <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-300 mb-1">Day Window (±)</label>
                             <div className="flex items-center space-x-2 bg-gray-900/50 p-1 rounded-lg">
                                {[7, 15, 30, 45].map(d => <WindowButton key={d} value={d} current={windowDays} set={setWindowDays} />)}
                             </div>
                        </div>
                    </div>

                    <button onClick={() => runAnalysis(location)} disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed transition-colors text-base">
                        {isLoading ? 'Analyzing...' : 'Get Climate Analysis'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;
