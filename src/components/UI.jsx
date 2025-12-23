import React from 'react';

export const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm ${className}`}>
    {children}
  </div>
);

export const Button = ({ onClick, variant = "primary", children, className = "", icon: Icon, disabled }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20",
    secondary: "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
    ghost: "bg-transparent text-zinc-400 hover:text-zinc-200",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    cyan: "bg-cyan-500 text-zinc-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20",
    purple: "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20",
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};
