/**
 * Geotechnical Engineering Calculator Module
 * Bearing Capacity, Settlement, and Soil Analysis
 * 
 * @author Concreate Club, IIT Indore
 */

import { roundTo, newtonRaphsonNumerical } from '../math/solver.js';

/**
 * Terzaghi's Bearing Capacity Theory
 * qu = c·Nc + γ·Df·Nq + 0.5·γ·B·Nγ
 */
export function terzaghiBearingCapacity(params) {
  const {
    cohesion = 20,           // c (kPa)
    frictionAngle = 30,      // φ (degrees)
    unitWeight = 18,         // γ (kN/m³)
    foundationDepth = 1,     // Df (m)
    foundationWidth = 2,     // B (m)
    foundationType = 'strip' // strip, square, circular
  } = params;

  const phi = frictionAngle * Math.PI / 180; // Convert to radians
  const c = parseFloat(cohesion);
  const gamma = parseFloat(unitWeight);
  const Df = parseFloat(foundationDepth);
  const B = parseFloat(foundationWidth);

  // Terzaghi bearing capacity factors
  const Nq = Math.exp(Math.PI * Math.tan(phi)) * Math.pow(Math.tan(Math.PI / 4 + phi / 2), 2);
  const Nc = (Nq - 1) / Math.tan(phi || 0.001); // Avoid division by zero
  const Ngamma = 2 * (Nq + 1) * Math.tan(phi);

  // Shape factors
  let sc, sq, sg;
  switch (foundationType) {
    case 'square':
      sc = 1.3;
      sq = 1;
      sg = 0.8;
      break;
    case 'circular':
      sc = 1.3;
      sq = 1;
      sg = 0.6;
      break;
    default: // strip
      sc = 1;
      sq = 1;
      sg = 1;
  }

  // Ultimate bearing capacity
  const q_c = c * Nc * sc;
  const q_q = gamma * Df * Nq * sq;
  const q_gamma = 0.5 * gamma * B * Ngamma * sg;
  const qu = q_c + q_q + q_gamma;

  // Safe bearing capacity (FOS = 3)
  const FOS = 3;
  const qs = qu / FOS;

  // Net ultimate bearing capacity
  const qnu = qu - gamma * Df;

  return {
    bearingCapacityFactors: {
      Nc: roundTo(Nc, 4),
      Nq: roundTo(Nq, 4),
      Ngamma: roundTo(Ngamma, 4)
    },
    contributions: {
      cohesion: roundTo(q_c, 4),
      surcharge: roundTo(q_q, 4),
      selfWeight: roundTo(q_gamma, 4)
    },
    ultimateBearingCapacity: roundTo(qu, 4),
    netUltimateBearingCapacity: roundTo(qnu, 4),
    safeBearingCapacity: roundTo(qs, 4),
    factorOfSafety: FOS,
    inputs: { cohesion: c, frictionAngle, unitWeight: gamma, foundationDepth: Df, foundationWidth: B, foundationType }
  };
}

/**
 * Meyerhof's Bearing Capacity Theory
 * Includes depth and inclination factors
 */
export function meyerhofBearingCapacity(params) {
  const {
    cohesion = 20,
    frictionAngle = 30,
    unitWeight = 18,
    foundationDepth = 1,
    foundationWidth = 2,
    foundationLength = 4,
    loadInclination = 0
  } = params;

  const phi = frictionAngle * Math.PI / 180;
  const c = parseFloat(cohesion);
  const gamma = parseFloat(unitWeight);
  const Df = parseFloat(foundationDepth);
  const B = parseFloat(foundationWidth);
  const L = parseFloat(foundationLength);
  const alpha = loadInclination * Math.PI / 180;

  // Meyerhof bearing capacity factors
  const Nq = Math.exp(Math.PI * Math.tan(phi)) * Math.pow(Math.tan(Math.PI / 4 + phi / 2), 2);
  const Nc = (Nq - 1) / Math.tan(phi || 0.001);
  const Ngamma = (Nq - 1) * Math.tan(1.4 * phi);

  // Shape factors
  const sc = 1 + 0.2 * (B / L);
  const sq = 1 + 0.1 * (B / L) * Math.tan(Math.PI / 4 + phi / 2);
  const sg = sq;

  // Depth factors
  const dc = 1 + 0.2 * (Df / B) * Math.sqrt(Nq);
  const dq = 1 + 0.1 * (Df / B) * Math.sqrt(Nq);
  const dg = dq;

  // Inclination factors
  const ic = Math.pow(1 - alpha / (Math.PI / 2), 2);
  const iq = ic;
  const ig = Math.pow(1 - alpha / phi, 2);

  // Ultimate bearing capacity
  const qu = c * Nc * sc * dc * ic + 
             gamma * Df * Nq * sq * dq * iq + 
             0.5 * gamma * B * Ngamma * sg * dg * ig;

  return {
    bearingCapacityFactors: { Nc: roundTo(Nc, 4), Nq: roundTo(Nq, 4), Ngamma: roundTo(Ngamma, 4) },
    shapeFactors: { sc: roundTo(sc, 4), sq: roundTo(sq, 4), sg: roundTo(sg, 4) },
    depthFactors: { dc: roundTo(dc, 4), dq: roundTo(dq, 4), dg: roundTo(dg, 4) },
    inclinationFactors: { ic: roundTo(ic, 4), iq: roundTo(iq, 4), ig: roundTo(ig, 4) },
    ultimateBearingCapacity: roundTo(qu, 4),
    safeBearingCapacity: roundTo(qu / 3, 4),
    inputs: params
  };
}

/**
 * Immediate (Elastic) Settlement Calculation
 * Si = q × B × (1 - μ²) × If / Es
 */
export function immediateSettlement(params) {
  const {
    pressure = 100,          // q (kPa)
    foundationWidth = 2,     // B (m)
    elasticModulus = 25000,  // Es (kPa)
    poissonRatio = 0.3,      // μ
    foundationType = 'flexible-center',
    foundationLength = 4     // L (m) for rectangular
  } = params;

  const q = parseFloat(pressure);
  const B = parseFloat(foundationWidth);
  const L = parseFloat(foundationLength);
  const Es = parseFloat(elasticModulus);
  const mu = parseFloat(poissonRatio);

  // Influence factors based on foundation type and shape
  let If;
  const LB = L / B;
  
  switch (foundationType) {
    case 'rigid':
      If = 0.88 * (1 + 0.174 * Math.log10(LB));
      break;
    case 'flexible-corner':
      If = 0.56 * (1 + 0.174 * Math.log10(LB));
      break;
    case 'flexible-center':
    default:
      If = 1.12 * (1 + 0.174 * Math.log10(LB));
  }

  // Immediate settlement
  const Si = (q * B * (1 - mu * mu) * If) / Es;

  return {
    immediateSettlement: roundTo(Si * 1000, 4), // Convert to mm
    influenceFactor: roundTo(If, 4),
    inputs: { pressure: q, foundationWidth: B, foundationLength: L, elasticModulus: Es, poissonRatio: mu }
  };
}

/**
 * Consolidation Settlement
 * Sc = Cc × H / (1 + e0) × log10((σ'0 + Δσ) / σ'0)
 */
export function consolidationSettlement(params) {
  const {
    compressionIndex = 0.3,      // Cc
    initialVoidRatio = 0.8,      // e0
    layerThickness = 5,          // H (m)
    initialEffectiveStress = 50, // σ'0 (kPa)
    stressIncrease = 100,        // Δσ (kPa)
    recompressionIndex = 0.06,   // Cr
    preconsolidationPressure = 80 // σ'c (kPa)
  } = params;

  const Cc = parseFloat(compressionIndex);
  const Cr = parseFloat(recompressionIndex);
  const e0 = parseFloat(initialVoidRatio);
  const H = parseFloat(layerThickness);
  const sigma0 = parseFloat(initialEffectiveStress);
  const deltaSigma = parseFloat(stressIncrease);
  const sigmaC = parseFloat(preconsolidationPressure);

  const sigmaFinal = sigma0 + deltaSigma;

  let Sc;
  let compressionType;

  if (sigma0 >= sigmaC) {
    // Normally consolidated
    Sc = (Cc * H) / (1 + e0) * Math.log10(sigmaFinal / sigma0);
    compressionType = 'Normally Consolidated';
  } else if (sigmaFinal <= sigmaC) {
    // Over-consolidated (recompression only)
    Sc = (Cr * H) / (1 + e0) * Math.log10(sigmaFinal / sigma0);
    compressionType = 'Over-Consolidated (Recompression)';
  } else {
    // Over-consolidated transitioning to normally consolidated
    const Sc1 = (Cr * H) / (1 + e0) * Math.log10(sigmaC / sigma0);
    const Sc2 = (Cc * H) / (1 + e0) * Math.log10(sigmaFinal / sigmaC);
    Sc = Sc1 + Sc2;
    compressionType = 'Over-Consolidated (Transition)';
  }

  return {
    consolidationSettlement: roundTo(Sc * 1000, 4), // mm
    compressionType,
    finalEffectiveStress: roundTo(sigmaFinal, 4),
    overConsolidationRatio: roundTo(sigmaC / sigma0, 4),
    inputs: params
  };
}

/**
 * Earth Pressure Calculations (Rankine's Theory)
 */
export function earthPressure(params) {
  const {
    frictionAngle = 30,     // φ (degrees)
    unitWeight = 18,        // γ (kN/m³)
    wallHeight = 5,         // H (m)
    surcharge = 0,          // q (kPa)
    cohesion = 0,           // c (kPa)
    waterTableDepth = null  // hw (m from top)
  } = params;

  const phi = frictionAngle * Math.PI / 180;
  const gamma = parseFloat(unitWeight);
  const H = parseFloat(wallHeight);
  const q = parseFloat(surcharge);
  const c = parseFloat(cohesion);

  // Rankine earth pressure coefficients
  const Ka = Math.pow(Math.tan(Math.PI / 4 - phi / 2), 2);
  const Kp = Math.pow(Math.tan(Math.PI / 4 + phi / 2), 2);
  const K0 = 1 - Math.sin(phi); // At-rest coefficient

  // Active earth pressure
  const sigmaA_soil = Ka * gamma * H;
  const sigmaA_surcharge = Ka * q;
  const sigmaA_cohesion = -2 * c * Math.sqrt(Ka);
  const sigmaA_total = Math.max(0, sigmaA_soil + sigmaA_surcharge + sigmaA_cohesion);

  // Total active thrust (triangular + rectangular distribution)
  const Pa = 0.5 * Ka * gamma * H * H + Ka * q * H - 2 * c * Math.sqrt(Ka) * H;

  // Passive earth pressure
  const sigmaP_soil = Kp * gamma * H;
  const sigmaP_cohesion = 2 * c * Math.sqrt(Kp);
  const Pp = 0.5 * Kp * gamma * H * H + 2 * c * Math.sqrt(Kp) * H;

  return {
    coefficients: {
      Ka: roundTo(Ka, 4),
      Kp: roundTo(Kp, 4),
      K0: roundTo(K0, 4)
    },
    activePressure: {
      atBase: roundTo(sigmaA_total, 4),
      totalThrust: roundTo(Pa, 4),
      applicationPoint: roundTo(H / 3, 4)
    },
    passivePressure: {
      atBase: roundTo(sigmaP_soil + sigmaP_cohesion, 4),
      totalThrust: roundTo(Pp, 4),
      applicationPoint: roundTo(H / 3, 4)
    },
    inputs: params
  };
}

/**
 * Factor of Safety Against Sliding for Retaining Wall
 */
export function retainingWallStability(params) {
  const {
    wallHeight = 5,
    baseWidth = 3,
    wallThickness = 0.5,
    backfillFrictionAngle = 30,
    backfillUnitWeight = 18,
    concreteUnitWeight = 24,
    baseFriction = 0.5,
    cohesion = 0
  } = params;

  // Calculate earth pressure
  const phi = backfillFrictionAngle * Math.PI / 180;
  const Ka = Math.pow(Math.tan(Math.PI / 4 - phi / 2), 2);
  const Pa = 0.5 * Ka * backfillUnitWeight * wallHeight * wallHeight;

  // Wall weight (simplified as rectangle)
  const Wwall = concreteUnitWeight * wallThickness * wallHeight;
  
  // Resistance
  const frictionResistance = baseFriction * Wwall;
  const cohesionResistance = cohesion * baseWidth;
  const totalResistance = frictionResistance + cohesionResistance;

  // Factor of safety against sliding
  const FOS_sliding = totalResistance / (Pa * Math.cos(phi));

  // Overturning check
  const overturningMoment = Pa * wallHeight / 3;
  const resistingMoment = Wwall * baseWidth / 2;
  const FOS_overturning = resistingMoment / overturningMoment;

  return {
    activeThrust: roundTo(Pa, 4),
    wallWeight: roundTo(Wwall, 4),
    slidingFOS: roundTo(FOS_sliding, 4),
    overturningFOS: roundTo(FOS_overturning, 4),
    isSafe: FOS_sliding >= 1.5 && FOS_overturning >= 2.0,
    inputs: params
  };
}

export default {
  terzaghiBearingCapacity,
  meyerhofBearingCapacity,
  immediateSettlement,
  consolidationSettlement,
  earthPressure,
  retainingWallStability
};
