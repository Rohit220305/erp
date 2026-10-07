"use client";

import React from 'react';

export class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ModuleError - ${this.props.moduleName || 'Unknown'}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-lg font-bold text-red-800 mb-2">
            Something went wrong in {this.props.moduleName || 'this module'}
          </h2>
          <p className="text-sm text-red-600 mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ModuleErrorBoundary;
