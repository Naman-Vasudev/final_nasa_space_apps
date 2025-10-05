import React from 'react';
import type { HistoricalData, Location } from '../../types';
import { DynamicTemperatureIcon, DynamicPrecipitationIcon, WeathervaneIcon, HumidityIcon, DynamicUvIcon, ComfortIcon } from '../ui/icons';
import { calculateHeatIndex, calculateWindChill } from '../../services/analysis/helpers';

interface HistoricalDisplayProps {
    historicalData: HistoricalData;
    location: Location;
    date: string;
}

const DataItem: React.FC<{ icon: React.ReactNode, value: string, label: string }> = ({ icon, value, label }) => (
    <div className="flex flex-col items-center text-center p-4 bg-gray-900/40 rounded-lg h-full justify-center">
        <div className="mb-2 text-blue-400">{React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8" })}</div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
    </div>
);

const HistoricalDisplay: React.FC<HistoricalDisplayProps> = ({ historicalData, location, date }) => {
    const formattedDate = new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });

    const T2M_MAX = historicalData.T2M_MAX;
    const T2M_MIN = historicalData.T2M_MIN;
    const T2M = historicalData.T2M;
    const RH2M = historicalData.RH2M;
    const WS10M = historicalData.WS10M;
    const PRECTOTCORR = historicalData.PRECTOTCORR ?? 0;
    const PRECSNO = historicalData.PRECSNO ?? 0;
    const RAIN = PRECTOTCORR - PRECSNO;
    const ALLSKY_SFC_UV_INDEX = historicalData.ALLSKY_SFC_UV_INDEX;

    // Calculate 'Feels Like'
    let feelsLike = T2M;
    if (T2M_MAX !== null && RH2M !== null && T2M !== null) {
        const hi = calculateHeatIndex(T2M_MAX, RH2M);
        if (hi !== null && hi > T2M) {
            feelsLike = hi;
        }
    }
    if (T2M_MIN !== null && WS10M !== null && T2M !== null) {
        const wc = calculateWindChill(T2M_MIN, WS10M);
        if (wc !== null && wc < T2M) {
            feelsLike = wc;
        }
    }

    return (
        <div className="bg-gradient-to-br from-gray-900/70 to-gray-800/50 p-6 rounded-lg shadow-2xl border border-gray-700 backdrop-blur-sm">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white">Actual Weather for {location.name}</h2>
                <p className="text-gray-300">{formattedDate}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {T2M_MAX !== null && <DataItem icon={<DynamicTemperatureIcon value={T2M_MAX} />} value={`${T2M_MAX.toFixed(1)}°C`} label="Max Temperature" />}
                {T2M_MIN !== null && <DataItem icon={<DynamicTemperatureIcon value={T2M_MIN} />} value={`${T2M_MIN.toFixed(1)}°C`} label="Min Temperature" />}
                {T2M !== null && <DataItem icon={<DynamicTemperatureIcon value={T2M} />} value={`${T2M.toFixed(1)}°C`} label="Avg Temperature" />}
                {feelsLike !== null && T2M !== null && <DataItem icon={<ComfortIcon />} value={`${feelsLike.toFixed(1)}°C`} label="Avg 'Feels Like'" />}
                {RAIN > 0 && <DataItem icon={<DynamicPrecipitationIcon isSnowing={false} />} value={`${RAIN.toFixed(1)} mm`} label="Rainfall" />}
                {PRECSNO > 0 && <DataItem icon={<DynamicPrecipitationIcon isSnowing={true} />} value={`${PRECSNO.toFixed(1)} mm`} label="Snowfall" />}
                {(PRECTOTCORR === 0) && <DataItem icon={<DynamicPrecipitationIcon isSnowing={false} />} value="0 mm" label="Precipitation" />}
                {WS10M !== null && <DataItem icon={<WeathervaneIcon />} value={`${(WS10M * 3.6).toFixed(1)} km/h`} label="Avg Wind" />}
                {RH2M !== null && <DataItem icon={<HumidityIcon />} value={`${RH2M.toFixed(0)}%`} label="Humidity" />}
                {ALLSKY_SFC_UV_INDEX !== null && <DataItem icon={<DynamicUvIcon uvIndex={ALLSKY_SFC_UV_INDEX} />} value={`${ALLSKY_SFC_UV_INDEX.toFixed(1)}`} label="UV Index" />}
            </div>
             <p className="text-center text-xs text-gray-500 mt-6">This is the actual recorded weather for the selected date. AI features like Chat and Activity Planner are available for climatology predictions of recent or future dates.</p>
        </div>
    );
};

export default HistoricalDisplay;
