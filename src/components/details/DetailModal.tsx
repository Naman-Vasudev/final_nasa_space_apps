import React, { useEffect, useRef } from 'react';
import type { AnalysisData } from '../../types';
import TemperatureDetail from './TemperatureDetail';
import PrecipitationDetail from './PrecipitationDetail';
import WindDetail from './WindDetail';
import HumidityDetail from './HumidityDetail';
import UvDetail from './UvDetail';
import ComfortDetail from './ComfortDetail';

interface DetailModalProps {
    parameter: string;
    analysis: AnalysisData;
    onClose: () => void;
}

const PARAMETER_CONFIG: Record<string, { title: string, component: React.FC<any> }> = {
    temperature: { title: 'Temperature Details', component: TemperatureDetail },
    precipitation: { title: 'Precipitation Details', component: PrecipitationDetail },
    wind: { title: 'Wind Details', component: WindDetail },
    humidity: { title: 'Humidity Details', component: HumidityDetail },
    uv: { title: 'UV Index Details', component: UvDetail },
    comfort: { title: 'Comfort & "Feels Like" Details', component: ComfortDetail },
};

const DetailModal: React.FC<DetailModalProps> = ({ parameter, analysis, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const config = PARAMETER_CONFIG[parameter];

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    };
    
    if (!config || !analysis[parameter as keyof AnalysisData]) return null;

    const DetailComponent = config.component;
    const componentData = analysis[parameter as keyof AnalysisData];

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4"
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className="bg-gray-900/80 border border-gray-700 rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-labelledby="detail-modal-title"
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 id="detail-modal-title" className="text-xl font-bold text-white">{config.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close details">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto">
                    <DetailComponent data={componentData} />
                </main>
            </div>
        </div>
    );
};

export default DetailModal;
