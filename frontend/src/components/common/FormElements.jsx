import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const Input = ({ label, type = 'text', error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <motion.label
          className="text-sm font-medium text-slate-700 ml-0.5"
          animate={{
            color: isFocused ? '#475569' : '#334155',
            x: isFocused ? 2 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      <motion.div
        className="relative"
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <input
          type={type}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white/60 backdrop-blur-sm transition-all duration-300 outline-none
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
              : isFocused
                ? 'border-slate-500 shadow-[0_0_20px_rgba(100,116,139,0.25)] bg-white'
                : 'border-slate-200 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10'
            }`}
          onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
          onKeyDown={props.onKeyDown}
          {...Object.fromEntries(Object.entries(props).filter(([key]) => !['onFocus', 'onBlur', 'onKeyDown'].includes(key)))}
        />
        {/* Animated glow ring */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={false}
          animate={{
            opacity: isFocused && !error ? 1 : 0,
            scale: isFocused && !error ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
          style={{
            boxShadow: '0 0 30px rgba(100, 116, 139, 0.3), 0 0 60px rgba(100, 116, 139, 0.15)',
          }}
        />
      </motion.div>
      {error && <p className="text-xs text-red-500 ml-0.5 font-medium">{error}</p>}
    </div>
  );
};

export const Button = ({ children, variant = 'primary', isLoading, ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-slate-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-red-200',
  };

  return (
    <button
      className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg active:scale-[0.98] flex items-center justify-center gap-2
        ${variants[variant]}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Processing...</span>
        </>
      ) : children}
    </button>
  );
};
