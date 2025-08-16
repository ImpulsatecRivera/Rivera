// FormsTravels/ProgramTripModal.jsx - COTIZACIONES CORREGIDO
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Truck, User, Package, Calendar, Clock, DollarSign, AlertCircle } from 'lucide-react';

const ProgramTripModal = ({ 
  show, 
  isClosing, 
  onClose, 
  onProgram, 
  programForm, 
  onInputChange 
}) => {
  const [camiones, setCamiones] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (show) {
      cargarRecursos();
    }
  }, [show]);

  // Efecto para cargar cotización seleccionada
  useEffect(() => {
    if (programForm.quoteId && cotizaciones.length > 0) {
      const cotizacion = cotizaciones.find(c => c._id === programForm.quoteId);
      if (cotizacion) {
        setCotizacionSeleccionada(cotizacion);
        llenarDatosDesdeCotizacion(cotizacion);
      }
    }
  }, [programForm.quoteId, cotizaciones]);

  const cargarRecursos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando recursos...');

      // ✅ FUNCIÓN PARA CARGAR DATOS CON MEJOR MANEJO
      const cargarDatos = async (url, nombre) => {
        try {
          console.log(`📡 Cargando ${nombre} desde: ${url}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`${nombre} no devolvió JSON válido`);
          }

          const data = await response.json();
          console.log(`✅ ${nombre} respuesta completa:`, data);
          
          // Extraer array de datos según diferentes formatos posibles
          if (data.data && Array.isArray(data.data)) {
            return data.data;
          } else if (Array.isArray(data)) {
            return data;
          } else if (data.camiones && Array.isArray(data.camiones)) {
            return data.camiones;
          } else if (data.motoristas && Array.isArray(data.motoristas)) {
            return data.motoristas;
          } else if (data.cotizaciones && Array.isArray(data.cotizaciones)) {
            return data.cotizaciones;
          } else if (data.viajes && Array.isArray(data.viajes)) {
            return data.viajes;
          } else {
            console.warn(`⚠️ ${nombre} - formato inesperado:`, data);
            return [];
          }
        } catch (error) {
          console.error(`❌ Error cargando ${nombre}:`, error);
          throw error;
        }
      };

      // Cargar todos los recursos en paralelo
      const [camionesData, conductoresData, cotizacionesData] = await Promise.allSettled([
        cargarDatos('http://localhost:4000/api/camiones', 'Camiones'),
        cargarDatos('http://localhost:4000/api/motoristas', 'Motoristas'),
        cargarDatos('http://localhost:4000/api/cotizaciones', 'Cotizaciones')
      ]);

      // Procesar camiones
      if (camionesData.status === 'fulfilled') {
        setCamiones(camionesData.value);
        console.log(`✅ Camiones cargados: ${camionesData.value.length}`);
      } else {
        console.error('❌ Error con camiones:', camionesData.reason);
        setCamiones([]);
      }

      // Procesar conductores
      if (conductoresData.status === 'fulfilled') {
        setConductores(conductoresData.value);
        console.log(`✅ Conductores cargados: ${conductoresData.value.length}`);
      } else {
        console.error('❌ Error con conductores:', conductoresData.reason);
        setConductores([]);
      }

      // Procesar cotizaciones - CORREGIDO
      if (cotizacionesData.status === 'fulfilled') {
        console.log("🔍 DEBUGGING COTIZACIONES:");
        console.log("📊 Total cotizaciones recibidas:", cotizacionesData.value.length);
        
        // Ver el estado de cada cotización
        cotizacionesData.value.forEach((cot, index) => {
          console.log(`📋 Cotización ${index + 1}:`, {
            id: cot._id,
            nombre: cot.quoteName || cot.nombre,
            status: cot.status,
            estado: cot.estado,
            // Ver todos los campos para debugging
            todasLasClaves: Object.keys(cot)
          });
        });

        // FILTRO CORREGIDO - MÁS PERMISIVO
        const disponibles = cotizacionesData.value.filter(c => {
          const status = c.status || c.estado || 'sin_estado';
          
          // Estados que SÍ queremos excluir (solo los realmente problemáticos)
          const estadosExcluidos = [
            'cancelada', 
            'rechazada', 
            'completada', 
            'finalizada'
            // NO excluir 'ejecutada' porque podríamos querer reutilizar cotizaciones
          ];
          
          const incluir = !estadosExcluidos.includes(status.toLowerCase());
          
          if (!incluir) {
            console.log(`❌ Cotización ${c._id} excluida por status: ${status}`);
          } else {
            console.log(`✅ Cotización ${c._id} incluida con status: ${status}`);
          }
          
          return incluir;
        });
        
        console.log(`📊 Cotizaciones disponibles: ${disponibles.length} de ${cotizacionesData.value.length}`);
        
        // Si muy pocas cotizaciones pasan el filtro, mostrar todas temporalmente
        if (disponibles.length === 0) {
          console.warn("⚠️ NINGUNA cotización pasó el filtro. Mostrando TODAS para debugging.");
          setCotizaciones(cotizacionesData.value);
        } else if (disponibles.length < cotizacionesData.value.length / 2) {
          console.warn("⚠️ Muy pocas cotizaciones pasaron el filtro. Considera revisar los estados.");
          setCotizaciones(disponibles);
        } else {
          setCotizaciones(disponibles);
        }
        
        console.log(`✅ Cotizaciones finales mostradas: ${cotizaciones.length || disponibles.length}`);
        
      } else {
        console.error('❌ Error con cotizaciones:', cotizacionesData.reason);
        setCotizaciones([]);
      }

    } catch (error) {
      console.error('❌ Error general:', error);
      setError(`Error cargando recursos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para llenar datos desde cotización
  const llenarDatosDesdeCotizacion = (cotizacion) => {
    console.log('🔄 Auto-llenando desde cotización:', cotizacion);

    try {
      // Descripción del viaje
      if (cotizacion.quoteDescription || cotizacion.descripcion) {
        onInputChange('tripDescription', cotizacion.quoteDescription || cotizacion.descripcion);
      }

      // Origen
      if (cotizacion.ruta?.origen) {
        onInputChange('origen', {
          nombre: cotizacion.ruta.origen.nombre || '',
          lat: cotizacion.ruta.origen.coordenadas?.lat || cotizacion.ruta.origen.lat || '',
          lng: cotizacion.ruta.origen.coordenadas?.lng || cotizacion.ruta.origen.lng || '',
          tipo: cotizacion.ruta.origen.tipo || 'ciudad'
        });
      }

      // Destino
      if (cotizacion.ruta?.destino) {
        onInputChange('destino', {
          nombre: cotizacion.ruta.destino.nombre || '',
          lat: cotizacion.ruta.destino.coordenadas?.lat || cotizacion.ruta.destino.lat || '',
          lng: cotizacion.ruta.destino.coordenadas?.lng || cotizacion.ruta.destino.lng || '',
          tipo: cotizacion.ruta.destino.tipo || 'ciudad'
        });
      }

      // Horarios
      if (cotizacion.horarios?.fechaSalida) {
        const fechaSalida = new Date(cotizacion.horarios.fechaSalida);
        onInputChange('departureTime', fechaSalida.toISOString().slice(0, 16));
      }

      if (cotizacion.horarios?.fechaLlegadaEstimada) {
        const fechaLlegada = new Date(cotizacion.horarios.fechaLlegadaEstimada);
        onInputChange('arrivalTime', fechaLlegada.toISOString().slice(0, 16));
      }

      // Carga
      if (cotizacion.carga) {
        onInputChange('carga', {
          descripcion: cotizacion.carga.descripcion || '',
          categoria: cotizacion.carga.categoria || 'general',
          peso: {
            valor: cotizacion.carga.peso?.valor || '',
            unidad: cotizacion.carga.peso?.unidad || 'kg'
          }
        });
      }

      // Observaciones
      if (cotizacion.observaciones) {
        onInputChange('observaciones', cotizacion.observaciones);
      }

      console.log('✅ Auto-llenado completado');
    } catch (error) {
      console.error('❌ Error en auto-llenado:', error);
    }
  };

  // Manejar cambio de cotización
  const handleCotizacionChange = (cotizacionId) => {
    onInputChange('quoteId', cotizacionId);
    
    if (cotizacionId) {
      const cotizacion = cotizaciones.find(c => c._id === cotizacionId);
      if (cotizacion) {
        setCotizacionSeleccionada(cotizacion);
        llenarDatosDesdeCotizacion(cotizacion);
      }
    } else {
      setCotizacionSeleccionada(null);
    }
  };

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 bg-gray-800 z-50 transition-all duration-300 ease-out overflow-y-auto ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center sticky top-0 z-10">
        <button 
          onClick={onClose}
          className="flex items-center text-white hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="text-sm font-medium">Volver al menú principal</span>
        </button>
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-t-3xl mt-4 mx-4 mb-4 p-8 min-h-[calc(100vh-6rem)] relative">
        {/* Header del formulario */}
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-normal text-black mr-6">Programar viaje</h1>
        </div>

        {/* Estado de recursos - MEJORADO CON DEBUG INFO */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <p className="font-medium text-blue-800">📊 Estado de recursos:</p>
            <p className="text-blue-700">
              🚛 Camiones: {camiones.length} | 
              👤 Motoristas: {conductores.length} | 
              📋 Cotizaciones: {cotizaciones.length}
            </p>
            {/* Información adicional de debug */}
            {cotizaciones.length > 0 && (
              <details className="mt-2">
                <summary className="text-blue-600 cursor-pointer text-xs">Ver detalles de cotizaciones</summary>
                <div className="mt-1 text-xs text-blue-600">
                  {cotizaciones.map((cot, index) => (
                    <div key={cot._id}>
                      {index + 1}. {cot.quoteName || `Cot ${cot._id.slice(-6)}`} - Status: {cot.status || cot.estado || 'sin estado'}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-blue-600 mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Cargando recursos...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="mr-2 mt-0.5 text-red-600" size={20} />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error de conexión</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <p className="text-red-600 text-xs mt-2">
                  Verifica que tu servidor backend esté corriendo en puerto 4000
                </p>
                <button 
                  onClick={cargarRecursos}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  🔄 Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-8">
          {/* Información Básica */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Calendar className="mr-2" size={20} />
              Información Básica del Viaje
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cotización */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cotización (Auto-llena el formulario)
                </label>
                <select
                  value={programForm.quoteId || ''}
                  onChange={(e) => handleCotizacionChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Seleccionar cotización</option>
                  {cotizaciones.map((cotizacion) => (
                    <option key={cotizacion._id} value={cotizacion._id}>
                      📋 {cotizacion.quoteName || cotizacion.nombre || `Cotización ${cotizacion._id.slice(-6)}`}
                      {cotizacion.price && ` - $${cotizacion.price}`}
                      {(cotizacion.status || cotizacion.estado) && ` (${cotizacion.status || cotizacion.estado})`}
                    </option>
                  ))}
                </select>
                {cotizaciones.length === 0 && !loading && (
                  <p className="text-sm text-red-600 mt-1">
                    No hay cotizaciones disponibles. Verifica que existan cotizaciones en el sistema.
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del viaje *
                </label>
                <input
                  type="text"
                  value={programForm.tripDescription || ''}
                  onChange={(e) => onInputChange('tripDescription', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción del viaje"
                  required
                />
              </div>
            </div>
          </div>

          {/* Recursos */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Truck className="mr-2" size={20} />
              Asignación de Recursos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Camión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camión *
                </label>
                <select
                  value={programForm.truckId || ''}
                  onChange={(e) => onInputChange('truckId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar camión</option>
                  {camiones.map((camion) => (
                    <option key={camion._id} value={camion._id}>
                      🚛 {camion.brand || camion.marca} {camion.model || camion.modelo} - {camion.licensePlate || camion.placa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conductor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conductor *
                </label>
                <select
                  value={programForm.conductorId || ''}
                  onChange={(e) => onInputChange('conductorId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar conductor</option>
                  {conductores.map((conductor) => (
                    <option key={conductor._id} value={conductor._id}>
                      👤 {conductor.name || conductor.nombre} - {conductor.phone || conductor.telefono}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Clock className="mr-2" size={20} />
              Horarios
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y hora de salida *
                </label>
                <input
                  type="datetime-local"
                  value={programForm.departureTime || ''}
                  onChange={(e) => onInputChange('departureTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y hora de llegada *
                </label>
                <input
                  type="datetime-local"
                  value={programForm.arrivalTime || ''}
                  onChange={(e) => onInputChange('arrivalTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-center space-x-4 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={onProgram}
              disabled={loading || !programForm.quoteId || !programForm.truckId || !programForm.conductorId}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-lg font-medium flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                '🚛 Programar Viaje'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramTripModal;
