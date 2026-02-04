/**
 * Surveying Calculator Module
 * Leveling, Traversing, and Coordinate Geometry
 * 
 * @author Concreate Club, IIT Indore
 */

import { roundTo, linspace } from '../math/solver.js';

/**
 * Leveling - Rise and Fall Method
 * Calculate reduced levels from staff readings
 */
export function levelingRiseFall(params) {
  const {
    benchmarkRL = 100.000,
    readings = []  // Array of { station, BS, IS, FS, remarks }
  } = params;

  if (!readings || readings.length === 0) {
    return { error: 'No readings provided' };
  }

  const results = [];
  let currentRL = parseFloat(benchmarkRL);
  let sumBS = 0;
  let sumFS = 0;
  let sumRise = 0;
  let sumFall = 0;

  for (let i = 0; i < readings.length; i++) {
    const reading = readings[i];
    const row = {
      station: reading.station || `Station ${i + 1}`,
      BS: reading.BS !== undefined && reading.BS !== '' ? parseFloat(reading.BS) : null,
      IS: reading.IS !== undefined && reading.IS !== '' ? parseFloat(reading.IS) : null,
      FS: reading.FS !== undefined && reading.FS !== '' ? parseFloat(reading.FS) : null,
      rise: null,
      fall: null,
      RL: null,
      remarks: reading.remarks || ''
    };

    if (i === 0) {
      // First reading - benchmark
      row.RL = currentRL;
      if (row.BS !== null) sumBS += row.BS;
    } else {
      const prevReading = readings[i - 1];
      const prevStaff = prevReading.IS !== undefined && prevReading.IS !== '' 
        ? parseFloat(prevReading.IS) 
        : (prevReading.BS !== undefined && prevReading.BS !== '' 
          ? parseFloat(prevReading.BS) 
          : parseFloat(prevReading.FS || 0));

      const currentStaff = row.FS !== null ? row.FS : (row.IS !== null ? row.IS : null);

      if (currentStaff !== null) {
        const diff = prevStaff - currentStaff;
        
        if (diff > 0) {
          row.rise = diff;
          sumRise += diff;
        } else if (diff < 0) {
          row.fall = Math.abs(diff);
          sumFall += Math.abs(diff);
        }

        currentRL = currentRL + (row.rise || 0) - (row.fall || 0);
        row.RL = currentRL;
      }

      if (row.BS !== null) sumBS += row.BS;
      if (row.FS !== null) sumFS += row.FS;
    }

    results.push(row);
  }

  // Arithmetic checks
  const check1 = sumBS - sumFS;
  const check2 = sumRise - sumFall;
  const check3 = results[results.length - 1].RL - parseFloat(benchmarkRL);
  const isBalanced = Math.abs(check1 - check2) < 0.001 && Math.abs(check2 - check3) < 0.001;

  return {
    results: results.map(r => ({
      ...r,
      rise: r.rise !== null ? roundTo(r.rise, 3) : null,
      fall: r.fall !== null ? roundTo(r.fall, 3) : null,
      RL: r.RL !== null ? roundTo(r.RL, 3) : null
    })),
    checks: {
      sumBS: roundTo(sumBS, 3),
      sumFS: roundTo(sumFS, 3),
      sumRise: roundTo(sumRise, 3),
      sumFall: roundTo(sumFall, 3),
      bsMinusFs: roundTo(check1, 3),
      riseMinusFall: roundTo(check2, 3),
      lastRlMinusFirstRl: roundTo(check3, 3),
      isBalanced
    },
    inputs: params
  };
}

/**
 * Leveling - Height of Instrument Method
 */
export function levelingHI(params) {
  const {
    benchmarkRL = 100.000,
    readings = []
  } = params;

  if (!readings || readings.length === 0) {
    return { error: 'No readings provided' };
  }

  const results = [];
  let HI = null;
  let sumBS = 0;
  let sumFS = 0;
  let sumRL = parseFloat(benchmarkRL);
  let countRL = 1;

  for (let i = 0; i < readings.length; i++) {
    const reading = readings[i];
    const row = {
      station: reading.station || `Station ${i + 1}`,
      BS: reading.BS !== undefined && reading.BS !== '' ? parseFloat(reading.BS) : null,
      IS: reading.IS !== undefined && reading.IS !== '' ? parseFloat(reading.IS) : null,
      FS: reading.FS !== undefined && reading.FS !== '' ? parseFloat(reading.FS) : null,
      HI: null,
      RL: null,
      remarks: reading.remarks || ''
    };

    if (i === 0) {
      row.RL = parseFloat(benchmarkRL);
      if (row.BS !== null) {
        HI = row.RL + row.BS;
        row.HI = HI;
        sumBS += row.BS;
      }
    } else {
      // Calculate RL from FS or IS first if changing instrument
      if (row.FS !== null) {
        row.RL = HI - row.FS;
        sumFS += row.FS;
        sumRL += row.RL;
        countRL++;
      }
      
      // If there's a BS, setup new instrument
      if (row.BS !== null) {
        if (row.RL === null) {
          row.RL = results[i - 1].RL; // Use previous RL if no FS
        }
        HI = row.RL + row.BS;
        row.HI = HI;
        sumBS += row.BS;
      }
      
      // Handle intermediate sight
      if (row.IS !== null && row.FS === null) {
        row.RL = HI - row.IS;
        sumRL += row.RL;
        countRL++;
      }
    }

    results.push(row);
  }

  return {
    results: results.map(r => ({
      ...r,
      HI: r.HI !== null ? roundTo(r.HI, 3) : null,
      RL: r.RL !== null ? roundTo(r.RL, 3) : null
    })),
    checks: {
      sumBS: roundTo(sumBS, 3),
      sumFS: roundTo(sumFS, 3)
    },
    inputs: params
  };
}

/**
 * Traverse Computation - Compass Rule (Bowditch)
 */
export function traverseComputation(params) {
  const {
    startEasting = 1000,
    startNorthing = 1000,
    legs = []  // Array of { bearing, distance } in degrees and meters
  } = params;

  if (!legs || legs.length === 0) {
    return { error: 'No traverse legs provided' };
  }

  let E = parseFloat(startEasting);
  let N = parseFloat(startNorthing);

  // Calculate departures and latitudes
  const computed = legs.map((leg, i) => {
    const bearing = parseFloat(leg.bearing) * Math.PI / 180;
    const distance = parseFloat(leg.distance);

    const departure = distance * Math.sin(bearing);
    const latitude = distance * Math.cos(bearing);

    return {
      leg: i + 1,
      bearing: leg.bearing,
      distance: roundTo(distance, 3),
      departure: roundTo(departure, 3),
      latitude: roundTo(latitude, 3)
    };
  });

  // Sum departures and latitudes
  const sumDeparture = computed.reduce((sum, c) => sum + c.departure, 0);
  const sumLatitude = computed.reduce((sum, c) => sum + c.latitude, 0);
  const totalDistance = computed.reduce((sum, c) => sum + c.distance, 0);

  // Misclosure (for closed traverse, these should be zero)
  const misclosureE = sumDeparture;
  const misclosureN = sumLatitude;
  const linearMisclosure = Math.sqrt(misclosureE * misclosureE + misclosureN * misclosureN);
  const precision = totalDistance / linearMisclosure;

  // Apply Bowditch correction
  const corrected = computed.map(c => {
    const corrDep = -misclosureE * (c.distance / totalDistance);
    const corrLat = -misclosureN * (c.distance / totalDistance);

    return {
      ...c,
      correctedDeparture: roundTo(c.departure + corrDep, 3),
      correctedLatitude: roundTo(c.latitude + corrLat, 3)
    };
  });

  // Calculate coordinates
  const coordinates = [{ point: 'A', easting: E, northing: N }];
  
  corrected.forEach((leg, i) => {
    E += leg.correctedDeparture;
    N += leg.correctedLatitude;
    coordinates.push({
      point: String.fromCharCode(66 + i), // B, C, D, ...
      easting: roundTo(E, 3),
      northing: roundTo(N, 3)
    });
  });

  return {
    computedLegs: corrected,
    misclosure: {
      easting: roundTo(misclosureE, 4),
      northing: roundTo(misclosureN, 4),
      linear: roundTo(linearMisclosure, 4),
      precision: `1:${Math.round(precision)}`
    },
    coordinates,
    inputs: params
  };
}

/**
 * Area Calculation - Coordinate Method
 * A = 0.5 × |Σ(Xi × (Yi+1 - Yi-1))|
 */
export function areaCoordinateMethod(params) {
  const {
    points = []  // Array of { x, y } or { easting, northing }
  } = params;

  if (!points || points.length < 3) {
    return { error: 'At least 3 points required for area calculation' };
  }

  // Normalize coordinates
  const coords = points.map(p => ({
    x: parseFloat(p.x || p.easting || 0),
    y: parseFloat(p.y || p.northing || 0)
  }));

  // Cross-multiply method (Shoelace formula)
  let sum1 = 0;
  let sum2 = 0;
  const n = coords.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum1 += coords[i].x * coords[j].y;
    sum2 += coords[j].x * coords[i].y;
  }

  const area = Math.abs(sum1 - sum2) / 2;
  const areaHectares = area / 10000;
  const areaAcres = area / 4046.86;

  // Calculate perimeter
  let perimeter = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = coords[j].x - coords[i].x;
    const dy = coords[j].y - coords[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }

  return {
    area: roundTo(area, 3),
    areaHectares: roundTo(areaHectares, 4),
    areaAcres: roundTo(areaAcres, 4),
    perimeter: roundTo(perimeter, 3),
    numberOfPoints: n,
    inputs: params
  };
}

/**
 * Curve Setting - Simple Circular Curve
 */
export function simpleCurve(params) {
  const {
    deflectionAngle = 45,   // Δ in degrees
    radius = 300,           // R in meters
    chainage_PI = 1000,     // Chainage of PI
    pegInterval = 20        // Interval for setting out
  } = params;

  const delta = parseFloat(deflectionAngle);
  const deltaRad = delta * Math.PI / 180;
  const R = parseFloat(radius);
  const PI_chainage = parseFloat(chainage_PI);
  const interval = parseFloat(pegInterval);

  // Curve elements
  const T = R * Math.tan(deltaRad / 2);           // Tangent length
  const L = R * deltaRad;                          // Curve length
  const E = R * (1 / Math.cos(deltaRad / 2) - 1); // External distance
  const M = R * (1 - Math.cos(deltaRad / 2));     // Middle ordinate
  const C = 2 * R * Math.sin(deltaRad / 2);       // Long chord

  // Chainages
  const PC_chainage = PI_chainage - T;
  const PT_chainage = PC_chainage + L;

  // Setting out by deflection angles
  const settingOut = [];
  let currentChainage = Math.ceil(PC_chainage / interval) * interval;
  
  while (currentChainage <= PT_chainage) {
    const l = currentChainage - PC_chainage;
    const deflectionAngle = (l / (2 * R)) * (180 / Math.PI); // degrees
    const chordLength = 2 * R * Math.sin((l / R) / 2);

    settingOut.push({
      chainage: roundTo(currentChainage, 2),
      arcLength: roundTo(l, 3),
      deflectionAngle: roundTo(deflectionAngle, 4),
      chordFromPC: roundTo(chordLength, 3)
    });

    currentChainage += interval;
  }

  // Add PT if not already included
  if (settingOut.length === 0 || settingOut[settingOut.length - 1].chainage < PT_chainage) {
    const l = L;
    settingOut.push({
      chainage: roundTo(PT_chainage, 2),
      arcLength: roundTo(l, 3),
      deflectionAngle: roundTo(delta / 2, 4),
      chordFromPC: roundTo(C, 3)
    });
  }

  return {
    curveElements: {
      tangentLength: roundTo(T, 3),
      curveLength: roundTo(L, 3),
      externalDistance: roundTo(E, 3),
      middleOrdinate: roundTo(M, 3),
      longChord: roundTo(C, 3),
      degreeOfCurve: roundTo(1718.87 / R, 3)
    },
    chainages: {
      PI: roundTo(PI_chainage, 2),
      PC: roundTo(PC_chainage, 2),
      PT: roundTo(PT_chainage, 2)
    },
    settingOutTable: settingOut,
    inputs: params
  };
}

/**
 * Total Station - Polar to Rectangular Conversion
 */
export function polarToRectangular(params) {
  const {
    stationEasting = 1000,
    stationNorthing = 1000,
    stationHeight = 100,
    instrumentHeight = 1.5,
    observations = []  // Array of { horizontalAngle, verticalAngle, slopeDistance, targetHeight }
  } = params;

  const E0 = parseFloat(stationEasting);
  const N0 = parseFloat(stationNorthing);
  const H0 = parseFloat(stationHeight);
  const hi = parseFloat(instrumentHeight);

  const results = observations.map((obs, i) => {
    const HA = parseFloat(obs.horizontalAngle || 0) * Math.PI / 180;
    const VA = parseFloat(obs.verticalAngle || 90) * Math.PI / 180;
    const SD = parseFloat(obs.slopeDistance || 0);
    const ht = parseFloat(obs.targetHeight || 0);

    // Horizontal distance
    const HD = SD * Math.sin(VA);
    
    // Vertical difference
    const dH = SD * Math.cos(VA) + hi - ht;

    // Coordinates
    const E = E0 + HD * Math.sin(HA);
    const N = N0 + HD * Math.cos(HA);
    const H = H0 + dH;

    return {
      point: i + 1,
      horizontalDistance: roundTo(HD, 3),
      easting: roundTo(E, 3),
      northing: roundTo(N, 3),
      elevation: roundTo(H, 3)
    };
  });

  return {
    stationCoordinates: { easting: E0, northing: N0, height: H0 },
    computedPoints: results,
    inputs: params
  };
}

/**
 * Contour Interpolation
 */
export function contourInterpolation(params) {
  const {
    point1 = { x: 0, y: 0, z: 95 },
    point2 = { x: 100, y: 0, z: 105 },
    contourInterval = 2
  } = params;

  const x1 = parseFloat(point1.x);
  const y1 = parseFloat(point1.y);
  const z1 = parseFloat(point1.z);
  const x2 = parseFloat(point2.x);
  const y2 = parseFloat(point2.y);
  const z2 = parseFloat(point2.z);
  const interval = parseFloat(contourInterval);

  // Distance between points
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  
  // Gradient
  const gradient = (z2 - z1) / distance;

  // Find contour crossing points
  const contours = [];
  const minZ = Math.min(z1, z2);
  const maxZ = Math.max(z1, z2);
  
  let contourLevel = Math.ceil(minZ / interval) * interval;
  
  while (contourLevel < maxZ) {
    // Interpolate position
    const fraction = (contourLevel - z1) / (z2 - z1);
    const x = x1 + fraction * (x2 - x1);
    const y = y1 + fraction * (y2 - y1);
    const distFromP1 = fraction * distance;

    contours.push({
      elevation: contourLevel,
      x: roundTo(x, 3),
      y: roundTo(y, 3),
      distanceFromP1: roundTo(distFromP1, 3)
    });

    contourLevel += interval;
  }

  return {
    point1: { x: x1, y: y1, z: z1 },
    point2: { x: x2, y: y2, z: z2 },
    distance: roundTo(distance, 3),
    gradient: roundTo(gradient * 100, 2), // percent
    contourCrossings: contours,
    inputs: params
  };
}

export default {
  levelingRiseFall,
  levelingHI,
  traverseComputation,
  areaCoordinateMethod,
  simpleCurve,
  polarToRectangular,
  contourInterpolation
};
