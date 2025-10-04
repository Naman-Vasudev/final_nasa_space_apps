import type { NasaPowerData } from '../types';

const API_BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point";

// Comprehensive parameter list from all python scripts
const PARAMETERS = [
  "T2M", "T2M_MAX", "T2M_MIN", // Temperature
  "RH2M", "QV2M", // Humidity
  "PRECTOTCORR", "PRECSNO", // Precipitation
  "WS10M", "WS10M_MAX", // Wind (WS10M_MAX is better than WS2M_MAX from some scripts)
  "ALLSKY_SFC_UV_INDEX", "CLOUD_AMT", // UV & Solar
  "TO3", // Total Column Ozone
  "AOD_55" // Aerosol Optical Depth at 550nm
].join(',');

export const fetchWeatherData = async (lat: number, lon: number): Promise<NasaPowerData> => {
  // Use a fixed long-term date range for climatology
  const startDate = "19910101";
  const endDateObj = new Date();
  endDateObj.setDate(endDateObj.getDate() - 3); // Use data up to 3 days ago to ensure availability
  const endDate = endDateObj.toISOString().split('T')[0].replace(/-/g, '');

  const url = new URL(API_BASE_URL);
  url.searchParams.append("parameters", PARAMETERS);
  url.searchParams.append("community", "AG");
  url.searchParams.append("longitude", lon.toString());
  url.searchParams.append("latitude", lat.toString());
  url.searchParams.append("start", startDate);
  url.searchParams.append("end", endDate);
  url.searchParams.append("format", "JSON");

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`NASA POWER API Error: ${errorData.error || response.statusText}`);
    }
    const data = await response.json();
    if (!data?.properties?.parameter) {
        throw new Error("Invalid data structure from NASA POWER API.");
    }

    // Replace -999 with null for easier processing
    const parameters = data.properties.parameter;
    for (const param in parameters) {
        for (const date in parameters[param]) {
            if (parameters[param][date] === -999) {
                parameters[param][date] = null;
            }
        }
    }
    return parameters;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    throw new Error("Could not retrieve climate data from NASA. Please try again later.");
  }
};
