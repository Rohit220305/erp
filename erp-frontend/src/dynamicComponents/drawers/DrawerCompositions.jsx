"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const CloseButton = ({ onClick }) => (
  <button 
    type="button" 
    onClick={onClick}
    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
  >
    <X size={20} />
  </button>
);

export const DrawerShell = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = 'w-full sm:w-[400px] md:w-[500px]' 
}) => {
  
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {}
      <div 
        className="absolute inset-0 bg-black/20 transition-opacity"
        onClick={onClose}
      />
      
      {}
      <div className={`relative bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0 ${width}`}>
        
        {}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 truncate pr-4">{title}</h2>
          <CloseButton onClick={onClose} />
        </div>
        
        {}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const DrawerSection = ({ title, children, className = '' }) => {
  return (
    <div className={`border-t border-gray-100 pt-6 mt-6 first:border-t-0 first:pt-0 first:mt-0 ${className}`}>
      {title && (
        <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
