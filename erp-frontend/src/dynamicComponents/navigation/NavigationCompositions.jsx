import React from 'react';

export const TabNav = ({ tabs = [], activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1565c0] rounded-t-sm
                ${isActive 
                  ? 'border-[#1565c0] text-[#1565c0]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium inline-block
                  ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
