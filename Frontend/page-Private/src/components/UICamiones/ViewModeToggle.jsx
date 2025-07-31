import React from 'react';
import { Grid, List } from 'lucide-react';

const ViewModeToggle = ({ 
  viewMode, 
  onViewModeChange, 
  primaryColor = '#5F8EAD' 
}) => {
  return (
    <div className="flex bg-white bg-opacity-20 rounded-xl p-1">
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded-lg transition-all duration-200 ${
          viewMode === 'grid' 
            ? 'bg-white text-white' 
            : 'text-white hover:bg-white hover:bg-opacity-20'
        }`}
        style={{
          color: viewMode === 'grid' ? primaryColor : undefined
        }}
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 rounded-lg transition-all duration-200 ${
          viewMode === 'list' 
            ? 'bg-white text-white' 
            : 'text-white hover:bg-white hover:bg-opacity-20'
        }`}
        style={{
          color: viewMode === 'list' ? primaryColor : undefined
        }}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ViewModeToggle;