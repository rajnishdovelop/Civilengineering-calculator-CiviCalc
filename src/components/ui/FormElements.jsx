import React from 'react';

/**
 * Form Input Component
 */
export function FormInput({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'number',
  unit = '',
  placeholder = '',
  min,
  max,
  step = 'any',
  required = false,
  disabled = false,
  className = '',
  helpText = ''
}) {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {unit && <span className="text-gray-400 font-normal ml-1">({unit})</span>}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        disabled={disabled}
        className="form-input"
      />
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
}

/**
 * Form Select Component
 */
export function FormSelect({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  required = false,
  disabled = false,
  className = '',
  helpText = ''
}) {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="form-select"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
}

/**
 * Form Textarea Component
 */
export function FormTextarea({ 
  label, 
  name, 
  value, 
  onChange, 
  rows = 3,
  placeholder = '',
  required = false,
  disabled = false,
  className = ''
}) {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="form-input resize-none"
      />
    </div>
  );
}

/**
 * Result Display Component
 */
export function ResultDisplay({ label, value, unit = '', highlight = false }) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'result-box' : 'bg-gray-50'}`}>
      <p className={`text-sm ${highlight ? 'text-blue-600' : 'text-gray-600'}`}>{label}</p>
      <p className={`text-xl font-semibold ${highlight ? 'text-blue-700' : 'text-gray-900'}`}>
        {value}
        {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </p>
    </div>
  );
}

/**
 * Result Grid Component
 */
export function ResultGrid({ results, columns = 3 }) {
  return (
    <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`}>
      {results.map((result, index) => (
        <ResultDisplay
          key={index}
          label={result.label}
          value={result.value}
          unit={result.unit}
          highlight={result.highlight}
        />
      ))}
    </div>
  );
}

/**
 * Button Component
 */
export function Button({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  className = ''
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    outline: 'btn-outline'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <span className="spinner mr-2" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
}

/**
 * Card Component
 */
export function Card({ title, children, className = '', actions }) {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Tabs Component
 */
export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.icon && <tab.icon className="w-4 h-4 inline mr-2" />}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

/**
 * Alert Component
 */
export function Alert({ type = 'info', title, message, onClose }) {
  const types = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div className={`rounded-lg border p-4 ${types[type]}`}>
      <div className="flex justify-between">
        <div>
          {title && <h4 className="font-semibold">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-current opacity-50 hover:opacity-100">
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Loading Spinner
 */
export function Spinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`spinner ${sizes[size]}`} />
  );
}

/**
 * Badge Component
 */
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export default {
  FormInput,
  FormSelect,
  FormTextarea,
  ResultDisplay,
  ResultGrid,
  Button,
  Card,
  Tabs,
  Alert,
  Spinner,
  Badge
};
