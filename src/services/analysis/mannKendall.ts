// This module is an adaptation of the 'mann-kendall' JavaScript library for use in a TypeScript project.
// By vendoring this code, we eliminate the need for an external CDN, improving reliability.

export interface MannKendallResult {
  trend: 'increasing' | 'decreasing' | 'no trend';
  pValue: number;
  slope: number;
}

/**
 * Calculates the Mann-Kendall trend test.
 * @param {number[]} data - An array of numerical data.
 * @returns {MannKendallResult} An object containing the trend, p-value, and slope.
 */
export function mannKendall(data: number[]): MannKendallResult {
  const n = data.length;
  let S = 0;

  for (let k = 0; k < n - 1; k++) {
    for (let j = k + 1; j < n; j++) {
      S += Math.sign(data[j] - data[k]);
    }
  }

  const unique = new Set(data);
  let varS = 0;
  if (unique.size === n) {
    varS = (n * (n - 1) * (2 * n + 5)) / 18;
  } else {
    const ties = Array.from(unique).map(val => data.filter(d => d === val).length);
    const tieTerm = ties.reduce((acc, t) => acc + t * (t - 1) * (2 * t + 5), 0);
    varS = (n * (n - 1) * (2 * n + 5) - tieTerm) / 18;
  }

  let z = 0;
  if (S > 0) {
    z = (S - 1) / Math.sqrt(varS);
  } else if (S < 0) {
    z = (S + 1) / Math.sqrt(varS);
  }

  const pValue = 2 * (1 - normalCdf(Math.abs(z)));

  let trend: 'increasing' | 'decreasing' | 'no trend';
  if (pValue < 0.05) {
    trend = S > 0 ? 'increasing' : 'decreasing';
  } else {
    trend = 'no trend';
  }

  const slopes: number[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      slopes.push((data[j] - data[i]) / (j - i));
    }
  }
  slopes.sort((a, b) => a - b);
  const medianIndex = Math.floor(slopes.length / 2);
  const slope = slopes.length % 2 === 0 ? (slopes[medianIndex - 1] + slopes[medianIndex]) / 2 : slopes[medianIndex];
  
  return { trend, pValue, slope };
}

/**
 * Cumulative distribution function for the standard normal distribution.
 * @param {number} x - The value.
 * @returns {number} The probability.
 */
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.33267 * x);
  const a1 = 0.4361836;
  const a2 = -0.1201676;
  const a3 = 0.9372980;
  const phi = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-x * x / 2) * (a1 * t + a2 * t * t + a3 * t * t * t);
  return phi;
}
