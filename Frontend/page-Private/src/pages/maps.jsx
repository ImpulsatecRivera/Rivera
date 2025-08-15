// 📁 Frontend/src/components/RiveraTransportMapDemo.jsx
// VERSIÓN COMPLETA ACTUALIZADA - CON MANEJO CORRECTO DE FORMATO DE HORARIOS DEL BACKEND

import React, { useState, useEffect, useRef } from 'react';
import { Truck, TrendingUp, Plus, Minus, Clock, MapPin, Users, Calendar, RefreshCw, Monitor, BarChart3 } from 'lucide-react';

// 📦 IMPORTS DE TUS COMPONENTES
import RealtimeProgressBar from '../components/Mapa/RealtimeProgressBar';
import TripMonitoringDashboard from '../components/Mapa/TripMonitoringDashboard';

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

  // 🕐 FUNCIÓN CORREGIDA: Formatear hora del backend (maneja formato "HH:mm")
  const formatBackendTime = (timeInput, format = 'time') => {
    if (!timeInput) return 'No programado';
    
    try {
      let date;
      
      // Manejar diferentes tipos de entrada
      if (typeof timeInput === 'string') {
        if (timeInput === 'Invalid Date' || timeInput === '') {
          return 'Hora no válida';
        }
        
        // 🆕 CASO ESPECIAL: Si es solo hora "HH:mm" (como "05:25", "11:00")
        if (/^\d{1,2}:\d{2}$/.test(timeInput)) {
          // Crear fecha de hoy con la hora especificada
          const today = new Date();
          const [hours, minutes] = timeInput.split(':').map(Number);
          
          // Crear fecha en zona horaria de El Salvador
          date = new Date();
          date.setHours(hours, minutes, 0, 0);
          
          // Si la hora ya pasó hoy, asumir que es para mañana
          const now = new Date();
          if (date < now) {
            date.setDate(date.getDate() + 1);
          }
        }
        // Formato ISO estándar
        else if (timeInput.includes('T') && timeInput.includes('Z')) {
          date = new Date(timeInput);
        }
        // Otros formatos
        else {
          date = new Date(timeInput);
        }
      } else if (timeInput instanceof Date) {
        date = timeInput;
      } else {
        // Si es un timestamp
        date = new Date(timeInput);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('Fecha inválida recibida:', timeInput);
        return 'Hora inválida';
      }
      
      const options = {
        timeZone: 'America/El_Salvador', // 🇸🇻 Zona horaria de El Salvador
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
      } else if (format === 'short') {
        options.hour = 'numeric';
        options.minute = '2-digit';
        return date.toLocaleTimeString('es-SV', options);
      }
      
      return date.toLocaleTimeString('es-SV', options);
      
    } catch (error) {
      console.error('Error formateando fecha:', error, 'Input:', timeInput);
      return 'Error en fecha';
    }
  };

  // 🔧 FUNCIÓN ADICIONAL: Convertir hora simple a fecha completa
  const timeStringToDate = (timeString, baseDate = null) => {
    if (!timeString || typeof timeString !== 'string') {
      return null;
    }
    
    // Si ya es formato ISO, devolver como está
    if (timeString.includes('T') || timeString.includes('Z')) {
      return timeString;
    }
    
    // Si es formato "HH:mm"
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      const base = baseDate ? new Date(baseDate) : new Date();
      const [hours, minutes] = timeString.split(':').map(Number);
      
      base.setHours(hours, minutes, 0, 0);
      
      return base.toISOString();
    }
    
    return timeString;
  };

  // 🔄 FUNCIÓN PARA PROCESAR DATOS DEL BACKEND (ACTUALIZADA)
  const processBackendResponse = (data) => {
    if (!data) return data;
    
    // Procesar rutas y convertir horarios
    if (data.routes && Array.isArray(data.routes)) {
      data.routes = data.routes.map(route => {
        if (route.tripInfo) {
          // Convertir horarios de formato "HH:mm" a ISO si es necesario
          if (route.tripInfo.departure) {
            route.tripInfo.departure = timeStringToDate(route.tripInfo.departure);
          }
          if (route.tripInfo.arrival) {
            route.tripInfo.arrival = timeStringToDate(route.tripInfo.arrival);
          }
          if (route.tripInfo.estimatedArrival) {
            route.tripInfo.estimatedArrival = timeStringToDate(route.tripInfo.estimatedArrival);
          }
          if (route.tripInfo.realDeparture) {
            route.tripInfo.realDeparture = timeStringToDate(route.tripInfo.realDeparture);
          }
          if (route.tripInfo.realArrival) {
            route.tripInfo.realArrival = timeStringToDate(route.tripInfo.realArrival);
          }
        }
        return route;
      });
    }
    
    // Procesar ubicaciones con nextTrip
    if (data.locations && Array.isArray(data.locations)) {
      data.locations = data.locations.map(location => {
        if (location.nextTrip) {
          location.nextTrip = timeStringToDate(location.nextTrip);
        }
        return location;
      });
    }
    
    return data;
  };

  // 🆕 FUNCIÓN PARA GENERAR FECHAS DEMO VÁLIDAS
  const generateValidDemoData = () => {
    const now = new Date();
    const departure = new Date(now);
    departure.setHours(14, 0, 0, 0); // 2:00 PM hoy
    
    const arrival = new Date(departure);
    arrival.setHours(20, 0, 0, 0); // 8:00 PM hoy
    
    return {
      departure: departure.toISOString(),
      arrival: arrival.toISOString()
    };
  };

  // 🎯 FUNCIÓN ESPECÍFICA PARA TU BACKEND: Mostrar información de viaje
  const renderTripTimeInfo = (tripInfo, tripId) => {
    if (!tripInfo) return null;
    
    // 🔍 Debug para asegurar que se usa la información correcta
    console.log(`🕐 Renderizando horarios para viaje ${tripId}:`, {
      departure: tripInfo.departure,
      arrival: tripInfo.arrival,
      realDeparture: tripInfo.realDeparture,
      realArrival: tripInfo.realArrival
    });
    
    return (
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="space-y-3">
          {/* Salida */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Salida programada:</span>
            </div>
            <span className="font-semibold text-gray-900 text-right">
              {formatBackendTime(tripInfo.departure)}
            </span>
          </div>
          
          {/* Llegada estimada */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Llegada estimada:</span>
            </div>
            <span className="font-semibold text-gray-900 text-right">
              {formatBackendTime(tripInfo.arrival || tripInfo.estimatedArrival)}
            </span>
          </div>
          
          {/* Salida real (si existe) */}
          {tripInfo.realDeparture && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-gray-600">Salida real:</span>
              </div>
              <span className="font-semibold text-green-700 text-right">
                {formatBackendTime(tripInfo.realDeparture)}
              </span>
            </div>
          )}
          
          {/* Llegada real (si existe) */}
          {tripInfo.realArrival && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-gray-600">Llegada real:</span>
              </div>
              <span className="font-semibold text-blue-700 text-right">
                {formatBackendTime(tripInfo.realArrival)}
              </span>
            </div>
          )}
          
          {/* Duración estimada */}
          {tripInfo.estimatedTime && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-gray-600">Duración:</span>
              </div>
              <span className="font-semibold text-purple-700 text-right">
                {tripInfo.estimatedTime}
              </span>
            </div>
          )}
          
          {/* Información adicional de timezone */}
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              🇸🇻 Horario de El Salvador (UTC-6)
            </div>
          </div>
          
          {/* Información del formato de datos */}
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-blue-600 text-center">
              📊 Viaje: {tripId.slice(-8)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🔄 FUNCIÓN ACTUALIZADA PARA OBTENER DATOS DEL BACKEND
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
        // 🆕 PROCESAR DATOS CON CONVERSIÓN DE HORARIOS
        console.log('📊 Datos raw del backend:', result.data);
        
        const processedData = processBackendResponse(result.data);
        
        console.log('✅ Datos procesados:', processedData);
        
        setMapData(processedData);
        setLastUpdate(new Date());
        
        console.log('✅ Datos actualizados:', {
          total: processedData.statistics?.total_routes || 0,
          completados: processedData.statistics?.completed_routes || 0,
          enCurso: processedData.statistics?.active_routes || 0,
          pendientes: processedData.statistics?.pending_routes || 0,
          retrasados: processedData.statistics?.delayed_routes || 0
        });
        
        // 🔍 Debug de horarios procesados
        if (processedData.routes && processedData.routes.length > 0) {
          console.log('🕐 Horarios procesados:');
          processedData.routes.forEach((route, index) => {
            console.log(`Ruta ${index + 1}:`, {
              id: route.id,
              departure: route.tripInfo?.departure,
              arrival: route.tripInfo?.arrival,
              status: route.status
            });
          });
        }
        
      } else {
        throw new Error(result.message || 'Error al cargar datos del mapa');
      }

    } catch (error) {
      console.error('❌ Error al obtener datos del mapa:', error);
      setError(`API no disponible: ${error.message}`);
      
      // Solo usar datos mock si no hay datos previos
      if (!mapData) {
        console.log('📝 Cargando datos mock de demostración...');
        const validDates = generateValidDemoData();
        
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
              nextTrip: validDates.departure
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
                departure: validDates.departure,
                arrival: validDates.arrival,
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

  // 🔄 EFECTO PARA RESETEAR INFORMACIÓN AL CAMBIAR DE VIAJE SELECCIONADO
  useEffect(() => {
    // Cuando cambia el viaje seleccionado, asegurar que la información se actualice
    if (selectedTrip) {
      console.log('🔍 Viaje seleccionado cambiado:', {
        id: selectedTrip.id,
        status: selectedTrip.status,
        description: selectedTrip.description,
        progress: selectedTrip.tripInfo?.progress
      });
    }
  }, [selectedTrip?.id]); // Solo observar cambios en el ID

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
                        ${location.nextTrip ? `<div style="font-size: 11px; color: #15803d; margin-bottom: 2px;">⏰ Próximo viaje: ${formatBackendTime(location.nextTrip, 'short')}</div>` : ''}
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
                  let routeColor = '#3b82f6'; // Azul por defecto
                  
                  // Mapear estados a colores específicos
                  const statusColorMap = {
                    'pendiente': '#eab308',    // Amarillo
                    'scheduled': '#eab308',    // Amarillo
                    'en_curso': '#16a34a',     // Verde
                    'active': '#16a34a',       // Verde  
                    'in_progress': '#16a34a',  // Verde
                    'completado': '#3b82f6',   // Azul
                    'completed': '#3b82f6',    // Azul
                    'retrasado': '#f97316',    // Naranja
                    'delayed': '#f97316',      // Naranja
                    'cancelado': '#dc2626',    // Rojo oscuro
                    'cancelled': '#dc2626'     // Rojo oscuro
                  };
                  
                  routeColor = statusColorMap[route.status] || '#3b82f6';
                  
                  const routeWeight = route.frequency === 'high' ? 6 : 4;
                  
                  const polyline = window.L.polyline(route.coordinates, {
                    color: routeColor,
                    weight: routeWeight,
                    opacity: 0.8,
                    smoothFactor: 1
                  }).addTo(map);

                  polyline.on('click', () => {
                    console.log('🖱️ Ruta clickeada:', {
                      id: route.id,
                      status: route.status,
                      description: route.description,
                      progress: route.tripInfo?.progress
                    });
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

  // 🆕 NUEVA FUNCIÓN: Mapear estado del backend al frontend (MEJORADA)
  const mapStatusToFrontend = (backendStatus) => {
    if (!backendStatus) {
      console.warn('🔍 Estado vacío recibido');
      return 'pendiente';
    }
    
    const normalizedStatus = backendStatus.toLowerCase().trim();
    
    const statusMap = {
      'programado': 'pendiente',
      'scheduled': 'pendiente',
      'pendiente': 'pendiente',
      'en_curso': 'en_curso',
      'in_progress': 'en_curso',
      'active': 'en_curso',
      'completado': 'completado',
      'completed': 'completado',
      'retrasado': 'retrasado',
      'delayed': 'retrasado',
      'cancelado': 'cancelado',
      'cancelled': 'cancelado'
    };
    
    const mappedStatus = statusMap[normalizedStatus];
    
    if (!mappedStatus) {
      console.warn('🔍 Estado no mapeado:', backendStatus, '-> usando pendiente como fallback');
      return 'pendiente';
    }
    
    console.log('✅ Estado mapeado:', backendStatus, '->', mappedStatus);
    return mappedStatus;
  };

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
          
          /* 🆕 ESTILOS PARA SCROLL PERSONALIZADO */
          .scrollbar-thin {
            scrollbar-width: thin;
          }
          
          .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
            background-color: #d1d5db;
            border-radius: 6px;
          }
          
          .scrollbar-track-gray-100::-webkit-scrollbar-track {
            background-color: #f3f4f6;
            border-radius: 6px;
          }
          
          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }
          
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #f3f4f6;
            border-radius: 6px;
          }
          
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 6px;
          }
          
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
          
          /* Ocultar scrollbar en Firefox si es necesario */
          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db #f3f4f6;
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
                <p className="text-sm text-gray-600">Monitoreo híbrido en tiempo real</p>
                {lastUpdate && (
                  <span className="text-xs text-gray-500">
                    • Actualizado: {formatBackendTime(lastUpdate.toISOString(), 'short')}
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
              <span>{error ? 'Sin conexión' : 'Sistema Híbrido'}</span>
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
                    <span>Sistema híbrido - Actualiza cada 30s</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Panel de información de viaje seleccionado - ACTUALIZADO PARA TU BACKEND */}
          {selectedTrip && (
            <div className="absolute top-24 left-8 z-30 bg-white rounded-2xl shadow-xl border-2 border-blue-200 w-80 max-h-[calc(100vh-200px)]">
              {/* Header fijo */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white rounded-t-2xl sticky top-0 z-10">
                <h3 className="text-lg font-bold text-gray-900">Información del Viaje</h3>
                <button 
                  onClick={() => setSelectedTrip(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              
              {/* Contenido con scroll */}
              <div className="overflow-y-auto max-h-[calc(100vh-280px)] p-5 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                
                {/* ID del viaje */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-blue-800 mb-1">📋 ID del viaje</div>
                  <div className="text-xs text-blue-700 font-mono break-all">{selectedTrip.id}</div>
                </div>
                
                {/* Conductor */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {selectedTrip.tripInfo?.driver || 'No asignado'}
                    </div>
                    <div className="text-xs text-gray-500">Conductor asignado</div>
                    {selectedTrip.tripInfo?.driverPhone && selectedTrip.tripInfo.driverPhone !== 'No disponible' && (
                      <div className="text-xs text-blue-600">{selectedTrip.tripInfo.driverPhone}</div>
                    )}
                  </div>
                </div>
                
                {/* Vehículo */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🚛</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-green-600 truncate">
                      {selectedTrip.tripInfo?.truck || 'Vehículo por asignar'}
                    </div>
                    <div className="text-xs text-gray-500">Vehículo de transporte</div>
                    {selectedTrip.tripInfo?.truck?.includes("por asignar") && (
                      <div className="text-xs text-yellow-600 font-medium mt-1">⚠️ Pendiente de asignación</div>
                    )}
                  </div>
                </div>
                
                {/* Ruta */}
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedTrip.route?.from} → {selectedTrip.route?.to}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedTrip.route?.fromType} a {selectedTrip.route?.toType}
                    </div>
                    {selectedTrip.distance && (
                      <div className="text-xs text-purple-600 mt-1">
                        📏 {selectedTrip.distance} • ⏱️ {selectedTrip.estimatedTime}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Carga */}
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📦</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 break-words">
                      {selectedTrip.tripInfo?.cargo || 'Carga general'}
                    </div>
                    <div className="text-xs text-gray-500">Tipo de carga</div>
                    <div className="text-xs text-orange-600 mt-1">
                      {selectedTrip.description}
                    </div>
                  </div>
                </div>
                
                {/* Progreso */}
                {selectedTrip.tripInfo?.progress >= 0 && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-xs">Progreso del viaje:</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
                          {selectedTrip.tripInfo.progress}%
                        </span>
                      </div>
                    </div>
                    {(() => {
                      const mappedStatus = mapStatusToFrontend(selectedTrip.status);
                      console.log('🔍 Props para RealtimeProgressBar:', {
                        viajeId: selectedTrip.id,
                        initialProgress: selectedTrip.tripInfo.progress,
                        originalStatus: selectedTrip.status,
                        mappedStatus: mappedStatus,
                        description: selectedTrip.description
                      });
                      
                      return (
                        <RealtimeProgressBar 
                          key={`progress-${selectedTrip.id}-${selectedTrip.tripInfo?.progress || 0}`} // 🆕 Clave única
                          viajeId={selectedTrip.id}
                          initialProgress={selectedTrip.tripInfo.progress}
                          status={mappedStatus}
                          enablePolling={!error} // Solo hacer polling si no hay error
                          description={selectedTrip.description} // 🆕 Pasar descripción
                          tripInfo={selectedTrip.tripInfo} // 🆕 Pasar toda la info del viaje
                        />
                      );
                    })()}
                    <div className="text-xs text-gray-600 mt-2">
                      📍 {selectedTrip.tripInfo.currentLocation}
                    </div>
                  </div>
                )}
                
                {/* 🕐 HORARIOS CORREGIDOS - USANDO LA NUEVA FUNCIÓN */}
                {renderTripTimeInfo(selectedTrip.tripInfo, selectedTrip.id)}
                
                {/* Costos */}
                {selectedTrip.costs && (
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="text-sm font-medium text-green-800 mb-2">💰 Costos del viaje</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-green-700">Combustible:</span>
                        <span className="font-medium">${selectedTrip.costs.fuel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Peajes:</span>
                        <span className="font-medium">${selectedTrip.costs.tolls}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Otros:</span>
                        <span className="font-medium">${selectedTrip.costs.others}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-green-800">Total:</span>
                        <span className="text-green-800">${selectedTrip.costs.total}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Condiciones */}
                {selectedTrip.conditions && (
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="text-sm font-medium text-blue-800 mb-2">🌤️ Condiciones del viaje</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Clima:</span>
                        <span className="font-medium capitalize">{selectedTrip.conditions.weather}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Tráfico:</span>
                        <span className="font-medium capitalize">{selectedTrip.conditions.traffic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Carretera:</span>
                        <span className="font-medium capitalize">{selectedTrip.conditions.road}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Alertas */}
                {selectedTrip.alerts && selectedTrip.alerts.length > 0 && (
                  <div className="bg-yellow-50 rounded-xl p-3">
                    <div className="text-sm font-medium text-yellow-800 mb-2">⚠️ Alertas del viaje</div>
                    <div className="space-y-2">
                      {selectedTrip.alerts.map((alert, index) => (
                        <div key={index} className="text-xs">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.priority === 'alta' ? 'bg-red-100 text-red-800' :
                              alert.priority === 'media' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {alert.type}
                            </span>
                            <span className="text-gray-500">
                              {formatBackendTime(alert.date, 'datetime')}
                            </span>
                          </div>
                          <div className="text-yellow-700">{alert.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Estado del viaje */}
                <div className="flex justify-center">
                  <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                    selectedTrip.status === 'en_curso' || selectedTrip.status === 'active' || selectedTrip.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                    selectedTrip.status === 'completado' || selectedTrip.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    selectedTrip.status === 'cancelado' || selectedTrip.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    selectedTrip.status === 'retrasado' || selectedTrip.status === 'delayed' ? 'bg-orange-100 text-orange-800' :
                    selectedTrip.status === 'pendiente' || selectedTrip.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedTrip.statusText || 
                     (selectedTrip.status === 'en_curso' || selectedTrip.status === 'active' || selectedTrip.status === 'in_progress' ? '🟢 En Curso' :
                      selectedTrip.status === 'completado' || selectedTrip.status === 'completed' ? '🔵 Completado' :
                      selectedTrip.status === 'cancelado' || selectedTrip.status === 'cancelled' ? '🔴 Cancelado' :
                      selectedTrip.status === 'retrasado' || selectedTrip.status === 'delayed' ? '🟠 Retrasado' :
                      selectedTrip.status === 'pendiente' || selectedTrip.status === 'scheduled' ? '🟡 Pendiente' :
                      '⚪ Estado desconocido')}
                  </div>
                </div>
                
                {/* Separador final para mejor scroll */}
                <div className="h-4"></div>
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

          {/* Leyenda mejorada */}
          <div className="absolute bottom-8 right-8 z-30 bg-white rounded-2xl shadow-xl p-4 border-2 border-blue-100">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Leyenda</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
                <span className="text-xs text-gray-600">Terminal Principal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow"></div>
                <span className="text-xs text-gray-600">Pendiente</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                <span className="text-xs text-gray-600">En Curso</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                <span className="text-xs text-gray-600">Completado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow"></div>
                <span className="text-xs text-gray-600">Retrasado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow"></div>
                <span className="text-xs text-gray-600">Cancelado</span>
              </div>
              
              {/* 🆕 Información del sistema híbrido */}
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="text-xs text-blue-800 font-medium">🧠 Sistema Híbrido</div>
                <div className="text-xs text-blue-600 mt-1">
                  {error ? 'Modo demo - datos estáticos' : 'Datos en tiempo real activo'}
                </div>
              </div>
              
              {/* 🕐 Información de timezone */}
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-800 font-medium">🇸🇻 Timezone Corregido</div>
                <div className="text-xs text-green-600 mt-1">Horario de El Salvador (UTC-6)</div>
              </div>
              
              {error && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
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