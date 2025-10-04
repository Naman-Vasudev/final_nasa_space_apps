import type { WindAnalysis } from '../../types';
import { calculatePercentiles, runMannKendall } from './helpers';

export const analyzeWind = (windowData: any[]): WindAnalysis => {
  const BEAUFORT_SCALE = [
      { cat: 'calm', bf: 0, low: 0, name: 'Calm', effect: 'Smoke rises vertically' },
      { cat: 'light_air', bf: 1, low: 1, name: 'Light Air', effect: 'Smoke drift' },
      { cat: 'light_breeze', bf: 2, low: 6, name: 'Light Breeze', effect: 'Wind felt on face' },
      { cat: 'gentle_breeze', bf: 3, low: 12, name: 'Gentle Breeze', effect: 'Leaves in motion' },
      { cat: 'moderate_breeze', bf: 4, low: 20, name: 'Moderate Breeze', effect: 'Small branches move' },
      { cat: 'fresh_breeze', bf: 5, low: 29, name: 'Fresh Breeze', effect: 'Small trees sway' },
      { cat: 'strong_breeze', bf: 6, low: 39, name: 'Strong Breeze', effect: 'Umbrellas difficult' },
      { cat: 'near_gale', bf: 7, low: 50, name: 'Near Gale', effect: 'Walking difficult' },
      { cat: 'gale', bf: 8, low: 62, name: 'Gale', effect: 'Twigs break' },
  ];
  const maxWindKmh = windowData.map(d => d.WS10M_MAX ? d.WS10M_MAX * 3.6 : (d.WS10M ? d.WS10M * 3.6 : null)).filter(w => w !== null) as number[];
  
  const beaufortDistribution = BEAUFORT_SCALE.map((level, index) => {
      const nextLevel = BEAUFORT_SCALE[index + 1];
      const high = nextLevel ? nextLevel.low : 1000;
      const count = maxWindKmh.filter(w => w >= level.low && w < high).length;
      return {
          category: level.cat,
          beaufort: level.bf,
          name: level.name,
          probability: maxWindKmh.length > 0 ? (count / maxWindKmh.length) * 100 : 0,
          effect: level.effect
      };
  });
  
  const minWind = Math.min(...maxWindKmh);
  const maxWind = Math.max(...maxWindKmh);
  const binCount = 10;
  const binSize = (maxWind - minWind) / binCount;
  const windSpeedDistribution = Array.from({ length: binCount }, (_, i) => {
      const binMin = minWind + i * binSize;
      const binMax = binMin + binSize;
      return {
          name: `${binMin.toFixed(0)}-${binMax.toFixed(0)}km/h`,
          count: maxWindKmh.filter(w => w >= binMin && w < binMax).length
      }
  });


  const yearlyStats = Array.from(new Set(windowData.map(d => d.year))).map(year => {
      const yearData = windowData.filter(d => d.year === year);
      return {
          year,
          WS_MAX_median: calculatePercentiles(yearData.map(d => d.WS10M_MAX ? d.WS10M_MAX * 3.6 : null), [50]).p50,
          WS_median: calculatePercentiles(yearData.map(d => d.WS10M ? d.WS10M * 3.6 : null), [50]).p50,
      };
  });
  
  return {
    percentiles: {
        avg: calculatePercentiles(windowData.map(d => d.WS10M ? d.WS10M * 3.6 : null), [10, 25, 50, 75, 90, 95, 98]),
        max: calculatePercentiles(maxWindKmh, [10, 25, 50, 75, 90, 95, 98]),
    },
    beaufortDistribution,
    mostCommonCondition: [...beaufortDistribution].sort((a, b) => b.probability - a.probability)[0],
    yearlyStats,
    trends: {
        avg: runMannKendall(yearlyStats.map(d => ({ year: d.year, value: d.WS_median}))),
        max: runMannKendall(yearlyStats.map(d => ({ year: d.year, value: d.WS_MAX_median}))),
    },
    windSpeedDistribution,
  };
};
