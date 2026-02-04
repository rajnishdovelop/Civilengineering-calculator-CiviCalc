/**
 * Construction Management Calculator Module
 * CPM (Critical Path Method) and PERT Analysis
 * 
 * @author Concreate Club, IIT Indore
 */

import { roundTo } from '../math/solver.js';

/**
 * Activity class for CPM/PERT calculations
 */
class Activity {
  constructor(id, name, duration, predecessors = []) {
    this.id = id;
    this.name = name;
    this.duration = parseFloat(duration);
    this.predecessors = predecessors;
    this.successors = [];
    
    // CPM values
    this.ES = 0;  // Early Start
    this.EF = 0;  // Early Finish
    this.LS = 0;  // Late Start
    this.LF = 0;  // Late Finish
    this.TF = 0;  // Total Float
    this.FF = 0;  // Free Float
    this.isCritical = false;
    
    // PERT values
    this.optimistic = 0;
    this.mostLikely = 0;
    this.pessimistic = 0;
    this.expectedDuration = 0;
    this.variance = 0;
    this.standardDeviation = 0;
  }
}

/**
 * Critical Path Method (CPM) Calculator
 * Calculates ES, EF, LS, LF, Float, and Critical Path
 */
export function cpmAnalysis(activitiesInput) {
  if (!activitiesInput || activitiesInput.length === 0) {
    return { error: 'No activities provided' };
  }

  // Create activity objects
  const activities = new Map();
  const activityList = [];

  activitiesInput.forEach((act, index) => {
    const predecessors = act.predecessors 
      ? act.predecessors.split(',').map(p => p.trim()).filter(p => p !== '')
      : [];
    
    const activity = new Activity(
      act.id || String.fromCharCode(65 + index), // A, B, C, ...
      act.name || `Activity ${String.fromCharCode(65 + index)}`,
      act.duration || 0,
      predecessors
    );
    
    activities.set(activity.id, activity);
    activityList.push(activity);
  });

  // Build successor relationships
  activityList.forEach(activity => {
    activity.predecessors.forEach(predId => {
      const predecessor = activities.get(predId);
      if (predecessor) {
        predecessor.successors.push(activity.id);
      }
    });
  });

  // Find start activities (no predecessors)
  const startActivities = activityList.filter(a => a.predecessors.length === 0);
  
  // Find end activities (no successors)
  const endActivities = activityList.filter(a => a.successors.length === 0);

  // Forward Pass - Calculate ES and EF
  const forwardPass = () => {
    const processed = new Set();
    const queue = [...startActivities];

    startActivities.forEach(a => {
      a.ES = 0;
      a.EF = a.ES + a.duration;
    });

    while (queue.length > 0) {
      const current = queue.shift();
      
      if (processed.has(current.id)) continue;
      
      // Check if all predecessors are processed
      const allPredProcessed = current.predecessors.every(pId => processed.has(pId));
      
      if (!allPredProcessed && current.predecessors.length > 0) {
        queue.push(current); // Re-add to queue
        continue;
      }

      // Calculate ES as max(EF of predecessors)
      if (current.predecessors.length > 0) {
        current.ES = Math.max(
          ...current.predecessors.map(pId => activities.get(pId)?.EF || 0)
        );
      }
      
      current.EF = current.ES + current.duration;
      processed.add(current.id);

      // Add successors to queue
      current.successors.forEach(sId => {
        const successor = activities.get(sId);
        if (successor && !processed.has(sId)) {
          queue.push(successor);
        }
      });
    }
  };

  // Backward Pass - Calculate LS and LF
  const backwardPass = () => {
    // Project duration is max EF
    const projectDuration = Math.max(...activityList.map(a => a.EF));
    
    const processed = new Set();
    const queue = [...endActivities];

    endActivities.forEach(a => {
      a.LF = projectDuration;
      a.LS = a.LF - a.duration;
    });

    while (queue.length > 0) {
      const current = queue.shift();
      
      if (processed.has(current.id)) continue;
      
      // Check if all successors are processed
      const allSuccProcessed = current.successors.every(sId => processed.has(sId));
      
      if (!allSuccProcessed && current.successors.length > 0) {
        queue.push(current);
        continue;
      }

      // Calculate LF as min(LS of successors)
      if (current.successors.length > 0) {
        current.LF = Math.min(
          ...current.successors.map(sId => activities.get(sId)?.LS || projectDuration)
        );
      }
      
      current.LS = current.LF - current.duration;
      processed.add(current.id);

      // Add predecessors to queue
      current.predecessors.forEach(pId => {
        const predecessor = activities.get(pId);
        if (predecessor && !processed.has(pId)) {
          queue.push(predecessor);
        }
      });
    }
  };

  // Calculate Float
  const calculateFloat = () => {
    activityList.forEach(activity => {
      // Total Float = LS - ES = LF - EF
      activity.TF = roundTo(activity.LS - activity.ES, 2);
      
      // Free Float = min(ES of successors) - EF
      if (activity.successors.length > 0) {
        const minSuccessorES = Math.min(
          ...activity.successors.map(sId => activities.get(sId)?.ES || 0)
        );
        activity.FF = roundTo(minSuccessorES - activity.EF, 2);
      } else {
        activity.FF = activity.TF;
      }
      
      // Activity is critical if Total Float = 0
      activity.isCritical = Math.abs(activity.TF) < 0.001;
    });
  };

  // Execute passes
  forwardPass();
  backwardPass();
  calculateFloat();

  // Find Critical Path
  const findCriticalPath = () => {
    const criticalActivities = activityList.filter(a => a.isCritical);
    const paths = [];
    
    const findPaths = (current, path = []) => {
      path.push(current.id);
      
      const criticalSuccessors = current.successors
        .map(sId => activities.get(sId))
        .filter(s => s && s.isCritical);
      
      if (criticalSuccessors.length === 0) {
        paths.push([...path]);
      } else {
        criticalSuccessors.forEach(successor => {
          findPaths(successor, [...path]);
        });
      }
    };

    const criticalStarts = criticalActivities.filter(a => 
      a.predecessors.length === 0 || 
      a.predecessors.every(pId => !activities.get(pId)?.isCritical)
    );

    criticalStarts.forEach(start => findPaths(start, []));
    
    return paths;
  };

  const criticalPaths = findCriticalPath();
  const projectDuration = Math.max(...activityList.map(a => a.EF));

  // Generate Gantt Chart data
  const ganttData = activityList.map(activity => ({
    id: activity.id,
    name: activity.name,
    start: activity.ES,
    end: activity.EF,
    duration: activity.duration,
    isCritical: activity.isCritical,
    float: activity.TF
  })).sort((a, b) => a.start - b.start);

  // Generate Network Diagram data
  const networkNodes = activityList.map(activity => ({
    id: activity.id,
    label: `${activity.id}\n${activity.name}\n(${activity.duration})`,
    ES: activity.ES,
    EF: activity.EF,
    LS: activity.LS,
    LF: activity.LF,
    isCritical: activity.isCritical
  }));

  const networkEdges = [];
  activityList.forEach(activity => {
    activity.successors.forEach(sId => {
      networkEdges.push({
        from: activity.id,
        to: sId,
        isCritical: activity.isCritical && activities.get(sId)?.isCritical
      });
    });
  });

  // Results table
  const resultsTable = activityList.map(activity => ({
    id: activity.id,
    name: activity.name,
    duration: activity.duration,
    predecessors: activity.predecessors.join(', ') || '-',
    ES: roundTo(activity.ES, 2),
    EF: roundTo(activity.EF, 2),
    LS: roundTo(activity.LS, 2),
    LF: roundTo(activity.LF, 2),
    totalFloat: roundTo(activity.TF, 2),
    freeFloat: roundTo(activity.FF, 2),
    isCritical: activity.isCritical
  }));

  return {
    projectDuration: roundTo(projectDuration, 2),
    criticalPaths: criticalPaths.map(path => path.join(' → ')),
    criticalActivities: activityList.filter(a => a.isCritical).map(a => a.id),
    totalActivities: activityList.length,
    resultsTable,
    ganttData,
    networkNodes,
    networkEdges,
    summary: {
      startDate: 0,
      endDate: projectDuration,
      numberOfCriticalPaths: criticalPaths.length,
      criticalPathLength: criticalPaths[0]?.length || 0
    }
  };
}

/**
 * PERT (Program Evaluation and Review Technique) Analysis
 * Uses three-time estimates: Optimistic, Most Likely, Pessimistic
 */
export function pertAnalysis(activitiesInput) {
  if (!activitiesInput || activitiesInput.length === 0) {
    return { error: 'No activities provided' };
  }

  // Calculate expected duration and variance for each activity
  const activitiesWithPERT = activitiesInput.map((act, index) => {
    const optimistic = parseFloat(act.optimistic) || 0;
    const mostLikely = parseFloat(act.mostLikely) || 0;
    const pessimistic = parseFloat(act.pessimistic) || 0;

    // PERT formula: te = (o + 4m + p) / 6
    const expectedDuration = (optimistic + 4 * mostLikely + pessimistic) / 6;
    
    // Variance: σ² = ((p - o) / 6)²
    const variance = Math.pow((pessimistic - optimistic) / 6, 2);
    
    // Standard Deviation
    const standardDeviation = Math.sqrt(variance);

    return {
      ...act,
      id: act.id || String.fromCharCode(65 + index),
      duration: expectedDuration, // Use expected duration for CPM
      optimistic,
      mostLikely,
      pessimistic,
      expectedDuration: roundTo(expectedDuration, 2),
      variance: roundTo(variance, 4),
      standardDeviation: roundTo(standardDeviation, 2)
    };
  });

  // Run CPM with expected durations
  const cpmResults = cpmAnalysis(activitiesWithPERT);

  if (cpmResults.error) {
    return cpmResults;
  }

  // Calculate project variance (sum of critical path variances)
  const criticalActivityIds = new Set(cpmResults.criticalActivities);
  const projectVariance = activitiesWithPERT
    .filter(a => criticalActivityIds.has(a.id))
    .reduce((sum, a) => sum + a.variance, 0);

  const projectStdDev = Math.sqrt(projectVariance);

  // Probability calculations
  const calculateProbability = (targetDuration) => {
    const z = (targetDuration - cpmResults.projectDuration) / projectStdDev;
    // Standard normal distribution approximation
    const probability = 0.5 * (1 + erf(z / Math.sqrt(2)));
    return roundTo(probability * 100, 2);
  };

  // Error function approximation for normal distribution
  function erf(x) {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  // PERT results table
  const pertTable = activitiesWithPERT.map(activity => ({
    id: activity.id,
    name: activity.name,
    optimistic: activity.optimistic,
    mostLikely: activity.mostLikely,
    pessimistic: activity.pessimistic,
    expectedDuration: activity.expectedDuration,
    variance: activity.variance,
    standardDeviation: activity.standardDeviation,
    isCritical: criticalActivityIds.has(activity.id)
  }));

  return {
    ...cpmResults,
    pertTable,
    projectVariance: roundTo(projectVariance, 4),
    projectStdDev: roundTo(projectStdDev, 2),
    probabilityAnalysis: {
      expectedDuration: cpmResults.projectDuration,
      probability90: roundTo(cpmResults.projectDuration + 1.28 * projectStdDev, 2),
      probability95: roundTo(cpmResults.projectDuration + 1.645 * projectStdDev, 2),
      probability99: roundTo(cpmResults.projectDuration + 2.33 * projectStdDev, 2)
    },
    calculateProbability
  };
}

/**
 * Resource Leveling Helper
 * Identifies resource conflicts and suggests adjustments
 */
export function resourceAnalysis(activities, resources) {
  // Basic resource allocation analysis
  const timeline = [];
  const maxDuration = Math.max(...activities.map(a => a.EF || a.duration));
  
  for (let t = 0; t <= maxDuration; t++) {
    const activeActivities = activities.filter(a => 
      t >= (a.ES || 0) && t < (a.EF || a.duration)
    );
    
    const resourceUsage = {};
    resources.forEach(r => {
      resourceUsage[r.name] = {
        available: r.available,
        used: 0,
        activities: []
      };
    });

    activeActivities.forEach(activity => {
      (activity.resources || []).forEach(res => {
        if (resourceUsage[res.name]) {
          resourceUsage[res.name].used += res.quantity;
          resourceUsage[res.name].activities.push(activity.id);
        }
      });
    });

    timeline.push({
      time: t,
      activeActivities: activeActivities.map(a => a.id),
      resourceUsage,
      hasConflict: Object.values(resourceUsage).some(r => r.used > r.available)
    });
  }

  return {
    timeline,
    conflicts: timeline.filter(t => t.hasConflict),
    maxResourceUsage: resources.map(r => ({
      name: r.name,
      available: r.available,
      maxUsed: Math.max(...timeline.map(t => t.resourceUsage[r.name]?.used || 0))
    }))
  };
}

/**
 * Cost Analysis (Basic)
 */
export function costAnalysis(activities) {
  const directCosts = activities.reduce((sum, a) => sum + (parseFloat(a.cost) || 0), 0);
  const criticalActivities = activities.filter(a => a.isCritical);
  const criticalCost = criticalActivities.reduce((sum, a) => sum + (parseFloat(a.cost) || 0), 0);

  return {
    totalDirectCost: roundTo(directCosts, 2),
    criticalPathCost: roundTo(criticalCost, 2),
    costPerActivity: activities.map(a => ({
      id: a.id,
      name: a.name,
      cost: parseFloat(a.cost) || 0,
      costPerDay: roundTo((parseFloat(a.cost) || 0) / (a.duration || 1), 2)
    }))
  };
}

/**
 * Generate sample activities for demo
 */
export function getSampleActivities() {
  return [
    { id: 'A', name: 'Site Preparation', duration: 3, predecessors: '', cost: 50000 },
    { id: 'B', name: 'Foundation Work', duration: 5, predecessors: 'A', cost: 150000 },
    { id: 'C', name: 'Structural Frame', duration: 8, predecessors: 'B', cost: 200000 },
    { id: 'D', name: 'Electrical Work', duration: 4, predecessors: 'B', cost: 75000 },
    { id: 'E', name: 'Plumbing', duration: 3, predecessors: 'B', cost: 60000 },
    { id: 'F', name: 'Roofing', duration: 4, predecessors: 'C', cost: 100000 },
    { id: 'G', name: 'Interior Walls', duration: 5, predecessors: 'C,D,E', cost: 80000 },
    { id: 'H', name: 'Finishing', duration: 6, predecessors: 'F,G', cost: 120000 },
    { id: 'I', name: 'Final Inspection', duration: 2, predecessors: 'H', cost: 10000 }
  ];
}

/**
 * Generate PERT sample activities
 */
export function getSamplePERTActivities() {
  return [
    { id: 'A', name: 'Site Preparation', optimistic: 2, mostLikely: 3, pessimistic: 5, predecessors: '' },
    { id: 'B', name: 'Foundation Work', optimistic: 4, mostLikely: 5, pessimistic: 8, predecessors: 'A' },
    { id: 'C', name: 'Structural Frame', optimistic: 6, mostLikely: 8, pessimistic: 12, predecessors: 'B' },
    { id: 'D', name: 'Electrical Work', optimistic: 3, mostLikely: 4, pessimistic: 6, predecessors: 'B' },
    { id: 'E', name: 'Plumbing', optimistic: 2, mostLikely: 3, pessimistic: 5, predecessors: 'B' },
    { id: 'F', name: 'Roofing', optimistic: 3, mostLikely: 4, pessimistic: 7, predecessors: 'C' },
    { id: 'G', name: 'Interior Walls', optimistic: 4, mostLikely: 5, pessimistic: 8, predecessors: 'C,D,E' },
    { id: 'H', name: 'Finishing', optimistic: 5, mostLikely: 6, pessimistic: 9, predecessors: 'F,G' },
    { id: 'I', name: 'Final Inspection', optimistic: 1, mostLikely: 2, pessimistic: 3, predecessors: 'H' }
  ];
}

export default {
  cpmAnalysis,
  pertAnalysis,
  resourceAnalysis,
  costAnalysis,
  getSampleActivities,
  getSamplePERTActivities
};
