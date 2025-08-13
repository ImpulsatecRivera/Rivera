// 📁 Frontend/src/components/TripMonitoringDashboard.jsx
// DASHBOARD PARA MONITOREAR TODOS LOS VIAJES CON FILTROS Y SCROLL

import React, { useState, useEffect } from 'react';
import { X, Filter, RefreshCw, Play, Square, Search } from 'lucide-react';
import RealtimeProgressBar from './RealtimeProgressBar';

const TripMonitoringDashboard = ({ onClose }) => {
  const [allTrips, setAllTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [serviceStatus, setServiceStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // 🆕 Estados para filtros
  const [activeFilter, setActiveFilter] = useState('todos'); // 'todos', 'pendiente', 'en_curso', etc.
  const [searchTerm, setSearchTerm] = useState('');

  // 🕐 Función para formatear horarios (igual que en el mapa)
  const formatBackendTime = (timeInput, format = 'time') => {
    if (!timeInput) return 'No programado';
    
    try {
      let date;
      
      if (typeof timeInput === 'string') {
        if (timeInput === 'Invalid Date' || timeInput === '') {
          return 'Hora no válida';
        }
        
        // Si es solo hora "HH:mm"
        if (/^\d{1,2}:\d{2}$/.test(timeInput)) {
          const today = new Date();
          const [hours, minutes] = timeInput.split(':').map(Number);
          date = new Date();
          date.setHours(hours, minutes, 0, 0);
          
          const now = new Date();
          if (date < now) {
            date.setDate(date.getDate() + 1);
          }
        }
        // Formato ISO estándar
        else if (timeInput.includes('T') && timeInput.includes('Z')) {
          date = new Date(timeInput);
        }
        else {
          date = new Date(timeInput);
        }
      } else if (timeInput instanceof Date) {
        date = timeInput;
      } else {
        date = new Date(timeInput);
      }
      
      if (isNaN(date.getTime())) {
        return 'Hora inválida';
      }
      
      const options = {
        timeZone: 'America/El_Salvador',
        hour12: true
      };
      
      if (format === 'time') {
        options.hour = '2-digit';
        options.minute = '2-digit';
        return date.toLocaleTimeString('es-SV', options);
      } else if (format === 'datetime') {
        options.year = 'numeric';
        options.month = 'short';
        options.day = 'numeric';
        options.hour = '2-digit';
        options.minute = '2-digit';
        return date.toLocaleString('es-SV', options);
      }
      
      return date.toLocaleTimeString('es-SV', options);
      
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Error en fecha';
    }
  };

  // 🔄 Cargar datos iniciales
  useEffect(() => {
    fetchServiceStatus();
    fetchAllTrips();

    const interval = setInterval(() => {
      fetchAllTrips();
      fetchServiceStatus();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // 🔍 Aplicar filtros cuando cambien los datos o filtros
  useEffect(() => {
    applyFilters();
  }, [allTrips, activeFilter, searchTerm]);

  // 📊 Obtener estado del servicio
  const fetchServiceStatus = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auto-update/status');
      if (response.ok) {
        const data = await response.json();
        setServiceStatus(data.data.service);
      }
    } catch (error) {
      console.error('Error obteniendo estado del servicio:', error);
    }
  };

  // 📋 Obtener TODOS los viajes (no solo activos)
  const fetchAllTrips = async () => {
    try {
      // Primero intentar obtener todos los viajes del endpoint del mapa
      const mapResponse = await fetch('http://localhost:4000/api/viajes/map-data');
      if (mapResponse.ok) {
        const mapData = await mapResponse.json();
        if (mapData.success && mapData.data && mapData.data.routes) {
          // Procesar los datos del mapa para el dashboard
          const processedTrips = mapData.data.routes.map(route => ({
            id: route.id,
            description: route.description || `${route.route?.from} → ${route.route?.to}`,
            status: route.status,
            progress: route.tripInfo?.progress || 0,
            departureTime: route.tripInfo?.departure,
            arrivalTime: route.tripInfo?.arrival || route.tripInfo?.estimatedArrival,
            realDeparture: route.tripInfo?.realDeparture,
            realArrival: route.tripInfo?.realArrival,
            driver: route.tripInfo?.driver,
            truck: route.tripInfo?.truck,
            cargo: route.tripInfo?.cargo,
            route: route.route,
            distance: route.distance,
            estimatedTime: route.estimatedTime,
            costs: route.costs,
            conditions: route.conditions,
            alerts: route.alerts,
            statusText: route.statusText
          }));
          
          setAllTrips(processedTrips);
          setLastUpdate(new Date());
        }
      } else {
        // Fallback: intentar endpoint de viajes activos
        const activeResponse = await fetch('http://localhost:4000/api/auto-update/active-trips');
        if (activeResponse.ok) {
          const activeData = await activeResponse.json();
          setAllTrips(activeData.data);
          setLastUpdate(new Date());
        }
      }
    } catch (error) {
      console.error('Error obteniendo viajes:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Aplicar filtros
  const applyFilters = () => {
    let filtered = [...allTrips];

    // Filtro por estado
    if (activeFilter !== 'todos') {
      filtered = filtered.filter(trip => {
        // Mapear estados del backend a nuestros filtros
        const statusMap = {
          'scheduled': 'pendiente',
          'active': 'en_curso',
          'in_progress': 'en_curso',
          'completed': 'completado',
          'delayed': 'retrasado',
          'cancelled': 'cancelado'
        };
        
        const normalizedStatus = statusMap[trip.status] || trip.status;
        return normalizedStatus === activeFilter;
      });
    }

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(trip =>
        trip.description?.toLowerCase().includes(search) ||
        trip.driver?.toLowerCase().includes(search) ||
        trip.truck?.toLowerCase().includes(search) ||
        trip.cargo?.toLowerCase().includes(search) ||
        trip.route?.from?.toLowerCase().includes(search) ||
        trip.route?.to?.toLowerCase().includes(search)
      );
    }

    setFilteredTrips(filtered);
  };

  // 🚀 Controles del servicio
  const toggleService = async () => {
    try {
      const action = serviceStatus.isRunning ? 'stop' : 'start';
      const response = await fetch(`http://localhost:4000/api/auto-update/${action}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchServiceStatus();
      }
    } catch (error) {
      console.error('Error toggleando servicio:', error);
    }
  };

  const forceUpdate = async () => {
    setLoading(true);
    await fetchAllTrips();
  };

  // 📊 Obtener estadísticas
  const getStatusStats = () => {
    const stats = {
      todos: allTrips.length,
      pendiente: allTrips.filter(trip => ['scheduled', 'pendiente'].includes(trip.status)).length,
      en_curso: allTrips.filter(trip => ['active', 'in_progress', 'en_curso'].includes(trip.status)).length,
      completado: allTrips.filter(trip => ['completed', 'completado'].includes(trip.status)).length,
      retrasado: allTrips.filter(trip => ['delayed', 'retrasado'].includes(trip.status)).length,
      cancelado: allTrips.filter(trip => ['cancelled', 'cancelado'].includes(trip.status)).length
    };
    return stats;
  };

  // 🎨 Obtener color por estado (MEJORADO)
  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    
    const statusMap = {
      'scheduled': 'yellow',
      'pendiente': 'yellow',
      'programado': 'yellow',
      'active': 'green',
      'in_progress': 'green',
      'en_curso': 'green',
      'completed': 'blue',
      'completado': 'blue',
      'delayed': 'orange',
      'retrasado': 'orange',
      'cancelled': 'red',
      'cancelado': 'red'
    };
    
    const color = statusMap[normalizedStatus];
    
    if (!color) {
      console.warn('🔍 Color no encontrado para estado:', status);
      return 'gray';
    }
    
    return color;
  };

  // 🏷️ Obtener texto del estado (MEJORADO)
  const getStatusText = (status, statusText) => {
    if (statusText) return statusText;
    
    const normalizedStatus = status?.toLowerCase();
    
    const statusMap = {
      'scheduled': 'Pendiente',
      'pendiente': 'Pendiente',
      'programado': 'Pendiente',
      'active': 'En Curso',
      'in_progress': 'En Curso',
      'en_curso': 'En Curso',
      'completed': 'Completado',
      'completado': 'Completado',
      'delayed': 'Retrasado',
      'retrasado': 'Retrasado',
      'cancelled': 'Cancelado',
      'cancelado': 'Cancelado'
    };
    
    const mappedText = statusMap[normalizedStatus];
    
    if (!mappedText) {
      console.warn('🔍 Estado no reconocido en dashboard:', status);
      return status || 'Desconocido';
    }
    
    return mappedText;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 📊 Header fijo */}
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Monitor de Viajes Completo</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={forceUpdate}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            <button
              onClick={toggleService}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                serviceStatus.isRunning 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {serviceStatus.isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{serviceStatus.isRunning ? 'Detener' : 'Iniciar'}</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* Estado del servicio */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${serviceStatus.isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span>Servicio: {serviceStatus.isRunning ? 'Activo' : 'Inactivo'}</span>
          </div>
          <span>•</span>
          <span>Intervalo: {(serviceStatus.updateInterval || 30000) / 1000}s</span>
          <span>•</span>
          <span>Última actualización: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* 🔍 Controles de filtro */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por descripción, conductor, vehículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtros por estado */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos ({stats.todos})</option>
              <option value="pendiente">Pendientes ({stats.pendiente})</option>
              <option value="en_curso">En Curso ({stats.en_curso})</option>
              <option value="completado">Completados ({stats.completado})</option>
              <option value="retrasado">Retrasados ({stats.retrasado})</option>
              <option value="cancelado">Cancelados ({stats.cancelado})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📈 Estadísticas rápidas */}
      <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{stats.todos}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-900">{stats.pendiente}</div>
            <div className="text-xs text-yellow-800">Pendientes</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-900">{stats.en_curso}</div>
            <div className="text-xs text-green-800">En Curso</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-900">{stats.completado}</div>
            <div className="text-xs text-blue-800">Completados</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-900">{stats.retrasado}</div>
            <div className="text-xs text-orange-800">Retrasados</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-900">{stats.cancelado}</div>
            <div className="text-xs text-red-800">Cancelados</div>
          </div>
        </div>
      </div>

      {/* 📋 Lista de viajes con scroll */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          {filteredTrips.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🚛</div>
              <p className="text-lg mb-2">No se encontraron viajes</p>
              <p className="text-sm">
                {searchTerm ? 'Intenta cambiar los términos de búsqueda' : 'No hay viajes con el filtro seleccionado'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTrips.map((trip) => {
                const statusColor = getStatusColor(trip.status);
                return (
                  <div key={trip.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Header del viaje */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          statusColor === 'green' ? 'bg-green-100 text-green-800' :
                          statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                          statusColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                          statusColor === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusText(trip.status, trip.statusText)}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 text-sm leading-tight mb-2">
                        {trip.description}
                      </h3>
                      
                      {/* Información de la ruta */}
                      {trip.route && (
                        <div className="text-xs text-gray-600 mb-2">
                          📍 {trip.route.from} → {trip.route.to}
                          {trip.distance && <span className="ml-2">📏 {trip.distance}</span>}
                        </div>
                      )}
                    </div>
                    
                    {/* Horarios */}
                    <div className="text-xs text-gray-600 mb-3 space-y-1">
                      <div className="flex justify-between">
                        <span>Salida:</span>
                        <span className="font-medium">{formatBackendTime(trip.departureTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Llegada:</span>
                        <span className="font-medium">{formatBackendTime(trip.arrivalTime)}</span>
                      </div>
                      {trip.realDeparture && (
                        <div className="flex justify-between text-green-600">
                          <span>Salida real:</span>
                          <span className="font-medium">{formatBackendTime(trip.realDeparture)}</span>
                        </div>
                      )}
                      {trip.realArrival && (
                        <div className="flex justify-between text-blue-600">
                          <span>Llegada real:</span>
                          <span className="font-medium">{formatBackendTime(trip.realArrival)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Información adicional */}
                    {trip.driver && trip.driver !== 'Conductor por asignar' && (
                      <div className="text-xs text-gray-600 mb-2">
                        👤 {trip.driver}
                      </div>
                    )}
                    
                    {trip.truck && trip.truck !== 'Camión por asignar' && (
                      <div className="text-xs text-gray-600 mb-2">
                        🚛 {trip.truck}
                      </div>
                    )}
                    
                    {/* Progreso */}
                    {trip.progress >= 0 && (
                      <div className="mt-3">
                        <RealtimeProgressBar 
                          viajeId={trip.id}
                          initialProgress={trip.progress}
                          status={trip.status}
                          enablePolling={serviceStatus.isRunning}
                          compact={true}
                          description={trip.description} // 🆕 Pasar descripción
                          tripInfo={{
                            description: trip.description,
                            route: trip.route,
                            driver: trip.driver,
                            truck: trip.truck,
                            currentLocation: trip.tripInfo?.currentLocation
                          }}
                        />
                      </div>
                    )}

                    {/* Costos (si existen) */}
                    {trip.costs && (
                      <div className="mt-2 text-xs text-gray-600">
                        💰 Total: ${trip.costs.total}
                      </div>
                    )}

                    {/* Alertas (si existen) */}
                    {trip.alerts && trip.alerts.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-orange-600 font-medium">
                          ⚠️ {trip.alerts.length} alerta(s)
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripMonitoringDashboard;