import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, Save, X, DollarSign, Calendar, FileText, Download,
  CheckCircle, Trash2, Lock, Check, AlertCircle, Clock, ChevronDown,
  User, GripVertical, MousePointer
} from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';
import { useAuth } from '../../Context/authContext';
import { api } from '../../Context/authContext';

export default function PlanillaQuincenal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && user && user.userType !== 'Administrador') {
      navigate('/no-access');
    }
  }, [user, authLoading, navigate]);
  
  const [planilla, setPlanilla] = useState(null);
  const [loading, setLoading] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  
  // Estado para nueva fila
  const [mostrarNuevaFila, setMostrarNuevaFila] = useState(false);
  const [nuevaFila, setNuevaFila] = useState({
    empleadoId: '',
    viaticos: 0,
    trabajoSabadoDomingo: 0,
    anticipos: 0,
    prestamos: 0,
    otros: 0
  });

  // Estado para drag & drop
  const [empleadoArrastrando, setEmpleadoArrastrando] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Estado para edición inline
  const [filaEditando, setFilaEditando] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState({});

  const [infoPlanilla, setInfoPlanilla] = useState({
    año: 2025,
    mes: 12,
    quincena: 1
  });

  const calcularProximaQuincena = (planillaActual) => {
    if (!planillaActual) {
      const hoy = new Date();
      return {
        año: hoy.getFullYear(),
        mes: hoy.getMonth() + 1,
        quincena: hoy.getDate() <= 15 ? 1 : 2
      };
    }

    let { año, mes, quincena } = planillaActual;

    if (quincena === 1) {
      return { año, mes, quincena: 2 };
    }

    mes++;
    if (mes > 12) {
      mes = 1;
      año++;
    }

    return { año, mes, quincena: 1 };
  };

  useEffect(() => {
    cargarEmpleados();
    
    if (id) {
      cargarPlanillaExistente(id);
    } else {
      cargarUltimaPlanilla();
    }
  }, [id]);

  const cargarEmpleados = async () => {
    try {
      const resEmpleados = await api.get(`/empleados`);
      const dataEmpleados = resEmpleados.data;

      let empleadosArray = [];
      if (dataEmpleados?.data?.empleados) {
        empleadosArray = dataEmpleados.data.empleados;
      } else if (Array.isArray(dataEmpleados)) {
        empleadosArray = dataEmpleados;
      }
      
      setEmpleados(empleadosArray);
    } catch (error) {
      console.error('❌ Error cargando empleados:', error);
      setEmpleados([]);
    }
  };

  const cargarPlanillaExistente = async (planillaId) => {
    setLoading(true);
    try {
      const response = await api.get(`/planillas/quincenal/${planillaId}`);
      const data = response.data;
      
      if (data.success && data.data) {
        const planillaConEmpleados = {
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        };
        setPlanilla(planillaConEmpleados);
        
        setInfoPlanilla({
          año: data.data.año,
          mes: data.data.mes,
          quincena: data.data.quincena
        });
      } else {
        throw new Error('Planilla no encontrada');
      }
    } catch (error) {
      console.error('Error cargando planilla:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la planilla',
        confirmButtonText: 'Volver'
      }).then(() => {
        navigate('/planillas');
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarUltimaPlanilla = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/planillas/quincenal`);
      const data = response.data;
      
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const planillasOrdenadas = [...data.data].sort((a, b) => {
          if (a.año !== b.año) return b.año - a.año;
          if (a.mes !== b.mes) return b.mes - a.mes;
          return b.quincena - a.quincena;
        });
        
        const ultimaPlanilla = planillasOrdenadas[0];
        
        const planillaConEmpleados = {
          ...ultimaPlanilla,
          empleados: Array.isArray(ultimaPlanilla.empleados) 
            ? ultimaPlanilla.empleados 
            : []
        };
        
        setPlanilla(planillaConEmpleados);
        
        setInfoPlanilla({
          año: ultimaPlanilla.año,
          mes: ultimaPlanilla.mes,
          quincena: ultimaPlanilla.quincena
        });
      } else {
        await crearNuevaPlanilla();
      }
    } catch (error) {
      console.error('Error cargando última planilla:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la planilla'
      });
    } finally {
      setLoading(false);
    }
  };

  const crearNuevaPlanilla = async () => {
    try {
      const { año, mes, quincena } = infoPlanilla;

      const response = await api.post(`/planillas/quincenal`, {
        año,
        mes,
        quincena,
        empleados: []
      });

      const data = response.data;

      if (data.success && data.data) {
        const planillaData = {
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        };
        setPlanilla(planillaData);
        
        Swal.fire({
          icon: 'success',
          title: '¡Planilla creada!',
          text: data.data.descripcion,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error creando planilla:', error);
    }
  };

  const buscarPrimeraQuincenaDisponible = async (añoInicial, mesInicial, quincenaInicial) => {
    let año = añoInicial;
    let mes = mesInicial;
    let quincena = quincenaInicial;
    let intentos = 0;
    const maxIntentos = 24;

    while (intentos < maxIntentos) {
      try {
        const response = await api.post(`/planillas/quincenal`, {
          año,
          mes,
          quincena,
          empleados: []
        });

        const data = response.data;

        if (data.success && data.data) {
          return {
            exito: true,
            planilla: data.data,
            mensaje: `Planilla creada: ${data.data.descripcion}`
          };
        }

        const siguiente = calcularProximaQuincena({ año, mes, quincena });
        año = siguiente.año;
        mes = siguiente.mes;
        quincena = siguiente.quincena;
        intentos++;

      } catch (error) {
        console.error('Error buscando quincena disponible:', error);

        if (error.response && error.response.status === 400) {
          const data = error.response.data;

          if (data.data?.planillaId) {
            try {
              const planillaResponse = await api.get(
                `/planillas/quincenal/${data.data.planillaId}`
              );

              const planillaData = planillaResponse.data;

              if (planillaData.success && planillaData.data) {
                const planillaExistente = planillaData.data;

                if (planillaExistente.estado === 'pendiente') {
                  return {
                    exito: true,
                    planilla: planillaExistente,
                    mensaje: `Planilla encontrada: ${planillaExistente.descripcion}`
                  };
                }
              }
            } catch (getError) {
              console.error('Error obteniendo planilla existente:', getError);
            }
          }
        }

        const siguiente = calcularProximaQuincena({ año, mes, quincena });
        año = siguiente.año;
        mes = siguiente.mes;
        quincena = siguiente.quincena;
        intentos++;
      }
    }

    return {
      exito: false,
      mensaje: 'No se encontró ninguna quincena disponible'
    };
  };

  // Función para agregar empleado (click o drag)
  const agregarEmpleadoPorClick = (empleado) => {
    if (!puedeEditar) return;
    
    setNuevaFila({
      empleadoId: empleado._id,
      viaticos: 0,
      trabajoSabadoDomingo: 0,
      anticipos: 0,
      prestamos: 0,
      otros: 0
    });
    setMostrarNuevaFila(true);
  };

  const agregarEmpleadoAPlanilla = async () => {
    if (!nuevaFila.empleadoId) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Por favor selecciona un empleado'
      });
      return;
    }

    if (!planilla || !planilla._id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay una planilla activa'
      });
      return;
    }

    try {
      const response = await api.post(
        `/planillas/quincenal/${planilla._id}/empleado`,
        {
          empleadoId: nuevaFila.empleadoId,
          viaticos: Number(nuevaFila.viaticos) || 0,
          trabajoSabadoDomingo: Number(nuevaFila.trabajoSabadoDomingo) || 0,
          otrosDescuentos: {
            anticipos: Number(nuevaFila.anticipos) || 0,
            prestamos: Number(nuevaFila.prestamos) || 0,
            otros: Number(nuevaFila.otros) || 0
          }
        }
      );

      const data = response.data;
      
      if (data.success && data.data) {
        const planillaActualizada = {
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        };
        
        setPlanilla(planillaActualizada);
        setMostrarNuevaFila(false);
        setNuevaFila({
          empleadoId: '',
          viaticos: 0,
          trabajoSabadoDomingo: 0,
          anticipos: 0,
          prestamos: 0,
          otros: 0
        });
        
        Swal.fire({
          icon: 'success',
          title: '¡Agregado!',
          text: 'Empleado agregado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('❌ Error agregando empleado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al agregar empleado'
      });
    }
  };

  const eliminarEmpleadoDePlanilla = async (empleadoId) => {
    if (!planilla || !planilla._id) return;

    const result = await Swal.fire({
      title: '¿Eliminar empleado?',
      text: 'Se eliminará de esta planilla',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.delete(
        `/planillas/quincenal/${planilla._id}/empleado/${empleadoId}`
      );
      const data = response.data;

      if (data.success && data.data) {
        setPlanilla({
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        });
        
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  };

  const iniciarEdicion = (emp) => {
    setFilaEditando(emp.empleadoId);
    setDatosEdicion({
      viaticos: emp.viaticos || 0,
      trabajoSabadoDomingo: emp.trabajoSabadoDomingo || 0,
      anticipos: emp.otrosDescuentos?.anticipos || 0,
      prestamos: emp.otrosDescuentos?.prestamos || 0,
      otros: emp.otrosDescuentos?.otros || 0
    });
  };

  const guardarEdicion = async (empleadoId) => {
    if (!planilla || !planilla._id) return;

    try {
      const response = await api.put(
        `/planillas/quincenal/${planilla._id}/empleado/${empleadoId}`,
        {
          viaticos: Number(datosEdicion.viaticos) || 0,
          trabajoSabadoDomingo: Number(datosEdicion.trabajoSabadoDomingo) || 0,
          otrosDescuentos: {
            anticipos: Number(datosEdicion.anticipos) || 0,
            prestamos: Number(datosEdicion.prestamos) || 0,
            otros: Number(datosEdicion.otros) || 0
          }
        }
      );

      const data = response.data;
      
      if (data.success && data.data) {
        setPlanilla({
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        });
        
        setFilaEditando(null);
        setDatosEdicion({});
        
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  };

  const cambiarEstadoPlanilla = async (nuevoEstado) => {
    if (!planilla || !planilla._id) return;

    const result = await Swal.fire({
      title: '¿Aprobar Planilla?',
      text: 'Una vez aprobada, no se podrá editar',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5D9646',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.patch(
        `/planillas/quincenal/${planilla._id}/estado`,
        { estado: nuevoEstado }
      );

      const data = response.data;

      if (data.success && data.data) {
        setPlanilla({
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        });

        Swal.fire({
          icon: 'success',
          title: '¡Estado actualizado!',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  };

  // Handlers para Drag & Drop
  const handleDragStart = (e, empleado) => {
    if (!puedeEditar) return;
    setEmpleadoArrastrando(empleado);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    if (!puedeEditar) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    if (!puedeEditar || !empleadoArrastrando) return;
    
    agregarEmpleadoPorClick(empleadoArrastrando);
    setEmpleadoArrastrando(null);
  };

  const getMesNombre = (mes) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes';
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(cantidad || 0);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800', 
        icon: <Clock size={14} />
      },
      aprobada: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        icon: <CheckCircle size={14} />
      },
      pagada: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: <DollarSign size={14} />
      }
    };

    const badge = badges[estado] || badges.pendiente;
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded ${badge.bg} ${badge.text} text-xs font-semibold`}>
        {badge.icon}
        {estado?.toUpperCase()}
      </div>
    );
  };

  // Empleados disponibles (que no están en la planilla)
  const empleadosDisponibles = empleados.filter(
    emp => !planilla?.empleados?.some(pe => pe.empleadoId === emp._id)
  );

  const puedeEditar = planilla?.estado === 'pendiente';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5F8EAD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Cargando planilla...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Sidebar con empleados disponibles */}
      {puedeEditar && (
        <div className="w-80 bg-white border-r border-gray-300 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#5F8EAD] to-[#5D9646]">
            <div className="flex items-center gap-2 text-white">
              <User size={20} />
              <h3 className="font-bold">Empleados Disponibles</h3>
            </div>
            <p className="text-xs text-white text-opacity-90 mt-1">
              {empleadosDisponibles.length} empleados
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {empleadosDisponibles.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <User size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Todos los empleados están agregados</p>
              </div>
            ) : (
              empleadosDisponibles.map((empleado) => (
                <div
                  key={empleado._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, empleado)}
                  onClick={() => agregarEmpleadoPorClick(empleado)}
                  className="bg-white border-2 border-gray-200 rounded-lg p-3 cursor-move hover:border-[#5F8EAD] hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {empleado.name} {empleado.lastName}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Quincenal: {formatearMoneda((empleado.salario || 0) / 2)}
                      </p>
                    </div>
                    <MousePointer size={14} className="text-[#5F8EAD] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      🎯 <strong>Arrastrar</strong> a la tabla o hacer <strong>click</strong> para agregar
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <AlertCircle size={14} />
              <span>Arrastra o haz click para agregar</span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#5F8EAD] rounded-lg">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Planilla Quincenal
                  </h1>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {planilla?.descripcion || `${infoPlanilla.quincena === 1 ? 'Primera' : 'Segunda'} quincena - ${getMesNombre(infoPlanilla.mes)} ${infoPlanilla.año}`}
                    </span>
                    {getEstadoBadge(planilla?.estado)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {planilla?.estado === 'pendiente' && (
                  <button
                    onClick={() => cambiarEstadoPlanilla('aprobada')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#5D9646] text-white rounded-lg hover:bg-[#4a7835] font-semibold text-sm"
                  >
                    <CheckCircle size={18} />
                    Aprobar
                  </button>
                )}

                {planilla?.estado !== 'pendiente' && (
                  <button
                    onClick={async () => {
                      setLoading(true);
                      const proximaQuincena = calcularProximaQuincena(planilla);
                      const resultado = await buscarPrimeraQuincenaDisponible(
                        proximaQuincena.año,
                        proximaQuincena.mes,
                        proximaQuincena.quincena
                      );
                      
                      if (resultado.exito) {
                        setPlanilla({
                          ...resultado.planilla,
                          empleados: Array.isArray(resultado.planilla.empleados) ? resultado.planilla.empleados : []
                        });
                        
                        setInfoPlanilla({
                          año: resultado.planilla.año,
                          mes: resultado.planilla.mes,
                          quincena: resultado.planilla.quincena
                        });
                        
                        Swal.fire({
                          icon: 'success',
                          title: '¡Planilla creada!',
                          text: resultado.mensaje,
                          timer: 2000,
                          showConfirmButton: false
                        });
                      } else {
                        Swal.fire({
                          icon: 'error',
                          title: 'Error',
                          text: resultado.mensaje
                        });
                      }
                      
                      setLoading(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#5F8EAD] text-white rounded-lg hover:bg-[#4a6d85] font-semibold text-sm"
                  >
                    <Plus size={18} />
                    Nueva Planilla
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Banner solo lectura */}
          {!puedeEditar && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-5 rounded-r-lg">
              <div className="flex items-center gap-3">
                <Lock className="text-amber-700" size={20} />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Planilla bloqueada</p>
                  <p className="text-xs text-amber-800">Esta planilla está {planilla?.estado} y no puede ser modificada</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabla estilo Excel */}
          <div 
            className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden transition-all ${
              isDraggingOver ? 'border-[#5F8EAD] shadow-xl ring-4 ring-[#5F8EAD] ring-opacity-30' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDraggingOver && (
              <div className="bg-[#5F8EAD] bg-opacity-10 border-b-2 border-[#5F8EAD] p-3">
                <div className="flex items-center justify-center gap-2 text-[#5F8EAD] font-semibold">
                  <Plus size={20} />
                  <span>Suelta aquí para agregar empleado</span>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Header */}
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 border-r border-gray-300 w-12">#</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 border-r border-gray-300 min-w-[200px]">Empleado</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 border-r border-gray-300 w-28">Sal. Quincenal</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 border-r border-gray-300 w-24 bg-green-50">Viáticos</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 border-r border-gray-300 w-24 bg-green-50">Sáb/Dom</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-blue-700 border-r border-blue-300 w-28 bg-blue-50">Total Ingreso</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 border-r border-gray-300 w-24">ISSS</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 border-r border-gray-300 w-24">AFP</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 border-r border-gray-300 w-24">Renta</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 border-r border-gray-300 w-24 bg-red-50">Anticipos</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 border-r border-gray-300 w-24 bg-red-50">Préstamos</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 border-r border-gray-300 w-24 bg-red-50">Otros</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-red-700 border-r border-red-300 w-28 bg-red-100">Total Desc.</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-green-700 w-32 bg-green-100">A Pagar</th>
                    {puedeEditar && <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 border-l border-gray-300 w-24">Acciones</th>}
                  </tr>
                </thead>

                <tbody>
                  {/* Filas de empleados */}
                  {planilla?.empleados?.map((emp, index) => {
                    const esFilaEditando = filaEditando === emp.empleadoId;
                    const esFilaPar = index % 2 === 0;

                    return (
                      <tr 
                        key={emp.empleadoId || index}
                        className={`border-b border-gray-200 ${esFilaPar ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="px-3 py-2 text-xs text-gray-700 border-r border-gray-200 font-mono text-center">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200 font-medium">
                          {emp.nombreCompleto}
                        </td>
                        <td className="px-3 py-2 text-xs text-right border-r border-gray-200 font-mono text-gray-700">
                          {formatearMoneda(emp.salarioQuincenal)}
                        </td>
                        
                        {/* Viáticos */}
                        <td className="px-3 py-2 text-xs text-right border-r border-gray-200 bg-green-50">
                          {esFilaEditando ? (
                            <input
                              type="number"
                              step="0.01"
                              value={datosEdicion.viaticos}
                              onChange={(e) => setDatosEdicion({ ...datosEdicion, viaticos: e.target.value })}
                              className="w-full px-2 py-1 text-xs text-right border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="font-mono text-gray-700">{formatearMoneda(emp.viaticos)}</span>
                          )}
                        </td>

                        {/* Sáb/Dom */}
                        <td className="px-3 py-2 text-xs text-right border-r border-gray-200 bg-green-50">
                          {esFilaEditando ? (
                            <input
                              type="number"
                              step="0.01"
                              value={datosEdicion.trabajoSabadoDomingo}
                              onChange={(e) => setDatosEdicion({ ...datosEdicion, trabajoSabadoDomingo: e.target.value })}
                              className="w-full px-2 py-1 text-xs text-right border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="font-mono text-gray-700">{formatearMoneda(emp.trabajoSabadoDomingo)}</span>
                          )}
                        </td>

                        <td className="px-3 py-2 text-xs text-right border-r border-blue-300 font-mono font-bold text-blue-700 bg-blue-50">
                          {formatearMoneda(emp.totalSalarioMasViaticos)}
                        </td>
                        <td className="px-3 py-2 text-xs text-right border-r border-gray-200 font-mono text-red-600">
                          {formatearMoneda(emp.descuentosLey?.isss?.monto)}
                        </td>
                        <td className="px-3 py-2 text-xs text-right border-r border-gray-200 font-mono text-red-600">
                          {formatearMoneda(emp.descuentosLey?.afp?.monto)}
                        </td>
                        <td className="px-3 py-2 text-xs text-right border-r border-gray-200 font-mono text-red-600">
                          {formatearMoneda(emp.descuentosLey?.renta?.monto)}
                        </td>

                        {/* Anticipos */}
                        <td className="px-3 py-2 text-xs text-right border-r border-gray-200 bg-red-50">
                          {esFilaEditando ? (
                            <input
                              type="number"
                              step="0.01"
                              value={datosEdicion.anticipos}
                              onChange={(e) => setDatosEdicion({ ...datosEdicion, anticipos: e.target.value })}
                              className="w-full px-2 py-1 text-xs text-right border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="font-mono text-gray-700">{formatearMoneda(emp.otrosDescuentos?.anticipos)}</span>
                          )}
                        </td>

                        {/* Préstamos */}
                        <td className="px-3 py-2 text-xs text-right border-r border-gray-200 bg-red-50">
                          {esFilaEditando ? (
                            <input
                              type="number"
                              step="0.01"
                              value={datosEdicion.prestamos}
                              onChange={(e) => setDatosEdicion({ ...datosEdicion, prestamos: e.target.value })}
                              className="w-full px-2 py-1 text-xs text-right border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="font-mono text-gray-700">{formatearMoneda(emp.otrosDescuentos?.prestamos)}</span>
                          )}
                        </td>

                        {/* Otros */}
                        <td className="px-3 py-2 text-xs text-right border-r border-gray-200 bg-red-50">
                          {esFilaEditando ? (
                            <input
                              type="number"
                              step="0.01"
                              value={datosEdicion.otros}
                              onChange={(e) => setDatosEdicion({ ...datosEdicion, otros: e.target.value })}
                              className="w-full px-2 py-1 text-xs text-right border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="font-mono text-gray-700">{formatearMoneda(emp.otrosDescuentos?.otros)}</span>
                          )}
                        </td>

                        <td className="px-3 py-2 text-xs text-right border-r border-red-300 font-mono font-bold text-red-700 bg-red-100">
                          {formatearMoneda(emp.totalDescuentos)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-mono font-bold text-green-700 bg-green-100">
                          {formatearMoneda(emp.totalAPagar)}
                        </td>

                        {puedeEditar && (
                          <td className="px-3 py-2 text-center border-l border-gray-200">
                            {esFilaEditando ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => guardarEdicion(emp.empleadoId)}
                                  className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                                  title="Guardar"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setFilaEditando(null);
                                    setDatosEdicion({});
                                  }}
                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                  title="Cancelar"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => iniciarEdicion(emp)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                  title="Editar"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={() => eliminarEmpleadoDePlanilla(emp.empleadoId)}
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}

                  {/* Fila para agregar nuevo empleado (después de arrastrar/click) */}
                  {mostrarNuevaFila && puedeEditar && (
                    <tr className="border-b-2 border-blue-400 bg-blue-50">
                      <td className="px-3 py-2 text-xs text-gray-700 border-r border-gray-200 text-center">
                        <Plus size={14} className="mx-auto text-blue-600" />
                      </td>
                      <td className="px-3 py-2 text-xs border-r border-gray-200">
                        <select
                          value={nuevaFila.empleadoId}
                          onChange={(e) => setNuevaFila({ ...nuevaFila, empleadoId: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        >
                          <option value="">Seleccionar empleado...</option>
                          {empleadosDisponibles.map(emp => (
                            <option key={emp._id} value={emp._id}>
                              {emp.name} {emp.lastName} - {formatearMoneda((emp.salario || 0) / 2)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-xs text-right border-r border-gray-200 text-gray-400">-</td>
                      <td className="px-3 py-2 text-xs text-right border-r border-gray-200 bg-green-50">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={nuevaFila.viaticos}
                          onChange={(e) => setNuevaFila({ ...nuevaFila, viaticos: e.target.value })}
                          className="w-full px-2 py-1 text-xs text-right border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-xs text-right border-r border-gray-200 bg-green-50">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={nuevaFila.trabajoSabadoDomingo}
                          onChange={(e) => setNuevaFila({ ...nuevaFila, trabajoSabadoDomingo: e.target.value })}
                          className="w-full px-2 py-1 text-xs text-right border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-xs text-right border-r border-blue-300 text-gray-400 bg-blue-50">-</td>
                      <td className="px-3 py-2 text-xs text-right border-r border-gray-200 text-gray-400">-</td>
                      <td className="px-3 py-2 text-xs text-right border-r border-gray-200 text-gray-400">-</td>
                      <td className="px-3 py-2 text-xs text-right border-r border-gray-200 text-gray-400">-</td>
                      <td className="px-3 py-2 text-xs text-right border-r border-gray-200 bg-red-50">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={nuevaFila.anticipos}
                          onChange={(e) => setNuevaFila({ ...nuevaFila, anticipos: e.target.value })}
                          className="w-full px-2 py-1 text-xs text-right border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-xs text-right border-r border-gray-200 bg-red-50">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={nuevaFila.prestamos}
                          onChange={(e) => setNuevaFila({ ...nuevaFila, prestamos: e.target.value })}
                          className="w-full px-2 py-1 text-xs text-right border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-xs text-right border-r border-gray-200 bg-red-50">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={nuevaFila.otros}
                          onChange={(e) => setNuevaFila({ ...nuevaFila, otros: e.target.value })}
                          className="w-full px-2 py-1 text-xs text-right border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-xs text-right border-r border-red-300 text-gray-400 bg-red-100">-</td>
                      <td className="px-3 py-2 text-xs text-right text-gray-400 bg-green-100">-</td>
                      <td className="px-3 py-2 text-center border-l border-gray-200">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={agregarEmpleadoAPlanilla}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                            title="Guardar"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setMostrarNuevaFila(false);
                              setNuevaFila({
                                empleadoId: '',
                                viaticos: 0,
                                trabajoSabadoDomingo: 0,
                                anticipos: 0,
                                prestamos: 0,
                                otros: 0
                              });
                            }}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="Cancelar"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Mensaje vacío */}
                  {(!planilla?.empleados || planilla.empleados.length === 0) && !mostrarNuevaFila && (
                    <tr>
                      <td colSpan="15" className="px-6 py-16 text-center">
                        <div className="text-gray-400">
                          <FileText size={56} className="mx-auto mb-4 opacity-50" />
                          <p className="text-base font-semibold mb-2">No hay empleados en esta planilla</p>
                          {puedeEditar && (
                            <p className="text-sm text-gray-500">
                              {empleadosDisponibles.length > 0 
                                ? '← Arrastra un empleado desde el panel lateral o haz click en él'
                                : 'No hay empleados disponibles para agregar'}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Footer con totales */}
                {planilla?.totales && planilla.empleados?.length > 0 && (
                  <tfoot>
                    <tr className="bg-gray-800 text-white border-t-2 border-gray-400">
                      <td colSpan="2" className="px-3 py-2 text-xs font-bold border-r border-gray-600">TOTALES</td>
                      <td className="px-3 py-2 text-xs text-right font-mono font-bold border-r border-gray-600">
                        {formatearMoneda(planilla.totales?.totalSalariosQuincenales)}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono font-bold border-r border-gray-600">
                        {formatearMoneda(planilla.totales?.totalViaticos)}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono font-bold border-r border-gray-600">
                        {formatearMoneda(planilla.totales?.totalTrabajoSabadoDomingo)}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono font-bold border-r border-blue-400 bg-blue-600">
                        {formatearMoneda(planilla.totales?.totalSalariosMasViaticos)}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono font-bold border-r border-gray-600">
                        {formatearMoneda(planilla.totales?.totalISSS)}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono font-bold border-r border-gray-600">
                        {formatearMoneda(planilla.totales?.totalAFP)}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono font-bold border-r border-gray-600">
                        {formatearMoneda(planilla.totales?.totalRenta)}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono font-bold border-r border-gray-600">
                        {formatearMoneda(planilla.totales?.totalAnticipos)}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono font-bold border-r border-gray-600">
                        {formatearMoneda(planilla.totales?.totalPrestamos)}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono font-bold border-r border-gray-600">
                        {formatearMoneda(planilla.totales?.totalOtros)}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono font-bold border-r border-red-400 bg-red-700">
                        {formatearMoneda(planilla.totales?.totalDescuentos)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-mono font-bold bg-green-700">
                        {formatearMoneda(planilla.totales?.totalAPagar)}
                      </td>
                      {puedeEditar && <td></td>}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}