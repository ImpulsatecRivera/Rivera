import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, Calendar, Users, DollarSign, 
  CheckCircle, Lock, AlertCircle, Download, Edit2,
  Plus, Trash2, X, Check, Clock, FileText
} from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';
import { useAuth } from '../../Context/authContext';
import { api } from '../../Context/authContext';

export default function PlanillaSemanal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && user && user.userType !== 'Administrador') {
      navigate('/no-access');
    }
  }, [user, authLoading, navigate]);
  
  const [planilla, setPlanilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editandoCelda, setEditandoCelda] = useState(null); // { empleadoId, dia, campo }
  const [valorTemp, setValorTemp] = useState('');
  const [guardando, setGuardando] = useState(false);
  const inputRef = useRef(null);

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const diasLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    if (id) {
      cargarPlanilla();
    } else {
      // Modo creación
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (editandoCelda && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editandoCelda]);

  const cargarPlanilla = async () => {
    try {
     const response = await api.get(`${config.api.API_URL}/planillas/semanal/${id}`);
const data = response.data;

      
      if (data.success) {
        setPlanilla(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error cargando planilla:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la planilla'
      });
      navigate('/planilla');
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(cantidad || 0);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const handleClickCelda = (empleadoId, dia, campo, valorActual) => {
    if (planilla.estado === 'pagada') {
      Swal.fire({
        icon: 'warning',
        title: 'Planilla Pagada',
        text: 'No se puede editar una planilla que ya fue pagada',
        timer: 2000
      });
      return;
    }

    setEditandoCelda({ empleadoId, dia, campo });
    setValorTemp(valorActual?.toString() || '0');
  };

  const handleGuardarCelda = async () => {
    if (!editandoCelda) return;

    const { empleadoId, dia, campo } = editandoCelda;
    const valor = parseFloat(valorTemp) || 0;

    if (valor < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Valor inválido',
        text: 'El valor no puede ser negativo',
        timer: 2000
      });
      return;
    }

    setGuardando(true);

    try {
      let endpoint = '';
      let body = {};

      if (campo === 'viaticos') {
        // PATCH /api/planillas/semanal/:id/empleado/:empleadoId/dia/:dia
        endpoint = `${config.api.API_URL}/planillas/semanal/${planilla._id}/empleado/${empleadoId}/dia/${dia}`;
        body = { viaticos: valor };
      } else if (campo === 'anticipos') {
        // PATCH /api/planillas/semanal/:id/empleado/:empleadoId/montos
        endpoint = `${config.api.API_URL}/planillas/semanal/${planilla._id}/empleado/${empleadoId}/montos`;
        body = { anticipos: valor };
      }

     const response = await api.patch(endpoint, body);
const data = response.data;


      if (data.success) {
        // Recargar planilla para ver cambios
        await cargarPlanilla();
        setEditandoCelda(null);
        setValorTemp('');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error guardando celda:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar el cambio'
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelarEdicion = () => {
    setEditandoCelda(null);
    setValorTemp('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGuardarCelda();
    } else if (e.key === 'Escape') {
      handleCancelarEdicion();
    }
  };

  const handleMarcarFalta = async (empleadoId, dia) => {
    if (planilla.estado === 'pagada') {
      Swal.fire({
        icon: 'warning',
        title: 'Planilla Pagada',
        text: 'No se puede marcar faltas en una planilla pagada',
        timer: 2000
      });
      return;
    }

    const { value: descuento } = await Swal.fire({
      title: 'Marcar Falta Injustificada',
      text: `${dia.charAt(0).toUpperCase() + dia.slice(1)}`,
      input: 'number',
      inputLabel: 'Monto a descontar',
      inputPlaceholder: 'Ejemplo: 25.50',
      inputAttributes: {
        min: '0',
        step: '0.01'
      },
      showCancelButton: true,
      confirmButtonText: 'Marcar Falta',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || parseFloat(value) <= 0) {
          return 'Debes ingresar un monto válido mayor a 0';
        }
      }
    });

    if (descuento) {
      try {
       const endpoint = `${config.api.API_URL}/planillas/semanal/${planilla._id}/empleado/${empleadoId}/dia/${dia}/falta`;

const response = await api.post(endpoint, {
  descuentoFalta: parseFloat(descuento)
});

const data = response.data;



        if (data.success) {
          await cargarPlanilla();
          Swal.fire({
            icon: 'success',
            title: 'Falta Marcada',
            text: `Descuento de ${formatearMoneda(descuento)} aplicado`,
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message
        });
      }
    }
  };

  const handleDesmarcarFalta = async (empleadoId, dia) => {
    const result = await Swal.fire({
      title: '¿Desmarcar Falta?',
      text: `Se eliminará el descuento del ${dia}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, desmarcar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
     const endpoint = `${config.api.API_URL}/planillas/semanal/${planilla._id}/empleado/${empleadoId}/dia/${dia}/falta`;

const response = await api.delete(endpoint);
const data = response.data;



        if (data.success) {
          await cargarPlanilla();
          Swal.fire({
            icon: 'success',
            title: 'Falta Desmarcada',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message
        });
      }
    }
  };

  const handleDescargarPDF = async () => {
  try {
    Swal.fire({
      title: 'Generando PDF...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const endpoint = `${config.api.API_URL}/reportes/planilla/semanal/detallado/${planilla._id}`;

    const response = await api.get(endpoint, {
      responseType: 'blob'
    });

    const blob = response.data;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    const fechaInicio = new Date(planilla.fechaInicio).toLocaleDateString('es-ES').replace(/\//g, '-');
    const fechaFin = new Date(planilla.fechaFin).toLocaleDateString('es-ES').replace(/\//g, '-');

    link.href = url;
    link.download = `Planilla_Semanal_${fechaInicio}_al_${fechaFin}.pdf`;

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
      title: 'Error al generar PDF',
      text: error.response?.data?.message || error.message
    });
  }
};


  const handleCambiarEstado = async (nuevoEstado) => {
    // Validar que config esté disponible
    if (!config || !config.api || !config.api.API_URL) {
      console.error('❌ Config no disponible:', { config });
      Swal.fire({
        icon: 'error',
        title: 'Error de configuración',
        text: 'No se pudo encontrar la URL de la API. Verifica el archivo config.js'
      });
      return;
    }

    const estados = {
      'aprobada': {
        title: '¿Aprobar Planilla?',
        text: 'Una vez aprobada, no podrá regresar a pendiente',
        confirmText: 'Sí, aprobar',
        color: '#3b82f6'
      },
      'pagada': {
        title: '¿Marcar como Pagada?',
        text: 'Se registrará la fecha de pago actual',
        confirmText: 'Sí, marcar pagada',
        color: '#10b981'
      }
    };

    const estadoConfig = estados[nuevoEstado];
    if (!estadoConfig) return;

    const result = await Swal.fire({
      title: estadoConfig.title,
      text: estadoConfig.text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: estadoConfig.confirmText,
      confirmButtonColor: estadoConfig.color,
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const body = { estado: nuevoEstado };
        
        if (nuevoEstado === 'pagada') {
          body.fechaPago = new Date().toISOString();
        }

        const endpoint = `${config.api.API_URL}/planillas/semanal/${planilla._id}/estado`;

const response = await api.patch(endpoint, body);
const data = response.data;



        if (data.success) {
          await cargarPlanilla();
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: data.message,
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message
        });
      }
    }
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      'pendiente': {
        label: 'Pendiente',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: Clock
      },
      'aprobada': {
        label: 'Aprobada',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: CheckCircle
      },
      'pagada': {
        label: 'Pagada',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: DollarSign
      }
    };
    return configs[estado] || configs['pendiente'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold text-xl">Cargando planilla...</p>
        </div>
      </div>
    );
  }

  if (!planilla) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-bold text-xl mb-4">Planilla no encontrada</p>
          <button
            onClick={() => navigate('/planilla')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Volver a Planillas
          </button>
        </div>
      </div>
    );
  }

  const estadoConfig = getEstadoConfig(planilla.estado);
  const EstadoIcon = estadoConfig.icon;
  const estaEditable = planilla.estado !== 'pagada';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/planilla')}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Planilla Semanal - Viáticos y Anticipo
                </h1>
                <p className="text-gray-600 mt-1">
                  {formatearFecha(planilla.fechaInicio)} al {formatearFecha(planilla.fechaFin)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Estado */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${estadoConfig.bg} ${estadoConfig.text} ${estadoConfig.border}`}>
                <EstadoIcon size={20} />
                <span className="font-bold">{estadoConfig.label}</span>
              </div>

              {/* Botón Aprobar */}
              {planilla.estado === 'pendiente' && (
                <button
                  onClick={() => handleCambiarEstado('aprobada')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <CheckCircle size={20} />
                  <span>Aprobar</span>
                </button>
              )}

              {/* Botón Marcar Pagada */}
              {planilla.estado === 'aprobada' && (
                <button
                  onClick={() => handleCambiarEstado('pagada')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <DollarSign size={20} />
                  <span>Marcar Pagada</span>
                </button>
              )}

              {/* Botón PDF */}
              <button
                onClick={handleDescargarPDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <Download size={20} />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* INFO CARDS */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-medium">Empleados</p>
                  <p className="text-2xl font-bold text-blue-900">{planilla.empleados?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <DollarSign className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-medium">Total Base</p>
                  <p className="text-xl font-bold text-emerald-900">
                    {formatearMoneda(planilla.totales?.totalBase || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <FileText className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-xs text-purple-700 font-medium">Total Viáticos</p>
                  <p className="text-xl font-bold text-purple-900">
                    {formatearMoneda(planilla.totales?.totalViaticos || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <DollarSign className="text-indigo-600" size={24} />
                </div>
                <div>
                  <p className="text-xs text-indigo-700 font-medium">Total a Pagar</p>
                  <p className="text-xl font-bold text-indigo-900">
                    {formatearMoneda(planilla.totales?.totalAPagar || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NOTA INFORMATIVA */}
        {estaEditable && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">💡 Instrucciones de Edición:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Click en celdas azules</strong> para editar viáticos diarios</li>
                  <li><strong>Click en celda de Anticipos</strong> para editar el monto total</li>
                  <li><strong>Click derecho en día</strong> para marcar/desmarcar falta injustificada</li>
                  <li><strong>Enter</strong> para guardar, <strong>Escape</strong> para cancelar</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TABLA TIPO EXCEL */}
        <div className="bg-white rounded-xl border-2 border-gray-300 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ fontSize: '11px' }}>
              <thead>
                {/* FILA 1: Encabezados principales */}
                <tr className="bg-gray-200 border-b-2 border-gray-400">
                  <th rowSpan={2} className="sticky left-0 z-20 bg-gray-200 px-2 py-2 text-left text-[10px] font-bold text-gray-800 uppercase border-r border-gray-400 min-w-[180px]">
                    Nombre
                  </th>
                  <th colSpan={2} className="px-2 py-1 text-center text-[10px] font-bold text-gray-800 uppercase border-r border-gray-400">
                    Lunes
                  </th>
                  <th colSpan={2} className="px-2 py-1 text-center text-[10px] font-bold text-gray-800 uppercase border-r border-gray-400">
                    Martes
                  </th>
                  <th colSpan={2} className="px-2 py-1 text-center text-[10px] font-bold text-gray-800 uppercase border-r border-gray-400">
                    Miércoles
                  </th>
                  <th colSpan={2} className="px-2 py-1 text-center text-[10px] font-bold text-gray-800 uppercase border-r border-gray-400">
                    Jueves
                  </th>
                  <th colSpan={2} className="px-2 py-1 text-center text-[10px] font-bold text-gray-800 uppercase border-r border-gray-400">
                    Viernes
                  </th>
                  <th colSpan={2} className="px-2 py-1 text-center text-[10px] font-bold text-gray-800 uppercase border-r-2 border-gray-500">
                    Sábado
                  </th>
                  <th rowSpan={2} className="px-2 py-2 text-center text-[10px] font-bold text-gray-800 uppercase border-r border-gray-400 min-w-[70px]">
                    Viáticos
                  </th>
                  <th rowSpan={2} className="px-2 py-2 text-center text-[10px] font-bold text-gray-800 uppercase border-r border-gray-400 min-w-[70px]">
                    Anticipos
                  </th>
                  <th rowSpan={2} className="px-2 py-2 text-center text-[10px] font-bold text-gray-800 uppercase min-w-[80px]">
                    Total a Pagar
                  </th>
                </tr>

                {/* FILA 2: Sub-encabezados (Base/Viático) */}
                <tr className="bg-gray-200 border-b-2 border-gray-500">
                  {diasSemana.map((dia) => (
                    <React.Fragment key={dia}>
                      <th className="px-2 py-1 text-center text-[9px] font-semibold text-gray-700 border-r border-gray-300 min-w-[50px]">Base</th>
                      <th className="px-2 py-1 text-center text-[9px] font-semibold text-gray-700 border-r border-gray-400 min-w-[50px]">Viático</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody>
                {planilla.empleados?.map((empleado, empIdx) => (
                  <tr 
                    key={empleado.empleadoId}
                    className="border-b border-gray-300 hover:bg-blue-50/30 transition-colors"
                  >
                    {/* NOMBRE (FIJO) */}
                    <td className="sticky left-0 z-10 bg-white px-2 py-1 text-[10px] font-semibold text-gray-900 border-r border-gray-400">
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          empleado.planillaTipo === 'Semanal' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        {empleado.nombreCompleto}
                      </div>
                    </td>

                    {/* DÍAS DE LA SEMANA */}
                    {diasSemana.map((dia) => {
                      const diaData = empleado.dias?.find(d => d.dia === dia);
                      const esEditando = editandoCelda?.empleadoId === empleado.empleadoId && 
                                        editandoCelda?.dia === dia && 
                                        editandoCelda?.campo === 'viaticos';
                      const tieneFalta = diaData?.faltaInjustificada;

                      return (
                        <React.Fragment key={dia}>
                          {/* BASE */}
                          <td className={`px-1 py-1 text-center text-[10px] border-r border-gray-300 ${
                            tieneFalta ? 'bg-red-50' : 'bg-gray-50'
                          }`}>
                            <span className={`font-medium ${
                              tieneFalta ? 'text-red-600 line-through' : 'text-gray-800'
                            }`}>
                              ${(diaData?.base || 0).toFixed(2)}
                            </span>
                            {tieneFalta && (
                              <div className="text-[8px] text-red-600 font-bold">
                                -${(diaData?.descuentoFalta || 0).toFixed(2)}
                              </div>
                            )}
                          </td>

                          {/* VIÁTICO */}
                          <td 
                            className={`px-1 py-1 text-center text-[10px] border-r border-gray-400 cursor-pointer ${
                              tieneFalta 
                                ? 'bg-red-100' 
                                : estaEditable 
                                  ? 'bg-blue-50 hover:bg-blue-100' 
                                  : 'bg-white'
                            }`}
                            onClick={() => !tieneFalta && estaEditable && handleClickCelda(empleado.empleadoId, dia, 'viaticos', diaData?.viaticos)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              if (estaEditable) {
                                if (tieneFalta) {
                                  handleDesmarcarFalta(empleado.empleadoId, dia);
                                } else {
                                  handleMarcarFalta(empleado.empleadoId, dia);
                                }
                              }
                            }}
                          >
                            {esEditando ? (
                              <div className="flex items-center gap-0.5">
                                <input
                                  ref={inputRef}
                                  type="number"
                                  value={valorTemp}
                                  onChange={(e) => setValorTemp(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  className="w-12 px-1 py-0.5 border border-blue-500 rounded text-center text-[10px] font-semibold focus:outline-none"
                                  disabled={guardando}
                                  step="0.01"
                                />
                                <button
                                  onClick={handleGuardarCelda}
                                  disabled={guardando}
                                  className="p-0.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                >
                                  <Check size={10} />
                                </button>
                                <button
                                  onClick={handleCancelarEdicion}
                                  disabled={guardando}
                                  className="p-0.5 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ) : (
                              <span className={`font-medium ${
                                tieneFalta ? 'text-red-600' : 'text-blue-700'
                              }`}>
                                ${(diaData?.viaticos || 0).toFixed(2)}
                              </span>
                            )}
                            {tieneFalta && !esEditando && (
                              <div className="text-[8px] text-red-600 font-bold">
                                FALTA
                              </div>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}

                    {/* TOTAL VIÁTICOS */}
                    <td className="px-1 py-1 text-center bg-purple-50 border-r border-gray-400">
                      <span className="font-bold text-purple-700 text-[10px]">
                        ${(empleado.totalViaticos || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* ANTICIPOS */}
                    <td 
                      className={`px-1 py-1 text-center border-r border-gray-400 cursor-pointer text-[10px] ${
                        estaEditable ? 'bg-amber-50 hover:bg-amber-100' : 'bg-white'
                      }`}
                      onClick={() => estaEditable && handleClickCelda(empleado.empleadoId, null, 'anticipos', empleado.anticipos)}
                    >
                      {editandoCelda?.empleadoId === empleado.empleadoId && editandoCelda?.campo === 'anticipos' ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <input
                            ref={inputRef}
                            type="number"
                            value={valorTemp}
                            onChange={(e) => setValorTemp(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-14 px-1 py-0.5 border border-amber-500 rounded text-center text-[10px] font-semibold focus:outline-none"
                            disabled={guardando}
                            step="0.01"
                          />
                          <button
                            onClick={handleGuardarCelda}
                            disabled={guardando}
                            className="p-0.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            <Check size={10} />
                          </button>
                          <button
                            onClick={handleCancelarEdicion}
                            disabled={guardando}
                            className="p-0.5 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-amber-700">
                          ${(empleado.anticipos || 0).toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* TOTAL A PAGAR */}
                    <td className="px-1 py-1 text-center bg-green-50">
                      <span className="font-bold text-green-700 text-[11px]">
                        ${(empleado.totalAPagar || 0).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* FILA DE TOTALES */}
                <tr className="bg-gradient-to-r from-indigo-100 to-purple-100 font-bold border-t-2 border-gray-500">
                  <td className="sticky left-0 z-10 bg-indigo-100 px-2 py-2 text-gray-900 border-r border-gray-400 text-[11px]">
                    TOTAL
                  </td>
                  <td colSpan={12} className="border-r border-gray-400"></td>
                  <td className="px-1 py-2 text-center text-purple-800 border-r border-gray-400 text-[11px]">
                    ${(planilla.totales?.totalViaticos || 0).toFixed(2)}
                  </td>
                  <td className="px-1 py-2 text-center text-amber-800 border-r border-gray-400 text-[11px]">
                    ${(planilla.totales?.totalAnticipos || 0).toFixed(2)}
                  </td>
                  <td className="px-1 py-2 text-center text-green-800 text-[12px]">
                    ${(planilla.totales?.totalAPagar || 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* LEYENDA */}
        <div className="bg-white rounded-xl p-3 border border-gray-200">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-50 border border-gray-300"></div>
              <span className="text-gray-600">No editable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-50 border border-blue-300"></div>
              <span className="text-gray-600">Viáticos (Click para editar)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-50 border border-amber-300"></div>
              <span className="text-gray-600">Anticipos (Click para editar)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-50 border border-red-300"></div>
              <span className="text-gray-600">Falta (Click derecho)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}