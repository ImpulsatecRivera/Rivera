import React from 'react';
import { Search, Plus, ChevronDown, Briefcase } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { ProtectedAction, RoleBadge } from '../Auth';

const EmployeeHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy, 
  filterEmpleados, 
  handleContinue,
  onStartTutorial,
  hasCompletedTutorial
}) => {
  const { canCreate } = usePermissions();

  return (
    <div className="p-8 pb-6" style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #4a7ba7 100%)'}}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Empleados</h1>
          <p className="text-blue-100 text-lg">Administra tu equipo de trabajo</p>
        </div>
        <div className="flex items-center gap-4">
          <RoleBadge className="text-base" />
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      
      <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Directorio de Empleados</h2>
            <div className="text-blue-100 flex items-center">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                {filterEmpleados.length} Registrados
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar empleados..." 
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
            
            {/* Botón tutorial */}
            <button
              onClick={onStartTutorial}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#5F8EAD] text-[#5F8EAD] rounded-xl hover:bg-[#5F8EAD] hover:text-white font-bold shadow-lg transition-all transform hover:scale-105 backdrop-blur-sm"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9M12 14C13.1 14 14 14.9 14 16C14 17.1 13.1 18 12 18C10.9 18 10 17.1 10 16C10 14.9 10.9 14 12 14ZM12 19C13.1 19 14 19.9 14 21C14 22.1 13.1 23 12 23C10.9 23 10 22.1 10 21C10 19.9 10.9 19 12 19Z" fill="currentColor"/>
              </svg>
              <span>Tutorial</span>
              {!hasCompletedTutorial && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  !
                </span>
              )}
            </button>

            <ProtectedAction action="create">
              <button 
                onClick={handleContinue} 
                className="flex items-center space-x-2 px-6 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all duration-200 shadow-lg backdrop-blur-sm font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Empleado</span>
              </button>
            </ProtectedAction>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHeader;