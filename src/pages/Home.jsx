import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Mountain, 
  Droplets, 
  Car, 
  Trees, 
  MapPin,
  ArrowRight,
  Calculator,
  Zap,
  Lock,
  Download
} from 'lucide-react';

const modules = [
  {
    id: 'structural',
    title: 'Structural Engineering',
    description: 'Beam analysis, SFD, BMD, deflection calculations, section properties',
    icon: Building2,
    path: '/structural',
    color: 'from-blue-500 to-blue-700',
    bgColor: 'bg-blue-50',
    features: ['Simply Supported Beams', 'Point & UDL Loads', 'SFD/BMD Diagrams', 'Deflection Analysis']
  },
  {
    id: 'geotech',
    title: 'Geotechnical Engineering',
    description: 'Bearing capacity, settlement analysis, earth pressure calculations',
    icon: Mountain,
    path: '/geotech',
    color: 'from-amber-600 to-amber-800',
    bgColor: 'bg-amber-50',
    features: ['Terzaghi\'s Theory', 'Meyerhof\'s Method', 'Settlement Analysis', 'Earth Pressure']
  },
  {
    id: 'fluid',
    title: 'Fluid Mechanics',
    description: 'Open channel flow, pipe flow, Manning\'s equation, hydraulic jump',
    icon: Droplets,
    path: '/fluid',
    color: 'from-cyan-500 to-cyan-700',
    bgColor: 'bg-cyan-50',
    features: ['Manning\'s Equation', 'Critical/Normal Depth', 'Pipe Flow Analysis', 'Hydraulic Jump']
  },
  {
    id: 'transport',
    title: 'Transportation Engineering',
    description: 'Traffic flow analysis, highway geometric design, signal timing',
    icon: Car,
    path: '/transport',
    color: 'from-emerald-500 to-emerald-700',
    bgColor: 'bg-emerald-50',
    features: ['Greenshields Model', 'Horizontal Curves', 'Vertical Curves', 'Signal Timing']
  },
  {
    id: 'environmental',
    title: 'Environmental Engineering',
    description: 'Water treatment, wastewater design, air pollution modeling',
    icon: Trees,
    path: '/environmental',
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    features: ['BOD Kinetics', 'Oxygen Sag Curve', 'Sedimentation Design', 'Gaussian Plume']
  },
  {
    id: 'surveying',
    title: 'Surveying',
    description: 'Leveling, traverse computation, area calculation, curve setting',
    icon: MapPin,
    path: '/surveying',
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    features: ['Rise & Fall Method', 'Traverse Computation', 'Area Calculation', 'Curve Setting']
  }
];

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Calculator className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium">Civil Engineering Calculator Suite</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                CiviCalc
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Professional-grade civil engineering calculations running 
              <span className="text-white font-semibold"> 100% in your browser</span>. 
              No servers, no data collection, just pure computation.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link
                to="/structural"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Start Calculating
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors backdrop-blur-sm"
              >
                Learn More
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <Lock className="w-5 h-5 text-green-400" />
                <span>100% Private</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <Download className="w-5 h-5 text-blue-400" />
                <span>PDF Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 50L60 45.8C120 41.7 240 33.3 360 35.8C480 38.3 600 51.7 720 58.3C840 65 960 65 1080 60.8C1200 56.7 1320 48.3 1380 44.2L1440 40V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" 
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Engineering Calculator Modules
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from six comprehensive calculation modules covering all major areas of civil engineering
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.id}
                  to={module.path}
                  className={`
                    module-card group
                    bg-white border border-gray-200
                    animate-fade-in stagger-${index + 1}
                  `}
                  style={{ opacity: 0, animationFillMode: 'forwards' }}
                >
                  <div className={`
                    inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4
                    bg-gradient-to-br ${module.color} text-white
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {module.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {module.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {module.features.slice(0, 3).map((feature) => (
                      <span 
                        key={feature}
                        className={`text-xs px-2 py-1 rounded-full ${module.bgColor} text-gray-700`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open Calculator
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Built for Engineers, by Engineers
              </h2>
              <p className="text-gray-600 mb-6">
                CiviCalc is developed by the <strong>Concreate Club at IIT Indore</strong>, 
                designed to provide students and professionals with reliable, accurate, 
                and instant civil engineering calculations.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <strong className="text-gray-900">Client-Side Processing</strong>
                    <p className="text-gray-600 text-sm">All calculations run in your browser. Your data never leaves your device.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <strong className="text-gray-900">Interactive Visualizations</strong>
                    <p className="text-gray-600 text-sm">Dynamic charts and diagrams help you understand and verify results.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <strong className="text-gray-900">PDF Report Generation</strong>
                    <p className="text-gray-600 text-sm">Export professional reports with all calculations, inputs, and visualizations.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="text-center">
                <img 
                  src="/concreate-logo.png" 
                  alt="Concreate Club Logo" 
                  className="w-20 h-20 object-contain rounded-2xl mx-auto mb-6"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Concreate Club</h3>
                <p className="text-gray-600 mb-4">IIT Indore</p>
                <p className="text-sm text-gray-500">
                  Advancing civil engineering education through technology and innovation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
