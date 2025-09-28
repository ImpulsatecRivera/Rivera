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

  // Estados del formulario - SOLO CAMPOS DE DINERO
  const [formData, setFormData] = useState({
    // Costos (EDITABLES) - Usar strings para permitir edición completa
    price: '',
    combustible: '',
    peajes: '',
    conductor: '',
    otros: '',
    impuestos: '',
    
    // Solo para mostrar (NO EDITABLES)
    cliente: '',
    apellido: '',
    email: '',
    telefono: '',
    quoteName: '',
    quoteDescription: '',
    metodoPago: '',
    fechaEntrega: '',
    lugarOrigen: '',
    lugarDestino: '',
    tipoCamion: '',
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
      // Costos (EDITABLES) - Convertir a string para que sean editables
      price: String(cotizacion.price || ''),
      combustible: String(cotizacion.costos?.combustible || ''),
      peajes: String(cotizacion.costos?.peajes || ''),
      conductor: String(cotizacion.costos?.conductor || ''),
      otros: String(cotizacion.costos?.otros || ''),
      impuestos: String(cotizacion.costos?.impuestos || ''),
      
      // Solo para mostrar (NO EDITABLES)
      cliente: cotizacion.clienteFirstName || cotizacion.cliente?.split(' ')[0] || '',
      apellido: cotizacion.clienteLastName || cotizacion.cliente?.split(' ').slice(1).join(' ') || '',
      email: cotizacion.email || '',
      telefono: cotizacion.telefono || '',
      quoteName: cotizacion.quoteName || '',
      quoteDescription: cotizacion.quoteDescription || cotizacion.descripcion || '',
      metodoPago: cotizacion.paymentMethod || '',
      fechaEntrega: cotizacion.deliveryDate ? cotizacion.deliveryDate.split('T')[0] : '',
      lugarOrigen: cotizacion.origen || '',
      lugarDestino: cotizacion.destino || '',
      tipoCamion: cotizacion.truckType || cotizacion.tipoVehiculo || '',
      status: cotizacion.status || 'pendiente'
    });
    
    console.log('✅ Datos cargados en el formulario');
  };

  // FUNCIÓN SIMPLIFICADA para manejar cambios en inputs
  const handleInputChange = (field, value) => {
    console.log(`🔄 Cambiando ${field} a:`, value);
    
    setFormData(prevData => {
      const newData = { ...prevData, [field]: value };
      console.log(`✅ Nuevo estado:`, newData);
      return newData;
    });
    
    setHasChanges(true);
  };

  const calcularTotal = () => {
    // Convertir valores a números, usando 0 como fallback para strings vacíos
    const combustible = parseFloat(formData.combustible) || 0;
    const peajes = parseFloat(formData.peajes) || 0;
    const conductor = parseFloat(formData.conductor) || 0;
    const otros = parseFloat(formData.otros) || 0;
    const impuestos = parseFloat(formData.impuestos) || 0;
    
    const subtotal = combustible + peajes + conductor + otros;
    const total = subtotal + impuestos;
    
    console.log('💰 Cálculo de totales:', {
      combustible,
      peajes,
      conductor,
      otros,
      impuestos,
      subtotal,
      total
    });
    
    return { subtotal, total };
  };

  const handleGuardarBorrador = async () => {
    if (!cotizacionActual) return;

    setIsSubmitting(true);
    
    try {
      const { subtotal, total } = calcularTotal();
      
      // SOLO enviar campos de costos
      const datosActualizacion = {
        price: Number(formData.price) || 0,
        costos: {
          combustible: Number(formData.combustible) || 0,
          peajes: Number(formData.peajes) || 0,
          conductor: Number(formData.conductor) || 0,
          otros: Number(formData.otros) || 0,
          impuestos: Number(formData.impuestos) || 0,
          subtotal: subtotal,
          total: total,
          moneda: cotizacionActual.costos?.moneda || 'USD'
        }
      };

      console.log('💾 Guardando datos:', datosActualizacion);

      const resultado = await actualizarCotizacionAPI(cotizacionActual.id || cotizacionActual._id, datosActualizacion);
      
      if (resultado.success) {
        setHasChanges(false);
        showSweetAlert({
          title: '¡Guardado!',
          text: 'Los costos han sido actualizados correctamente.',
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
          <span className="text-lg font-medium text-white">Editar Costos de Cotización</span>
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
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Editar Costos - {cotizacionActual.numeroDetizacion || 'Cotización'}
              </h1>
              <p className="text-sm text-gray-500">Solo puedes modificar precios y costos</p>
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

        {/* Client Information Section - SOLO LECTURA */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4" checked readOnly />
            <label className="font-bold text-gray-700 text-lg">INFORMACIÓN DEL CLIENTE (Solo lectura)</label>
          </div>
          
          <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
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
                    readOnly
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
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
                  readOnly
                  className="w-full px-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
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
                  readOnly
                  className="w-full px-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de pago
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.metodoPago}
                    readOnly
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
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
                    readOnly
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cotización Information Section - SOLO LECTURA */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4" checked readOnly />
            <label className="font-bold text-gray-700 text-lg">INFORMACIÓN DE LA COTIZACIÓN (Solo lectura)</label>
          </div>
          
          <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la cotización
                </label>
                <input
                  type="text"
                  value={formData.quoteName}
                  readOnly
                  className="w-full px-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
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
                    readOnly
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
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
                    readOnly
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
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
                    readOnly
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
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
                  readOnly
                  rows={3}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Costos Section - EDITABLE */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4" checked readOnly />
            <label className="font-bold text-gray-700 text-lg">💰 COSTOS Y PRECIOS (Editable)</label>
          </div>
          
          <div className="space-y-6 border-2 border-green-200 bg-green-50 p-6 rounded-lg">
            {/* Precio principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💲 Precio principal
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-green-600" />
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-3 border-2 border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Desglose de costos */}
            <div className="bg-white p-6 rounded-lg border-2 border-green-300">
              <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-green-600" />
                Desglose de costos
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ⛽ Combustible
                  </label>
                  <input
                    type="text"
                    value={formData.combustible}
                    onChange={(e) => handleInputChange('combustible', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border-2 border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🛣️ Peajes
                  </label>
                  <input
                    type="text"
                    value={formData.peajes}
                    onChange={(e) => handleInputChange('peajes', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border-2 border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👨‍💼 Conductor
                  </label>
                  <input
                    type="text"
                    value={formData.conductor}
                    onChange={(e) => handleInputChange('conductor', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border-2 border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📋 Otros gastos
                  </label>
                  <input
                    type="text"
                    value={formData.otros}
                    onChange={(e) => handleInputChange('otros', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border-2 border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏛️ Impuestos
                  </label>
                  <input
                    type="text"
                    value={formData.impuestos}
                    onChange={(e) => handleInputChange('impuestos', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border-2 border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Totales */}
              <div className="mt-6 pt-4 border-t-2 border-green-200 bg-green-50 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                  <span className="text-sm font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">Total:</span>
                  <span className="text-xl font-bold text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4" checked readOnly />
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
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Guardando costos...' : 'Guardar cambios de costos'}
          </button>
        </div>

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-xl">ℹ️</div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Información importante</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Solo puedes editar los campos relacionados con dinero (precios y costos)</li>
                <li>• Los datos del cliente y la información de la cotización son de solo lectura</li>
                <li>• Los totales se calculan automáticamente basándose en los costos que ingreses</li>
                <li>• Para cambiar otros datos, contacta al administrador del sistema</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Debug info - remover en producción */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">🐛 Debug Info (solo desarrollo)</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify({
                price: formData.price,
                combustible: formData.combustible,
                peajes: formData.peajes,
                conductor: formData.conductor,
                otros: formData.otros,
                impuestos: formData.impuestos,
                hasChanges
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}