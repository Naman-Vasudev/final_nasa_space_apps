import type { TemperatureAnalysis } from '../../types';
import { calculatePercentiles, runMannKendall } from './helpers';

export const analyzeTemperature = (windowData: any[]): TemperatureAnalysis => {
  const percentiles = {
    max: calculatePercentiles(windowData.map(d => d.T2M_MAX), [10, 25, 50, 75, 90, 95, 98]),
    min: calculatePercentiles(windowData.map(d => d.T2M_MIN), [10, 25, 50, 75, 90, 95, 98]),
    avg: calculatePercentiles(windowData.map(d => d.T2M), [10, 25, 50, 75, 90, 95, 98]),
  };

  const heatThresholds = { warm: 35.0, hot: 37.0, very_hot: 39.0 };
  const coldThresholds = { cool: 15.0, cold: 12.0, very_cold: 10.0 };

  const heatProbabilities = Object.entries(heatThresholds).map(([name, threshold]) => {
    const above = windowData.filter(d => d.T2M_MAX >= threshold).length;
    return { name, threshold, probability: (above / windowData.length) * 100 };
  });

  const coldProbabilities = Object.entries(coldThresholds).map(([name, threshold]) => {
    const below = windowData.filter(d => d.T2M_MIN <= threshold).length;
    return { name, threshold, probability: (below / windowData.length) * 100 };
  });

  const yearlyStats = Array.from(new Set(windowData.map(d => d.year))).map(year => {
    const yearData = windowData.filter(d => d.year === year);
    return {
      year,
      T2M_MAX_median: calculatePercentiles(yearData.map(d => d.T2M_MAX), [50]).p50,
      T2M_MIN_median: calculatePercentiles(yearData.map(d => d.T2M_MIN), [50]).p50,
    };
  });
  
  const trends = {
      max: runMannKendall(yearlyStats.map(d => ({ year: d.year, value: d.T2M_MAX_median}))),
      min: runMannKendall(yearlyStats.map(d => ({ year: d.year, value: d.T2M_MIN_median}))),
  };

  return { percentiles, heatProbabilities, coldProbabilities, yearlyStats, trends };
};
