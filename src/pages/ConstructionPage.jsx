import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Plus, Trash2, Calculator, FileDown, RotateCcw, HardHat, Network, BarChart3, Calendar, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { cpmAnalysis, pertAnalysis, costAnalysis } from '../utils/calculators/construction';
import AnalysisGraph from '../components/charts/AnalysisGraph';
import { FormInput, FormSelect, Button, Card, ResultDisplay, Tabs, Alert } from '../components/ui/FormElements';
import { useConstructionStore } from '../store';
import { generateCPMReport } from '../utils/reportGenerator';
import Plotly from 'plotly.js-dist-min';

function ConstructionPage() {
  const {
    analysisType,
    activities,
    projectName,
    startDate,
    results,
    setAnalysisType,
    setProjectName,
    setStartDate,
    addActivity,
    updateActivity,
    removeActivity,
    setActivities,
    setResults,
    reset,
    loadSampleCPM,
    loadSamplePERT
  } = useConstructionStore();

  const [activeTab, setActiveTab] = useState('input');
  const [error, setError] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const ganttChartRef = useRef(null);
  const [newActivity, setNewActivity] = useState({
    name: '',
    duration: 0,
    predecessors: '',
    optimistic: 0,
    mostLikely: 0,
    pessimistic: 0,
    cost: 0
  });

  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    setError(null);

    try {
      if (activities.length === 0) {
        throw new Error('Add at least one activity to analyze');
      }

      let result;
      if (analysisType === 'CPM') {
        result = cpmAnalysis(activities);
      } else {
        result = pertAnalysis(activities);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      // Add cost analysis
      const costs = costAnalysis(activities.map((a, i) => ({
        ...a,
        isCritical: result.criticalActivities.includes(a.id)
      })));
      result.costAnalysis = costs;

      setResults(result);
      setActiveTab('results');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCalculating(false);
    }
  }, [activities, analysisType, setResults]);

  const handleAddActivity = () => {
    if (!newActivity.name) {
      setError('Please enter activity name');
      return;
    }
    
    if (analysisType === 'CPM' && newActivity.duration <= 0) {
      setError('Duration must be greater than 0');
      return;
    }
    
    if (analysisType === 'PERT' && (newActivity.optimistic <= 0 || newActivity.mostLikely <= 0 || newActivity.pessimistic <= 0)) {
      setError('All time estimates must be greater than 0');
      return;
    }

    addActivity(newActivity);
    setNewActivity({
      name: '',
      duration: 0,
      predecessors: '',
      optimistic: 0,
      mostLikely: 0,
      pessimistic: 0,
      cost: 0
    });
    setError(null);
  };

  const handleExportPDF = async () => {
    if (!results) return;
    
    setIsExporting(true);
    try {
      // Try to capture Gantt chart image
      let ganttImage = null;
      try {
        const ganttElement = document.querySelector('.gantt-chart-container .js-plotly-plot');
        if (ganttElement) {
          ganttImage = await Plotly.toImage(ganttElement, {
            format: 'png',
            width: 1000,
            height: 500,
            scale: 2
          });
        }
      } catch (chartError) {
        console.warn('Could not capture Gantt chart:', chartError);
      }

      const report = generateCPMReport(activities, results, analysisType, ganttImage);
      report.download(`CiviCalc_${analysisType}_Analysis_${projectName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      setError('Failed to export PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    reset();
    setActiveTab('input');
    setError(null);
  };

  // Gantt Chart Data
  const ganttChartData = useMemo(() => {
    if (!results || !results.ganttData) return [];
    
    return results.ganttData.map(activity => ({
      x: [activity.end - activity.start],
      y: [activity.name],
      type: 'bar',
      orientation: 'h',
      base: activity.start,
      name: activity.id,
      marker: {
        color: activity.isCritical ? '#ef4444' : '#3b82f6'
      },
      hovertemplate: `${activity.name}<br>Start: Day ${activity.start}<br>End: Day ${activity.end}<br>Duration: ${activity.duration} days<extra></extra>`
    }));
  }, [results]);

  // Network flow visualization data
  const networkChartData = useMemo(() => {
    if (!results || !results.resultsTable) return [];

    const nodes = results.resultsTable;
    const xPositions = {};
    const yPositions = {};
    
    // Calculate positions based on ES
    nodes.forEach((node, i) => {
      xPositions[node.id] = node.ES;
      yPositions[node.id] = i;
    });

    return [{
      type: 'scatter',
      mode: 'markers+text',
      x: nodes.map(n => n.ES),
      y: nodes.map((n, i) => i),
      text: nodes.map(n => `${n.id}`),
      textposition: 'middle center',
      marker: {
        size: 40,
        color: nodes.map(n => n.isCritical ? '#ef4444' : '#3b82f6'),
        line: { width: 2, color: '#fff' }
      },
      hovertemplate: nodes.map(n => 
        `<b>${n.id}: ${n.name}</b><br>` +
        `ES: ${n.ES} | EF: ${n.EF}<br>` +
        `LS: ${n.LS} | LF: ${n.LF}<br>` +
        `Float: ${n.totalFloat}<extra></extra>`
      )
    }];
  }, [results]);

  const tabs = [
    { id: 'input', label: 'Activities' },
    { id: 'results', label: 'Analysis Results' },
    { id: 'gantt', label: 'Gantt Chart' },
    { id: 'table', label: 'Schedule Table' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Construction Management</h1>
            <p className="text-gray-600">CPM / PERT Network Analysis</p>
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
        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Settings */}
              <Card title="Project Settings">
                <div className="space-y-4">
                  <FormInput
                    label="Project Name"
                    name="projectName"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                  
                  <FormSelect
                    label="Analysis Type"
                    name="analysisType"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    options={[
                      { value: 'CPM', label: 'CPM (Critical Path Method)' },
                      { value: 'PERT', label: 'PERT (Three-Time Estimates)' }
                    ]}
                  />

                  <FormInput
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={analysisType === 'CPM' ? loadSampleCPM : loadSamplePERT}
                    >
                      Load Sample Data
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Clear All
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Add Activity Form */}
              <Card title="Add Activity" className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormInput
                    label="Activity Name"
                    name="name"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Foundation Work"
                    className="col-span-2"
                  />
                  
                  {analysisType === 'CPM' ? (
                    <FormInput
                      label="Duration"
                      name="duration"
                      type="number"
                      value={newActivity.duration}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, duration: parseFloat(e.target.value) || 0 }))}
                      unit="days"
                      min={0}
                    />
                  ) : (
                    <>
                      <FormInput
                        label="Optimistic (a)"
                        name="optimistic"
                        type="number"
                        value={newActivity.optimistic}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, optimistic: parseFloat(e.target.value) || 0 }))}
                        unit="days"
                        min={0}
                      />
                      <FormInput
                        label="Most Likely (m)"
                        name="mostLikely"
                        type="number"
                        value={newActivity.mostLikely}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, mostLikely: parseFloat(e.target.value) || 0 }))}
                        unit="days"
                        min={0}
                      />
                      <FormInput
                        label="Pessimistic (b)"
                        name="pessimistic"
                        type="number"
                        value={newActivity.pessimistic}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, pessimistic: parseFloat(e.target.value) || 0 }))}
                        unit="days"
                        min={0}
                      />
                    </>
                  )}

                  <FormInput
                    label="Predecessors"
                    name="predecessors"
                    value={newActivity.predecessors}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, predecessors: e.target.value }))}
                    placeholder="e.g., A, B"
                    helperText="Comma-separated"
                  />

                  <FormInput
                    label="Cost (Optional)"
                    name="cost"
                    type="number"
                    value={newActivity.cost}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                    unit="₹"
                    min={0}
                  />

                  <div className="flex items-end">
                    <Button onClick={handleAddActivity} icon={<Plus className="w-4 h-4" />}>
                      Add Activity
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Activities Table */}
            <Card title={`Activities (${activities.length})`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity Name</th>
                      {analysisType === 'CPM' ? (
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Duration</th>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">a</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">m</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">b</th>
                        </>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predecessors</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-indigo-600">{activity.id}</td>
                        <td className="px-4 py-3 text-sm">
                          <input
                            type="text"
                            value={activity.name}
                            onChange={(e) => updateActivity(activity.id, { name: e.target.value })}
                            className="border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1 w-full"
                          />
                        </td>
                        {analysisType === 'CPM' ? (
                          <td className="px-4 py-3 text-sm text-right">
                            <input
                              type="number"
                              value={activity.duration}
                              onChange={(e) => updateActivity(activity.id, { duration: parseFloat(e.target.value) || 0 })}
                              className="border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1 w-16 text-right"
                            />
                          </td>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm text-right">
                              <input
                                type="number"
                                value={activity.optimistic}
                                onChange={(e) => updateActivity(activity.id, { optimistic: parseFloat(e.target.value) || 0 })}
                                className="border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1 w-14 text-right"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <input
                                type="number"
                                value={activity.mostLikely}
                                onChange={(e) => updateActivity(activity.id, { mostLikely: parseFloat(e.target.value) || 0 })}
                                className="border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1 w-14 text-right"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <input
                                type="number"
                                value={activity.pessimistic}
                                onChange={(e) => updateActivity(activity.id, { pessimistic: parseFloat(e.target.value) || 0 })}
                                className="border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1 w-14 text-right"
                              />
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 text-sm">
                          <input
                            type="text"
                            value={activity.predecessors}
                            onChange={(e) => updateActivity(activity.id, { predecessors: e.target.value })}
                            className="border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1 w-24"
                            placeholder="-"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <input
                            type="number"
                            value={activity.cost || 0}
                            onChange={(e) => updateActivity(activity.id, { cost: parseFloat(e.target.value) || 0 })}
                            className="border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1 w-24 text-right"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <button
                            onClick={() => removeActivity(activity.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
                Reset
              </Button>
              <Button 
                onClick={handleCalculate} 
                loading={isCalculating}
                icon={<Calculator className="w-4 h-4" />}
              >
                Run {analysisType} Analysis
              </Button>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && results && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Summary Cards */}
              <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-200 text-sm">Project Duration</p>
                    <p className="text-3xl font-bold">{results.projectDuration}</p>
                    <p className="text-indigo-200 text-sm">days</p>
                  </div>
                  <Clock className="w-12 h-12 text-indigo-300" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-200 text-sm">Critical Activities</p>
                    <p className="text-3xl font-bold">{results.criticalActivities.length}</p>
                    <p className="text-red-200 text-sm">of {results.totalActivities}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-red-300" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm">Critical Paths</p>
                    <p className="text-3xl font-bold">{results.criticalPaths.length}</p>
                    <p className="text-green-200 text-sm">path(s)</p>
                  </div>
                  <Network className="w-12 h-12 text-green-300" />
                </div>
              </Card>

              {results.costAnalysis && (
                <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-200 text-sm">Total Cost</p>
                      <p className="text-2xl font-bold">₹{results.costAnalysis.totalDirectCost.toLocaleString()}</p>
                      <p className="text-yellow-200 text-sm">estimated</p>
                    </div>
                    <DollarSign className="w-12 h-12 text-yellow-300" />
                  </div>
                </Card>
              )}
            </div>

            {/* Critical Path */}
            <Card title="Critical Path(s)">
              {results.criticalPaths.map((path, i) => (
                <div key={i} className="flex items-center space-x-2 mb-2">
                  <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="flex items-center space-x-1">
                    {path.split(' → ').map((node, j) => (
                      <React.Fragment key={j}>
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
                          {node}
                        </span>
                        {j < path.split(' → ').length - 1 && (
                          <span className="text-gray-400">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </Card>

            {/* PERT Specific Results */}
            {analysisType === 'PERT' && results.projectVariance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Statistical Analysis">
                  <div className="space-y-3">
                    <ResultDisplay
                      label="Expected Project Duration"
                      value={results.projectDuration}
                      unit="days"
                    />
                    <ResultDisplay
                      label="Project Variance (σ²)"
                      value={results.projectVariance}
                      unit=""
                    />
                    <ResultDisplay
                      label="Standard Deviation (σ)"
                      value={results.projectStdDev}
                      unit="days"
                    />
                  </div>
                </Card>

                <Card title="Probability Analysis">
                  <div className="space-y-3">
                    <ResultDisplay
                      label="90% Confidence Duration"
                      value={results.probabilityAnalysis.probability90}
                      unit="days"
                    />
                    <ResultDisplay
                      label="95% Confidence Duration"
                      value={results.probabilityAnalysis.probability95}
                      unit="days"
                    />
                    <ResultDisplay
                      label="99% Confidence Duration"
                      value={results.probabilityAnalysis.probability99}
                      unit="days"
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setActiveTab('input')}>
                Modify Activities
              </Button>
              <Button 
                onClick={handleExportPDF} 
                icon={<FileDown className="w-4 h-4" />}
                loading={isExporting}
                disabled={isExporting}
              >
                {isExporting ? 'Generating PDF...' : 'Export PDF Report'}
              </Button>
            </div>
          </div>
        )}

        {/* Gantt Chart Tab */}
        {activeTab === 'gantt' && results && (
          <Card title="Gantt Chart">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-red-500 rounded"></span>
                    <span>Critical Activity</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-blue-500 rounded"></span>
                    <span>Non-Critical Activity</span>
                  </span>
                </div>
                <Button 
                  onClick={handleExportPDF} 
                  icon={<FileDown className="w-4 h-4" />}
                  size="sm"
                  loading={isExporting}
                  disabled={isExporting}
                >
                  Export PDF
                </Button>
              </div>
            </div>
            <div className="gantt-chart-container">
              <AnalysisGraph
                data={ganttChartData}
                layout={{
                  barmode: 'stack',
                  xaxis: {
                    title: 'Project Duration (Days)',
                    showgrid: true
                  },
                  yaxis: {
                    autorange: 'reversed',
                  showgrid: false
                },
                showlegend: false,
                margin: { l: 150 }
              }}
              height={Math.max(400, results.ganttData.length * 40)}
              title="Project Gantt Chart"
            />
            </div>
          </Card>
        )}

        {/* Schedule Table Tab */}
        {activeTab === 'table' && results && (
          <Card title="Activity Schedule">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">ES</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">EF</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">LS</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">LF</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Float</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Free Float</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Critical</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.resultsTable.map((row) => (
                    <tr key={row.id} className={row.isCritical ? 'bg-red-50' : 'hover:bg-gray-50'}>
                      <td className="px-3 py-3 text-sm font-medium text-indigo-600">{row.id}</td>
                      <td className="px-3 py-3 text-sm">{row.name}</td>
                      <td className="px-3 py-3 text-sm text-right">{row.duration}</td>
                      <td className="px-3 py-3 text-sm text-right">{row.ES}</td>
                      <td className="px-3 py-3 text-sm text-right">{row.EF}</td>
                      <td className="px-3 py-3 text-sm text-right">{row.LS}</td>
                      <td className="px-3 py-3 text-sm text-right">{row.LF}</td>
                      <td className="px-3 py-3 text-sm text-right font-medium">
                        <span className={row.totalFloat === 0 ? 'text-red-600' : 'text-green-600'}>
                          {row.totalFloat}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-right">{row.freeFloat}</td>
                      <td className="px-3 py-3 text-sm text-center">
                        {row.isCritical ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            No
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                <div><strong>ES:</strong> Early Start</div>
                <div><strong>EF:</strong> Early Finish</div>
                <div><strong>LS:</strong> Late Start</div>
                <div><strong>LF:</strong> Late Finish</div>
                <div><strong>Total Float:</strong> LS - ES</div>
                <div><strong>Free Float:</strong> min(ES of successors) - EF</div>
              </div>
            </div>
          </Card>
        )}

        {/* No Results State */}
        {(activeTab === 'results' || activeTab === 'gantt' || activeTab === 'table') && !results && (
          <div className="text-center py-12">
            <Network className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Results</h3>
            <p className="text-gray-600 mb-4">Add activities and run the analysis to see results.</p>
            <Button onClick={() => setActiveTab('input')}>
              Go to Activities
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConstructionPage;
