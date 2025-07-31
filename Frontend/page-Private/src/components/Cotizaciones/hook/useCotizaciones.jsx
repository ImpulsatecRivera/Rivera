// hooks/useCotizaciones.js (o useCotizaciones.jsx)
import { useState } from 'react';

const useCotizaciones = () => {
  // Estados principales
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [vistaActual, setVistaActual] = useState('lista');
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  
  // Estados para SweetAlert
  const [sweetAlert, setSweetAlert] = useState({
    isOpen: false,
    title: '',
    text: '',
    type: 'warning',
    onConfirm: null
  });

  // Datos de cotizaciones
  const [cotizaciones, setCotizaciones] = useState([
    {
      id: 1,
      cliente: 'Wilfrido Granados',
      telefono: '+503 7845-2134',
      email: 'wilfrido.granados@email.com',
      destino: 'Morazán, Chalatenango',
      direccionOrigen: 'San Salvador, Centro Histórico, Calle Arce #234',
      direccionDestino: 'Morazán, Chalatenango, Barrio San Antonio #567',
      estado: 'Aprobada',
      colorEstado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fecha: '2024-07-08',
      fechaCreacion: '2024-07-05',
      fechaVencimiento: '2024-07-15',
      monto: '$1,250.00',
      montoBase: '$1,100.00',
      impuestos: '$150.00',
      tipoViaje: 'Carga pesada',
      descripcion: 'Transporte de maquinaria industrial pesada desde San Salvador hacia Morazán. Incluye grúa especializada y escolta de seguridad.',
      peso: '2,500 kg',
      volumen: '15 m³',
      tipoVehiculo: 'Camión de carga pesada',
      conductor: 'Mario Hernández',
      placaVehiculo: 'P-123456',
      observaciones: 'Requiere permisos especiales para transporte de maquinaria pesada. Coordinación con autoridades locales.',
      validez: '15 días',
      condicionesPago: 'Pago 50% al inicio, 50% al completar el servicio'
    },
    {
      id: 2,
      cliente: 'María José Rivera',
      telefono: '+503 6789-4321',
      email: 'maria.rivera@email.com',
      destino: 'San Miguel, Usulután',
      direccionOrigen: 'San Salvador, Colonia Escalón, Paseo Escalón #890',
      direccionDestino: 'San Miguel, Usulután, Colonia Centro #123',
      estado: 'Pendiente',
      colorEstado: 'bg-amber-100 text-amber-800 border-amber-200',
      fecha: '2024-07-09',
      fechaCreacion: '2024-07-08',
      fechaVencimiento: '2024-07-20',
      monto: '$850.00',
      montoBase: '$750.00',
      impuestos: '$100.00',
      tipoViaje: 'Mudanza',
      descripcion: 'Servicio completo de mudanza residencial. Incluye embalaje, carga, transporte y descarga de mobiliario.',
      peso: '1,200 kg',
      volumen: '8 m³',
      tipoVehiculo: 'Camión de mudanza',
      conductor: 'Por asignar',
      placaVehiculo: 'Por asignar',
      observaciones: 'Cliente requiere servicio de embalaje profesional. Mudanza programada para fin de semana.',
      validez: '10 días',
      condicionesPago: 'Pago completo al finalizar el servicio'
    },
    {
      id: 3,
      cliente: 'Carlos Mendoza',
      telefono: '+503 2345-6789',
      email: 'carlos.mendoza@email.com',
      destino: 'La Unión, Conchagua',
      direccionOrigen: 'San Salvador, Soyapango, Avenida Central #456',
      direccionDestino: 'La Unión, Conchagua, Puerto de La Unión #789',
      estado: 'Rechazada',
      colorEstado: 'bg-red-100 text-red-800 border-red-200',
      fecha: '2024-07-07',
      fechaCreacion: '2024-07-04',
      fechaVencimiento: '2024-07-18',
      monto: '$2,100.00',
      montoBase: '$1,900.00',
      impuestos: '$200.00',
      tipoViaje: 'Materiales',
      descripcion: 'Transporte de materiales de construcción (cemento, varillas, blocks) hacia proyecto portuario.',
      peso: '3,800 kg',
      volumen: '20 m³',
      tipoVehiculo: 'Camión de carga',
      conductor: 'No asignado',
      placaVehiculo: 'No asignado',
      observaciones: 'Cotización rechazada por no cumplir con las especificaciones técnicas requeridas. Cliente solicitó modificaciones.',
      validez: '7 días',
      condicionesPago: 'Pago 30% adelanto, 70% contraentrega'
    }
  ]);

  // Iconos de estados
  const estadoIcons = {
    'Aprobada': '✓',
    'Pendiente': '⏳',
    'Rechazada': '✗',
    'En Proceso': '🚛'
  };

  // Función para filtrar cotizaciones
  const filtrosCotizaciones = cotizaciones.filter(cotizacion => {
    const cumpleFiltro = filtroEstado === 'Todos' || cotizacion.estado === filtroEstado;
    const cumpleBusqueda = cotizacion.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
                          cotizacion.destino.toLowerCase().includes(busqueda.toLowerCase());
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

  // Función para eliminar cotización
  const eliminarCotizacion = (cotizacion) => {
    showSweetAlert({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la cotización #${cotizacion.id.toString().padStart(3, '0')} de ${cotizacion.cliente}? Esta acción no se puede deshacer.`,
      type: 'warning',
      onConfirm: () => {
        // Eliminar la cotización del estado
        setCotizaciones(prev => prev.filter(c => c.id !== cotizacion.id));
        
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

  return {
    // Estados
    filtroEstado,
    setFiltroEstado,
    busqueda,
    setBusqueda,
    vistaActual,
    setVistaActual,
    cotizacionSeleccionada,
    setCotizacionSeleccionada,
    sweetAlert,
    setSweetAlert,
    cotizaciones,
    setCotizaciones,
    
    // Datos computados
    filtrosCotizaciones,
    estadoIcons,
    
    // Funciones
    showSweetAlert,
    closeSweetAlert,
    eliminarCotizacion,
    verDetalleCotizacion,
    volverALista
  };
};

// IMPORTANTE: Exportación por defecto
export default useCotizaciones;

// También exportación nombrada para compatibilidad
export { useCotizaciones };