import React, { useState } from 'react';
import { Car, Calculator } from 'lucide-react';
import { 
  greenshieldsModel, 
  horizontalCurve,
  verticalCurve,
  stoppingSightDistance,
  signalTiming 
} from '../utils/calculators/transport';
import { FormInput, Button, Card, ResultDisplay, Alert } from '../components/ui/FormElements';
import { TrafficFlowChart } from '../components/charts/AnalysisGraph';
import { useTransportStore } from '../store';

const calculationTypes = [
  { id: 'greenshields', label: 'Greenshields Traffic Flow' },
  { id: 'horizontalCurve', label: 'Horizontal Curve Design' },
  { id: 'verticalCurve', label: 'Vertical Curve Design' },
  { id: 'ssd', label: 'Stopping Sight Distance' },
  { id: 'signal', label: 'Signal Timing (Webster)' }
];

function TransportPage() {
  const { 
    greenshields, horizontalCurve: hCurveInputs, verticalCurve: vCurveInputs,
    setGreenshieldsInput, setHorizontalCurveInput, setVerticalCurveInput,
    results, setResults
  } = useTransportStore();

  const [activeCalc, setActiveCalc] = useState('greenshields');
  const [error, setError] = useState(null);
  const [ssdInputs, setSsdInputs] = useState({
    designSpeed: 80,
    perceptionReactionTime: 2.5,
    grade: 0,
    frictionCoefficient: 0.35
  });
  const [signalInputs, setSignalInputs] = useState({
    lostTime: 4,
    criticalFlowRatios: [0.3, 0.25],
    saturationFlow: 1800
  });

  const handleCalculate = () => {
    setError(null);
    
    try {
      let result;
      
      switch (activeCalc) {
        case 'greenshields':
          result = greenshieldsModel(greenshields);
          break;
        case 'horizontalCurve':
          result = horizontalCurve(hCurveInputs);
          break;
        case 'verticalCurve':
          result = verticalCurve(vCurveInputs);
          break;
        case 'ssd':
          result = stoppingSightDistance(ssdInputs);
          break;
        case 'signal':
          result = signalTiming(signalInputs);
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
      case 'greenshields':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Free Flow Speed (Vf)"
              name="freeFlowSpeed"
              value={greenshields.freeFlowSpeed}
              onChange={(e) => setGreenshieldsInput('freeFlowSpeed', parseFloat(e.target.value) || 0)}
              unit="km/hr"
            />
            <FormInput
              label="Jam Density (kj)"
              name="jamDensity"
              value={greenshields.jamDensity}
              onChange={(e) => setGreenshieldsInput('jamDensity', parseFloat(e.target.value) || 0)}
              unit="veh/km"
            />
            <FormInput
              label="Current Density (k)"
              name="currentDensity"
              value={greenshields.currentDensity}
              onChange={(e) => setGreenshieldsInput('currentDensity', parseFloat(e.target.value) || 0)}
              unit="veh/km"
              helpText="Optional: for current conditions"
            />
          </div>
        );

      case 'horizontalCurve':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Radius (R)"
              name="radius"
              value={hCurveInputs.radius}
              onChange={(e) => setHorizontalCurveInput('radius', parseFloat(e.target.value) || 0)}
              unit="m"
            />
            <FormInput
              label="Deflection Angle (Δ)"
              name="deflectionAngle"
              value={hCurveInputs.deflectionAngle}
              onChange={(e) => setHorizontalCurveInput('deflectionAngle', parseFloat(e.target.value) || 0)}
              unit="degrees"
            />
            <FormInput
              label="Design Speed"
              name="designSpeed"
              value={hCurveInputs.designSpeed}
              onChange={(e) => setHorizontalCurveInput('designSpeed', parseFloat(e.target.value) || 0)}
              unit="km/hr"
            />
            <FormInput
              label="Superelevation (e)"
              name="superelevation"
              value={hCurveInputs.superelevation}
              onChange={(e) => setHorizontalCurveInput('superelevation', parseFloat(e.target.value) || 0)}
              step="0.01"
              helpText="Decimal (e.g., 0.06 for 6%)"
            />
          </div>
        );

      case 'verticalCurve':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Grade 1 (g1)"
              name="grade1"
              value={vCurveInputs.grade1}
              onChange={(e) => setVerticalCurveInput('grade1', parseFloat(e.target.value) || 0)}
              unit="%"
              helpText="Positive for uphill"
            />
            <FormInput
              label="Grade 2 (g2)"
              name="grade2"
              value={vCurveInputs.grade2}
              onChange={(e) => setVerticalCurveInput('grade2', parseFloat(e.target.value) || 0)}
              unit="%"
            />
            <FormInput
              label="Curve Length (L)"
              name="curveLength"
              value={vCurveInputs.curveLength}
              onChange={(e) => setVerticalCurveInput('curveLength', parseFloat(e.target.value) || 0)}
              unit="m"
            />
            <FormInput
              label="Design Speed"
              name="designSpeed"
              value={vCurveInputs.designSpeed}
              onChange={(e) => setVerticalCurveInput('designSpeed', parseFloat(e.target.value) || 0)}
              unit="km/hr"
            />
          </div>
        );

      case 'ssd':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              label="Design Speed"
              name="designSpeed"
              value={ssdInputs.designSpeed}
              onChange={(e) => setSsdInputs({ ...ssdInputs, designSpeed: parseFloat(e.target.value) || 0 })}
              unit="km/hr"
            />
            <FormInput
              label="Perception-Reaction Time"
              name="perceptionReactionTime"
              value={ssdInputs.perceptionReactionTime}
              onChange={(e) => setSsdInputs({ ...ssdInputs, perceptionReactionTime: parseFloat(e.target.value) || 0 })}
              unit="seconds"
            />
            <FormInput
              label="Grade"
              name="grade"
              value={ssdInputs.grade}
              onChange={(e) => setSsdInputs({ ...ssdInputs, grade: parseFloat(e.target.value) || 0 })}
              unit="%"
              helpText="Positive for uphill"
            />
            <FormInput
              label="Friction Coefficient"
              name="frictionCoefficient"
              value={ssdInputs.frictionCoefficient}
              onChange={(e) => setSsdInputs({ ...ssdInputs, frictionCoefficient: parseFloat(e.target.value) || 0 })}
              step="0.01"
            />
          </div>
        );

      case 'signal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Total Lost Time"
                name="lostTime"
                value={signalInputs.lostTime}
                onChange={(e) => setSignalInputs({ ...signalInputs, lostTime: parseFloat(e.target.value) || 0 })}
                unit="seconds"
              />
              <FormInput
                label="Saturation Flow"
                name="saturationFlow"
                value={signalInputs.saturationFlow}
                onChange={(e) => setSignalInputs({ ...signalInputs, saturationFlow: parseFloat(e.target.value) || 0 })}
                unit="veh/hr/lane"
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Critical Flow Ratios (y) per Phase</h4>
              <div className="flex flex-wrap gap-4">
                {signalInputs.criticalFlowRatios.map((ratio, index) => (
                  <FormInput
                    key={index}
                    label={`Phase ${index + 1}`}
                    name={`ratio_${index}`}
                    value={ratio}
                    onChange={(e) => {
                      const newRatios = [...signalInputs.criticalFlowRatios];
                      newRatios[index] = parseFloat(e.target.value) || 0;
                      setSignalInputs({ ...signalInputs, criticalFlowRatios: newRatios });
                    }}
                    step="0.01"
                    className="w-24"
                  />
                ))}
                <button
                  onClick={() => setSignalInputs({ 
                    ...signalInputs, 
                    criticalFlowRatios: [...signalInputs.criticalFlowRatios, 0.2] 
                  })}
                  className="px-3 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                >
                  + Add Phase
                </button>
              </div>
            </div>
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
      case 'greenshields':
        return (
          <div className="space-y-6">
            <Card title="Fundamental Parameters">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <ResultDisplay label="Free Flow Speed" value={results.fundamentalParameters.freeFlowSpeed} unit="km/hr" />
                <ResultDisplay label="Jam Density" value={results.fundamentalParameters.jamDensity} unit="veh/km" />
                <ResultDisplay label="Capacity (Qmax)" value={results.fundamentalParameters.capacity} unit="veh/hr" highlight />
                <ResultDisplay label="Critical Density" value={results.fundamentalParameters.criticalDensity} unit="veh/km" />
                <ResultDisplay label="Critical Speed" value={results.fundamentalParameters.criticalSpeed} unit="km/hr" />
              </div>
            </Card>
            
            {results.currentConditions && (
              <Card title="Current Conditions">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <ResultDisplay label="Density" value={results.currentConditions.density} unit="veh/km" />
                  <ResultDisplay label="Speed" value={results.currentConditions.speed} unit="km/hr" />
                  <ResultDisplay label="Flow" value={results.currentConditions.flow} unit="veh/hr" />
                  <ResultDisplay label="Level of Service" value={results.currentConditions.levelOfService} highlight />
                </div>
              </Card>
            )}
            
            <Card title="Traffic Flow Diagrams">
              <TrafficFlowChart 
                curveData={results.curveData}
                currentPoint={results.currentConditions}
              />
            </Card>
          </div>
        );

      case 'horizontalCurve':
        return (
          <div className="space-y-6">
            <Card title="Curve Elements">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ResultDisplay label="Tangent Length (T)" value={results.curveElements.tangentLength} unit="m" />
                <ResultDisplay label="Curve Length (L)" value={results.curveElements.curveLength} unit="m" highlight />
                <ResultDisplay label="External Distance (E)" value={results.curveElements.externalDistance} unit="m" />
                <ResultDisplay label="Middle Ordinate (M)" value={results.curveElements.middleOrdinate} unit="m" />
                <ResultDisplay label="Long Chord (C)" value={results.curveElements.longChord} unit="m" />
                <ResultDisplay label="Degree of Curve (D)" value={results.curveElements.degreeOfCurve} unit="°" />
              </div>
            </Card>
            
            <Card title="Design Check">
              <div className="grid grid-cols-2 gap-4">
                <ResultDisplay label="Max Safe Speed" value={results.designCheck.maxSafeSpeed} unit="km/hr" />
                <div className={`p-4 rounded-lg ${results.designCheck.isAdequate ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-sm font-medium ${results.designCheck.isAdequate ? 'text-green-700' : 'text-red-700'}`}>
                    {results.designCheck.isAdequate ? '✓ Design is Adequate' : '✗ Design Speed Exceeds Safe Limit'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'verticalCurve':
        return (
          <div className="space-y-6">
            <Card title="Curve Properties">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ResultDisplay label="Curve Type" value={results.curveType} />
                <ResultDisplay label="Algebraic Diff (A)" value={`${results.algebraicDifference}%`} />
                <ResultDisplay label="K-Value" value={results.kValue} unit="m/%" />
                <div className={`p-4 rounded-lg ${results.isLengthAdequate ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <p className={`text-sm font-medium ${results.isLengthAdequate ? 'text-green-700' : 'text-yellow-700'}`}>
                    {results.isLengthAdequate ? '✓ Length Adequate' : '⚠ Consider Increasing Length'}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card title="Key Stations">
              <div className="grid grid-cols-3 gap-4">
                <ResultDisplay label="PVC Station" value={results.keyStations.PVC.station} unit="m" />
                <ResultDisplay label="PVI Station" value={results.keyStations.PVI.station} unit="m" />
                <ResultDisplay label="PVT Station" value={results.keyStations.PVT.station} unit="m" />
              </div>
            </Card>
            
            {results.highLowPoint && (
              <Card title="High/Low Point">
                <div className="grid grid-cols-2 gap-4">
                  <ResultDisplay label="Station" value={results.highLowPoint.station} unit="m" />
                  <ResultDisplay label="Elevation" value={results.highLowPoint.elevation} unit="m" />
                </div>
              </Card>
            )}
            
            <Card title="Minimum Length Requirements">
              <div className="grid grid-cols-2 gap-4">
                <ResultDisplay label="Comfort Criterion" value={results.minimumLength.comfort} unit="m" />
                <ResultDisplay label="Sight Distance Criterion" value={results.minimumLength.sightDistance} unit="m" />
              </div>
            </Card>
          </div>
        );

      case 'ssd':
        return (
          <Card title="Stopping Sight Distance">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultDisplay label="Speed" value={results.speedMS} unit="m/s" />
              <ResultDisplay label="Perception-Reaction Distance" value={results.perceptionReactionDistance} unit="m" />
              <ResultDisplay label="Braking Distance" value={results.brakingDistance} unit="m" />
              <ResultDisplay label="Total SSD" value={results.stoppingSightDistance} unit="m" highlight />
            </div>
          </Card>
        );

      case 'signal':
        return (
          <div className="space-y-6">
            <Card title="Cycle Length">
              <div className="grid grid-cols-3 gap-4">
                <ResultDisplay label="Optimum Cycle (Co)" value={results.optimumCycleLength} unit="sec" highlight />
                <ResultDisplay label="Minimum Cycle" value={results.minimumCycleLength} unit="sec" />
                <ResultDisplay label="Maximum Cycle" value={results.maximumCycleLength} unit="sec" />
              </div>
            </Card>
            
            <Card title="Phase Timing">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Phase</th>
                      <th>Flow Ratio (y)</th>
                      <th>Green Time</th>
                      <th>Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.phases.map((phase) => (
                      <tr key={phase.phase}>
                        <td className="font-medium">Phase {phase.phase}</td>
                        <td>{phase.flowRatio}</td>
                        <td>{phase.greenTime} sec</td>
                        <td>{phase.capacity} veh/hr</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Total Flow Ratio (Y): {results.totalFlowRatio} | 
                Effective Green Time: {results.effectiveGreenTime} sec
              </p>
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
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transportation Engineering</h1>
            <p className="text-gray-600">Traffic Flow & Highway Design</p>
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
                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
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

export default TransportPage;
