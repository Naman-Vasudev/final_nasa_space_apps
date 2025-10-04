import type { UvAnalysis } from '../../types';
import { 
    calculatePercentiles, 
    runMannKendall, 
    getCloudTransmission,
    calculateSolarNoonSza,
    calculateClearSkyUvFromOzone,
    getDayOfYear
} from './helpers';

export const analyzeUv = (windowData: any[], lat: number): UvAnalysis => {
    // Process each day with the new, more accurate UV calculation method
    const processedUvData = windowData.map(d => {
        const dayOfYear = getDayOfYear(d.date);
        const szaNoon = calculateSolarNoonSza(lat, dayOfYear);
        
        // Elevation is assumed to be 0m for now as it's not available in the location data.
        const clearSkyUv = calculateClearSkyUvFromOzone(d.TO3, szaNoon, 0, d.AOD_55);
        
        const cloudTransmission = getCloudTransmission(d.CLOUD_AMT);
        const allSkyUv = clearSkyUv === null ? null : clearSkyUv * cloudTransmission;

        return {
            ...d,
            clearSkyUv,
            allSkyUv,
        };
    });

    const WHO_SCALE: { name: string; range: [number, number]; color: string; advice: string }[] = [
        { name: 'Low', range: [0, 3], color: '#4CAF50', advice: 'No special protection needed.' },
        { name: 'Moderate', range: [3, 6], color: '#FDD835', advice: 'Seek shade during midday hours.' },
        { name: 'High', range: [6, 8], color: '#FF9800', advice: 'Wear protective clothing, hat, and sunscreen.' },
        { name: 'Very High', range: [8, 11], color: '#F44336', advice: 'Reduce sun exposure between 10am-4pm.' },
        { name: 'Extreme', range: [11, 100], color: '#9C27B0', advice: 'Avoid outdoor activities during midday.' }
    ];
    const mapUvToWho = (uv: number) => WHO_SCALE.find(c => uv >= c.range[0] && uv < c.range[1]) || WHO_SCALE[4];
    
    const clearSkyUvValues = processedUvData.map(d => d.clearSkyUv);
    const distribution = WHO_SCALE.map(cat => {
        const count = clearSkyUvValues.filter(uv => uv !== null && uv >= cat.range[0] && uv < cat.range[1]).length;
        const totalValid = clearSkyUvValues.filter(uv => uv !== null).length;
        return { ...cat, probability: totalValid > 0 ? (count / totalValid) * 100 : 0 };
    });
    
    const medianAllSky = calculatePercentiles(processedUvData.map(d => d.allSkyUv), [50]).p50;
    const medianClearSky = calculatePercentiles(clearSkyUvValues, [50]).p50;

    const yearlyStats = Array.from(new Set(windowData.map(d => d.year))).map(year => {
      const yearData = processedUvData.filter(d => d.year === year);
      return {
          year,
          UV_clearsky_median: calculatePercentiles(yearData.map(d => d.clearSkyUv), [50]).p50,
          Cloud_median: calculatePercentiles(yearData.map(d => d.CLOUD_AMT), [50]).p50,
      };
    });
    
    return {
        medianAllSky,
        medianClearSky,
        medianCloud: calculatePercentiles(windowData.map(d => d.CLOUD_AMT), [50]).p50,
        cloudUvReduction: medianClearSky > 0 ? (1 - medianAllSky / medianClearSky) * 100 : 0,
        allSkyCategory: mapUvToWho(medianAllSky),
        clearSkyCategory: mapUvToWho(medianClearSky),
        distribution,
        yearlyStats,
        uvTrend: runMannKendall(yearlyStats.map(d => ({ year: d.year, value: d.UV_clearsky_median })))
    };
};
