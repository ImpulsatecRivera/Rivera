import React from 'react';
import { Clock, User, Truck, MapPin, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTravels } from '../Travels/hooks/useDataTravels';
import ContextMenu from '../UITravels/ContextMenu';

// Componente para la barra de progreso compacta
const CompactProgressBar = ({ progress, status }) => {
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">Progreso</span>
        <span className="font-medium text-gray-800">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full transition-all duration-500 ${
            status === 'en_curso' ? 'bg-green-500' : 
            status === 'completado' ? 'bg-blue-500' :
            status === 'retrasado' ? 'bg-orange-500' : 'bg-gray-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Componente individual optimizado para el dashboard
const DashboardTripItem = ({ trip, index, onMenuClick }) => {
  return (
    <div className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-gray-100">
      {/* Icono del estado */}
      <div className={`w-10 h-10 rounded-full ${trip.color} flex items-center justify-center mr-3 shadow-sm flex-shrink-0`}>
        <span className="text-white text-sm">{trip.icon}</span>
      </div>

      {/* Información principal */}
      <div className="flex-1 min-w-0">
        {/* Título/Ruta */}
        <div className="font-medium text-gray-900 text-sm mb-1 truncate">
          {trip.type}
        </div>
        
        {/* Descripción */}
        <div className="text-xs text-gray-500 mb-2 truncate">
          {trip.description}
        </div>
        
        {/* Información adicional en una sola línea */}
        <div className="flex items-center text-xs text-gray-400 space-x-3 mb-2">
          {trip.time && (
            <span className="inline-flex items-center">
              <Clock size={10} className="mr-1" />
              {trip.time}
            </span>
          )}
          {trip.driver && trip.driver !== "Conductor por asignar" && (
            <span className="inline-flex items-center truncate">
              <User size={10} className="mr-1" />
              <span className="truncate max-w-20">{trip.driver}</span>
            </span>
          )}
        </div>

        {/* Barra de progreso para viajes activos */}
        {(trip.estado?.actual === 'en_curso' || trip.estado?.actual === 'retrasado') && trip.estado?.progreso >= 0 && (
          <CompactProgressBar 
            progress={trip.estado.progreso} 
            status={trip.estado.actual} 
          />
        )}

        {/* Badge de estado para viajes completados */}
        {trip.estado?.actual === 'completado' && (
          <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs mt-1">
            <span className="mr-1">✅</span>
            Completado
          </div>
        )}
      </div>

      {/* Estado y controles */}
      <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
        {/* Alertas */}
        {trip.alertas && trip.alertas.count > 0 && (
          <div className="flex items-center">
            <AlertTriangle 
              size={14} 
              className={`${
                trip.alertas.prioridad === 3 ? 'text-red-500' : 
                trip.alertas.prioridad === 2 ? 'text-orange-500' : 'text-yellow-500'
              }`} 
            />
            <span className="text-xs ml-1">{trip.alertas.count}</span>
          </div>
        )}

        {/* Estado visual */}
        <div className="text-right">
          <div className={`w-3 h-3 rounded-full ${trip.status}`}></div>
        </div>

        {/* Menú contextual - SIMPLIFICADO */}
        <ContextMenu
          trip={trip}
          index={index}
          onEdit={onMenuClick}
          onDelete={onMenuClick}
        />
      </div>
    </div>
  );
};

// Componente principal de la sección de viajes para el dashboard
const DashboardTripsSection = () => {
  const navigate = useNavigate();
  const {
    scheduledTrips,
    loading,
    error,
    handleTripMenuClick,
    refreshTravels,
    stats
  } = useTravels();

  // Filtrar y priorizar viajes más relevantes para el dashboard
  const dashboardTrips = React.useMemo(() => {
    if (!scheduledTrips || scheduledTrips.length === 0) return [];
    
    // Priorizar viajes activos y pendientes
    const activeTrips = scheduledTrips.filter(trip => 
      trip.estado?.actual === 'en_curso' || 
      trip.estado?.actual === 'pendiente' ||
      trip.estado?.actual === 'retrasado'
    );
    
    // Si hay pocos viajes activos, completar con completados recientes
    if (activeTrips.length < 5) {
      const completedTrips = scheduledTrips.filter(trip => 
        trip.estado?.actual === 'completado'
      );
      return [...activeTrips, ...completedTrips].slice(0, 5);
    }
    
    return activeTrips.slice(0, 5);
  }, [scheduledTrips]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Cargando viajes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-red-500">⚠️</span>
        </div>
        <p className="text-red-600 mb-4 text-sm">Error: {error}</p>
        <button 
          onClick={refreshTravels}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 🆕 ESTADÍSTICAS DE RIVERA TRANSPORT */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          📊 Dashboard de Viajes (Rivera Transport)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.pendiente || 0}
            </div>
            <div className="text-gray-600">Programados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.en_curso || 0}
            </div>
            <div className="text-gray-600">En Ruta</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.retrasado || 0}
            </div>
            <div className="text-gray-600">Retrasados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.completado || 0}
            </div>
            <div className="text-gray-600">Completados</div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            🔗 Conectado a Rivera Transport - Total: {stats.total || 0} viajes
          </p>
        </div>
      </div>

      {/* Header de la sección de viajes */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Viajes Activos</h3>
          <p className="text-sm text-gray-500">
            {stats.en_curso} en ruta • {stats.pendiente} programados
          </p>
        </div>
        
        {scheduledTrips && scheduledTrips.length > 5 && (
          <button 
            onClick={() => navigate('/viajes/lista')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver todos ({scheduledTrips.length})
          </button>
        )}
      </div>

      {/* Lista de viajes */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-2">
          {dashboardTrips.length > 0 ? (
            dashboardTrips.map((trip, index) => (
              <DashboardTripItem
                key={trip.id || index}
                trip={trip}
                index={index}
                onMenuClick={handleTripMenuClick}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📋</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">No hay viajes activos</h4>
              <p className="text-sm text-gray-500 mb-4">
                No se encontraron viajes en curso o programados para hoy
              </p>
              <button
                onClick={() => navigate('/viajes/programar')}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                <span className="mr-2">+</span>
                Programar viaje
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTripsSection;