import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
 * Beam Calculator Store
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
      
      // Loads
      loads: [],
      
      // Results
      results: null,
      
      // Actions
      setSpan: (span) => set({ span }),
      setE: (E) => set({ E }),
      setI: (I) => set({ I }),
      setSectionType: (type) => set({ sectionType: type }),
      setSectionDimensions: (dims) => set({ sectionDimensions: dims }),
      
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
