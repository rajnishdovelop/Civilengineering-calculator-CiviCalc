/**
 * PDF Report Generator
 * Generate professional engineering reports with calculations and graphs
 * 
 * @author Concreate Club, IIT Indore
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
    this.yPosition = 40;
    this.margin = 20;
    this.pageWidth = 210; // A4
    this.pageHeight = 297;
    this.contentWidth = this.pageWidth - 2 * this.margin;
  }

  /**
   * Initialize a new PDF document
   */
  initialize(title = 'Engineering Calculation Report') {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageNumber = 1;
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
   * Add footer to current page
   */
  addFooter() {
    const y = this.pageHeight - 15;
    
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(150, 150, 150);
    
    // Date
    const date = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.pdf.text(date, this.margin, y);
    
    // Page number
    this.pdf.text(`Page ${this.pageNumber}`, this.pageWidth - this.margin, y, { align: 'right' });
    
    // Center text
    this.pdf.text('© 2026 CiviCalc | Concreate Club, IIT Indore', this.pageWidth / 2, y, { align: 'center' });
  }

  /**
   * Check if new page is needed
   */
  checkPageBreak(requiredSpace = 30) {
    if (this.yPosition + requiredSpace > this.pageHeight - 25) {
      this.addFooter();
      this.pdf.addPage();
      this.pageNumber++;
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
    this.addFooter();
    this.pdf.save(filename);
  }

  /**
   * Get PDF as blob
   */
  getBlob() {
    this.addFooter();
    return this.pdf.output('blob');
  }

  /**
   * Get PDF as base64
   */
  getBase64() {
    this.addFooter();
    return this.pdf.output('datauristring');
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

export default {
  ReportGenerator,
  generateBeamReport,
  generateGeotechReport,
  captureChartImage
};
