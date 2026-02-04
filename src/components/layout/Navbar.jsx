import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Mountain, 
  Droplets, 
  Car, 
  Trees, 
  MapPin,
  Menu,
  X,
  Calculator,
  Home,
  Boxes,
  Network
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/structural', label: 'Structural', icon: Building2, color: 'text-blue-600' },
  { path: '/geotech', label: 'Geotechnical', icon: Mountain, color: 'text-amber-700' },
  { path: '/fluid', label: 'Fluid Mechanics', icon: Droplets, color: 'text-cyan-600' },
  { path: '/transport', label: 'Transportation', icon: Car, color: 'text-emerald-600' },
  { path: '/environmental', label: 'Environmental', icon: Trees, color: 'text-green-600' },
  { path: '/surveying', label: 'Surveying', icon: MapPin, color: 'text-purple-600' },
  { path: '/concrete', label: 'Concrete', icon: Boxes, color: 'text-slate-600' },
  { path: '/construction', label: 'CPM/PERT', icon: Network, color: 'text-rose-600' },
];

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">CiviCalc</span>
                <span className="block text-xs text-gray-500 -mt-1">Concreate Club, IIT Indore</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${active 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : item.color || 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${active 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : item.color || 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
