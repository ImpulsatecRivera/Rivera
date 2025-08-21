import React, { useState } from 'react';
import { Clock, User, Truck, MapPin, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTravels } from '../Travels/hooks/useDataTravels';
import ContextMenu from '../UITravels/ContextMenu';
import ActionModal from '../UITravels/ActionModal';
import EditTripModal from '../FormsTravels/EditTripModal';
import SuccessModal from '../UITravels/SuccessModal';
import ConfirmationModal from '../UITravels/ConfirmationModal';
import DeleteModal from '../UITravels/DeleteModal';

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
const DashboardTripItem = ({ trip, index, onEdit, onDelete }) => {
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
          {trip.truck && trip.truck !== "Camión por asignar" && (
            <span className="inline-flex items-center truncate">
              <Truck size={10} className="mr-1" />
              <span className="truncate max-w-16">{trip.truck}</span>
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

        {/* ✅ MENÚ CONTEXTUAL CORREGIDO */}
        <ContextMenu
          trip={trip}
          index={index}
          onEdit={onEdit}    // ✅ Función directa para editar
          onDelete={onDelete} // ✅ Función directa para eliminar
        />
      </div>
    </div>
  );
};

// 🆕 Componente para mostrar estado de actualización
const RefreshIndicator = ({ isRefreshing, onRefresh }) => {
  if (!isRefreshing) return null;
  
  return (
    <div className="flex items-center justify-center py-2 text-blue-600 text-sm">
      <RefreshCw className="animate-spin mr-2" size={16} />
      Actualizando datos...
    </div>
  );
};

// 🆕 Componente de filtros
const TripFilters = ({ filters, onFiltersChange, tripCounts }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = [
    { key: 'all', label: 'Todos', count: tripCounts.total, color: 'text-gray-600' },
    { key: 'pendiente', label: 'Programados', count: tripCounts.pendiente, color: 'text-blue-600' },
    { key: 'en_curso', label: 'En Ruta', count: tripCounts.en_curso, color: 'text-green-600' },
    { key: 'retrasado', label: 'Retrasados', count: tripCounts.retrasado, color: 'text-orange-600' },
    { key: 'completado', label: 'Completados', count: tripCounts.completado, color: 'text-emerald-600' },
    { key: 'cancelado', label: 'Cancelados', count: tripCounts.cancelado, color: 'text-red-600' }
  ];

  return (
    <div className="mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Filter size={16} className="mr-2 text-gray-500" />
          <span className="font-medium text-gray-700">Filtrar viajes</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => onFiltersChange({ status: option.key })}
              className={`p-2 rounded-lg text-sm transition-colors ${
                filters.status === option.key
                  ? 'bg-blue-100 border border-blue-300 text-blue-700'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
              }`}
            >
              <div className="text-center">
                <div className={`font-bold text-lg ${option.color}`}>
                  {option.count}
                </div>
                <div className="text-xs">{option.label}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente principal de la sección de viajes para el dashboard
const DashboardTripsSection = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ status: 'all' });
  const [showAllTrips, setShowAllTrips] = useState(false);
  
  const {
    scheduledTrips,
    loading,
    error,
    isRefreshing,
    refreshTravels,
    stats,
    
    // ✅ FUNCIONES DIRECTAS CORREGIDAS
    onEdit,                    // ✅ Nueva función directa para editar
    onDelete,                  // ✅ Nueva función directa para eliminar
    handleDirectUpdate,        // ✅ Nueva función directa para actualización
    
    // Estados para los modales (mantener para compatibilidad)
    showModal,
    selectedTrip,
    isClosing,
    handleCloseModal,
    handleEdit,
    handleDelete,
    
    // Estados para modal de edición
    showEditModal,
    isEditClosing,
    editForm,
    handleInputChange,
    handleUpdateTrip,
    handleCloseEditModal,
    handleConfirmEdit,
    handleCancelEdit,
    showConfirmEditModal,
    isConfirmEditClosing,
    
    // Estados para modal de éxito
    showSuccessModal,
    isSuccessClosing,
    handleCloseSuccessModal,
    
    // Estados para modal de eliminación
    showDeleteModal,
    isDeleteClosing,
    handleConfirmDelete,
    handleCancelDelete,
    showDeleteSuccessModal,
    isDeleteSuccessClosing,
    handleCloseDeleteSuccessModal
  } = useTravels();

  // 🔧 FILTRAR TODOS LOS VIAJES SEGÚN LOS FILTROS SELECCIONADOS
  const filteredTrips = React.useMemo(() => {
    if (!scheduledTrips || scheduledTrips.length === 0) return [];
    
    let filtered = scheduledTrips;

    // Filtrar por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(trip => trip.estado?.actual === filters.status);
    }

    // Ordenar: primero los activos (en_curso, retrasado), luego pendientes, luego completados
    const priority = {
      'en_curso': 1,
      'retrasado': 2,
      'pendiente': 3,
      'completado': 4,
      'cancelado': 5
    };

    filtered.sort((a, b) => {
      const priorityA = priority[a.estado?.actual] || 6;
      const priorityB = priority[b.estado?.actual] || 6;
      return priorityA - priorityB;
    });

    return filtered;
  }, [scheduledTrips, filters]);

  // 🔧 MOSTRAR SOLO LOS PRIMEROS 10 O TODOS SEGÚN EL ESTADO
  const displayedTrips = showAllTrips ? filteredTrips : filteredTrips.slice(0, 10);

  // 🆕 Función para refrescar manualmente
  const handleManualRefresh = async () => {
    console.log("🔄 Refresh manual solicitado por el usuario");
    await refreshTravels();
  };

  // 🆕 Función para manejar cambios en los filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Colapsar la vista cuando se cambia el filtro
    setShowAllTrips(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <span className="text-gray-600">Cargando viajes...</span>
          <p className="text-xs text-gray-500 mt-1">Conectando con Rivera Transport</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-red-500">⚠️</span>
        </div>
        <p className="text-red-600 mb-2 text-sm font-medium">Error de conexión</p>
        <p className="text-red-500 mb-4 text-xs">{error}</p>
        <div className="space-y-2">
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
          >
            <RefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} size={16} />
            {isRefreshing ? 'Reconectando...' : 'Reintentar'}
          </button>
          <p className="text-xs text-gray-500">
            Verifica que Rivera Transport esté funcionando
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 🆕 ESTADÍSTICAS DE RIVERA TRANSPORT CON INDICADOR DE REFRESH */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            📊 Dashboard de Viajes (Rivera Transport)
          </h2>
          
          {/* 🆕 Botón de refresh manual */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} size={14} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
        
        {/* 🆕 Indicador de actualización */}
        <RefreshIndicator isRefreshing={isRefreshing} onRefresh={handleManualRefresh} />
        
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
        
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            🔗 Conectado a Rivera Transport - Total: {stats.total || 0} viajes
          </p>
          <p className="text-xs text-gray-400">
            {isRefreshing ? 'Actualizando...' : `Última actualización: ${new Date().toLocaleTimeString()}`}
          </p>
        </div>
      </div>

      {/* 🆕 FILTROS DE VIAJES */}
      <TripFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        tripCounts={stats}
      />

      {/* Header de la sección de viajes con información del filtro actual */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {filters.status === 'all' ? 'Todos los Viajes' :
             filters.status === 'pendiente' ? 'Viajes Programados' :
             filters.status === 'en_curso' ? 'Viajes en Ruta' :
             filters.status === 'retrasado' ? 'Viajes Retrasados' :
             filters.status === 'completado' ? 'Viajes Completados' :
             filters.status === 'cancelado' ? 'Viajes Cancelados' : 'Viajes'}
          </h3>
          <p className="text-sm text-gray-500">
            {filteredTrips.length > 0 
              ? `Mostrando ${displayedTrips.length} de ${filteredTrips.length} viajes`
              : 'No hay viajes que coincidan con los filtros'
            }
          </p>
        </div>
      </div>

      {/* Lista de viajes */}
      <div className="flex-1">
        <div className="space-y-2">
          {displayedTrips.length > 0 ? (
            <>
              {displayedTrips.map((trip, index) => (
                <DashboardTripItem
                  key={trip.id || index}
                  trip={trip}
                  index={index}
                  onEdit={onEdit}      // ✅ Función directa para editar
                  onDelete={onDelete}  // ✅ Función directa para eliminar
                />
              ))}
              
              {/* Botón para mostrar más viajes si hay más disponibles */}
              {filteredTrips.length > displayedTrips.length && (
                <div className="text-center py-4">
                  <button
                    onClick={() => setShowAllTrips(true)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors"
                  >
                    <ChevronDown size={16} className="mr-2" />
                    Mostrar {filteredTrips.length - displayedTrips.length} viajes más
                  </button>
                </div>
              )}
              
              {/* Botón para colapsar si se muestran todos */}
              {showAllTrips && filteredTrips.length > 10 && (
                <div className="text-center py-4">
                  <button
                    onClick={() => setShowAllTrips(false)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors"
                  >
                    <ChevronUp size={16} className="mr-2" />
                    Mostrar menos
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📋</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                {filters.status === 'all' 
                  ? 'No hay viajes disponibles'
                  : `No hay viajes ${
                      filters.status === 'pendiente' ? 'programados' :
                      filters.status === 'en_curso' ? 'en ruta' :
                      filters.status === 'retrasado' ? 'retrasados' :
                      filters.status === 'completado' ? 'completados' :
                      filters.status === 'cancelado' ? 'cancelados' : ''
                    }`
                }
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                {filters.status === 'all' 
                  ? 'No se encontraron viajes en el sistema'
                  : 'Cambia el filtro para ver otros viajes o programa uno nuevo'
                }
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/viajes/programar')}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  <span className="mr-2">+</span>
                  Programar viaje
                </button>
                {filters.status !== 'all' && (
                  <div className="text-xs text-gray-400">
                    o <button 
                      onClick={() => handleFiltersChange({ status: 'all' })}
                      className="text-blue-500 hover:text-blue-600 underline"
                    >
                      ver todos los viajes
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ MODALES CORREGIDOS */}
      
      {/* Modal de selección de acción */}
      <ActionModal
        show={showModal}
        isClosing={isClosing}
        onClose={handleCloseModal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* ✅ MODAL DE EDICIÓN CORREGIDO */}
      <EditTripModal
        show={showEditModal}
        isClosing={isEditClosing}
        onClose={handleCloseEditModal}
        onConfirm={handleDirectUpdate} // ✅ USAR FUNCIÓN CORRECTA
        editForm={editForm}
        onInputChange={handleInputChange}
        refreshTravels={refreshTravels}
      />

      {/* Modal de confirmación de edición */}
      <ConfirmationModal
        show={showConfirmEditModal}
        isClosing={isConfirmEditClosing}
        onCancel={handleCancelEdit}
        onConfirm={handleConfirmEdit}
        title="¿Desea editar los datos?"
        message="Elija la opción"
        icon="?"
        iconColor="blue"
        cancelText="Cancelar"
        confirmText="Continuar"
      />

      {/* Modal de éxito de edición */}
      <SuccessModal
        show={showSuccessModal}
        isClosing={isSuccessClosing}
        onClose={handleCloseSuccessModal}
        title="Viaje actualizado con éxito"
        message="Los cambios se han guardado correctamente"
      />

      {/* Modal de eliminación */}
      <DeleteModal
        show={showDeleteModal}
        isClosing={isDeleteClosing}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Modal de éxito de eliminación */}
      <SuccessModal
        show={showDeleteSuccessModal}
        isClosing={isDeleteSuccessClosing}
        onClose={handleCloseDeleteSuccessModal}
        title="Viaje cancelado con éxito"
        message="El viaje ha sido cancelado correctamente"
      />
    </div>
  );
};

export default DashboardTripsSection;