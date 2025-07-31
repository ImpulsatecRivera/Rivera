import React from 'react';
import { Filter, X } from 'lucide-react';
import StatusFilterButton from '../../components/UICamiones/StatusFilterButton';

const FiltersSection = ({ 
  statusFilter,
  onStatusFilterChange,
  statusCounts,
  primaryColor = '#5F8EAD'
}) => {
  const filterButtons = [
    { 
      status: 'all', 
      label: 'Todos', 
      count: statusCounts.all,
      description: 'Mostrar todos los camiones'
    },
    { 
      status: 'disponible', 
      label: 'Disponible', 
      count: statusCounts.disponible,
      description: 'Camiones listos para usar'
    },
    { 
      status: 'en_ruta', 
      label: 'En Ruta', 
      count: statusCounts.en_ruta,
      description: 'Camiones actualmente en viaje'
    },
    { 
      status: 'mantenimiento', 
      label: 'Mantenimiento', 
      count: statusCounts.mantenimiento,
      description: 'Camiones en reparación'
    },
    { 
      status: 'no_disponible', 
      label: 'No Disponible', 
      count: statusCounts.no_disponible,
      description: 'Camiones fuera de servicio'
    },
    { 
      status: 'sin_estado', 
      label: 'Sin Estado', 
      count: statusCounts.sin_estado,
      description: 'Camiones sin estado definido'
    }
  ];

  const hasActiveFilter = statusFilter !== 'all';
  const activeFilterInfo = filterButtons.find(btn => btn.status === statusFilter);

  return (
    <div className="px-8 py-6 border-b border-gray-100" style={{backgroundColor: '#f8fafc'}}>
      <div className="flex items-center justify-between">
        
        {/* Sección izquierda - Título y filtro activo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Filtrar por estado:</span>
          </div>
          
          {/* Mostrar filtro activo si no es 'all' */}
          {hasActiveFilter && activeFilterInfo && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-700 font-medium">
                Activo: {activeFilterInfo.label}
              </span>
              <button
                onClick={() => onStatusFilterChange('all')}
                className="p-1 hover:bg-blue-200 rounded-full transition-colors duration-200"
                title="Quitar filtro"
              >
                <X className="w-3 h-3 text-blue-600" />
              </button>
            </div>
          )}
        </div>

        {/* Sección derecha - Botones de filtro */}
        <div className="flex items-center space-x-2 flex-wrap">
          {filterButtons.map(({ status, label, count, description }) => (
            <div key={status} className="relative group">
              <StatusFilterButton
                status={status}
                label={label}
                count={count}
                activeFilter={statusFilter}
                onClick={onStatusFilterChange}
                primaryColor={primaryColor}
              />
              
              {/* Tooltip con descripción */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                {description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Información adicional si hay filtros activos */}
      {hasActiveFilter && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {statusCounts[statusFilter] || 0} camiones con estado "{activeFilterInfo?.label}"
            </span>
            
            {statusCounts[statusFilter] === 0 && (
              <span className="text-gray-500 italic">
                No hay camiones con este estado
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersSection;