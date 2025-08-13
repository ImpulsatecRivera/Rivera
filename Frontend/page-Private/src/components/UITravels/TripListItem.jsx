import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Clock, MapPin, User, Truck, AlertTriangle, CheckCircle, Circle } from 'lucide-react';

// Simulación de componente RealtimeProgressBar
const RealtimeProgressBar = ({ viajeId, initialProgress, status, enablePolling }) => {
  const [progress, setProgress] = useState(initialProgress || 0);

  useEffect(() => {
    if (!enablePolling || status !== 'en_curso') return;
    
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 2, 100));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [enablePolling, status]);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">Progreso del viaje</span>
        <span className="font-medium text-gray-800">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            status === 'en_curso' ? 'bg-green-500' : 'bg-orange-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const TripListItem = ({ trip, index, onMenuClick }) => {
  return (
    <div className="flex items-center p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-gray-100 mb-3">
      {/* Icono del estado */}
      <div className={`w-12 h-12 rounded-full ${trip.color} flex items-center justify-center mr-4 shadow-sm`}>
        <span className="text-white text-lg">
          {trip.icon}
        </span>
      </div>

      {/* Información principal */}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Ruta */}
            <div className="font-semibold text-gray-900 text-sm mb-1">
              {trip.type}
            </div>
            
            {/* Horario y descripción */}
            <div className="text-sm text-gray-600 mb-2">
              <span className="inline-flex items-center mr-3">
                <Clock size={14} className="mr-1" />
                {trip.time}
                {trip.endTime && (
                  <span className="text-gray-400 mx-1"> - {trip.endTime}</span>
                )}
              </span>
            </div>
            
            {/* Descripción de carga */}
            <div className="text-sm text-gray-500 mb-2">
              {trip.description}
            </div>

            {/* Información adicional en una fila */}
            <div className="flex items-center text-xs text-gray-500 space-x-4 mb-3">
              {trip.driver && trip.driver !== "Conductor por asignar" && (
                <span className="inline-flex items-center">
                  <User size={12} className="mr-1" />
                  {trip.driver}
                </span>
              )}
              
              {trip.truck && trip.truck !== "Camión por asignar" && (
                <span className="inline-flex items-center">
                  <Truck size={12} className="mr-1" />
                  {trip.truck}
                </span>
              )}
              
              {trip.distancia && (
                <span className="inline-flex items-center">
                  <MapPin size={12} className="mr-1" />
                  {trip.distancia}
                </span>
              )}
            </div>

            {/* BARRA DE PROGRESO - SOLO PARA VIAJES EN MOVIMIENTO */}
            {(trip.estado?.actual === 'en_curso' || trip.estado?.actual === 'retrasado') && (
              <div className="mt-3">
                <RealtimeProgressBar
                  viajeId={trip.id}
                  initialProgress={trip.estado?.progreso || 0}
                  status={trip.estado?.actual}
                  enablePolling={true}
                />
              </div>
            )}

            {/* Para viajes PENDIENTES */}
            {trip.estado?.actual === 'pendiente' && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-sm text-blue-700">
                  <span className="mr-2">📋</span>
                  <span>Esperando inicio del viaje</span>
                </div>
              </div>
            )}

            {/* Para viajes COMPLETADOS */}
            {trip.estado?.actual === 'completado' && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between text-sm text-green-700">
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Viaje completado</span>
                  </div>
                  <span className="font-medium">100%</span>
                </div>
              </div>
            )}

            {/* Para viajes CANCELADOS */}
            {trip.estado?.actual === 'cancelado' && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-sm text-red-700">
                  <span className="mr-2">❌</span>
                  <span>Viaje cancelado</span>
                </div>
              </div>
            )}
          </div>

          {/* Estado y controles */}
          <div className="flex items-center space-x-3 ml-4">
            {/* Alertas */}
            {trip.alertas && (
              <div className="flex items-center">
                <AlertTriangle 
                  size={16} 
                  className={`${
                    trip.alertas.prioridad === 3 ? 'text-red-500' : 
                    trip.alertas.prioridad === 2 ? 'text-orange-500' : 'text-yellow-500'
                  }`} 
                />
                <span className="text-xs ml-1">{trip.alertas.count}</span>
              </div>
            )}

            {/* Estado */}
            <div className="text-right">
              <div className={`text-xs font-medium ${trip.textColor} mb-1`}>
                {trip.estado?.label}
              </div>
              <div className={`w-3 h-3 rounded-full ${trip.status}`}></div>
            </div>

            {/* Menú */}
            <button
              onClick={() => onMenuClick(trip, index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-200 rounded-lg"
            >
              <MoreHorizontal size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DaySection = ({ day, onMenuClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);

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
          
          {/* Total y estado de expansión */}
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
                onMenuClick={onMenuClick}
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

const TripList = () => {
  const [viajesPorDias, setViajesPorDias] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener viajes del backend
  const fetchViajesPorDias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando viajes desde el backend...');
      const response = await fetch('http://localhost:4000/api/viajes/por-dias?diasAdelante=7');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Datos recibidos desde la API:', data);
      
      if (data.success) {
        setViajesPorDias(data.data || []);
        setEstadisticas(data.estadisticas);
        console.log(`✅ ${data.data?.length || 0} días con viajes cargados desde la base de datos`);
        
        // Mostrar detalles de los viajes recibidos
        if (data.data && data.data.length > 0) {
          data.data.forEach(dia => {
            console.log(`📅 ${dia.label}: ${dia.viajes.length} viajes`);
            dia.viajes.forEach(viaje => {
              console.log(`  🚛 ${viaje.type} - ${viaje.estado.label}`);
            });
          });
        } else {
          console.log('📭 No se encontraron viajes en la base de datos');
        }
      } else {
        setError(data.message || 'Error desconocido');
        console.error('❌ Error en la respuesta de la API:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching trips:', error);
      setError(`Error al conectar con el servidor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Componente TripList montado, cargando viajes desde la base de datos...');
    fetchViajesPorDias();
    
    // Actualizar cada 2 minutos
    const interval = setInterval(() => {
      console.log('🔄 Actualización automática de viajes...');
      fetchViajesPorDias();
    }, 2 * 60 * 1000);
    
    return () => {
      console.log('🧹 Limpiando interval de TripList...');
      clearInterval(interval);
    };
  }, []);

  const handleMenuClick = (trip, index) => {
    console.log('📋 Menu clicked for trip:', trip);
    console.log('🔍 Trip details:', {
      id: trip.id,
      estado: trip.estado,
      type: trip.type,
      driver: trip.driver,
      truck: trip.truck,
      progreso: trip.estado?.progreso
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <span className="text-gray-600 text-lg">Cargando viajes desde la base de datos...</span>
        <span className="text-gray-400 text-sm mt-1">Conectando con el servidor</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-red-200">
        <AlertTriangle size={64} className="mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar viajes</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="space-y-2">
          <button 
            onClick={fetchViajesPorDias}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Reintentar
          </button>
          <p className="text-gray-500 text-sm">
            Verifica que el servidor esté ejecutándose en localhost:4000
          </p>
        </div>
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje apropiado
  if (!viajesPorDias || viajesPorDias.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <CheckCircle size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay viajes programados
          </h3>
          <p className="text-gray-500 mb-4">
            No se encontraron viajes en la base de datos para los próximos días.
          </p>
          <button
            onClick={fetchViajesPorDias}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header con información de progreso */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          📊 Dashboard de Viajes (Datos Reales)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {viajesPorDias.reduce((acc, day) => 
                acc + day.viajes.filter(v => v.estado?.actual === 'pendiente').length, 0
              )}
            </div>
            <div className="text-gray-600">Programados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {viajesPorDias.reduce((acc, day) => 
                acc + day.viajes.filter(v => v.estado?.actual === 'en_curso').length, 0
              )}
            </div>
            <div className="text-gray-600">En Ruta</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {viajesPorDias.reduce((acc, day) => 
                acc + day.viajes.filter(v => v.estado?.actual === 'retrasado').length, 0
              )}
            </div>
            <div className="text-gray-600">Retrasados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {viajesPorDias.reduce((acc, day) => 
                acc + day.viajes.filter(v => v.estado?.actual === 'completado').length, 0
              )}
            </div>
            <div className="text-gray-600">Completados</div>
          </div>
        </div>
        
        {/* Información de la fuente de datos */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            📡 Conectado a la base de datos - Total: {estadisticas?.totalViajes || 0} viajes
          </p>
        </div>
      </div>

      {/* Lista de días con viajes */}
      <div className="space-y-0">
        {viajesPorDias.map((day) => (
          <DaySection
            key={day.fechaKey}
            day={day}
            onMenuClick={handleMenuClick}
          />
        ))}
      </div>

      {/* Botón para actualizar */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            console.log('🔄 Actualización manual solicitada');
            fetchViajesPorDias();
          }}
          disabled={loading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '🔄 Actualizando...' : '🔄 Actualizar desde BD'}
        </button>
        <p className="text-gray-500 text-sm mt-2">
          Última actualización: {new Date().toLocaleTimeString('es-ES')}
        </p>
      </div>
    </div>
  );
};

export default TripList;