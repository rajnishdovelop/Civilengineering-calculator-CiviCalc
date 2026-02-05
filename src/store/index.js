import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define SUPPORT_TYPES locally to avoid circular dependency
const SUPPORT_TYPES = {
  SIMPLY_SUPPORTED: 'simply_supported',
  CANTILEVER: 'cantilever',
  OVERHANGING: 'overhanging',
  FIXED_BOTH: 'fixed_both',
  PROPPED_CANTILEVER: 'propped_cantilever'
};

/**
 * App Store - Global application state
 * Persisted to LocalStorage
 */
export const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      
      // Current calculator module
      currentModule: null,
      setCurrentModule: (module) => set({ currentModule: module }),
      
      // Recent calculations history
      recentCalculations: [],
      addCalculation: (calculation) => set((state) => ({
        recentCalculations: [
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...calculation
          },
          ...state.recentCalculations.slice(0, 49) // Keep last 50
        ]
      })),
      clearHistory: () => set({ recentCalculations: [] }),
      
      // Saved calculations (bookmarked)
      savedCalculations: [],
      saveCalculation: (calculation) => set((state) => ({
        savedCalculations: [
          {
            id: Date.now(),
            savedAt: new Date().toISOString(),
            ...calculation
          },
          ...state.savedCalculations
        ]
      })),
      removeSavedCalculation: (id) => set((state) => ({
        savedCalculations: state.savedCalculations.filter(c => c.id !== id)
      })),
      
      // User preferences
      preferences: {
        unitSystem: 'SI', // SI or Imperial
        decimalPlaces: 4,
        autoCalculate: true,
        showFormulas: true
      },
      updatePreferences: (updates) => set((state) => ({
        preferences: { ...state.preferences, ...updates }
      }))
    }),
    {
      name: 'civicalc-storage',
      partialize: (state) => ({
        theme: state.theme,
        recentCalculations: state.recentCalculations,
        savedCalculations: state.savedCalculations,
        preferences: state.preferences
      })
    }
  )
);

/**
 * Beam Calculator Store - Enhanced with support types
 */
export const useBeamStore = create(
  persist(
    (set) => ({
      // Beam properties
      span: 6,
      E: 200, // GPa
      I: 0.0001, // m^4
      sectionType: 'rectangle',
      sectionDimensions: {
        width: 0.3,
        height: 0.5
      },
      
      // Support type (NEW)
      supportType: SUPPORT_TYPES.SIMPLY_SUPPORTED,
      supportPositions: { a: 0, b: 6 }, // For overhanging beams
      
      // Loads
      loads: [],
      
      // Results
      results: null,
      
      // Actions
      setSpan: (span) => set({ span, supportPositions: { a: 0, b: span } }),
      setE: (E) => set({ E }),
      setI: (I) => set({ I }),
      setSectionType: (type) => set({ sectionType: type }),
      setSectionDimensions: (dims) => set({ sectionDimensions: dims }),
      
      // Support type actions (NEW)
      setSupportType: (type) => set({ supportType: type }),
      setSupportPositions: (positions) => set({ supportPositions: positions }),
      
      addLoad: (load) => set((state) => ({
        loads: [...state.loads, { id: Date.now(), ...load }]
      })),
      updateLoad: (id, updates) => set((state) => ({
        loads: state.loads.map(l => l.id === id ? { ...l, ...updates } : l)
      })),
      removeLoad: (id) => set((state) => ({
        loads: state.loads.filter(l => l.id !== id)
      })),
      clearLoads: () => set({ loads: [] }),
      
      setResults: (results) => set({ results }),
      clearResults: () => set({ results: null }),
      
      reset: () => set({
        span: 6,
        E: 200,
        I: 0.0001,
        sectionType: 'rectangle',
        sectionDimensions: { width: 0.3, height: 0.5 },
        supportType: SUPPORT_TYPES.SIMPLY_SUPPORTED,
        supportPositions: { a: 0, b: 6 },
        loads: [],
        results: null
      })
    }),
    {
      name: 'civicalc-beam-storage',
      partialize: (state) => ({
        span: state.span,
        E: state.E,
        I: state.I,
        sectionType: state.sectionType,
        sectionDimensions: state.sectionDimensions,
        supportType: state.supportType,
        supportPositions: state.supportPositions,
        loads: state.loads
      })
    }
  )
);

/**
 * Geotechnical Calculator Store
 */
export const useGeotechStore = create(
  persist(
    (set) => ({
      // Bearing Capacity inputs
      bearingCapacity: {
        cohesion: 20,
        frictionAngle: 30,
        unitWeight: 18,
        foundationDepth: 1,
        foundationWidth: 2,
        foundationType: 'strip'
      },
      
      // Settlement inputs
      settlement: {
        pressure: 100,
        foundationWidth: 2,
        elasticModulus: 25000,
        poissonRatio: 0.3
      },
      
      // Earth Pressure inputs
      earthPressure: {
        frictionAngle: 30,
        unitWeight: 18,
        wallHeight: 5,
        cohesion: 0
      },
      
      results: null,
      
      setBearingCapacityInput: (key, value) => set((state) => ({
        bearingCapacity: { ...state.bearingCapacity, [key]: value }
      })),
      setSettlementInput: (key, value) => set((state) => ({
        settlement: { ...state.settlement, [key]: value }
      })),
      setEarthPressureInput: (key, value) => set((state) => ({
        earthPressure: { ...state.earthPressure, [key]: value }
      })),
      setResults: (results) => set({ results }),
      clearResults: () => set({ results: null })
    }),
    {
      name: 'civicalc-geotech-storage'
    }
  )
);

/**
 * Fluid Mechanics Store
 */
export const useFluidStore = create(
  persist(
    (set) => ({
      // Manning Equation inputs
      manning: {
        channelType: 'rectangular',
        manningN: 0.013,
        slope: 0.001,
        bottomWidth: 3,
        flowDepth: 1.5,
        sideSlope: 0
      },
      
      // Pipe Flow inputs
      pipeFlow: {
        pipeDiameter: 0.3,
        pipeLength: 100,
        flowVelocity: 2,
        roughness: 0.0015
      },
      
      results: null,
      
      setManningInput: (key, value) => set((state) => ({
        manning: { ...state.manning, [key]: value }
      })),
      setPipeFlowInput: (key, value) => set((state) => ({
        pipeFlow: { ...state.pipeFlow, [key]: value }
      })),
      setResults: (results) => set({ results }),
      clearResults: () => set({ results: null })
    }),
    {
      name: 'civicalc-fluid-storage'
    }
  )
);

/**
 * Transportation Store
 */
export const useTransportStore = create(
  persist(
    (set) => ({
      // Greenshields Model
      greenshields: {
        freeFlowSpeed: 100,
        jamDensity: 150,
        currentDensity: 50
      },
      
      // Horizontal Curve
      horizontalCurve: {
        radius: 300,
        deflectionAngle: 45,
        designSpeed: 80,
        superelevation: 0.06
      },
      
      // Vertical Curve
      verticalCurve: {
        grade1: 3,
        grade2: -2,
        curveLength: 200,
        designSpeed: 80
      },
      
      results: null,
      
      setGreenshieldsInput: (key, value) => set((state) => ({
        greenshields: { ...state.greenshields, [key]: value }
      })),
      setHorizontalCurveInput: (key, value) => set((state) => ({
        horizontalCurve: { ...state.horizontalCurve, [key]: value }
      })),
      setVerticalCurveInput: (key, value) => set((state) => ({
        verticalCurve: { ...state.verticalCurve, [key]: value }
      })),
      setResults: (results) => set({ results }),
      clearResults: () => set({ results: null })
    }),
    {
      name: 'civicalc-transport-storage'
    }
  )
);

export default {
  useAppStore,
  useBeamStore,
  useGeotechStore,
  useFluidStore,
  useTransportStore
};

/**
 * Concrete Technology Store (NEW)
 * IS 10262:2019 Mix Design
 */
export const useConcreteStore = create(
  persist(
    (set) => ({
      // Mix Design inputs
      mixDesign: {
        targetGrade: 'M25',
        exposureCondition: 'Moderate',
        workability: 100,
        maxAggregateSize: 20,
        aggregateType: 'Crushed',
        sandZone: 'Zone II',
        cementType: 'OPC 53',
        admixture: false,
        admixtureDosage: 0,
        specificGravityCement: 3.15,
        specificGravityCA: 2.70,
        specificGravityFA: 2.65
      },
      
      // Trial mix batch size (liters)
      batchSize: 25,
      
      // Results
      results: null,
      
      // Actions
      setMixDesignInput: (key, value) => set((state) => ({
        mixDesign: { ...state.mixDesign, [key]: value }
      })),
      setAllMixDesignInputs: (inputs) => set((state) => ({
        mixDesign: { ...state.mixDesign, ...inputs }
      })),
      setBatchSize: (size) => set({ batchSize: size }),
      setResults: (results) => set({ results }),
      clearResults: () => set({ results: null }),
      
      reset: () => set({
        mixDesign: {
          targetGrade: 'M25',
          exposureCondition: 'Moderate',
          workability: 100,
          maxAggregateSize: 20,
          aggregateType: 'Crushed',
          sandZone: 'Zone II',
          cementType: 'OPC 53',
          admixture: false,
          admixtureDosage: 0,
          specificGravityCement: 3.15,
          specificGravityCA: 2.70,
          specificGravityFA: 2.65
        },
        batchSize: 25,
        results: null
      })
    }),
    {
      name: 'civicalc-concrete-storage'
    }
  )
);

/**
 * Construction Management Store (NEW)
 * CPM/PERT Analysis
 */
export const useConstructionStore = create(
  persist(
    (set) => ({
      // Analysis type
      analysisType: 'CPM', // 'CPM' or 'PERT'
      
      // Activities list
      activities: [
        { id: 'A', name: 'Site Preparation', duration: 3, predecessors: '', optimistic: 2, mostLikely: 3, pessimistic: 5, cost: 50000 },
        { id: 'B', name: 'Foundation Work', duration: 5, predecessors: 'A', optimistic: 4, mostLikely: 5, pessimistic: 8, cost: 150000 },
        { id: 'C', name: 'Structural Frame', duration: 8, predecessors: 'B', optimistic: 6, mostLikely: 8, pessimistic: 12, cost: 200000 }
      ],
      
      // Project settings
      projectName: 'Construction Project',
      startDate: new Date().toISOString().split('T')[0],
      
      // Results
      results: null,
      
      // Actions
      setAnalysisType: (type) => set({ analysisType: type }),
      setProjectName: (name) => set({ projectName: name }),
      setStartDate: (date) => set({ startDate: date }),
      
      // Activity management
      addActivity: (activity) => set((state) => ({
        activities: [...state.activities, { 
          id: String.fromCharCode(65 + state.activities.length), // A, B, C...
          ...activity 
        }]
      })),
      updateActivity: (id, updates) => set((state) => ({
        activities: state.activities.map(a => a.id === id ? { ...a, ...updates } : a)
      })),
      removeActivity: (id) => set((state) => ({
        activities: state.activities.filter(a => a.id !== id)
      })),
      setActivities: (activities) => set({ activities }),
      clearActivities: () => set({ activities: [] }),
      
      setResults: (results) => set({ results }),
      clearResults: () => set({ results: null }),
      
      reset: () => set({
        analysisType: 'CPM',
        activities: [
          { id: 'A', name: 'Site Preparation', duration: 3, predecessors: '', optimistic: 2, mostLikely: 3, pessimistic: 5, cost: 50000 }
        ],
        projectName: 'Construction Project',
        startDate: new Date().toISOString().split('T')[0],
        results: null
      }),
      
      // Load sample data
      loadSampleCPM: () => set({
        analysisType: 'CPM',
        activities: [
          { id: 'A', name: 'Site Preparation', duration: 3, predecessors: '', cost: 50000 },
          { id: 'B', name: 'Foundation Work', duration: 5, predecessors: 'A', cost: 150000 },
          { id: 'C', name: 'Structural Frame', duration: 8, predecessors: 'B', cost: 200000 },
          { id: 'D', name: 'Electrical Work', duration: 4, predecessors: 'B', cost: 75000 },
          { id: 'E', name: 'Plumbing', duration: 3, predecessors: 'B', cost: 60000 },
          { id: 'F', name: 'Roofing', duration: 4, predecessors: 'C', cost: 100000 },
          { id: 'G', name: 'Interior Walls', duration: 5, predecessors: 'C,D,E', cost: 80000 },
          { id: 'H', name: 'Finishing', duration: 6, predecessors: 'F,G', cost: 120000 },
          { id: 'I', name: 'Final Inspection', duration: 2, predecessors: 'H', cost: 10000 }
        ]
      }),
      
      loadSamplePERT: () => set({
        analysisType: 'PERT',
        activities: [
          { id: 'A', name: 'Site Preparation', optimistic: 2, mostLikely: 3, pessimistic: 5, predecessors: '' },
          { id: 'B', name: 'Foundation Work', optimistic: 4, mostLikely: 5, pessimistic: 8, predecessors: 'A' },
          { id: 'C', name: 'Structural Frame', optimistic: 6, mostLikely: 8, pessimistic: 12, predecessors: 'B' },
          { id: 'D', name: 'Electrical Work', optimistic: 3, mostLikely: 4, pessimistic: 6, predecessors: 'B' },
          { id: 'E', name: 'Plumbing', optimistic: 2, mostLikely: 3, pessimistic: 5, predecessors: 'B' },
          { id: 'F', name: 'Roofing', optimistic: 3, mostLikely: 4, pessimistic: 7, predecessors: 'C' },
          { id: 'G', name: 'Interior Walls', optimistic: 4, mostLikely: 5, pessimistic: 8, predecessors: 'C,D,E' },
          { id: 'H', name: 'Finishing', optimistic: 5, mostLikely: 6, pessimistic: 9, predecessors: 'F,G' },
          { id: 'I', name: 'Final Inspection', optimistic: 1, mostLikely: 2, pessimistic: 3, predecessors: 'H' }
        ]
      })
    }),
    {
      name: 'civicalc-construction-storage'
    }
  )
);
