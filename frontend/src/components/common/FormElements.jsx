import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react';

// Modern Input Component
export const Input = ({ 
  label, 
  type = 'text', 
  error, 
  success,
  helper,
  icon: Icon,
  required,
  disabled,
  fullWidth = true,
  size = 'md',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };
  
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4'
  };

  const baseClasses = `
    block rounded-lg border transition-all duration-200 outline-none
    disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${sizes[size]}
    ${Icon ? 'pl-9' : ''}
    ${isPassword ? 'pr-9' : ''}
    ${success ? 'pr-9' : ''}
    ${error ? 'pr-9 border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : ''}
    ${!error && !success ? 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20' : ''}
    ${success ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20' : ''}
    ${disabled ? 'bg-slate-50' : 'bg-white'}
  `;

  const handleTogglePassword = () => setShowPassword(!showPassword);

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className={`${iconSizes[size]} text-slate-400 ${isFocused ? 'text-slate-600' : ''} transition-colors`} />
          </div>
        )}
        
        {/* Input Field */}
        <input
          type={inputType}
          className={baseClasses}
          onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : helper ? `${props.id}-helper` : undefined}
          {...props}
        />
        
        {/* Password Toggle */}
        {isPassword && !disabled && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className={`${iconSizes[size]}`} /> : <Eye className={`${iconSizes[size]}`} />}
          </button>
        )}
        
        {/* Success Icon */}
        {success && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Check className={`${iconSizes[size]} text-emerald-500`} />
          </div>
        )}
        
        {/* Error Icon */}
        {error && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className={`${iconSizes[size]} text-red-500`} />
          </div>
        )}
      </div>
      
      {/* Helper Text */}
      <AnimatePresence>
        {helper && !error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-slate-500 ml-0.5"
          >
            {helper}
          </motion.p>
        )}
      </AnimatePresence>
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-red-500 ml-0.5 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modern Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  ...props 
}) => {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-900 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100',
    outline: 'bg-transparent text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-sm',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  };
  
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  };
  
  const loadingSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };
  
  const baseClasses = `
    relative inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-offset-1
    ${fullWidth ? 'w-full' : ''}
    ${sizes[size]}
    ${variants[variant]}
  `;
  
  const focusRing = {
    primary: 'focus:ring-slate-400/30',
    secondary: 'focus:ring-slate-300/30',
    outline: 'focus:ring-slate-300/30',
    ghost: 'focus:ring-slate-300/30',
    danger: 'focus:ring-red-400/30',
    success: 'focus:ring-emerald-400/30',
    warning: 'focus:ring-amber-400/30',
  };
  
  // Ripple effect component
  const RippleEffect = ({ color = 'rgba(255,255,255,0.3)' }) => {
    const [ripples, setRipples] = useState([]);
    
    const addRipple = (event) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const ripple = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        id: Date.now()
      };
      
      setRipples([...ripples, ripple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== ripple.id));
      }, 600);
    };
    
    return (
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: color,
              transform: 'translate(-50%, -50%)',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}
          />
        ))}
      </div>
    );
  };
  
  return (
    <button
      className={`${baseClasses} ${focusRing[variant]}`}
      disabled={isLoading || props.disabled}
      onClick={props.onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <svg 
            className={`animate-spin ${loadingSizes[size]}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} />}
        </>
      )}
      
      {/* Ripple effect on click */}
      {!isLoading && !props.disabled && <RippleEffect color={variant === 'primary' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} />}
    </button>
  );
};

// Textarea Component
export const Textarea = ({ 
  label, 
  error, 
  helper,
  rows = 4,
  required,
  disabled,
  fullWidth = true,
  size = 'md',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };
  
  const baseClasses = `
    block rounded-lg border transition-all duration-200 outline-none resize-y
    disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${sizes[size]}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : ''}
    ${!error ? 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20' : ''}
    ${disabled ? 'bg-slate-50' : 'bg-white'}
  `;
  
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      <textarea
        rows={rows}
        className={baseClasses}
        onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        {...props}
      />
      
      {helper && !error && (
        <p className="text-xs text-slate-500 ml-0.5">{helper}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 ml-0.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// Select Component
export const Select = ({ 
  label, 
  options, 
  error, 
  helper,
  required,
  disabled,
  fullWidth = true,
  size = 'md',
  placeholder = 'Select an option',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };
  
  const baseClasses = `
    block rounded-lg border transition-all duration-200 outline-none appearance-none
    disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${sizes[size]}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : ''}
    ${!error ? 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20' : ''}
    ${disabled ? 'bg-slate-50' : 'bg-white'}
  `;
  
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          className={baseClasses}
          onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
          disabled={disabled}
          required={required}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {helper && !error && (
        <p className="text-xs text-slate-500 ml-0.5">{helper}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 ml-0.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// Add ripple animation to global CSS or tailwind.config.js
// Add this to your global CSS:
// @keyframes ripple {
//   0% { transform: scale(0); opacity: 1; }
//   100% { transform: scale(20); opacity: 0; }
// }
// .animate-ripple {
//   animation: ripple 0.6s ease-out;
// }