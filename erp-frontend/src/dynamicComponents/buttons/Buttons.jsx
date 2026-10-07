"use client";

import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react'; 

const baseClass =
  'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1565c0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-6 py-3 text-base rounded-lg',
};

const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export const PrimaryButton = ({ label, children, onClick, loading, disabled, type = 'button', size = 'md', icon: Icon, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${sizeClasses[size]} bg-[#1565c0] text-white hover:bg-[#0f57a6] min-w-[100px] ${className}`}
    >
      {loading && <LoadingSpinner />}
      {!loading && Icon && <Icon className="w-4 h-4 mr-2" />}
      {children || label}
    </button>
  );
};

export const SecondaryButton = ({ label, children, onClick, loading, disabled, type = 'button', size = 'md', icon: Icon, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${sizeClasses[size]} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 ${className}`}
    >
      {loading && <LoadingSpinner />}
      {!loading && Icon && <Icon className="w-4 h-4 mr-2" />}
      {children || label}
    </button>
  );
};

export const DangerButton = ({ label, children, onClick, loading, disabled, type = 'button', size = 'md', icon: Icon, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${sizeClasses[size]} bg-red-600 text-white hover:bg-red-700 ${className}`}
    >
      {loading && <LoadingSpinner />}
      {!loading && Icon && <Icon className="w-4 h-4 mr-2" />}
      {children || label}
    </button>
  );
};

export const IconButton = ({ onClick, disabled, type = 'button', icon: Icon, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1565c0] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
    </button>
  );
};

export const LinkButton = ({ label, onClick, disabled, type = 'button', icon: Icon, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center text-[#1565c0] hover:underline bg-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 mr-1" />}
      {label}
    </button>
  );
};

export const ActionDropdown = ({ actions = [], item, can = () => true, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [dropdownId] = useState(() => 'dropdown-' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(`#${dropdownId}`)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, dropdownId]);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    setIsOpen(false);
    if (action.onClick) {
      action.onClick(item);
    }
  };

  const visibleActions = actions.filter((action) => {
    if (action.permission && !can(action.permission)) return false;
    return true;
  });

  if (visibleActions.length === 0) return null;

  return (
    <div id={dropdownId} className={`relative inline-block text-left ${className}`}>
      <IconButton icon={MoreVertical} onClick={toggleDropdown} />

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {visibleActions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => handleActionClick(e, action)}
                className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors ${
                  action.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                role="menuitem"
              >
                {action.icon && <action.icon className="mr-3 h-4 w-4" aria-hidden="true" />}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
