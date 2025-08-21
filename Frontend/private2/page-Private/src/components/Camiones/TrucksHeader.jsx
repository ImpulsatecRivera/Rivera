import React from 'react';
import { Truck, Plus } from 'lucide-react';
import SearchBar from '../../components/UICamiones/SearchBar';
import ViewModeToggle from '../../components/UICamiones/ViewModeToggle';

const TrucksHeader = ({ 
  filteredTrucksCount,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onAddTruck,
  primaryColor = '#5F8EAD'
}) => {
  return (
    <div className="p-8 pb-6" style={{background: `linear-gradient(135deg, ${primaryColor} 0%, #4a7ba7 100%)`}}>
      {/* Título principal */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Flota</h1>
          <p className="text-blue-100 text-lg">Administra tu flota de vehículos</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
          <Truck className="w-8 h-8 text-white" />
        </div>
      </div>
      
      {/* Sección de estadísticas y controles */}
      <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
        {/* Estadísticas */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Flota de Camiones</h2>
            <div className="text-blue-100 flex items-center space-x-4">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                {filteredTrucksCount} {filteredTrucksCount === 1 ? 'Vehículo' : 'Vehículos'}
              </span>
              {searchTerm && (
                <span className="text-sm opacity-80">
                  Filtrado por: "{searchTerm}"
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Barra de búsqueda y controles */}
        <div className="flex items-center justify-between space-x-4">
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por nombre, placa o marca..."
            maxWidth="max-w-md"
          />
          
          <div className="flex items-center space-x-3">
            {/* Toggle de vista */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              primaryColor={primaryColor}
            />

            {/* Botón agregar */}
            <button 
              onClick={onAddTruck} 
              className="flex items-center space-x-2 px-6 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all duration-200 shadow-lg backdrop-blur-sm font-medium group"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Agregar Camión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrucksHeader;