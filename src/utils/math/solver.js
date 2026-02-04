/**
 * CiviCalc Mathematical Solver Engine
 * Custom numerical methods for civil engineering calculations
 * 
 * @author Concreate Club, IIT Indore
 */

/**
 * Newton-Raphson Method for finding roots of equations
 * Used for implicit equations like Manning's equation
 * 
 * Formula: x_{n+1} = x_n - f(x_n) / f'(x_n)
 * 
 * @param {Function} f - The function f(x) whose root we want to find
 * @param {Function} fPrime - The derivative f'(x)
 * @param {number} x0 - Initial guess
 * @param {number} tolerance - Convergence tolerance (default 1e-6)
 * @param {number} maxIterations - Maximum iterations (default 100)
 * @returns {Object} { root, iterations, converged, error }
 */
export function newtonRaphson(f, fPrime, x0, tolerance = 1e-6, maxIterations = 100) {
  let x = x0;
  let iterations = 0;
  let converged = false;
  let error = Infinity;

  for (let i = 0; i < maxIterations; i++) {
    const fx = f(x);
    const fpx = fPrime(x);
    
    // Check for zero derivative (would cause division by zero)
    if (Math.abs(fpx) < 1e-15) {
      console.warn('Newton-Raphson: Derivative near zero, trying perturbation');
      x += tolerance * 10;
      continue;
    }

    const xNew = x - fx / fpx;
    error = Math.abs(xNew - x);
    iterations = i + 1;

    if (error < tolerance) {
      converged = true;
      x = xNew;
      break;
    }

    x = xNew;
  }

  return {
    root: x,
    iterations,
    converged,
    error,
    value: f(x)
  };
}

/**
 * Newton-Raphson with numerical derivative approximation
 * Used when analytical derivative is not available
 * 
 * @param {Function} f - The function f(x)
 * @param {number} x0 - Initial guess
 * @param {number} tolerance - Convergence tolerance
 * @param {number} maxIterations - Maximum iterations
 * @returns {Object} Result object
 */
export function newtonRaphsonNumerical(f, x0, tolerance = 1e-6, maxIterations = 100) {
  const h = 1e-8; // Step for numerical derivative
  
  const fPrime = (x) => (f(x + h) - f(x - h)) / (2 * h);
  
  return newtonRaphson(f, fPrime, x0, tolerance, maxIterations);
}

/**
 * Bisection Method (fallback for Newton-Raphson failures)
 * Guaranteed to converge if root exists in [a, b]
 * 
 * @param {Function} f - The function
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @param {number} tolerance - Convergence tolerance
 * @param {number} maxIterations - Maximum iterations
 * @returns {Object} Result object
 */
export function bisection(f, a, b, tolerance = 1e-6, maxIterations = 100) {
  let fa = f(a);
  let fb = f(b);
  
  if (fa * fb > 0) {
    throw new Error('Bisection requires f(a) and f(b) to have opposite signs');
  }

  let iterations = 0;
  let mid, fmid;

  for (let i = 0; i < maxIterations; i++) {
    mid = (a + b) / 2;
    fmid = f(mid);
    iterations = i + 1;

    if (Math.abs(fmid) < tolerance || (b - a) / 2 < tolerance) {
      return { root: mid, iterations, converged: true, error: Math.abs(fmid) };
    }

    if (fa * fmid < 0) {
      b = mid;
      fb = fmid;
    } else {
      a = mid;
      fa = fmid;
    }
  }

  return { root: mid, iterations, converged: false, error: Math.abs(fmid) };
}

/**
 * Simpson's 1/3 Rule for numerical integration
 * Approximates: ∫[a,b] f(x) dx
 * 
 * @param {number[]} y - Array of y values (must be odd length)
 * @param {number} dx - Step size between points
 * @returns {number} Approximate integral value
 */
export function simpsonsRule(y, dx) {
  const n = y.length - 1;
  
  if (n < 2) {
    throw new Error('Simpson\'s rule requires at least 3 points');
  }

  // Ensure even number of intervals (odd number of points)
  let effectiveN = n;
  let effectiveY = y;
  
  if (n % 2 !== 0) {
    // Use trapezoidal rule for last segment if odd
    effectiveN = n - 1;
    effectiveY = y.slice(0, -1);
  }

  let sum = effectiveY[0] + effectiveY[effectiveN];

  // Odd indices (coefficient 4)
  for (let i = 1; i < effectiveN; i += 2) {
    sum += 4 * effectiveY[i];
  }

  // Even indices (coefficient 2)
  for (let i = 2; i < effectiveN; i += 2) {
    sum += 2 * effectiveY[i];
  }

  let integral = (dx / 3) * sum;

  // Add trapezoidal contribution for last segment if original n was odd
  if (n % 2 !== 0) {
    integral += (dx / 2) * (y[n - 1] + y[n]);
  }

  return integral;
}

/**
 * Trapezoidal Rule for numerical integration
 * Alternative to Simpson's rule, works for any number of points
 * 
 * @param {number[]} y - Array of y values
 * @param {number} dx - Step size
 * @returns {number} Approximate integral
 */
export function trapezoidalRule(y, dx) {
  if (y.length < 2) {
    throw new Error('Trapezoidal rule requires at least 2 points');
  }

  let sum = (y[0] + y[y.length - 1]) / 2;
  
  for (let i = 1; i < y.length - 1; i++) {
    sum += y[i];
  }

  return dx * sum;
}

/**
 * Cumulative integration (running integral)
 * Returns array of integrated values at each point
 * 
 * @param {number[]} y - Array of y values
 * @param {number} dx - Step size
 * @param {number} initialValue - Initial value of integral (default 0)
 * @returns {number[]} Array of cumulative integral values
 */
export function cumulativeIntegral(y, dx, initialValue = 0) {
  const result = [initialValue];
  
  for (let i = 1; i < y.length; i++) {
    // Trapezoidal rule for each segment
    const increment = (dx / 2) * (y[i - 1] + y[i]);
    result.push(result[i - 1] + increment);
  }

  return result;
}

/**
 * Double integration (for deflection from moment)
 * Integrates twice with boundary condition adjustments
 * 
 * @param {number[]} y - Array of values to integrate twice
 * @param {number} dx - Step size
 * @param {Object} bc - Boundary conditions { y0: value at start, yL: value at end }
 * @returns {number[]} Doubly integrated values
 */
export function doubleIntegral(y, dx, bc = { y0: 0, yL: 0 }) {
  // First integration (slope)
  const slope = cumulativeIntegral(y, dx, 0);
  
  // Second integration (deflection)
  const deflection = cumulativeIntegral(slope, dx, bc.y0);
  
  // Apply boundary condition at end (linear correction)
  const L = dx * (y.length - 1);
  const currentEnd = deflection[deflection.length - 1];
  const correction = (bc.yL - currentEnd) / L;
  
  // Also need to adjust slope for simply supported beam
  for (let i = 0; i < deflection.length; i++) {
    deflection[i] -= correction * (i * dx);
  }

  return deflection;
}

/**
 * Central difference numerical derivative
 * 
 * @param {number[]} y - Array of values
 * @param {number} dx - Step size
 * @returns {number[]} Array of derivative values
 */
export function numericalDerivative(y, dx) {
  const dy = [];
  
  // Forward difference for first point
  dy.push((y[1] - y[0]) / dx);
  
  // Central difference for interior points
  for (let i = 1; i < y.length - 1; i++) {
    dy.push((y[i + 1] - y[i - 1]) / (2 * dx));
  }
  
  // Backward difference for last point
  dy.push((y[y.length - 1] - y[y.length - 2]) / dx);

  return dy;
}

/**
 * Linear interpolation
 * 
 * @param {number[]} x - X values (must be sorted ascending)
 * @param {number[]} y - Corresponding Y values
 * @param {number} xi - X value to interpolate
 * @returns {number} Interpolated Y value
 */
export function linearInterpolate(x, y, xi) {
  if (xi <= x[0]) return y[0];
  if (xi >= x[x.length - 1]) return y[y.length - 1];

  for (let i = 0; i < x.length - 1; i++) {
    if (xi >= x[i] && xi <= x[i + 1]) {
      const t = (xi - x[i]) / (x[i + 1] - x[i]);
      return y[i] + t * (y[i + 1] - y[i]);
    }
  }

  return y[y.length - 1];
}

/**
 * Find maximum absolute value and its position
 * 
 * @param {number[]} arr - Array of numbers
 * @returns {Object} { max, index, position (if dx provided) }
 */
export function findMaxAbs(arr, dx = 1) {
  let maxVal = 0;
  let maxIndex = 0;

  for (let i = 0; i < arr.length; i++) {
    if (Math.abs(arr[i]) > Math.abs(maxVal)) {
      maxVal = arr[i];
      maxIndex = i;
    }
  }

  return {
    max: maxVal,
    absMax: Math.abs(maxVal),
    index: maxIndex,
    position: maxIndex * dx
  };
}

/**
 * Create evenly spaced array
 * 
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} n - Number of points
 * @returns {number[]} Array of n evenly spaced values
 */
export function linspace(start, end, n) {
  if (n < 2) return [start];
  
  const step = (end - start) / (n - 1);
  const arr = [];
  
  for (let i = 0; i < n; i++) {
    arr.push(start + i * step);
  }

  return arr;
}

/**
 * Create array of zeros
 * 
 * @param {number} n - Length
 * @returns {number[]} Array of zeros
 */
export function zeros(n) {
  return new Array(n).fill(0);
}

/**
 * Round to specified decimal places
 * 
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export function roundTo(value, decimals = 4) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export default {
  newtonRaphson,
  newtonRaphsonNumerical,
  bisection,
  simpsonsRule,
  trapezoidalRule,
  cumulativeIntegral,
  doubleIntegral,
  numericalDerivative,
  linearInterpolate,
  findMaxAbs,
  linspace,
  zeros,
  roundTo
};
