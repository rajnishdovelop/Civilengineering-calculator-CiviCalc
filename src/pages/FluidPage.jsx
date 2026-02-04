import React, { useState } from 'react';
import { Droplets, Calculator, FileDown } from 'lucide-react';
import { 
  manningEquation, 
  normalDepth,
  criticalDepth,
  specificEnergyCurve,
  darcyWeisbach,
  hydraulicJump 
} from '../utils/calculators/fluid';
import { FormInput, FormSelect, Button, Card, ResultDisplay, Alert } from '../components/ui/FormElements';
import { SpecificEnergyChart } from '../components/charts/AnalysisGraph';
import { useFluidStore } from '../store';

const calculationTypes = [
  { id: 'manning', label: 'Manning\'s Equation' },
  { id: 'normalDepth', label: 'Normal Depth' },
  { id: 'criticalDepth', label: 'Critical Depth' },
  { id: 'specificEnergy', label: 'Specific Energy Curve' },
  { id: 'darcyWeisbach', label: 'Darcy-Weisbach (Pipe Flow)' },
  { id: 'hydraulicJump', label: 'Hydraulic Jump' }
];

const channelTypes = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'trapezoidal', label: 'Trapezoidal' },
  { value: 'triangular', label: 'Triangular' },
  { value: 'circular', label: 'Circular' }
];

function FluidPage() {
  const { 
    manning, pipeFlow,
    setManningInput, setPipeFlowInput,
    results, setResults
  } = useFluidStore();

  const [activeCalc, setActiveCalc] = useState('manning');
  const [error, setError] = useState(null);
  const [jumpInputs, setJumpInputs] = useState({
    upstreamDepth: 0.5,
    discharge: 10,
    channelWidth: 3
  });

  const handleCalculate = () => {
    setError(null);
    
    try {
      let result;
      
      switch (activeCalc) {
        case 'manning':
          result = manningEquation(manning);
          break;
        case 'normalDepth':
          result = normalDepth({
            discharge: 10,
            ...manning
          });
          break;
        case 'criticalDepth':
          result = criticalDepth({
            discharge: 10,
            channelType: manning.channelType,
            bottomWidth: manning.bottomWidth,
            sideSlope: manning.sideSlope
          });
          break;
        case 'specificEnergy':
          result = specificEnergyCurve({
            discharge: 10,
            bottomWidth: manning.bottomWidth,
            maxDepth: 5
          });
          break;
        case 'darcyWeisbach':
          result = darcyWeisbach(pipeFlow);
          break;
        case 'hydraulicJump':
          result = hydraulicJump(jumpInputs);
          break;
        default:
          throw new Error('Unknown calculation type');
      }
      
      setResults(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderInputs = () => {
    switch (activeCalc) {
      case 'manning':
      case 'normalDepth':
      case 'criticalDepth':
      case 'specificEnergy':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormSelect
              label="Channel Type"
              name="channelType"
              value={manning.channelType}
              onChange={(e) => setManningInput('channelType', e.target.value)}
              options={channelTypes}
            />
            <FormInput
              label="Manning's n"
              name="manningN"
              value={manning.manningN}
              onChange={(e) => setManningInput('manningN', parseFloat(e.target.value) || 0)}
              step="0.001"
              helpText="Concrete: 0.013, Earth: 0.025"
            />
            <FormInput
              label="Bed Slope (S)"
              name="slope"
              value={manning.slope}
              onChange={(e) => setManningInput('slope', parseFloat(e.target.value) || 0)}
              step="0.0001"
            />
            <FormInput
              label="Bottom Width (b)"
              name="bottomWidth"
              value={manning.bottomWidth}
              onChange={(e) => setManningInput('bottomWidth', parseFloat(e.target.value) || 0)}
              unit="m"
            />
            {activeCalc === 'manning' && (
              <FormInput
                label="Flow Depth (y)"
                name="flowDepth"
                value={manning.flowDepth}
                onChange={(e) => setManningInput('flowDepth', parseFloat(e.target.value) || 0)}
                unit="m"
              />
            )}
            {manning.channelType === 'trapezoidal' && (
              <FormInput
                label="Side Slope (z:1)"
                name="sideSlope"
                value={manning.sideSlope}
                onChange={(e) => setManningInput('sideSlope', parseFloat(e.target.value) || 0)}
                helpText="Horizontal:Vertical"
              />
            )}
          </div>
        );

      case 'darcyWeisbach':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Pipe Diameter"
              name="pipeDiameter"
              value={pipeFlow.pipeDiameter}
              onChange={(e) => setPipeFlowInput('pipeDiameter', parseFloat(e.target.value) || 0)}
              unit="m"
            />
            <FormInput
              label="Pipe Length"
              name="pipeLength"
              value={pipeFlow.pipeLength}
              onChange={(e) => setPipeFlowInput('pipeLength', parseFloat(e.target.value) || 0)}
              unit="m"
            />
            <FormInput
              label="Flow Velocity"
              name="flowVelocity"
              value={pipeFlow.flowVelocity}
              onChange={(e) => setPipeFlowInput('flowVelocity', parseFloat(e.target.value) || 0)}
              unit="m/s"
            />
            <FormInput
              label="Roughness (ε)"
              name="roughness"
              value={pipeFlow.roughness}
              onChange={(e) => setPipeFlowInput('roughness', parseFloat(e.target.value) || 0)}
              unit="mm"
              step="0.0001"
            />
          </div>
        );

      case 'hydraulicJump':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Upstream Depth (y1)"
              name="upstreamDepth"
              value={jumpInputs.upstreamDepth}
              onChange={(e) => setJumpInputs({ ...jumpInputs, upstreamDepth: parseFloat(e.target.value) || 0 })}
              unit="m"
            />
            <FormInput
              label="Discharge (Q)"
              name="discharge"
              value={jumpInputs.discharge}
              onChange={(e) => setJumpInputs({ ...jumpInputs, discharge: parseFloat(e.target.value) || 0 })}
              unit="m³/s"
            />
            <FormInput
              label="Channel Width (b)"
              name="channelWidth"
              value={jumpInputs.channelWidth}
              onChange={(e) => setJumpInputs({ ...jumpInputs, channelWidth: parseFloat(e.target.value) || 0 })}
              unit="m"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!results) return null;
    
    if (results.error) {
      return <Alert type="error" message={results.error} />;
    }

    switch (activeCalc) {
      case 'manning':
        return (
          <div className="space-y-6">
            <Card title="Geometric Properties">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ResultDisplay label="Area (A)" value={results.area} unit="m²" />
                <ResultDisplay label="Wetted Perimeter (P)" value={results.wettedPerimeter} unit="m" />
                <ResultDisplay label="Hydraulic Radius (R)" value={results.hydraulicRadius} unit="m" />
                <ResultDisplay label="Top Width (T)" value={results.topWidth} unit="m" />
              </div>
            </Card>
            
            <Card title="Flow Parameters">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ResultDisplay label="Velocity (V)" value={results.velocity} unit="m/s" highlight />
                <ResultDisplay label="Discharge (Q)" value={results.discharge} unit="m³/s" highlight />
                <ResultDisplay label="Froude Number" value={results.froudeNumber} />
                <ResultDisplay 
                  label="Flow Regime" 
                  value={results.flowRegime}
                />
              </div>
            </Card>
          </div>
        );

      case 'normalDepth':
        return (
          <Card title="Normal Depth Results">
            <div className="grid grid-cols-2 gap-4">
              <ResultDisplay label="Normal Depth (yn)" value={results.normalDepth} unit="m" highlight />
              <ResultDisplay 
                label="Converged" 
                value={results.converged ? 'Yes' : 'No'}
              />
            </div>
          </Card>
        );

      case 'criticalDepth':
        return (
          <Card title="Critical Flow Conditions">
            <div className="grid grid-cols-3 gap-4">
              <ResultDisplay label="Critical Depth (yc)" value={results.criticalDepth} unit="m" highlight />
              <ResultDisplay label="Critical Velocity (Vc)" value={results.criticalVelocity} unit="m/s" />
              <ResultDisplay label="Critical Energy (Ec)" value={results.criticalEnergy} unit="m" />
            </div>
          </Card>
        );

      case 'specificEnergy':
        return (
          <div className="space-y-6">
            <Card title="Critical Point">
              <div className="grid grid-cols-2 gap-4">
                <ResultDisplay label="Critical Depth (yc)" value={results.criticalDepth} unit="m" highlight />
                <ResultDisplay label="Minimum Energy (Emin)" value={results.minimumEnergy} unit="m" highlight />
              </div>
            </Card>
            <Card title="Specific Energy Curve">
              <SpecificEnergyChart 
                depths={results.depths}
                energies={results.energies}
                criticalDepth={results.criticalDepth}
                minEnergy={results.minimumEnergy}
              />
            </Card>
          </div>
        );

      case 'darcyWeisbach':
        return (
          <Card title="Pipe Flow Results">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultDisplay label="Reynolds Number" value={results.reynoldsNumber} />
              <ResultDisplay label="Friction Factor (f)" value={results.frictionFactor} />
              <ResultDisplay label="Head Loss (hf)" value={results.headLoss} unit="m" highlight />
              <ResultDisplay label="Discharge (Q)" value={results.discharge} unit="m³/s" />
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <strong>Flow Regime:</strong>{' '}
                <span className={
                  results.flowRegime === 'Laminar' ? 'text-green-600' :
                  results.flowRegime === 'Turbulent' ? 'text-red-600' : 'text-yellow-600'
                }>
                  {results.flowRegime}
                </span>
              </p>
            </div>
          </Card>
        );

      case 'hydraulicJump':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Upstream Conditions">
                <div className="space-y-3">
                  <ResultDisplay label="Depth (y1)" value={results.upstream.depth} unit="m" />
                  <ResultDisplay label="Velocity (V1)" value={results.upstream.velocity} unit="m/s" />
                  <ResultDisplay label="Froude Number (Fr1)" value={results.upstream.froude} highlight />
                  <ResultDisplay label="Specific Energy (E1)" value={results.upstream.specificEnergy} unit="m" />
                </div>
              </Card>
              
              <Card title="Downstream Conditions">
                <div className="space-y-3">
                  <ResultDisplay label="Sequent Depth (y2)" value={results.downstream.depth} unit="m" highlight />
                  <ResultDisplay label="Velocity (V2)" value={results.downstream.velocity} unit="m/s" />
                  <ResultDisplay label="Froude Number (Fr2)" value={results.downstream.froude} />
                  <ResultDisplay label="Specific Energy (E2)" value={results.downstream.specificEnergy} unit="m" />
                </div>
              </Card>
            </div>
            
            <Card title="Jump Characteristics">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ResultDisplay label="Depth Ratio (y2/y1)" value={results.depthRatio} />
                <ResultDisplay label="Energy Loss" value={results.energyLoss} unit="m" />
                <ResultDisplay label="Relative Loss" value={`${results.relativeEnergyLoss}%`} />
                <ResultDisplay label="Jump Length" value={results.jumpLength} unit="m" />
              </div>
              <div className="mt-4 p-3 bg-cyan-50 rounded-lg">
                <p className="text-sm font-medium text-cyan-800">
                  Jump Type: {results.jumpType}
                </p>
              </div>
            </Card>
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
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-lg flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fluid Mechanics</h1>
            <p className="text-gray-600">Open Channel & Pipe Flow Analysis</p>
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
                  ? 'bg-cyan-100 text-cyan-800 border-2 border-cyan-300'
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
      {renderResults()}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button variant="primary" onClick={handleCalculate} icon={Calculator}>
          Calculate
        </Button>
      </div>
    </div>
  );
}

export default FluidPage;
