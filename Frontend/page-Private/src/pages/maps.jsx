// 📁 Frontend/src/components/RiveraTransportMapDemo.jsx
// VERSIÓN ACTUALIZADA CON DATOS COMPLETOS DE COTIZACIÓN

import React, { useState, useEffect, useRef } from 'react';
import { Truck, TrendingUp, Plus, Minus, Clock, MapPin, Users, Calendar, RefreshCw, Monitor, BarChart3, FileText, DollarSign, Route, Package } from 'lucide-react';

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

  // 🕐 FUNCIÓN PARA FORMATEAR FECHAS Y HORAS
  const formatBackendTime = (timeInput, format = 'time') => {
    if (!timeInput) return 'No programado';
    
    try {
      let date;
      
      if (typeof timeInput === 'string') {
        if (timeInput === 'Invalid Date' || timeInput === '') {
          return 'Hora no válida';
        }
        
        if (/^\d{1,2}:\d{2}$/.test(timeInput)) {
          const today = new Date();
          const [hours, minutes] = timeInput.split(':').map(Number);
          date = new Date();
          date.setHours(hours, minutes, 0, 0);
          
          const now = new Date();
          if (date < now) {
            date.setDate(date.getDate() + 1);
          }
        } else if (timeInput.includes('T') && timeInput.includes('Z')) {
          date = new Date(timeInput);
        } else {
          date = new Date(timeInput);
        }
      } else if (timeInput instanceof Date) {
        date = timeInput;
      } else {
        date = new Date(timeInput);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Fecha inválida recibida:', timeInput);
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
      } else if (format === 'date') {
        return date.toLocaleDateString('es-SV', {
          timeZone: 'America/El_Salvador',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
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

  // 🆕 FUNCIÓN PARA FORMATEAR TIPO DE CAMIÓN
  const formatTruckType = (truckType) => {
    if (!truckType) return 'Tipo no especificado';
    
    const truckTypeMap = {
      'liviano': '🚐 Liviano',
      'mediano': '🚚 Mediano', 
      'pesado': '🚛 Pesado',
      'extra_pesado': '🚜 Extra Pesado',
      'trailer': '🚚 Tráiler',
      'container': '📦 Container',
      'refrigerado': '❄️ Refrigerado',
      'tanque': '🛢️ Tanque'
    };
    
    return truckTypeMap[truckType] || `🚛 ${truckType}`;
  };

  // 🆕 FUNCIÓN PARA FORMATEAR ESTADO DE COTIZACIÓN
  const formatQuotationStatus = (status) => {
    if (!status) return 'Estado no definido';
    
    const statusMap = {
      'pendiente': '🟡 Pendiente',
      'aprobada': '🟢 Aprobada',
      'rechazada': '🔴 Rechazada',
      'en_revision': '🟠 En Revisión',
      'expirada': '⚫ Expirada',
      'activa': '🔵 Activa'
    };
    
    return statusMap[status] || `❓ ${status}`;
  };

  // 🆕 FUNCIÓN PARA RENDERIZAR INFORMACIÓN COMPLETA DE COTIZACIÓN
  const renderQuotationInfo = (quotation, tripId) => {
    if (!quotation) {
      return (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-center text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Sin cotización asociada</div>
          </div>
        </div>
      );
    }

    console.log('🧾 Renderizando cotización:', quotation);

    return (
      <div className="space-y-4">
        {/* Header de cotización */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-blue-900">
                {quotation.quoteName || 'Cotización sin nombre'}
              </div>
              <div className="text-xs text-blue-600">
                ID: {quotation._id?.slice(-8) || 'N/A'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium">
                {formatQuotationStatus(quotation.status)}
              </div>
            </div>
          </div>
          
          {/* Descripción de cotización */}
          {quotation.quoteDescription && (
            <div className="bg-white rounded-lg p-3 mt-2">
              <div className="text-xs font-medium text-gray-700 mb-1">📝 Descripción:</div>
              <div className="text-xs text-gray-600">{quotation.quoteDescription}</div>
            </div>
          )}
        </div>

        {/* Información del cliente */}
        {quotation.clientId && (
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-green-900">Cliente</div>
                <div className="text-xs text-green-600">
                  {typeof quotation.clientId === 'object' ? 
                    (quotation.clientId.nombre || quotation.clientId.name || quotation.clientId._id) : 
                    quotation.clientId}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tipo de camión */}
        {quotation.truckType && (
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-purple-900">Tipo de Vehículo</div>
                <div className="text-xs text-purple-600">
                  {Array.isArray(quotation.truckType) ? 
                    quotation.truckType.map(type => formatTruckType(type)).join(', ') :
                    formatTruckType(quotation.truckType)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fecha de entrega */}
        {quotation.deliveryDate && (
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-orange-900">Fecha de Entrega</div>
                <div className="text-xs text-orange-600">
                  {formatBackendTime(quotation.deliveryDate, 'datetime')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información de ruta detallada */}
        {quotation.ruta && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
              <Route className="w-4 h-4" />
              <span>Detalles de Ruta</span>
            </div>
            
            {/* Origen */}
            {quotation.ruta.origen && (
              <div className="bg-white rounded-lg p-3 mb-2">
                <div className="text-xs font-medium text-gray-700 mb-2">📍 Origen:</div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">
                    {quotation.ruta.origen.nombre}
                  </div>
                  <div className="text-xs text-gray-600">
                    Tipo: {quotation.ruta.origen.tipo || 'No especificado'}
                  </div>
                  {quotation.ruta.origen.coordenadas && (
                    <div className="text-xs text-gray-500">
                      📌 {quotation.ruta.origen.coordenadas.lat}, {quotation.ruta.origen.coordenadas.lng}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Destino */}
            {quotation.ruta.destino && (
              <div className="bg-white rounded-lg p-3 mb-2">
                <div className="text-xs font-medium text-gray-700 mb-2">🎯 Destino:</div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">
                    {quotation.ruta.destino.nombre}
                  </div>
                  <div className="text-xs text-gray-600">
                    Tipo: {quotation.ruta.destino.tipo || 'No especificado'}
                  </div>
                  {quotation.ruta.destino.coordenadas && (
                    <div className="text-xs text-gray-500">
                      📌 {quotation.ruta.destino.coordenadas.lat}, {quotation.ruta.destino.coordenadas.lng}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Distancia y tiempo */}
            <div className="bg-white rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3">
                {quotation.ruta.distanciaTotal && (
                  <div>
                    <div className="text-xs text-gray-600">Distancia Total:</div>
                    <div className="text-sm font-medium text-gray-900">
                      {quotation.ruta.distanciaTotal} km
                    </div>
                  </div>
                )}
                {quotation.ruta.tiempoEstimado && (
                  <div>
                    <div className="text-xs text-gray-600">Tiempo Estimado:</div>
                    <div className="text-sm font-medium text-gray-900">
                      {quotation.ruta.tiempoEstimado} hrs
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Horarios detallados */}
        {quotation.horarios && (
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="text-sm font-bold text-indigo-900 mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Horarios Programados</span>
            </div>
            
            <div className="space-y-3">
              {/* Fechas principales */}
              <div className="bg-white rounded-lg p-3">
                <div className="grid grid-cols-1 gap-2">
                  {quotation.horarios.fechaSalida && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Fecha de Salida:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {formatBackendTime(quotation.horarios.fechaSalida, 'datetime')}
                      </span>
                    </div>
                  )}
                  {quotation.horarios.fechaLlegadaEstimada && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Llegada Estimada:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {formatBackendTime(quotation.horarios.fechaLlegadaEstimada, 'datetime')}
                      </span>
                    </div>
                  )}
                  {quotation.horarios.tiempoEstimadoViaje && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Tiempo de Viaje:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {quotation.horarios.tiempoEstimadoViaje} hrs
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Flexibilidad horaria */}
              {quotation.horarios.flexibilidadHoraria && (
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-700 mb-2">⏰ Flexibilidad:</div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Permitida:</span>
                      <span className={`text-xs font-medium ${
                        quotation.horarios.flexibilidadHoraria.permitida ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {quotation.horarios.flexibilidadHoraria.permitida ? '✅ Sí' : '❌ No'}
                      </span>
                    </div>
                    {quotation.horarios.flexibilidadHoraria.rangoTolerancia && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Tolerancia:</span>
                        <span className="text-xs font-medium text-gray-900">
                          ±{quotation.horarios.flexibilidadHoraria.rangoTolerancia} hrs
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Horario preferido */}
              {quotation.horarios.horarioPreferido && (
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-700 mb-2">🕐 Horario Preferido:</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Ventana:</span>
                    <span className="text-xs font-medium text-gray-900">
                      {quotation.horarios.horarioPreferido.inicio || 'N/A'} - {quotation.horarios.horarioPreferido.fin || 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Costos (si están disponibles) */}
        {quotation.costos && (
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-sm font-bold text-green-900 mb-3 flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Información de Costos</span>
            </div>
            
            <div className="bg-white rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {quotation.costos.combustible && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Combustible:</span>
                    <span className="font-medium">${quotation.costos.combustible}</span>
                  </div>
                )}
                {quotation.costos.peajes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peajes:</span>
                    <span className="font-medium">${quotation.costos.peajes}</span>
                  </div>
                )}
                {quotation.costos.otros && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Otros:</span>
                    <span className="font-medium">${quotation.costos.otros}</span>
                  </div>
                )}
                {quotation.costos.total && (
                  <div className="flex justify-between font-bold col-span-2 pt-2 border-t border-gray-200">
                    <span className="text-green-800">Total:</span>
                    <span className="text-green-800">${quotation.costos.total}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Carga (si está disponible) */}
        {quotation.carga && (
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="text-sm font-bold text-yellow-900 mb-3 flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Información de Carga</span>
            </div>
            
            <div className="bg-white rounded-lg p-3">
              {quotation.carga.descripcion && (
                <div className="mb-2">
                  <div className="text-xs text-gray-600">Descripción:</div>
                  <div className="text-sm font-medium text-gray-900">{quotation.carga.descripcion}</div>
                </div>
              )}
              {quotation.carga.peso && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Peso:</span>
                  <span className="text-xs font-medium text-gray-900">
                    {quotation.carga.peso.valor} {quotation.carga.peso.unidad || 'kg'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 🔄 FUNCIÓN PARA OBTENER DATOS DEL BACKEND (mantener la misma lógica)
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
        console.log('📊 Datos del backend con cotizaciones:', result.data);
        
        setMapData(result.data);
        setLastUpdate(new Date());
        
        // 🔍 Debug específico para cotizaciones
        if (result.data.routes && result.data.routes.length > 0) {
          console.log('🧾 Cotizaciones encontradas:');
          result.data.routes.forEach((route, index) => {
            if (route.quotation) {
              console.log(`Ruta ${index + 1} - Cotización:`, {
                id: route.quotation._id,
                quoteName: route.quotation.quoteName,
                clientId: route.quotation.clientId,
                status: route.quotation.status,
                hasRuta: !!route.quotation.ruta,
                hasHorarios: !!route.quotation.horarios
              });
            } else {
              console.log(`Ruta ${index + 1} - Sin cotización`);
            }
          });
        }
        
      } else {
        throw new Error(result.message || 'Error al cargar datos del mapa');
      }

    } catch (error) {
      console.error('❌ Error al obtener datos del mapa:', error);
      setError(`API no disponible: ${error.message}`);
      
      // Datos mock para desarrollo
      if (!mapData) {
        console.log('📝 Cargando datos mock de demostración...');
        setMapData({
          locations: [
            {
              name: "Terminal Rivera - Santa Ana",
              coords: [13.9942, -89.5592],
              type: "red",
              number: "HQ",
              description: "Terminal principal",
              tripCount: 0,
              isTerminal: true
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
                progress: 65
              },
              // 🆕 Cotización de ejemplo
              quotation: {
                _id: "quote123",
                quoteName: "Transporte San Miguel",
                quoteDescription: "Transporte de materiales de construcción",
                clientId: "Cliente ABC Corp",
                truckType: ["pesado"],
                deliveryDate: new Date(),
                status: "aprobada",
                ruta: {
                  origen: {
                    nombre: "Santa Ana",
                    coordenadas: { lat: 13.9942, lng: -89.5592 },
                    tipo: "terminal"
                  },
                  destino: {
                    nombre: "San Miguel",
                    coordenadas: { lat: 13.4833, lng: -88.1833 },
                    tipo: "ciudad"
                  },
                  distanciaTotal: 120,
                  tiempoEstimado: 3
                },
                horarios: {
                  fechaSalida: new Date(),
                  fechaLlegadaEstimada: new Date(Date.now() + 3 * 60 * 60 * 1000),
                  tiempoEstimadoViaje: 3,
                  flexibilidadHoraria: {
                    permitida: true,
                    rangoTolerancia: 2
                  },
                  horarioPreferido: {
                    inicio: "08:00",
                    fin: "17:00"
                  }
                }
              }
            }
          ],
          cities: [{ name: "San Salvador", coords: [13.6929, -89.2182] }],
          statistics: {
            total_routes: 1,
            active_routes: 1,
            completed_routes: 0,
            pending_routes: 0,
            delayed_routes: 0,
            completion_rate: 0,
            today_trips: 1,
            total_drivers: 1,
            total_trucks: 1,
            viajes_con_cotizacion: 1
          }
        });
        setLastUpdate(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔄 CONFIGURAR AUTO-REFRESH
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

  // 🗺️ INICIALIZAR MAPA LEAFLET (mantener la misma lógica)
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

          // Agregar marcadores
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

          // Agregar rutas
          if (mapData.routes && Array.isArray(mapData.routes)) {
            mapData.routes.forEach((route, index) => {
              try {
                if (route.coordinates && Array.isArray(route.coordinates) && route.coordinates.length > 0) {
                  let routeColor = '#3b82f6';
                  
                  const statusColorMap = {
                    'pendiente': '#eab308',
                    'scheduled': '#eab308',
                    'en_curso': '#16a34a',
                    'active': '#16a34a',
                    'in_progress': '#16a34a',
                    'completado': '#3b82f6',
                    'completed': '#3b82f6',
                    'retrasado': '#f97316',
                    'delayed': '#f97316',
                    'cancelado': '#dc2626',
                    'cancelled': '#dc2626'
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
                      hasQuotation: !!route.quotation
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

  // Funciones de control del mapa
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

  const switchToMonitoring = () => {
    setActiveView('monitoring');
    setSelectedTrip(null);
  };

  const switchToMap = () => {
    setActiveView('map');
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="w-full h-screen p-6" style={{ backgroundColor: '#34353A' }}>
        <div className="w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative border-2 border-blue-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del mapa con cotizaciones...</p>
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

  // Vista de monitoreo
  if (activeView === 'monitoring') {
    return (
      <div className="w-full h-screen p-6" style={{ backgroundColor: '#34353A' }}>
        <div className="w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative border-2 border-blue-200">
          <TripMonitoringDashboard onClose={switchToMap} />
        </div>
      </div>
    );
  }

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
          
          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db #f3f4f6;
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
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">Monitoreo con cotizaciones integradas</p>
                {lastUpdate && (
                  <span className="text-xs text-gray-500">
                    • Actualizado: {formatBackendTime(lastUpdate.toISOString(), 'short')}
                  </span>
                )}
              </div>
            </div>
            
            {/* Controles */}
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

          {/* Indicador de estado */}
          <div className="absolute top-8 right-8 z-30">
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-2 ${
              error 
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-green-100 text-green-800 border border-green-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} ${!error ? 'animate-pulse' : ''}`}></div>
              <span>{error ? 'Modo Demo' : 'Cotizaciones Activas'}</span>
            </div>
          </div>

          {/* Mapa */}
          <div 
            ref={mapRef}
            className="w-full h-full rounded-[2rem]"
            style={{ zIndex: 1 }}
          />

          {/* Panel de estadísticas con información de cotizaciones */}
          {mapData && mapData.statistics && (
            <div className="absolute bottom-8 left-8 z-30 bg-white rounded-3xl shadow-2xl p-6 w-80 border-2 border-blue-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1 font-medium">Viajes con Cotización</div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {mapData.statistics.viajes_con_cotizacion || 0}
                    </span>
                    <span className="text-lg text-gray-400">
                      / {mapData.statistics.total_routes || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-semibold">
                      {mapData.statistics.total_routes > 0 ? 
                        Math.round((mapData.statistics.viajes_con_cotizacion / mapData.statistics.total_routes) * 100) : 0}% con cotización
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Estadísticas de cotizaciones */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-500 mr-1" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mapData.statistics.viajes_con_ruta || 0}
                  </div>
                  <div className="text-xs text-gray-500">Con ruta detallada</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-green-500 mr-1" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mapData.statistics.completed_routes || 0}
                  </div>
                  <div className="text-xs text-gray-500">Completados</div>
                </div>
              </div>

              {/* Estado de viajes */}
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

              {/* Botón para dashboard */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={switchToMonitoring}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Ver Dashboard Completo</span>
                </button>
              </div>

              {/* Auto-refresh */}
              {autoRefresh && (
                <div className="mt-3">
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Cotizaciones actualizándose cada 30s</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🆕 PANEL DE INFORMACIÓN COMPLETA CON COTIZACIÓN */}
          {selectedTrip && (
            <div className="absolute top-24 left-8 z-30 bg-white rounded-2xl shadow-xl border-2 border-blue-200 w-96 max-h-[calc(100vh-200px)]">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white rounded-t-2xl sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Información Completa</h3>
                    <div className="text-xs text-gray-500">Viaje + Cotización</div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTrip(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              
              {/* Contenido con scroll */}
              <div className="overflow-y-auto max-h-[calc(100vh-280px)] p-5 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                
                {/* 🧾 INFORMACIÓN DE COTIZACIÓN COMPLETA */}
                {renderQuotationInfo(selectedTrip.quotation, selectedTrip.id)}
                
                {/* 🚛 INFORMACIÓN BÁSICA DEL VIAJE */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <Truck className="w-4 h-4" />
                    <span>Información del Viaje</span>
                  </div>
                  
                  {/* Conductor */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {selectedTrip.tripInfo?.driver || 'No asignado'}
                      </div>
                      <div className="text-xs text-gray-500">Conductor asignado</div>
                      {selectedTrip.tripInfo?.driverPhone && selectedTrip.tripInfo.driverPhone !== 'No disponible' && (
                        <div className="text-xs text-blue-600">{selectedTrip.tripInfo.driverPhone}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Vehículo */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm">🚛</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-600">
                        {selectedTrip.tripInfo?.truck || 'Vehículo por asignar'}
                      </div>
                      <div className="text-xs text-gray-500">Vehículo de transporte</div>
                    </div>
                  </div>
                  
                  {/* Progreso */}
                  {selectedTrip.tripInfo?.progress >= 0 && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Progreso del viaje:</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {selectedTrip.tripInfo.progress}%
                          </span>
                        </div>
                      </div>
                      <RealtimeProgressBar 
                        key={`progress-${selectedTrip.id}-${selectedTrip.tripInfo?.progress || 0}`}
                        viajeId={selectedTrip.id}
                        initialProgress={selectedTrip.tripInfo.progress}
                        status={selectedTrip.status}
                        enablePolling={!error}
                      />
                      <div className="text-xs text-gray-600 mt-2">
                        📍 {selectedTrip.tripInfo.currentLocation}
                      </div>
                    </div>
                  )}
                </div>

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
                
                {/* Separador final */}
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

          {/* Leyenda actualizada */}
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
              
              {/* Información de cotizaciones */}
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="text-xs text-blue-800 font-medium">🧾 Cotizaciones Integradas</div>
                <div className="text-xs text-blue-600 mt-1">
                  {error ? 'Modo demo con cotización ejemplo' : 'Datos reales de cotizaciones'}
                </div>
              </div>
              
              {/* Información del sistema */}
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-800 font-medium">🇸🇻 Sistema Completo</div>
                <div className="text-xs text-green-600 mt-1">Viajes + Cotizaciones + Rutas</div>
              </div>
              
              {error && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-xs text-yellow-800 font-medium">⚠️ Modo Demo</div>
                  <div className="text-xs text-yellow-600 mt-1">Datos de ejemplo con cotización</div>
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