// hooks/Travels/useTravels.js - VERSIÓN FINAL OPTIMIZADA PARA TU CONFIGURACIÓN
import { useState, useEffect, useCallback } from 'react';

// 🌐 CONFIGURACIÓN EXACTA PARA TU BACKEND RENDER + VERCEL
const API_CONFIG = {
  BASE_URL: 'https://riveraproject-5.onrender.com',
  ENDPOINTS: {
    MAP_DATA: '/api/viajes/map-data',
    VIAJES: '/api/viajes',
    HEALTH: '/api/viajes/health'
  },
  TIMEOUT: 12000, // 12 segundos para Render
  MAX_RETRIES: 2,
  RETRY_DELAY: 3000 // 3 segundos entre reintentos
};

// 🛠️ FUNCIÓN PARA CONSTRUIR URLs CON CACHE BUSTING
const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
  
  // Cache busting automático
  url.searchParams.set('t', Date.now().toString());
  
  // Agregar parámetros adicionales
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return url.toString();
};

// 🔄 FUNCIÓN DE FETCH ESPECÍFICA PARA TU CONFIGURACIÓN
const performFetch = async (endpoint, options = {}) => {
  const startTime = Date.now();
  let lastError = null;
  
  console.log(`🌐 [performFetch] Iniciando fetch a: ${endpoint}`);
  
  // 🎯 ESTRATEGIA PRINCIPAL: FETCH CON TU CONFIGURACIÓN CORS
  for (let attempt = 1; attempt <= API_CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 [performFetch] Intento ${attempt}/${API_CONFIG.MAX_RETRIES}`);
      
      const url = buildUrl(endpoint);
      console.log(`📡 [performFetch] URL completa: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ [performFetch] Timeout después de ${API_CONFIG.TIMEOUT}ms`);
        controller.abort();
      }, API_CONFIG.TIMEOUT);
      
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        mode: 'cors',
        credentials: 'include', // Para cookies si las necesitas
        signal: controller.signal,
        ...options
      };
      
      console.log(`📤 [performFetch] Enviando request con headers:`, fetchOptions.headers);
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      console.log(`📨 [performFetch] Respuesta recibida: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      console.log(`✅ [performFetch] Éxito en ${duration}ms`);
      console.log(`📊 [performFetch] Datos recibidos:`, {
        success: data.success,
        dataType: typeof data.data,
        routesCount: data.data?.routes?.length || 0
      });
      
      return data;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [performFetch] Intento ${attempt} falló después de ${duration}ms:`, {
        name: error.name,
        message: error.message,
        cause: error.cause || 'No cause'
      });
      
      lastError = error;
      
      // Si no es el último intento, esperar antes del siguiente
      if (attempt < API_CONFIG.MAX_RETRIES) {
        console.log(`⏳ [performFetch] Esperando ${API_CONFIG.RETRY_DELAY}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      }
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  const totalDuration = Date.now() - startTime;
  console.error(`💥 [performFetch] Todos los intentos fallaron después de ${totalDuration}ms`);
  throw lastError || new Error('Fetch failed after all retries');
};

// 🎯 DATOS MOCK PARA FALLBACK (USANDO TUS DATOS REALES COMO BASE)
const getMockData = () => {
  console.log('📋 [getMockData] Generando datos mock basados en tu estructura real');
  
  return {
    success: true,
    data: {
      locations: [
        {
          name: "Terminal Principal Rivera",
          coords: [13.8833, -89.1],
          type: "red",
          number: "HQ",
          description: "Centro de operaciones principal",
          tripCount: 0,
          isTerminal: true,
          details: "Base principal de Rivera Transport"
        },
        {
          name: "Bodega Central TechStore, San Salvador",
          coords: [13.6929, -89.2182],
          type: "green",
          number: "3",
          description: "3 viajes programados",
          tripCount: 3,
          isTerminal: false,
          details: "bodega en San Salvador"
        },
        {
          name: "Mall Plaza La Libertad, La Libertad",
          coords: [13.4883, -89.3222],
          type: "green",
          number: "3",
          description: "3 viajes programados", 
          tripCount: 3,
          isTerminal: false,
          details: "cliente en La Libertad"
        }
      ],
      routes: [
        {
          id: "demo_1",
          coordinates: [[13.6929, -89.2182], [13.4883, -89.3222]],
          status: "in_progress",
          statusText: "En tránsito",
          frequency: "high",
          distance: "45.8 km",
          estimatedTime: "1h 30min",
          tripInfo: {
            driver: "Carlos Demo",
            driverPhone: "1234-5678",
            truck: "Demo Toyota (ABC-123)",
            cargo: "Productos electrónicos de demostración - 850 kg",
            departure: "12:00",
            arrival: "14:30",
            estimatedArrival: "14:30",
            progress: 75,
            currentLocation: "75% completado",
            realDeparture: "12:05",
            realArrival: null
          },
          description: "Transporte de equipos electrónicos - MODO DEMOSTRACIÓN",
          route: {
            from: "Bodega Central TechStore, San Salvador",
            to: "Mall Plaza La Libertad, La Libertad",
            fromType: "bodega",
            toType: "cliente",
            totalPoints: 2,
            currentPoint: 1
          },
          alerts: [],
          costs: {
            fuel: 85,
            tolls: 12.5,
            driver: 120,
            others: 25,
            total: 242.5
          },
          conditions: {
            weather: "normal",
            traffic: "normal",
            road: "buena"
          },
          quotation: {
            _id: "demo_quote_1",
            quoteName: "Demo Electrónicos",
            ruta: {
              origen: {
                nombre: "Bodega Central TechStore, San Salvador",
                coordenadas: { lat: 13.6929, lng: -89.2182 },
                tipo: "bodega"
              },
              destino: {
                nombre: "Mall Plaza La Libertad, La Libertad", 
                coordenadas: { lat: 13.4883, lng: -89.3222 },
                tipo: "cliente"
              }
            }
          },
          integration: {
            hasCotizacion: true,
            hasRuta: true,
            hasHorarios: true,
            hasCliente: false,
            hasCarga: true,
            autoUpdateEnabled: true,
            progressMethod: "time_based"
          }
        },
        {
          id: "demo_2", 
          coordinates: [[13.6929, -89.2182], [13.4883, -89.3222]],
          status: "completed",
          statusText: "Completado",
          frequency: "medium",
          distance: "45.8 km",
          estimatedTime: "1h 30min",
          tripInfo: {
            driver: "María Demo",
            driverPhone: "1234-5679",
            truck: "Demo Mercedes (XYZ-456)",
            cargo: "Productos completados - 800 kg",
            departure: "08:00",
            arrival: "09:30",
            estimatedArrival: "09:30",
            progress: 100,
            currentLocation: "Mall Plaza La Libertad, La Libertad",
            realDeparture: "08:00",
            realArrival: "09:25"
          },
          description: "Viaje completado exitosamente - MODO DEMOSTRACIÓN",
          route: {
            from: "Bodega Central TechStore, San Salvador",
            to: "Mall Plaza La Libertad, La Libertad",
            fromType: "bodega", 
            toType: "cliente",
            totalPoints: 2,
            currentPoint: 2
          },
          alerts: [],
          costs: {
            fuel: 85,
            tolls: 12.5,
            driver: 120,
            others: 25,
            total: 242.5
          },
          conditions: {
            weather: "normal",
            traffic: "ligero",
            road: "buena"
          },
          quotation: {
            _id: "demo_quote_2",
            quoteName: "Demo Completado",
            ruta: {
              origen: {
                nombre: "Bodega Central TechStore, San Salvador",
                coordenadas: { lat: 13.6929, lng: -89.2182 },
                tipo: "bodega"
              },
              destino: {
                nombre: "Mall Plaza La Libertad, La Libertad",
                coordenadas: { lat: 13.4883, lng: -89.3222 },
                tipo: "cliente"
              }
            }
          },
          integration: {
            hasCotizacion: true,
            hasRuta: true,
            hasHorarios: true,
            hasCliente: false,
            hasCarga: true,
            autoUpdateEnabled: false,
            progressMethod: "gps"
          }
        },
        {
          id: "demo_3",
          coordinates: [[13.6929, -89.2182], [13.4883, -89.3222]], 
          status: "scheduled",
          statusText: "Programado",
          frequency: "medium",
          distance: "45.8 km",
          estimatedTime: "1h 30min",
          tripInfo: {
            driver: "Juan Demo",
            driverPhone: "1234-5680",
            truck: "Demo Kenworth (DEF-789)",
            cargo: "Productos programados - 900 kg",
            departure: "16:00",
            arrival: "17:30",
            estimatedArrival: "17:30",
            progress: 0,
            currentLocation: "Bodega Central TechStore, San Salvador",
            realDeparture: null,
            realArrival: null
          },
          description: "Viaje programado para hoy - MODO DEMOSTRACIÓN",
          route: {
            from: "Bodega Central TechStore, San Salvador",
            to: "Mall Plaza La Libertad, La Libertad",
            fromType: "bodega",
            toType: "cliente", 
            totalPoints: 2,
            currentPoint: 0
          },
          alerts: [],
          costs: {
            fuel: 85,
            tolls: 12.5,
            driver: 120,
            others: 25,
            total: 242.5
          },
          conditions: {
            weather: "normal",
            traffic: "normal",
            road: "buena"
          },
          quotation: {
            _id: "demo_quote_3",
            quoteName: "Demo Programado",
            ruta: {
              origen: {
                nombre: "Bodega Central TechStore, San Salvador",
                coordenadas: { lat: 13.6929, lng: -89.2182 },
                tipo: "bodega"
              },
              destino: {
                nombre: "Mall Plaza La Libertad, La Libertad",
                coordenadas: { lat: 13.4883, lng: -89.3222 },
                tipo: "cliente"
              }
            }
          },
          integration: {
            hasCotizacion: true,
            hasRuta: true,
            hasHorarios: true,
            hasCliente: false,
            hasCarga: true,
            autoUpdateEnabled: true,
            progressMethod: "time_based"
          }
        }
      ],
      cities: [
        { name: "San Salvador", coords: [13.6929, -89.2182] },
        { name: "Santa Ana", coords: [13.9942, -89.5592] },
        { name: "San Miguel", coords: [13.4833, -88.1833] },
        { name: "La Libertad", coords: [13.4883, -89.3222] }
      ],
      statistics: {
        total_routes: 3,
        active_routes: 1,
        completed_routes: 1,
        pending_routes: 1,
        delayed_routes: 0,
        cancelled_routes: 0,
        completion_rate: 33,
        on_time_rate: 100,
        average_progress: 58,
        total_drivers: 3,
        total_trucks: 3,
        today_trips: 3,
        active_alerts: 0,
        total_revenue: 727.5,
        growth_percentage: 25
      },
      lastUpdate: new Date().toISOString(),
      autoUpdateEnabled: true,
      refreshInterval: 180000,
      dataSource: "mock_demo_mode"
    },
    message: "Datos de demostración - Sistema funcionando sin conexión al servidor"
  };
};

// 🔧 FUNCIONES AUXILIARES PARA MAPEO DE ESTADOS
const mapStatusToDbStatus = (status) => {
  const statusMap = {
    'scheduled': 'pendiente',
    'in_progress': 'en_curso',
    'completed': 'completado',
    'cancelled': 'cancelado',
    'delayed': 'retrasado'
  };
  return statusMap[status] || 'pendiente';
};

const getIconByStatus = (status) => {
  const iconMap = {
    'scheduled': '📋',
    'in_progress': '🚛',
    'completed': '✅',
    'cancelled': '❌',
    'delayed': '⏰'
  };
  return iconMap[status] || '📋';
};

const getColorByStatus = (status) => {
  const colorMap = {
    'scheduled': 'bg-gray-500',
    'in_progress': 'bg-blue-500',
    'completed': 'bg-green-500',
    'cancelled': 'bg-red-500',
    'delayed': 'bg-yellow-500'
  };
  return colorMap[status] || 'bg-gray-500';
};

const getStatusColorByStatus = (status) => {
  const statusColorMap = {
    'scheduled': 'bg-gray-400',
    'in_progress': 'bg-blue-400',
    'completed': 'bg-green-400',
    'cancelled': 'bg-red-400',
    'delayed': 'bg-yellow-400'
  };
  return statusColorMap[status] || 'bg-gray-400';
};

const getTextColorByStatus = (status) => {
  const textColorMap = {
    'scheduled': 'text-gray-600',
    'in_progress': 'text-blue-600',
    'completed': 'text-green-600',
    'cancelled': 'text-red-600',
    'delayed': 'text-yellow-600'
  };
  return textColorMap[status] || 'text-gray-600';
};

const getPriorityValue = (priority) => {
  const priorityMap = {
    'baja': 1,
    'media': 2,
    'alta': 3,
    'critica': 4
  };
  return priorityMap[priority] || 1;
};

export const useTravels = () => {
  console.log("🚀 [useTravels] Hook final optimizado inicializado");

  // ⚠️ MANTENER TODOS LOS ESTADOS ORIGINALES EN EL MISMO ORDEN
  const barHeights = [60, 80, 45, 90, 120, 70, 50, 85, 95, 110, 140, 75, 65, 100];
  const progressValues = [85, 70, 55, 40, 30];
  const [animatedBars, setAnimatedBars] = useState(Array(14).fill(0));
  const [animatedProgress, setAnimatedProgress] = useState(Array(5).fill(0));

  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditClosing, setIsEditClosing] = useState(false);
  const [showConfirmEditModal, setShowConfirmEditModal] = useState(false);
  const [isConfirmEditClosing, setIsConfirmEditClosing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSuccessClosing, setIsSuccessClosing] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleteClosing, setIsDeleteClosing] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [isDeleteSuccessClosing, setIsDeleteSuccessClosing] = useState(false);
  
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [isProgramClosing, setIsProgramClosing] = useState(false);
  const [showProgramSuccessModal, setShowProgramSuccessModal] = useState(false);
  const [isProgramSuccessClosing, setIsProgramSuccessClosing] = useState(false);

  const [editForm, setEditForm] = useState({
    quoteId: '',
    truckId: '',
    conductorId: '',
    auxiliarId: '',
    tripDescription: '',
    departureTime: '',
    arrivalTime: '',
    condiciones: {
      clima: 'normal',
      trafico: 'normal',
      carretera: 'buena'
    },
    observaciones: ''
  });
  
  const [programForm, setProgramForm] = useState({
    quoteId: '',
    truckId: '',
    conductorId: '',
    auxiliarId: '',
    tripDescription: '',
    departureTime: '',
    arrivalTime: '',
    condiciones: {
      clima: 'normal',
      trafico: 'normal',
      carretera: 'buena'
    },
    observaciones: ''
  });

  // 🆕 ESTADOS PARA API CON INDICADORES DE CONEXIÓN
  const [apiTravels, setApiTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'online', 'offline', 'demo'
  const [lastFetchSuccess, setLastFetchSuccess] = useState(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);

  // ⚠️ useEffect ORIGINAL PARA ANIMACIONES
  useEffect(() => {
    console.log("🎨 [useTravels] Iniciando animaciones de gráficos");
    
    const animateBars = () => {
      barHeights.forEach((height, index) => {
        setTimeout(() => {
          setAnimatedBars(prev => {
            const newBars = [...prev];
            newBars[index] = height;
            return newBars;
          });
        }, index * 100);
      });
    };

    const animateProgress = () => {
      progressValues.forEach((progress, index) => {
        setTimeout(() => {
          setAnimatedProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = progress;
            return newProgress;
          });
        }, index * 200 + 1000);
      });
    };

    animateBars();
    animateProgress();
  }, []);

  // 🔧 FUNCIÓN PRINCIPAL DE FETCH OPTIMIZADA
  const fetchTravels = useCallback(async (isManualRefresh = false) => {
    const startTime = Date.now();
    console.log(`📊 [fetchTravels] Iniciando - Manual: ${isManualRefresh}, Intento: ${fetchAttempts + 1}`);

    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
        console.log("🔄 [fetchTravels] Refresh manual iniciado");
      } else {
        setLoading(true);
        console.log("⏳ [fetchTravels] Carga inicial iniciada");
      }
      
      setError(null);
      setFetchAttempts(prev => prev + 1);

      // 🎯 INTENTAR CONEXIÓN CON EL SERVIDOR REAL
      console.log('🌐 [fetchTravels] Conectando con Render...');
      setConnectionStatus('connecting');
      
      const data = await performFetch(API_CONFIG.ENDPOINTS.MAP_DATA);
      
      console.log(`✅ [fetchTravels] Conexión exitosa en ${Date.now() - startTime}ms`);
      
      if (data?.success && data?.data) {
        const mapData = data.data;
        console.log(`📦 [fetchTravels] Procesando datos reales: ${mapData.routes?.length || 0} rutas`);

        const viajesExtraidos = processRoutes(mapData.routes || []);
        
        setApiTravels(viajesExtraidos);
        setConnectionStatus('online');
        setLastFetchSuccess(new Date());
        
        console.log(`✅ [fetchTravels] ${viajesExtraidos.length} viajes reales cargados exitosamente`);
        return { success: true, source: 'server', count: viajesExtraidos.length };
        
      } else {
        throw new Error('Respuesta del servidor sin datos válidos');
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.warn(`⚠️ [fetchTravels] Error de servidor después de ${duration}ms:`, error.message);
      
      // 🎯 ACTIVAR MODO DEMOSTRACIÓN
      console.log('🔄 [fetchTravels] Activando modo demostración con datos realistas');
      
      const mockData = getMockData();
      const viajesExtraidos = processRoutes(mockData.data.routes);
      
      setApiTravels(viajesExtraidos);
      setConnectionStatus('demo');
      setError(`Modo demostración activo: ${error.message}`);
      
      console.log(`📋 [fetchTravels] ${viajesExtraidos.length} viajes demo cargados`);
      return { success: false, source: 'demo', count: viajesExtraidos.length, error: error.message };
      
    } finally {
      const totalDuration = Date.now() - startTime;
      console.log(`🏁 [fetchTravels] Completado en ${totalDuration}ms`);
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchAttempts]);

  // 🔄 FUNCIÓN PARA PROCESAR RUTAS A VIAJES
  const processRoutes = (routes) => {
    console.log(`🔄 [processRoutes] Procesando ${routes.length} rutas`);
    
    return routes.map((route, index) => {
      try {
        return {
          _id: route.id,
          id: route.id,
          type: `${route.route?.from || 'Origen'} → ${route.route?.to || 'Destino'}`,
          description: route.description || 'Sin descripción',
          tripDescription: route.description || 'Sin descripción',
          
          departureTime: route.tripInfo?.departure || route.tripInfo?.realDeparture,
          arrivalTime: route.tripInfo?.arrival || route.tripInfo?.estimatedArrival,
          time: route.tripInfo?.departure || 'Sin hora',
          endTime: route.tripInfo?.arrival || route.tripInfo?.estimatedArrival,
          
          estado: {
            actual: mapStatusToDbStatus(route.status),
            progreso: route.tripInfo?.progress || 0,
            label: route.statusText || 'Desconocido'
          },
          
          conductorId: {
            _id: route.tripInfo?.conductorId || `temp_driver_${index}`,
            nombre: route.tripInfo?.driver || 'Conductor por asignar'
          },
          truckId: {
            _id: route.tripInfo?.truckId || `temp_truck_${index}`,
            patente: route.tripInfo?.truck || 'Camión por asignar'
          },
          auxiliarId: route.tripInfo?.auxiliarId ? {
            _id: route.tripInfo.auxiliarId,
            nombre: route.tripInfo.auxiliar || 'Auxiliar'
          } : null,
          
          quoteId: route.quotation || {
            _id: route.route?.quoteId || null,
            ruta: {
              origen: { nombre: route.route?.from || 'Origen' },
              destino: { nombre: route.route?.to || 'Destino' }
            }
          },
          
          distancia: route.distance || 'N/A',
          observaciones: route.observaciones || '',
          condiciones: route.conditions || route.condiciones || {
            weather: 'normal',
            traffic: 'normal',
            road: 'buena'
          },
          
          alertas: route.alerts?.length > 0 ? {
            count: route.alerts.length,
            prioridad: Math.max(...route.alerts.map(a => getPriorityValue(a.priority || 'baja')))
          } : null,
          
          icon: getIconByStatus(route.status),
          color: getColorByStatus(route.status),
          status: getStatusColorByStatus(route.status),
          textColor: getTextColorByStatus(route.status),
          
          originalRoute: route
        };
      } catch (routeError) {
        console.error(`❌ [processRoutes] Error procesando ruta ${index}:`, routeError);
        return null;
      }
    }).filter(Boolean);
  };

  // 🆕 useEffect PARA CARGA INICIAL Y AUTO-REFRESH INTELIGENTE
  useEffect(() => {
    console.log("🚀 [useTravels] Iniciando carga inicial de datos");
    fetchTravels();

    // ⏰ AUTO-REFRESH INTELIGENTE
    const autoRefreshInterval = setInterval(() => {
      // Solo auto-refresh si está online o si han pasado más de 5 minutos en modo demo
      const shouldRefresh = connectionStatus === 'online' || 
        (connectionStatus === 'demo' && lastFetchSuccess && 
         Date.now() - lastFetchSuccess.getTime() > 300000); // 5 minutos
      
      if (shouldRefresh) {
        console.log(`⏰ [useTravels] Auto-refresh programado (status: ${connectionStatus})`);
        fetchTravels(true);
      }
    }, 180000); // 3 minutos

    return () => {
      console.log("🧹 [useTravels] Limpiando auto-refresh interval");
      clearInterval(autoRefreshInterval);
    };
  }, [fetchTravels, connectionStatus, lastFetchSuccess]);

  // 🔧 FUNCIONES CRUD SIMPLIFICADAS
  const addTravel = async (travelData) => {
    console.log("🆕 [addTravel] Agregando viaje:", travelData);
    
    const nuevoViaje = {
      _id: `local_${Date.now()}`,
      id: `local_${Date.now()}`,
      type: `${travelData.origen || 'Origen'} → ${travelData.destino || 'Destino'}`,
      description: travelData.tripDescription || 'Nuevo viaje',
      tripDescription: travelData.tripDescription || 'Nuevo viaje',
      departureTime: travelData.departureTime,
      arrivalTime: travelData.arrivalTime,
      time: travelData.departureTime ? 
        new Date(travelData.departureTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : 
        'Sin hora',
      endTime: travelData.arrivalTime ? 
        new Date(travelData.arrivalTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : 
        null,
      
      estado: {
        actual: 'pendiente',
        progreso: 0,
        label: 'Programado'
      },
      
      conductorId: {
        _id: travelData.conductorId || 'temp_conductor',
        nombre: 'Conductor asignado'
      },
      truckId: {
        _id: travelData.truckId || 'temp_truck',
        patente: 'Camión asignado'
      },
      auxiliarId: travelData.auxiliarId ? {
        _id: travelData.auxiliarId,
        nombre: 'Auxiliar asignado'
      } : null,
      
      quoteId: {
        _id: travelData.quoteId || null,
        ruta: {
          origen: { nombre: travelData.origen || 'Origen' },
          destino: { nombre: travelData.destino || 'Destino' }
        }
      },
      
      distancia: 'N/A',
      observaciones: travelData.observaciones || '',
      condiciones: travelData.condiciones || {
        clima: 'normal',
        trafico: 'normal',
        carretera: 'buena'
      },
      
      alertas: null,
      icon: '📋',
      color: 'bg-gray-500',
      status: 'bg-gray-400',
      textColor: 'text-gray-600'
    };
    
    setApiTravels(prev => [...prev, nuevoViaje]);
    console.log("✅ [addTravel] Viaje agregado exitosamente");
    return { success: true, data: nuevoViaje };
  };

  const updateTravel = async (travelId, updateData) => {
    console.log(`✏️ [updateTravel] Actualizando viaje ${travelId}:`, updateData);
    
    setApiTravels(prev => prev.map(travel => {
      if (travel.id === travelId || travel._id === travelId) {
        return {
          ...travel,
          ...updateData,
          tripDescription: updateData.tripDescription || travel.tripDescription,
          observaciones: updateData.observaciones || travel.observaciones,
          condiciones: updateData.condiciones || travel.condiciones
        };
      }
      return travel;
    }));
    
    console.log("✅ [updateTravel] Viaje actualizado exitosamente");
    return { success: true, data: updateData };
  };

  const deleteTravel = async (travelId) => {
    console.log(`🗑️ [deleteTravel] Eliminando viaje ${travelId}`);
    
    setApiTravels(prev => prev.filter(travel => 
      travel.id !== travelId && travel._id !== travelId
    ));
    
    console.log("✅ [deleteTravel] Viaje eliminado exitosamente");
    return { success: true };
  };

  // 🔧 FUNCIONES PARA MANEJO DE MODALES CON ANIMACIONES
  const openModal = (trip) => {
    console.log("🪟 [openModal] Abriendo modal para viaje:", trip?.id);
    setSelectedTrip(trip);
    setShowModal(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    console.log("🔒 [closeModal] Cerrando modal principal");
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
    }, 300);
  };

  const openEditModal = (trip) => {
    console.log("✏️ [openEditModal] Abriendo modal de edición:", trip?.id);
    setSelectedTrip(trip);
    setEditForm({
      quoteId: trip?.quoteId?._id || '',
      truckId: trip?.truckId?._id || '',
      conductorId: trip?.conductorId?._id || '',
      auxiliarId: trip?.auxiliarId?._id || '',
      tripDescription: trip?.tripDescription || '',
      departureTime: trip?.departureTime || '',
      arrivalTime: trip?.arrivalTime || '',
      condiciones: trip?.condiciones || {
        clima: 'normal',
        trafico: 'normal',
        carretera: 'buena'
      },
      observaciones: trip?.observaciones || ''
    });
    setShowEditModal(true);
    setIsEditClosing(false);
  };

  const closeEditModal = () => {
    console.log("🔒 [closeEditModal] Cerrando modal de edición");
    setIsEditClosing(true);
    setTimeout(() => {
      setShowEditModal(false);
      setSelectedTrip(null);
      setIsEditClosing(false);
    }, 300);
  };

  const openConfirmEditModal = () => {
    console.log("✅ [openConfirmEditModal] Abriendo confirmación de edición");
    setShowConfirmEditModal(true);
    setIsConfirmEditClosing(false);
  };

  const closeConfirmEditModal = () => {
    console.log("🔒 [closeConfirmEditModal] Cerrando confirmación de edición");
    setIsConfirmEditClosing(true);
    setTimeout(() => {
      setShowConfirmEditModal(false);
      setIsConfirmEditClosing(false);
    }, 300);
  };

  const openSuccessModal = () => {
    console.log("🎉 [openSuccessModal] Abriendo modal de éxito");
    setShowSuccessModal(true);
    setIsSuccessClosing(false);
  };

  const closeSuccessModal = () => {
    console.log("🔒 [closeSuccessModal] Cerrando modal de éxito");
    setIsSuccessClosing(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setIsSuccessClosing(false);
    }, 300);
  };

  const openDeleteModal = (trip) => {
    console.log("🗑️ [openDeleteModal] Abriendo modal de eliminación:", trip?.id);
    setSelectedTrip(trip);
    setShowDeleteModal(true);
    setIsDeleteClosing(false);
  };

  const closeDeleteModal = () => {
    console.log("🔒 [closeDeleteModal] Cerrando modal de eliminación");
    setIsDeleteClosing(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setSelectedTrip(null);
      setIsDeleteClosing(false);
    }, 300);
  };

  const openDeleteSuccessModal = () => {
    console.log("🎉 [openDeleteSuccessModal] Abriendo modal de eliminación exitosa");
    setShowDeleteSuccessModal(true);
    setIsDeleteSuccessClosing(false);
  };

  const closeDeleteSuccessModal = () => {
    console.log("🔒 [closeDeleteSuccessModal] Cerrando modal de eliminación exitosa");
    setIsDeleteSuccessClosing(true);
    setTimeout(() => {
      setShowDeleteSuccessModal(false);
      setIsDeleteSuccessClosing(false);
    }, 300);
  };

  const openProgramModal = () => {
    console.log("📋 [openProgramModal] Abriendo modal de programación");
    setProgramForm({
      quoteId: '',
      truckId: '',
      conductorId: '',
      auxiliarId: '',
      tripDescription: '',
      departureTime: '',
      arrivalTime: '',
      condiciones: {
        clima: 'normal',
        trafico: 'normal',
        carretera: 'buena'
      },
      observaciones: ''
    });
    setShowProgramModal(true);
    setIsProgramClosing(false);
  };

  const closeProgramModal = () => {
    console.log("🔒 [closeProgramModal] Cerrando modal de programación");
    setIsProgramClosing(true);
    setTimeout(() => {
      setShowProgramModal(false);
      setIsProgramClosing(false);
    }, 300);
  };

  const openProgramSuccessModal = () => {
    console.log("🎉 [openProgramSuccessModal] Abriendo modal de programación exitosa");
    setShowProgramSuccessModal(true);
    setIsProgramSuccessClosing(false);
  };

  const closeProgramSuccessModal = () => {
    console.log("🔒 [closeProgramSuccessModal] Cerrando modal de programación exitosa");
    setIsProgramSuccessClosing(true);
    setTimeout(() => {
      setShowProgramSuccessModal(false);
      setIsProgramSuccessClosing(false);
    }, 300);
  };

  // 🔧 FUNCIONES PARA MANEJO DE FORMULARIOS
  const handleEditFormChange = (field, value) => {
    console.log(`📝 [handleEditFormChange] Actualizando campo: ${field}`);
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditConditionsChange = (field, value) => {
    console.log(`🌦️ [handleEditConditionsChange] Actualizando condición: ${field} = ${value}`);
    setEditForm(prev => ({
      ...prev,
      condiciones: {
        ...prev.condiciones,
        [field]: value
      }
    }));
  };

  const handleProgramFormChange = (field, value) => {
    console.log(`📝 [handleProgramFormChange] Actualizando campo: ${field}`);
    setProgramForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProgramConditionsChange = (field, value) => {
    console.log(`🌦️ [handleProgramConditionsChange] Actualizando condición: ${field} = ${value}`);
    setProgramForm(prev => ({
      ...prev,
      condiciones: {
        ...prev.condiciones,
        [field]: value
      }
    }));
  };

  // 🔧 FUNCIONES PRINCIPALES DE ACCIÓN
  const handleEditConfirm = async () => {
    console.log("💾 [handleEditConfirm] Confirmando edición de viaje");
    
    try {
      const result = await updateTravel(selectedTrip.id, editForm);
      
      if (result.success) {
        closeConfirmEditModal();
        closeEditModal();
        openSuccessModal();
        console.log("✅ [handleEditConfirm] Viaje editado exitosamente");
      } else {
        console.error("❌ [handleEditConfirm] Error editando viaje:", result.error);
      }
    } catch (error) {
      console.error("❌ [handleEditConfirm] Error inesperado:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    console.log("🗑️ [handleDeleteConfirm] Confirmando eliminación de viaje");
    
    try {
      const result = await deleteTravel(selectedTrip.id);
      
      if (result.success) {
        closeDeleteModal();
        openDeleteSuccessModal();
        console.log("✅ [handleDeleteConfirm] Viaje eliminado exitosamente");
      } else {
        console.error("❌ [handleDeleteConfirm] Error eliminando viaje:", result.error);
      }
    } catch (error) {
      console.error("❌ [handleDeleteConfirm] Error inesperado:", error);
    }
  };

  const handleProgramConfirm = async () => {
    console.log("📋 [handleProgramConfirm] Confirmando programación de viaje");
    
    try {
      const result = await addTravel(programForm);
      
      if (result.success) {
        closeProgramModal();
        openProgramSuccessModal();
        console.log("✅ [handleProgramConfirm] Viaje programado exitosamente");
      } else {
        console.error("❌ [handleProgramConfirm] Error programando viaje:", result.error);
      }
    } catch (error) {
      console.error("❌ [handleProgramConfirm] Error inesperado:", error);
    }
  };

  // 🔧 FUNCIÓN PARA REFRESH MANUAL
  const handleRefresh = async () => {
    console.log("🔄 [handleRefresh] Refresh manual solicitado");
    await fetchTravels(true);
  };

  // 🎯 FUNCIÓN PARA OBTENER ESTADÍSTICAS DINÁMICAS
  const getStatistics = useCallback(() => {
    const totalTravels = apiTravels.length;
    const activeTravels = apiTravels.filter(travel => 
      travel.estado?.actual === 'en_curso'
    ).length;
    const completedTravels = apiTravels.filter(travel => 
      travel.estado?.actual === 'completado'
    ).length;
    const pendingTravels = apiTravels.filter(travel => 
      travel.estado?.actual === 'pendiente'
    ).length;
    const delayedTravels = apiTravels.filter(travel => 
      travel.estado?.actual === 'retrasado'
    ).length;
    
    const completionRate = totalTravels > 0 ? 
      Math.round((completedTravels / totalTravels) * 100) : 0;
    
    const averageProgress = totalTravels > 0 ? 
      Math.round(apiTravels.reduce((sum, travel) => 
        sum + (travel.estado?.progreso || 0), 0) / totalTravels) : 0;

    return {
      total_routes: totalTravels,
      active_routes: activeTravels,
      completed_routes: completedTravels,
      pending_routes: pendingTravels,
      delayed_routes: delayedTravels,
      cancelled_routes: 0,
      completion_rate: completionRate,
      on_time_rate: 100,
      average_progress: averageProgress,
      total_drivers: new Set(apiTravels.map(t => t.conductorId?._id)).size,
      total_trucks: new Set(apiTravels.map(t => t.truckId?._id)).size,
      today_trips: totalTravels,
      active_alerts: apiTravels.filter(t => t.alertas?.count > 0).length,
      total_revenue: 0,
      growth_percentage: 0
    };
  }, [apiTravels]);

  // 📊 RETORNO DEL HOOK CON TODAS LAS FUNCIONALIDADES
  return {
    // 📊 DATOS PRINCIPALES
    travels: apiTravels,
    statistics: getStatistics(),
    
    // 🔄 ESTADOS DE CARGA Y CONEXIÓN
    loading,
    isRefreshing,
    error,
    connectionStatus,
    lastFetchSuccess,
    fetchAttempts,
    
    // 🎨 DATOS DE ANIMACIONES
    animatedBars,
    animatedProgress,
    barHeights,
    progressValues,
    
    // 🪟 ESTADOS DE MODALES PRINCIPALES
    showModal,
    selectedTrip,
    isClosing,
    
    // ✏️ ESTADOS DE EDICIÓN
    showEditModal,
    isEditClosing,
    showConfirmEditModal,
    isConfirmEditClosing,
    showSuccessModal,
    isSuccessClosing,
    editForm,
    
    // 🗑️ ESTADOS DE ELIMINACIÓN
    showDeleteModal,
    isDeleteClosing,
    showDeleteSuccessModal,
    isDeleteSuccessClosing,
    
    // 📋 ESTADOS DE PROGRAMACIÓN
    showProgramModal,
    isProgramClosing,
    showProgramSuccessModal,
    isProgramSuccessClosing,
    programForm,
    
    // 🔧 FUNCIONES DE MODALES
    openModal,
    closeModal,
    openEditModal,
    closeEditModal,
    openConfirmEditModal,
    closeConfirmEditModal,
    openSuccessModal,
    closeSuccessModal,
    openDeleteModal,
    closeDeleteModal,
    openDeleteSuccessModal,
    closeDeleteSuccessModal,
    openProgramModal,
    closeProgramModal,
    openProgramSuccessModal,
    closeProgramSuccessModal,
    
    // 📝 FUNCIONES DE FORMULARIOS
    handleEditFormChange,
    handleEditConditionsChange,
    handleProgramFormChange,
    handleProgramConditionsChange,
    
    // 🎯 FUNCIONES PRINCIPALES DE ACCIÓN
    handleEditConfirm,
    handleDeleteConfirm,
    handleProgramConfirm,
    
    // 🔄 FUNCIONES DE DATOS
    fetchTravels,
    handleRefresh,
    addTravel,
    updateTravel,
    deleteTravel,
    
    // 🛠️ FUNCIONES AUXILIARES
    processRoutes,
    getMockData: getMockData()
  };
};