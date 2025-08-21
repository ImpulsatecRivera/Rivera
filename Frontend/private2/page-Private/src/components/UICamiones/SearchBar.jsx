import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Buscar...", 
  className = "",
  maxWidth = "max-w-md" 
}) => {
  return (
    <div className={`relative flex-1 ${maxWidth} ${className}`}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input 
        type="text" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-700 placeholder-gray-400 shadow-lg"
      />
    </div>
  );
};

export default SearchBar;