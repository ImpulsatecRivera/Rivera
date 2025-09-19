import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la API
const API_BASE_URL = 'https://riveraproject-production.up.railway.app/api';

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
    return '📦';
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

  // Función para obtener token de autenticación
  const obtenerToken = async () => {
    try {
      let token = await AsyncStorage.getItem('userToken');
      if (!token) {
        token = await AsyncStorage.getItem('authToken');
      }
      
      console.log(`🔑 Token obtenido: ${token ? 'Presente' : 'No encontrado'}`);
      return token;
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
  };

  // Función para hacer peticiones HTTP
  const hacerPeticion = async (url) => {
    try {
      console.log(`🌐 Haciendo petición a: ${url}`);
      
      const authToken = await obtenerToken();
      
      const headers = {
        'Content-Type': 'application/json',
      };

      // Agregar autorización solo si hay token válido
      if (authToken && authToken !== '' && authToken !== 'temp-token' && authToken !== 'temp-register-token') {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('🔒 Authorization header agregado');
      } else {
        console.log('⚠️ Petición sin token de autorización');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Error response: ${errorText}`);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Datos recibidos exitosamente`);
      console.log(`📊 Estructura de respuesta:`, Object.keys(data));
      return data;
    } catch (error) {
      console.error(`❌ Error en petición: ${error.message}`);
      throw error;
    }
  };

  // FUNCIÓN: Cargar historial completo de viajes
  const cargarHistorialCompleto = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Cargando historial completo para motorista: ${id}`);

      const data = await hacerPeticion(`${API_BASE_URL}/motoristas/${id}/historial-completo`);
      
      console.log('📊 Respuesta del backend:', data);

      // Verificar si hay datos
      if (data && data.historialCompleto && data.historialCompleto.length > 0) {
        console.log(`📊 Procesando ${data.historialCompleto.length} viajes`);
        
        // Procesar todos los viajes
        const todosLosViajes = data.historialCompleto.map(viaje => 
          transformarViajeAPI(viaje, data.camionAsignado)
        );

        // Procesar próximos destinos
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

        // Actualizar estado
        setTrips(todosLosViajes);
        setViajesPorDia(data.viajesPorDia || []);
        setProximosDestinos(proximosDestinos);
        setTotalTrips(data.totalViajes || todosLosViajes.length);
        setEstadisticas(data.estadisticas || {
          programados: viajesFuturos.length,
          completados: todosLosViajes.filter(v => ['completado', 'finalizado'].includes(v.estado)).length,
          cancelados: todosLosViajes.filter(v => v.estado === 'cancelado').length,
          enProgreso: todosLosViajes.filter(v => ['en_transito', 'iniciado'].includes(v.estado)).length
        });
        setHistorialViajes(todosLosViajes);

        console.log(`✅ Historial cargado: ${todosLosViajes.length} viajes`);
      } else {
        console.log(`ℹ️ Respuesta del backend indica no hay viajes para el motorista ${id}`);
        console.log(`ℹ️ Mensaje del backend: ${data?.message || 'Sin mensaje'}`);
        
        // Estado limpio pero informativo
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
      
      // Estado de error
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

  // FUNCIÓN: Cargar viajes programados
  const cargarViajesMotorista = async (id) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Cargando viajes programados para motorista: ${id}`);

      const data = await hacerPeticion(`${API_BASE_URL}/motoristas/${id}/viajes-programados`);

      if (data && data.viajesPorDia && data.viajesPorDia.length > 0) {
        console.log(`📊 Procesando viajes programados`);
        
        const todosLosViajes = [];
        const proximosDestinos = [];

        data.viajesPorDia.forEach(dia => {
          dia.viajes.forEach(viaje => {
            const viajeTransformado = transformarViajeAPI(viaje, data.camionAsignado);
            todosLosViajes.push(viajeTransformado);

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
        setHistorialViajes(todosLosViajes.slice(-5));

        console.log(`✅ Viajes programados cargados: ${todosLosViajes.length} viajes`);
      } else {
        console.log(`ℹ️ No se encontraron viajes programados para el motorista ${id}`);
        
        setTrips([]);
        setViajesPorDia([]);
        setProximosDestinos([]);
        setTotalTrips(0);
        setHistorialViajes([]);
      }

    } catch (error) {
      console.error('❌ Error al cargar viajes del motorista:', error);
      setError(`Error de conexión: ${error.message}`);
      
      setTrips([]);
      setViajesPorDia([]);
      setProximosDestinos([]);
      setTotalTrips(0);
      setHistorialViajes([]);
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN: Cargar todos los viajes (vista administrativa)
  const cargarTodosLosViajes = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Cargando todos los viajes (vista administrativa)`);

      const data = await hacerPeticion(`${API_BASE_URL}/motoristas/viajes-programados/todos`);

      if (data && data.viajesPorDia && data.viajesPorDia.length > 0) {
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
      
      setTrips([]);
      setViajesPorDia([]);
      setTotalTrips(0);
    } finally {
      setLoading(false);
    }
  };

  // useEffect con manejo de dependencias
  useEffect(() => {
    console.log(`🔄 useEffect ejecutado. motoristaId: ${motoristaId}, tipoConsulta: ${tipoConsulta}`);
    
    if (motoristaId && 
        motoristaId !== 'null' && 
        motoristaId !== 'undefined' && 
        motoristaId.trim() !== '') {
      
      console.log(`🚀 Iniciando carga de datos para motorista: ${motoristaId}, tipo: ${tipoConsulta}`);
      
      if (tipoConsulta === 'historial') {
        cargarHistorialCompleto(motoristaId);
      } else {
        cargarViajesMotorista(motoristaId);
      }
    } else {
      console.log(`⏳ motoristaId no válido: ${motoristaId}`);
      
      if (!motoristaId || motoristaId === 'null' || motoristaId === 'undefined') {
        setLoading(true);
        setError(null);
        console.log('🔄 Esperando motoristaId válido...');
      } else {
        console.log(`ℹ️ Cargando vista administrativa`);
        cargarTodosLosViajes();
      }
    }
  }, [motoristaId, tipoConsulta]);

  // Funciones auxiliares
  const getTripById = (id) => {
    return trips.find(trip => trip.id === id);
  };

  const refrescarViajes = () => {
    console.log(`🔄 Refrescando viajes...`);
    
    if (motoristaId && motoristaId !== 'null' && motoristaId !== 'undefined') {
      if (tipoConsulta === 'historial') {
        cargarHistorialCompleto(motoristaId);
      } else {
        cargarViajesMotorista(motoristaId);
      }
    } else {
      cargarTodosLosViajes();
    }
  };

  const getViajesHoy = () => {
    return trips.filter(trip => trip.fecha === 'Hoy');
  };

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