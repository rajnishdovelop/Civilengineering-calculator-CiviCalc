import React, { useState } from 'react';
import { Trees, Calculator } from 'lucide-react';
import { 
  bodKinetics, 
  oxygenSagCurve,
  sedimentationDesign,
  activatedSludgeDesign,
  gaussianPlume 
} from '../utils/calculators/environmental';
import { FormInput, FormSelect, Button, Card, ResultDisplay, Alert } from '../components/ui/FormElements';
import { BODChart, OxygenSagChart, GaussianPlumeChart } from '../components/charts/AnalysisGraph';

const calculationTypes = [
  { id: 'bod', label: 'BOD Kinetics' },
  { id: 'oxygenSag', label: 'Oxygen Sag Curve' },
  { id: 'sedimentation', label: 'Sedimentation Tank Design' },
  { id: 'activatedSludge', label: 'Activated Sludge Design' },
  { id: 'gaussianPlume', label: 'Gaussian Plume Model' }
];

const stabilityClasses = [
  { value: 'A', label: 'A - Very Unstable' },
  { value: 'B', label: 'B - Moderately Unstable' },
  { value: 'C', label: 'C - Slightly Unstable' },
  { value: 'D', label: 'D - Neutral' },
  { value: 'E', label: 'E - Slightly Stable' },
  { value: 'F', label: 'F - Stable' }
];

function EnvironmentalPage() {
  const [activeCalc, setActiveCalc] = useState('bod');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // BOD inputs
  const [bodInputs, setBodInputs] = useState({
    ultimateBOD: 300,
    reactionRate: 0.23,
    temperature: 20,
    time: 5
  });

  // Oxygen Sag inputs
  const [oxygenInputs, setOxygenInputs] = useState({
    initialDeficit: 2,
    ultimateBOD: 50,
    deoxygenationRate: 0.23,
    reaerationRate: 0.46,
    streamVelocity: 0.5,
    saturationDO: 9.2
  });

  // Sedimentation inputs
  const [sedInputs, setSedInputs] = useState({
    flowRate: 10000,
    overflowRate: 30,
    detentionTime: 2,
    lengthWidthRatio: 4
  });

  // Activated Sludge inputs
  const [asInputs, setAsInputs] = useState({
    flowRate: 10000,
    influentBOD: 250,
    effluentBOD: 20,
    mlss: 3000,
    srt: 10
  });

  // Gaussian Plume inputs
  const [plumeInputs, setPlumeInputs] = useState({
    emissionRate: 100,
    stackHeight: 50,
    windSpeed: 5,
    stabilityClass: 'D',
    downwindDistance: 1000
  });

  const handleCalculate = () => {
    setError(null);
    
    try {
      let result;
      
      switch (activeCalc) {
        case 'bod':
          result = bodKinetics(bodInputs);
          break;
        case 'oxygenSag':
          result = oxygenSagCurve(oxygenInputs);
          break;
        case 'sedimentation':
          result = sedimentationDesign(sedInputs);
          break;
        case 'activatedSludge':
          result = activatedSludgeDesign(asInputs);
          break;
        case 'gaussianPlume':
          result = gaussianPlume(plumeInputs);
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
      case 'bod':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              label="Ultimate BOD (BODu)"
              name="ultimateBOD"
              value={bodInputs.ultimateBOD}
              onChange={(e) => setBodInputs({ ...bodInputs, ultimateBOD: parseFloat(e.target.value) || 0 })}
              unit="mg/L"
            />
            <FormInput
              label="Reaction Rate (k)"
              name="reactionRate"
              value={bodInputs.reactionRate}
              onChange={(e) => setBodInputs({ ...bodInputs, reactionRate: parseFloat(e.target.value) || 0 })}
              unit="per day"
              step="0.01"
              helpText="At 20°C"
            />
            <FormInput
              label="Temperature"
              name="temperature"
              value={bodInputs.temperature}
              onChange={(e) => setBodInputs({ ...bodInputs, temperature: parseFloat(e.target.value) || 0 })}
              unit="°C"
            />
            <FormInput
              label="Time"
              name="time"
              value={bodInputs.time}
              onChange={(e) => setBodInputs({ ...bodInputs, time: parseFloat(e.target.value) || 0 })}
              unit="days"
            />
          </div>
        );

      case 'oxygenSag':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Initial DO Deficit (D0)"
              name="initialDeficit"
              value={oxygenInputs.initialDeficit}
              onChange={(e) => setOxygenInputs({ ...oxygenInputs, initialDeficit: parseFloat(e.target.value) || 0 })}
              unit="mg/L"
            />
            <FormInput
              label="Ultimate BOD (L0)"
              name="ultimateBOD"
              value={oxygenInputs.ultimateBOD}
              onChange={(e) => setOxygenInputs({ ...oxygenInputs, ultimateBOD: parseFloat(e.target.value) || 0 })}
              unit="mg/L"
            />
            <FormInput
              label="Deoxygenation Rate (kd)"
              name="deoxygenationRate"
              value={oxygenInputs.deoxygenationRate}
              onChange={(e) => setOxygenInputs({ ...oxygenInputs, deoxygenationRate: parseFloat(e.target.value) || 0 })}
              unit="per day"
              step="0.01"
            />
            <FormInput
              label="Reaeration Rate (kr)"
              name="reaerationRate"
              value={oxygenInputs.reaerationRate}
              onChange={(e) => setOxygenInputs({ ...oxygenInputs, reaerationRate: parseFloat(e.target.value) || 0 })}
              unit="per day"
              step="0.01"
            />
            <FormInput
              label="Stream Velocity"
              name="streamVelocity"
              value={oxygenInputs.streamVelocity}
              onChange={(e) => setOxygenInputs({ ...oxygenInputs, streamVelocity: parseFloat(e.target.value) || 0 })}
              unit="m/s"
            />
            <FormInput
              label="Saturation DO"
              name="saturationDO"
              value={oxygenInputs.saturationDO}
              onChange={(e) => setOxygenInputs({ ...oxygenInputs, saturationDO: parseFloat(e.target.value) || 0 })}
              unit="mg/L"
            />
          </div>
        );

      case 'sedimentation':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              label="Flow Rate (Q)"
              name="flowRate"
              value={sedInputs.flowRate}
              onChange={(e) => setSedInputs({ ...sedInputs, flowRate: parseFloat(e.target.value) || 0 })}
              unit="m³/day"
            />
            <FormInput
              label="Overflow Rate (SOR)"
              name="overflowRate"
              value={sedInputs.overflowRate}
              onChange={(e) => setSedInputs({ ...sedInputs, overflowRate: parseFloat(e.target.value) || 0 })}
              unit="m³/m²/day"
            />
            <FormInput
              label="Detention Time"
              name="detentionTime"
              value={sedInputs.detentionTime}
              onChange={(e) => setSedInputs({ ...sedInputs, detentionTime: parseFloat(e.target.value) || 0 })}
              unit="hours"
            />
            <FormInput
              label="Length/Width Ratio"
              name="lengthWidthRatio"
              value={sedInputs.lengthWidthRatio}
              onChange={(e) => setSedInputs({ ...sedInputs, lengthWidthRatio: parseFloat(e.target.value) || 0 })}
            />
          </div>
        );

      case 'activatedSludge':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Flow Rate (Q)"
              name="flowRate"
              value={asInputs.flowRate}
              onChange={(e) => setAsInputs({ ...asInputs, flowRate: parseFloat(e.target.value) || 0 })}
              unit="m³/day"
            />
            <FormInput
              label="Influent BOD (S0)"
              name="influentBOD"
              value={asInputs.influentBOD}
              onChange={(e) => setAsInputs({ ...asInputs, influentBOD: parseFloat(e.target.value) || 0 })}
              unit="mg/L"
            />
            <FormInput
              label="Effluent BOD (Se)"
              name="effluentBOD"
              value={asInputs.effluentBOD}
              onChange={(e) => setAsInputs({ ...asInputs, effluentBOD: parseFloat(e.target.value) || 0 })}
              unit="mg/L"
            />
            <FormInput
              label="MLSS (X)"
              name="mlss"
              value={asInputs.mlss}
              onChange={(e) => setAsInputs({ ...asInputs, mlss: parseFloat(e.target.value) || 0 })}
              unit="mg/L"
            />
            <FormInput
              label="Sludge Retention Time"
              name="srt"
              value={asInputs.srt}
              onChange={(e) => setAsInputs({ ...asInputs, srt: parseFloat(e.target.value) || 0 })}
              unit="days"
            />
          </div>
        );

      case 'gaussianPlume':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Emission Rate (Q)"
              name="emissionRate"
              value={plumeInputs.emissionRate}
              onChange={(e) => setPlumeInputs({ ...plumeInputs, emissionRate: parseFloat(e.target.value) || 0 })}
              unit="g/s"
            />
            <FormInput
              label="Stack Height (H)"
              name="stackHeight"
              value={plumeInputs.stackHeight}
              onChange={(e) => setPlumeInputs({ ...plumeInputs, stackHeight: parseFloat(e.target.value) || 0 })}
              unit="m"
            />
            <FormInput
              label="Wind Speed (u)"
              name="windSpeed"
              value={plumeInputs.windSpeed}
              onChange={(e) => setPlumeInputs({ ...plumeInputs, windSpeed: parseFloat(e.target.value) || 0 })}
              unit="m/s"
            />
            <FormSelect
              label="Stability Class"
              name="stabilityClass"
              value={plumeInputs.stabilityClass}
              onChange={(e) => setPlumeInputs({ ...plumeInputs, stabilityClass: e.target.value })}
              options={stabilityClasses}
            />
            <FormInput
              label="Downwind Distance (x)"
              name="downwindDistance"
              value={plumeInputs.downwindDistance}
              onChange={(e) => setPlumeInputs({ ...plumeInputs, downwindDistance: parseFloat(e.target.value) || 0 })}
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

    switch (activeCalc) {
      case 'bod':
        return (
          <div className="space-y-6">
            <Card title="BOD Analysis Results">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ResultDisplay label="BOD Exerted" value={results.bodExerted} unit="mg/L" highlight />
                <ResultDisplay label="BOD Remaining" value={results.bodRemaining} unit="mg/L" />
                <ResultDisplay label="Rate at T°C" value={results.rateConstant} unit="per day" />
                <ResultDisplay label="BOD5" value={results.bod5} unit="mg/L" />
              </div>
            </Card>
            
            <Card title="BOD Kinetics Curve">
              <BODChart curveData={results.curveData} />
            </Card>
          </div>
        );

      case 'oxygenSag':
        return (
          <div className="space-y-6">
            <Card title="Critical Point">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ResultDisplay label="Time to Critical" value={results.criticalPoint.time} unit="days" />
                <ResultDisplay label="Distance to Critical" value={results.criticalPoint.distance} unit="km" highlight />
                <ResultDisplay label="Maximum Deficit" value={results.criticalPoint.deficit} unit="mg/L" />
                <ResultDisplay label="Minimum DO" value={results.criticalPoint.minimumDO} unit="mg/L" highlight />
              </div>
            </Card>
            
            <Card title="Oxygen Sag Curve">
              <OxygenSagChart curveData={results.curveData} />
            </Card>
          </div>
        );

      case 'sedimentation':
        return (
          <div className="space-y-6">
            <Card title="Tank Dimensions">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <ResultDisplay label="Length" value={results.designedDimensions.length} unit="m" />
                <ResultDisplay label="Width" value={results.designedDimensions.width} unit="m" />
                <ResultDisplay label="Depth" value={results.designedDimensions.depth} unit="m" />
                <ResultDisplay label="Surface Area" value={results.designedDimensions.surfaceArea} unit="m²" />
                <ResultDisplay label="Volume" value={results.designedDimensions.volume} unit="m³" highlight />
              </div>
            </Card>
            
            <Card title="Hydraulic Parameters">
              <div className="grid grid-cols-3 gap-4">
                <ResultDisplay label="Overflow Rate" value={results.hydraulicParameters.overflowRate} unit="m³/m²/day" />
                <ResultDisplay label="Detention Time" value={results.hydraulicParameters.detentionTime} unit="hours" />
                <ResultDisplay label="Weir Loading" value={results.hydraulicParameters.weirLoading} unit="m³/m/day" />
              </div>
            </Card>
          </div>
        );

      case 'activatedSludge':
        return (
          <Card title="Activated Sludge Design Results">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ResultDisplay label="Tank Volume" value={results.tankVolume} unit="m³" highlight />
              <ResultDisplay label="HRT" value={results.hydraulicRetentionTime} unit="hours" />
              <ResultDisplay label="Sludge Production" value={results.sludgeProduction} unit="kg/day" />
              <ResultDisplay label="F/M Ratio" value={results.fmRatio} unit="per day" />
              <ResultDisplay label="Removal Efficiency" value={results.removalEfficiency} unit="%" highlight />
              <ResultDisplay label="O2 Requirement" value={results.oxygenRequirement} unit="kg/day" />
            </div>
          </Card>
        );

      case 'gaussianPlume':
        return (
          <div className="space-y-6">
            <Card title="Ground Level Concentration">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ResultDisplay 
                  label="Concentration at Point" 
                  value={results.concentration} 
                  unit="μg/m³" 
                  highlight 
                />
                <ResultDisplay label="σy" value={results.dispersionCoefficients.sigmaY} unit="m" />
                <ResultDisplay label="σz" value={results.dispersionCoefficients.sigmaZ} unit="m" />
                <ResultDisplay 
                  label="Max Concentration" 
                  value={results.maximumConcentration.value} 
                  unit="μg/m³" 
                />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Maximum concentration occurs at approximately {results.maximumConcentration.distance} m downwind
              </p>
            </Card>
            
            <Card title="Concentration Profile">
              <GaussianPlumeChart profileData={results.profileData} />
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
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
            <Trees className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Environmental Engineering</h1>
            <p className="text-gray-600">Water Treatment, Wastewater & Air Pollution</p>
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
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
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

export default EnvironmentalPage;
