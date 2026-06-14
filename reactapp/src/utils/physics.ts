import type { Circuit } from '../types/circuit';

/**
 * Counts significant figures of a number based on string representation.
 * In this implementation, all digits (ignoring leading zeros) are significant,
 * including trailing zeros (as per user request: "120V is 3BC").
 */
export function countSigFigs(value: number | string): number {
  const str = value.toString().replace('-', '').replace('.', '');
  // Skip leading zeros
  const match = str.match(/[1-9]/);
  if (!match) return 1; 
  return str.length - match.index!;
}

/**
 * Calculates the overall precision (minimum sig figs) of a result based on all circuit inputs.
 */
export function getCircuitPrecision(circuit: Circuit): number {
  const values: number[] = [circuit.voltageSource.value];
  circuit.components.filter(c => c.type === 'resistor' && c.enabled).forEach(c => values.push(c.value));
  
  if (values.length === 0) return 3; // Default
  
  const precisons = values.map(v => countSigFigs(v));
  return Math.min(...precisons);
}

/**
 * Formats a number to a fixed number of significant figures.
 * Uses scientific notation for 1000+ or decimals <= 0.01 or when ambiguity occurs.
 */
export function formatSigFigs(value: number, sigFigs: number, useKatex: boolean = true): string {
  if (value === 0) return useKatex ? "0" : "0";
  if (isNaN(value)) return "NaN";
  if (!isFinite(value)) return "\\infty";

  const absVal = Math.abs(value);
  const exponent = Math.floor(Math.log10(absVal));
  
  // Decide whether to use scientific notation. 
  // User says "use 1,2 * 10^3 instead of 1200".
  // Scientific notation is REQUIRED if:
  // 1. exponent >= 3 or <= -2
  // 2. OR if sigFigs < (exponent + 1), which means trailing zeros of an integer are not all significant
  const useScientific = exponent >= 3 || exponent <= -2 || sigFigs < (exponent + 1);

  if (useScientific) {
    const mantissa = value / Math.pow(10, exponent);
    // Format mantissa to have the correct number of decimal places for total sigFigs.
    // Total sigFigs is mantissa's leading digit + decimals.
    const formattedMantissa = mantissa.toFixed(sigFigs - 1).replace('.', ',');
    
    if (useKatex) {
      return `${formattedMantissa} \\cdot 10^{${exponent}}`;
    } else {
       return `${formattedMantissa}·10^${exponent}`;
    }
  } else {
    // Normal decimal format.
    // We need to ensure we show the correct number of sig figs (including trailing zeros).
    // The number of decimal places needed: sigFigs - (exponent + 1)
    const decimalPlaces = Math.max(0, sigFigs - (exponent + 1));
    const formatted = value.toFixed(decimalPlaces).replace('.', ',');
    return formatted;
  }
}
