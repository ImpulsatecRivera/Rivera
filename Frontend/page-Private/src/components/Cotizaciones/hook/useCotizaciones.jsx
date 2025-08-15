// hooks/useCotizaciones.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useCotizaciones = () => {
  // Estados principales
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState({});
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [vistaActual, setVistaActual] = useState('lista');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros y búsqueda
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para SweetAlert
  const [sweetAlert, setSweetAlert] = useState({
    isOpen: false,
    title: '',
    text: '',
    type: 'warning',
    onConfirm: null
  });

  // Cargar cotizaciones y clientes al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Iniciando carga de clientes...');
        const clientesMap = await fetchClientesSync();
        
        console.log('🔄 Clientes cargados, ahora cargando cotizaciones con clientes:', clientesMap);
        await fetchCotizacionesConClientes(clientesMap);
        
        console.log('✅ Ambos datos cargados exitosamente');
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, []);

  // Función síncrona que devuelve el mapa de clientes
  const fetchClientesSync = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/clientes');
      
      console.log('📦 Respuesta cruda de clientes:', response.data);
      
      const clientesArray = Array.isArray(response.data) ? response.data : 
                           response.data.clientes ? response.data.clientes :
                           response.data.data ? response.data.data : [];
      
      if (!Array.isArray(clientesArray) || clientesArray.length === 0) {
        console.warn('⚠️ No se encontraron clientes o estructura incorrecta');
        return {};
      }
      
      const clientesMap = {};
      clientesArray.forEach((cliente, index) => {
        console.log(`👤 Procesando cliente ${index + 1}:`, cliente);
        
        const firstName = cliente.firtsName || cliente.firstName || cliente.name || cliente.nombre || '';
        const lastName = cliente.lastName || cliente.apellido || '';
        const nombreCompleto = `${firstName} ${lastName}`.trim();
        
        const clienteId = cliente._id || cliente.id;
        console.log(`🔑 ID del cliente: ${clienteId}`);
        
        if (clienteId) {
          clientesMap[clienteId] = {
            id: clienteId,
            nombre: nombreCompleto || 'Cliente sin nombre',
            firstName: firstName,
            lastName: lastName,
            email: cliente.email || 'Sin email',
            telefono: cliente.phone || cliente.telefono || cliente.celular || 'Sin teléfono',
            ...cliente
          };
          
          console.log(`✅ Cliente ${clienteId} agregado al mapa:`, clientesMap[clienteId]);
        }
      });
      
      setClientes(clientesMap);
      console.log('🗂️ Mapa final de clientes:', clientesMap);
      console.log('📊 Total de clientes cargados:', Object.keys(clientesMap).length);
      
      return clientesMap;
    } catch (error) {
      console.error('❌ Error al cargar los clientes:', error);
      setError('Error al cargar los clientes');
      return {};
    }
  };

  // Función que recibe el mapa de clientes como parámetro
  const fetchCotizacionesConClientes = async (clientesMap) => {
    try {
      const response = await axios.get('http://localhost:4000/api/cotizaciones');
      
      console.log('Cotizaciones recibidas de la API:', response.data);
      
      const cotizacionesFormateadas = response.data.map((cotizacion, index) => {
        console.log(`📋 Procesando cotización ${index + 1}:`, cotizacion);
        console.log(`🔗 ClientId de la cotización: "${cotizacion.clientId}"`);
        
        const clienteInfo = clientesMap[cotizacion.clientId] || null;
        console.log(`👤 Información del cliente encontrada:`, clienteInfo);
        
        if (!clienteInfo) {
          console.warn(`⚠️ No se encontró información para clientId: "${cotizacion.clientId}"`);
          console.log('🗂️ Clientes disponibles en el mapa:', Object.keys(clientesMap));
        }
        
        return {
          id: cotizacion._id,
          clientId: cotizacion.clientId,
          quoteName: cotizacion.quoteName || 'Sin nombre de cotización',
          quoteDescription: cotizacion.quoteDescription || 'Sin descripción',
          numeroDetizacion: cotizacion._id ? `#${cotizacion._id.slice(-6).toUpperCase()}` : '#000000',
          
          // Información del cliente
          cliente: clienteInfo ? clienteInfo.nombre : `Cliente ID: ${cotizacion.clientId} no encontrado`,
          clienteCompleto: clienteInfo || { 
            id: cotizacion.clientId,
            nombre: `Cliente ID: ${cotizacion.clientId} no encontrado`,
            email: 'Cliente no encontrado',
            telefono: 'Cliente no encontrado',
            firstName: 'No encontrado',
            lastName: 'No encontrado'
          },
          
          telefono: clienteInfo?.telefono || 'Cliente no encontrado',
          email: clienteInfo?.email || 'Cliente no encontrado',
          clienteFirstName: clienteInfo?.firstName || '',
          clienteLastName: clienteInfo?.lastName || '',
          
          // Información de ruta
          origen: cotizacion.ruta?.origen?.nombre || 'Sin origen',
          destino: cotizacion.ruta?.destino?.nombre || 'Sin destino',
          rutaCompleta: cotizacion.ruta,
          travelLocations: cotizacion.travelLocations || '',
          distanciaTotal: cotizacion.ruta?.distanciaTotal || 0,
          tiempoEstimado: cotizacion.ruta?.tiempoEstimado || 0,
          
          // Información de carga
          carga: cotizacion.carga,
          peso: cotizacion.carga?.peso ? `${cotizacion.carga.peso.valor} ${cotizacion.carga.peso.unidad}` : 'Sin especificar',
          volumen: cotizacion.carga?.volumen ? `${cotizacion.carga.volumen.valor} ${cotizacion.carga.volumen.unidad}` : 'Sin especificar',
          categoria: cotizacion.carga?.categoria || 'Sin categoría',
          descripcionCarga: cotizacion.carga?.descripcion || 'Sin descripción',
          valorDeclarado: cotizacion.carga?.valorDeclarado ? 
            `${cotizacion.carga.valorDeclarado.monto} ${cotizacion.carga.valorDeclarado.moneda}` : 
            'No declarado',
          
          // Fechas
          fecha: formatDate(cotizacion.createdAt),
          fechaCreacion: formatDate(cotizacion.createdAt),
          fechaEnvio: formatDate(cotizacion.fechaEnvio),
          fechaAceptacion: formatDate(cotizacion.fechaAceptacion),
          deliveryDate: formatDate(cotizacion.deliveryDate),
          fechaVencimiento: formatDate(cotizacion.validezCotizacion),
          
          // Estado y tipo
          estado: mapearEstado(cotizacion.status),
          status: cotizacion.status,
          tipo: cotizacion.tipo || 'Sin especificar',
          truckType: cotizacion.truckType || 'Sin especificar',
          
          // Costos
          monto: `$${cotizacion.price || 0}`,
          price: cotizacion.price || 0,
          costos: cotizacion.costos,
          subtotal: cotizacion.costos ? `$${cotizacion.costos.subtotal}` : '$0.00',
          impuestos: cotizacion.costos ? `$${cotizacion.costos.impuestos}` : '$0.00',
          total: cotizacion.costos ? `$${cotizacion.costos.total}` : '$0.00',
          
          // Información adicional
          paymentMethod: cotizacion.paymentMethod || 'Sin especificar',
          observaciones: cotizacion.observaciones || 'Sin observaciones',
          notasInternas: cotizacion.notasInternas || 'Sin notas',
          
          // Horarios
          horarios: cotizacion.horarios,
          horarioPreferido: cotizacion.horarios?.horarioPreferido 
            ? `${cotizacion.horarios.horarioPreferido.inicio} - ${cotizacion.horarios.horarioPreferido.fin}`
            : 'Sin horario',
          fechaSalida: formatDate(cotizacion.horarios?.fechaSalida),
          fechaLlegadaEstimada: formatDate(cotizacion.horarios?.fechaLlegadaEstimada),
          
          // Campos adicionales
          direccionOrigen: cotizacion.ruta?.origen?.nombre || 'Sin dirección',
          direccionDestino: cotizacion.ruta?.destino?.nombre || 'Sin dirección',
          tipoViaje: cotizacion.carga?.categoria || 'Sin especificar',
          descripcion: cotizacion.quoteDescription || 'Sin descripción',
          tipoVehiculo: cotizacion.truckType || 'Sin especificar',
          conductor: 'Por asignar',
          placaVehiculo: 'Por asignar',
          validez: calcularValidez(cotizacion.validezCotizacion),
          condicionesPago: `Método: ${cotizacion.paymentMethod || 'No especificado'}`,
          
          colorEstado: getColorEstado(mapearEstado(cotizacion.status)),
          
          // Condiciones especiales
          condicionesEspeciales: cotizacion.carga?.condicionesEspeciales || {},
          esFragil: cotizacion.carga?.condicionesEspeciales?.esFragil || false,
          requiereRefrigeracion: cotizacion.carga?.condicionesEspeciales?.requiereRefrigeracion || false,
          temperaturaControlada: cotizacion.carga?.condicionesEspeciales?.temperaturaControlada || false,
          
          ...cotizacion
        };
      });

      setCotizaciones(cotizacionesFormateadas);
      console.log('Cotizaciones formateadas:', cotizacionesFormateadas);
    } catch (error) {
      console.error('Error al cargar las cotizaciones:', error);
      setError('Error al cargar las cotizaciones');
      setCotizaciones([]);
    }
  };

  // Función para eliminar cotización con manejo de error 404 mejorado
  const eliminarCotizacionAPI = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🗑️ Intentando eliminar cotización con ID: ${id}`);
      
      const response = await axios.delete(`http://localhost:4000/api/cotizaciones/${id}`);
      
      console.log('✅ Cotización eliminada desde API:', response.data);
      
      // Actualizar estado local solo si la eliminación fue exitosa
      setCotizaciones(prev => prev.filter(c => (c.id || c._id) !== id));
      
      return { success: true, message: 'Cotización eliminada correctamente', fallback: false };
      
    } catch (error) {
      console.error('❌ Error al eliminar la cotización:', error);
      
      let errorMessage = 'Error al eliminar la cotización';
      let useFallback = false;
      
      if (error.response) {
        const status = error.response.status;
        
        console.log(`📊 Status del error: ${status}`);
        console.log(`🔗 URL intentada: ${error.config?.url}`);
        console.log(`📝 Respuesta del servidor:`, error.response.data);
        
        switch (status) {
          case 404:
            errorMessage = 'El endpoint de eliminación no existe en el servidor';
            useFallback = true;
            console.log('💡 Usando eliminación local como fallback');
            break;
          case 405:
            errorMessage = 'Método DELETE no permitido en el servidor';
            useFallback = true;
            console.log('💡 Usando eliminación local como fallback');
            break;
          case 500:
            errorMessage = 'Error interno del servidor al eliminar';
            break;
          default:
            errorMessage = error.response.data?.message || `Error del servidor: ${status}`;
        }
      } else if (error.request) {
        errorMessage = 'Error de conexión: No se pudo conectar con el servidor';
        useFallback = true;
        console.log('💡 Sin conexión, usando eliminación local como fallback');
      }
      
      // Si debemos usar fallback, eliminamos solo localmente
      if (useFallback) {
        console.log('🔄 Ejecutando fallback - eliminando solo de la vista local');
        setCotizaciones(prev => prev.filter(c => (c.id || c._id) !== id));
        
        return { 
          success: true, 
          message: 'Cotización eliminada de la vista (servidor no disponible)', 
          fallback: true 
        };
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage, fallback: false };
      
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar con API mejorada
  const eliminarCotizacionConAPI = (cotizacion) => {
    showSweetAlert({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la cotización "${cotizacion.quoteName}" de ${cotizacion.cliente}?`,
      type: 'warning',
      onConfirm: async () => {
        closeSweetAlert();
        
        // Mostrar loading
        showSweetAlert({
          title: 'Eliminando...',
          text: 'Por favor espera mientras se procesa la eliminación.',
          type: 'info',
          onConfirm: null
        });
        
        const resultado = await eliminarCotizacionAPI(cotizacion.id || cotizacion._id);
        
        closeSweetAlert();
        
        // Mostrar resultado
        setTimeout(() => {
          if (resultado.success) {
            const titulo = resultado.fallback ? '¡Eliminado localmente!' : '¡Eliminado!';
            const mensaje = resultado.fallback 
              ? 'La cotización ha sido eliminada de la vista. El servidor no tiene disponible la eliminación permanente.'
              : 'La cotización ha sido eliminada correctamente del servidor.';
            
            showSweetAlert({
              title: titulo,
              text: mensaje,
              type: 'success',
              onConfirm: closeSweetAlert
            });
          } else {
            showSweetAlert({
              title: 'Error al eliminar',
              text: resultado.message,
              type: 'error',
              onConfirm: closeSweetAlert
            });
          }
        }, 300);
      }
    });
  };

  // Función para obtener todas las cotizaciones
  const fetchCotizaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:4000/api/cotizaciones');
      
      console.log('Cotizaciones recibidas de la API:', response.data);
      
      const cotizacionesFormateadas = response.data.map((cotizacion) => {
        const clienteInfo = clientes[cotizacion.clientId] || null;
        
        return {
          id: cotizacion._id,
          clientId: cotizacion.clientId,
          quoteName: cotizacion.quoteName || 'Sin nombre de cotización',
          quoteDescription: cotizacion.quoteDescription || 'Sin descripción',
          numeroDetizacion: cotizacion._id ? `#${cotizacion._id.slice(-6).toUpperCase()}` : '#000000',
          
          cliente: clienteInfo ? clienteInfo.nombre : `Cliente ID: ${cotizacion.clientId} no encontrado`,
          clienteCompleto: clienteInfo || { 
            id: cotizacion.clientId,
            nombre: `Cliente ID: ${cotizacion.clientId} no encontrado`,
            email: 'Cliente no encontrado',
            telefono: 'Cliente no encontrado'
          },
          
          telefono: clienteInfo?.telefono || 'No encontrado',
          email: clienteInfo?.email || 'No encontrado',
          
          origen: cotizacion.ruta?.origen?.nombre || 'Sin origen',
          destino: cotizacion.ruta?.destino?.nombre || 'Sin destino',
          
          estado: mapearEstado(cotizacion.status),
          status: cotizacion.status,
          
          fecha: formatDate(cotizacion.createdAt),
          fechaCreacion: formatDate(cotizacion.createdAt),
          
          monto: `$${cotizacion.price || 0}`,
          price: cotizacion.price || 0,
          
          colorEstado: getColorEstado(mapearEstado(cotizacion.status)),
          
          ...cotizacion
        };
      });

      setCotizaciones(cotizacionesFormateadas);
      console.log('Cotizaciones formateadas:', cotizacionesFormateadas);
    } catch (error) {
      console.error('Error al cargar las cotizaciones:', error);
      setError('Error al cargar las cotizaciones');
      setCotizaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener una cotización por ID
  const fetchCotizacionById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:4000/api/cotizaciones/${id}`);
      
      console.log('Cotización obtenida por ID:', response.data);
      
      const clienteInfo = clientes[response.data.clientId] || null;
      
      const cotizacionFormateada = {
        id: response.data._id,
        clientId: response.data.clientId,
        quoteName: response.data.quoteName || 'Sin nombre de cotización',
        quoteDescription: response.data.quoteDescription || 'Sin descripción',
        numeroDetizacion: response.data._id ? `#${response.data._id.slice(-6).toUpperCase()}` : '#000000',
        
        cliente: clienteInfo ? clienteInfo.nombre : 'Cliente no encontrado',
        clienteCompleto: clienteInfo || { 
          id: response.data.clientId,
          nombre: 'Cliente no encontrado',
          email: 'No encontrado',
          telefono: 'No encontrado'
        },
        
        telefono: clienteInfo?.telefono || 'No encontrado',
        email: clienteInfo?.email || 'No encontrado',
        
        origen: response.data.ruta?.origen?.nombre || 'Sin origen',
        destino: response.data.ruta?.destino?.nombre || 'Sin destino',
        
        estado: mapearEstado(response.data.status),
        status: response.data.status,
        
        fecha: formatDate(response.data.createdAt),
        fechaCreacion: formatDate(response.data.createdAt),
        
        monto: `$${response.data.price || 0}`,
        price: response.data.price || 0,
        
        colorEstado: getColorEstado(mapearEstado(response.data.status)),
        
        ...response.data
      };
      
      return cotizacionFormateada;
    } catch (error) {
      console.error('Error al obtener la cotización por ID:', error);
      setError('Error al obtener la cotización');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar y seleccionar una cotización por ID
  const cargarCotizacionPorId = async (id) => {
    const cotizacion = await fetchCotizacionById(id);
    if (cotizacion) {
      setCotizacionSeleccionada(cotizacion);
      setVistaActual('detalle');
    }
    return cotizacion;
  };

  // Función para mapear el status de la API al estado del frontend
  const mapearEstado = (status) => {
    const mapeoEstados = {
      'pendiente': 'Pendiente',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'ejecutada': 'Aprobada',
      'en_proceso': 'En Proceso',
      'completada': 'Completada'
    };
    return mapeoEstados[status] || 'Pendiente';
  };

  // Función para calcular validez
  const calcularValidez = (validezCotizacion) => {
    if (!validezCotizacion) return 'Sin fecha de vencimiento';
    
    const fechaVencimiento = new Date(validezCotizacion);
    const ahora = new Date();
    const diferenciaDias = Math.ceil((fechaVencimiento - ahora) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias < 0) return 'Vencida';
    if (diferenciaDias === 0) return 'Vence hoy';
    if (diferenciaDias === 1) return 'Vence mañana';
    return `${diferenciaDias} días restantes`;
  };

  // Función para obtener el color del estado
  const getColorEstado = (estado) => {
    const colores = {
      'Aprobada': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Pendiente': 'bg-amber-100 text-amber-800 border-amber-200',
      'Rechazada': 'bg-red-100 text-red-800 border-red-200',
      'En Proceso': 'bg-blue-100 text-blue-800 border-blue-200',
      'Completada': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  // Iconos de estados
  const estadoIcons = {
    'Aprobada': '✓',
    'Pendiente': '⏳',
    'Rechazada': '✗',
    'En Proceso': '🚛',
    'Completada': '🏁'
  };

  // Función para filtrar cotizaciones
  const filteredCotizaciones = cotizaciones.filter(cotizacion => {
    const cumpleFiltro = filtroEstado === 'Todos' || cotizacion.estado === filtroEstado;
    
    const cliente = (cotizacion.cliente || '').toString();
    const quoteName = (cotizacion.quoteName || '').toString();
    const origen = (cotizacion.origen || '').toString();
    const destino = (cotizacion.destino || '').toString();
    const email = (cotizacion.email || '').toString();
    const telefono = (cotizacion.telefono || '').toString();
    const busquedaLower = (busqueda || '').toLowerCase();
    
    const cumpleBusqueda = busqueda === '' || 
      cliente.toLowerCase().includes(busquedaLower) ||
      quoteName.toLowerCase().includes(busquedaLower) ||
      origen.toLowerCase().includes(busquedaLower) ||
      destino.toLowerCase().includes(busquedaLower) ||
      email.toLowerCase().includes(busquedaLower) ||
      telefono.toLowerCase().includes(busquedaLower);
    
    return cumpleFiltro && cumpleBusqueda;
  });

  // Funciones para manejar SweetAlert
  const showSweetAlert = (config) => {
    setSweetAlert({
      isOpen: true,
      ...config
    });
  };

  const closeSweetAlert = () => {
    setSweetAlert({
      isOpen: false,
      title: '',
      text: '',
      type: 'warning',
      onConfirm: null
    });
  };

  // Función para eliminar (solo local)
  const eliminarCotizacion = (cotizacion) => {
    showSweetAlert({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la cotización "${cotizacion.quoteName}" de ${cotizacion.cliente}? Esta acción no se puede deshacer.`,
      type: 'warning',
      onConfirm: () => {
        setCotizaciones(prev => prev.filter(c => (c.id || c._id) !== (cotizacion.id || cotizacion._id)));
        
        closeSweetAlert();
        
        setTimeout(() => {
          showSweetAlert({
            title: '¡Eliminado!',
            text: 'La cotización ha sido eliminada correctamente.',
            type: 'success',
            onConfirm: closeSweetAlert
          });
        }, 300);
      }
    });
  };

  // Función para ver detalle
  const verDetalleCotizacion = (cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setVistaActual('detalle');
  };

  // Función para ver detalle por ID
  const verDetallePorId = async (id) => {
    const cotizacion = await cargarCotizacionPorId(id);
    return cotizacion;
  };

  // Función para volver a la lista
  const volverALista = () => {
    setVistaActual('lista');
    setCotizacionSeleccionada(null);
  };

  // Función para refrescar datos
  const refreshCotizaciones = async () => {
    const clientesMap = await fetchClientesSync();
    await fetchCotizacionesConClientes(clientesMap);
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setBusqueda('');
  };

  // Función para obtener estadísticas
  const getStats = () => {
    return {
      total: cotizaciones.length,
      filtered: filteredCotizaciones.length,
      aprobadas: cotizaciones.filter(c => c.estado === 'Aprobada').length,
      pendientes: cotizaciones.filter(c => c.estado === 'Pendiente').length,
      rechazadas: cotizaciones.filter(c => c.estado === 'Rechazada').length,
      enProceso: cotizaciones.filter(c => c.estado === 'En Proceso').length,
      completadas: cotizaciones.filter(c => c.estado === 'Completada').length,
      hasResults: filteredCotizaciones.length > 0
    };
  };

  return {
    // Estados
    cotizaciones: filteredCotizaciones,
    cotizacionSeleccionada,
    vistaActual,
    loading,
    error,
    filtroEstado,
    busqueda,
    sweetAlert,
    clientes,
    
    // Acciones
    verDetalleCotizacion,
    verDetallePorId,
    cargarCotizacionPorId,
    volverALista,
    clearSearch,
    showSweetAlert,
    closeSweetAlert,
    eliminarCotizacion,
    eliminarCotizacionConAPI,
    eliminarCotizacionAPI,
    refreshCotizaciones,
    
    // Setters
    setFiltroEstado,
    setBusqueda,
    setVistaActual,
    setCotizacionSeleccionada,
    setSweetAlert,
    setCotizaciones,
    
    // Datos computados
    filtrosCotizaciones: filteredCotizaciones,
    estadoIcons,
    stats: getStats(),
    
    // Funciones de utilidad
    fetchCotizaciones,
    fetchCotizacionById,
    mapearEstado,
    calcularValidez,
    getColorEstado,
    formatDate
  };
};

export default useCotizaciones;
export { useCotizaciones };