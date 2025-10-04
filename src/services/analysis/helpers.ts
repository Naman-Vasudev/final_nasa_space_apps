import type { PercentileData, TrendAnalysis } from '../../types';
import { mannKendall as mk } from './mannKendall';

export const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

export const calculatePercentiles = (data: (number | null)[], percentiles: number[]): PercentileData => {
    const sortedData = data.filter((d): d is number => d !== null && !isNaN(d)).sort((a, b) => a - b);
    const n = sortedData.length;
    if (n === 0) return { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0, p95: 0, p98: 0 };

    const result: any = {};
    percentiles.forEach(p => {
        const index = (p / 100) * (n - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        if (lower === upper) {
            result[`p${p}`] = sortedData[lower];
        } else if (lower >= n - 1) {
            result[`p${p}`] = sortedData[n-1];
        } else {
            result[`p${p}`] = sortedData[lower] * (upper - index) + sortedData[upper] * (index - lower);
        }
    });
    return result as PercentileData;
};

export const runMannKendall = (yearlyData: { year: number, value: number | null }[]): TrendAnalysis => {
    const values = yearlyData.map(d => d.value).filter((v): v is number => v !== null && !isNaN(v));
    if (values.length < 10) {
        return { trend: 'insufficient data', pValue: null, slope: null, significant: false, interpretation: 'Not enough data for trend analysis.' };
    }
    const result = mk(values);
    const isSignificant = result.pValue < 0.05;
    let interpretation = "No significant trend detected.";
    if (isSignificant) {
      interpretation = `${result.trend === 'increasing' ? 'Increasing' : 'Decreasing'} trend of ${result.slope.toFixed(3)} units/year.`
    }
    return { ...result, significant: isSignificant, interpretation };
};

/**
 * EPA cloud transmission factors for UV radiation.
 * @param cloudPercent The percentage of cloud cover.
 * @returns The transmission factor (0.0 to 1.0).
 */
export const getCloudTransmission = (cloudPercent: number | null): number => {
    if (cloudPercent === null || isNaN(cloudPercent)) return 1.0;
    if (cloudPercent < 10) return 1.00;
    if (cloudPercent < 40) return 0.89;
    if (cloudPercent < 70) return 0.73;
    return 0.31;
};

/**
 * Calculates the solar zenith angle at solar noon. UV Index is defined at solar noon.
 * Formula: δ = 23.45° × sin(360°/365 × (doy - 81)), SZA = |latitude - declination|
 * @param lat Latitude in degrees.
 * @param dayOfYear Day of the year (1-365).
 * @returns Solar zenith angle at solar noon in degrees.
 */
export const calculateSolarNoonSza = (lat: number, dayOfYear: number): number => {
    const declination = 23.45 * Math.sin(((360.0/365.0) * (dayOfYear - 81)) * (Math.PI / 180.0));
    return Math.abs(lat - declination);
};

/**
 * Calculates Clear-Sky UV Index based on the Allaart et al. (2004) empirical model.
 * This is the operational standard for many national weather services.
 * Formula: UVI = 12.5 × μ₀^(2.42) × (Ω/300)^(-1.23)
 * @param TO3 Total ozone column in Dobson Units.
 * @param SZA_noon Solar zenith angle at noon in degrees.
 * @param elevation_m Elevation in meters.
 * @param AOD_55 Aerosol Optical Depth at 550nm.
 * @returns Calculated clear-sky UV Index, or null if inputs are invalid.
 */
export const calculateClearSkyUvFromOzone = (
    TO3: number | null, 
    SZA_noon: number | null, 
    elevation_m: number, 
    AOD_55: number | null
): number | null => {
    if (TO3 === null || SZA_noon === null || isNaN(TO3) || isNaN(SZA_noon)) return null;
    if (SZA_noon >= 90) return 0.0;

    // Core Allaart formula
    const mu_0 = Math.cos(SZA_noon * (Math.PI / 180.0));
    if (mu_0 <= 0) return 0.0;
    const uviBase = 12.5 * Math.pow(mu_0, 2.42) * Math.pow(TO3 / 300.0, -1.23);

    // Elevation correction (+6% per km)
    const elevation_km = elevation_m / 1000.0;
    const elevationFactor = 1.0 + 0.06 * elevation_km;
    let uviElevated = uviBase * elevationFactor;

    // Aerosol correction
    if (AOD_55 !== null && !isNaN(AOD_55) && AOD_55 > 0) {
        // Empirical: UV reduction ≈ 5% per 0.1 AOD unit
        const aerosolFactor = Math.max(1.0 - (AOD_55 * 0.5), 0.5); // Cap at 50% reduction
        uviElevated *= aerosolFactor;
    }

    // Cap at realistic bounds
    return Math.min(Math.max(uviElevated, 0.0), 16.0);
};

/**
 * Calculates the NOAA Heat Index. Valid for T > 27°C and RH > 40%.
 * @param temp_c Temperature in Celsius.
 * @param rh Relative humidity in percent.
 * @returns Heat Index in Celsius, or null if inputs are invalid.
 */
export const calculateHeatIndex = (temp_c: number | null, rh: number | null): number | null => {
    if (temp_c === null || rh === null || isNaN(temp_c) || isNaN(rh)) return null;

    const temp_f = temp_c * 9/5 + 32;

    if (temp_f < 80 || rh < 40) return temp_c;

    const c1 = -42.379, c2 = 2.04901523, c3 = 10.14333127, c4 = -0.22475541;
    const c5 = -6.83783e-3, c6 = -5.481717e-2, c7 = 1.22874e-3, c8 = 8.5282e-4, c9 = -1.99e-6;
    
    let hi_f = c1 + c2*temp_f + c3*rh + c4*temp_f*rh + c5*temp_f**2 + c6*rh**2 + c7*temp_f**2*rh + c8*temp_f*rh**2 + c9*temp_f**2*rh**2;
    
    if (rh < 13 && temp_f >= 80 && temp_f <= 112) {
        const adjustment = ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(temp_f - 95)) / 17);
        hi_f -= adjustment;
    } else if (rh > 85 && temp_f >= 80 && temp_f <= 87) {
        const adjustment = ((rh - 85) / 10) * ((87 - temp_f) / 5);
        hi_f += adjustment;
    }

    return (hi_f - 32) * 5/9;
};

/**
 * Calculates the Wind Chill Index. Valid for T < 10°C and wind > 4.8 km/h.
 * @param temp_c Temperature in Celsius.
 * @param wind_ms Wind speed in m/s.
 * @returns Wind Chill in Celsius, or null if inputs are invalid.
 */
export const calculateWindChill = (temp_c: number | null, wind_ms: number | null): number | null => {
    if (temp_c === null || wind_ms === null || isNaN(temp_c) || isNaN(wind_ms)) return null;

    const wind_kmh = wind_ms * 3.6;
    if (temp_c > 10 || wind_kmh < 4.8) return temp_c;

    return 13.12 + 0.6215*temp_c - 11.37*Math.pow(wind_kmh, 0.16) + 0.3965*temp_c*Math.pow(wind_kmh, 0.16);
};
