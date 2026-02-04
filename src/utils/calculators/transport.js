/**
 * Transportation Engineering Calculator Module
 * Traffic Flow, Highway Design, and Vehicle Dynamics
 * 
 * @author Concreate Club, IIT Indore
 */

import { roundTo, linspace, newtonRaphsonNumerical } from '../math/solver.js';

/**
 * Greenshields Traffic Flow Model
 * Linear speed-density relationship: V = Vf × (1 - k/kj)
 * Flow-density relationship: Q = k × V = Vf × k × (1 - k/kj)
 */
export function greenshieldsModel(params) {
  const {
    freeFlowSpeed = 100,    // Vf (km/hr)
    jamDensity = 150,       // kj (veh/km)
    currentDensity = null,  // k (veh/km) - optional
    currentFlow = null      // Q (veh/hr) - optional
  } = params;

  const Vf = parseFloat(freeFlowSpeed);
  const kj = parseFloat(jamDensity);

  // Maximum flow (capacity)
  const Qmax = Vf * kj / 4;
  const kc = kj / 2;  // Critical density at maximum flow
  const Vc = Vf / 2;  // Speed at maximum flow

  // Generate flow-density curve
  const nPoints = 100;
  const densities = linspace(0, kj, nPoints);
  const speeds = densities.map(k => Vf * (1 - k / kj));
  const flows = densities.map((k, i) => k * speeds[i]);

  // Calculate for specific inputs
  let currentSpeed, calculatedFlow, calculatedDensity;
  
  if (currentDensity !== null) {
    const k = parseFloat(currentDensity);
    currentSpeed = Vf * (1 - k / kj);
    calculatedFlow = k * currentSpeed;
    calculatedDensity = k;
  } else if (currentFlow !== null) {
    const Q = parseFloat(currentFlow);
    // Solve: Q = Vf × k × (1 - k/kj)
    // Quadratic: -Vf/kj × k² + Vf × k - Q = 0
    const a = -Vf / kj;
    const b = Vf;
    const c = -Q;
    
    const discriminant = b * b - 4 * a * c;
    if (discriminant >= 0) {
      const k1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const k2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      
      // Choose the stable (higher density) solution for congested flow
      // or lower density for uncongested flow
      calculatedDensity = k1 > 0 && k1 < kj ? k1 : k2;
      currentSpeed = Vf * (1 - calculatedDensity / kj);
      calculatedFlow = Q;
    }
  }

  return {
    fundamentalParameters: {
      freeFlowSpeed: roundTo(Vf, 2),
      jamDensity: roundTo(kj, 2),
      capacity: roundTo(Qmax, 2),
      criticalDensity: roundTo(kc, 2),
      criticalSpeed: roundTo(Vc, 2)
    },
    currentConditions: currentDensity !== null || currentFlow !== null ? {
      density: roundTo(calculatedDensity, 2),
      speed: roundTo(currentSpeed, 2),
      flow: roundTo(calculatedFlow, 2),
      levelOfService: determineLOS(calculatedFlow / Qmax)
    } : null,
    curveData: {
      densities,
      speeds,
      flows
    },
    inputs: params
  };
}

/**
 * Determine Level of Service based on v/c ratio
 */
function determineLOS(vcRatio) {
  if (vcRatio <= 0.35) return 'A';
  if (vcRatio <= 0.55) return 'B';
  if (vcRatio <= 0.75) return 'C';
  if (vcRatio <= 0.90) return 'D';
  if (vcRatio <= 1.00) return 'E';
  return 'F';
}

/**
 * Highway Geometric Design - Horizontal Curves
 */
export function horizontalCurve(params) {
  const {
    radius = 300,           // R (m)
    deflectionAngle = 45,   // Δ (degrees)
    designSpeed = 80,       // V (km/hr)
    superelevation = 0.06,  // e (decimal)
    sidefriction = 0.15     // f
  } = params;

  const R = parseFloat(radius);
  const delta = parseFloat(deflectionAngle);
  const deltaRad = delta * Math.PI / 180;
  const V = parseFloat(designSpeed);
  const e = parseFloat(superelevation);
  const f = parseFloat(sidefriction);

  // Curve elements
  const T = R * Math.tan(deltaRad / 2);           // Tangent length
  const L = R * deltaRad;                          // Curve length
  const E = R * (1 / Math.cos(deltaRad / 2) - 1); // External distance
  const M = R * (1 - Math.cos(deltaRad / 2));     // Middle ordinate
  const C = 2 * R * Math.sin(deltaRad / 2);       // Long chord

  // Check design speed adequacy
  const Vmax = 127 * Math.sqrt(R * (e + f));
  const isAdequate = V <= Vmax;

  // Centrifugal acceleration
  const Vms = V * 1000 / 3600; // Convert to m/s
  const centrifugalAccel = Vms * Vms / R;

  return {
    curveElements: {
      tangentLength: roundTo(T, 3),
      curveLength: roundTo(L, 3),
      externalDistance: roundTo(E, 3),
      middleOrdinate: roundTo(M, 3),
      longChord: roundTo(C, 3),
      degreeOfCurve: roundTo(1718.87 / R, 3)
    },
    designCheck: {
      maxSafeSpeed: roundTo(Vmax, 2),
      isAdequate,
      centrifugalAcceleration: roundTo(centrifugalAccel, 4)
    },
    inputs: params
  };
}

/**
 * Highway Geometric Design - Vertical Curves
 */
export function verticalCurve(params) {
  const {
    grade1 = 3,             // g1 (%)
    grade2 = -2,            // g2 (%)
    curveLength = 200,      // L (m)
    designSpeed = 80,       // V (km/hr)
    pvStation = 0,          // Station of PVC
    pvElevation = 100       // Elevation at PVC
  } = params;

  const g1 = parseFloat(grade1) / 100;
  const g2 = parseFloat(grade2) / 100;
  const L = parseFloat(curveLength);
  const V = parseFloat(designSpeed);
  const PVCStation = parseFloat(pvStation);
  const PVCElev = parseFloat(pvElevation);

  // Algebraic difference
  const A = Math.abs(g1 - g2) * 100;

  // Curve type
  const isCrest = g1 > g2;
  const curveType = isCrest ? 'Crest Curve' : 'Sag Curve';

  // K-value (rate of vertical curvature)
  const K = L / A;

  // Minimum length criteria
  const Lmin_comfort = A * V * V / 395; // Comfort criterion
  const Lmin_ssd = isCrest 
    ? A * V * V / (658)   // Stopping sight distance criterion (simplified)
    : A * V * V / (395);

  // High/Low point location (if within curve)
  let highLowStation = null;
  let highLowElev = null;
  
  if ((g1 > 0 && g2 < 0) || (g1 < 0 && g2 > 0)) {
    const x = -g1 * L / (g2 - g1);
    if (x > 0 && x < L) {
      highLowStation = PVCStation + x;
      highLowElev = PVCElev + g1 * x + (g2 - g1) * x * x / (2 * L);
    }
  }

  // PVI and PVT points
  const PVIStation = PVCStation + L / 2;
  const PVTStation = PVCStation + L;
  const PVTElev = PVCElev + g1 * (L / 2) + g2 * (L / 2);

  // Generate curve profile
  const nPoints = 50;
  const stations = linspace(0, L, nPoints);
  const elevations = stations.map(x => {
    return PVCElev + g1 * x + (g2 - g1) * x * x / (2 * L);
  });

  return {
    curveType,
    algebraicDifference: roundTo(A, 3),
    kValue: roundTo(K, 3),
    minimumLength: {
      comfort: roundTo(Lmin_comfort, 2),
      sightDistance: roundTo(Lmin_ssd, 2)
    },
    keyStations: {
      PVC: { station: roundTo(PVCStation, 2), elevation: roundTo(PVCElev, 3) },
      PVI: { station: roundTo(PVIStation, 2) },
      PVT: { station: roundTo(PVTStation, 2), elevation: roundTo(PVTElev, 3) }
    },
    highLowPoint: highLowStation ? {
      station: roundTo(highLowStation, 2),
      elevation: roundTo(highLowElev, 3)
    } : null,
    profileData: {
      stations: stations.map(x => PVCStation + x),
      elevations
    },
    isLengthAdequate: L >= Math.max(Lmin_comfort, Lmin_ssd),
    inputs: params
  };
}

/**
 * Stopping Sight Distance
 * SSD = Perception-Reaction Distance + Braking Distance
 */
export function stoppingSightDistance(params) {
  const {
    designSpeed = 80,           // V (km/hr)
    perceptionReactionTime = 2.5, // t (seconds)
    grade = 0,                  // G (%)
    frictionCoefficient = 0.35  // f
  } = params;

  const V = parseFloat(designSpeed);
  const t = parseFloat(perceptionReactionTime);
  const G = parseFloat(grade) / 100;
  const f = parseFloat(frictionCoefficient);

  const Vms = V / 3.6; // Convert to m/s

  // Perception-reaction distance
  const d_pr = Vms * t;

  // Braking distance
  const d_b = Vms * Vms / (2 * 9.81 * (f + G));

  // Total SSD
  const SSD = d_pr + d_b;

  return {
    perceptionReactionDistance: roundTo(d_pr, 2),
    brakingDistance: roundTo(d_b, 2),
    stoppingSightDistance: roundTo(SSD, 2),
    speedMS: roundTo(Vms, 2),
    inputs: params
  };
}

/**
 * Passing Sight Distance
 */
export function passingSightDistance(params) {
  const {
    designSpeed = 80,        // V (km/hr)
    passingSpeed = 95        // Speed while passing (km/hr)
  } = params;

  const V = parseFloat(designSpeed);
  const Vp = parseFloat(passingSpeed);

  // AASHTO Method (simplified)
  // d1 = Initial maneuver distance
  // d2 = Passing vehicle in left lane
  // d3 = Clearance distance
  // d4 = Opposing vehicle distance

  const a = 2.25;  // Average acceleration (m/s²)
  const t1 = 4.0;  // Time for initial maneuver (s)
  const t2 = 10.4; // Time in left lane (s)
  
  const m = V / 3.6; // Speed difference assumption (m/s)
  
  const d1 = t1 * (V / 3.6 - m / 2 + a * t1 / 2);
  const d2 = t2 * Vp / 3.6;
  const d3 = 30 + V / 3.6; // Safety clearance
  const d4 = d2 * 2 / 3;    // Opposing vehicle

  const PSD = d1 + d2 + d3 + d4;

  return {
    initialManeuver: roundTo(d1, 2),
    passingDistance: roundTo(d2, 2),
    clearanceDistance: roundTo(d3, 2),
    opposingVehicleDistance: roundTo(d4, 2),
    passingSightDistance: roundTo(PSD, 2),
    inputs: params
  };
}

/**
 * Traffic Signal Timing (Webster's Method)
 */
export function signalTiming(params) {
  const {
    lostTime = 4,              // L (seconds)
    criticalFlowRatios = [0.3, 0.25, 0.2], // y_i for each phase
    saturationFlow = 1800      // s (veh/hr/lane)
  } = params;

  const L = parseFloat(lostTime);
  const Y = criticalFlowRatios.reduce((sum, y) => sum + parseFloat(y), 0);

  if (Y >= 1) {
    return {
      error: 'Total critical flow ratio must be less than 1',
      totalFlowRatio: Y
    };
  }

  // Webster's optimum cycle length
  const Co = (1.5 * L + 5) / (1 - Y);
  
  // Practical minimum and maximum
  const Cmin = L / (1 - Y);
  const Cmax = 1.5 * Co;

  // Green time allocation
  const effectiveGreen = Co - L;
  const greenTimes = criticalFlowRatios.map(y => (parseFloat(y) / Y) * effectiveGreen);

  // Capacity per phase
  const capacities = greenTimes.map(g => (g / Co) * saturationFlow);

  return {
    optimumCycleLength: roundTo(Co, 1),
    minimumCycleLength: roundTo(Cmin, 1),
    maximumCycleLength: roundTo(Cmax, 1),
    effectiveGreenTime: roundTo(effectiveGreen, 1),
    phases: criticalFlowRatios.map((y, i) => ({
      phase: i + 1,
      flowRatio: parseFloat(y),
      greenTime: roundTo(greenTimes[i], 1),
      capacity: roundTo(capacities[i], 0)
    })),
    totalFlowRatio: roundTo(Y, 4),
    inputs: params
  };
}

/**
 * Pavement Design - CBR Method (IRC)
 */
export function pavementDesignCBR(params) {
  const {
    cbrValue = 5,              // CBR (%)
    totalTraffic = 10,         // Million Standard Axles (msa)
    trafficGrowthRate = 7.5    // Annual growth rate (%)
  } = params;

  const CBR = parseFloat(cbrValue);
  const N = parseFloat(totalTraffic);

  // IRC method for flexible pavement
  // Pavement thickness = f(CBR, traffic)
  
  // Simplified thickness chart approximation
  let thickness;
  
  if (CBR <= 2) {
    thickness = 200 + N * 15;
  } else if (CBR <= 5) {
    thickness = 150 + N * 12;
  } else if (CBR <= 10) {
    thickness = 100 + N * 10;
  } else {
    thickness = 75 + N * 8;
  }

  // Layer distribution (typical)
  const surfaceCourse = Math.max(40, thickness * 0.15);
  const baseCourse = thickness * 0.35;
  const subBase = thickness * 0.5;

  return {
    totalThickness: roundTo(thickness, 0),
    layers: {
      surfaceCourse: roundTo(surfaceCourse, 0),
      baseCourse: roundTo(baseCourse, 0),
      subBase: roundTo(subBase, 0)
    },
    designInputs: {
      cbrValue: CBR,
      designTraffic: N + ' msa'
    },
    inputs: params
  };
}

export default {
  greenshieldsModel,
  horizontalCurve,
  verticalCurve,
  stoppingSightDistance,
  passingSightDistance,
  signalTiming,
  pavementDesignCBR
};
