export interface Location {
  lat: number;
  lon: number;
  name?: string;
}

export interface GraphDataPoint {
  date: string;
  dayOffset: number;
  temperature?: number;
  precipitation?: number;
  wind?: number;
  humidity?: number;
  uv?: number | null;
  apparent_temp?: number;
}

export interface AnalysisData {
  temperature: TemperatureAnalysis | null;
  precipitation: PrecipitationAnalysis | null;
  wind: WindAnalysis | null;
  humidity: HumidityAnalysis | null;
  uv: UvAnalysis | null;
  comfort: ComfortAnalysis | null;
  graphData: GraphDataPoint[];
}

export interface PercentileData {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p98: number;
}

export interface TrendAnalysis {
  trend: string;
  pValue: number | null;
  slope: number | null;
  significant: boolean;
  interpretation: string;
}

export interface DistributionBin {
  name: string;
  count: number;
}

export interface TemperatureAnalysis {
  percentiles: {
    max: PercentileData;
    min: PercentileData;
    avg: PercentileData;
  };
  heatProbabilities: { name: string; threshold: number; probability: number }[];
  coldProbabilities: { name: string; threshold: number; probability: number }[];
  yearlyStats: { year: number; T2M_MAX_median: number; T2M_MIN_median: number }[];
  trends: {
    max: TrendAnalysis;
    min: TrendAnalysis;
  };
}

export interface ConditionalEffect {
    bin: string;
    value: number;
    days: number;
}

export interface PrecipitationAnalysis {
  probRain: number;
  probSnow: number;
  medianRain: number;
  medianSnow: number;
  yearlyStats: { year: number, total_rain: number, rain_days: number, total_snow: number, snow_days: number}[];
  rainTrend: TrendAnalysis;
  snowTrend: TrendAnalysis;
  hasSnow: boolean;
  rainIntensityDistribution: DistributionBin[];
  snowIntensityDistribution: DistributionBin[];
  humidityEffect: { bin: string; rainProb: number; snowProb: number; }[];
  temperatureEffect: {
    rain: ConditionalEffect[];
    snow: ConditionalEffect[];
  }
}

export interface BeaufortResult {
  category: string;
  beaufort: number;
  name: string;
  probability: number;
  effect: string;
}

export interface WindAnalysis {
  percentiles: {
    avg: PercentileData;
    max: PercentileData;
  };
  beaufortDistribution: BeaufortResult[];
  mostCommonCondition: BeaufortResult;
  yearlyStats: { year: number; WS_MAX_median: number; WS_median: number }[];
  trends: {
    avg: TrendAnalysis;
    max: TrendAnalysis;
  };
  windSpeedDistribution: DistributionBin[];
}

export interface ExceedanceProb {
    category: string;
    threshold: number;
    probability: number;
}
export interface HumidityAnalysis {
  percentiles: {
    relative: PercentileData;
    specific: PercentileData;
  };
  yearlyStats: { year: number; RH_median: number; QV_median: number }[];
  trends: {
    relative: TrendAnalysis;
    specific: TrendAnalysis;
  };
  humidityDistribution: DistributionBin[];
  exceedanceProbabilities: {
      relative: ExceedanceProb[];
      specific: ExceedanceProb[];
  }
}

export interface UvCategory {
  name: string;
  range: [number, number];
  color: string;
  probability: number;
  advice: string;
}

export interface UvAnalysis {
  medianAllSky: number;
  medianClearSky: number;
  medianCloud: number;
  cloudUvReduction: number;
  allSkyCategory: { name: string; advice: string };
  clearSkyCategory: { name: string; advice: string };
  distribution: UvCategory[];
  yearlyStats: { year: number, UV_clearsky_median: number, Cloud_median: number }[];
  uvTrend: TrendAnalysis;
}

export interface ComfortAnalysis {
  medianApparentTemp: number;
  heatIndex: {
    applicableDays: number;
    median: number | null;
    max: number | null;
  };
  windChill: {
    applicableDays: number;
    median: number | null;
    min: number | null;
  };
  comfortDistribution: {
    comfortable: number;
    hot: number;
    cold: number;
  };
  yearlyStats: {
    year: number;
    HI_max: number | null;
    WC_min: number | null;
  }[];
  trends: {
    heatIndex: TrendAnalysis;
    windChill: TrendAnalysis;
  };
  heatIndexDistribution: { name: string, 'Heat Index': number, 'Actual Temp': number }[];
  windChillDistribution: { name: string, 'Wind Chill': number, 'Actual Temp': number }[];
  humidityEffectOnHeat: ConditionalEffect[];
  windEffectOnCold: ConditionalEffect[];
}

export interface NasaPowerData {
  [parameter: string]: {
    [date: string]: number | null;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// Types for the new Activity Planner feature
export interface ActivitySuggestion {
  name: string;
  suitability: 'Good' | 'Caution' | 'Not Recommended';
  reason: string;
}

export interface ActivityCategory {
  category: string;
  suggestions: ActivitySuggestion[];
}

export type ActivityPlan = ActivityCategory[];

export interface HistoricalData {
  [key: string]: number | null;
}