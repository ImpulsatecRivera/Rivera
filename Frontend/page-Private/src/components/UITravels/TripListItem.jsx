// components/TripListItem.jsx
import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const TripListItem = ({ trip, index, onMenuClick }) => {
  return (
    <div className="flex items-center p-3 hover:bg-white rounded-xl transition-colors group">
      <div className={`w-10 h-10 rounded-full ${trip.color} flex items-center justify-center mr-4`}>
        <span className="text-white text-sm">
          {trip.icon}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">{trip.type}</div>
            <div className="text-sm text-gray-500">{trip.time} • {trip.description}</div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onMenuClick(trip, index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
            >
              <MoreHorizontal size={16} className="text-gray-400" />
            </button>
            <div className={`w-3 h-3 rounded-full ${trip.status}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripListItem;