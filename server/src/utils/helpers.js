import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID using uuid v4.
 * @returns {string}
 */
export function generateId() {
  return uuidv4();
}

/**
 * Generate a random number from a standard normal distribution
 * using the Box-Muller transform.
 * @returns {number}
 */
export function randomNormal() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Clamp a value between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Round a number to a specific number of decimal places.
 * @param {number} value
 * @param {number} decimals
 * @returns {number}
 */
export function roundTo(value, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
