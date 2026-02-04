/**
 * Environmental Engineering Calculator Module
 * Water Quality, Wastewater Treatment, Air Pollution
 * 
 * @author Concreate Club, IIT Indore
 */

import { roundTo, trapezoidalRule, linspace } from '../math/solver.js';

/**
 * BOD (Biochemical Oxygen Demand) Kinetics
 * First-order reaction: BOD_t = BOD_u × (1 - e^(-k×t))
 */
export function bodKinetics(params) {
  const {
    ultimateBOD = 300,      // BOD_u (mg/L)
    reactionRate = 0.23,    // k (per day) at 20°C
    temperature = 20,       // T (°C)
    time = 5                // t (days)
  } = params;

  const BODu = parseFloat(ultimateBOD);
  const k20 = parseFloat(reactionRate);
  const T = parseFloat(temperature);
  const t = parseFloat(time);

  // Temperature correction (van't Hoff-Arrhenius)
  const theta = 1.047; // Temperature coefficient
  const kT = k20 * Math.pow(theta, T - 20);

  // BOD exerted at time t
  const BODt = BODu * (1 - Math.exp(-kT * t));

  // BOD remaining
  const BODremaining = BODu - BODt;

  // Generate curve
  const nPoints = 50;
  const times = linspace(0, 20, nPoints);
  const bodExerted = times.map(ti => BODu * (1 - Math.exp(-kT * ti)));
  const bodRemaining = times.map(ti => BODu * Math.exp(-kT * ti));

  // Standard values
  const BOD5 = BODu * (1 - Math.exp(-kT * 5));
  const BOD5_BODu_ratio = BOD5 / BODu;

  return {
    bodExerted: roundTo(BODt, 2),
    bodRemaining: roundTo(BODremaining, 2),
    rateConstant: roundTo(kT, 4),
    bod5: roundTo(BOD5, 2),
    bod5Ratio: roundTo(BOD5_BODu_ratio, 4),
    curveData: {
      times,
      exerted: bodExerted,
      remaining: bodRemaining
    },
    inputs: params
  };
}

/**
 * Streeter-Phelps Oxygen Sag Curve
 * DO deficit model for stream pollution
 */
export function oxygenSagCurve(params) {
  const {
    initialDeficit = 2,     // D0 (mg/L)
    ultimateBOD = 50,       // L0 (mg/L)
    deoxygenationRate = 0.23, // kd (per day)
    reaerationRate = 0.46,   // kr (per day)
    streamVelocity = 0.5,     // v (m/s)
    saturationDO = 9.2        // DOs (mg/L) at temperature
  } = params;

  const D0 = parseFloat(initialDeficit);
  const L0 = parseFloat(ultimateBOD);
  const kd = parseFloat(deoxygenationRate);
  const kr = parseFloat(params.reaerationRate || 0.46);
  const v = parseFloat(streamVelocity);
  const DOs = parseFloat(saturationDO);

  // Time to critical point
  let tc;
  if (kd !== kr) {
    tc = (1 / (kr - kd)) * Math.log((kr / kd) * (1 - D0 * (kr - kd) / (kd * L0)));
  } else {
    tc = (1 / kd) * (1 - D0 / L0);
  }

  // Critical deficit
  const Dc = (kd * L0 / kr) * Math.exp(-kd * tc);

  // Critical distance
  const xc = v * tc * 86400 / 1000; // Convert to km

  // Minimum DO
  const DOmin = DOs - Dc;

  // Generate sag curve
  const nPoints = 100;
  const times = linspace(0, 10, nPoints);
  
  const deficits = times.map(t => {
    if (kd !== kr) {
      return (kd * L0 / (kr - kd)) * (Math.exp(-kd * t) - Math.exp(-kr * t)) + D0 * Math.exp(-kr * t);
    } else {
      return (kd * L0 * t + D0) * Math.exp(-kd * t);
    }
  });

  const doConcentrations = deficits.map(D => DOs - D);
  const distances = times.map(t => v * t * 86400 / 1000);

  return {
    criticalPoint: {
      time: roundTo(tc, 3),
      distance: roundTo(xc, 2),
      deficit: roundTo(Dc, 2),
      minimumDO: roundTo(DOmin, 2)
    },
    selfPurificationConstant: roundTo(kr / kd, 3),
    curveData: {
      times,
      distances,
      deficits,
      dissolvedOxygen: doConcentrations
    },
    inputs: params
  };
}

/**
 * Sedimentation Tank Design
 * Based on overflow rate and detention time
 */
export function sedimentationDesign(params) {
  const {
    flowRate = 10000,        // Q (m³/day)
    overflowRate = 30,       // SOR (m³/m²/day)
    detentionTime = 2,       // t (hours)
    lengthWidthRatio = 4,    // L:W ratio
    depthMin = 3             // Minimum depth (m)
  } = params;

  const Q = parseFloat(flowRate);
  const SOR = parseFloat(overflowRate);
  const t = parseFloat(detentionTime);
  const LW = parseFloat(lengthWidthRatio);

  // Surface area from overflow rate
  const A_sor = Q / SOR;

  // Volume from detention time
  const V = Q * t / 24;

  // Depth
  const depth = V / A_sor;
  const actualDepth = Math.max(depth, parseFloat(depthMin));

  // Dimensions
  const W = Math.sqrt(A_sor / LW);
  const L = LW * W;

  // Recalculated values
  const actualVolume = L * W * actualDepth;
  const actualDT = actualVolume * 24 / Q;
  const actualSOR = Q / (L * W);

  // Weir loading (assuming full-width weir at end)
  const weirLoading = Q / W;

  return {
    designedDimensions: {
      length: roundTo(L, 2),
      width: roundTo(W, 2),
      depth: roundTo(actualDepth, 2),
      surfaceArea: roundTo(L * W, 2),
      volume: roundTo(actualVolume, 2)
    },
    hydraulicParameters: {
      overflowRate: roundTo(actualSOR, 2),
      detentionTime: roundTo(actualDT, 2),
      weirLoading: roundTo(weirLoading, 2)
    },
    inputs: params
  };
}

/**
 * Activated Sludge Process Design
 */
export function activatedSludgeDesign(params) {
  const {
    flowRate = 10000,        // Q (m³/day)
    influentBOD = 250,       // S0 (mg/L)
    effluentBOD = 20,        // Se (mg/L)
    mlss = 3000,             // X (mg/L)
    srt = 10,                // Sludge Retention Time (days)
    yieldCoeff = 0.5,        // Y (kg VSS/kg BOD)
    decayCoeff = 0.05        // kd (per day)
  } = params;

  const Q = parseFloat(flowRate);
  const S0 = parseFloat(influentBOD);
  const Se = parseFloat(effluentBOD);
  const X = parseFloat(mlss);
  const theta_c = parseFloat(srt);
  const Y = parseFloat(yieldCoeff);
  const kd = parseFloat(decayCoeff);

  // BOD removal
  const BODremoved = S0 - Se;
  const removalEfficiency = (BODremoved / S0) * 100;

  // Biomass production
  const Px = Q * Y * BODremoved / 1000 / (1 + kd * theta_c); // kg/day

  // Aeration tank volume
  const V = theta_c * Px * 1000 / X; // m³

  // Hydraulic Retention Time
  const HRT = V * 24 / Q; // hours

  // F/M ratio
  const FM = Q * S0 / (V * X); // per day

  // Oxygen requirement
  const O2_BOD = Q * BODremoved / 1000; // kg/day for BOD
  const O2_nitrification = 0; // Add if needed
  const O2_endogenous = 1.42 * kd * X * V / 1000; // Approximate
  const totalO2 = O2_BOD - 1.42 * Px + O2_endogenous;

  return {
    tankVolume: roundTo(V, 1),
    hydraulicRetentionTime: roundTo(HRT, 2),
    sludgeProduction: roundTo(Px, 2),
    fmRatio: roundTo(FM, 3),
    removalEfficiency: roundTo(removalEfficiency, 1),
    oxygenRequirement: roundTo(totalO2, 1),
    inputs: params
  };
}

/**
 * Water Treatment - Coagulation/Flocculation
 * Rapid mix and flocculation design
 */
export function coagulationDesign(params) {
  const {
    flowRate = 10000,           // Q (m³/day)
    rapidMixTime = 30,          // seconds
    rapidMixG = 700,            // G value (per second)
    flocculationTime = 30,      // minutes
    flocculationG = 50,         // G value
    waterTemperature = 20       // °C
  } = params;

  const Q = parseFloat(flowRate) / 86400; // m³/s
  const t_rm = parseFloat(rapidMixTime);
  const G_rm = parseFloat(rapidMixG);
  const t_floc = parseFloat(flocculationTime) * 60; // seconds
  const G_floc = parseFloat(flocculationG);

  // Dynamic viscosity at temperature
  const mu = 0.001 * Math.exp(-0.0179 * (parseFloat(waterTemperature) - 20) + 0.001);

  // Rapid mix tank
  const V_rm = Q * t_rm;
  const P_rm = G_rm * G_rm * mu * V_rm; // Power required (W)
  const Gt_rm = G_rm * t_rm;

  // Flocculation tank
  const V_floc = Q * t_floc;
  const P_floc = G_floc * G_floc * mu * V_floc;
  const Gt_floc = G_floc * t_floc;

  // Tank dimensions (assuming depth = 3m)
  const depth = 3;
  const A_rm = V_rm / depth;
  const A_floc = V_floc / depth;

  return {
    rapidMix: {
      volume: roundTo(V_rm * 1000, 1), // L
      power: roundTo(P_rm, 1), // W
      gtValue: roundTo(Gt_rm, 0),
      surfaceArea: roundTo(A_rm, 2)
    },
    flocculation: {
      volume: roundTo(V_floc, 1), // m³
      power: roundTo(P_floc, 1), // W
      gtValue: roundTo(Gt_floc, 0),
      surfaceArea: roundTo(A_floc, 2)
    },
    inputs: params
  };
}

/**
 * Chlorine Disinfection - CT Concept
 */
export function disinfectionCT(params) {
  const {
    targetOrganism = 'Giardia',
    logRemoval = 3,           // Log inactivation required
    chlorineResidual = 1,     // mg/L
    pH = 7.5,
    temperature = 20,         // °C
    contactTime = null        // minutes (if calculating)
  } = params;

  const C = parseFloat(chlorineResidual);
  const T_temp = parseFloat(temperature);
  const logR = parseFloat(logRemoval);

  // CT requirements (simplified table values for free chlorine)
  // These vary with pH and temperature - using approximate values
  let baseCT;
  
  switch (targetOrganism.toLowerCase()) {
    case 'giardia':
      baseCT = 50; // CT for 3-log at pH 7, 20°C
      break;
    case 'virus':
      baseCT = 4;
      break;
    case 'cryptosporidium':
      baseCT = 7200; // Chlorine ineffective, shown for reference
      break;
    default:
      baseCT = 50;
  }

  // Adjust for log removal (roughly linear)
  const CT_required = baseCT * logR / 3;

  // Contact time required
  const T_required = CT_required / C;

  // If contact time given, calculate achieved CT
  const T = contactTime !== null ? parseFloat(contactTime) : T_required;
  const CT_achieved = C * T;
  const logAchieved = (CT_achieved / baseCT) * 3;

  return {
    ctRequired: roundTo(CT_required, 1),
    contactTimeRequired: roundTo(T_required, 1),
    ctAchieved: roundTo(CT_achieved, 1),
    logInactivationAchieved: roundTo(logAchieved, 2),
    isAdequate: CT_achieved >= CT_required,
    inputs: params
  };
}

/**
 * Air Pollution - Gaussian Plume Model
 * Ground level concentration from point source
 */
export function gaussianPlume(params) {
  const {
    emissionRate = 100,       // Q (g/s)
    stackHeight = 50,         // H (m)
    windSpeed = 5,            // u (m/s)
    stabilityClass = 'D',     // Pasquill-Gifford stability class
    downwindDistance = 1000,  // x (m)
    crosswindDistance = 0     // y (m)
  } = params;

  const Qs = parseFloat(emissionRate);
  const H = parseFloat(stackHeight);
  const u = parseFloat(windSpeed);
  const x = parseFloat(downwindDistance);
  const y = parseFloat(crosswindDistance);

  // Dispersion coefficients (Pasquill-Gifford)
  // Using rural conditions approximation
  let sigmaY, sigmaZ;
  
  const stabilityParams = {
    'A': { ay: 0.22, by: 0.0001, az: 0.20, bz: 0 },
    'B': { ay: 0.16, by: 0.0001, az: 0.12, bz: 0 },
    'C': { ay: 0.11, by: 0.0001, az: 0.08, bz: 0.0002 },
    'D': { ay: 0.08, by: 0.0001, az: 0.06, bz: 0.0015 },
    'E': { ay: 0.06, by: 0.0001, az: 0.03, bz: 0.0003 },
    'F': { ay: 0.04, by: 0.0001, az: 0.016, bz: 0.0003 }
  };

  const p = stabilityParams[stabilityClass] || stabilityParams['D'];
  
  sigmaY = p.ay * x / Math.pow(1 + p.by * x, 0.5);
  sigmaZ = p.az * x / Math.pow(1 + p.bz * x, 0.5);

  // Ground level concentration (z = 0)
  const exp1 = Math.exp(-y * y / (2 * sigmaY * sigmaY));
  const exp2 = Math.exp(-H * H / (2 * sigmaZ * sigmaZ));
  
  const C_ground = (Qs / (Math.PI * u * sigmaY * sigmaZ)) * exp1 * exp2;

  // Maximum ground level concentration
  const x_max = H * Math.sqrt(2); // Approximate
  const sigmaZ_max = H / Math.sqrt(2);
  const C_max = (2 * Qs) / (Math.PI * Math.E * u * H * H);

  // Generate concentration profile along centerline
  const nPoints = 50;
  const distances = linspace(100, 5000, nPoints);
  const concentrations = distances.map(xi => {
    const sy = p.ay * xi / Math.pow(1 + p.by * xi, 0.5);
    const sz = p.az * xi / Math.pow(1 + p.bz * xi, 0.5);
    return (Qs / (Math.PI * u * sy * sz)) * Math.exp(-H * H / (2 * sz * sz)) * 1000; // μg/m³
  });

  return {
    concentration: roundTo(C_ground * 1000, 4), // μg/m³
    dispersionCoefficients: {
      sigmaY: roundTo(sigmaY, 2),
      sigmaZ: roundTo(sigmaZ, 2)
    },
    maximumConcentration: {
      value: roundTo(C_max * 1000, 4), // μg/m³
      distance: roundTo(x_max, 0)
    },
    profileData: {
      distances,
      concentrations
    },
    inputs: params
  };
}

export default {
  bodKinetics,
  oxygenSagCurve,
  sedimentationDesign,
  activatedSludgeDesign,
  coagulationDesign,
  disinfectionCT,
  gaussianPlume
};
