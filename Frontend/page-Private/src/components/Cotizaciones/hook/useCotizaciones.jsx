// hooks/useCotizaciones.js (o useCotizaciones.jsx)
import { useState, useEffect } from 'react';
import axios from 'axios';

const useCotizaciones = () => {
  // Estados principales
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState({}); // Cache de clientes por ID
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
      await fetchClientes(); // Primero cargar clientes
      await fetchCotizaciones(); // Luego cotizaciones
    };
    
    cargarDatos();
  }, []);

  // Actualizar cotizaciones cuando cambien los clientes
  useEffect(() => {
    if (Object.keys(clientes).length > 0 && cotizaciones.length > 0) {
      actualizarCotizacionesConClientes(clientes);
    }
  }, [clientes]);

  // Función para obtener clientes y crear un cache por ID
  const fetchClientes = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/clientes'); // Ajusta la URL según tu API
      
      // Crear un objeto con los clientes indexados por ID para acceso rápido
      const clientesMap = {};
      response.data.forEach(cliente => {
        clientesMap[cliente._id] = {
          id: cliente._id,
          nombre: `${cliente.firstName || ''} ${cliente.lastName || ''}`.trim() || 'Cliente sin nombre',
          email: cliente.email || 'Sin email',
          telefono: cliente.phone || cliente.telefono || 'Sin teléfono',
          ...cliente
        };
      });
      
      setClientes(clientesMap);
      
      // Re-procesar cotizaciones si ya están cargadas
      if (cotizaciones.length > 0) {
        actualizarCotizacionesConClientes(clientesMap);
      }
    } catch (error) {
      console.error('Error al cargar los clientes:', error);
      // No es crítico si falla, seguimos con los IDs
    }
  };

  // Función para actualizar cotizaciones con información de clientes
  const actualizarCotizacionesConClientes = (clientesMap) => {
    setCotizaciones(prev => prev.map(cotizacion => ({
      ...cotizacion,
      cliente: clientesMap[cotizacion.clientId]?.nombre || `Cliente ID: ${cotizacion.clientId}`,
      clienteCompleto: clientesMap[cotizacion.clientId] || null,
      telefono: clientesMap[cotizacion.clientId]?.telefono || 'Por consultar',
      email: clientesMap[cotizacion.clientId]?.email || 'Por consultar',
    })));
  };

  // Función para obtener cotizaciones (solo GET)
  const fetchCotizaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:4000/api/cotizaciones');
      
      // Mapear los datos del servidor al formato esperado por el frontend
      const cotizacionesFormateadas = response.data.map(cotizacion => ({
        // IDs
        id: cotizacion._id,
        clientId: cotizacion.clientId,
        
        // Información principal de la cotización
        quoteName: cotizacion.quoteName || 'Sin nombre',
        quoteDescription: cotizacion.quoteDescription || 'Sin descripción',
        
        // Información del cliente (obtener nombre real del cache)
        cliente: clientes[cotizacion.clientId]?.nombre || 'Cargando cliente...',
        clienteCompleto: clientes[cotizacion.clientId] || { 
          id: cotizacion.clientId,
          nombre: 'Cargando cliente...',
          email: 'Cargando...',
          telefono: 'Cargando...'
        },
        
        // Información de contacto del cliente
        telefono: clientes[cotizacion.clientId]?.telefono || 'Cargando...',
        email: clientes[cotizacion.clientId]?.email || 'Cargando...',
        
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
        monto: `${cotizacion.price || 0}`,
        price: cotizacion.price || 0,
        costos: cotizacion.costos,
        subtotal: cotizacion.costos ? `${cotizacion.costos.subtotal}` : '$0.00',
        impuestos: cotizacion.costos ? `${cotizacion.costos.impuestos}` : '$0.00',
        total: cotizacion.costos ? `${cotizacion.costos.total}` : '$0.00',
        
        // Información adicional
        paymentMethod: cotizacion.paymentMethod || 'Sin especificar',
        observaciones: cotizacion.observaciones || 'Sin observaciones',
        notasInternas: cotizacion.notasInternas || 'Sin notas',
        
        // Horarios
        horarios: cotizacion.horarios,
        horarioPreferido: cotizacion.horarios?.horarioPreferido 
          ? `${cotizacion.horarios.horarioPreferido.inicio} - ${cotizacion.horarios.horarioPreferido.fin}`
          : 'Sin horario',
        
        // Campos para compatibilidad con el frontend existente
        direccionOrigen: cotizacion.ruta?.origen?.nombre || 'Sin dirección',
        direccionDestino: cotizacion.ruta?.destino?.nombre || 'Sin dirección',
        tipoViaje: cotizacion.carga?.categoria || 'Sin especificar',
        descripcion: cotizacion.quoteDescription || 'Sin descripción',
        tipoVehiculo: cotizacion.truckType || 'Sin especificar',
        conductor: 'Por asignar',
        placaVehiculo: 'Por asignar',
        validez: calcularValidez(cotizacion.validezCotizacion),
        condicionesPago: `Método: ${cotizacion.paymentMethod || 'No especificado'}`,
        
        // Color del estado
        colorEstado: getColorEstado(mapearEstado(cotizacion.status)),
        
        // Mantener datos originales
        ...cotizacion
      }));

      setCotizaciones(cotizacionesFormateadas);
    } catch (error) {
      console.error('Error al cargar las cotizaciones:', error);
      setError('Error al cargar las cotizaciones');
      setCotizaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para mapear el status de la API al estado del frontend
  const mapearEstado = (status) => {
    const mapeoEstados = {
      'pendiente': 'Pendiente',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'ejecutada': 'Aprobada', // Consideramos ejecutada como aprobada
      'en_proceso': 'En Proceso',
      'completada': 'Aprobada'
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
      'En Proceso': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    } catch (error) {
      return '';
    }
  };

  // Iconos de estados
  const estadoIcons = {
    'Aprobada': '✓',
    'Pendiente': '⏳',
    'Rechazada': '✗',
    'En Proceso': '🚛'
  };

  // Función para filtrar cotizaciones con validaciones
  const filteredCotizaciones = cotizaciones.filter(cotizacion => {
    const cumpleFiltro = filtroEstado === 'Todos' || cotizacion.estado === filtroEstado;
    
    // Validar que los campos existan antes de hacer toLowerCase
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

  // Función temporal para eliminar (solo del estado local, sin API)
  const eliminarCotizacion = (cotizacion) => {
    showSweetAlert({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la cotización #${(cotizacion.id || '000').toString().padStart(3, '0')} de ${cotizacion.cliente}? Esta acción no se puede deshacer.`,
      type: 'warning',
      onConfirm: () => {
        // Eliminar solo del estado local (sin llamada a API)
        setCotizaciones(prev => prev.filter(c => (c.id || c._id) !== (cotizacion.id || cotizacion._id)));
        
        // Cerrar el primer alert
        closeSweetAlert();
        
        // Mostrar mensaje de éxito
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

  // Función para volver a la lista
  const volverALista = () => {
    setVistaActual('lista');
    setCotizacionSeleccionada(null);
  };

  // Función para refrescar datos
  const refreshCotizaciones = async () => {
    await fetchClientes(); // Refrescar clientes
    await fetchCotizaciones(); // Refrescar cotizaciones
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
    
    // Acciones de UI
    verDetalleCotizacion,
    volverALista,
    clearSearch,
    showSweetAlert,
    closeSweetAlert,
    eliminarCotizacion, // Solo elimina del estado local
    refreshCotizaciones,
    
    // Setters para filtros
    setFiltroEstado,
    setBusqueda,
    setVistaActual,
    setCotizacionSeleccionada,
    setSweetAlert,
    setCotizaciones,
    
    // Datos computados
    filtrosCotizaciones: filteredCotizaciones, // Alias para compatibilidad
    estadoIcons,
    stats: getStats(),
    
    // Funciones de utilidad
    fetchCotizaciones,
    fetchClientes
  };
};

// IMPORTANTE: Exportación por defecto
export default useCotizaciones;

// También exportación nombrada para compatibilidad
export { useCotizaciones };