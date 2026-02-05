/**
 * Structural Engineering Calculator Module
 * Beam Analysis with SFD, BMD, and Deflection
 * Supports: Simply Supported, Cantilever, and Overhanging Beams
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
 * Support Types Enum
 */
export const SUPPORT_TYPES = {
  SIMPLY_SUPPORTED: 'simply_supported',
  CANTILEVER: 'cantilever',
  OVERHANGING: 'overhanging',
  FIXED_BOTH: 'fixed_both',
  PROPPED_CANTILEVER: 'propped_cantilever'
};

/**
 * BeamAnalyzer Class
 * Discretizes beam into segments and calculates internal forces
 * Now supports multiple boundary conditions
 */
export class BeamAnalyzer {
  constructor(span, E = 200e9, I = 1e-4, segments = 500, supportType = SUPPORT_TYPES.SIMPLY_SUPPORTED) {
    this.span = parseFloat(span);
    this.E = parseFloat(E);          // Young's Modulus (Pa)
    this.I = parseFloat(I);          // Moment of Inertia (m^4)
    this.segments = segments;
    this.dx = this.span / this.segments;
    this.supportType = supportType;
    
    // Initialize arrays
    this.x = linspace(0, this.span, this.segments + 1);
    this.loads = [];
    
    // Reactions depend on support type
    this.reactions = { 
      Ra: 0,      // Vertical reaction at left support
      Rb: 0,      // Vertical reaction at right support
      Ma: 0,      // Moment reaction at left support (for cantilever/fixed)
      Mb: 0       // Moment reaction at right support (for fixed)
    };
    
    // Support positions for overhanging beams
    this.supportPositions = { a: 0, b: span }; // Default: supports at ends
  }
  
  /**
   * Set support type
   * @param {string} type - Support type from SUPPORT_TYPES enum
   */
  setSupportType(type) {
    this.supportType = type || SUPPORT_TYPES.SIMPLY_SUPPORTED;
  }

  /**
   * Set support positions for overhanging beams
   * @param {number} a - Position of left support
   * @param {number} b - Position of right support
   */
  setSupportPositions(a, b) {
    this.supportPositions.a = parseFloat(a) || 0;
    this.supportPositions.b = parseFloat(b) || this.span;
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
    switch (this.supportType) {
      case SUPPORT_TYPES.CANTILEVER:
        return this.calculateCantileverReactions();
      case SUPPORT_TYPES.OVERHANGING:
        return this.calculateOverhangingReactions();
      case SUPPORT_TYPES.FIXED_BOTH:
        return this.calculateFixedBothReactions();
      case SUPPORT_TYPES.PROPPED_CANTILEVER:
        return this.calculateProppedCantileverReactions();
      default:
        return this.calculateSimplySupportedReactions();
    }
  }
  
  /**
   * Calculate reactions for Simply Supported Beam
   * Boundary conditions: y(0) = 0, y(L) = 0
   */
  calculateSimplySupportedReactions() {
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
    this.reactions.Ma = 0;
    this.reactions.Mb = 0;

    return this.reactions;
  }
  
  /**
   * Calculate reactions for Cantilever Beam
   * Fixed at x = 0, Free at x = L
   * Boundary conditions: y(0) = 0, θ(0) = 0
   */
  calculateCantileverReactions() {
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

    // For cantilever: Ra = total downward force, Ma = total moment about fixed end
    this.reactions.Ra = totalForce;
    this.reactions.Rb = 0;
    this.reactions.Ma = -momentAboutA; // Negative because it opposes the applied moment
    this.reactions.Mb = 0;

    return this.reactions;
  }
  
  /**
   * Calculate reactions for Overhanging Beam
   * Supports at positions a and b (where 0 <= a < b <= L)
   */
  calculateOverhangingReactions() {
    const a = this.supportPositions.a;
    const b = this.supportPositions.b;
    const supportSpan = b - a;
    
    let totalForce = 0;
    let momentAboutA = 0;

    for (const load of this.loads) {
      if (load.type === 'point') {
        totalForce += load.magnitude;
        momentAboutA += load.magnitude * (load.position - a);
      } else if (load.type === 'udl') {
        const length = load.end - load.start;
        const W = load.magnitude * length;
        const centroid = load.start + length / 2;
        totalForce += W;
        momentAboutA += W * (centroid - a);
      } else if (load.type === 'moment') {
        momentAboutA += load.magnitude;
      }
    }

    // ΣMa = 0: Rb * (b-a) = momentAboutA
    this.reactions.Rb = supportSpan !== 0 ? momentAboutA / supportSpan : 0;
    
    // ΣFy = 0: Ra + Rb = totalForce
    this.reactions.Ra = totalForce - this.reactions.Rb;
    this.reactions.Ma = 0;
    this.reactions.Mb = 0;

    return this.reactions;
  }
  
  /**
   * Calculate reactions for Fixed Both Ends Beam
   * Boundary conditions: y(0) = 0, θ(0) = 0, y(L) = 0, θ(L) = 0
   */
  calculateFixedBothReactions() {
    // For uniformly distributed load: symmetric reactions
    // For point loads: use moment distribution or numerical methods
    let totalForce = 0;
    let momentAboutA = 0;
    let momentAboutB = 0;

    for (const load of this.loads) {
      if (load.type === 'point') {
        const P = load.magnitude;
        const a = load.position;
        const b = this.span - a;
        const L = this.span;
        
        // Fixed end moments for point load
        const Mab = P * a * b * b / (L * L);
        const Mba = P * a * a * b / (L * L);
        
        momentAboutA += Mab;
        momentAboutB += Mba;
        totalForce += P;
      } else if (load.type === 'udl') {
        const w = load.magnitude;
        const length = load.end - load.start;
        const W = w * length;
        
        // Simplified: assuming full span UDL
        if (load.start === 0 && load.end === this.span) {
          const L = this.span;
          momentAboutA += w * L * L / 12;
          momentAboutB += w * L * L / 12;
        }
        totalForce += W;
      }
    }

    // Approximate reactions (simplified)
    this.reactions.Ra = totalForce / 2 + (momentAboutA - momentAboutB) / this.span;
    this.reactions.Rb = totalForce - this.reactions.Ra;
    this.reactions.Ma = -momentAboutA;
    this.reactions.Mb = -momentAboutB;

    return this.reactions;
  }
  
  /**
   * Calculate reactions for Propped Cantilever
   * Fixed at x = 0, Pinned at x = L
   * Boundary conditions: y(0) = 0, θ(0) = 0, y(L) = 0
   */
  calculateProppedCantileverReactions() {
    let totalForce = 0;
    let momentSum = 0;

    for (const load of this.loads) {
      if (load.type === 'point') {
        const P = load.magnitude;
        const a = load.position;
        const L = this.span;
        
        // Reaction at prop (B) for point load
        const Rb = P * a * a * (3 * L - a) / (2 * L * L * L);
        this.reactions.Rb += Rb;
        totalForce += P;
      } else if (load.type === 'udl') {
        const w = load.magnitude;
        const length = load.end - load.start;
        
        if (load.start === 0 && load.end === this.span) {
          const L = this.span;
          this.reactions.Rb = 3 * w * L / 8;
        }
        totalForce += w * length;
      }
    }

    this.reactions.Ra = totalForce - this.reactions.Rb;
    
    // Calculate moment at A
    let Ma = 0;
    for (const load of this.loads) {
      if (load.type === 'point') {
        Ma += load.magnitude * load.position;
      } else if (load.type === 'udl') {
        const length = load.end - load.start;
        const centroid = load.start + length / 2;
        Ma += load.magnitude * length * centroid;
      }
    }
    Ma -= this.reactions.Rb * this.span;
    this.reactions.Ma = -Ma;

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
      let shear = 0;
      
      // Initial shear depends on support type
      if (this.supportType === SUPPORT_TYPES.CANTILEVER) {
        // Cantilever: Start with Ra at fixed end
        shear = this.reactions.Ra;
      } else if (this.supportType === SUPPORT_TYPES.OVERHANGING) {
        // Overhanging: Consider support positions
        const a = this.supportPositions.a;
        const b = this.supportPositions.b;
        
        if (xi < a) {
          shear = 0; // Before first support
        } else if (xi >= a && xi < b) {
          shear = this.reactions.Ra;
        } else {
          shear = this.reactions.Ra + this.reactions.Rb;
        }
        
        // Add reaction at first support
        if (xi >= a) {
          shear = this.reactions.Ra;
        }
        // Add reaction at second support
        if (xi >= b) {
          shear += this.reactions.Rb;
        }
      } else {
        // Simply Supported and others: Start with Ra
        shear = this.reactions.Ra;
      }

      // Subtract loads applied before xi
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
      let moment = 0;
      
      // Initial moment depends on support type
      if (this.supportType === SUPPORT_TYPES.CANTILEVER) {
        // Cantilever: Start with Ma at fixed end, Ra * xi
        moment = this.reactions.Ma + this.reactions.Ra * xi;
      } else if (this.supportType === SUPPORT_TYPES.OVERHANGING) {
        // Overhanging: Consider support positions
        const a = this.supportPositions.a;
        const b = this.supportPositions.b;
        
        if (xi < a) {
          moment = 0;
        } else {
          moment = this.reactions.Ra * (xi - a);
        }
        
        if (xi >= b) {
          moment += this.reactions.Rb * (xi - b);
        }
      } else if (this.supportType === SUPPORT_TYPES.FIXED_BOTH) {
        // Fixed both: Include fixed end moment
        moment = this.reactions.Ma + this.reactions.Ra * xi;
      } else if (this.supportType === SUPPORT_TYPES.PROPPED_CANTILEVER) {
        // Propped cantilever
        moment = this.reactions.Ma + this.reactions.Ra * xi;
      } else {
        // Simply Supported
        moment = this.reactions.Ra * xi;
      }

      // Subtract moment due to loads
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
    
    // Apply boundary conditions based on support type
    switch (this.supportType) {
      case SUPPORT_TYPES.CANTILEVER:
        // Cantilever: y(0) = 0, θ(0) = 0
        // No correction needed as we start integration from zero
        break;
        
      case SUPPORT_TYPES.OVERHANGING:
        // Overhanging: y(a) = 0, y(b) = 0
        const a = this.supportPositions.a;
        const b = this.supportPositions.b;
        const idxA = Math.round(a / this.dx);
        const idxB = Math.round(b / this.dx);
        
        const deflA = deflection[idxA];
        const deflB = deflection[idxB];
        
        // Linear correction to enforce y(a) = 0, y(b) = 0
        const corrSlope = (deflB - deflA) / (b - a);
        
        for (let i = 0; i < deflection.length; i++) {
          const xi = this.x[i];
          deflection[i] -= deflA + corrSlope * (xi - a);
        }
        break;
        
      case SUPPORT_TYPES.FIXED_BOTH:
        // Fixed both: y(0) = 0, θ(0) = 0, y(L) = 0, θ(L) = 0
        // Complex - use superposition (simplified approach)
        const endDefl = deflection[deflection.length - 1];
        const endSlope = slope[slope.length - 1];
        
        for (let i = 0; i < deflection.length; i++) {
          const xi = this.x[i];
          const correction = endDefl * (3 * xi * xi / (this.span * this.span) - 2 * xi * xi * xi / (this.span * this.span * this.span));
          deflection[i] -= correction;
        }
        break;
        
      case SUPPORT_TYPES.PROPPED_CANTILEVER:
        // Propped: y(0) = 0, θ(0) = 0, y(L) = 0
        const endDeflProp = deflection[deflection.length - 1];
        for (let i = 0; i < deflection.length; i++) {
          const xi = this.x[i];
          deflection[i] -= endDeflProp * (xi / this.span) * (xi / this.span) * (3 - 2 * xi / this.span);
        }
        break;
        
      default:
        // Simply Supported: y(0) = 0, y(L) = 0
        const endDeflection = deflection[deflection.length - 1];
        const correctionSlope = endDeflection / this.span;
        
        for (let i = 0; i < deflection.length; i++) {
          deflection[i] -= correctionSlope * this.x[i];
        }
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
      supportType: this.supportType,
      supportPositions: this.supportPositions,
      reactions: {
        Ra: roundTo(this.reactions.Ra, 4),
        Rb: roundTo(this.reactions.Rb, 4),
        Ma: roundTo(this.reactions.Ma, 4),
        Mb: roundTo(this.reactions.Mb, 4)
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
        EI: this.E * this.I,
        supportType: this.supportType
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
export function analyzeBeam(span, loads, E = 200e9, I = 1e-4, supportType = SUPPORT_TYPES.SIMPLY_SUPPORTED, supportPositions = null) {
  const analyzer = new BeamAnalyzer(span, E, I, 500, supportType);
  if (supportPositions && supportType === SUPPORT_TYPES.OVERHANGING) {
    analyzer.setSupportPositions(supportPositions.a, supportPositions.b);
  }
  analyzer.setLoads(loads);
  return analyzer.analyze();
}

/**
 * Get support type options for UI
 */
export function getSupportTypeOptions() {
  return [
    { value: SUPPORT_TYPES.SIMPLY_SUPPORTED, label: 'Simply Supported', description: 'Pinned at both ends' },
    { value: SUPPORT_TYPES.CANTILEVER, label: 'Cantilever', description: 'Fixed at left, free at right' },
    { value: SUPPORT_TYPES.OVERHANGING, label: 'Overhanging', description: 'Supports with overhang(s)' },
    { value: SUPPORT_TYPES.FIXED_BOTH, label: 'Fixed Both Ends', description: 'Fixed at both ends' },
    { value: SUPPORT_TYPES.PROPPED_CANTILEVER, label: 'Propped Cantilever', description: 'Fixed at left, pinned at right' }
  ];
}

export default {
  BeamAnalyzer,
  SUPPORT_TYPES,
  calculateSectionProperties,
  analyzeBeam,
  getSupportTypeOptions
};
