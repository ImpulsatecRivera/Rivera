import React from 'react';
import TruckCard from '../UICamiones/TruckCard';

const TrucksGrid = ({ 
  trucks, 
  viewMode = 'grid',
  onEditTruck,
  onDeleteTruck,
  onCardClick,
  defaultImage,
  getStatusColor,
  getDotColor,
  className = ""
}) => {
  // Validación de props
  if (!Array.isArray(trucks)) {
    console.warn('TrucksGrid: trucks prop debe ser un array');
    return null;
  }

  // Función para manejar click en tarjeta
  const handleCardClick = (truckId) => {
    if (onCardClick && truckId) {
      onCardClick(truckId);
    }
  };

  // Función para manejar edición
  const handleEditTruck = (truck) => {
    if (onEditTruck && truck) {
      onEditTruck(truck);
    }
  };

  // Función para manejar eliminación
  const handleDeleteTruck = (truck) => {
    if (onDeleteTruck && truck) {
      onDeleteTruck(truck);
    }
  };

  // Clases CSS según el modo de vista
  const gridClasses = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    list: 'space-y-4'
  };

  // Componente para vista de lista (si se implementa en el futuro)
  const TruckListItem = ({ truck }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center space-x-4">
        <img
          src={truck.img || defaultImage}
          alt={truck.name}
          className="w-16 h-16 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{truck.name}</h3>
          <p className="text-sm text-gray-500">Placa: {truck.licensePlate}</p>
          <p className="text-sm text-gray-500">{truck.brand} {truck.model}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor ? getStatusColor(truck.state) : 'bg-gray-100'}`}>
          {truck.state || 'Sin estado'}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${className}`}>
      {/* Grid o lista según el modo de vista */}
      <div className={gridClasses[viewMode] || gridClasses.grid}>
        {trucks.map((truck, index) => {
          // Generar key único y seguro
          const key = truck.id || truck._id || `truck-${index}`;
          
          // Validar que el camión tenga datos mínimos
          if (!truck) {
            console.warn(`TrucksGrid: Camión en índice ${index} es null/undefined`);
            return null;
          }

          // Renderizar según el modo de vista
          if (viewMode === 'list') {
            return (
              <TruckListItem 
                key={key}
                truck={truck}
              />
            );
          }

          // Vista de grid (por defecto)
          return (
            <TruckCard 
              key={key}
              truck={truck}
              onEdit={handleEditTruck}
              onDelete={handleDeleteTruck}
              onClick={handleCardClick}
              defaultImage={defaultImage}
              getStatusColor={getStatusColor}
              getDotColor={getDotColor}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TrucksGrid;