import React, { useState, useCallback } from 'react';
import { Calculator, FileDown, RotateCcw, Beaker, FlaskConical, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { concreteMixDesign, calculateTrialMix, getConcreteOptions } from '../utils/calculators/concrete';
import AnalysisGraph from '../components/charts/AnalysisGraph';
import { FormInput, FormSelect, Button, Card, ResultDisplay, Tabs, Alert } from '../components/ui/FormElements';
import { useConcreteStore } from '../store';
import { generateConcreteReport } from '../utils/reportGenerator';

const options = getConcreteOptions();

function ConcretePage() {
  const {
    mixDesign,
    batchSize,
    results,
    setMixDesignInput,
    setAllMixDesignInputs,
    setBatchSize,
    setResults,
    reset
  } = useConcreteStore();

  const [activeTab, setActiveTab] = useState('input');
  const [error, setError] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState({});

  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    setError(null);

    try {
      const result = concreteMixDesign(mixDesign);
      setResults(result);
      setActiveTab('results');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCalculating(false);
    }
  }, [mixDesign, setResults]);

  const handleExportPDF = async () => {
    if (!results) return;
    const report = generateConcreteReport(results, mixDesign);
    report.download('CiviCalc_Concrete_Mix_Design.pdf');
  };

  const handleReset = () => {
    reset();
    setActiveTab('input');
    setError(null);
    setExpandedSteps({});
  };

  const toggleStep = (stepNum) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepNum]: !prev[stepNum]
    }));
  };

  const tabs = [
    { id: 'input', label: 'Input Parameters' },
    { id: 'results', label: 'Mix Design Results' },
    { id: 'steps', label: 'Design Steps' }
  ];

  // Pie chart data for mix proportions
  const mixChartData = results ? [{
    values: [
      results.mixDesign.cement,
      results.mixDesign.fineAggregate,
      results.mixDesign.coarseAggregate,
      results.mixDesign.water
    ],
    labels: ['Cement', 'Fine Aggregate', 'Coarse Aggregate', 'Water'],
    type: 'pie',
    marker: {
      colors: ['#3b82f6', '#f59e0b', '#6b7280', '#06b6d4']
    },
    textinfo: 'label+percent',
    hoverinfo: 'label+value'
  }] : [];

  // Trial mix quantities
  const trialMix = results ? calculateTrialMix(results.mixDesign, batchSize / 1000) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center">
            <Beaker className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Concrete Technology</h1>
            <p className="text-gray-600">IS 10262:2019 Concrete Mix Design</p>
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
            <Card title="Concrete Requirements">
              <div className="space-y-4">
                <FormSelect
                  label="Target Grade"
                  name="targetGrade"
                  value={mixDesign.targetGrade}
                  onChange={(e) => setMixDesignInput('targetGrade', e.target.value)}
                  options={options.grades.map(g => ({ value: g, label: g }))}
                  helperText="Characteristic compressive strength (MPa)"
                />

                <FormSelect
                  label="Exposure Condition"
                  name="exposureCondition"
                  value={mixDesign.exposureCondition}
                  onChange={(e) => setMixDesignInput('exposureCondition', e.target.value)}
                  options={options.exposureConditions.map(c => ({ value: c, label: c }))}
                  helperText="As per IS 456:2000 Table 3"
                />

                <FormInput
                  label="Workability (Slump)"
                  name="workability"
                  type="number"
                  value={mixDesign.workability}
                  onChange={(e) => setMixDesignInput('workability', parseFloat(e.target.value) || 0)}
                  unit="mm"
                  min={25}
                  max={200}
                  helperText="Recommended: 50-100mm for general works"
                />

                <FormSelect
                  label="Cement Type"
                  name="cementType"
                  value={mixDesign.cementType}
                  onChange={(e) => setMixDesignInput('cementType', e.target.value)}
                  options={options.cementTypes.map(c => ({ value: c, label: c }))}
                />
              </div>
            </Card>

            <Card title="Aggregate Properties">
              <div className="space-y-4">
                <FormSelect
                  label="Maximum Aggregate Size"
                  name="maxAggregateSize"
                  value={mixDesign.maxAggregateSize}
                  onChange={(e) => setMixDesignInput('maxAggregateSize', parseInt(e.target.value))}
                  options={options.aggregateSizes.map(s => ({ value: s, label: `${s} mm` }))}
                />

                <FormSelect
                  label="Coarse Aggregate Type"
                  name="aggregateType"
                  value={mixDesign.aggregateType}
                  onChange={(e) => setMixDesignInput('aggregateType', e.target.value)}
                  options={options.aggregateTypes.map(t => ({ value: t, label: t }))}
                />

                <FormSelect
                  label="Fine Aggregate Zone"
                  name="sandZone"
                  value={mixDesign.sandZone}
                  onChange={(e) => setMixDesignInput('sandZone', e.target.value)}
                  options={options.sandZones.map(z => ({ value: z, label: z }))}
                  helperText="As per IS 383:2016"
                />

                <div className="grid grid-cols-3 gap-3">
                  <FormInput
                    label="SG Cement"
                    name="specificGravityCement"
                    type="number"
                    value={mixDesign.specificGravityCement}
                    onChange={(e) => setMixDesignInput('specificGravityCement', parseFloat(e.target.value) || 3.15)}
                    step={0.01}
                  />
                  <FormInput
                    label="SG CA"
                    name="specificGravityCA"
                    type="number"
                    value={mixDesign.specificGravityCA}
                    onChange={(e) => setMixDesignInput('specificGravityCA', parseFloat(e.target.value) || 2.70)}
                    step={0.01}
                  />
                  <FormInput
                    label="SG FA"
                    name="specificGravityFA"
                    type="number"
                    value={mixDesign.specificGravityFA}
                    onChange={(e) => setMixDesignInput('specificGravityFA', parseFloat(e.target.value) || 2.65)}
                    step={0.01}
                  />
                </div>
              </div>
            </Card>

            <Card title="Admixture (Optional)">
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={mixDesign.admixture}
                    onChange={(e) => setMixDesignInput('admixture', e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Use Superplasticizer</span>
                </label>

                {mixDesign.admixture && (
                  <FormInput
                    label="Dosage (% by weight of cement)"
                    name="admixtureDosage"
                    type="number"
                    value={mixDesign.admixtureDosage}
                    onChange={(e) => setMixDesignInput('admixtureDosage', parseFloat(e.target.value) || 0)}
                    unit="%"
                    min={0}
                    max={2}
                    step={0.1}
                    helperText="Typical range: 0.5-2.0%"
                  />
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="lg:col-span-2 flex justify-end space-x-4">
              <Button variant="outline" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
                Reset
              </Button>
              <Button 
                onClick={handleCalculate} 
                loading={isCalculating}
                icon={<Calculator className="w-4 h-4" />}
              >
                Calculate Mix Design
              </Button>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && results && (
          <div className="space-y-6">
            {/* Warnings */}
            {results.warnings.length > 0 && (
              <Alert type="warning">
                <ul className="list-disc list-inside">
                  {results.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Results */}
              <Card title="Design Summary">
                <div className="space-y-3">
                  <ResultDisplay
                    label="Target Mean Strength"
                    value={results.targetMeanStrength}
                    unit="MPa"
                  />
                  <ResultDisplay
                    label="Water-Cement Ratio"
                    value={results.wcRatio}
                    unit=""
                  />
                  <ResultDisplay
                    label="Maximum W/C (Durability)"
                    value={results.maxWCRatio}
                    unit=""
                  />
                </div>
              </Card>

              <Card title="Mix Ratio">
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-2">Cement : FA : CA (by weight)</p>
                  <p className="text-3xl font-bold text-orange-600">
                    1 : {results.mixRatio.fineAggregate} : {results.mixRatio.coarseAggregate}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Water-Cement Ratio: {results.mixRatio.water}
                  </p>
                </div>
              </Card>

              {/* Mix Proportions per m³ */}
              <Card title="Mix Proportions (per m³)">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Material</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Quantity</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3 text-sm">Cement</td>
                        <td className="py-2 px-3 text-sm text-right font-medium">{results.mixDesign.cement} kg</td>
                        <td className="py-2 px-3 text-sm text-right">{results.volumes.cement} L</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 text-sm">Fine Aggregate</td>
                        <td className="py-2 px-3 text-sm text-right font-medium">{results.mixDesign.fineAggregate} kg</td>
                        <td className="py-2 px-3 text-sm text-right">{results.volumes.fineAggregate} L</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 text-sm">Coarse Aggregate</td>
                        <td className="py-2 px-3 text-sm text-right font-medium">{results.mixDesign.coarseAggregate} kg</td>
                        <td className="py-2 px-3 text-sm text-right">{results.volumes.coarseAggregate} L</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 text-sm">Water</td>
                        <td className="py-2 px-3 text-sm text-right font-medium">{results.mixDesign.water} kg</td>
                        <td className="py-2 px-3 text-sm text-right">{results.volumes.water} L</td>
                      </tr>
                      {results.mixDesign.admixture > 0 && (
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm">Admixture</td>
                          <td className="py-2 px-3 text-sm text-right font-medium">{results.mixDesign.admixture} kg</td>
                          <td className="py-2 px-3 text-sm text-right">-</td>
                        </tr>
                      )}
                      <tr className="bg-orange-50">
                        <td className="py-2 px-3 text-sm font-medium">Entrapped Air</td>
                        <td className="py-2 px-3 text-sm text-right">-</td>
                        <td className="py-2 px-3 text-sm text-right">{results.volumes.air} L</td>
                      </tr>
                      <tr className="bg-gray-100 font-bold">
                        <td className="py-2 px-3 text-sm">Total</td>
                        <td className="py-2 px-3 text-sm text-right">{results.mixDesign.totalWeight} kg</td>
                        <td className="py-2 px-3 text-sm text-right">1000 L</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Pie Chart */}
              <Card title="Mix Composition">
                <AnalysisGraph
                  data={mixChartData}
                  layout={{ showlegend: true }}
                  height={300}
                />
              </Card>

              {/* Trial Mix Calculator */}
              <Card title="Trial Mix Quantities" className="lg:col-span-2">
                <div className="space-y-4">
                  <FormInput
                    label="Batch Size"
                    name="batchSize"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseFloat(e.target.value) || 25)}
                    unit="liters"
                    min={5}
                    max={1000}
                    helperText="Enter required batch volume"
                  />
                  
                  {trialMix && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-blue-600 font-medium">Cement</p>
                        <p className="text-lg font-bold text-blue-700">{trialMix.cement} kg</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-yellow-600 font-medium">Fine Agg.</p>
                        <p className="text-lg font-bold text-yellow-700">{trialMix.fineAggregate} kg</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-600 font-medium">Coarse Agg.</p>
                        <p className="text-lg font-bold text-gray-700">{trialMix.coarseAggregate} kg</p>
                      </div>
                      <div className="bg-cyan-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-cyan-600 font-medium">Water</p>
                        <p className="text-lg font-bold text-cyan-700">{trialMix.water} kg</p>
                      </div>
                      {trialMix.admixture > 0 && (
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-purple-600 font-medium">Admixture</p>
                          <p className="text-lg font-bold text-purple-700">{trialMix.admixture} kg</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Cost Estimate */}
              <Card title="Cost Estimate (Approximate)">
                <div className="space-y-2">
                  <ResultDisplay label="Cement Cost" value={`₹${results.costEstimate.cement.toLocaleString()}`} unit="/m³" />
                  <ResultDisplay label="Fine Aggregate" value={`₹${results.costEstimate.fineAggregate.toLocaleString()}`} unit="/m³" />
                  <ResultDisplay label="Coarse Aggregate" value={`₹${results.costEstimate.coarseAggregate.toLocaleString()}`} unit="/m³" />
                  <hr className="my-2" />
                  <ResultDisplay 
                    label="Total Material Cost" 
                    value={`₹${results.costEstimate.total.toLocaleString()}`} 
                    unit="/m³" 
                    className="text-lg font-bold"
                  />
                </div>
              </Card>

              {/* Standards Reference */}
              <Card title="Standards Reference">
                <ul className="space-y-2">
                  {results.standardsReference.map((std, i) => (
                    <li key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                      <Info className="w-4 h-4 text-blue-500" />
                      <span>{std}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setActiveTab('input')}>
                Modify Inputs
              </Button>
              <Button onClick={handleExportPDF} icon={<FileDown className="w-4 h-4" />}>
                Export PDF Report
              </Button>
            </div>
          </div>
        )}

        {/* Design Steps Tab */}
        {activeTab === 'steps' && results && (
          <div className="space-y-4">
            {results.designSteps.map((step) => (
              <Card key={step.step} className="overflow-hidden">
                <button
                  onClick={() => toggleStep(step.step)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </span>
                    <span className="font-medium text-gray-900">{step.title}</span>
                  </div>
                  {expandedSteps[step.step] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSteps[step.step] && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Formula:</p>
                      <p className="font-mono text-sm">{step.formula}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Calculation:</p>
                      <p className="text-sm">{step.calculation}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Result:</span>
                      <span className="text-lg font-bold text-orange-600">
                        {typeof step.result === 'object' 
                          ? JSON.stringify(step.result) 
                          : `${step.result} ${step.unit}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic">{step.reference}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* No Results State */}
        {(activeTab === 'results' || activeTab === 'steps') && !results && (
          <div className="text-center py-12">
            <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Mix Design Results</h3>
            <p className="text-gray-600 mb-4">Enter the input parameters and calculate to see results.</p>
            <Button onClick={() => setActiveTab('input')}>
              Go to Input Parameters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConcretePage;
