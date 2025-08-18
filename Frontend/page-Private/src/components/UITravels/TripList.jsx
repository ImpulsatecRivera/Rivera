import React from 'react';
import { AlertTriangle, CheckCircle, Circle } from 'lucide-react';
import { useTravels } from '../Travels/hooks/useTravels'; // ✅ CORREGIDO: Cambiar useDataTravels por useTravels
import TripListItem from './TripListItem';

// ✅ DAYSECTION CORREGIDO
const DaySection = ({ day, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="mb-6">
      {/* Header del día */}
      <div 
        className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="font-bold text-lg text-gray-900">{day.label}</h3>
          <p className="text-sm text-gray-500">{day.fechaCompleta}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Estadísticas rápidas */}
          <div className="flex items-center space-x-3 text-sm">
            {day.estadisticas.pendientes > 0 && (
              <span className="text-blue-600">
                {day.estadisticas.pendientes} programados
              </span>
            )}
            {day.estadisticas.enCurso > 0 && (
              <span className="text-green-600">
                {day.estadisticas.enCurso} en curso
              </span>
            )}
            {day.estadisticas.retrasados > 0 && (
              <span className="text-orange-600">
                {day.estadisticas.retrasados} retrasados
              </span>
            )}
          </div>
          
          {/* Total y expansión */}
          <div className="flex items-center space-x-2">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {day.estadisticas.total} viajes
            </span>
            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Lista de viajes */}
      {isExpanded && (
        <div className="mt-4 space-y-0">
          {day.viajes.length > 0 ? (
            day.viajes.map((trip, index) => (
              <TripListItem
                key={trip.id}
                trip={trip}
                index={index}
                onEdit={onEdit}     // ✅ Función directa para editar
                onDelete={onDelete} // ✅ Función directa para eliminar
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Circle size={48} className="mx-auto mb-2 opacity-50" />
              <p>No hay viajes programados para este día</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Función para agrupar viajes por días - CON MANEJO DE ERRORES
const agruparViajesPorDias = (viajes) => {
  console.log('🔍 Agrupando viajes:', viajes?.length || 0);
  
  const hoy = new Date();
  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  const diasConViajes = [];
  
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    
    let fechaKey;
    try {
      fechaKey = fecha.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error creando fechaKey:', error);
      fechaKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    }
    
    const diaSemana = diasSemana[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    
    // Filtrar viajes para este día con manejo de errores
    const viajesDelDia = viajes.filter(viaje => {
      // Si no hay fecha, asignar a hoy
      if (!viaje.departureTime || viaje.departureTime === 'Invalid Date' || viaje.departureTime === '') {
        console.log('📅 Viaje sin fecha válida asignado a hoy:', viaje.type || viaje.description);
        return i === 0;
      }
      
      try {
        const fechaViaje = new Date(viaje.departureTime);
        
        // Verificar si la fecha es válida
        if (isNaN(fechaViaje.getTime())) {
          console.warn('⚠️ Fecha inválida en viaje:', viaje.departureTime, 'Viaje:', viaje.type);
          return i === 0; // Asignar a hoy si la fecha es inválida
        }
        
        const fechaViajeKey = fechaViaje.toISOString().split('T')[0];
        const esEsteEdia = fechaViajeKey === fechaKey;
        
        if (esEsteEdia) {
          console.log(`📅 Viaje asignado a ${diaSemana}:`, viaje.type);
        }
        
        return esEsteEdia;
      } catch (error) {
        console.error('❌ Error procesando fecha del viaje:', viaje.departureTime, error);
        return i === 0; // Asignar a hoy en caso de error
      }
    });

    // Calcular estadísticas de forma segura
    const estadisticas = {
      total: viajesDelDia.length,
      pendientes: viajesDelDia.filter(v => v.estado?.actual === 'pendiente').length,
      enCurso: viajesDelDia.filter(v => v.estado?.actual === 'en_curso').length,
      completados: viajesDelDia.filter(v => v.estado?.actual === 'completado').length,
      retrasados: viajesDelDia.filter(v => v.estado?.actual === 'retrasado').length,
      cancelados: viajesDelDia.filter(v => v.estado?.actual === 'cancelado').length,
    };
    
    console.log(`📊 ${diaSemana}: ${viajesDelDia.length} viajes`);
    
    diasConViajes.push({
      fechaKey,
      label: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}`,
      fechaCompleta: `${diaSemana}, ${dia} de ${mes} de ${fecha.getFullYear()}`,
      viajes: viajesDelDia,
      estadisticas
    });
  }
  
  console.log('✅ Agrupación completada:', diasConViajes.map(d => `${d.label}: ${d.viajes.length}`));
  return diasConViajes;
};

// Error Boundary para capturar errores
class TripListErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error en TripList:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-red-200">
          <AlertTriangle size={64} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error en la lista de viajes</h3>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || 'Error desconocido procesando los datos'}
          </p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ✅ COMPONENTE PRINCIPAL CORREGIDO
const TripList = () => {
  const { 
    scheduledTrips, 
    loading, 
    error, 
    stats, 
    onEdit,        // ✅ Nueva función directa para editar
    onDelete,      // ✅ Nueva función directa para eliminar
    refreshTravels,
    
    // ✅ AGREGAR TODOS LOS ESTADOS DE MODALES NECESARIOS
    showModal,
    selectedTrip,
    isClosing,
    handleCloseModal,
    handleEdit,
    handleDelete,
    
    // Estados para modal de edición
    showEditModal,
    isEditClosing,
    editForm,
    handleInputChange,
    handleUpdateTrip,
    handleCloseEditModal,
    handleConfirmEdit,
    handleCancelEdit,
    showConfirmEditModal,
    isConfirmEditClosing,
    
    // Estados para modal de éxito
    showSuccessModal,
    isSuccessClosing,
    handleCloseSuccessModal,
    
    // Estados para modal de eliminación
    showDeleteModal,
    isDeleteClosing,
    handleConfirmDelete,
    handleCancelDelete,
    showDeleteSuccessModal,
    isDeleteSuccessClosing,
    handleCloseDeleteSuccessModal
  } = useTravels();

  // Agrupar los viajes por días
  const viajesPorDias = React.useMemo(() => {
    return agruparViajesPorDias(scheduledTrips || []);
  }, [scheduledTrips]);

  // Calcular estadísticas totales
  const estadisticasTotales = React.useMemo(() => {
    if (!scheduledTrips || scheduledTrips.length === 0) {
      return { programados: 0, enRuta: 0, retrasados: 0, completados: 0, total: 0 };
    }

    return {
      programados: scheduledTrips.filter(v => v.estado?.actual === 'pendiente').length,
      enRuta: scheduledTrips.filter(v => v.estado?.actual === 'en_curso').length,
      retrasados: scheduledTrips.filter(v => v.estado?.actual === 'retrasado').length,
      completados: scheduledTrips.filter(v => v.estado?.actual === 'completado').length,
      total: scheduledTrips.length
    };
  }, [scheduledTrips]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <span className="text-gray-600 text-lg">Cargando viajes...</span>
        <span className="text-gray-400 text-sm mt-1">Conectando con Rivera Transport</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-red-200">
        <AlertTriangle size={64} className="mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar viajes</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={refreshTravels}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Reintentar
        </button>
      </div>
    );
  }

  if (!scheduledTrips || scheduledTrips.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <CheckCircle size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay viajes programados
        </h3>
        <p className="text-gray-500 mb-4">
          No se encontraron viajes en la base de datos.
        </p>
        <button
          onClick={refreshTravels}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>
    );
  }

  return (
    <TripListErrorBoundary>
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        {/* Header con estadísticas */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            📊 Dashboard de Viajes (Rivera Transport)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {estadisticasTotales.programados}
              </div>
              <div className="text-gray-600">Programados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {estadisticasTotales.enRuta}
              </div>
              <div className="text-gray-600">En Ruta</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {estadisticasTotales.retrasados}
              </div>
              <div className="text-gray-600">Retrasados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {estadisticasTotales.completados}
              </div>
              <div className="text-gray-600">Completados</div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              📡 Conectado a Rivera Transport - Total: {estadisticasTotales.total} viajes
            </p>
          </div>
        </div>

        {/* ✅ LISTA DE DÍAS CON FUNCIONES CORREGIDAS */}
        <div className="space-y-0">
          {viajesPorDias.map((day) => (
            <DaySection
              key={day.fechaKey}
              day={day}
              onEdit={onEdit}      // ✅ Función directa para editar
              onDelete={onDelete}  // ✅ Función directa para eliminar
            />
          ))}
        </div>

        {/* Botón actualizar */}
        <div className="mt-8 text-center">
          <button
            onClick={refreshTravels}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? '🔄 Actualizando...' : '🔄 Actualizar datos'}
          </button>
          <p className="text-gray-500 text-sm mt-2">
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </p>
        </div>

      </div>
    </TripListErrorBoundary>
  );
};

export default TripList;