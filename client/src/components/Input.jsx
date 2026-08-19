import React from 'react';

export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  type = 'text',
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-xs font-semibold text-[#121c2a]">{label}</label>}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#767586]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          type={type}
          className={`block w-full rounded-lg border border-[#c7c4d7] bg-white text-[#121c2a] text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent transition placeholder:text-[#767586] ${
            Icon ? 'pl-9' : ''
          } ${error ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#ba1a1a]">{error}</p>}
    </div>
  );
};

export const TextArea = ({ label, error, className = '', rows = 4, ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-xs font-semibold text-[#121c2a]">{label}</label>}
      <textarea
        rows={rows}
        className={`block w-full rounded-lg border border-[#c7c4d7] bg-white text-[#121c2a] text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent transition placeholder:text-[#767586] ${
          error ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#ba1a1a]">{error}</p>}
    </div>
  );
};
