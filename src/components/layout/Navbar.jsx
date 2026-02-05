import React, { useState, useEffect, useRef } from 'react';
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
  Box,
  GitBranch,
  ChevronDown,
  Zap
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home, color: 'from-blue-500 to-blue-600' },
  { path: '/structural', label: 'Structural', icon: Building2, color: 'from-blue-500 to-indigo-600' },
  { path: '/geotech', label: 'Geotechnical', icon: Mountain, color: 'from-amber-500 to-orange-600' },
  { path: '/fluid', label: 'Fluid Mechanics', icon: Droplets, color: 'from-cyan-500 to-blue-600' },
  { path: '/transport', label: 'Transportation', icon: Car, color: 'from-emerald-500 to-green-600' },
  { path: '/environmental', label: 'Environmental', icon: Trees, color: 'from-green-500 to-emerald-600' },
  { path: '/surveying', label: 'Surveying', icon: MapPin, color: 'from-purple-500 to-violet-600' },
  { path: '/concrete', label: 'Concrete', icon: Box, color: 'from-slate-500 to-gray-600' },
  { path: '/construction', label: 'CPM/PERT', icon: GitBranch, color: 'from-rose-500 to-pink-600' },
];

// Group navigation items for dropdown
const navGroups = {
  main: [
    { path: '/', label: 'Home', icon: Home, color: 'from-blue-500 to-blue-600' },
  ],
  analysis: [
    { path: '/structural', label: 'Structural', icon: Building2, color: 'from-blue-500 to-indigo-600' },
    { path: '/geotech', label: 'Geotechnical', icon: Mountain, color: 'from-amber-500 to-orange-600' },
    { path: '/fluid', label: 'Fluid Mechanics', icon: Droplets, color: 'from-cyan-500 to-blue-600' },
  ],
  design: [
    { path: '/concrete', label: 'Concrete Mix', icon: Box, color: 'from-slate-500 to-gray-600' },
    { path: '/construction', label: 'CPM/PERT', icon: GitBranch, color: 'from-rose-500 to-pink-600' },
  ],
  other: [
    { path: '/transport', label: 'Transportation', icon: Car, color: 'from-emerald-500 to-green-600' },
    { path: '/environmental', label: 'Environmental', icon: Trees, color: 'from-green-500 to-emerald-600' },
    { path: '/surveying', label: 'Surveying', icon: MapPin, color: 'from-purple-500 to-violet-600' },
  ]
};

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const DropdownMenu = ({ title, items, groupKey }) => {
    const isOpen = activeDropdown === groupKey;
    const hasActiveItem = items.some(item => isActive(item.path));

    return (
      <div className="relative" ref={isOpen ? dropdownRef : null}>
        <button
          onClick={() => setActiveDropdown(isOpen ? null : groupKey)}
          className={`
            flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium
            transition-all duration-200
            ${hasActiveItem 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
        >
          <span>{title}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setActiveDropdown(null)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${active 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-md` 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${active 
                      ? 'bg-white/20' 
                      : `bg-gradient-to-br ${item.color} bg-opacity-10`
                    }
                  `}>
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-white'}`} />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={`
      sticky top-0 z-50 transition-all duration-300
      ${scrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/50 border-b border-gray-100' 
        : 'bg-white/95 backdrop-blur-md border-b border-gray-200/80'
      }
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105 rotate-3 group-hover:rotate-0">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <Zap className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  CiviCalc
                </span>
                <span className="block text-xs text-gray-500 font-medium -mt-0.5">
                  Civil Engineering Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Home */}
            <Link
              to="/"
              className={`
                flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive('/') 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {/* Analysis Dropdown */}
            <DropdownMenu title="Analysis" items={navGroups.analysis} groupKey="analysis" />

            {/* Design Dropdown */}
            <DropdownMenu title="Design" items={navGroups.design} groupKey="design" />

            {/* Other Tools Dropdown */}
            <DropdownMenu title="More Tools" items={navGroups.other} groupKey="other" />

            {/* Quick Access - most used */}
            <div className="h-6 w-px bg-gray-200 mx-2" />
            
            {[navItems[7], navItems[1]].map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${active 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-blue-500/25` 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 ${active ? '' : ''}`} />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`
                p-2.5 rounded-xl transition-all duration-200
                ${isMobileMenuOpen 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
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
      <div className={`
        lg:hidden overflow-hidden transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-4 py-4 space-y-2 bg-gray-50/80 backdrop-blur-xl border-t border-gray-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${active 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${active 
                    ? 'bg-white/20' 
                    : `bg-gradient-to-br ${item.color}`
                  }
                `}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
