import React from 'react';

export const Input = ({ label, type = 'text', error, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-slate-700 ml-0.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`px-4 py-2.5 rounded-xl border bg-white/50 backdrop-blur-sm transition-all duration-200 outline-none
          ${error 
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
            : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
          }`}
        {...props}
      />
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
