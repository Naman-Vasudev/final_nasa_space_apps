import React from 'react';
import type { AnalysisData } from '../../types';
import ParameterDetailCard from './ParameterDetailCard';
import { 
    DynamicTemperatureIcon, 
    DynamicPrecipitationIcon, 
    WeathervaneIcon, 
    HumidityIcon, 
    DynamicUvIcon, 
    ComfortIcon 
} from '../ui/icons';

interface AnalysisGridProps {
    analysis: AnalysisData;
    visibleParameters: Record<string, boolean>;
    setVisibleParameters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    setDetailedView: (parameter: string) => void;
}

const AnalysisGrid: React.FC<AnalysisGridProps> = ({ analysis, visibleParameters, setVisibleParameters, setDetailedView }) => {
    
    const toggleParameter = (param: string) => {
        setVisibleParameters(prev => ({
            ...prev,
            [param]: !prev[param],
        }));
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {analysis.temperature && (
                <ParameterDetailCard
                    title="Temperature"
                    paramKey="temperature"
                    setDetailedView={setDetailedView}
                    icon={<DynamicTemperatureIcon value={analysis.temperature.percentiles.max.p50} />}
                    value={`${analysis.temperature.percentiles.max.p50.toFixed(1)}°C`}
                    label="Typical High"
                    trendData={analysis.temperature.yearlyStats}
                    trendKey="T2M_MAX_median"
                    onClick={() => toggleParameter('temperature')}
                    isActive={visibleParameters.temperature}
                    color="orange"
                >
                    <p>Low: <strong>{analysis.temperature.percentiles.min.p50.toFixed(1)}°C</strong></p>
                    <p>Trend: <span className="capitalize">{analysis.temperature.trends.max.trend}</span></p>
                </ParameterDetailCard>
            )}
            {analysis.comfort && (
                <ParameterDetailCard
                    title="Feels Like"
                    paramKey="comfort"
                    setDetailedView={setDetailedView}
                    icon={<ComfortIcon />}
                    value={`${analysis.comfort.medianApparentTemp.toFixed(1)}°C`}
                    label="Apparent Temp"
                    trendData={analysis.comfort.yearlyStats}
                    trendKey="HI_max"
                    onClick={() => toggleParameter('comfort')}
                    isActive={visibleParameters.comfort}
                    color="green"
                >
                    <p>Comfortable: <strong>{analysis.comfort.comfortDistribution.comfortable.toFixed(0)}% days</strong></p>
                    <p>Heat Index Trend: <span className="capitalize">{analysis.comfort.trends.heatIndex.trend}</span></p>
                </ParameterDetailCard>
            )}
             {analysis.precipitation && (
                <ParameterDetailCard
                    title="Precipitation"
                    paramKey="precipitation"
                    setDetailedView={setDetailedView}
                    icon={<DynamicPrecipitationIcon isSnowing={analysis.precipitation.hasSnow && analysis.precipitation.probSnow > analysis.precipitation.probRain} />}
                    value={`${analysis.precipitation.probRain.toFixed(0)}%`}
                    label="Chance of Rain"
                    trendData={analysis.precipitation.yearlyStats}
                    trendKey="total_rain"
                    onClick={() => toggleParameter('precipitation')}
                    isActive={visibleParameters.precipitation}
                    color="blue"
                >
                     <p>Median Amt: <strong>{analysis.precipitation.medianRain.toFixed(1)} mm</strong></p>
                     <p>Trend: <span className="capitalize">{analysis.precipitation.rainTrend.trend}</span></p>
                </ParameterDetailCard>
            )}
            {analysis.wind && (
                <ParameterDetailCard
                    title="Wind"
                    paramKey="wind"
                    setDetailedView={setDetailedView}
                    icon={<WeathervaneIcon />}
                    value={`${analysis.wind.percentiles.max.p50.toFixed(1)} km/h`}
                    label="Typical Max"
                    trendData={analysis.wind.yearlyStats}
                    trendKey="WS_MAX_median"
                    onClick={() => toggleParameter('wind')}
                    isActive={visibleParameters.wind}
                    color="teal"
                >
                    <p>Common: <strong>{analysis.wind.mostCommonCondition.name}</strong></p>
                    <p>Trend: <span className="capitalize">{analysis.wind.trends.max.trend}</span></p>
                </ParameterDetailCard>
            )}
            {analysis.humidity && (
                <ParameterDetailCard
                    title="Humidity"
                    paramKey="humidity"
                    setDetailedView={setDetailedView}
                    icon={<HumidityIcon />}
                    value={`${analysis.humidity.percentiles.relative.p50.toFixed(0)}%`}
                    label="Relative Humidity"
                    trendData={analysis.humidity.yearlyStats}
                    trendKey="RH_median"
                    onClick={() => toggleParameter('humidity')}
                    isActive={visibleParameters.humidity}
                    color="cyan"
                >
                    <p>Trend: <span className="capitalize">{analysis.humidity.trends.relative.trend}</span></p>
                </ParameterDetailCard>
            )}
            {analysis.uv && (
                <ParameterDetailCard
                    title="UV Index"
                    paramKey="uv"
                    setDetailedView={setDetailedView}
                    icon={<DynamicUvIcon uvIndex={analysis.uv.medianClearSky} />}
                    value={`${analysis.uv.medianClearSky.toFixed(1)}`}
                    label={`Clear Sky (${analysis.uv.clearSkyCategory.name})`}
                    trendData={analysis.uv.yearlyStats}
                    trendKey="UV_clearsky_median"
                    onClick={() => toggleParameter('uv')}
                    isActive={visibleParameters.uv}
                    color="violet"
                >
                    <p>Trend: <span className="capitalize">{analysis.uv.uvTrend.trend}</span></p>
                </ParameterDetailCard>
            )}
        </div>
    );
};

export default AnalysisGrid;