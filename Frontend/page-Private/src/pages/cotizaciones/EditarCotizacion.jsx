import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, User, Calendar, MapPin, Truck, CreditCard, Save, DollarSign, Package, Clock } from 'lucide-react';
import { useCotizaciones } from '../../components/Cotizaciones/hook/useCotizaciones'; // Ajusta la ruta según tu estructura

export default function EditarCotizacionForm({ cotizacionId, cotizacion: cotizacionProp, onVolver }) {
  const {
    cotizaciones,
    actualizarCotizacionAPI,
    actualizarEstadoCotizacion,
    actualizarPrecioCotizacion,
    loading,
    error,
    showSweetAlert,
    closeSweetAlert
  } = useCotizaciones();

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Información del cliente
    cliente: '',
    apellido: '',
    email: '',
    telefono: '',
    
    // Información de la cotización
    quoteName: '',
    quoteDescription: '',
    metodoPago: '',
    fechaEntrega: '',
    lugarOrigen: '',
    lugarDestino: '',
    tipoCamion: '',
    
    // Costos
    price: 0,
    combustible: 0,
    peajes: 0,
    conductor: 0,
    otros: 0,
    impuestos: 0,
    
    // Estado
    status: 'pendiente'
  });

  const [cotizacionActual, setCotizacionActual] = useState(cotizacionProp || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loadingCotizacion, setLoadingCotizacion] = useState(false);

  // Buscar cotización por ID cuando se proporciona
  useEffect(() => {
    console.log('🔍 Debug - useEffect ejecutado:', { 
      cotizacionId, 
      cotizacionProp: !!cotizacionProp,
      cantidadCotizaciones: cotizaciones.length,
      loading
    });

    // Si ya tenemos la cotización como prop, usarla directamente
    if (cotizacionProp) {
      console.log('📋 Usando cotización proporcionada como prop');
      setCotizacionActual(cotizacionProp);
      cargarDatosFormulario(cotizacionProp);
      return;
    }

    // Si tenemos ID y cotizaciones están cargadas, buscar por ID
    if (cotizacionId && cotizaciones.length > 0 && !loading) {
      console.log('🔍 Buscando cotización por ID:', cotizacionId);
      setLoadingCotizacion(true);
      
      const cotizacion = cotizaciones.find(c => {
        const currentId = c.id || c._id;
        console.log('🔍 Comparando:', currentId, 'con', cotizacionId);
        return currentId === cotizacionId;
      });
      
      if (cotizacion) {
        console.log('✅ Cotización encontrada:', cotizacion);
        setCotizacionActual(cotizacion);
        cargarDatosFormulario(cotizacion);
      } else {
        console.error('❌ No se encontró cotización con ID:', cotizacionId);
        console.log('📋 IDs disponibles:', cotizaciones.map(c => c.id || c._id));
      }
      
      setLoadingCotizacion(false);
    }
  }, [cotizacionId, cotizacionProp, cotizaciones, loading]);

  const cargarDatosFormulario = (cotizacion) => {
    console.log('📝 Cargando datos al formulario:', cotizacion);
    
    setFormData({
      // Información del cliente
      cliente: cotizacion.clienteFirstName || cotizacion.cliente?.split(' ')[0] || '',
      apellido: cotizacion.clienteLastName || cotizacion.cliente?.split(' ').slice(1).join(' ') || '',
      email: cotizacion.email || '',
      telefono: cotizacion.telefono || '',
      
      // Información de la cotización
      quoteName: cotizacion.quoteName || '',
      quoteDescription: cotizacion.quoteDescription || cotizacion.descripcion || '',
      metodoPago: cotizacion.paymentMethod || '',
      fechaEntrega: cotizacion.deliveryDate ? cotizacion.deliveryDate.split('T')[0] : '',
      lugarOrigen: cotizacion.origen || '',
      lugarDestino: cotizacion.destino || '',
      tipoCamion: cotizacion.truckType || cotizacion.tipoVehiculo || '',
      
      // Costos
      price: cotizacion.price || 0,
      combustible: cotizacion.costos?.combustible || 0,
      peajes: cotizacion.costos?.peajes || 0,
      conductor: cotizacion.costos?.conductor || 0,
      otros: cotizacion.costos?.otros || 0,
      impuestos: cotizacion.costos?.impuestos || 0,
      
      // Estado
      status: cotizacion.status || 'pendiente'
    });
    
    console.log('✅ Datos cargados en el formulario');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const calcularTotal = () => {
    const subtotal = Number(formData.combustible) + Number(formData.peajes) + Number(formData.conductor) + Number(formData.otros);
    const total = subtotal + Number(formData.impuestos);
    return { subtotal, total };
  };

  const handleGuardarBorrador = async () => {
    if (!cotizacionActual) return;

    setIsSubmitting(true);
    
    try {
      const { subtotal, total } = calcularTotal();
      
      const datosActualizacion = {
        quoteName: formData.quoteName,
        quoteDescription: formData.quoteDescription,
        deliveryDate: formData.fechaEntrega,
        paymentMethod: formData.metodoPago,
        truckType: formData.tipoCamion,
        price: Number(formData.price),
        costos: {
          combustible: Number(formData.combustible),
          peajes: Number(formData.peajes),
          conductor: Number(formData.conductor),
          otros: Number(formData.otros),
          impuestos: Number(formData.impuestos),
          subtotal: subtotal,
          total: total,
          moneda: cotizacionActual.costos?.moneda || 'USD'
        }
      };

      const resultado = await actualizarCotizacionAPI(cotizacionActual.id || cotizacionActual._id, datosActualizacion);
      
      if (resultado.success) {
        setHasChanges(false);
        showSweetAlert({
          title: '¡Guardado!',
          text: 'Los cambios han sido guardados como borrador.',
          type: 'success',
          onConfirm: closeSweetAlert
        });
      } else {
        showSweetAlert({
          title: 'Error',
          text: resultado.message,
          type: 'error',
          onConfirm: closeSweetAlert
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      showSweetAlert({
        title: 'Error',
        text: 'Ocurrió un error al guardar los cambios.',
        type: 'error',
        onConfirm: closeSweetAlert
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnviarCotizacion = () => {
    if (!cotizacionActual) return;

    showSweetAlert({
      title: '¿Enviar cotización?',
      text: '¿Estás seguro de que deseas enviar esta cotización al cliente?',
      type: 'warning',
      onConfirm: async () => {
        closeSweetAlert();
        
        // Primero guardar cambios si los hay
        if (hasChanges) {
          await handleGuardarBorrador();
        }
        
        // Luego cambiar estado a enviada
        actualizarEstadoCotizacion(cotizacionActual, 'enviada');
      }
    });
  };

  const handleCambiarEstado = (nuevoEstado) => {
    if (!cotizacionActual) return;
    actualizarEstadoCotizacion(cotizacionActual, nuevoEstado);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': 'bg-orange-100 text-orange-600 border-orange-200',
      'enviada': 'bg-blue-100 text-blue-600 border-blue-200',
      'aceptada': 'bg-green-100 text-green-600 border-green-200',
      'rechazada': 'bg-red-100 text-red-600 border-red-200',
      'ejecutada': 'bg-purple-100 text-purple-600 border-purple-200',
      'cancelada': 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return colores[estado] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'pendiente': 'Pendiente',
      'enviada': 'Enviada',
      'aceptada': 'Aceptada',
      'rechazada': 'Rechazada',
      'ejecutada': 'Ejecutada',
      'cancelada': 'Cancelada'
    };
    return textos[estado] || 'Desconocido';
  };

  // Estados de carga y error específicos
  if (loading || loadingCotizacion) {
    return (
      <div className="min-h-screen bg-gray-800 p-6 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>{loading ? 'Cargando datos...' : 'Buscando cotización...'}</p>
          {cotizacionId && <p className="text-sm text-gray-400 mt-2">ID: {cotizacionId}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-800 p-6 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ Error</div>
          <p className="mb-4">{error}</p>
          <button 
            onClick={onVolver}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!cotizacionId && !cotizacionProp) {
    return (
      <div className="min-h-screen bg-gray-800 p-6 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-yellow-400 text-xl mb-4">⚠️ Advertencia</div>
          <p className="mb-4">No se proporcionó cotización para editar</p>
          <div className="mb-4 text-sm text-gray-400">
            <p>📋 Cotizaciones disponibles para editar:</p>
            {cotizaciones.map((cot, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded my-2 text-left">
                <p className="font-mono text-xs text-yellow-300">ID: {cot.id || cot._id}</p>
                <p className="text-white">{cot.quoteName}</p>
                <p className="text-gray-300 text-sm">{cot.cliente}</p>
                <button 
                  onClick={() => window.location.href = `#editar-${cot.id || cot._id}`}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  ✏️ Editar esta
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={onVolver}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  if (cotizacionId && cotizaciones.length > 0 && !cotizacionActual) {
    return (
      <div className="min-h-screen bg-gray-800 p-6 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-red-400 text-xl mb-4">❌ No encontrada</div>
          <p className="mb-2">No se encontró la cotización con ID:</p>
          <code className="bg-gray-700 px-3 py-2 rounded block mb-4 text-yellow-300">{cotizacionId}</code>
          
          <div className="mb-4 text-sm text-gray-400">
            <p>🔍 IDs disponibles:</p>
            {cotizaciones.map((cot, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded my-1">
                <code className="text-yellow-300">{cot.id || cot._id}</code>
                <span className="ml-2">- {cot.quoteName}</span>
              </div>
            ))}
          </div>
          
          <button 
            onClick={onVolver}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  if (!cotizacionActual) {
    return (
      <div className="min-h-screen bg-gray-800 p-6 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Esperando datos de la cotización...</p>
        </div>
      </div>
    );
  }

  const { subtotal, total } = calcularTotal();

  return (
    <div className="min-h-screen bg-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={onVolver}>
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-lg font-medium text-white">Editar Cotización</span>
        </div>
        
        {hasChanges && (
          <div className="bg-yellow-500 text-black px-4 py-2 rounded-md text-sm font-medium">
            Tienes cambios sin guardar
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-8xl mx-auto" style={{minHeight: '90vh'}}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {cotizacionActual.numeroDetizacion || 'Cotización'}
              </h1>
              <p className="text-sm text-gray-500">Sistema de gestión - Rivera</p>
            </div>
          </div>
          
          {/* Estado actual */}
          <div className="text-right">
            <span className="text-sm font-medium text-gray-600 block mb-2">ESTADO ACTUAL</span>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getEstadoColor(formData.status)}`}>
              <div className="w-2 h-2 bg-current rounded-full"></div>
              <span className="font-medium">{getEstadoTexto(formData.status)}</span>
            </div>
          </div>
        </div>

        {/* Client Information Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4" defaultChecked />
            <label className="font-bold text-gray-700 text-lg">INFORMACIÓN DEL CLIENTE</label>
          </div>
          
          <div className="space-y-6">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => handleInputChange('cliente', e.target.value)}
                    placeholder="Nombre del cliente"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                  placeholder="Apellido"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Correo electrónico"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="Número de teléfono"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de pago
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.metodoPago}
                    onChange={(e) => handleInputChange('metodoPago', e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar método</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="credito">Crédito</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de entrega
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cotización Information Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4" defaultChecked />
            <label className="font-bold text-gray-700 text-lg">INFORMACIÓN DE LA COTIZACIÓN</label>
          </div>
          
          <div className="space-y-6">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la cotización
                </label>
                <input
                  type="text"
                  value={formData.quoteName}
                  onChange={(e) => handleInputChange('quoteName', e.target.value)}
                  placeholder="Nombre descriptivo"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de camión
                </label>
                <div className="relative">
                  <Truck className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.tipoCamion}
                    onChange={(e) => handleInputChange('tipoCamion', e.target.value)}
                    placeholder="Tipo de camión"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lugar de origen
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lugarOrigen}
                    onChange={(e) => handleInputChange('lugarOrigen', e.target.value)}
                    placeholder="Lugar de origen"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lugar de destino
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lugarDestino}
                    onChange={(e) => handleInputChange('lugarDestino', e.target.value)}
                    placeholder="Lugar de destino"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del servicio
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={formData.quoteDescription}
                  onChange={(e) => handleInputChange('quoteDescription', e.target.value)}
                  placeholder="Descripción detallada del servicio"
                  rows={3}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Costos Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4" defaultChecked />
            <label className="font-bold text-gray-700 text-lg">COSTOS Y PRECIOS</label>
          </div>
          
          <div className="space-y-6">
            {/* Precio principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio principal
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Desglose de costos */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4">Desglose de costos</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Combustible
                  </label>
                  <input
                    type="number"
                    value={formData.combustible}
                    onChange={(e) => handleInputChange('combustible', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peajes
                  </label>
                  <input
                    type="number"
                    value={formData.peajes}
                    onChange={(e) => handleInputChange('peajes', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conductor
                  </label>
                  <input
                    type="number"
                    value={formData.conductor}
                    onChange={(e) => handleInputChange('conductor', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Otros gastos
                  </label>
                  <input
                    type="number"
                    value={formData.otros}
                    onChange={(e) => handleInputChange('otros', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impuestos
                  </label>
                  <input
                    type="number"
                    value={formData.impuestos}
                    onChange={(e) => handleInputChange('impuestos', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Totales */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                  <span className="text-sm font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">Total:</span>
                  <span className="text-lg font-bold text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4" defaultChecked />
            <label className="font-bold text-gray-700 text-lg">ACCIONES DE ESTADO</label>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {formData.status === 'pendiente' && (
              <button
                onClick={() => handleCambiarEstado('enviada')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Marcar como Enviada
              </button>
            )}
            
            {formData.status === 'enviada' && (
              <>
                <button
                  onClick={() => handleCambiarEstado('aceptada')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  Marcar como Aceptada
                </button>
                <button
                  onClick={() => handleCambiarEstado('rechazada')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Marcar como Rechazada
                </button>
              </>
            )}
            
            {formData.status === 'aceptada' && (
              <button
                onClick={() => handleCambiarEstado('ejecutada')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                Marcar como Ejecutada
              </button>
            )}
            
            {formData.status !== 'cancelada' && formData.status !== 'ejecutada' && (
              <button
                onClick={() => handleCambiarEstado('cancelada')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button 
            onClick={handleGuardarBorrador}
            disabled={isSubmitting || !hasChanges}
            className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
          
          {formData.status === 'pendiente' && (
            <button 
              onClick={handleEnviarCotizacion}
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar cotización
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 