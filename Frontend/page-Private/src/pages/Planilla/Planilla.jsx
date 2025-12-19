import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, FileText, Calendar, Clock, Download, 
  Eye, Trash2, Edit, AlertCircle, CheckCircle, XCircle, ClipboardList
} from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';
import ModalAgregarPlanilla from "./ModalAgregarPlanilla";

export default function Planillas() {
  const [planillas, setPlanillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalAgregar, setShowModalAgregar] = useState(false);

  // Datos de ejemplo - reemplazar con datos reales de la API
  const planillasEjemplo = [
    {
      id: 1,
      numero: 1,
      fechaInicio: '2020-01-01',
      fechaFin: '2020-01-31',
      estado: 'cerrado',
      tipo: 'quincenal',
      totalEmpleados: 45,
      totalPagado: 12500.00
    },
    {
      id: 2,
      numero: 2,
      fechaInicio: '2020-02-01',
      fechaFin: '2020-02-29',
      estado: 'cerrado',
      tipo: 'quincenal',
      totalEmpleados: 45,
      totalPagado: 12500.00
    },
    {
      id: 3,
      numero: 3,
      fechaInicio: '2020-03-01',
      fechaFin: '2020-03-31',
      estado: 'cerrado',
      tipo: 'semanal',
      totalEmpleados: 45,
      totalPagado: 12500.00
    },
    {
      id: 4,
      numero: 4,
      fechaInicio: '2020-04-01',
      fechaFin: '2020-04-30',
      estado: 'cerrado',
      tipo: 'quincenal',
      totalEmpleados: 45,
      totalPagado: 12500.00
    },
    {
      id: 5,
      numero: 5,
      fechaInicio: '2020-05-01',
      fechaFin: '2020-05-31',
      estado: 'cerrado',
      tipo: 'semanal',
      totalEmpleados: 45,
      totalPagado: 12500.00
    },
    {
      id: 6,
      numero: 6,
      fechaInicio: '2020-06-01',
      fechaFin: '2020-06-30',
      estado: 'cerrado',
      tipo: 'quincenal',
      totalEmpleados: 45,
      totalPagado: 12500.00
    },
    {
      id: 7,
      numero: 7,
      fechaInicio: '2020-07-01',
      fechaFin: '2020-07-31',
      estado: 'cerrado',
      tipo: 'quincenal',
      totalEmpleados: 45,
      totalPagado: 12500.00
    },
    {
      id: 8,
      numero: 8,
      fechaInicio: '2020-08-01',
      fechaFin: '2020-08-31',
      estado: 'activo',
      tipo: 'semanal',
      totalEmpleados: 45,
      totalPagado: 0
    }
  ];

  useEffect(() => {
    cargarPlanillas();
  }, []);

  const cargarPlanillas = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setPlanillas(planillasEjemplo);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error cargando planillas:', error);
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cantidad);
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      'activo': {
        label: 'Activo',
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircle
      },
      'cerrado': {
        label: 'Cerrado',
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle
      },
      'pendiente': {
        label: 'Pendiente',
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: AlertCircle
      }
    };
    return configs[estado] || configs['pendiente'];
  };

  const getTipoConfig = (tipo) => {
    const configs = {
      'quincenal': {
        label: 'Quincenal',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: Calendar
      },
      'semanal': {
        label: 'Semanal',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        icon: Clock
      }
    };
    return configs[tipo] || configs['quincenal'];
  };

  const handleGenerarPlanilla = () => {
    setShowModalAgregar(true);
  };

  const handleVerPlanilla = (planilla) => {
    console.log('Ver planilla:', planilla);
  };

  const handleEliminar = async (planilla) => {
    const result = await Swal.fire({
      title: '¿Eliminar planilla?',
      text: `Planilla #${planilla.numero} - ${formatearFecha(planilla.fechaInicio)}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await Swal.fire({
          title: '¡Eliminada!',
          text: 'La planilla ha sido eliminada',
          icon: 'success',
          timer: 2000
        });
        cargarPlanillas();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la planilla',
          icon: 'error'
        });
      }
    }
  };

  const planillasFiltradas = planillas.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.numero.toString().includes(searchLower) ||
      formatearFecha(p.fechaInicio).toLowerCase().includes(searchLower) ||
      formatearFecha(p.fechaFin).toLowerCase().includes(searchLower) ||
      p.tipo.toLowerCase().includes(searchLower) ||
      p.estado.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Cargando planillas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Planillas</h1>
            <p className="text-indigo-600 text-base font-semibold">
              Total: {planillas.length} planillas registradas
            </p>
          </div>
        </div>

        {/* Tarjeta de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <FileText className="text-indigo-600" size={24} />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-2">Total Planillas</p>
            <h3 className="text-3xl font-bold text-gray-900">{planillas.length}</h3>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-2">Planillas Activas</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {planillas.filter(p => p.estado === 'activo').length}
            </h3>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-2">Planillas Cerradas</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {planillas.filter(p => p.estado === 'cerrado').length}
            </h3>
          </div>
        </div>

        {/* Controles de búsqueda y botón agregar */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar planillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Icono de agregar planilla con tooltip */}
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">Agregar Planilla</span>
              <button
                onClick={handleGenerarPlanilla}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                title="Agregar Planilla"
              >
                <ClipboardList size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de planillas */}
        <div className="bg-white rounded-xl border-2 border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha Inicio</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha Final</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Total Pagado</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {planillasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500 font-medium">No hay planillas registradas</p>
                      <p className="text-gray-400 text-sm mt-1">Comienza agregando una nueva planilla</p>
                    </td>
                  </tr>
                ) : (
                  planillasFiltradas.map((planilla) => {
                    const estadoConfig = getEstadoConfig(planilla.estado);
                    const tipoConfig = getTipoConfig(planilla.tipo);
                    const EstadoIcon = estadoConfig.icon;
                    const TipoIcon = tipoConfig.icon;

                    return (
                      <tr 
                        key={planilla.id} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900 text-lg">
                            {planilla.numero}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {formatearFecha(planilla.fechaInicio)}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {formatearFecha(planilla.fechaFin)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${tipoConfig.bg} ${tipoConfig.text}`}>
                            <TipoIcon size={14} />
                            {tipoConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${estadoConfig.bg} ${estadoConfig.text} ${estadoConfig.border}`}>
                            <EstadoIcon size={14} />
                            {estadoConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          {formatearMoneda(planilla.totalPagado)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleVerPlanilla(planilla)}
                              className="p-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-600 transition-colors"
                              title="Ver Planilla"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => console.log('Generar PDF')}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                              title="Generar Planilla"
                            >
                              <Download size={18} />
                            </button>

                            {planilla.estado === 'activo' && (
                              <button
                                onClick={() => handleEliminar(planilla)}
                                className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
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

      {/* Modal Agregar Planilla */}
      <ModalAgregarPlanilla
        isOpen={showModalAgregar}
        onClose={() => setShowModalAgregar(false)}
        onCrear={(tipo) => {
          console.log('Crear planilla tipo:', tipo);
          setShowModalAgregar(false);
        }}
      />
    </div>
  );
}