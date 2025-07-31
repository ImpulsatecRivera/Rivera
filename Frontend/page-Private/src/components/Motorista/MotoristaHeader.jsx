import React from 'react';
import { Search, User, ChevronDown, Plus } from 'lucide-react';

const MotoristaHeader = ({ 
  filterMotoristas, 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy, 
  handleContinue,
}) => {
  return (
    <div className="p-8 pb-6" style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #4a7ba7 100%)'}}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Motoristas</h1>
          <p className="text-blue-100 text-lg">Administra tu equipo de conductores</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
          <User className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Directorio de Motoristas</h2>
            <div className="text-blue-100 flex items-center">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                {filterMotoristas.length} Registrados
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar motoristas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-700 placeholder-gray-400 shadow-lg"
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border-0 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-700 shadow-lg"
              >
                <option value="Newest">Más Recientes</option>
                <option value="Oldest">Más Antiguos</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            <button 
              onClick={handleContinue} 
              className="flex items-center space-x-2 px-6 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all duration-200 shadow-lg backdrop-blur-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Motorista</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotoristaHeader;