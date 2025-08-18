// hooks/Travels/useTravels.js - VERSIÓN OPTIMIZADA PARA AUTO-REFRESH
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useTravels = () => {
  // ⚠️ MANTENER EL ORDEN EXACTO ORIGINAL - NO CAMBIAR NADA AQUÍ
  
  // Estados para las animaciones de gráficos (ORIGINALES - POSICIONES 1-2)
  const barHeights = [60, 80, 45, 90, 120, 70, 50, 85, 95, 110, 140, 75, 65, 100];
  const progressValues = [85, 70, 55, 40, 30];
  const [animatedBars, setAnimatedBars] = useState(Array(14).fill(0));
  const [animatedProgress, setAnimatedProgress] = useState(Array(5).fill(0));

  // Estados para modales (ORIGINALES - POSICIONES 3-5)
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  
  // Estados para modal de edición (ORIGINALES - POSICIONES 6-11)
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditClosing, setIsEditClosing] = useState(false);
  const [showConfirmEditModal, setShowConfirmEditModal] = useState(false);
  const [isConfirmEditClosing, setIsConfirmEditClosing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSuccessClosing, setIsSuccessClosing] = useState(false);
  
  // Estados para modal de eliminación (ORIGINALES - POSICIONES 12-15)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleteClosing, setIsDeleteClosing] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [isDeleteSuccessClosing, setIsDeleteSuccessClosing] = useState(false);
  
  // Estados para modal de programar (ORIGINALES - POSICIONES 16-19)
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [isProgramClosing, setIsProgramClosing] = useState(false);
  const [showProgramSuccessModal, setShowProgramSuccessModal] = useState(false);
  const [isProgramSuccessClosing, setIsProgramSuccessClosing] = useState(false);

  // Formularios (ORIGINALES - POSICIONES 20-21)
  const [editForm, setEditForm] = useState({
    quoteId: '',
    truckId: '',
    conductorId: '',
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

  // 🆕 NUEVOS ESTADOS AL FINAL (POSICIONES 22-25) - AQUÍ NO HAY CONFLICTO
  const [apiTravels, setApiTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // 🆕 Estado para mostrar cuando se está refrescando

  // ⚠️ MANTENER EL useEffect ORIGINAL EN LA MISMA POSICIÓN
  // Funciones de animación (ORIGINAL - useEffect POSICIÓN 1)
  useEffect(() => {
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

  // 🔧 FUNCIÓN OPTIMIZADA PARA USAR EL MISMO ENDPOINT QUE RIVERA TRANSPORT
  const fetchTravels = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      console.log("📊 useTravels: Cargando desde MISMO endpoint que Rivera Transport...");
      
      // 🎯 USAR EL MISMO ENDPOINT QUE RIVERA TRANSPORT MAP con cache-busting
      const cacheBuster = new Date().getTime();
      const response = await axios.get(`http://localhost:4000/api/viajes/map-data?t=${cacheBuster}`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000 // 10 segundos timeout
      });
      
      console.log("🔍 useTravels: RESPUESTA de map-data:", response.data);
      
      if (response.data.success && response.data.data) {
        const mapData = response.data.data;
        console.log("📅 useTravels: Procesando map-data:", mapData);
        
        // 🆕 EXTRAER VIAJES DE LAS RUTAS DEL MAP-DATA
        const viajesExtraidos = [];
        
        if (mapData.routes && Array.isArray(mapData.routes)) {
          mapData.routes.forEach(route => {
            const viaje = {
              _id: route.id,
              id: route.id,
              type: `${route.route?.from || 'Origen'} → ${route.route?.to || 'Destino'}`,
              tripDescription: route.description || route.tripInfo?.cargo || 'Sin descripción',
              departureTime: route.tripInfo?.departure,
              arrivalTime: route.tripInfo?.arrival,
              estado: {
                actual: route.status === 'in_progress' ? 'en_curso' :
                       route.status === 'completed' ? 'completado' :
                       route.status === 'delayed' ? 'retrasado' :
                       route.status === 'cancelled' ? 'cancelado' :
                       route.status === 'scheduled' ? 'pendiente' : 'pendiente',
                progreso: route.tripInfo?.progress || 0
              },
              conductorId: {
                nombre: route.tripInfo?.driver || 'Conductor por asignar'
              },
              truckId: {
                patente: route.tripInfo?.truck || 'Camión por asignar'
              },
              quoteId: {
                ruta: {
                  origen: { nombre: route.route?.from || 'Origen' },
                  destino: { nombre: route.route?.to || 'Destino' }
                }
              },
              distancia: route.distance,
              alertas: route.alerts && route.alerts.length > 0 ? {
                count: route.alerts.length,
                prioridad: route.alerts.some(a => a.priority === 'alta') ? 3 :
                          route.alerts.some(a => a.priority === 'media') ? 2 : 1
              } : null
            };
            
            console.log(`  🚛 useTravels: Procesando ${viaje.type} - Estado: ${viaje.estado?.actual}`);
            viajesExtraidos.push(viaje);
          });
        }
        
        console.log(`✅ useTravels: Total viajes extraídos de map-data: ${viajesExtraidos.length}`);
        setApiTravels(viajesExtraidos);
        
      } else {
        console.log("❌ useTravels: No se encontraron datos válidos en map-data");
        setApiTravels([]);
      }
      
      return true; // Indicar éxito
    } catch (error) {
      console.error('❌ useTravels: Error al cargar desde map-data:', error);
      setError('Error al cargar los viajes');
      setApiTravels([]);
      return false; // Indicar fallo
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []); // useCallback para evitar re-renders innecesarios

  // 🆕 useEffect PARA API (useEffect POSICIÓN 2) - AL FINAL
  useEffect(() => {
    fetchTravels();
  }, [fetchTravels]);

  // 🔧 FUNCIÓN MEJORADA PARA AGREGAR VIAJE CON AUTO-REFRESH
  const addTravel = async (travelData) => {
    try {
      console.log("🆕 Creando viaje:", travelData);
      
      // 🎯 PREPARAR DATOS SEGÚN EL FORMATO ESPERADO POR LA API
      const dataToSend = {
        quoteId: travelData.quoteId,
        truckId: travelData.truckId,
        conductorId: travelData.conductorId,
        auxiliarId: travelData.auxiliarId || null,
        tripDescription: travelData.tripDescription,
        departureTime: travelData.departureTime,
        arrivalTime: travelData.arrivalTime,
        costosReales: travelData.costosReales || {
          combustible: 0,
          peajes: 0,
          conductor: 0,
          otros: 0,
          total: 0
        },
        condiciones: travelData.condiciones || {
          clima: 'normal',
          trafico: 'normal',
          carretera: 'buena'
        },
        observaciones: travelData.observaciones || '',
        // 🆕 Campos adicionales para asegurar inicialización correcta
        estado: {
          actual: 'pendiente',
          autoActualizar: true,
          historial: [{
            estado: 'pendiente',
            fecha: new Date().toISOString(),
            observaciones: 'Viaje programado desde la interfaz'
          }]
        },
        tracking: {
          ubicacionActual: {
            lat: null,
            lng: null,
            velocidad: 0,
            timestamp: new Date().toISOString()
          },
          progreso: {
            porcentaje: 0,
            calculoAutomatico: true,
            ultimaActualizacion: new Date().toISOString()
          },
          checkpoints: []
        }
      };
      
      console.log("📤 Datos enviados a la API:", dataToSend);
      
      const response = await axios.post('http://localhost:4000/api/viajes', dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 segundos timeout para crear viaje
      });
      
      console.log("✅ Viaje creado exitosamente:", response.data);
      
      // 🔄 REFRESCAR DATOS INMEDIATAMENTE DESPUÉS DE CREAR
      console.log("🔄 Refrescando datos después de crear viaje...");
      const refreshSuccess = await fetchTravels(true); // true = es refresh manual
      
      if (refreshSuccess) {
        console.log("✅ Datos refrescados exitosamente tras crear viaje");
      } else {
        console.warn("⚠️ Advertencia: Error al refrescar datos tras crear viaje");
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error al agregar viaje:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Error al agregar viaje' 
      };
    }
  };

  // 🔧 FUNCIÓN MEJORADA PARA ACTUALIZAR VIAJE CON AUTO-REFRESH
  const updateTravel = async (travelId, updateData) => {
    try {
      console.log("✏️ Actualizando viaje:", travelId, updateData);
      const response = await axios.patch(`http://localhost:4000/api/viajes/${travelId}/progress`, updateData, {
        timeout: 10000
      });
      
      console.log("✅ Viaje actualizado exitosamente:", response.data);
      
      // 🔄 REFRESCAR DATOS INMEDIATAMENTE DESPUÉS DE ACTUALIZAR
      console.log("🔄 Refrescando datos después de actualizar viaje...");
      const refreshSuccess = await fetchTravels(true);
      
      if (refreshSuccess) {
        console.log("✅ Datos refrescados exitosamente tras actualizar viaje");
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error al actualizar viaje:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Error al actualizar viaje' 
      };
    }
  };

  // 🔧 FUNCIÓN MEJORADA PARA ELIMINAR VIAJE CON AUTO-REFRESH
  const deleteTravel = async (travelId) => {
    try {
      console.log("🗑️ Cancelando viaje:", travelId);
      const response = await axios.patch(`http://localhost:4000/api/viajes/${travelId}/cancel`, {
        motivo: 'eliminado_por_usuario',
        observaciones: 'Viaje cancelado desde la interfaz'
      }, {
        timeout: 10000
      });
      
      console.log("✅ Viaje cancelado exitosamente:", response.data);
      
      // 🔄 REFRESCAR DATOS INMEDIATAMENTE DESPUÉS DE CANCELAR
      console.log("🔄 Refrescando datos después de cancelar viaje...");
      const refreshSuccess = await fetchTravels(true);
      
      if (refreshSuccess) {
        console.log("✅ Datos refrescados exitosamente tras cancelar viaje");
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error al cancelar viaje:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Error al cancelar viaje' 
      };
    }
  };

  // 🆕 FUNCIÓN PARA REFRESCAR MANUALMENTE (PARA USAR EN COMPONENTES)
  const refreshTravels = useCallback(async () => {
    console.log("🔄 Refresh manual iniciado...");
    return await fetchTravels(true);
  }, [fetchTravels]);

  // 🔄 DATOS PROCESADOS: Los viajes ya vienen procesados del endpoint /map-data
  const scheduledTrips = apiTravels.map(travel => {
    console.log("🔄 Procesando viaje para vista:", travel);
    
    return {
      id: travel._id || travel.id,
      type: travel.type || `${travel.quoteId?.ruta?.origen?.nombre || 'Origen'} → ${travel.quoteId?.ruta?.destino?.nombre || 'Destino'}`,
      color: travel.estado?.actual === 'completado' ? 'bg-green-500' : 
             travel.estado?.actual === 'en_curso' ? 'bg-blue-500' :
             travel.estado?.actual === 'retrasado' ? 'bg-orange-500' :
             travel.estado?.actual === 'cancelado' ? 'bg-red-500' : 
             travel.estado?.actual === 'pendiente' ? 'bg-gray-500' : 'bg-gray-400',
      status: travel.estado?.actual === 'completado' ? 'bg-green-400' : 
              travel.estado?.actual === 'en_curso' ? 'bg-blue-400' :
              travel.estado?.actual === 'retrasado' ? 'bg-orange-400' :
              travel.estado?.actual === 'cancelado' ? 'bg-red-400' : 
              travel.estado?.actual === 'pendiente' ? 'bg-gray-400' : 'bg-gray-300',
      textColor: travel.estado?.actual === 'completado' ? 'text-green-600' : 
                 travel.estado?.actual === 'en_curso' ? 'text-blue-600' :
                 travel.estado?.actual === 'retrasado' ? 'text-orange-600' :
                 travel.estado?.actual === 'cancelado' ? 'text-red-600' : 
                 travel.estado?.actual === 'pendiente' ? 'text-gray-600' : 'text-gray-500',
      time: travel.time || (travel.departureTime ? new Date(travel.departureTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : 'Sin hora'),
      endTime: travel.endTime || (travel.arrivalTime ? new Date(travel.arrivalTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : null),
      description: travel.description || travel.tripDescription || 'Sin descripción',
      driver: travel.driver || travel.conductorId?.nombre || 'Conductor por asignar',
      truck: travel.truck || travel.truckId?.patente || 'Camión por asignar',
      distancia: travel.distancia,
      icon: travel.icon || '🚛',
      estado: travel.estado,
      alertas: travel.alertas,
      ...travel
    };
  });

  console.log("📋 SCHEDULED TRIPS FINAL:", scheduledTrips);

  // Datos de earnings (mantener originales)
  const earningsData = [
    { category: 'Transporte de Carga', amount: '879,400', progress: animatedProgress[0], color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { category: 'Servicios Express', amount: '1,378,200', progress: animatedProgress[1], color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { category: 'Logística', amount: '928,500', progress: animatedProgress[2], color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { category: 'Distribución', amount: '420,700', progress: animatedProgress[3], color: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
    { category: 'Almacenaje', amount: '520,000', progress: animatedProgress[4], color: 'bg-gradient-to-r from-pink-500 to-pink-600' }
  ];

  // Estadísticas de API (de todos los viajes, no solo de hoy)
  const getStats = () => {
    return {
      total: apiTravels.length,
      pendiente: apiTravels.filter(t => t.estado?.actual === 'pendiente').length,
      en_curso: apiTravels.filter(t => t.estado?.actual === 'en_curso').length,
      completado: apiTravels.filter(t => t.estado?.actual === 'completado').length,
      retrasado: apiTravels.filter(t => t.estado?.actual === 'retrasado').length,
      cancelado: apiTravels.filter(t => t.estado?.actual === 'cancelado').length
    };
  };

  // ⚠️ MANTENER TODAS LAS FUNCIONES ORIGINALES SIN CAMBIOS (solo las que usan API fueron modificadas)

  // Funciones de manejo de modales (ORIGINALES)
  const handleTripMenuClick = (trip, index) => {
    setSelectedTrip({ ...trip, index });
    setShowModal(true);
    setIsClosing(false);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
    }, 300);
  };

  // Funciones de edición (MODIFICADAS PARA USAR API)
  const handleEdit = () => {
    if (selectedTrip) {
      setEditForm({
        quoteId: selectedTrip.quoteId?._id || selectedTrip.quoteId || '',
        truckId: selectedTrip.truckId?._id || selectedTrip.truckId || '',
        conductorId: selectedTrip.conductorId?._id || selectedTrip.conductorId || '',
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
        const result = await updateTravel(selectedTrip.id || selectedTrip._id, {
          tripDescription: editForm.tripDescription,
          condiciones: editForm.condiciones,
          observaciones: editForm.observaciones
        });
        
        if (result.success) {
          setIsConfirmEditClosing(true);
          setTimeout(() => {
            setShowConfirmEditModal(false);
            setIsConfirmEditClosing(false);
            setShowSuccessModal(true);
            setIsSuccessClosing(false);
          }, 300);
        }
      } else {
        console.log('Actualizando viaje (modo local):', editForm);
        setIsConfirmEditClosing(true);
        setTimeout(() => {
          setShowConfirmEditModal(false);
          setIsConfirmEditClosing(false);
          setShowSuccessModal(true);
          setIsSuccessClosing(false);
        }, 300);
      }
    } catch (error) {
      console.error('Error actualizando viaje:', error);
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

  // Funciones de eliminación (MODIFICADAS PARA USAR API)
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
        }
      } else {
        console.log('Eliminando viaje (modo local):', selectedTrip);
        setIsDeleteClosing(true);
        setTimeout(() => {
          setShowDeleteModal(false);
          setIsDeleteClosing(false);
          setShowDeleteSuccessModal(true);
          setIsDeleteSuccessClosing(false);
        }, 300);
      }
    } catch (error) {
      console.error('Error eliminando viaje:', error);
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

  // Funciones de programar viaje (MODIFICADAS PARA USAR API CON AUTO-REFRESH)
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

  // 🔧 FUNCIÓN MEJORADA PARA PROGRAMAR VIAJE CON AUTO-REFRESH
  const handleProgramTrip = async () => {
    try {
      console.log("🚛 Programando viaje con datos:", programForm);
      const result = await addTravel(programForm);
      
      if (result.success) {
        console.log("✅ Viaje programado exitosamente");
        setShowProgramSuccessModal(true);
        setIsProgramSuccessClosing(false);
        return result; // Retornar resultado para que ProgramTripModal pueda manejarlo
      } else {
        console.error("❌ Error programando viaje:", result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error programando viaje:', error);
      throw error; // Re-lanzar para que ProgramTripModal pueda manejarlo
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

  return {
    // ⚠️ MANTENER EL RETURN ORIGINAL + NUEVOS CAMPOS AL FINAL
    
    // Estados originales
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
    
    // Datos (modificados para usar API)
    scheduledTrips,
    earningsData,
    barHeights,
    
    // Funciones originales
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

    // 🆕 NUEVOS CAMPOS AL FINAL (OPTIMIZADOS)
    loading,
    error,
    isRefreshing, // 🆕 Para mostrar estado de refresh
    travels: apiTravels,
    stats: getStats(),
    refreshTravels, // 🆕 Función optimizada con useCallback
    addTravel,      // 🆕 Con auto-refresh integrado
    updateTravel,   // 🆕 Con auto-refresh integrado
    deleteTravel    // 🆕 Con auto-refresh integrado
  };
};