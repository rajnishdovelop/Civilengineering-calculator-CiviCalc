import React from 'react';
import { Building2, Users, Target, BookOpen, Code, Mail, ExternalLink } from 'lucide-react';
import { Card } from '../components/ui/FormElements';

const features = [
  {
    title: 'Comprehensive Calculations',
    description: 'Six major civil engineering modules covering structural, geotechnical, fluid mechanics, transportation, environmental, and surveying.',
    icon: Building2
  },
  {
    title: '100% Client-Side',
    description: 'All calculations run entirely in your browser. No data is ever sent to external servers, ensuring complete privacy.',
    icon: Code
  },
  {
    title: 'Interactive Visualizations',
    description: 'Dynamic charts and graphs help you understand results better with shear force, bending moment, traffic flow, and oxygen sag curves.',
    icon: Target
  },
  {
    title: 'Educational Focus',
    description: 'Designed by engineering students for engineering students. Clear formulas, step-by-step results, and industry-standard methods.',
    icon: BookOpen
  }
];

const teamMembers = [
  { name: 'Concreate Club', role: 'Civil Engineering Club, IIT Indore' }
];

function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-civil-structural to-civil-geotech rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About CiviCalc</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A comprehensive civil engineering calculation platform built by the 
          <span className="font-semibold text-civil-structural"> Concreate Club</span> at 
          <span className="font-semibold"> IIT Indore</span>
        </p>
      </div>

      {/* Mission Statement */}
      <Card className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto">
            To provide civil engineering students and professionals with a powerful, 
            free, and privacy-respecting calculation tool that simplifies complex 
            engineering computations while promoting understanding of fundamental principles.
          </p>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-civil-structural to-civil-fluid rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Stack */}
      <Card title="Technical Stack" className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">React 18+</p>
            <p className="text-sm text-gray-600">UI Framework</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">Tailwind CSS</p>
            <p className="text-sm text-gray-600">Styling</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">Zustand</p>
            <p className="text-sm text-gray-600">State Management</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">Plotly.js</p>
            <p className="text-sm text-gray-600">Visualizations</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">mathjs</p>
            <p className="text-sm text-gray-600">Math Engine</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">jsPDF</p>
            <p className="text-sm text-gray-600">PDF Reports</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">Vite</p>
            <p className="text-sm text-gray-600">Build Tool</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">LocalStorage</p>
            <p className="text-sm text-gray-600">Data Persistence</p>
          </div>
        </div>
      </Card>

      {/* Calculation Methods */}
      <Card title="Engineering Methods Implemented" className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-civil-structural mb-2">Structural Analysis</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Beam Analysis (SFD, BMD, Deflection)</li>
              <li>• Simpson's Rule Integration</li>
              <li>• Moment-Area Method</li>
              <li>• Section Properties</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-civil-geotech mb-2">Geotechnical Engineering</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Terzaghi Bearing Capacity</li>
              <li>• Meyerhof Theory</li>
              <li>• Settlement Analysis</li>
              <li>• Earth Pressure (Rankine)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-civil-fluid mb-2">Fluid Mechanics</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Manning's Equation</li>
              <li>• Normal & Critical Depth</li>
              <li>• Darcy-Weisbach</li>
              <li>• Hydraulic Jump</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-civil-transport mb-2">Transportation</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Greenshields Traffic Model</li>
              <li>• Horizontal/Vertical Curves</li>
              <li>• Stopping Sight Distance</li>
              <li>• Webster Signal Timing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-civil-environmental mb-2">Environmental</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• BOD Kinetics</li>
              <li>• Streeter-Phelps Model</li>
              <li>• Sedimentation Design</li>
              <li>• Gaussian Plume Model</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-civil-surveying mb-2">Surveying</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Rise/Fall Leveling</li>
              <li>• Traverse Computation</li>
              <li>• Area Calculation</li>
              <li>• Curve Setting Out</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* About Concreate Club */}
      <Card className="mb-12 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Concreate Club</h2>
            <p className="text-slate-300">Indian Institute of Technology Indore</p>
          </div>
        </div>
        <p className="text-slate-300 mb-6">
          Concreate Club is the official civil engineering club of IIT Indore. We are dedicated to 
          fostering innovation, practical learning, and community building among civil engineering 
          students. CiviCalc is one of our flagship projects aimed at making engineering calculations 
          more accessible to students everywhere.
        </p>
        <div className="flex flex-wrap gap-4">
          <a 
            href="https://concreate.iiti.ac.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Concrete Club IIT Indore</span>
          </a>
        </div>
      </Card>

      {/* Privacy Notice */}
      <Card title="Privacy & Data" className="mb-12">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Data Stays With You</h3>
            <p className="text-gray-600">
              CiviCalc is a 100% client-side application. All calculations are performed in your 
              browser, and your data is stored only in your device's local storage. We don't collect, 
              transmit, or store any of your calculation data on external servers. Your engineering 
              work remains completely private.
            </p>
          </div>
        </div>
      </Card>

      {/* Contact */}
      <div className="text-center py-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
        <p className="text-gray-600 mb-4">
          Have suggestions, found a bug, or want to contribute? We'd love to hear from you!
        </p>
        <a 
          href="mailto:concreate@iiti.ac.in"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-civil-structural text-white rounded-lg hover:bg-civil-structural/90 transition-colors"
        >
          <Mail className="w-5 h-5" />
          <span>Contact Us</span>
        </a>
      </div>
    </div>
  );
}

export default About;
