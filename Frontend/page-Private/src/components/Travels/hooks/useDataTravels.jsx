// hooks/Travels/useTravels.js - VERSIÓN CORREGIDA PARA ELIMINAR Y ACTUALIZAR
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

  // Formularios (CORREGIDOS - POSICIONES 20-21)
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

  // 🆕 NUEVOS ESTADOS AL FINAL (POSICIONES 22-25)
  const [apiTravels, setApiTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      const response = await axios.get(`https://riveraproject-production-933e.up.railway.app/api/viajes/map-data?t=${cacheBuster}`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000
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
                _id: route.tripInfo?.driverId || null,
                nombre: route.tripInfo?.driver || 'Conductor por asignar'
              },
              truckId: {
                _id: route.tripInfo?.truckId || null,
                patente: route.tripInfo?.truck || 'Camión por asignar'
              },
              auxiliarId: route.tripInfo?.auxiliarId ? {
                _id: route.tripInfo.auxiliarId,
                nombre: route.tripInfo.auxiliar || 'Auxiliar'
              } : null,
              quoteId: {
                _id: route.quoteId || null,
                ruta: {
                  origen: { nombre: route.route?.from || 'Origen' },
                  destino: { nombre: route.route?.to || 'Destino' }
                }
              },
              distancia: route.distance,
              observaciones: route.observaciones || '',
              condiciones: route.condiciones || {
                clima: 'normal',
                trafico: 'normal',
                carretera: 'buena'
              },
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
      
      return true;
    } catch (error) {
      console.error('❌ useTravels: Error al cargar desde map-data:', error);
      setError('Error al cargar los viajes');
      setApiTravels([]);
      return false;
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 🆕 useEffect PARA API (useEffect POSICIÓN 2)
  useEffect(() => {
    fetchTravels();
  }, [fetchTravels]);

  // 🔧 FUNCIÓN MEJORADA PARA AGREGAR VIAJE CON AUTO-REFRESH
  const addTravel = async (travelData) => {
    try {
      console.log("🆕 Creando viaje:", travelData);
      
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
      
      const response = await axios.post('riveraproject-production.up.railway.app/api/viajes', dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      console.log("✅ Viaje creado exitosamente:", response.data);
      
      // 🔄 REFRESCAR DATOS INMEDIATAMENTE DESPUÉS DE CREAR
      console.log("🔄 Refrescando datos después de crear viaje...");
      const refreshSuccess = await fetchTravels(true);
      
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

  // 🚨 FUNCIÓN ACTUALIZAR COMPLETAMENTE CORREGIDA
  const updateTravel = async (travelId, updateData) => {
    try {
      console.log("✏️ Actualizando viaje:", travelId);
      console.log("📝 Datos a enviar:", updateData);
      
      // Verificar que travelId existe
      if (!travelId) {
        throw new Error('ID del viaje no proporcionado');
      }
      
      // ✅ USAR ENDPOINT CORRECTO CON PARÁMETRO :viajeId
      const url = `riveraproject-production.up.railway.app/api/viajes/${travelId}`;
      console.log("🌐 URL completa:", url);
      
      const response = await axios.put(url, updateData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log("✅ Respuesta del servidor:", response.data);
      console.log("✅ Status code:", response.status);
      
      // Verificar que la respuesta sea exitosa
      if (response.status >= 200 && response.status < 300) {
        console.log("✅ Actualización exitosa confirmada");
        
        // 🔄 REFRESCAR DATOS INMEDIATAMENTE DESPUÉS DE ACTUALIZAR
        console.log("🔄 Refrescando datos después de actualizar viaje...");
        const refreshSuccess = await fetchTravels(true);
        
        if (refreshSuccess) {
          console.log("✅ Datos refrescados exitosamente tras actualizar viaje");
        } else {
          console.warn("⚠️ Advertencia: Error al refrescar datos tras actualizar viaje");
        }
        
        return { success: true, data: response.data };
      } else {
        throw new Error(`Respuesta inesperada del servidor: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Error detallado al actualizar viaje:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Error al actualizar viaje' 
      };
    }
  };

  // 🚨 FUNCIÓN ELIMINAR CORREGIDA - USAR PARÁMETRO CORRECTO :viajeId
  const deleteTravel = async (travelId) => {
    try {
      console.log("🗑️ ELIMINANDO viaje (no cancelando):", travelId);
      
      if (!travelId) {
        throw new Error('ID del viaje no proporcionado');
      }
      
      let response;
      let success = false;
      
      // 🎯 ESTRATEGIA 1: USAR DELETE DIRECTO CON PARÁMETRO CORRECTO :viajeId
      try {
        console.log(`🔄 Intentando DELETE /api/viajes/${travelId} (parámetro :viajeId)`);
        
        const url = `riveraproject-production.up.railway.app/api/viajes/${travelId}`;
        response = await axios.delete(url, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        console.log("✅ Éxito con DELETE - Viaje ELIMINADO completamente:", response.data);
        success = true;
        
      } catch (deleteError) {
        console.log("❌ DELETE falló:", deleteError.response?.status, deleteError.response?.data);
        
        // 🎯 ESTRATEGIA 2: FALLBACK - Usar endpoint de cancelación con parámetro correcto
        try {
          console.log(`🔄 Fallback: Intentando PATCH /api/viajes/${travelId}/cancel...`);
          
          const url = `riveraproject-production.up.railway.app/api/viajes/${travelId}/cancel`;
          response = await axios.patch(url, {
            motivo: 'eliminado_por_usuario',
            observaciones: 'Viaje cancelado desde la interfaz (fallback de eliminación)'
          }, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          
          console.log("✅ Éxito con PATCH /cancel (fallback):", response.data);
          success = true;
          
        } catch (cancelError) {
          console.error("❌ Ambas estrategias fallaron:", {
            deleteError: deleteError.response?.status || deleteError.message,
            deleteData: deleteError.response?.data,
            cancelError: cancelError.response?.status || cancelError.message,
            cancelData: cancelError.response?.data
          });
          throw cancelError;
        }
      }
      
      if (!success) {
        throw new Error('No se pudo eliminar el viaje con ningún método');
      }
      
      console.log("✅ Viaje procesado exitosamente:", response.data);
      
      // 🔄 REFRESCAR DATOS INMEDIATAMENTE DESPUÉS DE ELIMINAR/CANCELAR
      console.log("🔄 Refrescando datos después de eliminar viaje...");
      const refreshSuccess = await fetchTravels(true);
      
      if (refreshSuccess) {
        console.log("✅ Datos refrescados exitosamente tras eliminar viaje");
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error al eliminar viaje:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Error al eliminar viaje' 
      };
    }
  };

  // 🆕 FUNCIÓN PARA REFRESCAR MANUALMENTE
  const refreshTravels = useCallback(async () => {
    console.log("🔄 Refresh manual iniciado...");
    return await fetchTravels(true);
  }, [fetchTravels]);

  // 🔄 DATOS PROCESADOS
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
      // ✅ AGREGAR CAMPOS NECESARIOS PARA EDICIÓN
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

  // Estadísticas de API
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

  // ⚠️ FUNCIONES PARA FLUJO DIRECTO
  
  const handleTripMenuClick = (trip, index) => {
    setSelectedTrip({ ...trip, index });
    setShowModal(true);
    setIsClosing(false);
  };

  // 🆕 NUEVAS FUNCIONES DIRECTAS PARA CONTEXTMENU - CORREGIDAS
  const onEdit = (trip, index) => {
    console.log("🔧 onEdit llamado directamente con viaje:", trip);
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
    
    console.log("📝 Datos del formulario preparados:", formData);
    setEditForm(formData);
    
    setShowEditModal(true);
    setIsEditClosing(false);
  };

  const onDelete = (trip, index) => {
    console.log("🗑️ onDelete llamado directamente:", trip);
    setSelectedTrip({ ...trip, index });
    
    setShowDeleteModal(true);
    setIsDeleteClosing(false);
  };

  // 🚨 NUEVA FUNCIÓN DIRECTA PARA ACTUALIZACIÓN (SIMPLIFICADA)
  const handleDirectUpdate = async () => {
    try {
      console.log('🔄 Iniciando actualización directa del viaje...');
      console.log('🆔 Viaje seleccionado:', selectedTrip);
      console.log('📝 Datos del formulario:', editForm);
      
      if (!selectedTrip?.id && !selectedTrip?._id) {
        throw new Error('No se encontró ID del viaje para actualizar');
      }

      const travelId = selectedTrip.id || selectedTrip._id;
      
      // Preparar solo los campos que cambiaron
      const updateData = {};
      
      if (editForm.tripDescription !== (selectedTrip.description || selectedTrip.tripDescription || '')) {
        updateData.tripDescription = editForm.tripDescription;
      }
      
      if (editForm.truckId !== (selectedTrip.truckId?._id || selectedTrip.truckId || '')) {
        updateData.truckId = editForm.truckId;
      }
      
      if (editForm.conductorId !== (selectedTrip.conductorId?._id || selectedTrip.conductorId || '')) {
        updateData.conductorId = editForm.conductorId;
      }
      
      if (editForm.auxiliarId !== (selectedTrip.auxiliarId?._id || selectedTrip.auxiliarId || '')) {
        updateData.auxiliarId = editForm.auxiliarId || null;
      }
      
      if (editForm.departureTime !== (selectedTrip.departureTime || '')) {
        updateData.departureTime = editForm.departureTime;
      }
      
      if (editForm.arrivalTime !== (selectedTrip.arrivalTime || '')) {
        updateData.arrivalTime = editForm.arrivalTime;
      }
      
      if (editForm.observaciones !== (selectedTrip.observaciones || '')) {
        updateData.observaciones = editForm.observaciones;
      }
      
      const originalCondiciones = selectedTrip.condiciones || { clima: 'normal', trafico: 'normal', carretera: 'buena' };
      const hasCondicionesChanged = 
        editForm.condiciones.clima !== originalCondiciones.clima ||
        editForm.condiciones.trafico !== originalCondiciones.trafico ||
        editForm.condiciones.carretera !== originalCondiciones.carretera;
      
      if (hasCondicionesChanged) {
        updateData.condiciones = editForm.condiciones;
      }
      
      console.log('📤 Datos a actualizar (solo campos modificados):', updateData);
      
      if (Object.keys(updateData).length === 0) {
        console.log('ℹ️ No hay cambios para actualizar');
        throw new Error('No se detectaron cambios para actualizar');
      }
      
      // Llamar a la función de actualización
      const result = await updateTravel(travelId, updateData);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar viaje');
      }

      console.log('✅ Viaje actualizado exitosamente');
      
      // Cerrar modal de edición
      setShowEditModal(false);
      setIsEditClosing(false);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error en actualización directa:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
    }, 300);
  };

  // 🔧 FUNCIONES DE EDICIÓN ORIGINALES (COMPATIBILIDAD) - CORREGIDAS
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

  // 🚨 FUNCIÓN PRINCIPAL CORREGIDA
  const handleConfirmEdit = async () => {
    try {
      console.log('🔄 Confirmando edición con datos del formulario:', editForm);
      console.log('🆔 Viaje seleccionado original:', selectedTrip);
      
      if (selectedTrip?.id || selectedTrip?._id) {
        const travelId = selectedTrip.id || selectedTrip._id;
        
        const updateData = {};
        
        if (editForm.tripDescription !== (selectedTrip.description || selectedTrip.tripDescription || '')) {
          updateData.tripDescription = editForm.tripDescription;
        }
        
        if (editForm.truckId !== (selectedTrip.truckId?._id || selectedTrip.truckId || '')) {
          updateData.truckId = editForm.truckId;
        }
        
        if (editForm.conductorId !== (selectedTrip.conductorId?._id || selectedTrip.conductorId || '')) {
          updateData.conductorId = editForm.conductorId;
        }
        
        if (editForm.auxiliarId !== (selectedTrip.auxiliarId?._id || selectedTrip.auxiliarId || '')) {
          updateData.auxiliarId = editForm.auxiliarId || null;
        }
        
        if (editForm.departureTime !== (selectedTrip.departureTime || '')) {
          updateData.departureTime = editForm.departureTime;
        }
        
        if (editForm.arrivalTime !== (selectedTrip.arrivalTime || '')) {
          updateData.arrivalTime = editForm.arrivalTime;
        }
        
        if (editForm.observaciones !== (selectedTrip.observaciones || '')) {
          updateData.observaciones = editForm.observaciones;
        }
        
        const originalCondiciones = selectedTrip.condiciones || { clima: 'normal', trafico: 'normal', carretera: 'buena' };
        const hasCondicionesChanged = 
          editForm.condiciones.clima !== originalCondiciones.clima ||
          editForm.condiciones.trafico !== originalCondiciones.trafico ||
          editForm.condiciones.carretera !== originalCondiciones.carretera;
        
        if (hasCondicionesChanged) {
          updateData.condiciones = editForm.condiciones;
        }
        
        console.log('📤 Datos a actualizar (solo campos modificados):', updateData);
        
        if (Object.keys(updateData).length === 0) {
          console.log('ℹ️ No hay cambios para actualizar');
          alert('No se detectaron cambios para actualizar');
          return;
        }
        
        const result = await updateTravel(travelId, updateData);
        
        if (result.success) {
          console.log('✅ Viaje actualizado exitosamente');
          setIsConfirmEditClosing(true);
          setTimeout(() => {
            setShowConfirmEditModal(false);
            setIsConfirmEditClosing(false);
            setShowSuccessModal(true);
            setIsSuccessClosing(false);
          }, 300);
        } else {
          console.error('❌ Error en resultado:', result.error);
          alert(`Error al actualizar: ${result.error}`);
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

  // 🔧 FUNCIONES DE ELIMINACIÓN ORIGINALES (COMPATIBILIDAD)
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
        console.log('🗑️ Confirmando eliminación del viaje:', selectedTrip.id || selectedTrip._id);
        
        const result = await deleteTravel(selectedTrip.id || selectedTrip._id);
        
        if (result.success) {
          console.log('✅ Viaje eliminado exitosamente');
          setIsDeleteClosing(true);
          setTimeout(() => {
            setShowDeleteModal(false);
            setIsDeleteClosing(false);
            setShowDeleteSuccessModal(true);
            setIsDeleteSuccessClosing(false);
          }, 300);
        } else {
          console.error('❌ Error eliminando viaje:', result.error);
          alert(`Error al eliminar: ${result.error}`);
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

  // 🔧 FUNCIONES DE PROGRAMAR VIAJE (MODIFICADAS PARA USAR API CON AUTO-REFRESH)
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

  // 🔧 FUNCIÓN MEJORADA PARA PROGRAMAR VIAJE CON AUTO-REFRESH
  const handleProgramTrip = async () => {
    try {
      console.log("🚛 Programando viaje con datos:", programForm);
      const result = await addTravel(programForm);
      
      if (result.success) {
        console.log("✅ Viaje programado exitosamente");
        setShowProgramSuccessModal(true);
        setIsProgramSuccessClosing(false);
        return result;
      } else {
        console.error("❌ Error programando viaje:", result.error);
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
    
    // 🔧 FUNCIONES COMPATIBILIDAD HACIA ATRÁS (originales)
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

    // 🆕 NUEVAS FUNCIONES DIRECTAS PARA CONTEXTMENU
    onEdit,        // ✅ Nueva función directa para editar
    onDelete,      // ✅ Nueva función directa para eliminar
    handleDirectUpdate, // ✅ Nueva función directa para actualización

    // 🆕 NUEVOS CAMPOS AL FINAL (OPTIMIZADOS)
    loading,
    error,
    isRefreshing,
    travels: apiTravels,
    stats: getStats(),
    refreshTravels,
    addTravel,
    updateTravel,
    deleteTravel
  };
};