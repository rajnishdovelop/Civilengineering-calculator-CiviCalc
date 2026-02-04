import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Calculator, FileDown, RotateCcw, Building2 } from 'lucide-react';
import { BeamAnalyzer, calculateSectionProperties, getSupportTypeOptions, SUPPORT_TYPES } from '../utils/calculators/structural';
import { BeamCharts } from '../components/charts/AnalysisGraph';
import { FormInput, FormSelect, Button, Card, ResultDisplay, Tabs, Alert } from '../components/ui/FormElements';
import { useBeamStore } from '../store';
import { generateBeamReport } from '../utils/reportGenerator';

const loadTypes = [
  { value: 'point', label: 'Point Load' },
  { value: 'udl', label: 'Uniformly Distributed Load (UDL)' },
  { value: 'moment', label: 'Applied Moment' }
];

const sectionTypes = [
  { value: 'rectangle', label: 'Rectangular' },
  { value: 'circle', label: 'Circular' },
  { value: 'i_beam', label: 'I-Beam' },
  { value: 'custom', label: 'Custom (Enter I directly)' }
];

// Support type options
const supportTypeOptions = getSupportTypeOptions();

function StructuralPage() {
  const {
    span, E, I, sectionType, sectionDimensions, loads, results,
    supportType, supportPositions,
    setSpan, setE, setI, setSectionType, setSectionDimensions,
    addLoad, updateLoad, removeLoad, clearLoads, setResults, reset,
    setSupportType, setSupportPositions
  } = useBeamStore();

  const [activeTab, setActiveTab] = useState('input');
  const [newLoad, setNewLoad] = useState({ type: 'point', magnitude: 10, position: 3, start: 0, end: 6 });
  const [error, setError] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate section properties when section changes
  const sectionProps = sectionType !== 'custom' 
    ? calculateSectionProperties(sectionType, sectionDimensions)
    : { momentOfInertia: I };

  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    setError(null);

    try {
      // Validate inputs
      if (span <= 0) throw new Error('Span must be greater than 0');
      if (E <= 0) throw new Error('Elastic modulus must be greater than 0');
      if (I <= 0 && sectionType === 'custom') throw new Error('Moment of inertia must be greater than 0');
      if (loads.length === 0) throw new Error('Add at least one load to analyze');

      // Create beam analyzer
      const EInPa = E * 1e9; // Convert GPa to Pa
      const IValue = sectionType === 'custom' ? I : sectionProps.momentOfInertia;
      
      const analyzer = new BeamAnalyzer(span, EInPa, IValue, 500);
      analyzer.setSupportType(supportType);
      
      // Set support positions for overhanging beams
      if (supportType === SUPPORT_TYPES.OVERHANGING && supportPositions) {
        analyzer.setSupportPositions(supportPositions.a, supportPositions.b);
      }
      
      analyzer.setLoads(loads);
      
      const analysisResults = analyzer.analyze();
      setResults(analysisResults);
      setActiveTab('results');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsCalculating(false);
    }
  }, [span, E, I, sectionType, sectionProps.momentOfInertia, loads, supportType, supportPositions, setResults]);

  const handleAddLoad = () => {
    if (newLoad.type === 'point' || newLoad.type === 'moment') {
      if (newLoad.position < 0 || newLoad.position > span) {
        setError(`Load position must be between 0 and ${span} m`);
        return;
      }
    } else if (newLoad.type === 'udl') {
      if (newLoad.start < 0 || newLoad.end > span || newLoad.start >= newLoad.end) {
        setError('Invalid UDL range');
        return;
      }
    }
    
    addLoad(newLoad);
    setNewLoad({ ...newLoad, position: span / 2 });
    setError(null);
  };

  const handleExportPDF = async () => {
    if (!results) return;
    
    const inputs = {
      span,
      E: `${E} GPa`,
      I: sectionType === 'custom' ? I : sectionProps.momentOfInertia,
      loads
    };
    
    const report = generateBeamReport(results, inputs);
    report.download('CiviCalc_Beam_Analysis.pdf');
  };

  const handleReset = () => {
    reset();
    setActiveTab('input');
    setError(null);
  };

  const tabs = [
    { id: 'input', label: 'Input Parameters' },
    { id: 'loads', label: `Loads (${loads.length})` },
    { id: 'results', label: 'Results & Diagrams' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Structural Engineering</h1>
            <p className="text-gray-600">Beam Analysis Calculator</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {/* Input Parameters Tab */}
        {activeTab === 'input' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Beam Properties">
              <div className="space-y-4">
                <FormSelect
                  label="Support Condition"
                  name="supportType"
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value)}
                  options={supportTypeOptions}
                  helpText="Select beam boundary conditions"
                />
                
                {/* Beam Schematic */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Beam Schematic</p>
                  <div className="relative h-20 flex items-center justify-center">
                    {/* Beam line */}
                    <div className="absolute top-1/2 left-8 right-8 h-2 bg-blue-500 rounded transform -translate-y-1/2"></div>
                    
                    {/* Support icons based on type */}
                    {supportType === SUPPORT_TYPES.SIMPLY_SUPPORTED && (
                      <>
                        {/* Triangle (Pin) at A */}
                        <div className="absolute left-8 bottom-4">
                          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[15px] border-l-transparent border-r-transparent border-b-amber-500"></div>
                        </div>
                        {/* Roller at B */}
                        <div className="absolute right-8 bottom-4">
                          <div className="w-5 h-5 bg-amber-500 rounded-full"></div>
                        </div>
                      </>
                    )}
                    
                    {supportType === SUPPORT_TYPES.CANTILEVER && (
                      <>
                        {/* Fixed support at A */}
                        <div className="absolute left-4 top-2 bottom-2 w-3 bg-gray-600 rounded"></div>
                        <div className="absolute left-3 top-2 bottom-2 flex flex-col justify-between">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-2 h-[2px] bg-gray-600 -rotate-45"></div>
                          ))}
                        </div>
                        {/* Free end indicator */}
                        <div className="absolute right-6 text-xs text-gray-500">Free End</div>
                      </>
                    )}
                    
                    {supportType === SUPPORT_TYPES.OVERHANGING && (
                      <>
                        {/* Pin support at position a */}
                        <div className="absolute left-16 bottom-4">
                          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[15px] border-l-transparent border-r-transparent border-b-amber-500"></div>
                        </div>
                        {/* Roller support at position b */}
                        <div className="absolute right-16 bottom-4">
                          <div className="w-5 h-5 bg-amber-500 rounded-full"></div>
                        </div>
                        {/* Overhang indicators */}
                        <div className="absolute left-5 text-xs text-gray-500">Overhang</div>
                        <div className="absolute right-3 text-xs text-gray-500">Overhang</div>
                      </>
                    )}
                    
                    {supportType === SUPPORT_TYPES.FIXED_BOTH && (
                      <>
                        {/* Fixed support at A */}
                        <div className="absolute left-4 top-2 bottom-2 w-3 bg-gray-600 rounded"></div>
                        {/* Fixed support at B */}
                        <div className="absolute right-4 top-2 bottom-2 w-3 bg-gray-600 rounded"></div>
                      </>
                    )}
                    
                    {supportType === SUPPORT_TYPES.PROPPED_CANTILEVER && (
                      <>
                        {/* Fixed support at A */}
                        <div className="absolute left-4 top-2 bottom-2 w-3 bg-gray-600 rounded"></div>
                        {/* Roller at B */}
                        <div className="absolute right-8 bottom-4">
                          <div className="w-5 h-5 bg-amber-500 rounded-full"></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Support positions for overhanging beam */}
                {supportType === SUPPORT_TYPES.OVERHANGING && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="Left Support Position (a)"
                      name="supportA"
                      value={supportPositions?.a || span * 0.2}
                      onChange={(e) => setSupportPositions({ 
                        a: parseFloat(e.target.value) || 0, 
                        b: supportPositions?.b || span * 0.8 
                      })}
                      unit="m"
                      min={0}
                      max={span}
                      helpText="Distance from left end"
                    />
                    <FormInput
                      label="Right Support Position (b)"
                      name="supportB"
                      value={supportPositions?.b || span * 0.8}
                      onChange={(e) => setSupportPositions({ 
                        a: supportPositions?.a || span * 0.2, 
                        b: parseFloat(e.target.value) || 0 
                      })}
                      unit="m"
                      min={0}
                      max={span}
                      helpText="Distance from left end"
                    />
                  </div>
                )}
                
                <FormInput
                  label="Span Length"
                  name="span"
                  value={span}
                  onChange={(e) => setSpan(parseFloat(e.target.value) || 0)}
                  unit="m"
                  min={0.1}
                />
                <FormInput
                  label="Elastic Modulus (E)"
                  name="E"
                  value={E}
                  onChange={(e) => setE(parseFloat(e.target.value) || 0)}
                  unit="GPa"
                  min={0.1}
                  helpText="Steel: ~200 GPa, Concrete: ~25-30 GPa"
                />
              </div>
            </Card>

            <Card title="Cross Section">
              <div className="space-y-4">
                <FormSelect
                  label="Section Type"
                  name="sectionType"
                  value={sectionType}
                  onChange={(e) => setSectionType(e.target.value)}
                  options={sectionTypes}
                />

                {sectionType === 'rectangle' && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="Width"
                      name="width"
                      value={sectionDimensions.width}
                      onChange={(e) => setSectionDimensions({ ...sectionDimensions, width: parseFloat(e.target.value) || 0 })}
                      unit="m"
                    />
                    <FormInput
                      label="Height"
                      name="height"
                      value={sectionDimensions.height}
                      onChange={(e) => setSectionDimensions({ ...sectionDimensions, height: parseFloat(e.target.value) || 0 })}
                      unit="m"
                    />
                  </div>
                )}

                {sectionType === 'circle' && (
                  <FormInput
                    label="Diameter"
                    name="diameter"
                    value={sectionDimensions.diameter || 0.2}
                    onChange={(e) => setSectionDimensions({ ...sectionDimensions, diameter: parseFloat(e.target.value) || 0 })}
                    unit="m"
                  />
                )}

                {sectionType === 'custom' && (
                  <FormInput
                    label="Moment of Inertia (I)"
                    name="I"
                    value={I}
                    onChange={(e) => setI(parseFloat(e.target.value) || 0)}
                    unit="m⁴"
                    step="0.0001"
                  />
                )}

                {sectionType !== 'custom' && (
                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-700 font-medium mb-2">Calculated Section Properties:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-mono">{sectionProps.area?.toExponential(4)} m²</span>
                      <span className="text-gray-600">Moment of Inertia:</span>
                      <span className="font-mono">{sectionProps.momentOfInertia?.toExponential(4)} m⁴</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Loads Tab */}
        {activeTab === 'loads' && (
          <div className="space-y-6">
            <Card title="Add New Load">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormSelect
                  label="Load Type"
                  name="loadType"
                  value={newLoad.type}
                  onChange={(e) => setNewLoad({ ...newLoad, type: e.target.value })}
                  options={loadTypes}
                />

                {newLoad.type === 'point' && (
                  <>
                    <FormInput
                      label="Magnitude (P)"
                      name="magnitude"
                      value={newLoad.magnitude}
                      onChange={(e) => setNewLoad({ ...newLoad, magnitude: parseFloat(e.target.value) || 0 })}
                      unit="kN"
                    />
                    <FormInput
                      label="Position from A"
                      name="position"
                      value={newLoad.position}
                      onChange={(e) => setNewLoad({ ...newLoad, position: parseFloat(e.target.value) || 0 })}
                      unit="m"
                      max={span}
                    />
                  </>
                )}

                {newLoad.type === 'udl' && (
                  <>
                    <FormInput
                      label="Intensity (w)"
                      name="magnitude"
                      value={newLoad.magnitude}
                      onChange={(e) => setNewLoad({ ...newLoad, magnitude: parseFloat(e.target.value) || 0 })}
                      unit="kN/m"
                    />
                    <FormInput
                      label="Start Position"
                      name="start"
                      value={newLoad.start}
                      onChange={(e) => setNewLoad({ ...newLoad, start: parseFloat(e.target.value) || 0 })}
                      unit="m"
                    />
                    <FormInput
                      label="End Position"
                      name="end"
                      value={newLoad.end}
                      onChange={(e) => setNewLoad({ ...newLoad, end: parseFloat(e.target.value) || 0 })}
                      unit="m"
                      max={span}
                    />
                  </>
                )}

                {newLoad.type === 'moment' && (
                  <>
                    <FormInput
                      label="Magnitude (M)"
                      name="magnitude"
                      value={newLoad.magnitude}
                      onChange={(e) => setNewLoad({ ...newLoad, magnitude: parseFloat(e.target.value) || 0 })}
                      unit="kN·m"
                      helpText="Positive = Clockwise"
                    />
                    <FormInput
                      label="Position from A"
                      name="position"
                      value={newLoad.position}
                      onChange={(e) => setNewLoad({ ...newLoad, position: parseFloat(e.target.value) || 0 })}
                      unit="m"
                      max={span}
                    />
                  </>
                )}
              </div>
              
              <Button onClick={handleAddLoad} icon={Plus} className="mt-4">
                Add Load
              </Button>
            </Card>

            <Card title="Applied Loads">
              {loads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No loads added yet. Add a load above to begin.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Type</th>
                        <th>Magnitude</th>
                        <th>Position</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loads.map((load, index) => (
                        <tr key={load.id}>
                          <td>{index + 1}</td>
                          <td className="capitalize">{load.type}</td>
                          <td>
                            {load.magnitude} {load.type === 'udl' ? 'kN/m' : load.type === 'moment' ? 'kN·m' : 'kN'}
                          </td>
                          <td>
                            {load.type === 'udl' 
                              ? `${load.start} - ${load.end} m` 
                              : `${load.position} m`
                            }
                          </td>
                          <td>
                            <button
                              onClick={() => removeLoad(load.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {loads.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="danger" onClick={clearLoads} icon={Trash2}>
                    Clear All Loads
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {results ? (
              <>
                {/* Reactions */}
                <Card title="Support Reactions">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ResultDisplay 
                      label="Reaction at A (Ra)" 
                      value={results.reactions.Ra} 
                      unit="kN" 
                      highlight 
                    />
                    <ResultDisplay 
                      label="Reaction at B (Rb)" 
                      value={results.reactions.Rb} 
                      unit="kN" 
                      highlight 
                    />
                  </div>
                </Card>

                {/* Maximum Values */}
                <Card title="Maximum Values">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ResultDisplay 
                      label="Max Shear Force" 
                      value={`${results.maxValues.shear} at ${results.maxValues.shearPosition}m`}
                      unit="kN" 
                    />
                    <ResultDisplay 
                      label="Max Bending Moment" 
                      value={`${results.maxValues.moment} at ${results.maxValues.momentPosition}m`}
                      unit="kN·m" 
                    />
                    <ResultDisplay 
                      label="Max Deflection" 
                      value={`${results.maxValues.deflection} at ${results.maxValues.deflectionPosition}m`}
                      unit="mm" 
                    />
                  </div>
                </Card>

                {/* Diagrams */}
                <Card title="Analysis Diagrams">
                  <BeamCharts results={results} />
                </Card>
              </>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No results yet. Add loads and click "Calculate" to analyze the beam.</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button 
          variant="primary" 
          onClick={handleCalculate} 
          icon={Calculator}
          loading={isCalculating}
          disabled={loads.length === 0}
        >
          Calculate
        </Button>
        
        {results && (
          <Button variant="success" onClick={handleExportPDF} icon={FileDown}>
            Export PDF
          </Button>
        )}
        
        <Button variant="outline" onClick={handleReset} icon={RotateCcw}>
          Reset
        </Button>
      </div>
    </div>
  );
}

export default StructuralPage;
