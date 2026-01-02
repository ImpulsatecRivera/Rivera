import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, FileText, Calendar, Clock, Download, 
  Eye, Trash2, ChevronDown, DollarSign, Lock, TrendingUp,
  BarChart3, PieChart, Activity, Users, CheckCircle, Edit, X
} from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';

export default function Planillas() {
  const navigate = useNavigate();
  const [planillas, setPlanillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReporteMensual, setShowReporteMensual] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [añoSeleccionado, setAñoSeleccionado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todas'); // 'todas', 'quincenal', 'semanal'
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
      // Cargar planillas quincenales
      const responseQuincenal = await fetch(`${config.api.API_URL}/planillas/quincenal`);
      const dataQuincenal = await responseQuincenal.json();
      
      // Cargar planillas semanales
      const responseSemanal = await fetch(`${config.api.API_URL}/planillas/semanal`);
      const dataSemanal = await responseSemanal.json();
      
      const planillasQuincenales = (dataQuincenal.success && Array.isArray(dataQuincenal.data)) 
        ? dataQuincenal.data.map(p => ({ ...p, tipo: 'quincenal' }))
        : [];
      
      const planillasSemanales = (dataSemanal.success && Array.isArray(dataSemanal.data))
        ? dataSemanal.data.map(p => ({ ...p, tipo: 'semanal' }))
        : [];
      
      // Combinar ambas listas y ordenar por fecha
      const todasPlanillas = [...planillasQuincenales, ...planillasSemanales]
        .sort((a, b) => {
          // Ordenar por fecha de inicio o creación
          const fechaA = new Date(a.fechaInicio || a.createdAt);
          const fechaB = new Date(b.fechaInicio || b.createdAt);
          return fechaB - fechaA; // Más recientes primero
        });
      
      setPlanillas(todasPlanillas);
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
      }
    };
    return configs[estado] || configs['pendiente'];
  };

  const handleCrearPlanilla = async (tipo) => {
    setShowDropdown(false);
    
    if (tipo === 'quincenal') {
      navigate('/planilla/quincenal');
    } else if (tipo === 'semanal') {
      // Verificar si ya existe una planilla semanal pendiente
      try {
        const response = await fetch(`${config.api.API_URL}/planillas/semanal?estado=pendiente&limit=1`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Ya existe una planilla pendiente, ir a editarla
          const planillaPendiente = data.data[0];
          Swal.fire({
            icon: 'info',
            title: 'Planilla en proceso',
            text: `Ya tienes una planilla semanal pendiente. Te llevaremos a editarla.`,
            timer: 2000,
            showConfirmButton: false
          });
          navigate(`/planilla/semanal/${planillaPendiente._id}`);
        } else {
          // No existe, crear una nueva
          navigate('/planilla/semanal/nueva');
        }
      } catch (error) {
        console.error('Error verificando planillas:', error);
        // Si hay error, ir a crear nueva de todos modos
        navigate('/planilla/semanal/nueva');
      }
    }
  };

  const handleVerPlanilla = (planilla) => {
    if (planilla.tipo === 'semanal') {
      navigate(`/planilla/semanal/${planilla._id}`);
    } else {
      navigate(`/planilla/quincenales/${planilla._id}`);
    }
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
        const endpoint = planilla.tipo === 'semanal' 
          ? `${config.api.API_URL}/planillas/semanal/${planilla._id}`
          : `${config.api.API_URL}/planillas/quincenal/${planilla._id}`;
        
        const response = await fetch(endpoint, { method: 'DELETE' });
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

  const handleDescargarPDF = async (planilla) => {
    try {
      Swal.fire({
        title: 'Generando PDF...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Determinar el endpoint según el tipo de planilla
      let endpoint;
      let filename;
      
      if (planilla.tipo === 'semanal') {
        endpoint = `${config.api.API_URL}/reportes/planilla/semanal/semanal-detallado/${planilla._id}`;
        const fechaInicio = new Date(planilla.fechaInicio).toLocaleDateString('es-ES').replace(/\//g, '-');
        const fechaFin = new Date(planilla.fechaFin).toLocaleDateString('es-ES').replace(/\//g, '-');
        filename = `Planilla_Semanal_${fechaInicio}_al_${fechaFin}.pdf`;
      } else {
        endpoint = `${config.api.API_URL}/reportes/planilla/quincenal/${planilla._id}`;
        filename = `Planilla_${planilla.descripcion}_${planilla.año}_${planilla.mes}.pdf`;
      }

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: '¡Descargado!',
        text: 'El PDF se ha descargado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error descargando PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el PDF'
      });
    }
  };

  // 📊 NUEVA FUNCIÓN: Descargar reporte mensual
  const handleDescargarReporteMensual = async () => {
    if (!mesSeleccionado || !añoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor selecciona mes y año'
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Generando reporte mensual...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch(
        `${config.api.API_URL}/reportes/planilla/quincenal/mensual/${mesSeleccionado}/${añoSeleccionado}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar el reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const nombreMes = meses[parseInt(mesSeleccionado) - 1];
      
      link.download = `Reporte_Mensual_${nombreMes}_${añoSeleccionado}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowReporteMensual(false);
      setMesSeleccionado('');
      setAñoSeleccionado('');

      Swal.fire({
        icon: 'success',
        title: '¡Descargado!',
        text: 'El reporte mensual se ha descargado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error descargando reporte mensual:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo generar el reporte mensual'
      });
    }
  };

  // 📊 Calcular estadísticas (aplicando filtro de tipo)
  const planillasFiltradas = planillas.filter(p => {
    // Filtro por tipo
    if (filtroTipo !== 'todas' && p.tipo !== filtroTipo) {
      return false;
    }
    
    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        p.descripcion?.toLowerCase().includes(searchLower) ||
        p.año?.toString().includes(searchLower) ||
        p.mes?.toString().includes(searchLower) ||
        p.estado?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const estadisticas = {
    total: planillasFiltradas.length,
    pendientes: planillasFiltradas.filter(p => p.estado === 'pendiente').length,
    aprobadas: planillasFiltradas.filter(p => p.estado === 'aprobada').length,
    pagadas: planillasFiltradas.filter(p => p.estado === 'pagada').length,
    totalPagado: planillasFiltradas.reduce((sum, p) => sum + (p.totales?.totalAPagar || 0), 0),
    totalEmpleados: planillasFiltradas.reduce((sum, p) => sum + (p.empleados?.length || 0), 0),
    promedioEmpleados: planillasFiltradas.length > 0 
      ? Math.round(planillasFiltradas.reduce((sum, p) => sum + (p.empleados?.length || 0), 0) / planillasFiltradas.length)
      : 0
  };

  // Obtener años únicos de las planillas para el selector
  const añosDisponibles = [...new Set(planillas.map(p => p.año))].sort((a, b) => b - a);

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

          <div className="flex gap-3">
            {/* BOTÓN REPORTE MENSUAL */}
            <button
              onClick={() => setShowReporteMensual(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Download size={22} />
              <span>Reporte Mensual</span>
            </button>

            {/* DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Plus size={22} />
                <span>Planilla</span>
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
        </div>

        {/* MODAL REPORTE MENSUAL */}
        {showReporteMensual && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reporte Mensual</h2>
                <button
                  onClick={() => {
                    setShowReporteMensual(false);
                    setMesSeleccionado('');
                    setAñoSeleccionado('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Selector de Mes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mes
                  </label>
                  <select
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                  >
                    <option value="">Seleccionar mes</option>
                    <option value="1">Enero</option>
                    <option value="2">Febrero</option>
                    <option value="3">Marzo</option>
                    <option value="4">Abril</option>
                    <option value="5">Mayo</option>
                    <option value="6">Junio</option>
                    <option value="7">Julio</option>
                    <option value="8">Agosto</option>
                    <option value="9">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </select>
                </div>

                {/* Selector de Año */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Año
                  </label>
                  <select
                    value={añoSeleccionado}
                    onChange={(e) => setAñoSeleccionado(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                  >
                    <option value="">Seleccionar año</option>
                    {añosDisponibles.length > 0 ? (
                      añosDisponibles.map(año => (
                        <option key={año} value={año}>{año}</option>
                      ))
                    ) : (
                      <>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowReporteMensual(false);
                      setMesSeleccionado('');
                      setAñoSeleccionado('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDescargarReporteMensual}
                    disabled={!mesSeleccionado || !añoSeleccionado}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                      mesSeleccionado && añoSeleccionado
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    style={{ width: `${estadisticas.total > 0 ? (estadisticas.pendientes / estadisticas.total) * 100 : 0}%` }}
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
                    style={{ width: `${estadisticas.total > 0 ? (estadisticas.aprobadas / estadisticas.total) * 100 : 0}%` }}
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
                    style={{ width: `${estadisticas.total > 0 ? (estadisticas.pagadas / estadisticas.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de Pastel */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Resumen</h3>
              <PieChart className="text-purple-600" size={28} />
            </div>

            {/* Círculo visual - Gráfico de pastel con 3 segmentos */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="transform -rotate-90 w-48 h-48">
                {estadisticas.total > 0 ? (
                  <>
                    {/* Segmento PENDIENTE (amarillo) */}
                    {estadisticas.pendientes > 0 && (
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#f59e0b"
                        strokeWidth="20"
                        fill="transparent"
                        strokeDasharray={`${((estadisticas.pendientes / estadisticas.total) * 502).toFixed(2)} 502`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    )}
                    
                    {/* Segmento APROBADA (azul) */}
                    {estadisticas.aprobadas > 0 && (
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#3b82f6"
                        strokeWidth="20"
                        fill="transparent"
                        strokeDasharray={`${((estadisticas.aprobadas / estadisticas.total) * 502).toFixed(2)} 502`}
                        strokeDashoffset={`-${((estadisticas.pendientes / estadisticas.total) * 502).toFixed(2)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    )}
                    
                    {/* Segmento PAGADA (verde) */}
                    {estadisticas.pagadas > 0 && (
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#10b981"
                        strokeWidth="20"
                        fill="transparent"
                        strokeDasharray={`${((estadisticas.pagadas / estadisticas.total) * 502).toFixed(2)} 502`}
                        strokeDashoffset={`-${(((estadisticas.pendientes + estadisticas.aprobadas) / estadisticas.total) * 502).toFixed(2)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    )}
                  </>
                ) : (
                  /* Círculo de fondo cuando no hay datos */
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="#f3f4f6"
                    strokeWidth="20"
                    fill="transparent"
                  />
                )}
              </svg>
              
              {/* Centro del círculo */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-gray-900">{estadisticas.total}</span>
                <span className="text-sm text-gray-500 mt-1">Total</span>
              </div>
            </div>

            {/* Leyenda */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-gray-600">Pendientes</span>
                </div>
                <span className="font-bold text-gray-900">
                  {estadisticas.total > 0 ? ((estadisticas.pendientes / estadisticas.total) * 100).toFixed(0) : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Aprobadas</span>
                </div>
                <span className="font-bold text-gray-900">
                  {estadisticas.total > 0 ? ((estadisticas.aprobadas / estadisticas.total) * 100).toFixed(0) : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-600">Pagadas</span>
                </div>
                <span className="font-bold text-gray-900">
                  {estadisticas.total > 0 ? ((estadisticas.pagadas / estadisticas.total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros por Tipo */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-700">Filtrar por:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroTipo('todas')}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                  filtroTipo === 'todas'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📋 Todas ({planillas.length})
              </button>
              <button
                onClick={() => setFiltroTipo('quincenal')}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                  filtroTipo === 'quincenal'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📆 Quincenales ({planillas.filter(p => p.tipo === 'quincenal').length})
              </button>
              <button
                onClick={() => setFiltroTipo('semanal')}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                  filtroTipo === 'semanal'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📅 Semanales ({planillas.filter(p => p.tipo === 'semanal').length})
              </button>
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Tipo</th>
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
                    <td colSpan="7" className="px-6 py-12 text-center">
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
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-xs font-bold ${
                            planilla.tipo === 'semanal' 
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                          }`}>
                            {planilla.tipo === 'semanal' ? '📅 Semanal' : '📆 Quincenal'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">
                            {planilla.descripcion || `Planilla ${planilla.tipo}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {planilla.año && planilla.mes 
                            ? `${planilla.año} - Mes ${planilla.mes}` 
                            : new Date(planilla.fechaInicio).toLocaleDateString('es-ES')}
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
                            
                            {/* VER - Siempre visible, deshabilitado si está pendiente */}
                            <button
                              onClick={() => planilla.estado !== 'pendiente' && handleVerPlanilla(planilla)}
                              disabled={planilla.estado === 'pendiente'}
                              className={`p-2.5 rounded-lg border-2 transition-all ${
                                planilla.estado === 'pendiente'
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                                  : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border-transparent hover:border-cyan-300'
                              }`}
                              title={planilla.estado === 'pendiente' ? 'Planilla en edición' : 'Ver Planilla'}
                            >
                              <Eye size={18} />
                            </button>

                            {/* DESCARGAR PDF - Para todas las planillas */}
                            <button
                              onClick={() => handleDescargarPDF(planilla)}  
                              className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-transparent hover:border-blue-300 transition-all"
                              title="Descargar PDF"
                            >
                              <Download size={18} />
                            </button>

                            {/* ELIMINAR - Solo para planillas pendientes */}
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