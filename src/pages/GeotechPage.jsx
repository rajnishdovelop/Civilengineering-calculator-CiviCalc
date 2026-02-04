import React, { useState } from 'react';
import { Mountain, Calculator, FileDown } from 'lucide-react';
import { 
  terzaghiBearingCapacity, 
  meyerhofBearingCapacity,
  immediateSettlement,
  consolidationSettlement,
  earthPressure 
} from '../utils/calculators/geotech';
import { FormInput, FormSelect, Button, Card, ResultDisplay, Tabs, Alert } from '../components/ui/FormElements';
import { useGeotechStore } from '../store';
import { generateGeotechReport } from '../utils/reportGenerator';

const calculationTypes = [
  { id: 'terzaghi', label: 'Terzaghi Bearing Capacity' },
  { id: 'meyerhof', label: 'Meyerhof Bearing Capacity' },
  { id: 'settlement', label: 'Immediate Settlement' },
  { id: 'consolidation', label: 'Consolidation Settlement' },
  { id: 'earthPressure', label: 'Earth Pressure (Rankine)' }
];

const foundationTypes = [
  { value: 'strip', label: 'Strip Footing' },
  { value: 'square', label: 'Square Footing' },
  { value: 'circular', label: 'Circular Footing' }
];

function GeotechPage() {
  const { 
    bearingCapacity, settlement, earthPressure: earthPressureInputs,
    setBearingCapacityInput, setSettlementInput, setEarthPressureInput,
    results, setResults
  } = useGeotechStore();

  const [activeCalc, setActiveCalc] = useState('terzaghi');
  const [error, setError] = useState(null);

  const handleCalculate = () => {
    setError(null);
    
    try {
      let result;
      
      switch (activeCalc) {
        case 'terzaghi':
          result = terzaghiBearingCapacity(bearingCapacity);
          break;
        case 'meyerhof':
          result = meyerhofBearingCapacity({
            ...bearingCapacity,
            foundationLength: bearingCapacity.foundationWidth * 2
          });
          break;
        case 'settlement':
          result = immediateSettlement(settlement);
          break;
        case 'consolidation':
          result = consolidationSettlement({
            compressionIndex: 0.3,
            initialVoidRatio: 0.8,
            layerThickness: 5,
            initialEffectiveStress: 50,
            stressIncrease: settlement.pressure,
            preconsolidationPressure: 80
          });
          break;
        case 'earthPressure':
          result = earthPressure(earthPressureInputs);
          break;
        default:
          throw new Error('Unknown calculation type');
      }
      
      setResults(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportPDF = () => {
    if (!results) return;
    const report = generateGeotechReport(results, activeCalc);
    report.download(`CiviCalc_Geotech_${activeCalc}.pdf`);
  };

  const renderInputs = () => {
    switch (activeCalc) {
      case 'terzaghi':
      case 'meyerhof':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Cohesion (c)"
              name="cohesion"
              value={bearingCapacity.cohesion}
              onChange={(e) => setBearingCapacityInput('cohesion', parseFloat(e.target.value) || 0)}
              unit="kPa"
            />
            <FormInput
              label="Friction Angle (φ)"
              name="frictionAngle"
              value={bearingCapacity.frictionAngle}
              onChange={(e) => setBearingCapacityInput('frictionAngle', parseFloat(e.target.value) || 0)}
              unit="degrees"
            />
            <FormInput
              label="Unit Weight (γ)"
              name="unitWeight"
              value={bearingCapacity.unitWeight}
              onChange={(e) => setBearingCapacityInput('unitWeight', parseFloat(e.target.value) || 0)}
              unit="kN/m³"
            />
            <FormInput
              label="Foundation Depth (Df)"
              name="foundationDepth"
              value={bearingCapacity.foundationDepth}
              onChange={(e) => setBearingCapacityInput('foundationDepth', parseFloat(e.target.value) || 0)}
              unit="m"
            />
            <FormInput
              label="Foundation Width (B)"
              name="foundationWidth"
              value={bearingCapacity.foundationWidth}
              onChange={(e) => setBearingCapacityInput('foundationWidth', parseFloat(e.target.value) || 0)}
              unit="m"
            />
            <FormSelect
              label="Foundation Type"
              name="foundationType"
              value={bearingCapacity.foundationType}
              onChange={(e) => setBearingCapacityInput('foundationType', e.target.value)}
              options={foundationTypes}
            />
          </div>
        );

      case 'settlement':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Applied Pressure (q)"
              name="pressure"
              value={settlement.pressure}
              onChange={(e) => setSettlementInput('pressure', parseFloat(e.target.value) || 0)}
              unit="kPa"
            />
            <FormInput
              label="Foundation Width (B)"
              name="foundationWidth"
              value={settlement.foundationWidth}
              onChange={(e) => setSettlementInput('foundationWidth', parseFloat(e.target.value) || 0)}
              unit="m"
            />
            <FormInput
              label="Elastic Modulus (Es)"
              name="elasticModulus"
              value={settlement.elasticModulus}
              onChange={(e) => setSettlementInput('elasticModulus', parseFloat(e.target.value) || 0)}
              unit="kPa"
            />
            <FormInput
              label="Poisson's Ratio (μ)"
              name="poissonRatio"
              value={settlement.poissonRatio}
              onChange={(e) => setSettlementInput('poissonRatio', parseFloat(e.target.value) || 0)}
              step="0.01"
              min={0}
              max={0.5}
            />
          </div>
        );

      case 'consolidation':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Compression Index (Cc)"
              name="compressionIndex"
              value={0.3}
              disabled
              unit=""
            />
            <FormInput
              label="Initial Void Ratio (e0)"
              name="voidRatio"
              value={0.8}
              disabled
              unit=""
            />
            <FormInput
              label="Layer Thickness (H)"
              name="layerThickness"
              value={5}
              disabled
              unit="m"
            />
            <FormInput
              label="Stress Increase (Δσ)"
              name="stressIncrease"
              value={settlement.pressure}
              onChange={(e) => setSettlementInput('pressure', parseFloat(e.target.value) || 0)}
              unit="kPa"
            />
          </div>
        );

      case 'earthPressure':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Friction Angle (φ)"
              name="frictionAngle"
              value={earthPressureInputs.frictionAngle}
              onChange={(e) => setEarthPressureInput('frictionAngle', parseFloat(e.target.value) || 0)}
              unit="degrees"
            />
            <FormInput
              label="Unit Weight (γ)"
              name="unitWeight"
              value={earthPressureInputs.unitWeight}
              onChange={(e) => setEarthPressureInput('unitWeight', parseFloat(e.target.value) || 0)}
              unit="kN/m³"
            />
            <FormInput
              label="Wall Height (H)"
              name="wallHeight"
              value={earthPressureInputs.wallHeight}
              onChange={(e) => setEarthPressureInput('wallHeight', parseFloat(e.target.value) || 0)}
              unit="m"
            />
            <FormInput
              label="Cohesion (c)"
              name="cohesion"
              value={earthPressureInputs.cohesion}
              onChange={(e) => setEarthPressureInput('cohesion', parseFloat(e.target.value) || 0)}
              unit="kPa"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!results) return null;

    switch (activeCalc) {
      case 'terzaghi':
      case 'meyerhof':
        return (
          <div className="space-y-6">
            <Card title="Bearing Capacity Factors">
              <div className="grid grid-cols-3 gap-4">
                <ResultDisplay label="Nc" value={results.bearingCapacityFactors.Nc} />
                <ResultDisplay label="Nq" value={results.bearingCapacityFactors.Nq} />
                <ResultDisplay label="Nγ" value={results.bearingCapacityFactors.Ngamma} />
              </div>
            </Card>
            
            {results.contributions && (
              <Card title="Contribution Components">
                <div className="grid grid-cols-3 gap-4">
                  <ResultDisplay label="Cohesion Term" value={results.contributions.cohesion} unit="kPa" />
                  <ResultDisplay label="Surcharge Term" value={results.contributions.surcharge} unit="kPa" />
                  <ResultDisplay label="Self Weight Term" value={results.contributions.selfWeight} unit="kPa" />
                </div>
              </Card>
            )}
            
            <Card title="Bearing Capacity">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ResultDisplay 
                  label="Ultimate Bearing Capacity (qu)" 
                  value={results.ultimateBearingCapacity} 
                  unit="kPa"
                  highlight 
                />
                <ResultDisplay 
                  label="Net Ultimate (qnu)" 
                  value={results.netUltimateBearingCapacity} 
                  unit="kPa"
                />
                <ResultDisplay 
                  label="Safe Bearing Capacity (qs)" 
                  value={results.safeBearingCapacity} 
                  unit="kPa"
                  highlight 
                />
              </div>
              <p className="text-sm text-gray-500 mt-4">Factor of Safety: {results.factorOfSafety}</p>
            </Card>
          </div>
        );

      case 'settlement':
        return (
          <Card title="Settlement Results">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultDisplay 
                label="Immediate Settlement" 
                value={results.immediateSettlement} 
                unit="mm"
                highlight 
              />
              <ResultDisplay 
                label="Influence Factor" 
                value={results.influenceFactor}
              />
            </div>
          </Card>
        );

      case 'consolidation':
        return (
          <Card title="Consolidation Settlement Results">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultDisplay 
                label="Consolidation Settlement" 
                value={results.consolidationSettlement} 
                unit="mm"
                highlight 
              />
              <ResultDisplay 
                label="Compression Type" 
                value={results.compressionType}
              />
              <ResultDisplay 
                label="OCR" 
                value={results.overConsolidationRatio}
              />
              <ResultDisplay 
                label="Final Effective Stress" 
                value={results.finalEffectiveStress}
                unit="kPa"
              />
            </div>
          </Card>
        );

      case 'earthPressure':
        return (
          <div className="space-y-6">
            <Card title="Earth Pressure Coefficients">
              <div className="grid grid-cols-3 gap-4">
                <ResultDisplay label="Ka (Active)" value={results.coefficients.Ka} />
                <ResultDisplay label="Kp (Passive)" value={results.coefficients.Kp} />
                <ResultDisplay label="K0 (At-rest)" value={results.coefficients.K0} />
              </div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Active Earth Pressure">
                <div className="space-y-3">
                  <ResultDisplay 
                    label="Pressure at Base" 
                    value={results.activePressure.atBase} 
                    unit="kPa"
                  />
                  <ResultDisplay 
                    label="Total Active Thrust (Pa)" 
                    value={results.activePressure.totalThrust} 
                    unit="kN/m"
                    highlight
                  />
                  <ResultDisplay 
                    label="Application Point" 
                    value={results.activePressure.applicationPoint} 
                    unit="m from base"
                  />
                </div>
              </Card>
              
              <Card title="Passive Earth Pressure">
                <div className="space-y-3">
                  <ResultDisplay 
                    label="Pressure at Base" 
                    value={results.passivePressure.atBase} 
                    unit="kPa"
                  />
                  <ResultDisplay 
                    label="Total Passive Thrust (Pp)" 
                    value={results.passivePressure.totalThrust} 
                    unit="kN/m"
                    highlight
                  />
                  <ResultDisplay 
                    label="Application Point" 
                    value={results.passivePressure.applicationPoint} 
                    unit="m from base"
                  />
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
            <Mountain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Geotechnical Engineering</h1>
            <p className="text-gray-600">Bearing Capacity, Settlement & Earth Pressure</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Calculation Type Selection */}
      <Card className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Calculation Type</h3>
        <div className="flex flex-wrap gap-2">
          {calculationTypes.map((calc) => (
            <button
              key={calc.id}
              onClick={() => {
                setActiveCalc(calc.id);
                setResults(null);
              }}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeCalc === calc.id
                  ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }
              `}
            >
              {calc.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Input Parameters */}
      <Card title="Input Parameters" className="mb-6">
        {renderInputs()}
      </Card>

      {/* Results */}
      {results && renderResults()}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button variant="primary" onClick={handleCalculate} icon={Calculator}>
          Calculate
        </Button>
        
        {results && (
          <Button variant="success" onClick={handleExportPDF} icon={FileDown}>
            Export PDF
          </Button>
        )}
      </div>
    </div>
  );
}

export default GeotechPage;
