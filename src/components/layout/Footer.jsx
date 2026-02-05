import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Heart, ExternalLink } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <span className="text-xl font-bold">CiviCalc</span>
                <span className="block text-xs text-gray-400">Civil Engineering Calculator</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              A comprehensive suite of civil engineering calculators designed for students, 
              engineers, and professionals. All calculations run locally in your browser - 
              no data is sent to any server.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Calculators
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/structural" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Structural Analysis
                </Link>
              </li>
              <li>
                <Link to="/geotech" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Geotechnical
                </Link>
              </li>
              <li>
                <Link to="/fluid" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Fluid Mechanics
                </Link>
              </li>
              <li>
                <Link to="/transport" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Transportation
                </Link>
              </li>
              <li>
                <Link to="/environmental" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Environmental
                </Link>
              </li>
              <li>
                <Link to="/surveying" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Surveying
                </Link>
              </li>
              <li>
                <Link to="/concrete" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Concrete Mix Design
                </Link>
              </li>
              <li>
                <Link to="/construction" className="text-gray-300 hover:text-white transition-colors text-sm">
                  CPM/PERT Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              About
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  About CiviCalc
                </Link>
              </li>
              <li>
                <a 
                  href="https://concreate.iiti.ac.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
                >
                  <img 
                    src="/concreate-logo.png" 
                    alt="Concreate Club Logo" 
                    className="w-5 h-5 object-contain rounded"
                  />
                  Concrete Club IIT Indore
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                >
                  <Github className="w-4 h-4" />
                  View on GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} CiviCalc. Built with{' '}
            <Heart className="w-4 h-4 inline text-red-500 fill-current" /> by{' '}
            <span className="text-white font-medium">Rajnish</span>
          </p>
          <p className="text-gray-500 text-xs mt-2 sm:mt-0">
            Powered by Concreate Club, IIT Indore
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="text-xs text-gray-500">
              100% Client-Side • No Data Collection • Open Source
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
