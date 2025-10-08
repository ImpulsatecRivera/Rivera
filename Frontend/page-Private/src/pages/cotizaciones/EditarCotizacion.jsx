import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
import { useCotizaciones } from '../../components/Cotizaciones/hook/useCotizaciones'; // Ajusta la ruta según tu estructura

export default function EditarCotizacionForm({ cotizacionId, cotizacion: cotizacionProp, onVolver }) {
  // Tu hook original
  const {
    cotizaciones,
    actualizarCotizacionAPI,
    actualizarEstadoCotizacion,
    loading: hookLoading,
    error,
    showSweetAlert,
    closeSweetAlert
  } = useCotizaciones();

  // ✅ SOLUCIÓN: useRef para evitar múltiples cargas
  const yaCargoRef = useRef(false);

  // Estado simple y directo - SIN convertir a String
  const [precios, setPrecios] = useState({
    price: '',
    combustible: '',
    peajes: '',
    conductor: '',
    otros: '',
    impuestos: ''
  });

  const [datosOriginales, setDatosOriginales] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Función para cargar precios desde una cotización
  const cargarPrecios = (cotizacion) => {
    console.log('📝 Cargando precios desde cotización:', cotizacion);
    
    const nuevosPrecios = {
      price: cotizacion.price?.toString() || '',
      combustible: cotizacion.costos?.combustible?.toString() || '',
      peajes: cotizacion.costos?.peajes?.toString() || '',
      conductor: cotizacion.costos?.conductor?.toString() || '',
      otros: cotizacion.costos?.otros?.toString() || '',
      impuestos: cotizacion.costos?.impuestos?.toString() || ''
    };
    
    setPrecios(nuevosPrecios);
    console.log('✅ Precios cargados:', nuevosPrecios);
  };

  // ✅ CORREGIDO: Cargar datos iniciales CON useRef para evitar re-cargas
  useEffect(() => {
    // Si ya cargamos una vez, no volver a cargar
    if (yaCargoRef.current) return;
    
    console.log('🔍 useEffect ejecutado:', { 
      cotizacionId, 
      cotizacionProp: !!cotizacionProp,
      cantidadCotizaciones: cotizaciones.length,
      hookLoading
    });

    // Si ya tenemos la cotización como prop, usarla directamente
    if (cotizacionProp) {
      console.log('📋 Usando cotización proporcionada como prop');
      cargarPrecios(cotizacionProp);
      setDatosOriginales(cotizacionProp);
      setLoading(false);
      yaCargoRef.current = true;
      return;
    }

    // Si tenemos ID y cotizaciones están cargadas, buscar por ID
    if (cotizacionId && cotizaciones.length > 0 && !hookLoading) {
      console.log('🔍 Buscando cotización por ID:', cotizacionId);
      
      const cotizacion = cotizaciones.find(c => {
        const currentId = c.id || c._id;
        console.log('🔍 Comparando:', currentId, 'con', cotizacionId);
        return currentId === cotizacionId;
      });
      
      if (cotizacion) {
        console.log('✅ Cotización encontrada:', cotizacion);
        cargarPrecios(cotizacion);
        setDatosOriginales(cotizacion);
        setLoading(false);
        yaCargoRef.current = true;
      } else {
        console.error('❌ No se encontró cotización con ID:', cotizacionId);
        console.log('📋 IDs disponibles:', cotizaciones.map(c => c.id || c._id));
        setLoading(false);
      }
    }
  }, [cotizacionId, cotizacionProp, cotizaciones, hookLoading]);

  // Función mejorada para cambiar valores
  const cambiarPrecio = (campo, valor) => {
    // Permitir solo números y punto decimal
    const valorLimpio = valor.replace(/[^\d.]/g, '');
    
    // Prevenir múltiples puntos decimales
    const partes = valorLimpio.split('.');
    const valorFinal = partes.length > 2 
      ? partes[0] + '.' + partes.slice(1).join('') 
      : valorLimpio;
    
    console.log(`🔄 Cambiando ${campo} a: "${valorFinal}"`);
    
    setPrecios(prev => ({
      ...prev,
      [campo]: valorFinal
    }));
  };

  // Calcular totales
  const calcularTotales = () => {
    const nums = {
      combustible: parseFloat(precios.combustible) || 0,
      peajes: parseFloat(precios.peajes) || 0,
      conductor: parseFloat(precios.conductor) || 0,
      otros: parseFloat(precios.otros) || 0,
      impuestos: parseFloat(precios.impuestos) || 0
    };
    
    const subtotal = nums.combustible + nums.peajes + nums.conductor + nums.otros;
    const total = subtotal + nums.impuestos;
    
    return { subtotal, total };
  };

  // Guardar como borrador (sin enviar al cliente)
  const guardarBorrador = async () => {
    if (!datosOriginales || !datosOriginales.id && !datosOriginales._id) {
      showSweetAlert({
        title: 'Error',
        text: 'No se puede guardar: datos de cotización no válidos',
        type: 'error',
        onConfirm: closeSweetAlert
      });
      return;
    }

    setGuardando(true);
    setMensaje('Guardando borrador...');
    
    try {
      const { subtotal, total } = calcularTotales();
      
      const datosParaGuardar = {
        price: parseFloat(precios.price) || 0,
        costos: {
          combustible: parseFloat(precios.combustible) || 0,
          peajes: parseFloat(precios.peajes) || 0,
          conductor: parseFloat(precios.conductor) || 0,
          otros: parseFloat(precios.otros) || 0,
          impuestos: parseFloat(precios.impuestos) || 0,
          subtotal: subtotal,
          total: total,
          moneda: datosOriginales.costos?.moneda || 'USD'
        }
      };
      
      console.log('💾 Guardando borrador:', datosParaGuardar);
      
      const resultado = await actualizarCotizacionAPI(
        datosOriginales.id || datosOriginales._id, 
        datosParaGuardar
      );
      
      if (resultado.success) {
        setMensaje('Borrador guardado');
        showSweetAlert({
          title: 'Borrador Guardado',
          text: 'Los precios se han guardado como borrador. Puedes continuar editando o enviar la cotización al cliente.',
          type: 'success',
          onConfirm: closeSweetAlert
        });
        
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setMensaje('Error al guardar');
        showSweetAlert({
          title: 'Error',
          text: resultado.message || 'No se pudo guardar el borrador',
          type: 'error',
          onConfirm: closeSweetAlert
        });
      }
      
    } catch (error) {
      console.error('Error guardando borrador:', error);
      setMensaje('Error al guardar');
      showSweetAlert({
        title: 'Error',
        text: 'Ocurrió un error al guardar el borrador.',
        type: 'error',
        onConfirm: closeSweetAlert
      });
    } finally {
      setGuardando(false);
    }
  };

  // Función auxiliar para procesar el envío
  const procesarEnvioCotizacion = async () => {
    setGuardando(true);
    setMensaje('Enviando cotización al cliente...');
    
    try {
      const { subtotal, total } = calcularTotales();
      
      const datosParaGuardar = {
        price: parseFloat(precios.price) || 0,
        costos: {
          combustible: parseFloat(precios.combustible) || 0,
          peajes: parseFloat(precios.peajes) || 0,
          conductor: parseFloat(precios.conductor) || 0,
          otros: parseFloat(precios.otros) || 0,
          impuestos: parseFloat(precios.impuestos) || 0,
          subtotal: subtotal,
          total: total,
          moneda: datosOriginales.costos?.moneda || 'USD'
        },
        fechaEnvio: new Date().toISOString(),
        enviadaPorAdmin: true
      };
      
      console.log('📤 Enviando cotización:', datosParaGuardar);
      
      // Paso 1: Guardar los precios
      const resultadoGuardar = await actualizarCotizacionAPI(
        datosOriginales.id || datosOriginales._id, 
        datosParaGuardar
      );
      
      if (resultadoGuardar.success) {
        // Paso 2: Cambiar estado a "enviada"
        const cotizacionActualizada = { ...datosOriginales, ...datosParaGuardar };
        await actualizarEstadoCotizacion(cotizacionActualizada, 'enviada');
        
        setMensaje('¡Cotización enviada al cliente!');
        showSweetAlert({
          title: '¡Cotización Enviada!',
          text: `La cotización con precio $${datosParaGuardar.price.toFixed(2)} ha sido enviada al cliente. El cliente recibirá una notificación.`,
          type: 'success',
          onConfirm: () => {
            closeSweetAlert();
          }
        });
        
        // Actualizar el estado local
        setDatosOriginales(prev => ({ ...prev, status: 'enviada', ...datosParaGuardar }));
        
      } else {
        throw new Error(resultadoGuardar.message || 'Error al guardar la cotización');
      }
      
    } catch (error) {
      console.error('Error enviando cotización:', error);
      setMensaje('Error al enviar');
      showSweetAlert({
        title: 'Error al Enviar',
        text: 'No se pudo enviar la cotización al cliente. Inténtalo de nuevo.',
        type: 'error',
        onConfirm: closeSweetAlert
      });
    } finally {
      setGuardando(false);
    }
  };

  // Enviar cotización al cliente (guardar + cambiar estado)
  const enviarCotizacionAlCliente = async () => {
    if (!datosOriginales || !datosOriginales.id && !datosOriginales._id) {
      showSweetAlert({
        title: 'Error',
        text: 'No se puede enviar: datos de cotización no válidos',
        type: 'error',
        onConfirm: closeSweetAlert
      });
      return;
    }

    // Validar que haya precios
    const precioTotal = parseFloat(precios.price) || 0;
    if (precioTotal <= 0) {
      showSweetAlert({
        title: 'Precio requerido',
        text: 'Debes ingresar un precio principal antes de enviar la cotización al cliente.',
        type: 'warning',
        onConfirm: closeSweetAlert
      });
      return;
    }

    // Confirmar envío
    showSweetAlert({
      title: '¿Enviar cotización al cliente?',
      text: `Se enviará la cotización con un precio de $${precioTotal.toFixed(2)} al cliente. Esta acción notificará al cliente.`,
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      onConfirm: async () => {
        closeSweetAlert();
        await procesarEnvioCotizacion();
      },
      onCancel: closeSweetAlert
    });
  };

  if (loading || hookLoading) {
    return (
      <div className="min-h-screen bg-gray-800 p-6 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>{hookLoading ? 'Cargando cotizaciones...' : 'Buscando cotización...'}</p>
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

  if (!datosOriginales || Object.keys(datosOriginales).length === 0) {
    return (
      <div className="min-h-screen bg-gray-800 p-6 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-yellow-400 text-xl mb-4">⚠️</div>
          <p className="mb-4">No se encontraron datos de la cotización</p>
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

  const { subtotal, total } = calcularTotales();

  return (
    <div className="min-h-screen bg-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 text-white"
          onClick={onVolver}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg font-medium">Cotizar Solicitud del Cliente</span>
        </div>
        
        {mensaje && (
          <div className={`px-4 py-2 rounded text-white ${
            mensaje.includes('Error') ? 'bg-red-500' : 
            mensaje.includes('exitosamente') || mensaje.includes('enviada') ? 'bg-green-500' : 'bg-blue-500'
          }`}>
            {mensaje}
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cotizar Solicitud del Cliente
            </h1>
            <p className="text-gray-600">
              Agrega precios y envía la cotización: {datosOriginales.numeroDetizacion || 'N/A'}
            </p>
          </div>
        </div>

        {/* Información del cliente (solo lectura) */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Información del Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Cliente:</span>
              <span className="ml-2">
                {datosOriginales.clienteFirstName} {datosOriginales.clienteLastName}
                {!datosOriginales.clienteFirstName && datosOriginales.cliente}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Email:</span>
              <span className="ml-2">{datosOriginales.email || 'No especificado'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Teléfono:</span>
              <span className="ml-2">{datosOriginales.telefono || 'No especificado'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Estado:</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                datosOriginales.status === 'pendiente' ? 'bg-orange-100 text-orange-800' :
                datosOriginales.status === 'enviada' ? 'bg-blue-100 text-blue-800' :
                datosOriginales.status === 'aceptada' ? 'bg-green-100 text-green-800' :
                datosOriginales.status === 'rechazada' ? 'bg-red-100 text-red-800' :
                datosOriginales.status === 'ejecutada' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {datosOriginales.status === 'pendiente' ? '⏳ Pendiente de cotizar' :
                 datosOriginales.status === 'enviada' ? '📤 Enviada al cliente' :
                 datosOriginales.status === 'aceptada' ? '✅ Aceptada por cliente' :
                 datosOriginales.status === 'rechazada' ? '❌ Rechazada por cliente' :
                 datosOriginales.status === 'ejecutada' ? '🚛 En ejecución' :
                 datosOriginales.status || 'Desconocido'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Origen:</span>
              <span className="ml-2">{datosOriginales.origen || datosOriginales.lugarOrigen || 'No especificado'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Destino:</span>
              <span className="ml-2">{datosOriginales.destino || datosOriginales.lugarDestino || 'No especificado'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Tipo de camión:</span>
              <span className="ml-2">{datosOriginales.truckType || datosOriginales.tipoVehiculo || 'No especificado'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Método de pago:</span>
              <span className="ml-2">{datosOriginales.paymentMethod || datosOriginales.metodoPago || 'No especificado'}</span>
            </div>
          </div>
          
          {datosOriginales.quoteDescription && (
            <div className="mt-4">
              <span className="font-medium text-gray-600">Descripción:</span>
              <p className="mt-1 text-gray-700 bg-white p-3 rounded border">
                {datosOriginales.quoteDescription || datosOriginales.descripcion}
              </p>
            </div>
          )}
        </div>

        {/* Información del flujo */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            📋 Estado de la Cotización
          </h3>
          <div className="space-y-3">
            {datosOriginales.status === 'pendiente' && (
              <div className="flex items-center gap-3 text-orange-700">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Solicitud recibida del cliente - Esperando que agregues precios</span>
              </div>
            )}
            {datosOriginales.status === 'enviada' && (
              <div className="flex items-center gap-3 text-blue-700">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Cotización enviada al cliente - Esperando respuesta</span>
              </div>
            )}
            {datosOriginales.status === 'aceptada' && (
              <div className="flex items-center gap-3 text-green-700">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>✅ Cliente aceptó la cotización - Lista para ejecutar</span>
              </div>
            )}
            {datosOriginales.status === 'rechazada' && (
              <div className="flex items-center gap-3 text-red-700">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>❌ Cliente rechazó la cotización</span>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-white rounded border text-sm text-gray-600">
              💡 <strong>Flujo:</strong> Cliente envía solicitud → Tú agregas precios → Envías cotización → Cliente acepta/rechaza
            </div>
          </div>
        </div>

        {/* Campos editables de precios */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <span className="text-green-600">💰</span>
            Precios y Costos (Editables)
          </h2>
          
          <div className="space-y-6">
            {/* Precio principal */}
            <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💲 Precio Principal *
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={precios.price}
                onChange={(e) => cambiarPrecio('price', e.target.value)}
                placeholder="Ingresa el precio principal (requerido para enviar)"
                className={`w-full px-4 py-3 border rounded-md text-lg font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  !precios.price || parseFloat(precios.price) <= 0 ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">Valor actual: ${parseFloat(precios.price) || 0}</p>
                {(!precios.price || parseFloat(precios.price) <= 0) && (
                  <p className="text-xs text-red-600">⚠️ Precio requerido para enviar</p>
                )}
              </div>
            </div>

            {/* Desglose de costos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⛽ Combustible
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={precios.combustible}
                  onChange={(e) => cambiarPrecio('combustible', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🛣️ Peajes
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={precios.peajes}
                  onChange={(e) => cambiarPrecio('peajes', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👨‍💼 Conductor
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={precios.conductor}
                  onChange={(e) => cambiarPrecio('conductor', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📋 Otros Gastos
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={precios.otros}
                  onChange={(e) => cambiarPrecio('otros', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏛️ Impuestos
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={precios.impuestos}
                  onChange={(e) => cambiarPrecio('impuestos', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Totales */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 Resumen de Totales</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal (sin impuestos):</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-blue-600 border-t pt-2">
              <span>Total Final:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 justify-end">
          {/* Botón guardar borrador */}
          <button
            onClick={guardarBorrador}
            disabled={guardando}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="w-4 h-4" />
            {guardando ? 'Guardando...' : 'Guardar Borrador'}
          </button>

          {/* Botón enviar al cliente */}
          <button
            onClick={enviarCotizacionAlCliente}
            disabled={guardando || datosOriginales.status === 'enviada'}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
          >
            📤 {guardando ? 'Enviando...' : 'Enviar Cotización al Cliente'}
          </button>
        </div>

        {/* Información sobre los botones */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 text-xl">💡</div>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-2">Diferencia entre botones:</p>
              <ul className="space-y-1">
                <li>• <strong>Guardar Borrador:</strong> Solo guarda los precios, no notifica al cliente</li>
                <li>• <strong>Enviar Cotización:</strong> Guarda los precios Y envía la cotización al cliente</li>
              </ul>
              {datosOriginales.status === 'enviada' && (
                <p className="mt-2 text-blue-700 font-medium">✅ Esta cotización ya fue enviada al cliente</p>
              )}
            </div>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-8 p-4 bg-gray-100 rounded border text-xs">
          <h4 className="font-medium mb-2">🐛 Estado actual (debug):</h4>
          <pre className="text-gray-600 overflow-x-auto">
{JSON.stringify(precios, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}