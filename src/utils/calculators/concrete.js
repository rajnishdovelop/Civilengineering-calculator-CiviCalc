/**
 * Concrete Technology Calculator Module
 * IS 10262:2019 Concrete Mix Design
 * 
 * @author Concreate Club, IIT Indore
 */

import { roundTo } from '../math/solver.js';

/**
 * Standard Deviation values based on grade of concrete (IS 10262:2019)
 */
const STANDARD_DEVIATION = {
  'M10': 3.5, 'M15': 3.5,
  'M20': 4.0, 'M25': 4.0,
  'M30': 5.0, 'M35': 5.0, 'M40': 5.0, 'M45': 5.0, 'M50': 5.0,
  'M55': 5.0, 'M60': 5.0, 'M65': 5.0, 'M70': 5.0, 'M75': 5.0, 'M80': 5.0
};

/**
 * Maximum Water-Cement Ratio based on exposure condition (IS 456:2000 Table 5)
 */
const MAX_WC_RATIO = {
  'Mild': 0.55,
  'Moderate': 0.50,
  'Severe': 0.45,
  'Very Severe': 0.45,
  'Extreme': 0.40
};

/**
 * Minimum Cement Content (kg/m³) based on exposure condition (IS 456:2000 Table 5)
 */
const MIN_CEMENT_CONTENT = {
  'Mild': 300,
  'Moderate': 300,
  'Severe': 320,
  'Very Severe': 340,
  'Extreme': 360
};

/**
 * Maximum Cement Content (kg/m³) - IS 456:2000
 */
const MAX_CEMENT_CONTENT = 450;

/**
 * Base water content for different maximum aggregate sizes (IS 10262:2019 Table 2)
 * Values for 50mm slump
 */
const BASE_WATER_CONTENT = {
  10: { 'Crushed': 208, 'Rounded': 186 },
  20: { 'Crushed': 186, 'Rounded': 165 },
  40: { 'Crushed': 165, 'Rounded': 155 }
};

/**
 * Volume of coarse aggregate per unit volume of total aggregate
 * Based on nominal maximum size and Zone of fine aggregate (IS 10262:2019 Table 3)
 */
const COARSE_AGGREGATE_VOLUME = {
  10: { 'Zone I': 0.50, 'Zone II': 0.48, 'Zone III': 0.46, 'Zone IV': 0.44 },
  20: { 'Zone I': 0.66, 'Zone II': 0.64, 'Zone III': 0.62, 'Zone IV': 0.60 },
  40: { 'Zone I': 0.73, 'Zone II': 0.71, 'Zone III': 0.69, 'Zone IV': 0.67 }
};

/**
 * Specific Gravity values (typical)
 */
const SPECIFIC_GRAVITY = {
  cement: 3.15,
  coarseAggregate: 2.70,
  fineAggregate: 2.65,
  water: 1.00
};

/**
 * Concrete grades with characteristic strength
 */
const CONCRETE_GRADES = {
  'M10': 10, 'M15': 15, 'M20': 20, 'M25': 25,
  'M30': 30, 'M35': 35, 'M40': 40, 'M45': 45, 'M50': 50,
  'M55': 55, 'M60': 60, 'M65': 65, 'M70': 70, 'M75': 75, 'M80': 80
};

/**
 * Main Mix Design Calculator as per IS 10262:2019
 */
export function concreteMixDesign(params) {
  const {
    targetGrade = 'M25',
    exposureCondition = 'Moderate',
    workability = 100,        // Slump in mm
    maxAggregateSize = 20,    // mm
    aggregateType = 'Crushed',
    sandZone = 'Zone II',
    cementType = 'OPC 53',
    admixture = false,
    admixtureDosage = 0,      // % by weight of cement
    specificGravityCement = 3.15,
    specificGravityCA = 2.70,
    specificGravityFA = 2.65,
    waterAbsorptionCA = 0.5,  // %
    waterAbsorptionFA = 1.0   // %
  } = params;

  const steps = [];
  const warnings = [];

  // Step 1: Target Mean Strength
  const fck = CONCRETE_GRADES[targetGrade];
  const standardDeviation = STANDARD_DEVIATION[targetGrade];
  const targetMeanStrength = fck + 1.65 * standardDeviation;

  steps.push({
    step: 1,
    title: 'Target Mean Strength Calculation',
    formula: "f'ck = fck + 1.65 × S",
    calculation: `f'ck = ${fck} + 1.65 × ${standardDeviation} = ${roundTo(targetMeanStrength, 2)} MPa`,
    result: roundTo(targetMeanStrength, 2),
    unit: 'MPa',
    reference: 'IS 10262:2019, Clause 4.2'
  });

  // Step 2: Water-Cement Ratio Selection
  const maxWCRatio = MAX_WC_RATIO[exposureCondition];
  
  // Estimate W/C ratio from target strength (Abrams' Law approximation)
  // For OPC 53 grade: fck = K / (1.5^(w/c)) where K ≈ 19.53 for 28 days
  const k = cementType === 'OPC 53' ? 19.53 : (cementType === 'OPC 43' ? 17.5 : 16.5);
  let estimatedWCRatio = Math.log(k / targetMeanStrength) / Math.log(1.5);
  estimatedWCRatio = Math.max(0.35, Math.min(0.55, estimatedWCRatio)); // Practical limits
  
  const adoptedWCRatio = Math.min(estimatedWCRatio, maxWCRatio);

  if (estimatedWCRatio > maxWCRatio) {
    warnings.push(`W/C ratio limited to ${maxWCRatio} as per durability requirements for ${exposureCondition} exposure.`);
  }

  steps.push({
    step: 2,
    title: 'Water-Cement Ratio Selection',
    formula: 'w/c = min(Estimated from strength, Max from durability)',
    calculation: `Estimated: ${roundTo(estimatedWCRatio, 2)}, Max for ${exposureCondition}: ${maxWCRatio}`,
    result: roundTo(adoptedWCRatio, 2),
    unit: '',
    reference: 'IS 456:2000, Table 5'
  });

  // Step 3: Water Content Selection
  const baseWater = BASE_WATER_CONTENT[maxAggregateSize]?.[aggregateType] || 186;
  
  // Correction for workability (slump)
  // Base is for 50mm slump, adjust +3% for every 25mm increase
  const slumpCorrection = Math.floor((workability - 50) / 25) * 0.03;
  let waterContent = baseWater * (1 + slumpCorrection);
  
  // Correction for admixture (typically reduces water by 10-15%)
  if (admixture && admixtureDosage > 0) {
    const waterReduction = 0.10; // Assume 10% water reduction
    waterContent = waterContent * (1 - waterReduction);
    warnings.push('Water reduced by 10% due to plasticizer/superplasticizer admixture.');
  }

  steps.push({
    step: 3,
    title: 'Water Content Estimation',
    formula: 'Water = Base Water × (1 + Slump Correction)',
    calculation: `Base: ${baseWater} kg/m³, Slump Correction: ${roundTo(slumpCorrection * 100, 1)}%`,
    result: roundTo(waterContent, 0),
    unit: 'kg/m³',
    reference: 'IS 10262:2019, Table 2'
  });

  // Step 4: Cement Content Calculation
  let cementContent = waterContent / adoptedWCRatio;
  const minCement = MIN_CEMENT_CONTENT[exposureCondition];
  
  if (cementContent < minCement) {
    warnings.push(`Cement content increased from ${roundTo(cementContent, 0)} to ${minCement} kg/m³ to meet minimum requirement for ${exposureCondition} exposure.`);
    cementContent = minCement;
  }
  
  if (cementContent > MAX_CEMENT_CONTENT) {
    warnings.push(`Cement content ${roundTo(cementContent, 0)} kg/m³ exceeds maximum limit of ${MAX_CEMENT_CONTENT} kg/m³. Consider using SCMs.`);
  }

  const actualWCRatio = waterContent / cementContent;

  steps.push({
    step: 4,
    title: 'Cement Content Calculation',
    formula: 'Cement = Water Content / (w/c ratio)',
    calculation: `Cement = ${roundTo(waterContent, 0)} / ${roundTo(adoptedWCRatio, 2)} = ${roundTo(cementContent, 0)} kg/m³`,
    result: roundTo(cementContent, 0),
    unit: 'kg/m³',
    reference: 'IS 456:2000, Table 5 (Min Cement Content)'
  });

  // Step 5: Volume of Coarse Aggregate
  const caVolumeRatio = COARSE_AGGREGATE_VOLUME[maxAggregateSize]?.[sandZone] || 0.64;
  
  // Correction for W/C ratio (for every 0.05 change from 0.50, change by ±0.01)
  const wcCorrection = (adoptedWCRatio - 0.50) / 0.05 * (-0.01);
  const adjustedCAVolume = caVolumeRatio + wcCorrection;

  steps.push({
    step: 5,
    title: 'Volume of Coarse Aggregate',
    formula: 'Corrected CA Volume = Base + W/C Correction',
    calculation: `Base: ${roundTo(caVolumeRatio, 2)}, W/C Correction: ${roundTo(wcCorrection, 3)}`,
    result: roundTo(adjustedCAVolume, 3),
    unit: 'per unit volume',
    reference: 'IS 10262:2019, Table 3'
  });

  // Step 6: Calculate Mix Proportions per cubic meter
  
  // Volume of cement
  const volumeCement = cementContent / (specificGravityCement * 1000);
  
  // Volume of water
  const volumeWater = waterContent / 1000;
  
  // Volume of admixture (if any)
  const admixtureMass = admixture ? cementContent * (admixtureDosage / 100) : 0;
  const volumeAdmixture = admixtureMass / (1.2 * 1000); // Assume SG of admixture = 1.2
  
  // Entrapped air (IS 10262:2019 Table 1)
  const entrappedAir = maxAggregateSize === 10 ? 0.03 : (maxAggregateSize === 20 ? 0.02 : 0.01);
  const volumeAir = entrappedAir;
  
  // Total aggregate volume
  const totalAggregateVolume = 1 - volumeCement - volumeWater - volumeAdmixture - volumeAir;
  
  // Coarse and Fine Aggregate volumes
  const volumeCA = totalAggregateVolume * adjustedCAVolume;
  const volumeFA = totalAggregateVolume * (1 - adjustedCAVolume);
  
  // Mass calculations
  const massCA = volumeCA * specificGravityCA * 1000;
  const massFA = volumeFA * specificGravityFA * 1000;

  steps.push({
    step: 6,
    title: 'Mix Proportions per Cubic Meter',
    formula: 'V_total = V_cement + V_water + V_air + V_CA + V_FA = 1 m³',
    calculation: `V_cement: ${roundTo(volumeCement * 1000, 1)}L, V_water: ${roundTo(volumeWater * 1000, 1)}L, V_air: ${roundTo(volumeAir * 1000, 1)}L`,
    result: {
      cement: roundTo(cementContent, 0),
      water: roundTo(waterContent, 0),
      fineAggregate: roundTo(massFA, 0),
      coarseAggregate: roundTo(massCA, 0),
      admixture: roundTo(admixtureMass, 2)
    },
    unit: 'kg/m³',
    reference: 'IS 10262:2019, Clause 5.6'
  });

  // Step 7: Mix Ratio
  const mixRatio = {
    cement: 1,
    fineAggregate: roundTo(massFA / cementContent, 2),
    coarseAggregate: roundTo(massCA / cementContent, 2),
    water: roundTo(waterContent / cementContent, 2)
  };

  steps.push({
    step: 7,
    title: 'Mix Proportion Ratio',
    formula: 'Cement : FA : CA by weight',
    calculation: `1 : ${mixRatio.fineAggregate} : ${mixRatio.coarseAggregate}`,
    result: mixRatio,
    unit: 'by weight',
    reference: 'IS 10262:2019'
  });

  // Summary
  const mixDesign = {
    cement: roundTo(cementContent, 0),
    water: roundTo(waterContent, 0),
    fineAggregate: roundTo(massFA, 0),
    coarseAggregate: roundTo(massCA, 0),
    admixture: roundTo(admixtureMass, 2),
    wcRatio: roundTo(actualWCRatio, 2),
    totalWeight: roundTo(cementContent + waterContent + massFA + massCA + admixtureMass, 0)
  };

  // Material costs estimation (approximate rates in INR)
  const costs = {
    cement: cementContent * 8, // ₹8 per kg
    fineAggregate: massFA * 1.5, // ₹1.5 per kg
    coarseAggregate: massCA * 1.2, // ₹1.2 per kg
    water: waterContent * 0.05, // ₹0.05 per kg
    admixture: admixtureMass * 100 // ₹100 per kg
  };
  costs.total = roundTo(Object.values(costs).reduce((a, b) => a + b, 0), 0);

  return {
    inputs: {
      targetGrade,
      exposureCondition,
      workability,
      maxAggregateSize,
      aggregateType,
      sandZone,
      cementType,
      admixture,
      admixtureDosage
    },
    targetMeanStrength: roundTo(targetMeanStrength, 2),
    wcRatio: roundTo(actualWCRatio, 2),
    maxWCRatio,
    designSteps: steps,
    mixDesign,
    mixRatio,
    volumes: {
      cement: roundTo(volumeCement * 1000, 2),
      water: roundTo(volumeWater * 1000, 2),
      fineAggregate: roundTo(volumeFA * 1000, 2),
      coarseAggregate: roundTo(volumeCA * 1000, 2),
      air: roundTo(volumeAir * 1000, 2),
      total: 1000
    },
    costEstimate: costs,
    warnings,
    standardsReference: ['IS 10262:2019', 'IS 456:2000', 'IS 383:2016']
  };
}

/**
 * Calculate trial mix quantities for different batch sizes
 */
export function calculateTrialMix(mixDesign, batchVolume = 0.025) {
  // batchVolume in m³ (default 25 liters = 0.025 m³)
  return {
    batchVolume: batchVolume * 1000, // liters
    cement: roundTo(mixDesign.cement * batchVolume, 2),
    water: roundTo(mixDesign.water * batchVolume, 2),
    fineAggregate: roundTo(mixDesign.fineAggregate * batchVolume, 2),
    coarseAggregate: roundTo(mixDesign.coarseAggregate * batchVolume, 2),
    admixture: roundTo(mixDesign.admixture * batchVolume, 3)
  };
}

/**
 * Get available options for dropdowns
 */
export function getConcreteOptions() {
  return {
    grades: Object.keys(CONCRETE_GRADES),
    exposureConditions: Object.keys(MAX_WC_RATIO),
    aggregateSizes: [10, 20, 40],
    aggregateTypes: ['Crushed', 'Rounded'],
    sandZones: ['Zone I', 'Zone II', 'Zone III', 'Zone IV'],
    cementTypes: ['OPC 33', 'OPC 43', 'OPC 53', 'PPC', 'PSC']
  };
}

export default {
  concreteMixDesign,
  calculateTrialMix,
  getConcreteOptions
};
