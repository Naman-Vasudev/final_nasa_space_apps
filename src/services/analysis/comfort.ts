import type { ComfortAnalysis } from '../../types';
import { calculatePercentiles, runMannKendall, calculateHeatIndex, calculateWindChill } from './helpers';

// FIX: Use function overloads to provide specific return types based on the 'label' argument.
// This resolves type errors when assigning the result to heatIndexDistribution and windChillDistribution.
function createDistribution(data: { value: number | null, base: number | null }[], label: 'Heat Index', baseLabel: 'Actual Temp'): { name: string; 'Heat Index': number; 'Actual Temp': number; }[];
function createDistribution(data: { value: number | null, base: number | null }[], label: 'Wind Chill', baseLabel: 'Actual Temp'): { name: string; 'Wind Chill': number; 'Actual Temp': number; }[];
function createDistribution(
    data: { value: number | null, base: number | null }[], 
    label: 'Heat Index' | 'Wind Chill',
    baseLabel: 'Actual Temp'
) {
    const validData = data.filter(d => d.value !== null && d.base !== null) as { value: number, base: number }[];
    if (validData.length === 0) return [];
    
    const min = Math.min(...validData.map(d => Math.min(d.value, d.base)));
    const max = Math.max(...validData.map(d => Math.max(d.value, d.base)));
    const range = max - min;
    const binCount = Math.min(Math.floor(Math.sqrt(validData.length)), 20) || 10;
    const binSize = range / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => {
        const binMin = min + i * binSize;
        const binMax = binMin + binSize;
        const items = validData.filter(d => d.value >= binMin && d.value < binMax);
        const baseItems = validData.filter(d => d.base >= binMin && d.base < binMax);
        return {
            name: `${binMin.toFixed(1)}°C`,
            [label]: items.length,
            [baseLabel]: baseItems.length,
        };
    });
    return bins;
};

export const analyzeComfort = (windowData: any[]): ComfortAnalysis => {
    const processedData = windowData.map(d => {
        const heatIndex = calculateHeatIndex(d.T2M_MAX, d.RH2M);
        const windChill = calculateWindChill(d.T2M_MIN, d.WS10M);
        
        let apparentTemp = d.T2M;
        if (heatIndex !== null && heatIndex > d.T2M) {
            apparentTemp = heatIndex;
        } else if (windChill !== null && windChill < d.T2M) {
            apparentTemp = windChill;
        }
        
        return {
            ...d,
            heatIndex,
            windChill,
            apparentTemp,
        };
    });

    const heatIndexDays = processedData.filter(d => d.heatIndex !== null && d.heatIndex > d.T2M_MAX);
    const windChillDays = processedData.filter(d => d.windChill !== null && d.windChill < d.T2M_MIN);

    // ASHRAE 55-2020 / WHO standard comfort range
    const COMFORT_LOWER = 18;
    const COMFORT_UPPER = 26;

    const validApparentTemps = processedData.filter(d => d.apparentTemp !== null);
    const comfortableCount = validApparentTemps.filter(d => d.apparentTemp >= COMFORT_LOWER && d.apparentTemp <= COMFORT_UPPER).length;
    const hotCount = validApparentTemps.filter(d => d.apparentTemp > COMFORT_UPPER).length;
    const coldCount = validApparentTemps.filter(d => d.apparentTemp < COMFORT_LOWER).length;
    const totalValid = validApparentTemps.length;
    
    const yearlyStats = Array.from(new Set(windowData.map(d => d.year))).map(year => {
        const yearData = processedData.filter(d => d.year === year);
        return {
            year,
            HI_max: calculatePercentiles(yearData.map(d => d.heatIndex), [98]).p98,
            WC_min: calculatePercentiles(yearData.map(d => d.windChill), [2]).p10,
        };
    });

    // Humidity effect on heat
    const humidityBins = [ {l: 0, u: 40}, {l: 40, u: 60}, {l: 60, u: 80}, {l: 80, u: 101}];
    const humidityEffectOnHeat = humidityBins.map(bin => {
        const binData = heatIndexDays.filter(d => d.RH2M >= bin.l && d.RH2M < bin.u);
        if (binData.length < 5) return null;
        const medianHI = calculatePercentiles(binData.map(d => d.heatIndex), [50]).p50;
        const medianTemp = calculatePercentiles(binData.map(d => d.T2M_MAX), [50]).p50;
        return {
            bin: `${bin.l}-${bin.u}%`,
            value: medianHI - medianTemp,
            days: binData.length,
        };
    }).filter(b => b !== null) as any[];

    // Wind effect on cold
    const windQuartiles = calculatePercentiles(windChillDays.map(d => d.WS10M), [25, 50, 75]);
    const windBins = [
        {l: 0, u: windQuartiles.p25, name: 'Calm'},
        {l: windQuartiles.p25, u: windQuartiles.p50, name: 'Light'},
        {l: windQuartiles.p50, u: windQuartiles.p75, name: 'Moderate'},
        {l: windQuartiles.p75, u: 100, name: 'Strong'},
    ];
    const windEffectOnCold = windBins.map(bin => {
        const binData = windChillDays.filter(d => d.WS10M >= bin.l && d.WS10M < bin.u);
        if(binData.length < 5) return null;
        const medianWC = calculatePercentiles(binData.map(d => d.windChill), [50]).p50;
        const medianTemp = calculatePercentiles(binData.map(d => d.T2M_MIN), [50]).p50;
        return {
            bin: bin.name,
            value: medianTemp - medianWC,
            days: binData.length
        }
    }).filter(b => b !== null) as any[];


    return {
        medianApparentTemp: calculatePercentiles(processedData.map(d => d.apparentTemp), [50]).p50,
        heatIndex: {
            applicableDays: heatIndexDays.length,
            median: calculatePercentiles(heatIndexDays.map(d => d.heatIndex), [50]).p50,
            max: calculatePercentiles(heatIndexDays.map(d => d.heatIndex), [98]).p98,
        },
        windChill: {
            applicableDays: windChillDays.length,
            median: calculatePercentiles(windChillDays.map(d => d.windChill), [50]).p50,
            min: calculatePercentiles(windChillDays.map(d => d.windChill), [2]).p10,
        },
        comfortDistribution: {
            comfortable: totalValid > 0 ? (comfortableCount / totalValid) * 100 : 0,
            hot: totalValid > 0 ? (hotCount / totalValid) * 100 : 0,
            cold: totalValid > 0 ? (coldCount / totalValid) * 100 : 0,
        },
        yearlyStats,
        trends: {
            heatIndex: runMannKendall(yearlyStats.map(d => ({ year: d.year, value: d.HI_max }))),
            windChill: runMannKendall(yearlyStats.map(d => ({ year: d.year, value: d.WC_min }))),
        },
        heatIndexDistribution: createDistribution(heatIndexDays.map(d => ({ value: d.heatIndex, base: d.T2M_MAX })), 'Heat Index', 'Actual Temp'),
        windChillDistribution: createDistribution(windChillDays.map(d => ({ value: d.windChill, base: d.T2M_MIN })), 'Wind Chill', 'Actual Temp'),
        humidityEffectOnHeat,
        windEffectOnCold,
    };
};
