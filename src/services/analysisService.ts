import type { NasaPowerData, AnalysisData, GraphDataPoint, Location } from '../types';
import { 
    getDayOfYear, 
    calculatePercentiles, 
    calculateSolarNoonSza, 
    calculateClearSkyUvFromOzone,
    calculateHeatIndex,
    calculateWindChill
} from './analysis/helpers';
import { analyzeTemperature } from './analysis/temperature';
import { analyzePrecipitation } from './analysis/precipitation';
import { analyzeWind } from './analysis/wind';
import { analyzeHumidity } from './analysis/humidity';
import { analyzeUv } from './analysis/uv';
import { analyzeComfort } from './analysis/comfort';

const filterDataByWindow = (data: NasaPowerData, targetDateStr: string, windowDays: number) => {
    const targetDate = new Date(targetDateStr);
    targetDate.setUTCHours(12); // Avoid timezone issues
    const targetDoy = getDayOfYear(targetDate);
    const doyMin = targetDoy - windowDays;
    const doyMax = targetDoy + windowDays;

    const filtered: { date: Date; year: number; [key: string]: any }[] = [];
    const dateMap: { [key:string]: { date: Date; year: number; [key: string]: any } } = {};

    for (const paramKey in data) {
      for (const dateStr in data[paramKey]) {
          const year = parseInt(dateStr.slice(0, 4), 10);
          const month = parseInt(dateStr.slice(4, 6), 10) - 1;
          const day = parseInt(dateStr.slice(6, 8), 10);
          
          const date = new Date(Date.UTC(year, month, day, 12));
          const doy = getDayOfYear(date);

          if (doy >= doyMin && doy <= doyMax) {
              const dateKey = `${year}-${month}-${day}`;
              let entry = dateMap[dateKey];
              if (!entry) {
                  entry = { date, year };
                  dateMap[dateKey] = entry;
                  filtered.push(entry);
              }
              entry[paramKey] = data[paramKey][dateStr];
          }
      }
    }
    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
};

const analyzeDay = (dailyData: any[], lat: number, doy: number) => {
    if (dailyData.length === 0) return {};

    // Use the accurate ozone-based method for UV calculation
    const medianTO3 = calculatePercentiles(dailyData.map(d => d.TO3), [50]).p50;
    const medianAOD = calculatePercentiles(dailyData.map(d => d.AOD_55), [50]).p50;
    const szaNoon = calculateSolarNoonSza(lat, doy);
    // Elevation is assumed to be 0m, consistent with the main analysis
    const clearSkyUv = calculateClearSkyUvFromOzone(medianTO3, szaNoon, 0, medianAOD);
    
    // Calculate apparent temperature
    const medianTemp = calculatePercentiles(dailyData.map(d => d.T2M), [50]).p50;
    const medianMaxTemp = calculatePercentiles(dailyData.map(d => d.T2M_MAX), [50]).p50;
    const medianMinTemp = calculatePercentiles(dailyData.map(d => d.T2M_MIN), [50]).p50;
    const medianRh = calculatePercentiles(dailyData.map(d => d.RH2M), [50]).p50;
    const medianWind = calculatePercentiles(dailyData.map(d => d.WS10M), [50]).p50;
    
    let apparent_temp = medianTemp;
    const hi = calculateHeatIndex(medianMaxTemp, medianRh);
    if (hi !== null && hi > medianTemp) {
        apparent_temp = hi;
    }
    const wc = calculateWindChill(medianMinTemp, medianWind);
    if (wc !== null && wc < medianTemp) {
        apparent_temp = wc;
    }


    return {
        temperature: medianMaxTemp,
        precipitation: (dailyData.filter(d => ((d.PRECTOTCORR || 0) - (d.PRECSNO || 0)) >= 1.0).length / dailyData.length) * 100,
        wind: calculatePercentiles(dailyData.map(d => d.WS10M_MAX ? d.WS10M_MAX * 3.6 : null), [50]).p50,
        humidity: medianRh,
        uv: clearSkyUv,
        apparent_temp: apparent_temp
    };
};

const analyzeWindowForGraph = (windowData: any[], targetDateStr: string, windowDays: number, location: Location): GraphDataPoint[] => {
    const targetDate = new Date(targetDateStr);
    targetDate.setUTCHours(12);

    const graphData: GraphDataPoint[] = [];

    for (let i = -windowDays; i <= windowDays; i++) {
        const currentDate = new Date(targetDate);
        currentDate.setUTCDate(currentDate.getUTCDate() + i);

        const currentDoy = getDayOfYear(currentDate);
        const dailyDataForDoy = windowData.filter(d => getDayOfYear(d.date) === currentDoy);
        
        // Pass latitude and day of year for accurate UV calculation
        const dailyAnalysis = analyzeDay(dailyDataForDoy, location.lat, currentDoy);

        graphData.push({
            date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
            dayOffset: i,
            ...dailyAnalysis,
        });
    }
    return graphData;
};


// --- Main Orchestrator ---
export const analyzeAll = (data: NasaPowerData, targetDate: string, windowDays: number, location: Location): AnalysisData => {
  const windowData = filterDataByWindow(data, targetDate, windowDays);
  if (windowData.length < 30) {
      throw new Error("Insufficient historical data for the selected date window. Please try a different date or a wider day window.");
  }
  
  // Pass location data to the graph analysis for consistency
  const graphData = analyzeWindowForGraph(windowData, targetDate, windowDays, location);

  return {
    temperature: analyzeTemperature(windowData),
    precipitation: analyzePrecipitation(windowData),
    wind: analyzeWind(windowData),
    humidity: analyzeHumidity(windowData),
    uv: analyzeUv(windowData, location.lat),
    comfort: analyzeComfort(windowData),
    graphData
  };
};
