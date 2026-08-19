import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-popover border border-[#e6eeff] w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-[#e6eeff] pb-3 mb-4">
          <h3 className="font-semibold text-lg text-[#121c2a]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#767586] hover:text-[#121c2a] p-1 rounded-lg hover:bg-[#e6eeff] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 border-3 border-[#e6eeff] border-t-[#4648d4] rounded-full animate-spin"></div>
      <p className="text-xs font-medium text-[#767586]">{label}</p>
    </div>
  );
};
