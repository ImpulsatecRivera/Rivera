// hooks/Travels/useTravels.js - VERSIÓN OPTIMIZADA PARA PRODUCCIÓN
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// 🌐 CONFIGURACIÓN DE API CENTRALIZADA
const API_CONFIG = {
  BASE_URL: 'https://riveraproject-5.onrender.com',
  ENDPOINTS: {
    MAP_DATA: '/api/viajes/map-data',
    VIAJES: '/api/viajes',
    TRIP_STATS: '/api/viajes/trip-stats',
    CARGA_DISTRIBUTION: '/api/viajes/carga-distribution'
  },
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000
};

// 🛠️ FUNCIÓN HELPER PARA CONSTRUIR URLs
const buildApiUrl = (endpoint) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log(`🔗 [buildApiUrl] URL construida: ${url}`);
  return url;
};

// 🔄 FUNCIÓN HELPER PARA REINTENTOS
const withRetry = async (fn, attempts = API_CONFIG.RETRY_ATTEMPTS) => {
  for (let i = 0; i < attempts; i++) {
    try {
      console.log(`🔄 [withRetry] Intento ${i + 1}/${attempts}`);
      return await fn();
    } catch (error) {
      console.error(`❌ [withRetry] Intento ${i + 1} falló:`, error.message);
      
      if (i === attempts - 1) {
        throw error; // Último intento, propagar error
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
    }
  }
};

export const useTravels = () => {
  console.log("🚀 [useTravels] Hook inicializado");

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

  // 🆕 ESTADOS PARA API
  const [apiTravels, setApiTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // ⚠️ MANTENER useEffect ORIGINAL PARA ANIMACIONES
  useEffect(() => {
    console.log("🎨 [useTravels] Iniciando animaciones");
    
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

  // 🔧 FUNCIÓN OPTIMIZADA PARA OBTENER DATOS DEL MAPA
  const fetchTravels = useCallback(async (isManualRefresh = false) => {
    const startTime = Date.now();
    console.log(`📊 [fetchTravels] Iniciando carga de viajes - Manual: ${isManualRefresh}`);

    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
        console.log("🔄 [fetchTravels] Refresh manual iniciado");
      } else {
        setLoading(true);
        console.log("⏳ [fetchTravels] Carga inicial iniciada");
      }
      
      setError(null);

      // 🎯 USAR FUNCIÓN CON REINTENTOS
      const response = await withRetry(async () => {
        const cacheBuster = Date.now();
        const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.MAP_DATA}?t=${cacheBuster}`);
        
        console.log(`🌐 [fetchTravels] Solicitando datos a: ${url}`);
        
        return await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Accept': 'application/json'
          },
          timeout: API_CONFIG.TIMEOUT,
          withCredentials: false // Simplificar para producción
        });
      });

      console.log(`✅ [fetchTravels] Respuesta recibida en ${Date.now() - startTime}ms`);
      console.log(`📋 [fetchTravels] Status: ${response.status}, Data success: ${response.data?.success}`);

      if (response.data?.success && response.data?.data) {
        const mapData = response.data.data;
        console.log(`📦 [fetchTravels] Procesando ${mapData.routes?.length || 0} rutas`);

        // 🔄 PROCESAR RUTAS A VIAJES
        const viajesExtraidos = [];
        
        if (mapData.routes && Array.isArray(mapData.routes)) {
          mapData.routes.forEach((route, index) => {
            try {
              const viaje = {
                // ✅ IDs
                _id: route.id,
                id: route.id,
                
                // ✅ INFORMACIÓN BÁSICA
                type: `${route.route?.from || 'Origen'} → ${route.route?.to || 'Destino'}`,
                description: route.description || 'Sin descripción',
                tripDescription: route.description || 'Sin descripción',
                
                // ✅ HORARIOS (MEJORADO)
                departureTime: route.tripInfo?.departure || route.tripInfo?.realDeparture,
                arrivalTime: route.tripInfo?.arrival || route.tripInfo?.estimatedArrival,
                time: route.tripInfo?.departure || 'Sin hora',
                endTime: route.tripInfo?.arrival || route.tripInfo?.estimatedArrival,
                
                // ✅ ESTADO (CONSISTENTE)
                estado: {
                  actual: mapStatusToDbStatus(route.status),
                  progreso: route.tripInfo?.progress || 0,
                  label: route.statusText || 'Desconocido'
                },
                
                // ✅ RECURSOS HUMANOS Y MATERIALES
                conductorId: {
                  _id: route.tripInfo?.conductorId || generateId(),
                  nombre: route.tripInfo?.driver || 'Conductor por asignar'
                },
                truckId: {
                  _id: route.tripInfo?.truckId || generateId(),
                  patente: route.tripInfo?.truck || 'Camión por asignar'
                },
                auxiliarId: route.tripInfo?.auxiliarId ? {
                  _id: route.tripInfo.auxiliarId,
                  nombre: route.tripInfo.auxiliar || 'Auxiliar'
                } : null,
                
                // ✅ INFORMACIÓN DE RUTA
                quoteId: route.quotation ? {
                  _id: route.quotation._id,
                  ruta: {
                    origen: { 
                      nombre: route.quotation.ruta?.origen?.nombre || route.route?.from || 'Origen' 
                    },
                    destino: { 
                      nombre: route.quotation.ruta?.destino?.nombre || route.route?.to || 'Destino' 
                    }
                  }
                } : {
                  _id: route.route?.quoteId || null,
                  ruta: {
                    origen: { nombre: route.route?.from || 'Origen' },
                    destino: { nombre: route.route?.to || 'Destino' }
                  }
                },
                
                // ✅ INFORMACIÓN ADICIONAL
                distancia: route.distance || 'N/A',
                observaciones: route.observaciones || '',
                condiciones: route.conditions || route.condiciones || {
                  weather: 'normal',
                  traffic: 'normal',
                  road: 'buena'
                },
                
                // ✅ ALERTAS
                alertas: route.alerts && route.alerts.length > 0 ? {
                  count: route.alerts.length,
                  prioridad: getMaxPriority(route.alerts)
                } : null,
                
                // ✅ INFORMACIÓN VISUAL
                icon: getIconByStatus(route.status),
                color: getColorByStatus(route.status),
                status: getStatusColorByStatus(route.status),
                textColor: getTextColorByStatus(route.status),
                
                // ✅ DATOS ORIGINALES
                originalRoute: route
              };

              console.log(`  📄 [fetchTravels] Procesado: ${viaje.type} (${viaje.estado.actual})`);
              viajesExtraidos.push(viaje);
              
            } catch (routeError) {
              console.error(`❌ [fetchTravels] Error procesando ruta ${index}:`, routeError);
            }
          });
        }
        
        console.log(`✅ [fetchTravels] Total procesados: ${viajesExtraidos.length} viajes`);
        setApiTravels(viajesExtraidos);
        setLastFetchTime(new Date());
        
        return true;
      } else {
        console.warn("⚠️ [fetchTravels] Respuesta sin datos válidos");
        setApiTravels([]);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ [fetchTravels] Error después de ${Date.now() - startTime}ms:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      setError(`Error al cargar viajes: ${error.message}`);
      setApiTravels([]);
      return false;
      
    } finally {
      console.log(`🏁 [fetchTravels] Finalizando después de ${Date.now() - startTime}ms`);
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 🆕 useEffect PARA CARGA INICIAL Y AUTO-REFRESH
  useEffect(() => {
    console.log("🚀 [useTravels] Montando hook, iniciando carga inicial");
    fetchTravels();

    // ⏰ AUTO-REFRESH CADA 2 MINUTOS
    const autoRefreshInterval = setInterval(() => {
      console.log("⏰ [useTravels] Auto-refresh activado");
      fetchTravels(true);
    }, 120000); // 2 minutos

    return () => {
      console.log("🧹 [useTravels] Limpiando interval");
      clearInterval(autoRefreshInterval);
    };
  }, [fetchTravels]);

  // 🔧 FUNCIÓN MEJORADA PARA AGREGAR VIAJE
  const addTravel = async (travelData) => {
    const startTime = Date.now();
    console.log("🆕 [addTravel] Iniciando creación de viaje:", travelData);
    
    try {
      const dataToSend = {
        quoteId: travelData.quoteId || null,
        truckId: travelData.truckId || null,
        conductorId: travelData.conductorId || null,
        auxiliarId: travelData.auxiliarId || null,
        tripDescription: travelData.tripDescription || 'Viaje sin descripción',
        departureTime: travelData.departureTime,
        arrivalTime: travelData.arrivalTime,
        condiciones: travelData.condiciones || {
          clima: 'normal',
          trafico: 'normal',
          carretera: 'buena'
        },
        observaciones: travelData.observaciones || ''
      };
      
      console.log("📤 [addTravel] Enviando datos:", dataToSend);
      
      const response = await withRetry(async () => {
        return await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.VIAJES), dataToSend, {
          headers: { 'Content-Type': 'application/json' },
          timeout: API_CONFIG.TIMEOUT
        });
      });
      
      console.log(`✅ [addTravel] Viaje creado en ${Date.now() - startTime}ms:`, response.data);
      
      // 🔄 AUTO-REFRESH DESPUÉS DE CREAR
      console.log("🔄 [addTravel] Auto-refresh después de crear");
      setTimeout(() => fetchTravels(true), 1000);
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error(`❌ [addTravel] Error después de ${Date.now() - startTime}ms:`, error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Error al crear viaje' 
      };
    }
  };

  // 🔧 FUNCIÓN MEJORADA PARA ACTUALIZAR VIAJE
  const updateTravel = async (travelId, updateData) => {
    const startTime = Date.now();
    console.log(`✏️ [updateTravel] Actualizando viaje ${travelId}:`, updateData);
    
    try {
      if (!travelId) {
        throw new Error('ID del viaje requerido');
      }
      
      const response = await withRetry(async () => {
        const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.VIAJES}/${travelId}`);
        return await axios.put(url, updateData, {
          headers: { 'Content-Type': 'application/json' },
          timeout: API_CONFIG.TIMEOUT
        });
      });
      
      console.log(`✅ [updateTravel] Viaje actualizado en ${Date.now() - startTime}ms:`, response.data);
      
      // 🔄 AUTO-REFRESH DESPUÉS DE ACTUALIZAR
      console.log("🔄 [updateTravel] Auto-refresh después de actualizar");
      setTimeout(() => fetchTravels(true), 1000);
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error(`❌ [updateTravel] Error después de ${Date.now() - startTime}ms:`, error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Error al actualizar viaje' 
      };
    }
  };

  // 🔧 FUNCIÓN MEJORADA PARA ELIMINAR VIAJE
  const deleteTravel = async (travelId) => {
    const startTime = Date.now();
    console.log(`🗑️ [deleteTravel] Eliminando viaje ${travelId}`);
    
    try {
      if (!travelId) {
        throw new Error('ID del viaje requerido');
      }
      
      const response = await withRetry(async () => {
        const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.VIAJES}/${travelId}`);
        return await axios.delete(url, {
          headers: { 'Content-Type': 'application/json' },
          timeout: API_CONFIG.TIMEOUT
        });
      });
      
      console.log(`✅ [deleteTravel] Viaje eliminado en ${Date.now() - startTime}ms:`, response.data);
      
      // 🔄 AUTO-REFRESH DESPUÉS DE ELIMINAR
      console.log("🔄 [deleteTravel] Auto-refresh después de eliminar");
      setTimeout(() => fetchTravels(true), 1000);
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error(`❌ [deleteTravel] Error después de ${Date.now() - startTime}ms:`, error);
      
      // 🎯 FALLBACK: Intentar cancelar si eliminar falla
      try {
        console.log("🔄 [deleteTravel] Intentando cancelar como fallback");
        const cancelUrl = buildApiUrl(`${API_CONFIG.ENDPOINTS.VIAJES}/${travelId}/cancel`);
        const cancelResponse = await axios.patch(cancelUrl, {
          motivo: 'eliminado_por_usuario',
          observaciones: 'Viaje cancelado desde interfaz (fallback de eliminación)'
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: API_CONFIG.TIMEOUT
        });
        
        console.log("✅ [deleteTravel] Viaje cancelado exitosamente:", cancelResponse.data);
        setTimeout(() => fetchTravels(true), 1000);
        return { success: true, data: cancelResponse.data };
        
      } catch (fallbackError) {
        console.error("❌ [deleteTravel] Fallback también falló:", fallbackError);
        return { 
          success: false, 
          error: error.response?.data?.message || error.message || 'Error al eliminar viaje' 
        };
      }
    }
  };

  // 🔄 FUNCIÓN PARA REFRESH MANUAL
  const refreshTravels = useCallback(async () => {
    console.log("🔄 [refreshTravels] Refresh manual solicitado");
    return await fetchTravels(true);
  }, [fetchTravels]);

  // 📊 DATOS PROCESADOS PARA LA VISTA
  const scheduledTrips = apiTravels.map(travel => ({
    id: travel._id || travel.id,
    type: travel.type,
    color: travel.color,
    status: travel.status,
    textColor: travel.textColor,
    time: travel.time,
    endTime: travel.endTime,
    description: travel.description,
    driver: travel.conductorId?.nombre || 'Conductor por asignar',
    truck: travel.truckId?.patente || 'Camión por asignar',
    distancia: travel.distancia,
    icon: travel.icon,
    estado: travel.estado,
    alertas: travel.alertas,
    // ✅ CAMPOS PARA EDICIÓN
    quoteId: travel.quoteId,
    truckId: travel.truckId,
    conductorId: travel.conductorId,
    auxiliarId: travel.auxiliarId,
    tripDescription: travel.tripDescription,
    departureTime: travel.departureTime,
    arrivalTime: travel.arrivalTime,
    observaciones: travel.observaciones,
    condiciones: travel.condiciones,
    ...travel
  }));

  // 📊 ESTADÍSTICAS
  const getStats = () => ({
    total: apiTravels.length,
    pendiente: apiTravels.filter(t => t.estado?.actual === 'pendiente').length,
    en_curso: apiTravels.filter(t => t.estado?.actual === 'en_curso').length,
    completado: apiTravels.filter(t => t.estado?.actual === 'completado').length,
    retrasado: apiTravels.filter(t => t.estado?.actual === 'retrasado').length,
    cancelado: apiTravels.filter(t => t.estado?.actual === 'cancelado').length
  });

  // 📊 DATOS DE EARNINGS (MANTENER ORIGINALES)
  const earningsData = [
    { category: 'Transporte de Carga', amount: '879,400', progress: animatedProgress[0], color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { category: 'Servicios Express', amount: '1,378,200', progress: animatedProgress[1], color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { category: 'Logística', amount: '928,500', progress: animatedProgress[2], color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { category: 'Distribución', amount: '420,700', progress: animatedProgress[3], color: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
    { category: 'Almacenaje', amount: '520,000', progress: animatedProgress[4], color: 'bg-gradient-to-r from-pink-500 to-pink-600' }
  ];

  // 🔧 TODAS LAS FUNCIONES ORIGINALES (MANTENER PARA COMPATIBILIDAD)
  const handleTripMenuClick = (trip, index) => {
    setSelectedTrip({ ...trip, index });
    setShowModal(true);
    setIsClosing(false);
  };

  const onEdit = (trip, index) => {
    console.log("🔧 [onEdit] Editando viaje:", trip);
    setSelectedTrip({ ...trip, index });
    
    const formData = {
      quoteId: trip.quoteId?._id || trip.quoteId || '',
      truckId: trip.truckId?._id || trip.truckId || '',
      conductorId: trip.conductorId?._id || trip.conductorId || '',
      auxiliarId: trip.auxiliarId?._id || trip.auxiliarId || '',
      tripDescription: trip.description || trip.tripDescription || '',
      departureTime: trip.departureTime || '',
      arrivalTime: trip.arrivalTime || '',
      condiciones: trip.condiciones || {
        clima: 'normal',
        trafico: 'normal',
        carretera: 'buena'
      },
      observaciones: trip.observaciones || ''
    };
    
    setEditForm(formData);
    setShowEditModal(true);
    setIsEditClosing(false);
  };

  const onDelete = (trip, index) => {
    console.log("🗑️ [onDelete] Eliminando viaje:", trip);
    setSelectedTrip({ ...trip, index });
    setShowDeleteModal(true);
    setIsDeleteClosing(false);
  };

  const handleDirectUpdate = async () => {
    try {
      if (!selectedTrip?.id && !selectedTrip?._id) {
        throw new Error('No se encontró ID del viaje para actualizar');
      }

      const travelId = selectedTrip.id || selectedTrip._id;
      const result = await updateTravel(travelId, editForm);
      
      if (result.success) {
        setShowEditModal(false);
        setIsEditClosing(false);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ [handleDirectUpdate] Error:', error);
      throw error;
    }
  };

  // ⚠️ MANTENER TODAS LAS FUNCIONES ORIGINALES...
  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
    }, 300);
  };

  const handleEdit = () => {
    if (selectedTrip) {
      setEditForm({
        quoteId: selectedTrip.quoteId?._id || selectedTrip.quoteId || '',
        truckId: selectedTrip.truckId?._id || selectedTrip.truckId || '',
        conductorId: selectedTrip.conductorId?._id || selectedTrip.conductorId || '',
        auxiliarId: selectedTrip.auxiliarId?._id || selectedTrip.auxiliarId || '',
        tripDescription: selectedTrip.description || selectedTrip.tripDescription || '',
        departureTime: selectedTrip.departureTime || '',
        arrivalTime: selectedTrip.arrivalTime || '',
        condiciones: selectedTrip.condiciones || {
          clima: 'normal',
          trafico: 'normal',
          carretera: 'buena'
        },
        observaciones: selectedTrip.observaciones || ''
      });
    }
    
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
      setShowEditModal(true);
      setIsEditClosing(false);
    }, 300);
  };

  const handleUpdateTrip = () => {
    setIsEditClosing(true);
    setTimeout(() => {
      setShowEditModal(false);
      setIsEditClosing(false);
      setShowConfirmEditModal(true);
      setIsConfirmEditClosing(false);
    }, 300);
  };

  const handleConfirmEdit = async () => {
    try {
      if (selectedTrip?.id || selectedTrip?._id) {
        const travelId = selectedTrip.id || selectedTrip._id;
        const result = await updateTravel(travelId, editForm);
        
        if (result.success) {
          setIsConfirmEditClosing(true);
          setTimeout(() => {
            setShowConfirmEditModal(false);
            setIsConfirmEditClosing(false);
            setShowSuccessModal(true);
            setIsSuccessClosing(false);
          }, 300);
        } else {
          alert(`Error al actualizar: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('❌ Error actualizando viaje:', error);
      alert(`Error actualizando viaje: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setIsConfirmEditClosing(true);
    setTimeout(() => {
      setShowConfirmEditModal(false);
      setIsConfirmEditClosing(false);
      setShowEditModal(true);
      setIsEditClosing(false);
    }, 300);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessClosing(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setIsSuccessClosing(false);
    }, 300);
  };

  const handleCloseEditModal = () => {
    setIsEditClosing(true);
    setTimeout(() => {
      setShowEditModal(false);
      setIsEditClosing(false);
    }, 300);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleDelete = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
      setShowDeleteModal(true);
      setIsDeleteClosing(false);
    }, 300);
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedTrip?.id || selectedTrip?._id) {
        const result = await deleteTravel(selectedTrip.id || selectedTrip._id);
        
        if (result.success) {
          setIsDeleteClosing(true);
          setTimeout(() => {
            setShowDeleteModal(false);
            setIsDeleteClosing(false);
            setShowDeleteSuccessModal(true);
            setIsDeleteSuccessClosing(false);
          }, 300);
        } else {
          alert(`Error al eliminar: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('❌ Error eliminando viaje:', error);
      alert(`Error eliminando viaje: ${error.message}`);
    }
  };

  const handleCloseDeleteSuccessModal = () => {
    setIsDeleteSuccessClosing(true);
    setTimeout(() => {
      setShowDeleteSuccessModal(false);
      setIsDeleteSuccessClosing(false);
      setSelectedTrip(null);
    }, 300);
  };

  const handleCancelDelete = () => {
    setIsDeleteClosing(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setIsDeleteClosing(false);
      setShowModal(true);
      setIsClosing(false);
    }, 300);
  };

  const handleOpenProgramModal = () => {
    setShowProgramModal(true);
    setIsProgramClosing(false);
  };

  const handleCloseProgramModal = () => {
    setIsProgramClosing(true);
    setTimeout(() => {
      setShowProgramModal(false);
      setIsProgramClosing(false);
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
    }, 300);
  };

  const handleProgramInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProgramForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProgramForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleProgramTrip = async () => {
    try {
      const result = await addTravel(programForm);
      
      if (result.success) {
        setShowProgramSuccessModal(true);
        setIsProgramSuccessClosing(false);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error programando viaje:', error);
      throw error;
    }
  };

  const handleCloseProgramSuccessModal = () => {
    setIsProgramSuccessClosing(true);
    setTimeout(() => {
      setShowProgramSuccessModal(false);
      setIsProgramSuccessClosing(false);
      setIsProgramClosing(true);
      setTimeout(() => {
        setShowProgramModal(false);
        setIsProgramClosing(false);
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
      }, 300);
    }, 300);
  };

  // ⚡ INFORMACIÓN DE DEBUG
  const debugInfo = {
    apiConfig: API_CONFIG,
    lastFetchTime,
    travelsCount: apiTravels.length,
    loading,
    error,
    isRefreshing
  };

  console.log("📊 [useTravels] Estado actual:", {
    travels: apiTravels.length,
    loading,
    error: !!error,
    isRefreshing,
    lastFetch: lastFetchTime?.toLocaleTimeString()
  });

  return {
    // ✅ ESTADOS ORIGINALES (COMPATIBILIDAD TOTAL)
    animatedBars,
    animatedProgress,
    showModal,
    selectedTrip,
    isClosing,
    showEditModal,
    isEditClosing,
    showConfirmEditModal,
    isConfirmEditClosing,
    showSuccessModal,
    isSuccessClosing,
    showDeleteModal,
    isDeleteClosing,
    showDeleteSuccessModal,
    isDeleteSuccessClosing,
    showProgramModal,
    isProgramClosing,
    showProgramSuccessModal,
    isProgramSuccessClosing,
    editForm,
    programForm,
    
    // ✅ DATOS (OPTIMIZADOS PARA API)
    scheduledTrips,
    earningsData,
    barHeights,
    
    // ✅ FUNCIONES ORIGINALES (COMPATIBILIDAD TOTAL)
    handleTripMenuClick,
    handleCloseModal,
    handleEdit,
    handleUpdateTrip,
    handleConfirmEdit,
    handleCancelEdit,
    handleCloseSuccessModal,
    handleCloseEditModal,
    handleInputChange,
    handleDelete,
    handleConfirmDelete,
    handleCloseDeleteSuccessModal,
    handleCancelDelete,
    handleOpenProgramModal,
    handleCloseProgramModal,
    handleProgramInputChange,
    handleProgramTrip,
    handleCloseProgramSuccessModal,

    // ✅ FUNCIONES DIRECTAS PARA CONTEXTMENU
    onEdit,
    onDelete,
    handleDirectUpdate,

    // ✅ ESTADO Y FUNCIONES DE API (OPTIMIZADAS)
    loading,
    error,
    isRefreshing,
    travels: apiTravels,
    stats: getStats(),
    refreshTravels,
    addTravel,
    updateTravel,
    deleteTravel,
    
    // 🆕 INFORMACIÓN DE DEBUG Y MONITOREO
    debugInfo,
    lastFetchTime
  };
};

// 🛠️ FUNCIONES HELPER PARA MAPEO DE DATOS

// Mapear estados del mapa a estados de BD
const mapStatusToDbStatus = (mapStatus) => {
  const statusMap = {
    'in_progress': 'en_curso',
    'completed': 'completado',
    'delayed': 'retrasado',
    'cancelled': 'cancelado',
    'scheduled': 'pendiente'
  };
  return statusMap[mapStatus] || 'pendiente';
};

// Obtener prioridad máxima de alertas
const getMaxPriority = (alerts) => {
  if (!alerts || alerts.length === 0) return 1;
  return Math.max(...alerts.map(alert => {
    switch (alert.priority) {
      case 'alta': return 3;
      case 'media': return 2;
      case 'baja': return 1;
      default: return 1;
    }
  }));
};

// Obtener icono por estado
const getIconByStatus = (status) => {
  const iconMap = {
    'in_progress': '🚛',
    'completed': '✅',
    'delayed': '⏰',
    'cancelled': '❌',
    'scheduled': '📋'
  };
  return iconMap[status] || '🚛';
};

// Obtener color por estado
const getColorByStatus = (status) => {
  const colorMap = {
    'in_progress': 'bg-blue-500',
    'completed': 'bg-green-500',
    'delayed': 'bg-orange-500',
    'cancelled': 'bg-red-500',
    'scheduled': 'bg-gray-500'
  };
  return colorMap[status] || 'bg-gray-400';
};

// Obtener color de status por estado
const getStatusColorByStatus = (status) => {
  const colorMap = {
    'in_progress': 'bg-blue-400',
    'completed': 'bg-green-400',
    'delayed': 'bg-orange-400',
    'cancelled': 'bg-red-400',
    'scheduled': 'bg-gray-400'
  };
  return colorMap[status] || 'bg-gray-300';
};

// Obtener color de texto por estado
const getTextColorByStatus = (status) => {
  const colorMap = {
    'in_progress': 'text-blue-600',
    'completed': 'text-green-600',
    'delayed': 'text-orange-600',
    'cancelled': 'text-red-600',
    'scheduled': 'text-gray-600'
  };
  return colorMap[status] || 'text-gray-500';
};

// Generar ID temporal
const generateId = () => {
  return 'temp_' + Math.random().toString(36).substr(2, 9);
};