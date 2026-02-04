import React, { useState } from 'react';
import { Compass, Calculator } from 'lucide-react';
import { 
  levelingRiseFall, 
  traverseComputation,
  areaCoordinateMethod,
  simpleCurve 
} from '../utils/calculators/surveying';
import { FormInput, FormSelect, Button, Card, ResultDisplay, Alert } from '../components/ui/FormElements';

const calculationTypes = [
  { id: 'leveling', label: 'Leveling (Rise/Fall Method)' },
  { id: 'traverse', label: 'Traverse Computation' },
  { id: 'area', label: 'Area Calculation' },
  { id: 'curveSetting', label: 'Curve Setting Out' }
];

function SurveyingPage() {
  const [activeCalc, setActiveCalc] = useState('leveling');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Leveling inputs
  const [levelingInputs, setLevelingInputs] = useState({
    benchmarkRL: 100.000,
    readings: [
      { station: 'BM', BS: 1.234, FS: null },
      { station: 'TP1', BS: 1.567, FS: 1.321 },
      { station: 'TP2', BS: 1.890, FS: 1.456 },
      { station: 'CP', BS: null, FS: 1.789 }
    ]
  });

  // Traverse inputs
  const [traverseInputs, setTraverseInputs] = useState({
    startingCoordinates: { easting: 1000, northing: 1000 },
    startingBearing: 45,
    legs: [
      { bearing: 45, distance: 100 },
      { bearing: 135, distance: 80 },
      { bearing: 225, distance: 100 },
      { bearing: 315, distance: 80 }
    ]
  });

  // Area inputs  
  const [areaInputs, setAreaInputs] = useState({
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 80 },
      { x: 50, y: 100 },
      { x: 0, y: 80 }
    ]
  });

  // Curve setting inputs
  const [curveInputs, setCurveInputs] = useState({
    radius: 200,
    deflectionAngle: 60,
    chainage_PI: 1000,
    pegInterval: 20
  });

  const handleCalculate = () => {
    setError(null);
    
    try {
      let result;
      
      switch (activeCalc) {
        case 'leveling':
          result = levelingRiseFall(levelingInputs);
          break;
        case 'traverse':
          result = traverseComputation(traverseInputs);
          break;
        case 'area':
          result = areaCoordinateMethod(areaInputs);
          break;
        case 'curveSetting':
          result = simpleCurve(curveInputs);
          break;
        default:
          throw new Error('Unknown calculation type');
      }
      
      setResults(result);
    } catch (err) {
      setError(err.message);
    }
  };

  // Add new reading row
  const addLevelingReading = () => {
    setLevelingInputs({
      ...levelingInputs,
      readings: [...levelingInputs.readings, { station: `P${levelingInputs.readings.length}`, BS: null, FS: null }]
    });
  };

  // Update reading
  const updateReading = (index, field, value) => {
    const newReadings = [...levelingInputs.readings];
    newReadings[index] = {
      ...newReadings[index],
      [field]: value === '' ? null : parseFloat(value)
    };
    setLevelingInputs({ ...levelingInputs, readings: newReadings });
  };

  // Traverse leg management
  const addTraverseLeg = () => {
    setTraverseInputs({
      ...traverseInputs,
      legs: [...traverseInputs.legs, { bearing: 0, distance: 0 }]
    });
  };

  const updateTraverseLeg = (index, field, value) => {
    const newLegs = [...traverseInputs.legs];
    newLegs[index] = {
      ...newLegs[index],
      [field]: parseFloat(value) || 0
    };
    setTraverseInputs({ ...traverseInputs, legs: newLegs });
  };

  // Coordinate management for area calculation
  const addCoordinate = () => {
    setAreaInputs({
      ...areaInputs,
      points: [...areaInputs.points, { x: 0, y: 0 }]
    });
  };

  const updateCoordinate = (index, axis, value) => {
    const newCoords = [...areaInputs.points];
    newCoords[index] = {
      ...newCoords[index],
      [axis]: parseFloat(value) || 0
    };
    setAreaInputs({ ...areaInputs, points: newCoords });
  };

  const renderInputs = () => {
    switch (activeCalc) {
      case 'leveling':
        return (
          <div className="space-y-4">
            <FormInput
              label="Benchmark Elevation (RL)"
              name="benchmarkRL"
              value={levelingInputs.benchmarkRL}
              onChange={(e) => setLevelingInputs({ ...levelingInputs, benchmarkRL: parseFloat(e.target.value) || 0 })}
              unit="m"
              step="0.001"
            />
            
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Station</th>
                    <th>Backsight (BS)</th>
                    <th>Foresight (FS)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {levelingInputs.readings.map((reading, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={reading.station}
                          onChange={(e) => {
                            const newReadings = [...levelingInputs.readings];
                            newReadings[index].station = e.target.value;
                            setLevelingInputs({ ...levelingInputs, readings: newReadings });
                          }}
                          className="input-field w-20"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={reading.BS ?? ''}
                          onChange={(e) => updateReading(index, 'BS', e.target.value)}
                          className="input-field w-24"
                          step="0.001"
                          placeholder="—"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={reading.FS ?? ''}
                          onChange={(e) => updateReading(index, 'FS', e.target.value)}
                          className="input-field w-24"
                          step="0.001"
                          placeholder="—"
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            const newReadings = levelingInputs.readings.filter((_, i) => i !== index);
                            setLevelingInputs({ ...levelingInputs, readings: newReadings });
                          }}
                          className="text-red-500 hover:text-red-700"
                          disabled={levelingInputs.readings.length <= 2}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button
              onClick={addLevelingReading}
              className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              + Add Reading
            </button>
          </div>
        );

      case 'traverse':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Starting Easting"
                name="startEasting"
                value={traverseInputs.startingCoordinates.easting}
                onChange={(e) => setTraverseInputs({
                  ...traverseInputs,
                  startingCoordinates: { ...traverseInputs.startingCoordinates, easting: parseFloat(e.target.value) || 0 }
                })}
                unit="m"
              />
              <FormInput
                label="Starting Northing"
                name="startNorthing"
                value={traverseInputs.startingCoordinates.northing}
                onChange={(e) => setTraverseInputs({
                  ...traverseInputs,
                  startingCoordinates: { ...traverseInputs.startingCoordinates, northing: parseFloat(e.target.value) || 0 }
                })}
                unit="m"
              />
              <FormInput
                label="Starting Bearing"
                name="startBearing"
                value={traverseInputs.startingBearing}
                onChange={(e) => setTraverseInputs({
                  ...traverseInputs,
                  startingBearing: parseFloat(e.target.value) || 0
                })}
                unit="degrees"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Leg #</th>
                    <th>Bearing (°)</th>
                    <th>Distance (m)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {traverseInputs.legs.map((leg, index) => (
                    <tr key={index}>
                      <td className="font-medium">{index + 1}</td>
                      <td>
                        <input
                          type="number"
                          value={leg.bearing}
                          onChange={(e) => updateTraverseLeg(index, 'bearing', e.target.value)}
                          className="input-field w-24"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={leg.distance}
                          onChange={(e) => updateTraverseLeg(index, 'distance', e.target.value)}
                          className="input-field w-24"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            const newLegs = traverseInputs.legs.filter((_, i) => i !== index);
                            setTraverseInputs({ ...traverseInputs, legs: newLegs });
                          }}
                          className="text-red-500 hover:text-red-700"
                          disabled={traverseInputs.legs.length <= 2}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button
              onClick={addTraverseLeg}
              className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              + Add Leg
            </button>
          </div>
        );

      case 'area':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter coordinates in order (clockwise or counter-clockwise). The polygon will be automatically closed.
            </p>
            
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Point #</th>
                    <th>X (Easting)</th>
                    <th>Y (Northing)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {areaInputs.points.map((coord, index) => (
                    <tr key={index}>
                      <td className="font-medium">{index + 1}</td>
                      <td>
                        <input
                          type="number"
                          value={coord.x}
                          onChange={(e) => updateCoordinate(index, 'x', e.target.value)}
                          className="input-field w-28"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={coord.y}
                          onChange={(e) => updateCoordinate(index, 'y', e.target.value)}
                          className="input-field w-28"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            const newCoords = areaInputs.points.filter((_, i) => i !== index);
                            setAreaInputs({ ...areaInputs, points: newCoords });
                          }}
                          className="text-red-500 hover:text-red-700"
                          disabled={areaInputs.points.length <= 3}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button
              onClick={addCoordinate}
              className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              + Add Point
            </button>
          </div>
        );

      case 'curveSetting':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              label="Radius (R)"
              name="radius"
              value={curveInputs.radius}
              onChange={(e) => setCurveInputs({ ...curveInputs, radius: parseFloat(e.target.value) || 0 })}
              unit="m"
            />
            <FormInput
              label="Deflection Angle (Δ)"
              name="deflectionAngle"
              value={curveInputs.deflectionAngle}
              onChange={(e) => setCurveInputs({ ...curveInputs, deflectionAngle: parseFloat(e.target.value) || 0 })}
              unit="degrees"
            />
            <FormInput
              label="Chainage of PI"
              name="chainage_PI"
              value={curveInputs.chainage_PI}
              onChange={(e) => setCurveInputs({ ...curveInputs, chainage_PI: parseFloat(e.target.value) || 0 })}
              unit="m"
            />
            <FormInput
              label="Peg Interval"
              name="pegInterval"
              value={curveInputs.pegInterval}
              onChange={(e) => setCurveInputs({ ...curveInputs, pegInterval: parseFloat(e.target.value) || 0 })}
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
      case 'leveling':
        return (
          <div className="space-y-6">
            <Card title="Leveling Results">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <ResultDisplay label="∑ Backsight" value={results.checks.sumBS} unit="m" />
                <ResultDisplay label="∑ Foresight" value={results.checks.sumFS} unit="m" />
                <ResultDisplay label="∑ Rise" value={results.checks.sumRise} unit="m" />
                <ResultDisplay label="∑ Fall" value={results.checks.sumFall} unit="m" />
              </div>
              
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Station</th>
                      <th>BS</th>
                      <th>FS</th>
                      <th>Rise</th>
                      <th>Fall</th>
                      <th>Reduced Level (RL)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((station, index) => (
                      <tr key={index}>
                        <td className="font-medium">{station.station}</td>
                        <td>{station.BS?.toFixed(3) ?? '—'}</td>
                        <td>{station.FS?.toFixed(3) ?? '—'}</td>
                        <td className="text-green-600">{station.rise?.toFixed(3) ?? '—'}</td>
                        <td className="text-red-600">{station.fall?.toFixed(3) ?? '—'}</td>
                        <td className="font-semibold">{station.RL?.toFixed(3) ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`mt-4 p-4 rounded-lg ${results.checks.isBalanced ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <p className={`text-sm font-medium ${results.checks.isBalanced ? 'text-green-700' : 'text-yellow-700'}`}>
                  {results.checks.isBalanced 
                    ? '✓ Leveling is balanced (ΣBS - ΣFS = ΣRise - ΣFall = Last RL - First RL)' 
                    : '⚠ Check arithmetic: Leveling does not balance'}
                </p>
              </div>
            </Card>
          </div>
        );

      case 'traverse':
        return (
          <div className="space-y-6">
            <Card title="Traverse Closure">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ResultDisplay label="Closing Error (E)" value={results.misclosure.easting} unit="m" />
                <ResultDisplay label="Closing Error (N)" value={results.misclosure.northing} unit="m" />
                <ResultDisplay label="Linear Misclosure" value={results.misclosure.linear} unit="m" />
                <ResultDisplay label="Accuracy" value={results.misclosure.precision} highlight />
              </div>
            </Card>

            <Card title="Computed Coordinates">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Point</th>
                      <th>Easting</th>
                      <th>Northing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.coordinates.map((point, index) => (
                      <tr key={index}>
                        <td className="font-medium">{point.point}</td>
                        <td className="font-semibold">{point.easting.toFixed(3)}</td>
                        <td className="font-semibold">{point.northing.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );

      case 'area':
        return (
          <Card title="Area Calculation Results">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultDisplay label="Area" value={results.area} unit="m²" highlight />
              <ResultDisplay label="Area" value={results.areaHectares} unit="hectares" />
              <ResultDisplay label="Area" value={results.areaAcres} unit="acres" />
              <ResultDisplay label="Perimeter" value={results.perimeter} unit="m" />
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>Method: Coordinate (Shoelace) Formula</p>
              <p>Number of vertices: {results.numberOfPoints}</p>
            </div>
          </Card>
        );

      case 'curveSetting':
        return (
          <div className="space-y-6">
            <Card title="Curve Elements">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ResultDisplay label="Tangent Length (T)" value={results.curveElements.tangentLength} unit="m" />
                <ResultDisplay label="Curve Length (L)" value={results.curveElements.curveLength} unit="m" highlight />
                <ResultDisplay label="Long Chord (C)" value={results.curveElements.longChord} unit="m" />
                <ResultDisplay label="External Distance (E)" value={results.curveElements.externalDistance} unit="m" />
                <ResultDisplay label="Middle Ordinate (M)" value={results.curveElements.middleOrdinate} unit="m" />
                <ResultDisplay label="Degree of Curve (D)" value={results.curveElements.degreeOfCurve} unit="°" />
              </div>
            </Card>

            <Card title="Key Chainages">
              <div className="grid grid-cols-3 gap-4">
                <ResultDisplay label="PC Chainage" value={results.chainages.PC} unit="m" />
                <ResultDisplay label="PI Chainage" value={results.chainages.PI} unit="m" />
                <ResultDisplay label="PT Chainage" value={results.chainages.PT} unit="m" />
              </div>
            </Card>

            <Card title="Setting Out Data">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Point #</th>
                      <th>Chainage (m)</th>
                      <th>Chord from PC (m)</th>
                      <th>Deflection Angle (°)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.settingOutTable.map((point, index) => (
                      <tr key={index}>
                        <td className="font-medium">{index + 1}</td>
                        <td>{point.chainage.toFixed(2)}</td>
                        <td>{point.chordFromPC.toFixed(3)}</td>
                        <td className="font-semibold">{point.deflectionAngle.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Surveying</h1>
            <p className="text-gray-600">Leveling, Traverse & Area Calculations</p>
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
                  ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
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

export default SurveyingPage;
