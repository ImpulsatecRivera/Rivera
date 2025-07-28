import React, { useState, useEffect, useRef } from 'react';
import { Truck, TrendingUp, Plus, Minus, Clock, MapPin, Users, Calendar } from 'lucide-react';

const RiveraTransportMapDemo = () => {
  const [zoomLevel, setZoomLevel] = useState(8);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // 🆕 Función para obtener datos del backend
  const fetchMapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🔧 URL de tu backend (puerto 4000)
      const apiUrl = 'http://localhost:4000/api/viajes/map-data';
      
      console.log('Intentando conectar a:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Agregar token de autorización si es necesario
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setMapData(result.data);
        console.log('Datos del mapa cargados:', result.data);
      } else {
        throw new Error(result.message || 'Error al cargar datos del mapa');
      }

    } catch (error) {
      console.error('Error al obtener datos del mapa:', error);
      setError(`API no disponible: ${error.message}`);
      
      // 📋 DATOS MOCK MIENTRAS CONFIGURAS EL BACKEND
      console.log('Cargando datos mock de demostración...');
      setMapData({
        locations: [
          {
            name: "Terminal Rivera - Santa Ana",
            coords: [13.9942, -89.5592],
            type: "red",
            number: "",
            description: "Terminal principal - Base de operaciones",
            tripCount: 0,
            isTerminal: true
          },
          {
            name: "Chalatenango",
            coords: [14.0333, -88.9333],
            type: "green",
            number: "5",
            description: "5 viajes programados hoy",
            tripCount: 5,
            nextTrip: "10:30 AM"
          },
          {
            name: "San Miguel",
            coords: [13.4833, -88.1833],
            type: "green",
            number: "3",
            description: "3 viajes activos",
            tripCount: 3,
            nextTrip: "2:00 PM"
          },
          {
            name: "Usulután",
            coords: [13.3500, -88.4500],
            type: "green",
            number: "2",
            description: "2 viajes programados",
            tripCount: 2,
            nextTrip: "11:15 AM"
          },
          {
            name: "La Libertad",
            coords: [13.4883, -89.3167],
            type: "blue",
            number: "1",
            description: "1 viaje ocasional",
            tripCount: 1,
            nextTrip: "4:00 PM"
          }
        ],
        routes: [
          {
            id: "route1",
            coordinates: [[13.9942, -89.5592], [14.0333, -88.9333]],
            status: "active",
            frequency: "high",
            tripInfo: {
              driver: "Carlos Pérez",
              truck: "Volvo FH16",
              cargo: "Materiales de construcción",
              departure: "08:00 AM",
              arrival: "10:30 AM"
            }
          },
          {
            id: "route2",
            coordinates: [[13.9942, -89.5592], [13.4833, -88.1833]],
            status: "in_progress",
            frequency: "medium",
            tripInfo: {
              driver: "Ana García",
              truck: "Mercedes Actros",
              cargo: "Productos agrícolas",
              departure: "06:30 AM",
              arrival: "2:00 PM"
            }
          },
          {
            id: "route3",
            coordinates: [[13.9942, -89.5592], [13.3500, -88.4500]],
            status: "scheduled",
            frequency: "medium",
            tripInfo: {
              driver: "Roberto López",
              truck: "Scania R450",
              cargo: "Electrodomésticos",
              departure: "09:00 AM",
              arrival: "11:15 AM"
            }
          }
        ],
        cities: [
          { name: "San Salvador", coords: [13.6929, -89.2182] },
          { name: "Soyapango", coords: [13.7167, -89.1389] },
          { name: "Mejicanos", coords: [13.7408, -89.2075] }
        ],
        statistics: {
          total_routes: 16,
          active_routes: 11,
          growth_percentage: 35,
          monthly_trips: 147,
          drivers_active: 8
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMapData();
    
    // Opcional: Actualizar datos cada 30 segundos solo si la API funciona
    // const interval = setInterval(fetchMapData, 30000);
    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else if (window.L) {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (mapRef.current && window.L && !mapInstanceRef.current && !loading && mapData) {
        // Limpiar mapa existente si existe
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

        // 🆕 Agregar marcadores desde datos reales
        if (mapData.locations && mapData.locations.length > 0) {
          mapData.locations.forEach(location => {
            const markerClass = `marker-${location.type}`;
            
            const customIcon = window.L.divIcon({
              className: 'custom-marker-container',
              html: `<div class="custom-marker ${markerClass}">${location.number}</div>`,
              iconSize: [35, 35],
              iconAnchor: [17.5, 17.5],
              popupAnchor: [0, -17.5]
            });

            const marker = window.L.marker(location.coords, { icon: customIcon }).addTo(map);
            
            const popupContent = location.isTerminal ? 
              `<div style="font-family: 'Segoe UI', sans-serif; min-width: 200px;">
                <div style="font-weight: 600; color: #dc2626; margin-bottom: 8px; font-size: 14px;">🏢 ${location.name}</div>
                <div style="color: #666; font-size: 12px; margin-bottom: 6px;">${location.description}</div>
                <div style="background: #fef2f2; padding: 6px; border-radius: 6px; border-left: 3px solid #dc2626;">
                  <div style="font-size: 11px; color: #991b1b;">Centro de operaciones principal</div>
                </div>
              </div>` :
              `<div style="font-family: 'Segoe UI', sans-serif; min-width: 200px;">
                <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">📍 ${location.name}</div>
                <div style="color: #666; font-size: 12px; margin-bottom: 8px;">${location.description}</div>
                <div style="background: #f0fdf4; padding: 6px; border-radius: 6px; border-left: 3px solid #16a34a;">
                  ${location.nextTrip ? `<div style="font-size: 11px; color: #15803d; margin-bottom: 2px;">⏰ Próximo viaje: ${location.nextTrip}</div>` : ''}
                  <div style="font-size: 11px; color: #15803d;">🚛 ${location.tripCount} viajes programados</div>
                </div>
              </div>`;

            marker.bindPopup(popupContent, {
              closeButton: true,
              autoClose: false,
              className: 'custom-popup'
            });
          });
        }

        // 🆕 Agregar rutas desde datos reales
        if (mapData.routes && mapData.routes.length > 0) {
          mapData.routes.forEach(route => {
            if (route.coordinates && route.coordinates.length > 0) {
              let routeColor = '#2563eb'; // Por defecto azul
              switch (route.status) {
                case 'active':
                case 'in_progress':
                  routeColor = '#16a34a'; // Verde
                  break;
                case 'completed':
                  routeColor = '#059669'; // Verde oscuro
                  break;
                case 'cancelled':
                  routeColor = '#dc2626'; // Rojo
                  break;
                default:
                  routeColor = '#2563eb'; // Azul
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
          });
        }

        // Agregar ciudades de referencia
        if (mapData.cities && mapData.cities.length > 0) {
          mapData.cities.forEach(city => {
            window.L.circleMarker(city.coords, {
              radius: 4,
              fillColor: '#64748b',
              color: 'white',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(map).bindTooltip(city.name, {
              permanent: false,
              direction: 'top'
            });
          });
        }

        mapInstanceRef.current = map;
      }
    };

    if (!loading && mapData) {
      loadLeaflet();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, mapData, zoomLevel]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
      setZoomLevel(prev => prev + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
      setZoomLevel(prev => prev - 1);
    }
  };

<<<<<<< HEAD:Frontend/page-Private/src/pages/mapa.jsx
  const handleRefresh = () => {
    fetchMapData();
  };
  
  // Mostrar loading
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

  // Mostrar error
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
=======
  
>>>>>>> master:Frontend/page-Private/src/pages/maps.jsx

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
          
          {/* Header */}
          <div className="absolute top-8 left-8 z-30 flex items-center space-x-4">
            <div 
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border-2 border-blue-200 shadow-lg cursor-pointer hover:bg-blue-50 transition-all duration-200"
              onClick={() => window.history.back()}
            >
              <span className="text-lg text-blue-600 font-bold">←</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema Rivera Transport</h1>
              <p className="text-sm text-gray-600">Monitoreo de rutas en tiempo real</p>
            </div>
            
            {/* 🆕 Botón de actualizar */}
            <button
              onClick={handleRefresh}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border-2 border-blue-200 shadow-lg cursor-pointer hover:bg-blue-50 transition-all duration-200"
              title="Actualizar datos"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
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
                  <div className="text-sm text-gray-500 mb-1 font-medium">Rutas Activas</div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">{mapData.statistics.active_routes}</span>
                    <span className="text-lg text-gray-400">/ {mapData.statistics.total_routes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-semibold">{mapData.statistics.growth_percentage}% este mes</span>
                  </div>
                </div>
              </div>
              
              {/* Estadísticas adicionales */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-500 mr-1" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{mapData.statistics.monthly_trips}</div>
                  <div className="text-xs text-gray-500">Viajes este mes</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-green-500 mr-1" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{mapData.statistics.drivers_active}</div>
                  <div className="text-xs text-gray-500">Conductores activos</div>
                </div>
              </div>
            </div>
          )}

          {/* Panel de información de viaje seleccionado */}
          {selectedTrip && (
            <div className="absolute top-24 left-8 z-30 bg-white rounded-2xl shadow-xl p-5 w-72 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Información del Viaje</h3>
                <button 
                  onClick={() => setSelectedTrip(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{selectedTrip.tripInfo.driver}</div>
                    <div className="text-xs text-gray-500">Conductor</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{selectedTrip.tripInfo.truck}</div>
                    <div className="text-xs text-gray-500">Vehículo</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{selectedTrip.tripInfo.cargo}</div>
                    <div className="text-xs text-gray-500">Carga</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Salida:</span>
                    <span className="font-medium">{selectedTrip.tripInfo.departure}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Llegada estimada:</span>
                    <span className="font-medium">{selectedTrip.tripInfo.arrival}</span>
                  </div>
                </div>
                
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  selectedTrip.status === 'active' || selectedTrip.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                  selectedTrip.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  selectedTrip.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedTrip.status === 'active' || selectedTrip.status === 'in_progress' ? 'En progreso' :
                   selectedTrip.status === 'completed' ? 'Completado' :
                   selectedTrip.status === 'cancelled' ? 'Cancelado' :
                   'Programado'}
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