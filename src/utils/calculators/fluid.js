/**
 * Fluid Mechanics Calculator Module
 * Open Channel Flow, Pipe Flow, and Hydraulics
 * 
 * @author Concreate Club, IIT Indore
 */

import { roundTo, newtonRaphsonNumerical, linspace } from '../math/solver.js';

/**
 * Manning's Equation for Open Channel Flow
 * Q = (1/n) × A × R^(2/3) × S^(1/2)
 * V = (1/n) × R^(2/3) × S^(1/2)
 */
export function manningEquation(params) {
  const {
    channelType = 'rectangular',
    manningN = 0.013,
    slope = 0.001,
    // Rectangular/Trapezoidal parameters
    bottomWidth = 3,
    flowDepth = 1.5,
    sideSlope = 0,        // z:1 (horizontal:vertical)
    // Circular parameters
    diameter = 1,
    // Triangular parameters
    vertexAngle = 90
  } = params;

  const n = parseFloat(manningN);
  const S = parseFloat(slope);
  const b = parseFloat(bottomWidth);
  const y = parseFloat(flowDepth);
  const z = parseFloat(sideSlope);
  const D = parseFloat(diameter);
  const theta = parseFloat(vertexAngle) * Math.PI / 180;

  let A, P, R, T, D_h;

  switch (channelType) {
    case 'rectangular':
      A = b * y;
      P = b + 2 * y;
      T = b;
      break;

    case 'trapezoidal':
      A = (b + z * y) * y;
      P = b + 2 * y * Math.sqrt(1 + z * z);
      T = b + 2 * z * y;
      break;

    case 'triangular':
      A = y * y * Math.tan(theta / 2);
      P = 2 * y / Math.cos(theta / 2);
      T = 2 * y * Math.tan(theta / 2);
      break;

    case 'circular':
      // Assuming partially full flow
      const ratio = y / D;
      if (ratio >= 1) {
        // Full flow
        A = Math.PI * D * D / 4;
        P = Math.PI * D;
      } else {
        // Partial flow - angle calculation
        const thetaC = 2 * Math.acos(1 - 2 * ratio);
        A = (D * D / 8) * (thetaC - Math.sin(thetaC));
        P = D * thetaC / 2;
      }
      T = 2 * Math.sqrt(y * (D - y));
      break;

    default:
      A = b * y;
      P = b + 2 * y;
      T = b;
  }

  R = A / P;           // Hydraulic radius
  D_h = 4 * R;         // Hydraulic diameter

  // Manning's equation
  const V = (1 / n) * Math.pow(R, 2/3) * Math.pow(S, 0.5);
  const Q = A * V;

  // Froude number
  const g = 9.81;
  const hydraulicDepth = A / T;
  const Fr = V / Math.sqrt(g * hydraulicDepth);

  // Flow regime
  let flowRegime;
  if (Fr < 1) flowRegime = 'Subcritical';
  else if (Fr > 1) flowRegime = 'Supercritical';
  else flowRegime = 'Critical';

  return {
    area: roundTo(A, 4),
    wettedPerimeter: roundTo(P, 4),
    hydraulicRadius: roundTo(R, 4),
    hydraulicDiameter: roundTo(D_h, 4),
    velocity: roundTo(V, 4),
    discharge: roundTo(Q, 4),
    froudeNumber: roundTo(Fr, 4),
    flowRegime,
    topWidth: roundTo(T, 4),
    inputs: params
  };
}

/**
 * Calculate Normal Depth using Manning's Equation
 * Given Q, find y (iterative solution)
 */
export function normalDepth(params) {
  const {
    discharge = 10,
    channelType = 'rectangular',
    manningN = 0.013,
    slope = 0.001,
    bottomWidth = 3,
    sideSlope = 0,
    diameter = 1
  } = params;

  const Q = parseFloat(discharge);
  const n = parseFloat(manningN);
  const S = parseFloat(slope);
  const b = parseFloat(bottomWidth);
  const z = parseFloat(sideSlope);
  const D = parseFloat(diameter);

  // Function to solve: Q - (1/n) × A × R^(2/3) × S^(1/2) = 0
  const f = (y) => {
    let A, P;
    
    switch (channelType) {
      case 'rectangular':
        A = b * y;
        P = b + 2 * y;
        break;
      case 'trapezoidal':
        A = (b + z * y) * y;
        P = b + 2 * y * Math.sqrt(1 + z * z);
        break;
      case 'circular':
        if (y >= D) {
          A = Math.PI * D * D / 4;
          P = Math.PI * D;
        } else {
          const theta = 2 * Math.acos(1 - 2 * y / D);
          A = (D * D / 8) * (theta - Math.sin(theta));
          P = D * theta / 2;
        }
        break;
      default:
        A = b * y;
        P = b + 2 * y;
    }

    const R = A / P;
    return Q - (1 / n) * A * Math.pow(R, 2/3) * Math.pow(S, 0.5);
  };

  // Initial guess
  let y0;
  if (channelType === 'circular') {
    y0 = D / 2;
  } else {
    y0 = Math.pow(Q * n / (Math.sqrt(S) * b), 0.6);
  }

  const result = newtonRaphsonNumerical(f, y0);

  return {
    normalDepth: roundTo(result.root, 4),
    converged: result.converged,
    iterations: result.iterations,
    inputs: params
  };
}

/**
 * Critical Depth Calculation
 * At critical flow: Q²/g = A³/T
 */
export function criticalDepth(params) {
  const {
    discharge = 10,
    channelType = 'rectangular',
    bottomWidth = 3,
    sideSlope = 0
  } = params;

  const Q = parseFloat(discharge);
  const b = parseFloat(bottomWidth);
  const z = parseFloat(sideSlope);
  const g = 9.81;

  let yc;

  if (channelType === 'rectangular') {
    // Direct formula: yc = (Q²/(g×b²))^(1/3)
    yc = Math.pow(Q * Q / (g * b * b), 1/3);
  } else {
    // Iterative solution for other shapes
    const f = (y) => {
      let A, T;
      
      switch (channelType) {
        case 'trapezoidal':
          A = (b + z * y) * y;
          T = b + 2 * z * y;
          break;
        case 'triangular':
          A = z * y * y;
          T = 2 * z * y;
          break;
        default:
          A = b * y;
          T = b;
      }

      return Q * Q / g - A * A * A / T;
    };

    const result = newtonRaphsonNumerical(f, 1);
    yc = result.root;
  }

  // Calculate critical velocity
  let Ac, Tc;
  switch (channelType) {
    case 'rectangular':
      Ac = b * yc;
      Tc = b;
      break;
    case 'trapezoidal':
      Ac = (b + z * yc) * yc;
      Tc = b + 2 * z * yc;
      break;
    default:
      Ac = b * yc;
      Tc = b;
  }

  const Vc = Q / Ac;
  const Ec = yc + Vc * Vc / (2 * g); // Specific energy at critical depth

  return {
    criticalDepth: roundTo(yc, 4),
    criticalVelocity: roundTo(Vc, 4),
    criticalEnergy: roundTo(Ec, 4),
    inputs: params
  };
}

/**
 * Specific Energy Curve
 */
export function specificEnergyCurve(params) {
  const {
    discharge = 10,
    bottomWidth = 3,
    maxDepth = 5
  } = params;

  const Q = parseFloat(discharge);
  const b = parseFloat(bottomWidth);
  const g = 9.81;

  // Generate depth values
  const nPoints = 100;
  const depths = linspace(0.01, maxDepth, nPoints);
  
  const energies = depths.map(y => {
    const A = b * y;
    const V = Q / A;
    return y + V * V / (2 * g);
  });

  // Critical depth and minimum energy
  const yc = Math.pow(Q * Q / (g * b * b), 1/3);
  const Vc = Q / (b * yc);
  const Emin = yc + Vc * Vc / (2 * g);

  return {
    depths,
    energies,
    criticalDepth: roundTo(yc, 4),
    minimumEnergy: roundTo(Emin, 4)
  };
}

/**
 * Darcy-Weisbach Equation for Pipe Flow
 * hf = f × (L/D) × (V²/2g)
 */
export function darcyWeisbach(params) {
  const {
    pipeDiameter = 0.3,
    pipeLength = 100,
    flowVelocity = 2,
    roughness = 0.0015,
    kinematicViscosity = 1e-6
  } = params;

  const D = parseFloat(pipeDiameter);
  const L = parseFloat(pipeLength);
  const V = parseFloat(flowVelocity);
  const e = parseFloat(roughness);
  const nu = parseFloat(kinematicViscosity);
  const g = 9.81;

  // Reynolds number
  const Re = V * D / nu;

  // Friction factor using Colebrook-White equation (iterative)
  let f;
  if (Re < 2300) {
    // Laminar flow
    f = 64 / Re;
  } else {
    // Turbulent flow - Swamee-Jain approximation
    f = 0.25 / Math.pow(Math.log10(e / (3.7 * D) + 5.74 / Math.pow(Re, 0.9)), 2);
  }

  // Head loss
  const hf = f * (L / D) * (V * V / (2 * g));

  // Discharge
  const A = Math.PI * D * D / 4;
  const Q = A * V;

  // Flow regime
  let flowRegime;
  if (Re < 2300) flowRegime = 'Laminar';
  else if (Re < 4000) flowRegime = 'Transitional';
  else flowRegime = 'Turbulent';

  return {
    reynoldsNumber: roundTo(Re, 0),
    frictionFactor: roundTo(f, 6),
    headLoss: roundTo(hf, 4),
    discharge: roundTo(Q, 6),
    flowRegime,
    inputs: params
  };
}

/**
 * Hazen-Williams Equation
 * V = 0.849 × C × R^0.63 × S^0.54
 */
export function hazenWilliams(params) {
  const {
    pipeDiameter = 0.3,
    hazenWilliamsC = 130,
    slope = 0.01
  } = params;

  const D = parseFloat(pipeDiameter);
  const C = parseFloat(hazenWilliamsC);
  const S = parseFloat(slope);

  const R = D / 4; // Hydraulic radius for full pipe
  const V = 0.849 * C * Math.pow(R, 0.63) * Math.pow(S, 0.54);
  const A = Math.PI * D * D / 4;
  const Q = A * V;

  return {
    velocity: roundTo(V, 4),
    discharge: roundTo(Q, 6),
    inputs: params
  };
}

/**
 * Hydraulic Jump Calculations
 * Sequent depth ratio for rectangular channel
 */
export function hydraulicJump(params) {
  const {
    upstreamDepth = 0.5,
    discharge = 10,
    channelWidth = 3
  } = params;

  const y1 = parseFloat(upstreamDepth);
  const Q = parseFloat(discharge);
  const b = parseFloat(channelWidth);
  const g = 9.81;

  // Upstream velocity and Froude number
  const V1 = Q / (b * y1);
  const Fr1 = V1 / Math.sqrt(g * y1);

  if (Fr1 < 1) {
    return {
      error: 'Upstream flow must be supercritical (Fr > 1) for hydraulic jump',
      upstreamFroude: roundTo(Fr1, 4)
    };
  }

  // Sequent depth (Belanger equation)
  const y2 = (y1 / 2) * (Math.sqrt(1 + 8 * Fr1 * Fr1) - 1);

  // Downstream velocity and Froude number
  const V2 = Q / (b * y2);
  const Fr2 = V2 / Math.sqrt(g * y2);

  // Energy loss
  const E1 = y1 + V1 * V1 / (2 * g);
  const E2 = y2 + V2 * V2 / (2 * g);
  const energyLoss = E1 - E2;

  // Jump classification
  let jumpType;
  if (Fr1 < 1.7) jumpType = 'Undular Jump';
  else if (Fr1 < 2.5) jumpType = 'Weak Jump';
  else if (Fr1 < 4.5) jumpType = 'Oscillating Jump';
  else if (Fr1 < 9) jumpType = 'Steady Jump';
  else jumpType = 'Strong Jump';

  // Length of jump (approximate)
  const jumpLength = 6.1 * y2;

  return {
    upstream: {
      depth: roundTo(y1, 4),
      velocity: roundTo(V1, 4),
      froude: roundTo(Fr1, 4),
      specificEnergy: roundTo(E1, 4)
    },
    downstream: {
      depth: roundTo(y2, 4),
      velocity: roundTo(V2, 4),
      froude: roundTo(Fr2, 4),
      specificEnergy: roundTo(E2, 4)
    },
    depthRatio: roundTo(y2 / y1, 4),
    energyLoss: roundTo(energyLoss, 4),
    relativeEnergyLoss: roundTo((energyLoss / E1) * 100, 2),
    jumpType,
    jumpLength: roundTo(jumpLength, 4),
    inputs: params
  };
}

export default {
  manningEquation,
  normalDepth,
  criticalDepth,
  specificEnergyCurve,
  darcyWeisbach,
  hazenWilliams,
  hydraulicJump
};
