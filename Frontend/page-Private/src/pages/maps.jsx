import React, { useState, useEffect, useRef } from 'react';
import { Truck, TrendingUp, Plus, Minus, Clock, MapPin, Users, Calendar, RefreshCw, Monitor, BarChart3 } from 'lucide-react';

// 📦 IMPORTS DE TUS COMPONENTES (con manejo de errores)
let RealtimeProgressBar, TripMonitoringDashboard;
try {
  RealtimeProgressBar = require('../components/Mapa/RealtimeProgressBar').default;
  TripMonitoringDashboard = require('../components/Mapa/TripMonitoringDashboard').default;
} catch (error) {
  console.warn('Componentes opcionales no encontrados:', error.message);
  // Crear componentes de fallback
  RealtimeProgressBar = ({ viajeId, initialProgress, status }) => (
    <div className="bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${initialProgress}%` }}
      ></div>
    </div>
  );
  TripMonitoringDashboard = ({ onClose }) => (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold mb-4">Dashboard de Monitoreo</h2>
      <p className="text-gray-600 mb-4">Componente en desarrollo</p>
      <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded">
        Volver al Mapa
      </button>
    </div>
  );
}

// COMPONENTE PRINCIPAL - RIVERA TRANSPORT MAP
const RiveraTransportMapDemo = () => {
  const [zoomLevel, setZoomLevel] = useState(8);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // 🆕 NUEVO ESTADO PARA MANEJAR LAS VISTAS
  const [activeView, setActiveView] = useState('map'); // 'map', 'monitoring'
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // 🔄 FUNCIÓN MEJORADA PARA OBTENER DATOS DEL BACKEND
  const fetchMapData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      
      const apiUrl = 'http://localhost:4000/api/viajes/map-data';
      console.log('🗺️ Obteniendo datos del mapa...', isAutoRefresh ? '(auto-refresh)' : '(manual)');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setMapData(result.data);
        setLastUpdate(new Date());
        console.log('✅ Datos actualizados:', {
          total: result.data.statistics?.total_routes || 0,
          completados: result.data.statistics?.completed_routes || 0,
          enCurso: result.data.statistics?.active_routes || 0,
          pendientes: result.data.statistics?.pending_routes || 0
        });
      } else {
        throw new Error(result.message || 'Error al cargar datos del mapa');
      }

    } catch (error) {
      console.error('❌ Error al obtener datos del mapa:', error);
      setError(`API no disponible: ${error.message}`);
      
      // Solo usar datos mock si no hay datos previos
      if (!mapData) {
        console.log('📝 Cargando datos mock de demostración...');
        setMapData({
          locations: [
            {
              name: "Terminal Rivera - Santa Ana",
              coords: [13.9942, -89.5592],
              type: "red",
              number: "HQ",
              description: "Terminal principal - Base de operaciones",
              tripCount: 0,
              isTerminal: true
            },
            {
              name: "San Miguel",
              coords: [13.4833, -88.1833],
              type: "green",
              number: "3",
              description: "3 viajes activos",
              tripCount: 3,
              nextTrip: "2:00 PM"
            }
          ],
          routes: [
            {
              id: "route1",
              coordinates: [[13.9942, -89.5592], [13.4833, -88.1833]],
              status: "in_progress",
              frequency: "high",
              tripInfo: {
                driver: "Carlos Pérez",
                truck: "Volvo FH16 (ABC-123)",
                cargo: "Materiales de construcción",
                departure: "08:00 AM",
                arrival: "2:00 PM",
                progress: 65,
                currentLocation: "En ruta - 65% completado"
              },
              description: "Transporte de materiales de construcción"
            }
          ],
          cities: [
            { name: "San Salvador", coords: [13.6929, -89.2182] }
          ],
          statistics: {
            total_routes: 5,
            active_routes: 2,
            completed_routes: 8,
            pending_routes: 1,
            delayed_routes: 0,
            completion_rate: 85,
            today_trips: 12,
            total_drivers: 3,
            total_trucks: 4,
            on_time_rate: 92,
            average_progress: 67
          }
        });
        setLastUpdate(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔄 CONFIGURAR AUTO-REFRESH MEJORADO
  useEffect(() => {
    fetchMapData();

    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        console.log('🔄 Auto-refresh ejecutándose...');
        fetchMapData(true);
      }, 30000);

      console.log('🔄 Auto-refresh activado (cada 30 segundos)');
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        console.log('🛑 Auto-refresh desactivado');
      }
    };
  }, [autoRefresh]);

  // 🗺️ INICIALIZAR MAPA LEAFLET
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        try {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
          document.head.appendChild(link);

          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
          script.onload = initializeMap;
          script.onerror = () => console.error('Error cargando Leaflet');
          document.head.appendChild(script);
        } catch (error) {
          console.error('Error cargando Leaflet:', error);
        }
      } else if (window.L) {
        initializeMap();
      }
    };

    const initializeMap = () => {
      try {
        if (mapRef.current && window.L && !mapInstanceRef.current && !loading && mapData && activeView === 'map') {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
          }

          const map = window.L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: true
          }).setView([13.7942, -88.8965], zoomLevel);

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
          }).addTo(map);

          // Agregar marcadores de forma segura
          if (mapData.locations && Array.isArray(mapData.locations)) {
            mapData.locations.forEach((location, index) => {
              try {
                if (location.coords && Array.isArray(location.coords) && location.coords.length === 2) {
                  const markerClass = `marker-${location.type || 'blue'}`;
                  
                  const customIcon = window.L.divIcon({
                    className: 'custom-marker-container',
                    html: `<div class="custom-marker ${markerClass}">${location.number || index + 1}</div>`,
                    iconSize: [35, 35],
                    iconAnchor: [17.5, 17.5],
                    popupAnchor: [0, -17.5]
                  });

                  const marker = window.L.marker(location.coords, { icon: customIcon }).addTo(map);
                  
                  const popupContent = location.isTerminal ? 
                    `<div style="font-family: 'Segoe UI', sans-serif; min-width: 200px;">
                      <div style="font-weight: 600; color: #dc2626; margin-bottom: 8px; font-size: 14px;">🏢 ${location.name || 'Terminal'}</div>
                      <div style="color: #666; font-size: 12px; margin-bottom: 6px;">${location.description || ''}</div>
                      <div style="background: #fef2f2; padding: 6px; border-radius: 6px; border-left: 3px solid #dc2626;">
                        <div style="font-size: 11px; color: #991b1b;">Centro de operaciones principal</div>
                      </div>
                    </div>` :
                    `<div style="font-family: 'Segoe UI', sans-serif; min-width: 200px;">
                      <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">📍 ${location.name || 'Ubicación'}</div>
                      <div style="color: #666; font-size: 12px; margin-bottom: 8px;">${location.description || ''}</div>
                      <div style="background: #f0fdf4; padding: 6px; border-radius: 6px; border-left: 3px solid #16a34a;">
                        ${location.nextTrip ? `<div style="font-size: 11px; color: #15803d; margin-bottom: 2px;">⏰ Próximo viaje: ${location.nextTrip}</div>` : ''}
                        <div style="font-size: 11px; color: #15803d;">🚛 ${location.tripCount || 0} viajes programados</div>
                      </div>
                    </div>`;

                  marker.bindPopup(popupContent, {
                    closeButton: true,
                    autoClose: false,
                    className: 'custom-popup'
                  });
                }
              } catch (error) {
                console.error(`Error agregando marcador ${index}:`, error);
              }
            });
          }

          // Agregar rutas de forma segura
          if (mapData.routes && Array.isArray(mapData.routes)) {
            mapData.routes.forEach((route, index) => {
              try {
                if (route.coordinates && Array.isArray(route.coordinates) && route.coordinates.length > 0) {
                  let routeColor = '#2563eb';
                  switch (route.status) {
                    case 'active':
                    case 'in_progress':
                      routeColor = '#16a34a';
                      break;
                    case 'completed':
                      routeColor = '#059669';
                      break;
                    case 'cancelled':
                      routeColor = '#dc2626';
                      break;
                    default:
                      routeColor = '#2563eb';
                  }
                  
                  const routeWeight = route.frequency === 'high' ? 6 : 4;
                  
                  const polyline = window.L.polyline(route.coordinates, {
                    color: routeColor,
                    weight: routeWeight,
                    opacity: 0.8,
                    smoothFactor: 1
                  }).addTo(map);

                  polyline.on('click', () => {
                    setSelectedTrip(route);
                  });
                }
              } catch (error) {
                console.error(`Error agregando ruta ${index}:`, error);
              }
            });
          }

          mapInstanceRef.current = map;
        }
      } catch (error) {
        console.error('Error inicializando mapa:', error);
      }
    };

    if (!loading && mapData && activeView === 'map') {
      loadLeaflet();
    }

    return () => {
      if (mapInstanceRef.current && activeView !== 'map') {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error('Error removiendo mapa:', error);
        }
      }
    };
  }, [loading, mapData, zoomLevel, activeView]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.zoomIn();
        setZoomLevel(prev => prev + 1);
      } catch (error) {
        console.error('Error haciendo zoom in:', error);
      }
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.zoomOut();
        setZoomLevel(prev => prev - 1);
      } catch (error) {
        console.error('Error haciendo zoom out:', error);
      }
    }
  };

  const handleRefresh = () => {
    fetchMapData();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const getTruckDisplayInfo = (truck) => {
    if (!truck || truck === "Camión no especificado" || truck === "Camión por asignar") {
      return {
        display: "Vehículo por asignar",
        icon: "🚛",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100"
      };
    }

    if (truck.includes("Volvo") || truck.includes("Mercedes") || truck.includes("Scania")) {
      return {
        display: truck,
        icon: "🚚",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      };
    }

    if (truck.includes("(") && truck.includes(")")) {
      return {
        display: truck,
        icon: "🚛",
        color: "text-green-600",
        bgColor: "bg-green-100"
      };
    }

    return {
      display: truck,
      icon: "🚛",
      color: "text-gray-600",
      bgColor: "bg-gray-100"
    };
  };

  // 🚀 FUNCIÓN PARA CAMBIAR VISTAS
  const switchToMonitoring = () => {
    setActiveView('monitoring');
    setSelectedTrip(null);
  };

  const switchToMap = () => {
    setActiveView('map');
  };

  // Función para mostrar estadísticas más detalladas
  const renderDetailedStats = () => {
    if (!mapData?.statistics) return null;
    
    return (
      <div className="bg-gray-50 rounded-xl p-3 mt-3">
        <div className="text-xs font-medium text-gray-700 mb-2">
          📊 Estadísticas detalladas:
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Tasa completado:</span>
            <span className="font-medium ml-1">
              {mapData.statistics.completion_rate || 0}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">Puntualidad:</span>
            <span className="font-medium ml-1">
              {mapData.statistics.on_time_rate || 0}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">Progreso prom:</span>
            <span className="font-medium ml-1">
              {mapData.statistics.average_progress || 0}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">Camiones:</span>
            <span className="font-medium ml-1">
              {mapData.statistics.total_trucks || 0}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="w-full h-screen p-6" style={{ backgroundColor: '#34353A' }}>
        <div className="w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative border-2 border-blue-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !mapData) {
    return (
      <div className="w-full h-screen p-6" style={{ backgroundColor: '#34353A' }}>
        <div className="w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative border-2 border-red-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Error al cargar el mapa</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🖥️ RENDERIZAR VISTA DE MONITOREO
  if (activeView === 'monitoring') {
    return (
      <div className="w-full h-screen p-6" style={{ backgroundColor: '#34353A' }}>
        <div className="w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative border-2 border-blue-200">
          <TripMonitoringDashboard onClose={switchToMap} />
        </div>
      </div>
    );
  }

  const truckInfo = selectedTrip ? getTruckDisplayInfo(selectedTrip.tripInfo?.truck) : null;

  return (
    <>
      <style>
        {`
          .custom-marker {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .custom-marker:hover {
            transform: scale(1.2);
            box-shadow: 0 6px 20px rgba(0,0,0,0.4);
          }
          
          .marker-red {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            animation: pulse-red 2s infinite;
          }
          
          .marker-green {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          }
          
          .marker-blue {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          }
          
          @keyframes pulse-red {
            0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 rgba(220, 38, 38, 0.7); }
            50% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 15px rgba(220, 38, 38, 0); }
          }
          
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border: none;
          }
          
          .custom-popup .leaflet-popup-content {
            margin: 12px 16px;
          }
        `}
      </style>
      
      <div className="w-full h-screen p-6" style={{ backgroundColor: '#34353A' }}>
        <div className="w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative border-2 border-blue-200">
          
          {/* Header mejorado con navegación */}
          <div className="absolute top-8 left-8 z-30 flex items-center space-x-4">
            <div 
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border-2 border-blue-200 shadow-lg cursor-pointer hover:bg-blue-50 transition-all duration-200"
              onClick={() => window.history.back()}
            >
              <span className="text-lg text-blue-600 font-bold">←</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema Rivera Transport</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">Monitoreo en tiempo real</p>
                {lastUpdate && (
                  <span className="text-xs text-gray-500">
                    • Actualizado: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            
            {/* Controles de actualización y navegación */}
            <div className="flex items-center space-x-2">
              <button
                onClick={switchToMonitoring}
                className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border-2 border-green-200 shadow-lg cursor-pointer hover:bg-green-50 transition-all duration-200"
                title="Ver Dashboard de Monitoreo"
              >
                <Monitor className="w-5 h-5 text-green-600" />
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border-2 border-blue-200 shadow-lg cursor-pointer hover:bg-blue-50 transition-all duration-200 disabled:opacity-50"
                title="Actualizar datos manualmente"
              >
                <RefreshCw className={`w-5 h-5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={toggleAutoRefresh}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-gray-100 text-gray-800 border border-gray-300'
                }`}
                title={autoRefresh ? 'Auto-refresh activado' : 'Auto-refresh desactivado'}
              >
                {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
              </button>
            </div>
          </div>

          {/* Indicador de estado de conexión */}
          <div className="absolute top-8 right-8 z-30">
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-2 ${
              error 
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-green-100 text-green-800 border border-green-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} ${!error ? 'animate-pulse' : ''}`}></div>
              <span>{error ? 'Sin conexión' : 'Conectado'}</span>
            </div>
          </div>

          {/* Mapa */}
          <div 
            ref={mapRef}
            className="w-full h-full rounded-[2rem]"
            style={{ zIndex: 1 }}
          />

          {/* Panel de estadísticas principal */}
          {mapData && mapData.statistics && (
            <div className="absolute bottom-8 left-8 z-30 bg-white rounded-3xl shadow-2xl p-6 w-80 border-2 border-blue-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1 font-medium">Viajes Completados</div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {mapData.statistics.completed_routes || 0}
                    </span>
                    <span className="text-lg text-gray-400">
                      / {mapData.statistics.total_routes || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-semibold">
                      {mapData.statistics.completion_rate || 0}% completados
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Estadísticas adicionales */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-500 mr-1" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mapData.statistics.today_trips || 0}
                  </div>
                  <div className="text-xs text-gray-500">Viajes hoy</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-green-500 mr-1" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mapData.statistics.total_drivers || 0}
                  </div>
                  <div className="text-xs text-gray-500">Conductores</div>
                </div>
              </div>

              {/* Panel adicional con más estadísticas */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {mapData.statistics.active_routes || 0}
                    </div>
                    <div className="text-xs text-gray-500">En curso</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">
                      {mapData.statistics.pending_routes || 0}
                    </div>
                    <div className="text-xs text-gray-500">Pendientes</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">
                      {mapData.statistics.delayed_routes || 0}
                    </div>
                    <div className="text-xs text-gray-500">Retrasados</div>
                  </div>
                </div>
              </div>

              {/* Estadísticas detalladas */}
              {renderDetailedStats()}

              {/* Botón para acceder al dashboard de monitoreo */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={switchToMonitoring}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Ver Dashboard Completo</span>
                </button>
              </div>

              {/* Indicador de auto-refresh */}
              {autoRefresh && (
                <div className="mt-3">
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Actualizando cada 30 segundos</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Panel de información de viaje seleccionado */}
          {selectedTrip && (
            <div className="absolute top-24 left-8 z-30 bg-white rounded-2xl shadow-xl p-5 w-80 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Información del Viaje</h3>
                <button 
                  onClick={() => setSelectedTrip(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Conductor */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedTrip.tripInfo?.driver || 'No asignado'}
                    </div>
                    <div className="text-xs text-gray-500">Conductor asignado</div>
                  </div>
                </div>
                
                {/* Vehículo */}
                {truckInfo && (
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${truckInfo.bgColor} rounded-xl flex items-center justify-center`}>
                      <span className="text-lg">{truckInfo.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${truckInfo.color}`}>
                        {truckInfo.display}
                      </div>
                      <div className="text-xs text-gray-500">Vehículo de transporte</div>
                      {selectedTrip.tripInfo?.truck?.includes("por asignar") && (
                        <div className="text-xs text-yellow-600 font-medium mt-1">⚠️ Pendiente de asignación</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Carga */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedTrip.tripInfo?.cargo || 'Carga general'}
                    </div>
                    <div className="text-xs text-gray-500">Tipo de carga</div>
                  </div>
                </div>
                
                {/* Progreso del viaje */}
                {selectedTrip.tripInfo?.progress > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Progreso del viaje:</div>
                    <RealtimeProgressBar 
                      viajeId={selectedTrip.id}
                      initialProgress={selectedTrip.tripInfo.progress}
                      status="en_curso"
                    />
                  </div>
                )}
                
                {/* Horarios */}
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Salida:</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {selectedTrip.tripInfo?.departure || 'No programado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Llegada estimada:</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {selectedTrip.tripInfo?.arrival || 'No programado'}
                    </span>
                  </div>
                </div>
                
                {/* Estado del viaje */}
                <div className="flex justify-center">
                  <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                    selectedTrip.status === 'active' || selectedTrip.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                    selectedTrip.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    selectedTrip.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedTrip.status === 'active' || selectedTrip.status === 'in_progress' ? '🟢 En progreso' :
                     selectedTrip.status === 'completed' ? '🔵 Completado' :
                     selectedTrip.status === 'cancelled' ? '🔴 Cancelado' :
                     '🟡 Programado'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controles de zoom */}
          <div className="absolute top-32 right-8 z-30 flex flex-col space-y-3">
            <button 
              onClick={handleZoomIn}
              className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border-2 border-blue-100"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button 
              onClick={handleZoomOut}
              className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border-2 border-blue-100"
            >
              <Minus className="w-6 h-6" />
            </button>
          </div>

          {/* Leyenda */}
          <div className="absolute bottom-8 right-8 z-30 bg-white rounded-2xl shadow-xl p-4 border-2 border-blue-100">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Leyenda</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
                <span className="text-xs text-gray-600">Terminal Principal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                <span className="text-xs text-gray-600">Rutas Activas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                <span className="text-xs text-gray-600">Rutas Programadas</span>
              </div>
              {error && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-xs text-yellow-800 font-medium">⚠️ Modo Demo</div>
                  <div className="text-xs text-yellow-600 mt-1">Usando datos de ejemplo</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RiveraTransportMapDemo;