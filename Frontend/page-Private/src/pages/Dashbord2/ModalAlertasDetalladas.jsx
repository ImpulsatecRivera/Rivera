import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  Fuel,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  Truck,
  Users,
  AlertCircle
} from 'lucide-react';
import { config } from '../../config';

const ModalAlertasDetalladas = ({ isOpen, onClose }) => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  useEffect(() => {
    if (isOpen) {
      cargarAlertasDetalladas();
    }
  }, [isOpen]);

  const cargarAlertasDetalladas = async () => {
    setLoading(true);
    try {
      // 🔹 Obtener datos de todos los módulos
      const [viajesRes, mantoRes, dieselRes, cajaRes, planillasRes] = await Promise.all([
        fetch(`${config.api.API_URL}/viajes-operativos/listar`),
        fetch(`${config.api.API_URL}/mantenimientos`),
        fetch(`${config.api.API_URL}/resumen`),
        fetch(`${config.api.API_URL}/cajaChica`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch(`${config.api.API_URL}/planillas/quincenal`)
      ]);

      const [viajesData, mantoData, dieselData, cajaData, planillasData] = await Promise.all([
        viajesRes.json(),
        mantoRes.json(),
        dieselRes.json(),
        cajaRes.json(),
        planillasRes.json()
      ]);

      const viajes = viajesData?.data || [];
      const mantenimientos = mantoData?.data || [];
      const diesel = dieselData?.data || (Array.isArray(dieselData) ? dieselData : []);
      const transacciones = Array.isArray(cajaData) ? cajaData : [];
      const planillas = planillasData?.data || [];

      const alertasGeneradas = [];

      // 🚨 ALERTAS DE MANTENIMIENTOS
      const mantoPendientes = mantenimientos.filter(m => m?.estado === 'pendiente');
      if (mantoPendientes.length > 0) {
        mantoPendientes.forEach(m => {
          const diasPendiente = Math.floor((new Date() - new Date(m?.fecha_mantenimiento)) / (1000 * 60 * 60 * 24));
          alertasGeneradas.push({
            id: `manto-${m._id}`,
            categoria: 'mantenimientos',
            prioridad: diasPendiente > 7 ? 'alta' : diasPendiente > 3 ? 'media' : 'baja',
            icono: Wrench,
            titulo: `Mantenimiento pendiente - ${m?.ciculatioCard?.licensePlate || 'N/A'}`,
            descripcion: m?.descripcion || 'Sin descripción',
            detalle: `Tipo: ${m?.tipo_de_mantenimiento || 'N/A'}`,
            fecha: m?.fecha_mantenimiento,
            diasPendiente: diasPendiente,
            accion: `/mantenimientos/editar/${m._id}`
          });
        });
      }

      // 🚨 ALERTAS DE VIAJES OPERATIVOS
      const viajesPendientes = viajes.filter(v => {
        const estado = (v?.estado?.actual || v?.estado || '').toLowerCase();
        return estado === 'pendiente';
      });
      
      if (viajesPendientes.length > 0) {
        viajesPendientes.forEach(v => {
          const diasParaSalida = Math.floor((new Date(v?.departureTime) - new Date()) / (1000 * 60 * 60 * 24));
          alertasGeneradas.push({
            id: `viaje-${v._id}`,
            categoria: 'viajes',
            prioridad: diasParaSalida <= 1 ? 'alta' : diasParaSalida <= 3 ? 'media' : 'baja',
            icono: Truck,
            titulo: `Viaje pendiente - ${v?.clienteNombre || 'Cliente'}`,
            descripcion: v?.rutaDirecta?.rutaCompleta || 'Ruta no especificada',
            detalle: `Salida: ${new Date(v?.departureTime).toLocaleDateString('es-ES')}`,
            fecha: v?.departureTime,
            diasParaSalida: diasParaSalida,
            accion: `/viajesInternos/editar/${v._id}`
          });
        });
      }

      // 🚨 ALERTAS DE DIÉSEL
      const dieselPendientes = diesel.filter(d => {
        const estado = (d?.estado || d?.Estado || 'pendiente').toLowerCase();
        return estado === 'pendiente';
      });

      if (dieselPendientes.length > 0) {
        dieselPendientes.forEach(d => {
          const diasPendiente = Math.floor((new Date() - new Date(d?.fecha || d?.date)) / (1000 * 60 * 60 * 24));
          alertasGeneradas.push({
            id: `diesel-${d._id}`,
            categoria: 'diesel',
            prioridad: diasPendiente > 5 ? 'alta' : 'media',
            icono: Fuel,
            titulo: `Registro de diésel pendiente`,
            descripcion: `Camión: ${d?.CicurlationCard?.licensePlate || d?.placa || 'N/A'}`,
            detalle: `Galones: ${d?.Galones || d?.galones || 0} - Total: $${d?.Total || d?.total || 0}`,
            fecha: d?.fecha || d?.date,
            diasPendiente: diasPendiente,
            accion: `/diesel/editar/${d._id}`
          });
        });
      }

      // 🚨 ALERTAS DE PLANILLAS
      const planillasPendientes = planillas.filter(p => p?.estado === 'pendiente');
      if (planillasPendientes.length > 0) {
        planillasPendientes.forEach(p => {
          alertasGeneradas.push({
            id: `planilla-${p._id}`,
            categoria: 'planillas',
            prioridad: 'media',
            icono: FileText,
            titulo: `Planilla pendiente de aprobación`,
            descripcion: p?.descripcion || 'Sin descripción',
            detalle: `${p?.empleados?.length || 0} empleados - Total: $${p?.totales?.totalAPagar || 0}`,
            fecha: p?.createdAt,
            accion: `/planilla/quincenales/${p._id}`
          });
        });
      }

      // 🚨 ALERTAS DE CAJA CHICA (si el balance es bajo)
      const cajaBalanceRes = await fetch(`${config.api.API_URL}/cajaChica/balance`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const cajaBalanceData = await cajaBalanceRes.json();
      const balance = cajaBalanceData?.currentBalance || 0;

      if (balance < 500) {
        alertasGeneradas.push({
          id: 'caja-chica-bajo',
          categoria: 'caja-chica',
          prioridad: balance < 200 ? 'alta' : 'media',
          icono: DollarSign,
          titulo: 'Balance de Caja Chica bajo',
          descripcion: `Balance actual: $${balance.toFixed(2)}`,
          detalle: 'Considera realizar un reintegro',
          fecha: new Date(),
          accion: '/caja-chica'
        });
      }

      // 🚨 ALERTAS DE ÉXITO (Viajes completados recientemente)
      const viajesCompletados = viajes.filter(v => {
        const estado = (v?.estado?.actual || v?.estado || '').toLowerCase();
        const fechaCompletado = new Date(v?.arrivalTime || v?.updatedAt);
        const diasDesdeCompletado = Math.floor((new Date() - fechaCompletado) / (1000 * 60 * 60 * 24));
        return ['completado', 'completed'].includes(estado) && diasDesdeCompletado <= 7;
      });

      if (viajesCompletados.length > 0) {
        alertasGeneradas.push({
          id: 'viajes-completados',
          categoria: 'exito',
          prioridad: 'baja',
          icono: CheckCircle,
          titulo: '✅ Viajes completados exitosamente',
          descripcion: `${viajesCompletados.length} viajes completados en los últimos 7 días`,
          detalle: 'Buen trabajo del equipo',
          fecha: new Date(),
          tipo: 'exito'
        });
      }

      // Ordenar por prioridad
      const prioridadOrden = { alta: 1, media: 2, baja: 3 };
      alertasGeneradas.sort((a, b) => prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad]);

      setAlertas(alertasGeneradas);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      alta: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', label: '🔴 Alta' },
      media: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', label: '🟡 Media' },
      baja: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: '🟢 Baja' }
    };
    return badges[prioridad] || badges.baja;
  };

  const getCategoriaBadge = (categoria) => {
    const badges = {
      mantenimientos: { bg: 'bg-orange-50', text: 'text-orange-700' },
      viajes: { bg: 'bg-blue-50', text: 'text-blue-700' },
      diesel: { bg: 'bg-purple-50', text: 'text-purple-700' },
      planillas: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
      'caja-chica': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
      exito: { bg: 'bg-green-50', text: 'text-green-700' }
    };
    return badges[categoria] || badges.viajes;
  };

  const alertasFiltradas = filtroCategoria === 'todas' 
    ? alertas 
    : alertas.filter(a => a.categoria === filtroCategoria);

  const categorias = [
    { value: 'todas', label: 'Todas', count: alertas.length },
    { value: 'mantenimientos', label: 'Mantenimientos', count: alertas.filter(a => a.categoria === 'mantenimientos').length },
    { value: 'viajes', label: 'Viajes', count: alertas.filter(a => a.categoria === 'viajes').length },
    { value: 'diesel', label: 'Diésel', count: alertas.filter(a => a.categoria === 'diesel').length },
    { value: 'planillas', label: 'Planillas', count: alertas.filter(a => a.categoria === 'planillas').length },
    { value: 'caja-chica', label: 'Caja Chica', count: alertas.filter(a => a.categoria === 'caja-chica').length }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fadeIn">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <AlertCircle className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Centro de Alertas</h2>
              <p className="text-white/80 text-sm">Resumen de todas las notificaciones del sistema</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* Filtros */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 overflow-x-auto">
            {categorias.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFiltroCategoria(cat.value)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  filtroCategoria === cat.value
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat.label}
                {cat.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    filtroCategoria === cat.value ? 'bg-white/20' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Cargando alertas...</p>
            </div>
          ) : alertasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">¡Todo en orden!</h3>
              <p className="text-gray-600">No hay alertas en esta categoría</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertasFiltradas.map((alerta) => {
                const Icono = alerta.icono;
                const prioridadBadge = getPrioridadBadge(alerta.prioridad);
                const categoriaBadge = getCategoriaBadge(alerta.categoria);

                return (
                  <div
                    key={alerta.id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
                    onClick={() => {
                      if (alerta.accion) {
                        window.location.href = alerta.accion;
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icono */}
                      <div className={`p-3 ${categoriaBadge.bg} rounded-xl`}>
                        <Icono className={categoriaBadge.text} size={24} />
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">{alerta.titulo}</h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${prioridadBadge.bg} ${prioridadBadge.text} ${prioridadBadge.border}`}>
                            {prioridadBadge.label}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-2">{alerta.descripcion}</p>
                        <p className="text-sm text-gray-500 mb-3">{alerta.detalle}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {alerta.fecha && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{new Date(alerta.fecha).toLocaleDateString('es-ES')}</span>
                            </div>
                          )}

                          {alerta.diasPendiente !== undefined && alerta.diasPendiente > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{alerta.diasPendiente} días pendiente</span>
                            </div>
                          )}

                          {alerta.diasParaSalida !== undefined && (
                            <div className="flex items-center gap-1">
                              <TrendingUp size={14} />
                              <span>
                                {alerta.diasParaSalida > 0 
                                  ? `En ${alerta.diasParaSalida} días` 
                                  : alerta.diasParaSalida === 0 
                                  ? '¡Hoy!' 
                                  : `Hace ${Math.abs(alerta.diasParaSalida)} días`
                                }
                              </span>
                            </div>
                          )}

                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${categoriaBadge.bg} ${categoriaBadge.text}`}>
                            {alerta.categoria}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-bold">{alertasFiltradas.length}</span> alertas
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ModalAlertasDetalladas;