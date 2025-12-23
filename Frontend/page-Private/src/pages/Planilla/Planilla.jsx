import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, FileText, Calendar, Clock, Download, 
  Eye, Trash2, ChevronDown, DollarSign, Lock, TrendingUp,
  BarChart3, PieChart, Activity, Users, CheckCircle
} from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';

export default function Planillas() {
  const navigate = useNavigate();
  const [planillas, setPlanillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    cargarPlanillas();
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cargarPlanillas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.api.API_URL}/planillas/quincenal`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setPlanillas(data.data);
      } else {
        setPlanillas([]);
      }
    } catch (error) {
      console.error('Error cargando planillas:', error);
      setPlanillas([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las planillas'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cantidad || 0);
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      'pendiente': {
        label: 'Pendiente',
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300',
        icon: Clock
      },
      'aprobada': {
        label: 'Aprobada',
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        icon: CheckCircle
      },
      'pagada': {
        label: 'Pagada',
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        icon: DollarSign
      },
      'cerrada': {
        label: 'Cerrada',
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: Lock
      }
    };
    return configs[estado] || configs['pendiente'];
  };

  const handleCrearPlanilla = async (tipo) => {
    setShowDropdown(false);
    
    if (tipo === 'quincenal') {
      // Redirigir a la vista de planilla quincenal
      navigate('/planilla-quincenal');
    } else if (tipo === 'semanal') {
      Swal.fire({
        icon: 'info',
        title: 'Próximamente',
        text: 'La planilla semanal estará disponible pronto'
      });
    }
  };

  const handleVerPlanilla = (planilla) => {
    navigate(`/planilla-quincenal/${planilla._id}`);
  };

  const handleEliminar = async (planilla) => {
    if (planilla.estado !== 'pendiente') {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede eliminar',
        text: 'Solo se pueden eliminar planillas en estado pendiente'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Eliminar planilla?',
      text: `${planilla.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${config.api.API_URL}/planillas/quincenal/${planilla._id}`,
          { method: 'DELETE' }
        );

        const data = await response.json();

        if (data.success) {
          await Swal.fire({
            title: '¡Eliminada!',
            text: 'La planilla ha sido eliminada',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          cargarPlanillas();
        } else {
          throw new Error(data.message || 'Error al eliminar');
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error'
        });
      }
    }
  };

  // 📊 Calcular estadísticas
  const estadisticas = {
    total: planillas.length,
    pendientes: planillas.filter(p => p.estado === 'pendiente').length,
    aprobadas: planillas.filter(p => p.estado === 'aprobada').length,
    pagadas: planillas.filter(p => p.estado === 'pagada').length,
    cerradas: planillas.filter(p => p.estado === 'cerrada').length,
    totalPagado: planillas.reduce((sum, p) => sum + (p.totales?.totalAPagar || 0), 0),
    totalEmpleados: planillas.reduce((sum, p) => sum + (p.empleados?.length || 0), 0),
    promedioEmpleados: planillas.length > 0 
      ? Math.round(planillas.reduce((sum, p) => sum + (p.empleados?.length || 0), 0) / planillas.length)
      : 0
  };

  const planillasFiltradas = planillas.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.descripcion?.toLowerCase().includes(searchLower) ||
      p.año?.toString().includes(searchLower) ||
      p.mes?.toString().includes(searchLower) ||
      p.estado?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold text-xl">Cargando planillas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard de Planillas</h1>
            <p className="text-indigo-600 text-base font-semibold">
              Gestión y análisis de nómina
            </p>
          </div>

          {/* 🔥 DROPDOWN MEJORADO */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Plus size={22} />
              <span>Nueva Planilla</span>
              <ChevronDown 
                size={20} 
                className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50 animate-fadeIn">
                <div className="p-2">
                  <button
                    onClick={() => handleCrearPlanilla('quincenal')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 rounded-lg transition-colors group"
                  >
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <Calendar className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Planilla Quincenal</p>
                      <p className="text-xs text-gray-500">Pago cada 15 días</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleCrearPlanilla('semanal')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 rounded-lg transition-colors group mt-1"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Clock className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Planilla Semanal</p>
                      <p className="text-xs text-gray-500">Pago cada 7 días</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 📊 TARJETAS DE ESTADÍSTICAS CON GRÁFICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Planillas */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <FileText className="text-indigo-600" size={28} />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <TrendingUp size={16} />
                <span>+12%</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Planillas</p>
            <h3 className="text-4xl font-black text-gray-900 mb-2">{estadisticas.total}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all"
                  style={{ width: '75%' }}
                ></div>
              </div>
              <span>75%</span>
            </div>
          </div>

          {/* Total Pagado */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <DollarSign className="text-emerald-600" size={28} />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <TrendingUp size={16} />
                <span>+8%</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Pagado</p>
            <h3 className="text-3xl font-black text-gray-900 mb-2">
              {formatearMoneda(estadisticas.totalPagado)}
            </h3>
            <p className="text-xs text-gray-500">En todas las planillas</p>
          </div>

          {/* Planillas Pendientes */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="text-amber-600" size={28} />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Pendientes</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-black text-gray-900">{estadisticas.pendientes}</h3>
              <div className="flex gap-1 mb-2">
                <div className="w-1 bg-amber-200 rounded-full h-8"></div>
                <div className="w-1 bg-amber-300 rounded-full h-10"></div>
                <div className="w-1 bg-amber-400 rounded-full h-6"></div>
                <div className="w-1 bg-amber-500 rounded-full h-12"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Requieren aprobación</p>
          </div>

          {/* Total Empleados */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="text-blue-600" size={28} />
              </div>
              <Activity className="text-blue-400" size={24} />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Empleados</p>
            <h3 className="text-4xl font-black text-gray-900 mb-2">{estadisticas.totalEmpleados}</h3>
            <p className="text-xs text-gray-500">
              Promedio: {estadisticas.promedioEmpleados} por planilla
            </p>
          </div>
        </div>

        {/* 📊 GRÁFICA DE ESTADOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfica de barras - Estados */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Distribución por Estado</h3>
                <p className="text-sm text-gray-500 mt-1">Resumen de planillas activas</p>
              </div>
              <BarChart3 className="text-indigo-600" size={28} />
            </div>

            {/* Barra de estados */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Pendientes</span>
                  <span className="text-sm font-bold text-amber-600">{estadisticas.pendientes}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all"
                    style={{ width: `${(estadisticas.pendientes / estadisticas.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Aprobadas</span>
                  <span className="text-sm font-bold text-blue-600">{estadisticas.aprobadas}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${(estadisticas.aprobadas / estadisticas.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Pagadas</span>
                  <span className="text-sm font-bold text-emerald-600">{estadisticas.pagadas}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${(estadisticas.pagadas / estadisticas.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Cerradas</span>
                  <span className="text-sm font-bold text-red-600">{estadisticas.cerradas}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-400 to-red-600 h-full rounded-full transition-all"
                    style={{ width: `${(estadisticas.cerradas / estadisticas.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen circular */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Resumen</h3>
              <PieChart className="text-purple-600" size={28} />
            </div>

            {/* Círculo visual */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#f3f4f6"
                  strokeWidth="20"
                  fill="transparent"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="url(#gradient)"
                  strokeWidth="20"
                  fill="transparent"
                  strokeDasharray={`${(estadisticas.cerradas / estadisticas.total) * 502} 502`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-gray-900">{estadisticas.cerradas}</span>
                <span className="text-sm text-gray-500 mt-1">Cerradas</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Completadas</span>
                <span className="font-bold text-gray-900">
                  {Math.round((estadisticas.cerradas / estadisticas.total) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">En proceso</span>
                <span className="font-bold text-gray-900">
                  {Math.round(((estadisticas.pendientes + estadisticas.aprobadas) / estadisticas.total) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar planillas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Tabla de planillas */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-4 border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Período</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Empleados</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">Total a Pagar</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {planillasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500 font-medium">No hay planillas registradas</p>
                      <p className="text-gray-400 text-sm mt-1">Comienza creando una nueva planilla</p>
                    </td>
                  </tr>
                ) : (
                  planillasFiltradas.map((planilla) => {
                    const estadoConfig = getEstadoConfig(planilla.estado);
                    const EstadoIcon = estadoConfig.icon;

                    return (
                      <tr 
                        key={planilla._id} 
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">
                            {planilla.descripcion}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {planilla.año} - Mes {planilla.mes}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                            {planilla.empleados?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-xs font-bold ${estadoConfig.bg} ${estadoConfig.text} ${estadoConfig.border}`}>
                            <EstadoIcon size={14} />
                            {estadoConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                          {formatearMoneda(planilla.totales?.totalAPagar)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleVerPlanilla(planilla)}
                              className="p-2.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border-2 border-transparent hover:border-cyan-300 transition-all"
                              title="Ver Planilla"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => console.log('Generar PDF')}
                              className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-transparent hover:border-blue-300 transition-all"
                              title="Descargar PDF"
                            >
                              <Download size={18} />
                            </button>

                            {planilla.estado === 'pendiente' && (
                              <button
                                onClick={() => handleEliminar(planilla)}
                                className="p-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border-2 border-transparent hover:border-red-300 transition-all"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Agregar animación para dropdown */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}