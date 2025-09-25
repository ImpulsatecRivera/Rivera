import React, { useEffect, useState } from 'react';
import { Bus, Home, UtensilsCrossed, Play, Truck, Package, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const iconMap = {
  transporte: Bus,
  vivienda: Home,
  comida: UtensilsCrossed,
  entretenimiento: Play,
  electronica: Package,
  maquinaria: Truck,
  textiles: Package,
  quimicos: AlertCircle,
  otro: Truck,
};

const CompletedTrips = () => {
  const [completedTrips, setCompletedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompleted();
  }, []);

  const fetchCompleted = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 🔧 RUTA CORRECTA: /completed
      const res = await axios.get('https://riveraproject-production-933e.up.railway.app/api/viajes/completed');
      
      console.log('✅ Viajes completados recibidos:', res.data);
      
      // 📊 Verificar estructura de respuesta
      if (!res.data.success || !res.data.data) {
        throw new Error('Estructura de respuesta inválida del servidor');
      }
      
      const viajes = res.data.data;

      // 🎯 Transformar los datos para el componente
      const mapped = viajes.map((v, i) => {
        // 📦 Determinar tipo basado en la carga o descripción
        let tipo = 'otro';
        const descripcion = (v.carga?.descripcion || v.tripDescription || '').toLowerCase();
        const categoria = (v.carga?.categoria || v.carga?.tipo || '').toLowerCase();
        
        // 🔍 Clasificar por categoría primero, luego por descripción
        if (categoria) {
          if (categoria.includes('alimento') || categoria.includes('comida')) {
            tipo = 'comida';
          } else if (categoria.includes('electronico') || categoria.includes('tecnologia')) {
            tipo = 'electronica';
          } else if (categoria.includes('textil') || categoria.includes('ropa')) {
            tipo = 'textiles';
          } else if (categoria.includes('maquinaria') || categoria.includes('industrial')) {
            tipo = 'maquinaria';
          } else if (categoria.includes('quimico') || categoria.includes('farmaceutico')) {
            tipo = 'quimicos';
          } else if (categoria.includes('transporte')) {
            tipo = 'transporte';
          }
        } else if (descripcion) {
          // Fallback: clasificar por descripción
          if (descripcion.includes('comida') || descripcion.includes('alimento')) {
            tipo = 'comida';
          } else if (descripcion.includes('bus') || descripcion.includes('transporte')) {
            tipo = 'transporte';
          } else if (descripcion.includes('casa') || descripcion.includes('vivienda')) {
            tipo = 'vivienda';
          } else if (descripcion.includes('entretenimiento') || descripcion.includes('juego')) {
            tipo = 'entretenimiento';
          }
        }

        // 📍 Información de ruta
        const origen = v.ruta?.origen?.nombre || 'Origen';
        const destino = v.ruta?.destino?.nombre || 'Destino';
        
        // ⏰ Formatear fechas
        const fechaSalida = new Date(v.departureTime);
        const horaLlegada = v.horarios?.llegadaReal ? 
          new Date(v.horarios.llegadaReal).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : 
          fechaSalida.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });

        // 🚛 Información del camión
        const truck = v.truckId;
        const camionInfo = truck ? 
          `${truck.brand || truck.marca || ''} ${truck.model || truck.modelo || ''}`.trim() ||
          `${truck.name || truck.nombre || ''}`.trim() ||
          `${truck.licensePlate || truck.placa || ''}`.trim() ||
          'Camión'
          : 'Camión';

        // 📦 Descripción del viaje
        const descripcionCompleta = v.carga?.descripcion || v.tripDescription || 'Carga general';
        const peso = v.carga?.peso?.valor ? 
          ` (${v.carga.peso.valor} ${v.carga.peso.unidad || 'kg'})` : '';

        return {
          id: v._id || `trip-${i}`,
          type: tipo.charAt(0).toUpperCase() + tipo.slice(1),
          subtitle: `${horaLlegada} • ${origen} → ${destino}`,
          description: `${descripcionCompleta}${peso}`,
          truck: camionInfo,
          driver: v.conductor?.id?.nombre || v.conductor?.nombre || 'Conductor',
          icon: iconMap[tipo] || Truck,
          color: getColorByType(tipo),
          // 📊 Datos adicionales
          fechaCompleta: fechaSalida.toLocaleDateString('es-ES'),
          duracion: v.duracionReal || v.duracionProgramada || 'N/A',
          progreso: v.tracking?.progreso?.porcentaje || 100,
          categoria: categoria || tipo
        };
      });

      // 📅 Ordenar por fecha de llegada más reciente
      const sortedMapped = mapped.sort((a, b) => {
        const fechaA = viajes.find(v => v._id === a.id)?.horarios?.llegadaReal || 
                      viajes.find(v => v._id === a.id)?.departureTime;
        const fechaB = viajes.find(v => v._id === b.id)?.horarios?.llegadaReal || 
                      viajes.find(v => v._id === b.id)?.departureTime;
        return new Date(fechaB) - new Date(fechaA);
      });

      setCompletedTrips(sortedMapped);
      console.log('🎯 Viajes completados procesados:', sortedMapped);
      
    } catch (error) {
      console.error("❌ Error al cargar viajes completados:", error);
      setError(error.response?.data?.message || error.message || 'Error desconocido');
      
      // 🎯 Datos de ejemplo en caso de error
      const datosEjemplo = [
        {
          id: 'ejemplo-1',
          type: 'Electrónica',
          subtitle: '14:30 • San Salvador → Santa Ana',
          description: 'Equipos de cómputo (1.5 ton)',
          truck: 'Freightliner Cascadia',
          driver: 'Juan Pérez',
          icon: Package,
          color: 'bg-blue-500',
          categoria: 'electronica'
        },
        {
          id: 'ejemplo-2',
          type: 'Alimentos',
          subtitle: '09:15 • Soyapango → San Miguel',
          description: 'Productos perecederos (2.8 ton)',
          truck: 'Volvo VNL',
          driver: 'María González',
          icon: UtensilsCrossed,
          color: 'bg-red-500',
          categoria: 'comida'
        },
        {
          id: 'ejemplo-3',
          type: 'Maquinaria',
          subtitle: '16:45 • Puerto → Terminal',
          description: 'Equipo industrial (5.2 ton)',
          truck: 'Kenworth T680',
          driver: 'Carlos Rodríguez',
          icon: Truck,
          color: 'bg-gray-600',
          categoria: 'maquinaria'
        }
      ];
      setCompletedTrips(datosEjemplo);
      
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Función para obtener color por tipo
  const getColorByType = (tipo) => {
    const colorMap = {
      comida: 'bg-red-500',
      transporte: 'bg-purple-500',
      vivienda: 'bg-orange-500',
      entretenimiento: 'bg-green-500',
      electronica: 'bg-blue-500',
      maquinaria: 'bg-gray-600',
      textiles: 'bg-pink-500',
      quimicos: 'bg-yellow-500',
      otro: 'bg-indigo-500'
    };
    return colorMap[tipo] || 'bg-indigo-500';
  };

  return (
    <div className="flex bg-white w-full max-w-md overflow-hidden">
      <div className="flex-1 py-2">
        {/* 📊 Header con título y botón de recarga */}
        <div className="flex justify-between items-center mb-4 px-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Viajes Completados
          </h3>
          <button
            onClick={fetchCompleted}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Actualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-4">
          {/* 🔄 Estado de carga */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
              <p className="text-gray-500 text-sm">Cargando viajes completados...</p>
            </div>
          )}

          {/* ❌ Estado de error */}
          {error && !loading && (
            <div className="mx-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 mb-2">❌ {error}</p>
              <button
                onClick={fetchCompleted}
                className="text-sm text-red-700 underline hover:text-red-800"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {/* 📊 Lista de viajes completados */}
          {!loading && completedTrips.length === 0 && !error && (
            <p className="text-gray-500 text-sm px-4 text-center py-8">
              📦 No hay viajes completados aún.
            </p>
          )}

          {!loading && completedTrips.length > 0 && (
            <>
              {completedTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between px-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    {/* 🎨 Icono del tipo de viaje */}
                    <div className={`w-12 h-12 ${trip.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <trip.icon size={18} className="text-white" />
                    </div>
                    
                    {/* 📝 Información del viaje */}
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900">
                        {trip.type}
                      </h4>
                      <p className="text-sm text-gray-500 mb-1">
                        {trip.subtitle}
                      </p>
                      <p className="text-xs text-gray-400">
                        {trip.description}
                      </p>
                      {trip.truck && (
                        <p className="text-xs text-gray-400 mt-1">
                          🚛 {trip.truck} • {trip.driver}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* ✅ Indicador de completado */}
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" 
                      style={{ backgroundColor: '#5D9646' }}
                      title="Viaje completado"
                    ></div>
                    {trip.progreso && (
                      <span className="text-xs text-gray-400 mt-1">
                        {trip.progreso}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {/* 📊 Resumen */}
              <div className="px-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Total completados: {completedTrips.length}</span>
                  <span>
                    Últimos {Math.min(completedTrips.length, 20)} viajes
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedTrips;