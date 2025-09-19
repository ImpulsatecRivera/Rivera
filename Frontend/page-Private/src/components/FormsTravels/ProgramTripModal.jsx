// FormsTravels/ProgramTripModal.jsx - CON AUTO-ASIGNACIÓN DE MOTORISTA POR CAMIÓN
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Truck, User, Package, Calendar, Clock, DollarSign, AlertCircle, CloudRain, Car, Navigation } from 'lucide-react';
import Swal from 'sweetalert2';

// 🎉 FUNCIÓN PARA MOSTRAR ALERTA DE ÉXITO
export const showSuccessAlert = (onConfirm) => {
  Swal.fire({
    title: '¡Viaje programado con éxito!',
    text: 'El viaje ha sido agregado correctamente al sistema',
    icon: 'success',
    confirmButtonText: 'Continuar',
    confirmButtonColor: '#10B981', // Verde
    allowOutsideClick: false,
    customClass: {
      popup: 'animated bounceIn'
    }
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
};

const ProgramTripModal = ({ 
  show, 
  isClosing, 
  onClose, 
  onProgram, 
  programForm, 
  onInputChange,
  refreshTravels  // ← Nueva prop para refrescar datos
}) => {
  const [camiones, setCamiones] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [camionSeleccionado, setCamionSeleccionado] = useState(null);
  const [conductoresDisponibles, setConductoresDisponibles] = useState([]);
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

  // 🆕 Efecto para actualizar conductores disponibles cuando cambian los datos
  useEffect(() => {
    if (camiones.length > 0 && conductores.length > 0) {
      actualizarConductoresDisponibles();
    }
  }, [camiones, conductores, programForm.truckId]);

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
        cargarDatos('https://riveraproject-production.up.railway.app/api/camiones', 'Camiones'),
        cargarDatos('https://riveraproject-production.up.railway.app/api/motoristas', 'Motoristas'),
        cargarDatos('https://riveraproject-production.up.railway.app/api/cotizaciones', 'Cotizaciones')
      ]);

      // Procesar camiones
      if (camionesData.status === 'fulfilled') {
        setCamiones(camionesData.value);
        console.log(`✅ Camiones cargados: ${camionesData.value.length}`);
        console.log('🔍 Estructura de camiones:', camionesData.value[0]); // Debug estructura
      } else {
        console.error('❌ Error con camiones:', camionesData.reason);
        setCamiones([]);
      }

      // Procesar conductores
      if (conductoresData.status === 'fulfilled') {
        setConductores(conductoresData.value);
        console.log(`✅ Conductores cargados: ${conductoresData.value.length}`);
        console.log('🔍 Estructura de conductores:', conductoresData.value[0]); // Debug estructura
      } else {
        console.error('❌ Error con conductores:', conductoresData.reason);
        setConductores([]);
      }

      // Procesar cotizaciones
      if (cotizacionesData.status === 'fulfilled') {
        console.log("🔍 DEBUGGING COTIZACIONES:");
        console.log("📊 Total cotizaciones recibidas:", cotizacionesData.value.length);
        
        // FILTRO CORREGIDO - MÁS PERMISIVO
        const disponibles = cotizacionesData.value.filter(c => {
          const status = c.status || c.estado || 'sin_estado';
          
          // Estados que SÍ queremos excluir (solo los realmente problemáticos)
          const estadosExcluidos = [
            'cancelada', 
            'rechazada', 
            'completada', 
            'finalizada'
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

  // 🆕 FUNCIÓN PARA ACTUALIZAR CONDUCTORES DISPONIBLES
  const actualizarConductoresDisponibles = () => {
    console.log('🔄 Actualizando conductores disponibles...');
    
    // Obtener IDs de conductores que ya tienen camión asignado
    const conductoresConCamion = camiones
      .filter(camion => camion.conductorId || camion.driverId || camion.motorista)
      .map(camion => {
        // Manejar diferentes formatos de referencia al conductor
        const conductorRef = camion.conductorId || camion.driverId || camion.motorista;
        return typeof conductorRef === 'object' ? conductorRef._id : conductorRef;
      })
      .filter(Boolean); // Eliminar nulls/undefined

    console.log('🚛 Conductores con camión asignado:', conductoresConCamion);

    // Filtrar conductores disponibles (que no tienen camión asignado)
    const disponibles = conductores.filter(conductor => {
      const estaAsignado = conductoresConCamion.includes(conductor._id);
      const esElSeleccionado = conductor._id === programForm.conductorId;
      
      // Incluir si no está asignado O si es el actualmente seleccionado
      return !estaAsignado || esElSeleccionado;
    });

    console.log(`👥 Conductores disponibles: ${disponibles.length} de ${conductores.length}`);
    setConductoresDisponibles(disponibles);
  };

  // 🆕 FUNCIÓN PARA MANEJAR CAMBIO DE CAMIÓN CON AUTO-ASIGNACIÓN DE CONDUCTOR
  const handleCamionChange = (camionId) => {
    console.log('🚛 Camión seleccionado:', camionId);
    
    // Actualizar el camión en el formulario
    onInputChange('truckId', camionId);
    
    if (camionId) {
      // Buscar el camión seleccionado
      const camion = camiones.find(c => c._id === camionId);
      setCamionSeleccionado(camion);
      
      if (camion) {
        console.log('🔍 Datos del camión seleccionado:', camion);
        
        // Buscar si el camión tiene conductor asignado
        const conductorAsignado = camion.conductorId || camion.driverId || camion.motorista;
        
        if (conductorAsignado) {
          // Obtener el ID del conductor (manejar referencias populadas)
          const conductorId = typeof conductorAsignado === 'object' 
            ? conductorAsignado._id 
            : conductorAsignado;
          
          console.log('👤 Conductor asignado al camión:', conductorId);
          
          // Verificar que el conductor existe en la lista
          const conductorExiste = conductores.find(c => c._id === conductorId);
          
          if (conductorExiste) {
            // Auto-asignar el conductor
            onInputChange('conductorId', conductorId);
            console.log(`✅ Conductor ${conductorExiste.name || conductorExiste.nombre} auto-asignado al camión`);
            
            // Mostrar notificación al usuario
            Swal.fire({
              title: '🚛➡️👤 Conductor auto-asignado',
              text: `El conductor ${conductorExiste.name || conductorExiste.nombre} ha sido asignado automáticamente a este camión.`,
              icon: 'info',
              timer: 3000,
              timerProgressBar: true,
              toast: true,
              position: 'top-end',
              showConfirmButton: false
            });
          } else {
            console.warn('⚠️ Conductor asignado al camión no encontrado en la lista');
            // Limpiar conductor si no se encuentra
            onInputChange('conductorId', '');
          }
        } else {
          console.log('⚠️ Este camión no tiene conductor asignado');
          // Limpiar conductor si el camión no tiene uno asignado
          onInputChange('conductorId', '');
          
          // Mostrar notificación
          Swal.fire({
            title: '🚛❓ Sin conductor asignado',
            text: 'Este camión no tiene un conductor asignado. Selecciona uno de los disponibles.',
            icon: 'warning',
            timer: 3000,
            timerProgressBar: true,
            toast: true,
            position: 'top-end',
            showConfirmButton: false
          });
        }
      }
    } else {
      // Si no hay camión seleccionado, limpiar conductor
      setCamionSeleccionado(null);
      onInputChange('conductorId', '');
    }
    
    // Actualizar lista de conductores disponibles
    setTimeout(() => {
      actualizarConductoresDisponibles();
    }, 100);
  };

  // 🔄 FUNCIÓN MEJORADA PARA AUTO-LLENAR DESDE COTIZACIÓN
  const llenarDatosDesdeCotizacion = (cotizacion) => {
    console.log('🔄 Auto-llenando TODOS los datos desde cotización:', cotizacion);

    try {
      // ✅ 1. DESCRIPCIÓN DEL VIAJE
      if (cotizacion.quoteDescription || cotizacion.descripcion) {
        onInputChange('tripDescription', cotizacion.quoteDescription || cotizacion.descripcion);
      }

      // ✅ 2. CAMIÓN AUTO-ASIGNADO DESDE COTIZACIÓN (SI EXISTE)
      if (cotizacion.truckId) {
        const truckId = cotizacion.truckId._id || cotizacion.truckId;
        console.log('🚛 Auto-asignando camión desde cotización:', truckId);
        
        // Usar la nueva función que maneja la auto-asignación de conductor
        handleCamionChange(truckId);
      }

      // ✅ 3. CONDUCTOR - YA SE MANEJA EN handleCamionChange
      // No necesitamos hacer nada aquí porque handleCamionChange ya maneja la asignación del conductor

      // ✅ 4. HORARIOS PRINCIPALES
      if (cotizacion.horarios?.fechaSalida) {
        const fechaSalida = new Date(cotizacion.horarios.fechaSalida);
        onInputChange('departureTime', fechaSalida.toISOString().slice(0, 16));
      }

      if (cotizacion.horarios?.fechaLlegadaEstimada) {
        const fechaLlegada = new Date(cotizacion.horarios.fechaLlegadaEstimada);
        onInputChange('arrivalTime', fechaLlegada.toISOString().slice(0, 16));
      } else if (cotizacion.horarios?.fechaSalida && cotizacion.horarios?.tiempoEstimadoViaje) {
        // Calcular llegada basada en tiempo estimado
        const fechaSalida = new Date(cotizacion.horarios.fechaSalida);
        const tiempoEstimado = cotizacion.horarios.tiempoEstimadoViaje; // en horas
        const fechaLlegada = new Date(fechaSalida.getTime() + (tiempoEstimado * 60 * 60 * 1000));
        onInputChange('arrivalTime', fechaLlegada.toISOString().slice(0, 16));
      }

      // ✅ 5. COSTOS REALES (inicializar con costos estimados de la cotización)
      if (cotizacion.costos) {
        onInputChange('costosReales', {
          combustible: cotizacion.costos.combustible || 0,
          peajes: cotizacion.costos.peajes || 0,
          conductor: cotizacion.costos.conductor || 0,
          otros: cotizacion.costos.otros || 0,
          total: cotizacion.costos.total || 0
        });
      }

      // ✅ 6. CONDICIONES DEL VIAJE (valores por defecto inteligentes)
      onInputChange('condiciones', {
        clima: 'normal',
        trafico: 'normal', 
        carretera: 'buena',
        observaciones: cotizacion.observaciones || ''
      });

      // ✅ 7. TRACKING (inicializar)
      onInputChange('tracking', {
        ubicacionActual: {
          lat: cotizacion.ruta?.origen?.coordenadas?.lat || null,
          lng: cotizacion.ruta?.origen?.coordenadas?.lng || null,
          velocidad: 0
        },
        progreso: {
          porcentaje: 0,
          calculoAutomatico: true
        },
        checkpoints: []
      });

      // ✅ 8. ESTADO DEL VIAJE (inicializar)
      onInputChange('estado', {
        actual: 'pendiente',
        autoActualizar: true,
        historial: []
      });

      console.log('✅ Auto-llenado COMPLETO desde cotización');
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

  // 🎉 MANEJAR ÉXITO AL PROGRAMAR VIAJE
  const handleProgramSuccess = async () => {
    console.log('✅ Viaje programado exitosamente');
    
    // Mostrar alerta de éxito
    showSuccessAlert(async () => {
      console.log('🔄 Refrescando datos después de programar viaje...');
      
      try {
        if (refreshTravels) {
          console.log('📡 Llamando refreshTravels...');
          await refreshTravels();
          console.log('✅ Datos refrescados exitosamente');
        }
        
        setTimeout(() => {
          console.log('🚪 Cerrando modal...');
          onClose();
        }, 300);
        
      } catch (error) {
        console.error('❌ Error refrescando datos:', error);
        onClose();
      }
    });
  };

  // 🔄 MANEJAR PROGRAMAR VIAJE CON ALERTA
  const handleProgramViaje = async () => {
    try {
      console.log('🚛 Iniciando programación de viaje...');
      
      const result = await onProgram();
      console.log('✅ Resultado de programación:', result);
      
      setTimeout(() => {
        handleProgramSuccess();
      }, 500);
      
    } catch (error) {
      console.error('❌ Error programando viaje:', error);
      
      Swal.fire({
        title: '¡Error al programar viaje!',
        text: 'Hubo un problema al guardar el viaje. Por favor, inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#EF4444',
        customClass: {
          popup: 'animated shakeX'
        }
      });
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
          <h1 className="text-3xl font-normal text-black mr-6">Programar viaje completo</h1>
        </div>

        {/* Estado de recursos - MEJORADO CON INFO DE ASIGNACIONES */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <p className="font-medium text-blue-800">📊 Estado de recursos:</p>
            <p className="text-blue-700">
              🚛 Camiones: {camiones.length} | 
              👤 Motoristas: {conductores.length} | 
              👥 Disponibles: {conductoresDisponibles.length} |
              📋 Cotizaciones: {cotizaciones.length}
            </p>
            {camionSeleccionado && (
              <p className="text-green-700 mt-2">
                ✅ Camión seleccionado: {camionSeleccionado.brand || camionSeleccionado.marca} {camionSeleccionado.model || camionSeleccionado.modelo}
                {programForm.conductorId && ' - Conductor auto-asignado'}
              </p>
            )}
            {cotizacionSeleccionada && (
              <p className="text-green-700 mt-1">
                ✅ Cotización seleccionada: {cotizacionSeleccionada.quoteName} - Datos auto-llenados
              </p>
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
          {/* 📋 SECCIÓN 1: INFORMACIÓN BÁSICA */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Calendar className="mr-2" size={20} />
              1. Información Básica del Viaje
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cotización - PRINCIPAL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cotización * (Auto-llena todo el formulario)
                </label>
                <select
                  value={programForm.quoteId || ''}
                  onChange={(e) => handleCotizacionChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                  disabled={loading}
                  required
                >
                  <option value="">🔽 Seleccionar cotización (OBLIGATORIO)</option>
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

              {/* Descripción del viaje */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del viaje * (Auto-llenado desde cotización)
                </label>
                <textarea
                  value={programForm.tripDescription || ''}
                  onChange={(e) => onInputChange('tripDescription', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción detallada del viaje"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {/* 🚛 SECCIÓN 2: ASIGNACIÓN DE RECURSOS CON AUTO-ASIGNACIÓN */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Truck className="mr-2" size={20} />
              2. Asignación de Recursos (Con auto-asignación inteligente)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Camión - CON AUTO-ASIGNACIÓN DE CONDUCTOR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camión * (Auto-asigna conductor)
                </label>
                <select
                  value={programForm.truckId || ''}
                  onChange={(e) => handleCamionChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-amber-50"
                  required
                  disabled={loading}
                >
                  <option value="">🚛 Seleccionar camión</option>
                  {camiones.map((camion) => {
                    // Verificar si tiene conductor asignado
                    const tieneConductor = camion.conductorId || camion.driverId || camion.motorista;
                    const conductorNombre = tieneConductor && typeof tieneConductor === 'object' 
                      ? tieneConductor.name || tieneConductor.nombre 
                      : '';
                    
                    return (
                      <option key={camion._id} value={camion._id}>
                        🚛 {camion.brand || camion.marca} {camion.model || camion.modelo} - {camion.licensePlate || camion.placa}
                        {tieneConductor ? ` (👤 ${conductorNombre || 'Conductor asignado'})` : ' (❌ Sin conductor)'}
                      </option>
                    );
                  })}
                </select>
                <p className="text-xs text-amber-600 mt-1">
                  💡 Al seleccionar un camión, se asignará automáticamente su conductor
                </p>
              </div>

              {/* Conductor - AUTO-ASIGNADO O SELECCIONAR DE DISPONIBLES */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conductor * (Auto-asignado o seleccionar disponible)
                </label>
                <select
                  value={programForm.conductorId || ''}
                  onChange={(e) => onInputChange('conductorId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-green-50"
                  required
                  disabled={loading}
                >
                  <option value="">👤 Seleccionar conductor</option>
                  {conductoresDisponibles.map((conductor) => (
                    <option key={conductor._id} value={conductor._id}>
                      👤 {conductor.name || conductor.nombre} - {conductor.phone || conductor.telefono}
                      {conductor._id === programForm.conductorId && camionSeleccionado ? ' (🚛 Auto-asignado)' : ' (✅ Disponible)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-green-600 mt-1">
                  {programForm.conductorId ? (
                    camionSeleccionado 
                      ? `✅ ${conductores.find(c => c._id === programForm.conductorId)?.name || conductores.find(c => c._id === programForm.conductorId)?.nombre || 'Conductor'} asignado automáticamente`
                      : `✅ ${conductores.find(c => c._id === programForm.conductorId)?.name || conductores.find(c => c._id === programForm.conductorId)?.nombre || 'Conductor'} seleccionado manualmente`
                  ) : (
                    '👥 Solo se muestran conductores disponibles (sin camión asignado)'
                  )}
                </p>
              </div>

              {/* Auxiliar - OPCIONAL DE CONDUCTORES DISPONIBLES */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auxiliar (Opcional - Solo conductores disponibles)
                </label>
                <select
                  value={programForm.auxiliarId || ''}
                  onChange={(e) => onInputChange('auxiliarId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                  disabled={loading}
                >
                  <option value="">Sin auxiliar asignado</option>
                  {conductoresDisponibles
                    .filter(conductor => conductor._id !== programForm.conductorId) // Excluir el conductor principal
                    .map((conductor) => (
                    <option key={conductor._id} value={conductor._id}>
                      👥 {conductor.name || conductor.nombre} - {conductor.phone || conductor.telefono}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  El auxiliar es opcional y solo se puede seleccionar de conductores disponibles
                </p>
              </div>
            </div>
          </div>

          {/* ⏰ SECCIÓN 3: HORARIOS */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Clock className="mr-2" size={20} />
              3. Horarios (Auto-llenado desde cotización)
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
                  Fecha y hora de llegada estimada *
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

          {/* 💰 SECCIÓN 4: COSTOS REALES */}
          <div className="bg-yellow-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <DollarSign className="mr-2" size={20} />
              4. Costos Reales (Inicializados desde cotización)
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Combustible ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={programForm.costosReales?.combustible || ''}
                  onChange={(e) => onInputChange('costosReales.combustible', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peajes ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={programForm.costosReales?.peajes || ''}
                  onChange={(e) => onInputChange('costosReales.peajes', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conductor ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={programForm.costosReales?.conductor || ''}
                  onChange={(e) => onInputChange('costosReales.conductor', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Otros ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={programForm.costosReales?.otros || ''}
                  onChange={(e) => onInputChange('costosReales.otros', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Total calculado automáticamente */}
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-800">Total estimado:</span>
                <span className="text-xl font-bold text-green-900">
                  ${((programForm.costosReales?.combustible || 0) + 
                     (programForm.costosReales?.peajes || 0) + 
                     (programForm.costosReales?.conductor || 0) + 
                     (programForm.costosReales?.otros || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-center space-x-4 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-lg font-medium transition-colors"
            >
              ❌ Cancelar
            </button>
            <button 
              type="button"
              onClick={handleProgramViaje}
              disabled={loading || !programForm.quoteId || !programForm.truckId || !programForm.conductorId || !programForm.tripDescription || !programForm.departureTime || !programForm.arrivalTime}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-8 rounded-lg font-medium flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando viaje...
                </>
              ) : (
                '🚛 Programar Viaje Completo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramTripModal;