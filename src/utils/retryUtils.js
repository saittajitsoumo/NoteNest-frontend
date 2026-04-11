/**
 * Retry utility for handling rate limits and transient errors
 * Implements exponential backoff strategy
 */

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Debounce function calls
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 */
export const debounce = (fn, delay = 500) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle function calls
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit in ms
 */
export const throttle = (fn, limit = 1000) => {
  let lastRun = 0;
  
  return (...args) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      lastRun = now;
      return fn(...args);
    }
  };
};
