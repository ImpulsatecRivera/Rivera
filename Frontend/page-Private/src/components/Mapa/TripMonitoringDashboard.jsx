import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Truck, 
  BarChart3, 
  MapPin, 
  RefreshCw,
  TrendingUp,
  Calendar,
  Users,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  X,
  Bell
} from 'lucide-react';

const DashboardOptimizedLayout = () => {
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [systemStatus, setSystemStatus] = useState({
    connected: true,
    autoRefresh: true,
    lastUpdate: new Date(),
    refreshInterval: 30
  });
  const [loading, setLoading] = useState(false);
  const [filteredTrips, setFilteredTrips] = useState([]);

  // 🎯 Datos de ejemplo de viajes
  const [trips] = useState([
    {
      id: 'VJ001',
      description: 'Transporte de electrónicos - San Salvador a Santa Ana',
      status: 'en_curso',
      progress: 65,
      driver: 'Carlos Pérez',
      truck: 'Volvo FH16 (ABC-123)',
      departure: '08:00',
      arrival: '12:00',
      route: { from: 'San Salvador', to: 'Santa Ana' }
    },
    {
      id: 'VJ002', 
      description: 'Carga de alimentos - Soyapango a San Miguel',
      status: 'completado',
      progress: 100,
      driver: 'María González',
      truck: 'Mercedes Actros (DEF-456)',
      departure: '06:30',
      arrival: '10:30',
      route: { from: 'Soyapango', to: 'San Miguel' }
    },
    {
      id: 'VJ003',
      description: 'Materiales de construcción - La Libertad a Chalatenango',
      status: 'pendiente',
      progress: 0,
      driver: 'Juan López',
      truck: 'Scania R450 (GHI-789)',
      departure: '14:00',
      arrival: '18:00',
      route: { from: 'La Libertad', to: 'Chalatenango' }
    },
    {
      id: 'VJ004',
      description: 'Productos farmacéuticos - Santa Ana a Usulután',
      status: 'en_curso',
      progress: 35,
      driver: 'Ana Martínez',
      truck: 'Freightliner (JKL-012)',
      departure: '09:15',
      arrival: '13:45',
      route: { from: 'Santa Ana', to: 'Usulután' }
    },
    {
      id: 'VJ005',
      description: 'Textiles - San Miguel a Ahuachapán',
      status: 'retrasado',
      progress: 25,
      driver: 'Roberto Silva',
      truck: 'Volvo VNL (MNO-345)',
      departure: '07:00',
      arrival: '11:30',
      route: { from: 'San Miguel', to: 'Ahuachapán' }
    },
    {
      id: 'VJ006',
      description: 'Maquinaria industrial - Puerto Acajutla a San Salvador',
      status: 'completado',
      progress: 100,
      driver: 'Elena Rodríguez',
      truck: 'Kenworth T680 (PQR-678)',
      departure: '05:00',
      arrival: '09:00',
      route: { from: 'Puerto Acajutla', to: 'San Salvador' }
    }
  ]);

  // 🔄 Simular datos del backend
  useEffect(() => {
    const completados = trips.filter(t => t.status === 'completado').length;
    const enCurso = trips.filter(t => t.status === 'en_curso').length;
    const pendientes = trips.filter(t => t.status === 'pendiente').length;
    const retrasados = trips.filter(t => t.status === 'retrasado').length;
    
    setRealTimeMetrics({
      hoy: {
        total: trips.length,
        enCurso: enCurso,
        completados: completados,
        pendientes: pendientes,
        retrasados: retrasados,
        progresoPromedio: Math.round(trips.reduce((acc, trip) => acc + trip.progress, 0) / trips.length)
      },
      general: {
        totalViajes: 156,
        viajesActivos: enCurso + pendientes,
        tasaCompletado: 94,
        puntualidad: 87
      }
    });
  }, [trips]);

  // 🔍 Filtrar viajes
  useEffect(() => {
    let filtered = [...trips];
    
    if (activeFilter !== 'todos') {
      filtered = filtered.filter(trip => trip.status === activeFilter);
    }
    
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(trip =>
        trip.description.toLowerCase().includes(search) ||
        trip.driver.toLowerCase().includes(search) ||
        trip.truck.toLowerCase().includes(search) ||
        trip.id.toLowerCase().includes(search)
      );
    }
    
    setFilteredTrips(filtered);
  }, [trips, activeFilter, searchTerm]);

  const handleRefresh = async () => {
    setLoading(true);
    setTimeout(() => {
      setSystemStatus(prev => ({ ...prev, lastUpdate: new Date() }));
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pendiente': 'yellow',
      'en_curso': 'green', 
      'completado': 'blue',
      'retrasado': 'orange',
      'cancelado': 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const texts = {
      'pendiente': 'Pendiente',
      'en_curso': 'En Curso',
      'completado': 'Completado', 
      'retrasado': 'Retrasado',
      'cancelado': 'Cancelado'
    };
    return texts[status] || status;
  };

  if (!realTimeMetrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* 🔝 HEADER FIJO - Barra superior con título y controles principales */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Título y estado */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Rivera Transport</h1>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${systemStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span>{systemStatus.connected ? 'Conectado' : 'Desconectado'}</span>
                  </div>
                  <span>•</span>
                  <span>Auto-refresh: {systemStatus.autoRefresh ? `${systemStatus.refreshInterval}s` : 'Off'}</span>
                  <span>•</span>
                  <span>{systemStatus.lastUpdate.toLocaleTimeString('es-SV')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controles principales */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:block">Actualizar</span>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 🔍 BARRA DE BÚSQUEDA Y FILTROS - Siempre visible */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Búsqueda principal */}
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

          {/* Filtros rápidos */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <select 
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[160px]"
            >
              <option value="todos">Todos ({realTimeMetrics.hoy.total})</option>
              <option value="pendiente">Pendientes ({realTimeMetrics.hoy.pendientes})</option>
              <option value="en_curso">En Curso ({realTimeMetrics.hoy.enCurso})</option>
              <option value="completado">Completados ({realTimeMetrics.hoy.completados})</option>
              <option value="retrasado">Retrasados ({realTimeMetrics.hoy.retrasados})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📊 CONTENIDO PRINCIPAL CON SCROLL */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          
          {/* Métricas principales en cards compactas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">{realTimeMetrics.hoy.total}</div>
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
                  <div className="text-2xl font-bold text-green-900">{realTimeMetrics.hoy.enCurso}</div>
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
                  <div className="text-2xl font-bold text-purple-900">{realTimeMetrics.hoy.progresoPromedio}%</div>
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
                  <div className="text-2xl font-bold text-orange-900">{realTimeMetrics.general.viajesActivos}</div>
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
                <div className="text-xl font-bold text-gray-900">{realTimeMetrics.hoy.total}</div>
                <div className="text-xs text-gray-600 flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Total</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                <div className="text-xl font-bold text-yellow-900">{realTimeMetrics.hoy.pendientes}</div>
                <div className="text-xs text-yellow-800 flex items-center justify-center space-x-1">
                  <Pause className="w-3 h-3" />
                  <span>Pendientes</span>
                </div>
              </div>
              
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                <div className="text-xl font-bold text-green-900">{realTimeMetrics.hoy.enCurso}</div>
                <div className="text-xs text-green-800 flex items-center justify-center space-x-1">
                  <Truck className="w-3 h-3" />
                  <span>En Curso</span>
                </div>
              </div>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                <div className="text-xl font-bold text-blue-900">{realTimeMetrics.hoy.completados}</div>
                <div className="text-xs text-blue-800 flex items-center justify-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Completados</span>
                </div>
              </div>
              
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                <div className="text-xl font-bold text-orange-900">{realTimeMetrics.hoy.retrasados}</div>
                <div className="text-xs text-orange-800 flex items-center justify-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Retrasados</span>
                </div>
              </div>
              
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                <div className="text-xl font-bold text-red-900">0</div>
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Lista de Viajes
                </h3>
                <span className="text-sm text-gray-500">
                  {filteredTrips.length} de {realTimeMetrics.hoy.total} viajes
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {filteredTrips.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🚛</div>
                  <p className="text-lg text-gray-500 mb-2">No se encontraron viajes</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm ? 'Intenta cambiar los términos de búsqueda' : 'No hay viajes con el filtro seleccionado'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTrips.map((trip) => {
                    const statusColor = getStatusColor(trip.status);
                    return (
                      <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white">
                        {/* Header */}
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
                        
                        {/* Descripción */}
                        <h4 className="font-medium text-gray-900 text-sm mb-3 leading-tight">
                          {trip.description}
                        </h4>
                        
                        {/* Ruta */}
                        <div className="text-xs text-gray-600 mb-3">
                          📍 {trip.route.from} → {trip.route.to}
                        </div>
                        
                        {/* Horarios */}
                        <div className="text-xs text-gray-600 mb-3 space-y-1">
                          <div className="flex justify-between">
                            <span>Salida:</span>
                            <span className="font-medium">{trip.departure}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Llegada:</span>
                            <span className="font-medium">{trip.arrival}</span>
                          </div>
                        </div>
                        
                        {/* Conductor y Vehículo */}
                        <div className="text-xs text-gray-600 mb-3 space-y-1">
                          <div>👤 {trip.driver}</div>
                          <div>🚛 {trip.truck}</div>
                        </div>
                        
                        {/* Progreso */}
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

      {/* 📊 FOOTER FIJO - Información de estado */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Mostrando {filteredTrips.length} de {realTimeMetrics.hoy.total} viajes</span>
            {searchTerm && <span>• Búsqueda: "{searchTerm}"</span>}
            {activeFilter !== 'todos' && <span>• Filtro: {getStatusText(activeFilter)}</span>}
          </div>
          <div className="flex items-center space-x-4">
            <span>🇸🇻 El Salvador (UTC-6)</span>
            <span>• Rivera Transport Dashboard v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOptimizedLayout;