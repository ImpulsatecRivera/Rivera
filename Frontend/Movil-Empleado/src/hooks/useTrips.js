import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la API
const API_BASE_URL = 'https://riveraproject-5.onrender.com/api';

export const useTrips = (motoristaId = null, tipoConsulta = 'programados') => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTrips, setTotalTrips] = useState(0);
  const [proximosDestinos, setProximosDestinos] = useState([]);
  const [historialViajes, setHistorialViajes] = useState([]);
  const [viajesPorDia, setViajesPorDia] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    programados: 0,
    completados: 0,
    cancelados: 0,
    enProgreso: 0
  });

  // Función para formatear fecha a formato legible
  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha);
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);

    if (fechaObj.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    } else if (fechaObj.toDateString() === manana.toDateString()) {
      return 'Mañana';
    } else {
      return fechaObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  // Función para formatear hora
  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Función para obtener el ícono según el tipo de viaje
  const obtenerIconoViaje = (descripcion) => {
    const desc = descripcion?.toLowerCase() || '';
    if (desc.includes('alimento') || desc.includes('comida')) return '🍽️';
    if (desc.includes('mobiliario') || desc.includes('mueble')) return '🏠';
    if (desc.includes('construcción') || desc.includes('material')) return '🏗️';
    if (desc.includes('combustible') || desc.includes('gas')) return '⛽';
    if (desc.includes('medicina') || desc.includes('farmacia')) return '💊';
    return '📦'; // Por defecto
  };

  // Función para obtener color según estado del viaje
  const obtenerColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'programado': return '#4CAF50';
      case 'pendiente': return '#FF9800';
      case 'confirmado': return '#2196F3';
      case 'en_transito': return '#9C27B0';
      case 'completado': return '#8BC34A';
      case 'finalizado': return '#8BC34A';
      case 'cancelado': return '#F44336';
      default: return '#757575';
    }
  };

  // Función para transformar datos de la API al formato del frontend
  const transformarViajeAPI = (viaje, camion = null) => ({
    id: viaje._id,
    tipo: viaje.descripcion || 'Transporte de carga',
    subtitulo: `${viaje.origen} → ${viaje.destino}`,
    fecha: formatearFecha(viaje.fechaSalida),
    hora: formatearHora(viaje.fechaSalida),
    cotizacion: viaje.cliente || 'Cliente no especificado',
    camion: camion?.licensePlate || 'N/A',
    descripcion: viaje.descripcion,
    horaLlegada: viaje.fechaLlegada ? formatearHora(viaje.fechaLlegada) : 'No especificada',
    horaSalida: formatearHora(viaje.fechaSalida),
    asistente: 'Por asignar',
    icon: obtenerIconoViaje(viaje.descripcion || ''),
    color: obtenerColorEstado(viaje.estado),
    estado: viaje.estado,
    origen: viaje.origen,
    destino: viaje.destino,
    carga: viaje.carga
  });

  // Función para hacer peticiones con manejo de autenticación
  const hacerPeticion = async (url) => {
    try {
      // Obtener token de AsyncStorage
      const authToken = await AsyncStorage.getItem('authToken');
      
      console.log(`🌐 Haciendo petición a: ${url}`);
      console.log(`🔑 Token presente: ${authToken ? 'Sí' : 'No'}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Error response: ${errorText}`);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Datos recibidos exitosamente`);
      return data;
    } catch (error) {
      console.error(`❌ Error en petición: ${error.message}`);
      throw error;
    }
  };

  // FUNCIÓN PRINCIPAL: Cargar historial completo de viajes
  const cargarHistorialCompleto = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Cargando historial completo para motorista: ${id}`);

      const data = await hacerPeticion(`${API_BASE_URL}/motoristas/${id}/historial-completo`);

      if (data.historialCompleto && data.historialCompleto.length > 0) {
        console.log(`📊 Procesando ${data.historialCompleto.length} viajes`);
        
        // Procesar todos los viajes
        const todosLosViajes = data.historialCompleto.map(viaje => 
          transformarViajeAPI(viaje, data.camionAsignado)
        );

        // Procesar próximos destinos de viajes futuros
        const viajesFuturos = data.historialCompleto.filter(viaje => {
          const fechaViaje = new Date(viaje.fechaSalida);
          return fechaViaje >= new Date() && ['programado', 'pendiente', 'confirmado'].includes(viaje.estado);
        });

        const proximosDestinos = viajesFuturos.slice(0, 3).map(viaje => ({
          id: viaje._id,
          tipo: `${viaje.origen} → ${viaje.destino}`,
          fecha: formatearFecha(viaje.fechaSalida),
          hora: formatearHora(viaje.fechaSalida)
        }));

        // Actualizar estado con datos reales del backend
        setTrips(todosLosViajes);
        setViajesPorDia(data.viajesPorDia || []);
        setProximosDestinos(proximosDestinos);
        setTotalTrips(data.totalViajes || todosLosViajes.length);
        setEstadisticas(data.estadisticas || {
          programados: 0,
          completados: 0,
          cancelados: 0,
          enProgreso: 0
        });
        setHistorialViajes(todosLosViajes);

        console.log(`✅ Historial cargado: ${todosLosViajes.length} viajes`);
      } else {
        console.log(`ℹ️ No se encontraron viajes para el motorista ${id}`);
        
        // No hay viajes - estado limpio
        setTrips([]);
        setViajesPorDia([]);
        setProximosDestinos([]);
        setTotalTrips(0);
        setEstadisticas({
          programados: 0,
          completados: 0,
          cancelados: 0,
          enProgreso: 0
        });
        setHistorialViajes([]);
      }

    } catch (error) {
      console.error('❌ Error al cargar historial completo:', error);
      setError(`Error de conexión: ${error.message}`);
      
      // NO cargar datos mock - mantener estado limpio
      setTrips([]);
      setViajesPorDia([]);
      setProximosDestinos([]);
      setTotalTrips(0);
      setEstadisticas({
        programados: 0,
        completados: 0,
        cancelados: 0,
        enProgreso: 0
      });
      setHistorialViajes([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar viajes programados del motorista
  const cargarViajesMotorista = async (id) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Cargando viajes programados para motorista: ${id}`);

      const data = await hacerPeticion(`${API_BASE_URL}/motoristas/${id}/viajes-programados`);

      if (data.viajesPorDia && data.viajesPorDia.length > 0) {
        console.log(`📊 Procesando viajes programados`);
        
        // Procesar viajes por día
        const todosLosViajes = [];
        const proximosDestinos = [];

        data.viajesPorDia.forEach(dia => {
          dia.viajes.forEach(viaje => {
            const viajeTransformado = transformarViajeAPI(viaje, data.camionAsignado);
            todosLosViajes.push(viajeTransformado);

            // Los primeros 3 viajes se consideran próximos destinos
            if (proximosDestinos.length < 3) {
              proximosDestinos.push({
                id: viaje._id,
                tipo: `${viaje.origen} → ${viaje.destino}`,
                fecha: formatearFecha(viaje.fechaSalida),
                hora: formatearHora(viaje.fechaSalida)
              });
            }
          });
        });

        setTrips(todosLosViajes);
        setViajesPorDia(data.viajesPorDia);
        setProximosDestinos(proximosDestinos);
        setTotalTrips(data.totalViajes || todosLosViajes.length);
        setHistorialViajes(todosLosViajes.slice(-5)); // Últimos 5 para historial

        console.log(`✅ Viajes programados cargados: ${todosLosViajes.length} viajes`);
      } else {
        console.log(`ℹ️ No se encontraron viajes programados para el motorista ${id}`);
        
        // No hay viajes programados
        setTrips([]);
        setViajesPorDia([]);
        setProximosDestinos([]);
        setTotalTrips(0);
        setHistorialViajes([]);
      }

    } catch (error) {
      console.error('❌ Error al cargar viajes del motorista:', error);
      setError(`Error de conexión: ${error.message}`);
      
      // NO cargar datos mock
      setTrips([]);
      setViajesPorDia([]);
      setProximosDestinos([]);
      setTotalTrips(0);
      setHistorialViajes([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar todos los viajes (vista administrativa)
  const cargarTodosLosViajes = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Cargando todos los viajes (vista administrativa)`);

      const data = await hacerPeticion(`${API_BASE_URL}/motoristas/viajes-programados/todos`);

      if (data.viajesPorDia && data.viajesPorDia.length > 0) {
        const todosLosViajes = [];

        data.viajesPorDia.forEach(dia => {
          dia.motoristasConViajes.forEach(motoristaData => {
            motoristaData.viajes.forEach(viaje => {
              const viajeTransformado = transformarViajeAPI(viaje, motoristaData.camion);
              viajeTransformado.motorista = motoristaData.motorista;
              todosLosViajes.push(viajeTransformado);
            });
          });
        });

        setTrips(todosLosViajes);
        setViajesPorDia(data.viajesPorDia);
        setTotalTrips(data.totalViajes || todosLosViajes.length);

        console.log(`✅ Todos los viajes cargados: ${todosLosViajes.length} viajes`);
      } else {
        setTrips([]);
        setViajesPorDia([]);
        setTotalTrips(0);
      }

    } catch (error) {
      console.error('❌ Error al cargar todos los viajes:', error);
      setError(`Error de conexión: ${error.message}`);
      
      // NO cargar datos mock
      setTrips([]);
      setViajesPorDia([]);
      setTotalTrips(0);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    // Solo ejecutar si tenemos un motoristaId válido
    if (motoristaId && motoristaId !== 'null' && motoristaId !== 'undefined') {
      console.log(`🚀 Iniciando carga de datos para motorista: ${motoristaId}, tipo: ${tipoConsulta}`);
      
      // Decidir qué tipo de consulta hacer
      if (tipoConsulta === 'historial') {
        cargarHistorialCompleto(motoristaId);
      } else {
        cargarViajesMotorista(motoristaId);
      }
    } else {
      console.log(`⏳ Esperando motoristaId válido... Actual: ${motoristaId}`);
      
      // Si no hay motoristaId, mantener estado de loading para esperar
      if (!motoristaId) {
        setLoading(true);
        setError(null);
      } else {
        // Si es null o undefined como string, cargar vista administrativa
        console.log(`ℹ️ No hay motoristaId válido, cargando vista administrativa`);
        cargarTodosLosViajes();
      }
    }
  }, [motoristaId, tipoConsulta]); // Dependencias en motoristaId y tipoConsulta

  // Función para obtener viaje por ID
  const getTripById = (id) => {
    return trips.find(trip => trip.id === id);
  };

  // Función para refrescar datos
  const refrescarViajes = () => {
    console.log(`🔄 Refrescando viajes...`);
    
    if (motoristaId) {
      if (tipoConsulta === 'historial') {
        cargarHistorialCompleto(motoristaId);
      } else {
        cargarViajesMotorista(motoristaId);
      }
    } else {
      cargarTodosLosViajes();
    }
  };

  // Función para obtener viajes de hoy
  const getViajesHoy = () => {
    return trips.filter(trip => trip.fecha === 'Hoy');
  };

  // Función para obtener estadísticas
  const getEstadisticas = () => {
    const viajesTotales = trips.length;
    const viajesHoy = getViajesHoy().length;
    const viajesPendientes = trips.filter(trip => 
      ['programado', 'pendiente'].includes(trip.estado)
    ).length;
    const viajesCompletados = trips.filter(trip => 
      ['completado', 'finalizado'].includes(trip.estado)
    ).length;

    return {
      total: viajesTotales,
      hoy: viajesHoy,
      pendientes: viajesPendientes,
      completados: viajesCompletados
    };
  };

  return {
    trips,
    loading,
    error,
    totalTrips,
    proximosDestinos,
    historialViajes,
    viajesPorDia,
    estadisticas,
    getTripById,
    setTrips,
    refrescarViajes,
    cargarViajesMotorista,
    cargarTodosLosViajes,
    cargarHistorialCompleto,
    getViajesHoy,
    getEstadisticas
  };
};