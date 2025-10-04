import type { PrecipitationAnalysis, DistributionBin } from '../../types';
import { calculatePercentiles, runMannKendall } from './helpers';

const createIntensityDistribution = (amounts: number[]): DistributionBin[] => {
    if (amounts.length < 10) return [];
    const maxAmount = Math.max(...amounts);
    const binCount = 10;
    const binSize = maxAmount / binCount;
    return Array.from({ length: binCount }, (_, i) => {
        const min = i * binSize;
        const max = min + binSize;
        return {
            name: `${min.toFixed(1)}-${max.toFixed(1)}mm`,
            count: amounts.filter(a => a >= min && a < max).length,
        };
    });
}

export const analyzePrecipitation = (windowData: any[]): PrecipitationAnalysis => {
    const WET_DAY_THRESHOLD = 1.0;
    const SNOW_DAY_THRESHOLD = 0.5;

    const rainData: any[] = [];
    const snowData: any[] = [];
    
    windowData.forEach(d => {
        const liquidPrecip = (d.PRECTOTCORR || 0) - (d.PRECSNO || 0);
        if (liquidPrecip >= WET_DAY_THRESHOLD) {
            rainData.push({...d, liquidPrecip});
        }
        if ((d.PRECSNO || 0) >= SNOW_DAY_THRESHOLD) {
            snowData.push(d);
        }
    });

    const rainAmounts = rainData.map(d => d.liquidPrecip);
    const snowAmounts = snowData.map(d => d.PRECSNO);

    const yearlyStats = Array.from(new Set(windowData.map(d => d.year))).map(year => {
        const yearData = windowData.filter(d => d.year === year);
        return {
            year,
            total_rain: yearData.reduce((acc, d) => acc + Math.max(0, (d.PRECTOTCORR || 0) - (d.PRECSNO || 0)), 0),
            rain_days: yearData.filter(d => ((d.PRECTOTCORR || 0) - (d.PRECSNO || 0)) >= WET_DAY_THRESHOLD).length,
            total_snow: yearData.reduce((acc, d) => acc + (d.PRECSNO || 0), 0),
            snow_days: yearData.filter(d => (d.PRECSNO || 0) >= SNOW_DAY_THRESHOLD).length
        };
    });

    // Conditional effects
    const humidityBins = [{ l: 0, u: 40 }, { l: 40, u: 60 }, { l: 60, u: 80 }, { l: 80, u: 101 }];
    const humidityEffect = humidityBins.map(bin => {
        const binData = windowData.filter(d => d.RH2M >= bin.l && d.RH2M < bin.u);
        const totalDays = binData.length;
        if (totalDays === 0) return { bin: `${bin.l}-${bin.u}%`, rainProb: 0, snowProb: 0 };
        const rainInBin = binData.filter(d => ((d.PRECTOTCORR || 0) - (d.PRECSNO || 0)) >= WET_DAY_THRESHOLD).length;
        const snowInBin = binData.filter(d => (d.PRECSNO || 0) >= SNOW_DAY_THRESHOLD).length;
        return {
            bin: `${bin.l}-${bin.u}%`,
            rainProb: (rainInBin / totalDays) * 100,
            snowProb: (snowInBin / totalDays) * 100,
        };
    });

    const tempQuartilesRain = calculatePercentiles(rainData.map(d => d.T2M), [25, 50, 75]);
    const tempBinsRain = [
        {l: -50, u: tempQuartilesRain.p25, name: 'Cool'},
        {l: tempQuartilesRain.p25, u: tempQuartilesRain.p50, name: 'Moderate'},
        {l: tempQuartilesRain.p50, u: tempQuartilesRain.p75, name: 'Warm'},
        {l: tempQuartilesRain.p75, u: 100, name: 'Hot'},
    ];
    const temperatureEffectRain = tempBinsRain.map(bin => {
        const binData = rainData.filter(d => d.T2M >= bin.l && d.T2M < bin.u);
        return {
            bin: bin.name,
            value: calculatePercentiles(binData.map(d => d.liquidPrecip), [50]).p50,
            days: binData.length
        }
    }).filter(d => d.days > 5);

     const tempQuartilesSnow = calculatePercentiles(snowData.map(d => d.T2M), [25, 50, 75]);
    const tempBinsSnow = [
        {l: -50, u: tempQuartilesSnow.p25, name: 'Very Cold'},
        {l: tempQuartilesSnow.p25, u: tempQuartilesSnow.p50, name: 'Cold'},
        {l: tempQuartilesSnow.p50, u: tempQuartilesSnow.p75, name: 'Cool'},
        {l: tempQuartilesSnow.p75, u: 100, name: 'Mild'},
    ];
    const temperatureEffectSnow = tempBinsSnow.map(bin => {
        const binData = snowData.filter(d => d.T2M >= bin.l && d.T2M < bin.u);
        return {
            bin: bin.name,
            value: calculatePercentiles(binData.map(d => d.PRECSNO), [50]).p50,
            days: binData.length
        }
    }).filter(d => d.days > 5);


    return {
        probRain: (rainData.length / windowData.length) * 100,
        probSnow: (snowData.length / windowData.length) * 100,
        medianRain: calculatePercentiles(rainAmounts, [50]).p50,
        medianSnow: calculatePercentiles(snowAmounts, [50]).p50,
        hasSnow: snowData.length > 0,
        yearlyStats,
        rainTrend: runMannKendall(yearlyStats.map(d => ({ year: d.year, value: d.total_rain }))),
        snowTrend: runMannKendall(yearlyStats.map(d => ({ year: d.year, value: d.total_snow }))),
        rainIntensityDistribution: createIntensityDistribution(rainAmounts),
        snowIntensityDistribution: createIntensityDistribution(snowAmounts),
        humidityEffect,
        temperatureEffect: {
            rain: temperatureEffectRain,
            snow: temperatureEffectSnow,
        }
    };
};
