import type { HumidityAnalysis } from '../../types';
import { calculatePercentiles, runMannKendall } from './helpers';

export const analyzeHumidity = (windowData: any[]): HumidityAnalysis => {
    const yearlyStats = Array.from(new Set(windowData.map(d => d.year))).map(year => {
        const yearData = windowData.filter(d => d.year === year);
        return {
            year,
            RH_median: calculatePercentiles(yearData.map(d => d.RH2M), [50]).p50,
            QV_median: calculatePercentiles(yearData.map(d => d.QV2M), [50]).p50,
        };
    });

    // For distribution chart
    const rhValues = windowData.map(d => d.RH2M).filter(d => d !== null);
    const minRh = Math.min(...rhValues);
    const maxRh = Math.max(...rhValues);
    const binCount = 10;
    const binSize = (maxRh - minRh) / binCount;
    const humidityDistribution = Array.from({ length: binCount }, (_, i) => {
        const binMin = minRh + i * binSize;
        const binMax = binMin + binSize;
        const count = rhValues.filter(d => d >= binMin && d < binMax).length;
        return {
            name: `${binMin.toFixed(0)}-${binMax.toFixed(0)}%`,
            count,
        };
    });

    // For exceedance chart
    const rhPercentiles = calculatePercentiles(rhValues, [75, 90, 95, 98]);
    const qvPercentiles = calculatePercentiles(windowData.map(d => d.QV2M), [75, 90, 95, 98]);

    const rhThresholds = { moderate: rhPercentiles.p75, high: rhPercentiles.p90, very_high: rhPercentiles.p95, extreme: rhPercentiles.p98 };
    const qvThresholds = { moderate: qvPercentiles.p75, high: qvPercentiles.p90, very_high: qvPercentiles.p95, extreme: qvPercentiles.p98 };
    
    const totalDays = rhValues.length;
    const exceedanceProbabilities = {
        relative: Object.entries(rhThresholds).map(([category, threshold]) => ({
            category,
            threshold,
            probability: (rhValues.filter(v => v >= threshold).length / totalDays) * 100
        })),
        specific: Object.entries(qvThresholds).map(([category, threshold]) => ({
            category,
            threshold,
            probability: (windowData.map(d => d.QV2M).filter(v => v !== null && v >= threshold).length / totalDays) * 100
        }))
    };


    return {
        percentiles: {
            relative: calculatePercentiles(windowData.map(d => d.RH2M), [10, 25, 50, 75, 90, 95, 98]),
            specific: calculatePercentiles(windowData.map(d => d.QV2M), [10, 25, 50, 75, 90, 95, 98]),
        },
        yearlyStats,
        trends: {
            relative: runMannKendall(yearlyStats.map(d => ({ year: d.year, value: d.RH_median }))),
            specific: runMannKendall(yearlyStats.map(d => ({ year: d.year, value: d.QV_median }))),
        },
        humidityDistribution,
        exceedanceProbabilities,
    };
};
