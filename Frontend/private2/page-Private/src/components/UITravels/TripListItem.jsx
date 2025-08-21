import React from 'react';
import { Clock, MapPin, User, Truck, AlertTriangle } from 'lucide-react';
import ContextMenu from '../UITravels/ContextMenu';

// Componente RealtimeProgressBar simple
const RealtimeProgressBar = ({ viajeId, initialProgress, status, enablePolling }) => {
  const [progress, setProgress] = React.useState(initialProgress || 0);

  React.useEffect(() => {
    if (!enablePolling || status !== 'en_curso') return;
    
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 2, 100));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [enablePolling, status]);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">Progreso del viaje</span>
        <span className="font-medium text-gray-800">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            status === 'en_curso' ? 'bg-green-500' : 'bg-orange-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// ✅ COMPONENTE INDIVIDUAL CORREGIDO
const TripListItem = ({ trip, index, onEdit, onDelete }) => {
  return (
    <div className="flex items-center p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-gray-100 mb-3">
      {/* Icono del estado */}
      <div className={`w-12 h-12 rounded-full ${trip.color} flex items-center justify-center mr-4 shadow-sm`}>
        <span className="text-white text-lg">{trip.icon}</span>
      </div>

      {/* Información principal */}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Ruta */}
            <div className="font-semibold text-gray-900 text-sm mb-1">
              {trip.type}
            </div>
            
            {/* Horario */}
            <div className="text-sm text-gray-600 mb-2">
              <span className="inline-flex items-center mr-3">
                <Clock size={14} className="mr-1" />
                {trip.time}
                {trip.endTime && (
                  <span className="text-gray-400 mx-1"> - {trip.endTime}</span>
                )}
              </span>
            </div>
            
            {/* Descripción */}
            <div className="text-sm text-gray-500 mb-2">
              {trip.description}
            </div>

            {/* Conductor y Camión */}
            <div className="flex items-center text-xs text-gray-500 space-x-4 mb-3">
              {trip.driver && trip.driver !== "Conductor por asignar" && (
                <span className="inline-flex items-center">
                  <User size={12} className="mr-1" />
                  {trip.driver}
                </span>
              )}
              
              {trip.truck && trip.truck !== "Camión por asignar" && (
                <span className="inline-flex items-center">
                  <Truck size={12} className="mr-1" />
                  {trip.truck}
                </span>
              )}
              
              {trip.distancia && (
                <span className="inline-flex items-center">
                  <MapPin size={12} className="mr-1" />
                  {trip.distancia}
                </span>
              )}
            </div>

            {/* Barra de progreso para viajes en curso */}
            {(trip.estado?.actual === 'en_curso' || trip.estado?.actual === 'retrasado') && (
              <div className="mt-3">
                <RealtimeProgressBar
                  viajeId={trip.id}
                  initialProgress={trip.estado?.progreso || 0}
                  status={trip.estado?.actual}
                  enablePolling={true}
                />
              </div>
            )}

            {/* Estados específicos */}
            {trip.estado?.actual === 'pendiente' && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-sm text-blue-700">
                  <span className="mr-2">📋</span>
                  <span>Esperando inicio del viaje</span>
                </div>
              </div>
            )}

            {trip.estado?.actual === 'completado' && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between text-sm text-green-700">
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Viaje completado</span>
                  </div>
                  <span className="font-medium">100%</span>
                </div>
              </div>
            )}

            {trip.estado?.actual === 'cancelado' && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-sm text-red-700">
                  <span className="mr-2">❌</span>
                  <span>Viaje cancelado</span>
                </div>
              </div>
            )}
          </div>

          {/* Estado y controles */}
          <div className="flex items-center space-x-3 ml-4">
            {/* Alertas */}
            {trip.alertas && trip.alertas.count > 0 && (
              <div className="flex items-center">
                <AlertTriangle 
                  size={16} 
                  className={`${
                    trip.alertas.prioridad === 3 ? 'text-red-500' : 
                    trip.alertas.prioridad === 2 ? 'text-orange-500' : 'text-yellow-500'
                  }`} 
                />
                <span className="text-xs ml-1">{trip.alertas.count}</span>
              </div>
            )}

            {/* Estado */}
            <div className="text-right">
              <div className={`text-xs font-medium ${trip.textColor} mb-1`}>
                {trip.estado?.label || trip.estado?.actual}
              </div>
              <div className={`w-3 h-3 rounded-full ${trip.status}`}></div>
            </div>

            {/* ✅ MENÚ CONTEXTUAL CORREGIDO */}
            <ContextMenu
              trip={trip}
              index={index}
              onEdit={onEdit}      // ✅ Función directa para editar
              onDelete={onDelete}  // ✅ Función directa para eliminar
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripListItem;