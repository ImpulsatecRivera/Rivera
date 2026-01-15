import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Download, Edit, Check, X, Calendar, Users, 
  DollarSign, TrendingUp, FileText, Clock, AlertCircle,
  ChevronRight, Sparkles, BarChart3, PieChart, Activity
} from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';
import { api } from '../../Context/authContext';


export default function VerPlanillaQuincenal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [planilla, setPlanilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('empleados');

  useEffect(() => {
    cargarPlanilla();
  }, [id]);

 const cargarPlanilla = async () => {
  setLoading(true);
  try {
    const response = await api.get(`${config.api.API_URL}/planillas/quincenal/${id}`);
    const data = response.data;

    if (data.success) {
      setPlanilla(data.data);
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar la planilla'
    });
    navigate('/planillas');
  } finally {
    setLoading(false);
  }
};

  const marcarComoPagada = async () => {
    const { value: fechaPago } = await Swal.fire({
      title: '¿Marcar como Pagada?',
      text: 'Ingresa la fecha en que se realizó el pago',
      icon: 'question',
      input: 'date',
      inputValue: new Date().toISOString().split('T')[0],
      showCancelButton: true,
      confirmButtonColor: '#5D9646',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, marcar como pagada',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar una fecha';
        }
        const fecha = new Date(value);
        const hoy = new Date();
        if (fecha > hoy) {
          return 'La fecha no puede ser futura';
        }
      }
    });

    if (!fechaPago) return;

    try {
      const response = await api.patch(
  `${config.api.API_URL}/planillas/quincenal/${id}/estado`,
  {
    pagada: true,
    fechaPago: new Date(fechaPago).toISOString()
  }
);

const data = response.data;

if (data.success) {
  setPlanilla(data.data);
  Swal.fire({
    icon: 'success',
    title: '¡Pagada!',
    text: 'La planilla ha sido marcada como pagada',
    timer: 2000,
    showConfirmButton: false
  });
} else {
  throw new Error(data.message || 'Error al marcar como pagada');
}
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  };

  const handleDescargarPDF = async () => {
    try {
      Swal.fire({
        title: 'Generando PDF...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

     const response = await api.get(
  `${config.api.API_URL}/reportes/planilla/quincenal/${id}`,
  { responseType: 'blob' }
);



      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Planilla_${planilla.descripcion}.pdf`;
      
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
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el PDF'
      });
    }
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cantidad || 0);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoBadge = (estado) => {
    const configs = {
      'pendiente': {
        bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
        icon: Clock,
        label: 'Pendiente'
      },
      'aprobada': {
        bg: 'bg-gradient-to-r from-[#5F8EAD] to-[#5F8EAD]',
        icon: Check,
        label: 'Aprobada'
      },
      'pagada': {
        bg: 'bg-gradient-to-r from-[#5D9646] to-[#5D9646]',
        icon: DollarSign,
        label: 'Pagada'
      },
      'cerrada': {
        bg: 'bg-gradient-to-r from-[#34353A] to-[#34353A]',
        icon: X,
        label: 'Cerrada'
      }
    };
    return configs[estado] || configs['pendiente'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-[#5F8EAD] border-opacity-20 rounded-full animate-pulse"></div>
            <div className="w-24 h-24 border-4 border-[#5F8EAD] border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-[#34353A] font-semibold text-lg mt-6">Cargando planilla...</p>
        </div>
      </div>
    );
  }

  if (!planilla) return null;

  const estadoConfig = getEstadoBadge(planilla.estado);
  const EstadoIcon = estadoConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header con Glass Effect */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => navigate('/planillas')}
              className="group flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="text-gray-600 group-hover:text-[#34353A] transition-colors" size={20} />
              <span className="font-medium text-gray-700 group-hover:text-[#34353A] text-sm md:text-base">Volver</span>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={handleDescargarPDF}
                className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-[#5F8EAD] to-[#34353A] hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-sm md:text-base"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Descargar PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>

              {/* Botón Pagar */}
              {planilla.estado === 'aprobada' && !planilla.pagada && (
                <button
                  onClick={marcarComoPagada}
                  className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-[#5D9646] to-[#5D9646] hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-sm md:text-base"
                >
                  <DollarSign size={18} />
                  <span className="hidden sm:inline">Marcar como Pagada</span>
                  <span className="sm:hidden">Pagar</span>
                </button>
              )}
              
              {planilla.estado === 'pendiente' && (
                <button
                  onClick={() => navigate(`/planilla/quincenal/editar/${id}`)}
                  className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-[#34353A] to-[#5F8EAD] hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-sm md:text-base"
                >
                  <Edit size={18} />
                  <span className="hidden sm:inline">Editar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        
        {/* Hero Section con colores corporativos */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#34353A] via-[#5F8EAD] to-[#5D9646] p-6 md:p-8 shadow-2xl">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-[#5F8EAD] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-[#5D9646] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#34353A] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="text-white" size={20} />
                  <span className="text-white/80 font-medium text-xs md:text-sm uppercase tracking-wider">
                    Planilla Quincenal
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white mb-3">
                  {planilla.descripcion}
                </h1>
                <p className="text-white/90 text-sm md:text-lg">
                  {formatearFecha(planilla.fechaInicio)} - {formatearFecha(planilla.fechaFin)}
                </p>
              </div>

              {/* Estado Badge */}
              <div className={`${estadoConfig.bg} px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-xl`}>
                <div className="flex items-center gap-2 text-white">
                  <EstadoIcon size={18} />
                  <span className="font-bold text-sm md:text-lg">{estadoConfig.label}</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/20">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <Users className="text-white" size={20} />
                  <span className="text-white/80 text-xs md:text-sm font-medium">Total Empleados</span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{planilla.empleados?.length || 0}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/20">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <TrendingUp className="text-white" size={20} />
                  <span className="text-white/80 text-xs md:text-sm font-medium">Total Salarios</span>
                </div>
                <p className="text-xl md:text-3xl font-black text-white break-words">
                  {formatearMoneda(planilla.totales?.totalSalariosQuincenales)}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/20">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <DollarSign className="text-white" size={20} />
                  <span className="text-white/80 text-xs md:text-sm font-medium">Total a Pagar</span>
                </div>
                <p className="text-xl md:text-3xl font-black text-white break-words">
                  {formatearMoneda(planilla.totales?.totalAPagar)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl md:rounded-2xl p-2 shadow-sm border border-gray-200 overflow-x-auto">
          <div className="flex gap-2 min-w-max md:min-w-0">
            <button
              onClick={() => setActiveTab('empleados')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all text-sm md:text-base whitespace-nowrap ${
                activeTab === 'empleados'
                  ? 'bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users size={18} />
              <span>Empleados</span>
            </button>
            <button
              onClick={() => setActiveTab('estadisticas')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all text-sm md:text-base whitespace-nowrap ${
                activeTab === 'estadisticas'
                  ? 'bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 size={18} />
              <span>Estadísticas</span>
            </button>
            <button
              onClick={() => setActiveTab('detalles')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all text-sm md:text-base whitespace-nowrap ${
                activeTab === 'detalles'
                  ? 'bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={18} />
              <span>Detalles</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'empleados' && (
          <div className="space-y-4">
            {planilla.empleados?.map((emp, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-gray-100 hover:border-[#5F8EAD] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#5F8EAD] to-[#5D9646] flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-[#34353A]">{emp.nombreCompleto}</h3>
                      <p className="text-xs md:text-sm text-gray-500">{emp.tipoEmpleado}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Total a Pagar</p>
                    <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-[#5F8EAD] to-[#5D9646] bg-clip-text text-transparent">
                      {formatearMoneda(emp.totalAPagar)}
                    </p>
                  </div>
                </div>

                {/* Grid de información */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-[#5F8EAD] from-opacity-10 to-[#5F8EAD] to-opacity-20 rounded-lg md:rounded-xl p-3 md:p-4 border border-[#5F8EAD]">
                    <p className="text-xs text-[#FFFFF] font-semibold mb-1">Salario Quincenal</p>
                    <p className="text-base md:text-lg font-bold text-[#34353A]">{formatearMoneda(emp.salarioQuincenal)}</p>
                  </div>

                  {emp.viaticos > 0 && (
                    <div className="bg-gradient-to-br from-[#5D9646] from-opacity-10 to-[#5D9646] to-opacity-20 rounded-lg md:rounded-xl p-3 md:p-4 border border-[#5D9646]">
                      <p className="text-xs text-[#FFFFF] font-semibold mb-1">Viáticos</p>
                      <p className="text-base md:text-lg font-bold text-[#34353A]">{formatearMoneda(emp.viaticos)}</p>
                    </div>
                  )}

                  {emp.trabajoSabadoDomingo > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-purple-100">
                      <p className="text-xs text-purple-600 font-semibold mb-1">Trabajo Extra</p>
                      <p className="text-base md:text-lg font-bold text-purple-900">{formatearMoneda(emp.trabajoSabadoDomingo)}</p>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-red-100">
                    <p className="text-xs text-red-600 font-semibold mb-1">Total Descuentos</p>
                    <p className="text-base md:text-lg font-bold text-red-900">{formatearMoneda(emp.totalDescuentos)}</p>
                  </div>
                </div>

                {/* Descuentos detallados - Colapsable */}
                <details className="mt-4 group/details">
                  <summary className="cursor-pointer list-none flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <span className="font-semibold text-[#34353A] text-sm md:text-base">Ver descuentos detallados</span>
                    <ChevronRight className="text-gray-400 group-open/details:rotate-90 transition-transform" size={20} />
                  </summary>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ISSS (3%)</p>
                      <p className="font-bold text-[#34353A] text-sm md:text-base">{formatearMoneda(emp.descuentosLey?.isss?.monto)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">AFP (7.25%)</p>
                      <p className="font-bold text-[#34353A] text-sm md:text-base">{formatearMoneda(emp.descuentosLey?.afp?.monto)}</p>
                    </div>
                    {emp.descuentosLey?.renta?.monto > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Renta</p>
                        <p className="font-bold text-[#34353A] text-sm md:text-base">{formatearMoneda(emp.descuentosLey?.renta?.monto)}</p>
                      </div>
                    )}
                    {emp.otrosDescuentos?.anticipos > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Anticipos</p>
                        <p className="font-bold text-[#34353A] text-sm md:text-base">{formatearMoneda(emp.otrosDescuentos?.anticipos)}</p>
                      </div>
                    )}
                    {emp.otrosDescuentos?.prestamos > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Préstamos</p>
                        <p className="font-bold text-[#34353A] text-sm md:text-base">{formatearMoneda(emp.otrosDescuentos?.prestamos)}</p>
                      </div>
                    )}
                    {emp.otrosDescuentos?.otros > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Otros</p>
                        <p className="font-bold text-[#34353A] text-sm md:text-base">{formatearMoneda(emp.otrosDescuentos?.otros)}</p>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'estadisticas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfica de distribución de salarios */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="text-[#5F8EAD]" size={28} />
                <h3 className="text-lg md:text-xl font-bold text-[#34353A]">Distribución de Pagos</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm font-semibold text-gray-700">Salarios Base</span>
                    <span className="text-xs md:text-sm font-bold text-[#5F8EAD]">
                      {formatearMoneda(planilla.totales?.totalSalariosQuincenales)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#5F8EAD] to-[#34353A] h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, (planilla.totales?.totalSalariosQuincenales / planilla.totales?.totalSalariosMasViaticos) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {planilla.totales?.totalViaticos > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm font-semibold text-gray-700">Viáticos</span>
                      <span className="text-xs md:text-sm font-bold text-[#5D9646]">
                        {formatearMoneda(planilla.totales?.totalViaticos)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#5D9646] to-[#5D9646] h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, (planilla.totales?.totalViaticos / planilla.totales?.totalSalariosMasViaticos) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {planilla.totales?.totalTrabajoSabadoDomingo > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm font-semibold text-gray-700">Trabajo Extra</span>
                      <span className="text-xs md:text-sm font-bold text-purple-600">
                        {formatearMoneda(planilla.totales?.totalTrabajoSabadoDomingo)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, (planilla.totales?.totalTrabajoSabadoDomingo / planilla.totales?.totalSalariosMasViaticos) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm font-semibold text-gray-700">Descuentos</span>
                    <span className="text-xs md:text-sm font-bold text-red-600">
                      -{formatearMoneda(planilla.totales?.totalDescuentos)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, (planilla.totales?.totalDescuentos / planilla.totales?.totalSalariosMasViaticos) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de descuentos */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="text-[#5D9646]" size={28} />
                <h3 className="text-lg md:text-xl font-bold text-[#34353A]">Descuentos de Ley</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#5F8EAD] to-[#5F8EAD] rounded-xl border border-[#5F8EAD]">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs md:text-sm text-white font-semibold">ISSS (3%)</p>
                    <p className="text-xs text-white mt-1">Seguro Social</p>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-white whitespace-nowrap">
                    {formatearMoneda(planilla.totales?.totalISSS)}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#34353A] to-[#34353A] rounded-xl border border-[#34353A]">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs md:text-sm text-white font-semibold">AFP (7.25%)</p>
                    <p className="text-xs text-white mt-1">Pensiones</p>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-white whitespace-nowrap">
                    {formatearMoneda(planilla.totales?.totalAFP)}
                  </p>
                </div>

                {planilla.totales?.totalRenta > 0 && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs md:text-sm text-purple-600 font-semibold">Renta</p>
                      <p className="text-xs text-purple-500 mt-1">Impuesto sobre la Renta</p>
                    </div>
                    <p className="text-xl md:text-2xl font-black text-purple-900 whitespace-nowrap">
                      {formatearMoneda(planilla.totales?.totalRenta)}
                    </p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gradient-to-r from-[#34353A] to-[#34353A] rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-sm md:text-base">Total Descuentos</span>
                    <span className="text-xl md:text-2xl font-black text-white whitespace-nowrap">
                      {formatearMoneda(planilla.totales?.totalDescuentos)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promedio por empleado */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#34353A] to-[#5F8EAD] rounded-2xl p-6 md:p-8 text-white shadow-2xl">
              <h3 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
                <TrendingUp size={24} className="md:w-7 md:h-7" />
                Análisis Promedio por Empleado
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-5 border border-white/20">
                  <p className="text-white/80 text-xs md:text-sm mb-2">Salario Promedio</p>
                  <p className="text-2xl md:text-3xl font-black break-words">
                    {formatearMoneda(planilla.totales?.totalSalariosQuincenales / planilla.empleados?.length)}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-5 border border-white/20">
                  <p className="text-white/80 text-xs md:text-sm mb-2">Descuento Promedio</p>
                  <p className="text-2xl md:text-3xl font-black break-words">
                    {formatearMoneda(planilla.totales?.totalDescuentos / planilla.empleados?.length)}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-5 border border-white/20">
                  <p className="text-white/80 text-xs md:text-sm mb-2">Pago Promedio</p>
                  <p className="text-2xl md:text-3xl font-black break-words">
                    {formatearMoneda(planilla.totales?.totalAPagar / planilla.empleados?.length)}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-5 border border-white/20">
                  <p className="text-white/80 text-xs md:text-sm mb-2">% Descuento Promedio</p>
                  <p className="text-2xl md:text-3xl font-black">
                    {((planilla.totales?.totalDescuentos / planilla.totales?.totalSalariosMasViaticos) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detalles' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información General */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
              <h3 className="text-lg md:text-xl font-bold text-[#34353A] mb-6 flex items-center gap-3">
                <FileText className="text-[#5F8EAD]" size={24} />
                Información General
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium text-sm md:text-base">Año</span>
                  <span className="text-[#34353A] font-bold text-sm md:text-base">{planilla.año}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium text-sm md:text-base">Mes</span>
                  <span className="text-[#34353A] font-bold text-sm md:text-base">{planilla.mes}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium text-sm md:text-base">Quincena</span>
                  <span className="text-[#34353A] font-bold text-sm md:text-base">
                    {planilla.quincena === 1 ? 'Primera' : 'Segunda'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium text-sm md:text-base">Fecha Inicio</span>
                  <span className="text-[#34353A] font-bold text-sm md:text-base">{formatearFecha(planilla.fechaInicio)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium text-sm md:text-base">Fecha Fin</span>
                  <span className="text-[#34353A] font-bold text-sm md:text-base">{formatearFecha(planilla.fechaFin)}</span>
                </div>
              </div>
            </div>

            {/* Resumen Financiero */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
              <h3 className="text-lg md:text-xl font-bold text-[#34353A] mb-6 flex items-center gap-3">
                <DollarSign className="text-[#5D9646]" size={24} />
                Resumen Financiero
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#5F8EAD] to-[#5F8EAD] rounded-xl">
                  <span className="text-white font-semibold text-sm md:text-base">Salarios Quincenales</span>
                  <span className="text-white font-bold text-base md:text-lg whitespace-nowrap">
                    {formatearMoneda(planilla.totales?.totalSalariosQuincenales)}
                  </span>
                </div>

                {planilla.totales?.totalViaticos > 0 && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#5D9646] to-[#5D9646] rounded-xl">
                    <span className="text-white font-semibold text-sm md:text-base">Viáticos</span>
                    <span className="text-white font-bold text-base md:text-lg whitespace-nowrap">
                      {formatearMoneda(planilla.totales?.totalViaticos)}
                    </span>
                  </div>
                )}

                {planilla.totales?.totalTrabajoSabadoDomingo > 0 && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-purple-600 rounded-xl">
                    <span className="text-white font-semibold text-sm md:text-base">Trabajo Extra</span>
                    <span className="text-white font-bold text-base md:text-lg whitespace-nowrap">
                      {formatearMoneda(planilla.totales?.totalTrabajoSabadoDomingo)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#5F8EAD] to-[#5F8EAD] rounded-xl border-2 border-[#5F8EAD]">
                  <span className="text-white font-bold text-sm md:text-base">Subtotal</span>
                  <span className="text-white font-black text-lg md:text-xl whitespace-nowrap">
                    {formatearMoneda(planilla.totales?.totalSalariosMasViaticos)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-red-600 rounded-xl">
                  <span className="text-white font-semibold text-sm md:text-base">Descuentos</span>
                  <span className="text-white font-bold text-base md:text-lg whitespace-nowrap">
                    -{formatearMoneda(planilla.totales?.totalDescuentos)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-5 md:p-6 bg-gradient-to-r from-[#34353A] to-[#5D9646] rounded-xl mt-4">
                  <span className="text-white font-bold text-base md:text-lg">TOTAL A PAGAR</span>
                  <span className="text-white font-black text-2xl md:text-3xl whitespace-nowrap">
                    {formatearMoneda(planilla.totales?.totalAPagar)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notas si existen */}
            {planilla.notas && (
              <div className="lg:col-span-2 bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="text-amber-900 font-bold text-base md:text-lg mb-2">Notas</h4>
                    <p className="text-amber-800 text-sm md:text-base">{planilla.notas}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Animaciones CSS */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}