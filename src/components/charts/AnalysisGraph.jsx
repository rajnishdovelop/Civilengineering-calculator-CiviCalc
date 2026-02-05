import React, { useRef, useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

/**
 * Responsive Plotly Chart Component
 * Automatically resizes based on container width using ResizeObserver
 */
function AnalysisGraph({ 
  data, 
  layout = {}, 
  title = '',
  xTitle = '',
  yTitle = '',
  config = {},
  className = '',
  height = 350
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions(prev => ({
          ...prev,
          width: Math.max(300, width - 32) // Minimum width with padding
        }));
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const defaultLayout = {
    title: {
      text: title,
      font: { size: 16, color: '#374151' }
    },
    xaxis: {
      title: { text: xTitle, font: { size: 12 } },
      gridcolor: '#e5e7eb',
      zerolinecolor: '#9ca3af',
      tickfont: { size: 10 }
    },
    yaxis: {
      title: { text: yTitle, font: { size: 12 } },
      gridcolor: '#e5e7eb',
      zerolinecolor: '#9ca3af',
      tickfont: { size: 10 }
    },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    margin: { l: 60, r: 30, t: title ? 50 : 30, b: 50 },
    font: { family: 'Inter, system-ui, sans-serif' },
    showlegend: data.length > 1,
    legend: {
      orientation: 'h',
      yanchor: 'bottom',
      y: 1.02,
      xanchor: 'right',
      x: 1,
      font: { size: 10 }
    },
    hovermode: 'x unified',
    ...layout
  };

  const defaultConfig = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: 'civicalc_chart',
      height: 500,
      width: 800,
      scale: 2
    },
    ...config
  };

  return (
    <div ref={containerRef} className={`chart-container ${className}`}>
      <Plot
        data={data}
        layout={{
          ...defaultLayout,
          width: dimensions.width,
          height: dimensions.height
        }}
        config={defaultConfig}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

/**
 * Beam Analysis Charts (SFD, BMD, Deflection)
 */
export function BeamCharts({ results }) {
  if (!results) return null;

  const { x, shear, moment, deflection } = results;

  // Shear Force Diagram
  const sfdData = [{
    x: x,
    y: shear,
    type: 'scatter',
    mode: 'lines',
    fill: 'tozeroy',
    fillcolor: 'rgba(239, 68, 68, 0.2)',
    line: { color: '#ef4444', width: 2 },
    name: 'Shear Force',
    hovertemplate: 'x: %{x:.2f} m<br>V: %{y:.2f} kN<extra></extra>'
  }];

  // Bending Moment Diagram
  const bmdData = [{
    x: x,
    y: moment,
    type: 'scatter',
    mode: 'lines',
    fill: 'tozeroy',
    fillcolor: 'rgba(59, 130, 246, 0.2)',
    line: { color: '#3b82f6', width: 2 },
    name: 'Bending Moment',
    hovertemplate: 'x: %{x:.2f} m<br>M: %{y:.2f} kN·m<extra></extra>'
  }];

  // Deflection Diagram
  const deflectionData = [{
    x: x,
    y: deflection,
    type: 'scatter',
    mode: 'lines',
    fill: 'tozeroy',
    fillcolor: 'rgba(16, 185, 129, 0.2)',
    line: { color: '#10b981', width: 2 },
    name: 'Deflection',
    hovertemplate: 'x: %{x:.2f} m<br>δ: %{y:.4f} mm<extra></extra>'
  }];

  return (
    <div className="space-y-6">
      <AnalysisGraph
        data={sfdData}
        title="Shear Force Diagram (SFD)"
        xTitle="Position along beam (m)"
        yTitle="Shear Force (kN)"
      />
      <AnalysisGraph
        data={bmdData}
        title="Bending Moment Diagram (BMD)"
        xTitle="Position along beam (m)"
        yTitle="Bending Moment (kN·m)"
      />
      <AnalysisGraph
        data={deflectionData}
        title="Deflection Curve"
        xTitle="Position along beam (m)"
        yTitle="Deflection (mm)"
      />
    </div>
  );
}

/**
 * Traffic Flow Diagram (Greenshields)
 */
export function TrafficFlowChart({ curveData, currentPoint }) {
  if (!curveData) return null;

  const { densities, speeds, flows } = curveData;

  // Speed-Density curve
  const speedDensityData = [{
    x: densities,
    y: speeds,
    type: 'scatter',
    mode: 'lines',
    line: { color: '#3b82f6', width: 2 },
    name: 'Speed-Density'
  }];

  if (currentPoint) {
    speedDensityData.push({
      x: [currentPoint.density],
      y: [currentPoint.speed],
      type: 'scatter',
      mode: 'markers',
      marker: { color: '#ef4444', size: 12, symbol: 'circle' },
      name: 'Current Condition'
    });
  }

  // Flow-Density curve  
  const flowDensityData = [{
    x: densities,
    y: flows,
    type: 'scatter',
    mode: 'lines',
    line: { color: '#10b981', width: 2 },
    name: 'Flow-Density'
  }];

  if (currentPoint) {
    flowDensityData.push({
      x: [currentPoint.density],
      y: [currentPoint.flow],
      type: 'scatter',
      mode: 'markers',
      marker: { color: '#ef4444', size: 12, symbol: 'circle' },
      name: 'Current Condition'
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AnalysisGraph
        data={speedDensityData}
        title="Speed-Density Relationship"
        xTitle="Density (veh/km)"
        yTitle="Speed (km/hr)"
      />
      <AnalysisGraph
        data={flowDensityData}
        title="Flow-Density Relationship"
        xTitle="Density (veh/km)"
        yTitle="Flow (veh/hr)"
      />
    </div>
  );
}

/**
 * Specific Energy Curve
 */
export function SpecificEnergyChart({ depths, energies, criticalDepth, minEnergy }) {
  const data = [{
    x: energies,
    y: depths,
    type: 'scatter',
    mode: 'lines',
    line: { color: '#0ea5e9', width: 2 },
    name: 'E-y curve'
  }];

  // Add critical depth marker
  if (criticalDepth && minEnergy) {
    data.push({
      x: [minEnergy],
      y: [criticalDepth],
      type: 'scatter',
      mode: 'markers',
      marker: { color: '#ef4444', size: 12, symbol: 'star' },
      name: 'Critical Point'
    });
  }

  return (
    <AnalysisGraph
      data={data}
      title="Specific Energy Curve"
      xTitle="Specific Energy (m)"
      yTitle="Flow Depth (m)"
    />
  );
}

/**
 * BOD Kinetics Curve
 */
export function BODChart({ curveData }) {
  if (!curveData) return null;

  const { times, exerted, remaining } = curveData;

  const data = [
    {
      x: times,
      y: exerted,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#ef4444', width: 2 },
      name: 'BOD Exerted'
    },
    {
      x: times,
      y: remaining,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#3b82f6', width: 2, dash: 'dash' },
      name: 'BOD Remaining'
    }
  ];

  return (
    <AnalysisGraph
      data={data}
      title="BOD Kinetics"
      xTitle="Time (days)"
      yTitle="BOD (mg/L)"
    />
  );
}

/**
 * Oxygen Sag Curve
 */
export function OxygenSagChart({ curveData }) {
  if (!curveData) return null;

  const { distances, dissolvedOxygen } = curveData;

  const data = [{
    x: distances,
    y: dissolvedOxygen,
    type: 'scatter',
    mode: 'lines',
    fill: 'tozeroy',
    fillcolor: 'rgba(59, 130, 246, 0.2)',
    line: { color: '#3b82f6', width: 2 },
    name: 'Dissolved Oxygen'
  }];

  return (
    <AnalysisGraph
      data={data}
      title="Oxygen Sag Curve"
      xTitle="Distance Downstream (km)"
      yTitle="DO Concentration (mg/L)"
    />
  );
}

/**
 * Gaussian Plume Profile
 */
export function GaussianPlumeChart({ profileData }) {
  if (!profileData) return null;

  const { distances, concentrations } = profileData;

  const data = [{
    x: distances,
    y: concentrations,
    type: 'scatter',
    mode: 'lines',
    fill: 'tozeroy',
    fillcolor: 'rgba(239, 68, 68, 0.2)',
    line: { color: '#ef4444', width: 2 },
    name: 'Ground Level Concentration'
  }];

  return (
    <AnalysisGraph
      data={data}
      title="Gaussian Plume - Centerline Concentration"
      xTitle="Downwind Distance (m)"
      yTitle="Concentration (μg/m³)"
    />
  );
}

export default AnalysisGraph;
