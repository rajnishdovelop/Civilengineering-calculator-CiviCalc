/**
 * PDF Report Generator
 * Generate professional engineering reports with calculations and graphs
 * 
 * @author Concreate Club, IIT Indore
 * @contributor Rajnish
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * CiviCalc Report Generator Class
 */
export class ReportGenerator {
  constructor() {
    this.pdf = null;
    this.pageNumber = 1;
    this.totalPages = 1;
    this.yPosition = 40;
    this.margin = 20;
    this.pageWidth = 210; // A4
    this.pageHeight = 297;
    this.contentWidth = this.pageWidth - 2 * this.margin;
    this.chartImages = []; // Store chart images for embedding
  }

  /**
   * Initialize a new PDF document
   */
  initialize(title = 'Engineering Calculation Report') {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageNumber = 1;
    this.totalPages = 1;
    this.yPosition = 40;
    
    this.addHeader(title);
    
    return this;
  }

  /**
   * Add header to current page
   */
  addHeader(title) {
    // Title
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(30, 64, 175); // Blue
    this.pdf.text(title, this.pageWidth / 2, 25, { align: 'center' });

    // Subtitle
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('CiviCalc - Civil Engineering Calculator', this.pageWidth / 2, 32, { align: 'center' });
    this.pdf.text('Built by Concreate Club, IIT Indore', this.pageWidth / 2, 37, { align: 'center' });

    // Line
    this.pdf.setDrawColor(30, 64, 175);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, 42, this.pageWidth - this.margin, 42);

    this.yPosition = 50;
  }

  /**
   * Add footer to current page (with page X of Y)
   */
  addFooter(currentPage = null, totalPages = null) {
    const y = this.pageHeight - 12;
    const pageNum = currentPage || this.pageNumber;
    const total = totalPages || this.totalPages;
    
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(150, 150, 150);
    
    // Date on left
    const date = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.pdf.text(date, this.margin, y);
    
    // Page number on right (Page X of Y)
    this.pdf.text(`Page ${pageNum} of ${total}`, this.pageWidth - this.margin, y, { align: 'right' });
    
    // Built with love by Rajnish - Centered
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(239, 68, 68); // Red heart color
    this.pdf.text('Built with ❤ by Rajnish', this.pageWidth / 2, y - 4, { align: 'center' });
    
    // CiviCalc credit
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(150, 150, 150);
    this.pdf.text('CiviCalc | Concreate Club, IIT Indore', this.pageWidth / 2, y + 2, { align: 'center' });
  }

  /**
   * Add footer to all pages (call this before saving)
   */
  addFooterToAllPages() {
    const totalPages = this.pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      this.addFooter(i, totalPages);
    }
  }

  /**
   * Check if new page is needed
   */
  checkPageBreak(requiredSpace = 30) {
    if (this.yPosition + requiredSpace > this.pageHeight - 25) {
      this.pdf.addPage();
      this.pageNumber++;
      this.totalPages++;
      this.yPosition = 25;
      return true;
    }
    return false;
  }

  /**
   * Add a section title
   */
  addSectionTitle(title) {
    this.checkPageBreak(20);
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(30, 64, 175);
    this.pdf.text(title, this.margin, this.yPosition);
    
    this.yPosition += 8;
  }

  /**
   * Add a subsection title
   */
  addSubsectionTitle(title) {
    this.checkPageBreak(15);
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(60, 60, 60);
    this.pdf.text(title, this.margin, this.yPosition);
    
    this.yPosition += 6;
  }

  /**
   * Add normal text
   */
  addText(text, options = {}) {
    const { fontSize = 10, color = [60, 60, 60], bold = false } = options;
    
    this.checkPageBreak();
    
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    this.pdf.setTextColor(...color);
    
    // Handle text wrapping
    const lines = this.pdf.splitTextToSize(text, this.contentWidth);
    this.pdf.text(lines, this.margin, this.yPosition);
    
    this.yPosition += lines.length * 5 + 3;
  }

  /**
   * Add a key-value pair
   */
  addKeyValue(key, value, unit = '') {
    this.checkPageBreak(8);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(60, 60, 60);
    this.pdf.text(`${key}:`, this.margin, this.yPosition);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(30, 30, 30);
    const valueText = unit ? `${value} ${unit}` : `${value}`;
    this.pdf.text(valueText, this.margin + 60, this.yPosition);
    
    this.yPosition += 6;
  }

  /**
   * Add input parameters table
   */
  addInputsTable(inputs, title = 'Input Parameters') {
    this.checkPageBreak(40);
    this.addSubsectionTitle(title);
    
    const tableData = Object.entries(inputs).map(([key, value]) => {
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      return [formattedKey, String(value)];
    });

    this.pdf.autoTable({
      startY: this.yPosition,
      head: [['Parameter', 'Value']],
      body: tableData,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 90 }
      }
    });

    this.yPosition = this.pdf.lastAutoTable.finalY + 10;
  }

  /**
   * Add results table
   */
  addResultsTable(results, title = 'Results') {
    this.checkPageBreak(40);
    this.addSubsectionTitle(title);
    
    const tableData = Object.entries(results).map(([key, value]) => {
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      
      let formattedValue;
      if (typeof value === 'object' && value !== null) {
        formattedValue = JSON.stringify(value);
      } else {
        formattedValue = String(value);
      }
      
      return [formattedKey, formattedValue];
    });

    this.pdf.autoTable({
      startY: this.yPosition,
      head: [['Result', 'Value']],
      body: tableData,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [16, 185, 129], // Green
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 90 }
      }
    });

    this.yPosition = this.pdf.lastAutoTable.finalY + 10;
  }

  /**
   * Add custom data table
   */
  addDataTable(headers, data, options = {}) {
    const { title, columnWidths } = options;
    
    this.checkPageBreak(50);
    
    if (title) {
      this.addSubsectionTitle(title);
    }

    const tableOptions = {
      startY: this.yPosition,
      head: [headers],
      body: data,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    };

    if (columnWidths) {
      tableOptions.columnStyles = {};
      columnWidths.forEach((width, i) => {
        tableOptions.columnStyles[i] = { cellWidth: width };
      });
    }

    this.pdf.autoTable(tableOptions);
    this.yPosition = this.pdf.lastAutoTable.finalY + 10;
  }

  /**
   * Add an image from base64 or URL
   */
  addImage(imageData, options = {}) {
    const { 
      width = 170, 
      height = 100,
      caption = null 
    } = options;

    this.checkPageBreak(height + 20);

    try {
      const x = (this.pageWidth - width) / 2;
      this.pdf.addImage(imageData, 'PNG', x, this.yPosition, width, height);
      this.yPosition += height + 5;

      if (caption) {
        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'italic');
        this.pdf.setTextColor(100, 100, 100);
        this.pdf.text(caption, this.pageWidth / 2, this.yPosition, { align: 'center' });
        this.yPosition += 10;
      }
    } catch (error) {
      console.error('Error adding image to PDF:', error);
    }
  }

  /**
   * Add spacing
   */
  addSpacing(space = 10) {
    this.yPosition += space;
    this.checkPageBreak();
  }

  /**
   * Add a horizontal line
   */
  addLine() {
    this.checkPageBreak(5);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 5;
  }

  /**
   * Finalize and download the PDF
   */
  download(filename = 'CiviCalc_Report.pdf') {
    this.addFooterToAllPages();
    this.pdf.save(filename);
  }

  /**
   * Get PDF as blob
   */
  getBlob() {
    this.addFooterToAllPages();
    return this.pdf.output('blob');
  }

  /**
   * Get PDF as base64
   */
  getBase64() {
    this.addFooterToAllPages();
    return this.pdf.output('datauristring');
  }
  
  /**
   * Add a chart image from Plotly
   * @param {string} imageData - Base64 encoded image data
   * @param {object} options - Options for the image
   */
  addChartImage(imageData, options = {}) {
    const {
      width = 170,
      height = 100,
      caption = null,
      title = null
    } = options;

    this.checkPageBreak(height + 30);

    if (title) {
      this.addSubsectionTitle(title);
    }

    try {
      const x = (this.pageWidth - width) / 2;
      
      // Add border around chart
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.setLineWidth(0.3);
      this.pdf.rect(x - 2, this.yPosition - 2, width + 4, height + 4);
      
      this.pdf.addImage(imageData, 'PNG', x, this.yPosition, width, height);
      this.yPosition += height + 5;

      if (caption) {
        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'italic');
        this.pdf.setTextColor(100, 100, 100);
        this.pdf.text(caption, this.pageWidth / 2, this.yPosition, { align: 'center' });
        this.yPosition += 10;
      }
    } catch (error) {
      console.error('Error adding chart image to PDF:', error);
      this.addText('Chart image could not be rendered', { color: [200, 100, 100] });
    }
  }
}

/**
 * Generate a beam analysis report
 */
export function generateBeamReport(results, inputs) {
  const report = new ReportGenerator();
  report.initialize('Beam Analysis Report');
  
  report.addSectionTitle('1. Input Parameters');
  report.addInputsTable({
    'Span Length': `${inputs.span} m`,
    'Elastic Modulus (E)': `${inputs.E / 1e9} GPa`,
    'Moment of Inertia (I)': `${inputs.I} m⁴`,
    'Support Type': 'Simply Supported'
  });

  report.addSectionTitle('2. Applied Loads');
  if (inputs.loads && inputs.loads.length > 0) {
    const loadData = inputs.loads.map((load, i) => [
      i + 1,
      load.type,
      load.magnitude,
      load.position || `${load.start}-${load.end}`
    ]);
    report.addDataTable(
      ['#', 'Type', 'Magnitude', 'Position'],
      loadData,
      { columnWidths: [15, 40, 50, 60] }
    );
  }

  report.addSectionTitle('3. Support Reactions');
  report.addKeyValue('Reaction at A (Ra)', results.reactions.Ra, 'kN');
  report.addKeyValue('Reaction at B (Rb)', results.reactions.Rb, 'kN');

  report.addSectionTitle('4. Maximum Values');
  report.addKeyValue('Max Shear Force', results.maxValues.shear, 'kN');
  report.addKeyValue('Position of Max Shear', results.maxValues.shearPosition, 'm');
  report.addKeyValue('Max Bending Moment', results.maxValues.moment, 'kN·m');
  report.addKeyValue('Position of Max Moment', results.maxValues.momentPosition, 'm');
  report.addKeyValue('Max Deflection', results.maxValues.deflection, 'mm');
  report.addKeyValue('Position of Max Deflection', results.maxValues.deflectionPosition, 'm');

  return report;
}

/**
 * Generate a geotechnical report
 */
export function generateGeotechReport(results, calculationType) {
  const report = new ReportGenerator();
  report.initialize('Geotechnical Analysis Report');
  
  report.addSectionTitle(`Analysis Type: ${calculationType}`);
  
  if (results.inputs) {
    report.addSubsectionTitle('Input Parameters');
    report.addInputsTable(results.inputs);
  }

  report.addSectionTitle('Results');
  
  // Filter out inputs from results for display
  const displayResults = { ...results };
  delete displayResults.inputs;
  delete displayResults.curveData;
  
  report.addResultsTable(displayResults);

  return report;
}

/**
 * Utility function to capture Plotly chart as image
 * Note: This function requires plotly.js but we use react-plotly.js in the app
 */
export async function captureChartImage(plotlyRef) {
  if (!plotlyRef || !plotlyRef.current) {
    return null;
  }

  try {
    // Use the Plotly instance from react-plotly.js
    const graphDiv = plotlyRef.current.el;
    if (graphDiv && window.Plotly) {
      const imageData = await window.Plotly.toImage(graphDiv, {
        format: 'png',
        width: 800,
        height: 500
      });
      return imageData;
    }
    return null;
  } catch (error) {
    console.error('Error capturing chart:', error);
    return null;
  }
}

/**
 * Generate Concrete Mix Design Report (IS 10262:2019)
 */
export function generateConcreteReport(inputs, results, chartImage = null) {
  const report = new ReportGenerator();
  report.initialize('Concrete Mix Design Report - IS 10262:2019');

  // Project info - using actual property names from mixDesign
  report.addSectionTitle('1. Design Parameters');
  report.addKeyValue('Target Grade', inputs.targetGrade || inputs.grade);
  report.addKeyValue('Exposure Condition', inputs.exposureCondition);
  report.addKeyValue('Max Aggregate Size', inputs.maxAggregateSize, 'mm');
  report.addKeyValue('Cement Type', inputs.cementType);
  report.addKeyValue('Workability (Slump)', inputs.workability || inputs.slump, 'mm');
  report.addKeyValue('Aggregate Type', inputs.aggregateType);
  report.addKeyValue('Fine Aggregate Zone', inputs.sandZone);
  if (inputs.admixture && inputs.admixtureDosage > 0) {
    report.addKeyValue('Admixture Dosage', inputs.admixtureDosage, '%');
  }

  report.addSectionTitle('2. Design Calculations');
  report.addSubsectionTitle('2.1 Target Mean Strength');
  report.addKeyValue('Target Mean Strength (fck\')', results.targetMeanStrength, 'MPa');

  report.addSubsectionTitle('2.2 Water-Cement Ratio');
  report.addKeyValue('Maximum W/C (Durability)', results.maxWCRatio);
  report.addKeyValue('Adopted W/C Ratio', results.wcRatio);

  report.addSectionTitle('3. Mix Proportions (per m³)');
  const mixData = [
    ['Water', results.mixDesign?.water?.toFixed(1) || '-', 'kg'],
    ['Cement', results.mixDesign?.cement?.toFixed(1) || '-', 'kg'],
    ['Fine Aggregate', results.mixDesign?.fineAggregate?.toFixed(1) || '-', 'kg'],
    ['Coarse Aggregate', results.mixDesign?.coarseAggregate?.toFixed(1) || '-', 'kg']
  ];
  if (results.mixDesign?.admixture > 0) {
    mixData.push(['Admixture', results.mixDesign?.admixture?.toFixed(2) || '-', 'kg']);
  }
  report.addDataTable(['Material', 'Quantity', 'Unit'], mixData, { columnWidths: [60, 50, 40] });

  report.addSubsectionTitle('Mix Ratio (by weight)');
  const ratioStr = results.mixRatio ? 
    `1 : ${results.mixRatio.fineAggregate} : ${results.mixRatio.coarseAggregate}` : '-';
  report.addKeyValue('Cement : FA : CA', ratioStr);
  report.addKeyValue('Water-Cement Ratio', results.wcRatio);

  if (results.costEstimate) {
    report.addSectionTitle('4. Cost Estimation');
    report.addKeyValue('Estimated Cost per m³', results.costEstimate.total, '₹');
  }

  // Add chart if provided
  if (chartImage) {
    report.addSectionTitle('5. Mix Composition Chart');
    report.addChartImage(chartImage, {
      width: 140,
      height: 100,
      caption: 'Figure 1: Mix Design Composition by Weight'
    });
  }

  report.addSectionTitle('Notes & References');
  report.addText('1. Mix design as per IS 10262:2019 - Concrete Mix Proportioning - Guidelines');
  report.addText('2. Exposure conditions as per IS 456:2000 Table 3 & 5');
  report.addText('3. Trial mix adjustments may be required based on actual site conditions');
  report.addText('4. Minimum cement content and maximum W/C ratio as per IS 456:2000');

  return report;
}

/**
 * Generate CPM/PERT Analysis Report
 */
export function generateCPMReport(activities, results, analysisType = 'CPM', ganttImage = null) {
  const report = new ReportGenerator();
  const isPERT = analysisType.toUpperCase() === 'PERT';
  const title = isPERT 
    ? 'PERT Analysis Report' 
    : 'Critical Path Method (CPM) Report';
  report.initialize(title);

  // Section 1: Project Activities
  report.addSectionTitle('1. Project Activities');
  const activityData = activities.map((act, idx) => {
    const predecessors = typeof act.predecessors === 'string' 
      ? act.predecessors 
      : (act.predecessors || []).join(', ');
    
    if (isPERT) {
      return [
        act.id || String.fromCharCode(65 + idx),
        act.name,
        predecessors || '-',
        act.optimistic || '-',
        act.mostLikely || act.duration || '-',
        act.pessimistic || '-',
        act.cost ? `₹${act.cost.toLocaleString()}` : '-'
      ];
    } else {
      return [
        act.id || String.fromCharCode(65 + idx),
        act.name,
        predecessors || '-',
        act.duration,
        act.cost ? `₹${act.cost.toLocaleString()}` : '-'
      ];
    }
  });
  
  const headers = isPERT
    ? ['ID', 'Activity', 'Pred.', 'Opt.', 'M.L.', 'Pess.', 'Cost']
    : ['ID', 'Activity', 'Predecessors', 'Duration (days)', 'Cost'];
  
  const columnWidths = isPERT 
    ? [15, 50, 25, 18, 18, 18, 30]
    : [15, 60, 35, 30, 30];
  
  report.addDataTable(headers, activityData, { columnWidths });

  // Section 2: Network Analysis Results
  report.addSectionTitle('2. Network Analysis Results');
  
  // Use resultsTable if available (more complete data)
  const tableData = results.resultsTable || results.activities;
  
  if (tableData && tableData.length > 0) {
    const scheduleData = tableData.map(act => [
      act.id,
      act.name || '-',
      (act.duration || act.EF - act.ES || 0).toString(),
      (act.ES ?? 0).toString(),
      (act.EF ?? 0).toString(),
      (act.LS ?? 0).toString(),
      (act.LF ?? 0).toString(),
      (act.totalFloat ?? act.TF ?? 0).toString(),
      act.isCritical ? '✓' : '-'
    ]);
    
    report.addDataTable(
      ['ID', 'Activity', 'Dur.', 'ES', 'EF', 'LS', 'LF', 'Float', 'Critical'],
      scheduleData,
      { columnWidths: [15, 45, 18, 18, 18, 18, 18, 18, 20] }
    );
  }

  // Section 3: Critical Path Summary
  report.addSectionTitle('3. Critical Path Summary');
  report.addKeyValue('Total Project Duration', results.projectDuration || 0, 'days');
  
  const criticalActivities = results.criticalActivities || results.criticalPath || [];
  const cpText = Array.isArray(criticalActivities) 
    ? criticalActivities.join(' → ') 
    : criticalActivities;
  report.addKeyValue('Critical Path', cpText || 'N/A');
  report.addKeyValue('Number of Critical Activities', 
    (Array.isArray(criticalActivities) ? criticalActivities.length : 0).toString());

  // Section 4: Cost Analysis (if available)
  if (results.costAnalysis) {
    report.addSectionTitle('4. Cost Analysis');
    report.addKeyValue('Total Project Cost', `₹${(results.costAnalysis.totalCost || 0).toLocaleString()}`);
    report.addKeyValue('Critical Path Cost', `₹${(results.costAnalysis.criticalCost || 0).toLocaleString()}`);
    report.addKeyValue('Non-Critical Cost', `₹${(results.costAnalysis.nonCriticalCost || 0).toLocaleString()}`);
  }

  // Section 5: PERT Probability Analysis
  if (isPERT && results.probabilityAnalysis) {
    const sectionNum = results.costAnalysis ? '5' : '4';
    report.addSectionTitle(`${sectionNum}. Probability Analysis (PERT)`);
    report.addKeyValue('Expected Duration (Te)', results.projectDuration, 'days');
    report.addKeyValue('Project Variance (σ²)', (results.probabilityAnalysis.variance || 0).toFixed(2));
    report.addKeyValue('Standard Deviation (σ)', (results.probabilityAnalysis.stdDev || 0).toFixed(2), 'days');
    
    report.addSubsectionTitle('Probability Estimates');
    if (results.probabilityAnalysis.probability90) {
      report.addKeyValue('90% Confidence Duration', results.probabilityAnalysis.probability90?.toFixed(1) || '-', 'days');
    }
    if (results.probabilityAnalysis.probability95) {
      report.addKeyValue('95% Confidence Duration', results.probabilityAnalysis.probability95?.toFixed(1) || '-', 'days');
    }
    if (results.probabilityAnalysis.probability99) {
      report.addKeyValue('99% Confidence Duration', results.probabilityAnalysis.probability99?.toFixed(1) || '-', 'days');
    }
    
    if (results.probabilityAnalysis.confidenceIntervals) {
      report.addSubsectionTitle('Confidence Intervals');
      const ci = results.probabilityAnalysis.confidenceIntervals;
      if (ci['68%']) {
        report.addKeyValue('68% Probability (±1σ)', 
          `${ci['68%'].min?.toFixed(1)} - ${ci['68%'].max?.toFixed(1)}`, 'days');
      }
      if (ci['95%']) {
        report.addKeyValue('95% Probability (±2σ)', 
          `${ci['95%'].min?.toFixed(1)} - ${ci['95%'].max?.toFixed(1)}`, 'days');
      }
      if (ci['99.7%']) {
        report.addKeyValue('99.7% Probability (±3σ)', 
          `${ci['99.7%'].min?.toFixed(1)} - ${ci['99.7%'].max?.toFixed(1)}`, 'days');
      }
    }
  }

  // Add Gantt chart if provided
  if (ganttImage) {
    const chartSectionNum = isPERT 
      ? (results.costAnalysis ? '6' : '5') 
      : (results.costAnalysis ? '5' : '4');
    report.addSectionTitle(`${chartSectionNum}. Gantt Chart`);
    report.addChartImage(ganttImage, {
      width: 170,
      height: 100,
      caption: 'Figure 1: Project Schedule - Gantt Chart'
    });
  }

  // Notes section
  report.addSectionTitle('Notes & Definitions');
  report.addText('ES = Early Start, EF = Early Finish, LS = Late Start, LF = Late Finish');
  report.addText('Total Float = LS - ES = LF - EF (time an activity can be delayed without delaying project)');
  report.addText('Critical Path = longest path through the network, determines minimum project duration');
  report.addText('Critical Activities (marked ✓) have zero float and cannot be delayed');
  if (isPERT) {
    report.addSpacing(5);
    report.addText('PERT Formulas:');
    report.addText('Expected Time (Te) = (Optimistic + 4 × Most Likely + Pessimistic) / 6');
    report.addText('Variance (σ²) = ((Pessimistic - Optimistic) / 6)²');
    report.addText('Standard Deviation (σ) = √(Sum of critical path variances)');
  }

  return report;
}

export default {
  ReportGenerator,
  generateBeamReport,
  generateGeotechReport,
  generateConcreteReport,
  generateCPMReport,
  captureChartImage
};
