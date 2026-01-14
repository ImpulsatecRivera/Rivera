import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Truck, 
  BarChart3, 
  MapPin, 
  RefreshCw,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  X,
  Bell
} from 'lucide-react';

const DashboardBackendIntegration = ({ onClose }) => {
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);
  const [allTrips, setAllTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [systemStatus, setSystemStatus] = useState({
    connected: false,
    autoRefresh: true,
    lastUpdate: new Date(),
    refreshInterval: 30
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 FUNCIÓN REAL PARA OBTENER MÉTRICAS DEL BACKEND
  const fetchRealTimeMetrics = async () => {
    try {
      console.log('📊 Obteniendo métricas en tiempo real...');
      const response = await fetch('https://riveraproject-production-933e.up.railway.app/api/viajes/real-time-metrics', { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRealTimeMetrics(data.data);
          setSystemStatus(prev => ({ ...prev, connected: true }));
          console.log('✅ Métricas obtenidas:', data.data);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error obteniendo métricas:', error);
      setError(error.message);
      setSystemStatus(prev => ({ ...prev, connected: false }));
      
      // Fallback a datos de ejemplo
      setRealTimeMetrics({
        hoy: { total: 0, enCurso: 0, completados: 0, pendientes: 0, retrasados: 0, progresoPromedio: 0 },
        general: { totalViajes: 0, viajesActivos: 0, tasaCompletado: 0, puntualidad: 0 }
      });
    }
  };

  // 🚛 FUNCIÓN REAL PARA OBTENER TODOS LOS VIAJES DEL BACKEND
  const fetchAllTrips = async () => {
    try {
      console.log('🚛 Obteniendo datos de viajes...');
      const response = await fetch('https://riveraproject-production-933e.up.railway.app/api/viajes/map-data', { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.routes) {
          // Procesar datos del backend para el dashboard
          const processedTrips = data.data.routes.map(route => ({
            id: route.id,
            description: route.description || `${route.route?.from} → ${route.route?.to}`,
            status: route.status,
            progress: route.tripInfo?.progress || 0,
            departureTime: route.tripInfo?.departure,
            arrivalTime: route.tripInfo?.arrival || route.tripInfo?.estimatedArrival,
            realDeparture: route.tripInfo?.realDeparture,
            realArrival: route.tripInfo?.realArrival,
            driver: route.tripInfo?.driver || 'Conductor por asignar',
            driverPhone: route.tripInfo?.driverPhone,
            truck: route.tripInfo?.truck || 'Vehículo por asignar',
            cargo: route.tripInfo?.cargo || 'Carga general',
            route: route.route,
            distance: route.distance,
            estimatedTime: route.estimatedTime,
            costs: route.costs,
            conditions: route.conditions,
            alerts: route.alerts,
            statusText: route.statusText,
            currentLocation: route.tripInfo?.currentLocation
          }));
          
          setAllTrips(processedTrips);
          setSystemStatus(prev => ({ ...prev, connected: true }));
          console.log(`✅ ${processedTrips.length} viajes procesados`);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error obteniendo viajes:', error);
      setError(error.message);
      setSystemStatus(prev => ({ ...prev, connected: false }));
      setAllTrips([]);
    }
  };

  // 🔄 FUNCIÓN DE ACTUALIZACIÓN MANUAL (REAL)
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Actualizando datos del dashboard...');
      
      // Ejecutar ambas llamadas al backend en paralelo
      await Promise.all([
        fetchRealTimeMetrics(),
        fetchAllTrips()
      ]);
      
      setSystemStatus(prev => ({ 
        ...prev, 
        lastUpdate: new Date(),
        connected: true 
      }));
      
      console.log('✅ Actualización completada');
      
    } catch (error) {
      console.error('❌ Error durante actualización:', error);
      setError('Error de conexión con el servidor');
      setSystemStatus(prev => ({ ...prev, connected: false }));
    } finally {
      setLoading(false);
    }
  };

  // 🔄 CARGAR DATOS INICIALES
  useEffect(() => {
    handleRefresh();
  }, []);

  // 🔄 AUTO-REFRESH USANDO TUS ENDPOINTS REALES
  useEffect(() => {
    if (!systemStatus.autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh ejecutándose...');
      handleRefresh();
    }, systemStatus.refreshInterval * 1000);

    return () => {
      console.log('🛑 Auto-refresh detenido');
      clearInterval(interval);
    };
  }, [systemStatus.autoRefresh, systemStatus.refreshInterval]);

  // 🔍 FILTRAR VIAJES
  useEffect(() => {
    let filtered = [...allTrips];
    
    // Filtro por estado
    if (activeFilter !== 'todos') {
      filtered = filtered.filter(trip => {
        // Mapear estados del backend
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
        trip.id?.toLowerCase().includes(search) ||
        trip.route?.from?.toLowerCase().includes(search) ||
        trip.route?.to?.toLowerCase().includes(search)
      );
    }
    
    setFilteredTrips(filtered);
  }, [allTrips, activeFilter, searchTerm]);

  // 📊 CALCULAR ESTADÍSTICAS LOCALES (basadas en datos reales)
  const getLocalStats = () => {
    if (allTrips.length === 0) {
      return {
        total: 0,
        pendiente: 0,
        en_curso: 0,
        completado: 0,
        retrasado: 0,
        cancelado: 0
      };
    }

    const stats = {
      total: allTrips.length,
      pendiente: allTrips.filter(trip => ['scheduled', 'pendiente'].includes(trip.status)).length,
      en_curso: allTrips.filter(trip => ['active', 'in_progress', 'en_curso'].includes(trip.status)).length,
      completado: allTrips.filter(trip => ['completed', 'completado'].includes(trip.status)).length,
      retrasado: allTrips.filter(trip => ['delayed', 'retrasado'].includes(trip.status)).length,
      cancelado: allTrips.filter(trip => ['cancelled', 'cancelado'].includes(trip.status)).length
    };

    return stats;
  };

  // 🎨 FUNCIONES DE UTILIDAD
  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    const statusMap = {
      'scheduled': 'yellow', 'pendiente': 'yellow',
      'active': 'green', 'in_progress': 'green', 'en_curso': 'green',
      'completed': 'blue', 'completado': 'blue',
      'delayed': 'orange', 'retrasado': 'orange',
      'cancelled': 'red', 'cancelado': 'red'
    };
    return statusMap[normalizedStatus] || 'gray';
  };

  const getStatusText = (status) => {
    const normalizedStatus = status?.toLowerCase();
    const statusMap = {
      'scheduled': 'Pendiente', 'pendiente': 'Pendiente',
      'active': 'En Curso', 'in_progress': 'En Curso', 'en_curso': 'En Curso',
      'completed': 'Completado', 'completado': 'Completado',
      'delayed': 'Retrasado', 'retrasado': 'Retrasado',
      'cancelled': 'Cancelado', 'cancelado': 'Cancelado'
    };
    return statusMap[normalizedStatus] || status || 'Desconocido';
  };

  // 🕐 FORMATEAR HORARIOS (igual que en tu mapa)
  const formatBackendTime = (timeInput) => {
    if (!timeInput) return 'No programado';
    
    try {
      let date;
      
      if (typeof timeInput === 'string') {
        if (/^\d{1,2}:\d{2}$/.test(timeInput)) {
          const [hours, minutes] = timeInput.split(':').map(Number);
          date = new Date();
          date.setHours(hours, minutes, 0, 0);
        } else {
          date = new Date(timeInput);
        }
      } else {
        date = new Date(timeInput);
      }
      
      if (isNaN(date.getTime())) return 'Hora inválida';
      
      return date.toLocaleTimeString('es-SV', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/El_Salvador'
      });
    } catch (error) {
      return 'Error en fecha';
    }
  };

  const localStats = getLocalStats();
  const metricsToShow = realTimeMetrics || {
    hoy: localStats,
    general: { viajesActivos: localStats.en_curso + localStats.pendiente, tasaCompletado: 0, puntualidad: 0 }
  };

  if (loading && !realTimeMetrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando con Rivera Transport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* 🔝 HEADER FIJO */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Rivera Transport</h1>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      systemStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
                    <span>{systemStatus.connected ? 'Conectado' : 'Sin conexión'}</span>
                  </div>
                  <span>•</span>
                  <span>Auto-refresh: {systemStatus.autoRefresh ? `${systemStatus.refreshInterval}s` : 'Off'}</span>
                  <span>•</span>
                  <span>{systemStatus.lastUpdate.toLocaleTimeString('es-SV')}</span>
                  {error && (
                    <>
                      <span>•</span>
                      <span className="text-red-600">⚠️ {error}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              title="Actualizar datos del backend"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:block">Actualizar</span>
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🔍 BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar viajes por ID, descripción, conductor, vehículo..."
              className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 hover:bg-white shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <select 
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[160px]"
            >
              <option value="todos">Todos ({localStats.total})</option>
              <option value="pendiente">Pendientes ({localStats.pendiente})</option>
              <option value="en_curso">En Curso ({localStats.en_curso})</option>
              <option value="completado">Completados ({localStats.completado})</option>
              <option value="retrasado">Retrasados ({localStats.retrasado})</option>
              <option value="cancelado">Cancelados ({localStats.cancelado})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📊 CONTENIDO PRINCIPAL CON SCROLL */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          
          {/* Métricas principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {metricsToShow.hoy?.total || localStats.total}
                  </div>
                  <div className="text-sm text-blue-700">Viajes Hoy</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {metricsToShow.hoy?.enCurso || localStats.en_curso}
                  </div>
                  <div className="text-sm text-green-700">En Curso</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {metricsToShow.hoy?.progresoPromedio || 
                     (localStats.total > 0 ? Math.round(allTrips.reduce((acc, trip) => acc + trip.progress, 0) / allTrips.length) : 0)}%
                  </div>
                  <div className="text-sm text-purple-700">Progreso</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-900">
                    {metricsToShow.general?.viajesActivos || (localStats.en_curso + localStats.pendiente)}
                  </div>
                  <div className="text-sm text-orange-700">Activos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas detalladas por estado */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                <div className="text-xl font-bold text-gray-900">{localStats.total}</div>
                <div className="text-xs text-gray-600 flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Total</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                <div className="text-xl font-bold text-yellow-900">{localStats.pendiente}</div>
                <div className="text-xs text-yellow-800 flex items-center justify-center space-x-1">
                  <Pause className="w-3 h-3" />
                  <span>Pendientes</span>
                </div>
              </div>
              
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                <div className="text-xl font-bold text-green-900">{localStats.en_curso}</div>
                <div className="text-xs text-green-800 flex items-center justify-center space-x-1">
                  <Truck className="w-3 h-3" />
                  <span>En Curso</span>
                </div>
              </div>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                <div className="text-xl font-bold text-blue-900">{localStats.completado}</div>
                <div className="text-xs text-blue-800 flex items-center justify-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Completados</span>
                </div>
              </div>
              
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                <div className="text-xl font-bold text-orange-900">{localStats.retrasado}</div>
                <div className="text-xs text-orange-800 flex items-center justify-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Retrasados</span>
                </div>
              </div>
              
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                <div className="text-xl font-bold text-red-900">{localStats.cancelado}</div>
                <div className="text-xs text-red-800 flex items-center justify-center space-x-1">
                  <XCircle className="w-3 h-3" />
                  <span>Cancelados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de viajes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Lista de Viajes</h3>
                <span className="text-sm text-gray-500">
                  {filteredTrips.length} de {localStats.total} viajes
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {filteredTrips.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🚛</div>
                  <p className="text-lg text-gray-500 mb-2">
                    {allTrips.length === 0 ? 'No hay viajes disponibles' : 'No se encontraron viajes'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {allTrips.length === 0 ? 
                      (systemStatus.connected ? 'Los viajes aparecerán aquí cuando estén disponibles' : 'Verifica la conexión con el servidor') :
                      (searchTerm ? 'Intenta cambiar los términos de búsqueda' : 'No hay viajes con el filtro seleccionado')
                    }
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTrips.map((trip) => {
                    const statusColor = getStatusColor(trip.status);
                    return (
                      <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono text-gray-500">#{trip.id}</span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            statusColor === 'green' ? 'bg-green-100 text-green-800' :
                            statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                            statusColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                            statusColor === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusText(trip.status)}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 text-sm mb-3 leading-tight">
                          {trip.description}
                        </h4>
                        
                        {trip.route && (
                          <div className="text-xs text-gray-600 mb-3">
                            📍 {trip.route.from} → {trip.route.to}
                            {trip.distance && <span className="ml-2">📏 {trip.distance}</span>}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-600 mb-3 space-y-1">
                          <div className="flex justify-between">
                            <span>Salida:</span>
                            <span className="font-medium">{formatBackendTime(trip.departureTime)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Llegada:</span>
                            <span className="font-medium">{formatBackendTime(trip.arrivalTime)}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-3 space-y-1">
                          <div>👤 {trip.driver}</div>
                          <div>🚛 {trip.truck}</div>
                          {trip.cargo && trip.cargo !== 'Carga general' && (
                            <div>📦 {trip.cargo}</div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Progreso</span>
                            <span className="font-medium">{trip.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                statusColor === 'yellow' ? 'bg-yellow-500' :
                                statusColor === 'green' ? 'bg-green-500' :
                                statusColor === 'blue' ? 'bg-blue-500' :
                                statusColor === 'orange' ? 'bg-orange-500' :
                                statusColor === 'red' ? 'bg-red-500' :
                                'bg-gray-500'
                              }`}
                              style={{ width: `${trip.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {trip.alerts && trip.alerts.length > 0 && (
                          <div className="mt-2 text-xs text-orange-600 font-medium">
                            ⚠️ {trip.alerts.length} alerta(s)
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Espaciado final para scroll */}
          <div className="h-6"></div>
        </div>
      </div>

      {/* 📊 FOOTER FIJO */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Mostrando {filteredTrips.length} de {localStats.total} viajes</span>
            {searchTerm && <span>• Búsqueda: "{searchTerm}"</span>}
            {activeFilter !== 'todos' && <span>• Filtro: {getStatusText(activeFilter)}</span>}
          </div>
          <div className="flex items-center space-x-4">
            <span>🇸🇻 El Salvador (UTC-6)</span>
            <span>• Rivera Transport Dashboard v2.0</span>
            {systemStatus.connected ? (
              <span className="text-green-600">• Backend conectado</span>
            ) : (
              <span className="text-red-600">• Sin conexión al backend</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBackendIntegration;