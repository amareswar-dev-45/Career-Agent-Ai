import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action }) => {
  return (
    <div className={`bg-white border border-[#e6eeff] rounded-xl p-6 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 border-b border-[#e6eeff] pb-3">
          <div>
            {title && <h3 className="font-semibold text-lg text-[#121c2a]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#767586] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export const StatCard = ({ title, value, change, icon: Icon, color = 'bg-[#4648d4]' }) => {
  return (
    <div className="bg-white border border-[#e6eeff] rounded-xl p-5 shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-[#767586] uppercase tracking-wider">{title}</span>
        <div className="text-2xl font-bold text-[#121c2a] tracking-tight">{value}</div>
        {change && <span className="text-xs font-medium text-[#4648d4]">{change}</span>}
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
