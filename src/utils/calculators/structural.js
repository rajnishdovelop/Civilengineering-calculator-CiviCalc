/**
 * Structural Engineering Calculator Module
 * Beam Analysis with SFD, BMD, and Deflection
 * 
 * @author Concreate Club, IIT Indore
 */

import { 
  linspace, 
  zeros, 
  cumulativeIntegral, 
  doubleIntegral,
  findMaxAbs, 
  roundTo 
} from '../math/solver.js';

/**
 * BeamAnalyzer Class
 * Discretizes beam into segments and calculates internal forces
 */
export class BeamAnalyzer {
  constructor(span, E = 200e9, I = 1e-4, segments = 500) {
    this.span = parseFloat(span);
    this.E = parseFloat(E);          // Young's Modulus (Pa)
    this.I = parseFloat(I);          // Moment of Inertia (m^4)
    this.segments = segments;
    this.dx = this.span / this.segments;
    
    // Initialize arrays
    this.x = linspace(0, this.span, this.segments + 1);
    this.loads = [];
    this.reactions = { Ra: 0, Rb: 0 };
  }

  /**
   * Add a load to the beam
   * @param {Object} load - Load object { type, magnitude, position, start, end }
   */
  addLoad(load) {
    const normalizedLoad = {
      type: load.type || 'point',
      magnitude: parseFloat(load.magnitude || load.P || load.w || load.M || 0),
      position: parseFloat(load.position || load.a || 0),
      start: parseFloat(load.start || 0),
      end: parseFloat(load.end || this.span)
    };
    this.loads.push(normalizedLoad);
  }

  /**
   * Set multiple loads at once
   * @param {Array} loads - Array of load objects
   */
  setLoads(loads) {
    this.loads = [];
    (loads || []).forEach(load => this.addLoad(load));
  }

  /**
   * Calculate reactions for simply supported beam
   * ΣMa = 0 and ΣFy = 0
   */
  calculateReactions() {
    let totalForce = 0;
    let momentAboutA = 0;

    for (const load of this.loads) {
      if (load.type === 'point') {
        totalForce += load.magnitude;
        momentAboutA += load.magnitude * load.position;
      } else if (load.type === 'udl') {
        const length = load.end - load.start;
        const W = load.magnitude * length;
        const centroid = load.start + length / 2;
        totalForce += W;
        momentAboutA += W * centroid;
      } else if (load.type === 'moment') {
        momentAboutA += load.magnitude;
      }
    }

    // ΣMa = 0: Rb * L = momentAboutA
    this.reactions.Rb = this.span !== 0 ? momentAboutA / this.span : 0;
    
    // ΣFy = 0: Ra + Rb = totalForce
    this.reactions.Ra = totalForce - this.reactions.Rb;

    return this.reactions;
  }

  /**
   * Calculate Shear Force at each point
   * @returns {number[]} Shear force array
   */
  calculateShearForce() {
    const V = zeros(this.x.length);

    for (let i = 0; i < this.x.length; i++) {
      const xi = this.x[i];
      let shear = this.reactions.Ra;

      for (const load of this.loads) {
        if (load.type === 'point') {
          if (xi >= load.position) {
            shear -= load.magnitude;
          }
        } else if (load.type === 'udl') {
          if (xi > load.start) {
            const effectiveLength = Math.min(xi, load.end) - load.start;
            if (effectiveLength > 0) {
              shear -= load.magnitude * effectiveLength;
            }
          }
        }
        // Moments don't affect shear force
      }

      V[i] = shear;
    }

    return V;
  }

  /**
   * Calculate Bending Moment at each point
   * @returns {number[]} Bending moment array
   */
  calculateBendingMoment() {
    const M = zeros(this.x.length);

    for (let i = 0; i < this.x.length; i++) {
      const xi = this.x[i];
      let moment = this.reactions.Ra * xi;

      for (const load of this.loads) {
        if (load.type === 'point') {
          if (xi >= load.position) {
            moment -= load.magnitude * (xi - load.position);
          }
        } else if (load.type === 'udl') {
          if (xi > load.start) {
            const effectiveLength = Math.min(xi, load.end) - load.start;
            if (effectiveLength > 0) {
              const W = load.magnitude * effectiveLength;
              const centroid = load.start + effectiveLength / 2;
              moment -= W * (xi - centroid);
            }
          }
        } else if (load.type === 'moment') {
          if (xi >= load.position) {
            moment -= load.magnitude;
          }
        }
      }

      M[i] = moment;
    }

    return M;
  }

  /**
   * Calculate deflection by double integration of M/EI
   * @param {number[]} M - Bending moment array
   * @returns {number[]} Deflection array
   */
  calculateDeflection(M) {
    const EI = this.E * this.I;
    
    // Curvature: M / EI
    const curvature = M.map(m => m / EI);
    
    // First integration: Slope
    const slope = cumulativeIntegral(curvature, this.dx, 0);
    
    // Second integration: Deflection
    const deflection = cumulativeIntegral(slope, this.dx, 0);
    
    // Apply boundary conditions: y(0) = 0, y(L) = 0
    // Linear correction to enforce y(L) = 0
    const endDeflection = deflection[deflection.length - 1];
    const correctionSlope = endDeflection / this.span;
    
    for (let i = 0; i < deflection.length; i++) {
      deflection[i] -= correctionSlope * this.x[i];
    }

    return deflection;
  }

  /**
   * Run complete analysis
   * @returns {Object} Complete analysis results
   */
  analyze() {
    // Calculate reactions
    this.calculateReactions();
    
    // Calculate internal forces
    const shear = this.calculateShearForce();
    const moment = this.calculateBendingMoment();
    const deflection = this.calculateDeflection(moment);
    
    // Convert deflection to mm
    const deflectionMm = deflection.map(d => d * 1000);
    
    // Find maximum values
    const maxShear = findMaxAbs(shear, this.dx);
    const maxMoment = findMaxAbs(moment, this.dx);
    const maxDeflection = findMaxAbs(deflectionMm, this.dx);

    return {
      x: this.x,
      shear,
      moment,
      deflection: deflectionMm,
      reactions: {
        Ra: roundTo(this.reactions.Ra, 4),
        Rb: roundTo(this.reactions.Rb, 4)
      },
      maxValues: {
        shear: roundTo(maxShear.absMax, 4),
        shearPosition: roundTo(maxShear.position, 4),
        moment: roundTo(maxMoment.absMax, 4),
        momentPosition: roundTo(maxMoment.position, 4),
        deflection: roundTo(maxDeflection.absMax, 4),
        deflectionPosition: roundTo(maxDeflection.position, 4)
      },
      properties: {
        span: this.span,
        E: this.E,
        I: this.I,
        EI: this.E * this.I
      }
    };
  }
}

/**
 * Section Property Calculator
 */
export function calculateSectionProperties(type, dimensions) {
  const props = { area: 0, momentOfInertia: 0, sectionModulus: 0, yMax: 0 };

  switch (type) {
    case 'rectangle': {
      const b = parseFloat(dimensions.width || 0.1);
      const h = parseFloat(dimensions.height || 0.2);
      props.area = b * h;
      props.momentOfInertia = (b * Math.pow(h, 3)) / 12;
      props.sectionModulus = (b * Math.pow(h, 2)) / 6;
      props.yMax = h / 2;
      break;
    }
    case 'circle': {
      const d = parseFloat(dimensions.diameter || 0.1);
      const r = d / 2;
      props.area = Math.PI * r * r;
      props.momentOfInertia = (Math.PI * Math.pow(d, 4)) / 64;
      props.sectionModulus = (Math.PI * Math.pow(d, 3)) / 32;
      props.yMax = r;
      break;
    }
    case 'i_beam': {
      const bf = parseFloat(dimensions.flangeWidth || 0.15);
      const tf = parseFloat(dimensions.flangeThickness || 0.01);
      const hw = parseFloat(dimensions.webHeight || 0.2);
      const tw = parseFloat(dimensions.webThickness || 0.008);
      const H = hw + 2 * tf;
      
      props.area = 2 * bf * tf + hw * tw;
      props.momentOfInertia = (bf * Math.pow(H, 3) - (bf - tw) * Math.pow(hw, 3)) / 12;
      props.sectionModulus = props.momentOfInertia / (H / 2);
      props.yMax = H / 2;
      break;
    }
  }

  return {
    area: roundTo(props.area, 6),
    momentOfInertia: roundTo(props.momentOfInertia, 10),
    sectionModulus: roundTo(props.sectionModulus, 8),
    yMax: roundTo(props.yMax, 4)
  };
}

/**
 * Quick beam analysis function
 */
export function analyzeBeam(span, loads, E = 200e9, I = 1e-4) {
  const analyzer = new BeamAnalyzer(span, E, I);
  analyzer.setLoads(loads);
  return analyzer.analyze();
}

export default {
  BeamAnalyzer,
  calculateSectionProperties,
  analyzeBeam
};
