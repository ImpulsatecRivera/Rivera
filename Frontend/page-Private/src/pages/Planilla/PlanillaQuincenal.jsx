import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, Save, X, DollarSign, User, Calendar, FileText, Download,
  CheckCircle, Trash2, Edit2, Lock, Unlock, Search, Filter, ChevronDown,
  Clock, AlertCircle
} from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
 
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
  const [motoristas, setMotoristas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);

  const [formEmpleado, setFormEmpleado] = useState({
    viaticos: 0,
    trabajoSabadoDomingo: 0,
    anticipos: 0,
    prestamos: 0,
    otros: 0
  });

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
    cargarEmpleadosYMotoristas();
    
    if (id) {
      cargarPlanillaExistente(id);
    } else {
      cargarUltimaPlanilla();
    }
  }, [id]);

  const cargarEmpleadosYMotoristas = async () => {
    try {
      const resEmpleados = await fetch(`${config.api.API_URL}/empleados`);
      const dataEmpleados = await resEmpleados.json();
      
      let empleadosArray = [];
      if (dataEmpleados?.data?.empleados) {
        empleadosArray = dataEmpleados.data.empleados;
      } else if (Array.isArray(dataEmpleados)) {
        empleadosArray = dataEmpleados;
      }
      
      setEmpleados(empleadosArray);

      const resMotoristas = await fetch(`${config.api.API_URL}/motoristas`);
      const dataMotoristas = await resMotoristas.json();
      const motoristasArray = Array.isArray(dataMotoristas) ? dataMotoristas : [];
      
      setMotoristas(motoristasArray);
    } catch (error) {
      console.error('❌ Error cargando personal:', error);
      setEmpleados([]);
      setMotoristas([]);
    }
  };

  const cargarPlanillaExistente = async (planillaId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${config.api.API_URL}/planillas/quincenal/${planillaId}`
      );
      const data = await response.json();
      
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
      const response = await fetch(`${config.api.API_URL}/planillas/quincenal`, { credentials: 'include' });
      const data = await response.json();
      
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

      const response = await fetch(`${config.api.API_URL}/planillas/quincenal`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          año,
          mes,
          quincena,
          empleados: []
        })
      });

      const data = await response.json();

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

  const buscarPrimeraQuincenaDisponible = async () => {
    let { año, mes, quincena } = infoPlanilla;
    let intentos = 0;
    const maxIntentos = 24;

    while (intentos < maxIntentos) {
      try {
        const response = await fetch(`${config.api.API_URL}/planillas/quincenal`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            año,
            mes,
            quincena,
            empleados: []
          })
        });

        const data = await response.json();

        if (data.success && data.data) {
          return {
            exito: true,
            planilla: data.data,
            mensaje: `Planilla creada: ${data.data.descripcion}`
          };
        }

        if (response.status === 400 && data.data?.planillaId) {
          const planillaResponse = await fetch(
            `${config.api.API_URL}/planillas/quincenal/${data.data.planillaId}`, { credentials: 'include' }
          );
          const planillaData = await planillaResponse.json();

          if (planillaData.success && planillaData.data) {
            const planillaExistente = planillaData.data;

            if (planillaExistente.estado === 'pendiente') {
              return {
                exito: true,
                planilla: planillaExistente,
                mensaje: `Planilla encontrada: ${planillaExistente.descripcion}`
              };
            }

            const siguiente = calcularProximaQuincena({ año, mes, quincena });
            año = siguiente.año;
            mes = siguiente.mes;
            quincena = siguiente.quincena;
          }
        } else {
          const siguiente = calcularProximaQuincena({ año, mes, quincena });
          año = siguiente.año;
          mes = siguiente.mes;
          quincena = siguiente.quincena;
        }

        intentos++;
      } catch (error) {
        console.error('Error buscando quincena disponible:', error);
        intentos++;
      }
    }

    return {
      exito: false,
      mensaje: 'No se encontró ninguna quincena disponible'
    };
  };

  const agregarEmpleadoAPlanilla = async () => {
    if (!empleadoSeleccionado) {
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
        text: 'No hay una planilla activa. Recarga la página.'
      });
      return;
    }

    try {
      const response = await fetch(
        `${config.api.API_URL}/planillas/quincenal/${planilla._id}/empleado`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            empleadoId: empleadoSeleccionado._id,
            viaticos: parseFloat(formEmpleado.viaticos) || 0,
            trabajoSabadoDomingo: parseFloat(formEmpleado.trabajoSabadoDomingo) || 0,
            otrosDescuentos: {
              anticipos: parseFloat(formEmpleado.anticipos) || 0,
              prestamos: parseFloat(formEmpleado.prestamos) || 0,
              otros: parseFloat(formEmpleado.otros) || 0
            }
          })
        }
      );

      const data = await response.json();
      
      if (data.success && data.data) {
        const planillaActualizada = {
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        };
        
        setPlanilla(planillaActualizada);
        setShowModalAgregar(false);
        limpiarFormulario();
        
        Swal.fire({
          icon: 'success',
          title: '¡Agregado!',
          text: 'Empleado agregado a la planilla',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.message || 'Error al agregar empleado');
      }
    } catch (error) {
      console.error('❌ Error agregando empleado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  };

  const editarEmpleadoDePlanilla = async () => {
    if (!empleadoEditando) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'No hay empleado seleccionado para editar'
      });
      return;
    }

    if (!planilla || !planilla._id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay una planilla activa. Recarga la página.'
      });
      return;
    }

    try {
      const response = await fetch(
        `${config.api.API_URL}/planillas/quincenal/${planilla._id}/empleado/${empleadoEditando._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            viaticos: parseFloat(formEmpleado.viaticos) || 0,
            trabajoSabadoDomingo: parseFloat(formEmpleado.trabajoSabadoDomingo) || 0,
            otrosDescuentos: {
              anticipos: parseFloat(formEmpleado.anticipos) || 0,
              prestamos: parseFloat(formEmpleado.prestamos) || 0,
              otros: parseFloat(formEmpleado.otros) || 0
            }
          })
        }
      );

      const data = await response.json();
      
      if (data.success && data.data) {
        const planillaActualizada = {
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        };

        setPlanilla(planillaActualizada);
        setShowModalEditar(false);
        setEmpleadoEditando(null);
        limpiarFormulario();
        
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Empleado actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.message || 'Error al actualizar empleado');
      }
    } catch (error) {
      console.error('❌ Error editando empleado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  };

  const eliminarEmpleadoDePlanilla = async (empleadoId) => {
    if (!planilla || !planilla._id) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminará este empleado de la planilla',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${config.api.API_URL}/planillas/quincenal/${planilla._id}/empleado/${empleadoId}`,
        {
          method: 'DELETE'
        }
      );

      const data = await response.json();
      if (data.success && data.data) {
        const planillaActualizada = {
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        };
        setPlanilla(planillaActualizada);
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'Empleado eliminado de la planilla',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.message || 'Error al eliminar empleado');
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
      const response = await fetch(
        `${config.api.API_URL}/planillas/quincenal/${planilla._id}/estado`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevoEstado })
        }
      );

      const data = await response.json();
      if (data.success && data.data) {
        const planillaActualizada = {
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        };
        setPlanilla(planillaActualizada);
        Swal.fire({
          icon: 'success',
          title: '¡Estado actualizado!',
          text: `Planilla marcada como ${nuevoEstado}`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.message || 'Error al cambiar estado');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  };

  const limpiarFormulario = () => {
    setFormEmpleado({
      viaticos: 0,
      trabajoSabadoDomingo: 0,
      anticipos: 0,
      prestamos: 0,
      otros: 0
    });
    setEmpleadoSeleccionado(null);
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
        bg: 'bg-amber-50', 
        text: 'text-amber-800', 
        icon: <Clock size={14} />, 
        border: 'border-amber-300' 
      },
      aprobada: { 
        bg: 'bg-[#5F8EAD] bg-opacity-10', 
        text: 'text-[#5F8EAD]', 
        icon: <CheckCircle size={14} />, 
        border: 'border-[#5F8EAD]' 
      },
      pagada: { 
        bg: 'bg-[#5D9646] bg-opacity-10', 
        text: 'text-[#5D9646]', 
        icon: <DollarSign size={14} />, 
        border: 'border-[#5D9646]' 
      },
      cerrada: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: <Lock size={14} />, 
        border: 'border-red-300' 
      }
    };

    const badge = badges[estado] || badges.pendiente;
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${badge.border} ${badge.bg} ${badge.text} font-bold text-sm shadow-sm`}>
        {badge.icon}
        {estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : 'Pendiente'}
      </div>
    );
  };

  const todoElPersonal = React.useMemo(() => {
    const empleadosMapeados = Array.isArray(empleados) 
      ? empleados.map(e => ({ ...e, tipo: 'Empleado' })) 
      : [];
    
    const motoristasMapeados = Array.isArray(motoristas) 
      ? motoristas.map(m => ({ ...m, tipo: 'Motorista' })) 
      : [];
    
    return [...empleadosMapeados, ...motoristasMapeados];
  }, [empleados, motoristas]);

  const personalFiltrado = React.useMemo(() => {
    if (!searchTerm) return [];
    
    return todoElPersonal.filter(p => {
      const nombreCompleto = `${p.name || ''} ${p.lastName || ''}`.toLowerCase();
      const busqueda = searchTerm.toLowerCase();
      return nombreCompleto.includes(busqueda);
    });
  }, [todoElPersonal, searchTerm]);

  const puedeEditar = planilla?.estado === 'pendiente';
  const puedeEliminar = planilla?.estado === 'pendiente';
  const soloLectura = planilla?.estado === 'aprobada' || 
                      planilla?.estado === 'pagada' || 
                      planilla?.estado === 'cerrada';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#5F8EAD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#34353A] font-bold text-xl">Cargando planilla...</p>
          <p className="text-gray-500 text-sm mt-2">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        
        {/* Header con colores corporativos */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-[#34353A] to-[#5F8EAD] rounded-xl shadow-lg">
                  <FileText size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-[#34353A] tracking-tight">
                    Planilla Quincenal
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">Sistema de Gestión de Nómina</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar size={18} className="text-[#5F8EAD]" />
                  <span className="font-bold text-gray-700">
                    {planilla?.descripcion || 
                     `${infoPlanilla.quincena === 1 ? 'Primera' : 'Segunda'} quincena de ${getMesNombre(infoPlanilla.mes)} ${infoPlanilla.año}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-semibold">Estado:</span>
                  {getEstadoBadge(planilla?.estado)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Botón Agregar Empleado */}
              <button
                onClick={() => setShowModalAgregar(true)}
                disabled={planilla?.estado !== 'pendiente'}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${
                  planilla?.estado !== 'pendiente'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <Plus size={22} />
                Agregar Empleado
              </button>

              {/* Botón Aprobar */}
              {planilla?.estado === 'pendiente' && (
                <button
                  onClick={() => cambiarEstadoPlanilla('aprobada')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5D9646] to-[#5D9646] text-white rounded-xl hover:opacity-90 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <CheckCircle size={22} />
                  Aprobar Planilla
                </button>
              )}

              {/* Botón Nueva Planilla */}
              {planilla?.estado !== 'pendiente' && (
                <button
                  onClick={async () => {
                    setLoading(true);
                    const proximaQuincena = calcularProximaQuincena(planilla);
                    setInfoPlanilla(proximaQuincena);
                    
                    const resultado = await buscarPrimeraQuincenaDisponible();
                    
                    if (resultado.exito) {
                      const planillaConEmpleados = {
                        ...resultado.planilla,
                        empleados: Array.isArray(resultado.planilla.empleados) 
                          ? resultado.planilla.empleados 
                          : []
                      };
                      setPlanilla(planillaConEmpleados);
                      
                      setInfoPlanilla({
                        año: resultado.planilla.año,
                        mes: resultado.planilla.mes,
                        quincena: resultado.planilla.quincena
                      });
                      
                      Swal.fire({
                        icon: 'success',
                        title: '¡Planilla creada!',
                        text: resultado.mensaje,
                        timer: 2500,
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
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5F8EAD] to-[#5D9646] text-white rounded-xl hover:opacity-90 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <Plus size={22} />
                  Nueva Planilla
                </button>
              )}
            </div>
          </div>

          {/* Banner de solo lectura */}
          {soloLectura && (
            <div className="mt-6 flex items-center gap-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl shadow-sm">
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertCircle className="text-amber-700" size={28} />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-lg">Planilla en modo solo lectura</p>
                <p className="text-sm text-amber-800 mt-1">
                  Esta planilla está <strong className="uppercase">{planilla?.estado}</strong> y no se puede modificar.
                  {planilla?.estado !== 'cerrada' && ' Puedes crear una nueva planilla usando el botón "Nueva Planilla".'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tabla con colores corporativos */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          {/* Header de la tabla */}
          <div className="bg-gradient-to-r from-[#34353A] via-[#5F8EAD] to-[#34353A] px-8 py-6 border-b-4 border-[#5D9646]">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="font-black text-2xl tracking-tight">Registro de Empleados</h2>
                  <p className="text-xs text-white/80 mt-1 font-medium">
                    Formato: Quincenal | Período: {getMesNombre(planilla?.mes || infoPlanilla.mes)} {planilla?.año || infoPlanilla.año}
                  </p>
                </div>
              </div>
              <div className="text-right bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                <p className="text-xs text-white/80 font-semibold">Total Empleados</p>
                <p className="text-3xl font-black">{planilla?.empleados?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-4 border-[#5D9646]">
                  <th className="px-5 py-4 text-left text-xs font-black text-[#34353A] uppercase tracking-wider border-r-2 border-gray-300 w-12 bg-gray-200">#</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-[#34353A] uppercase tracking-wider border-r-2 border-gray-300 min-w-[220px]">Nombre Completo</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-[#34353A] uppercase tracking-wider border-r-2 border-gray-300 w-36">Salario Quincenal</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-[#34353A] uppercase tracking-wider border-r-2 border-gray-300 w-32">Viáticos</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-[#34353A] uppercase tracking-wider border-r-2 border-gray-300 w-32">Sáb/Dom</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-[#5F8EAD] uppercase tracking-wider border-r-2 border-[#5F8EAD] bg-[#5F8EAD] bg-opacity-10 w-36">Total Salario</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-[#34353A] uppercase tracking-wider border-r-2 border-gray-300 w-28">ISSS</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-[#34353A] uppercase tracking-wider border-r-2 border-gray-300 w-28">AFP</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-[#34353A] uppercase tracking-wider border-r-2 border-gray-300 w-28">Renta</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-[#34353A] uppercase tracking-wider border-r-2 border-gray-300 w-32">Anticipos</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-[#34353A] uppercase tracking-wider border-r-2 border-gray-300 w-32">Préstamos</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-[#34353A] uppercase tracking-wider border-r-2 border-gray-300 w-28">Otros</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-red-800 uppercase tracking-wider border-r-2 border-red-300 bg-red-100 w-36">Total Desc.</th>
                  <th className="px-5 py-4 text-right text-xs font-black text-[#5D9646] uppercase tracking-wider bg-[#5D9646] bg-opacity-10 w-40">A Pagar</th>
                  <th className="px-5 py-4 text-center text-xs font-black text-[#34353A] uppercase tracking-wider w-32">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y-2 divide-gray-200">
                {!planilla || !Array.isArray(planilla.empleados) || planilla.empleados.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-lg">
                          <User className="text-gray-400" size={64} />
                        </div>
                        <div>
                          <p className="text-[#34353A] font-black text-2xl mb-2">
                            No hay empleados en esta planilla
                          </p>
                          <p className="text-gray-500 text-base mb-6">
                            Comienza agregando empleados a la planilla quincenal
                          </p>
                          {puedeEditar && (
                            <button
                              onClick={() => setShowModalAgregar(true)}
                              className="px-8 py-3 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl hover:opacity-90 font-bold shadow-lg transform hover:scale-105 transition-all"
                            >
                              Agregar Primer Empleado
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  planilla.empleados.map((emp, index) => (
                    <tr
                      key={emp.empleadoId || index}
                      className="border-b-2 border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                    >
                      <td className="px-5 py-4 text-sm font-black text-gray-700 border-r-2 border-gray-200 bg-gray-50">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#34353A] border-r-2 border-gray-200">
                        {emp.nombreCompleto}
                        <span className="ml-2 text-xs font-semibold px-2 py-1 bg-[#5F8EAD] bg-opacity-20 text-[#5F8EAD] rounded-md border border-[#5F8EAD]">
                          {emp.tipoEmpleado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-bold text-[#34353A] border-r-2 border-gray-200 bg-gray-50">
                        {formatearMoneda(emp.salarioQuincenal)}
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-semibold text-gray-700 border-r-2 border-gray-200">
                        {formatearMoneda(emp.viaticos)}
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-semibold text-gray-700 border-r-2 border-gray-200">
                        {formatearMoneda(emp.trabajoSabadoDomingo)}
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-black text-[#5F8EAD] border-r-2 border-[#5F8EAD] bg-[#5F8EAD] bg-opacity-10">
                        {formatearMoneda(emp.totalSalarioMasViaticos)}
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-semibold text-red-600 border-r-2 border-gray-200">
                        {formatearMoneda(emp.descuentosLey?.isss?.monto)}
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-semibold text-red-600 border-r-2 border-gray-200">
                        {formatearMoneda(emp.descuentosLey?.afp?.monto)}
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-semibold text-red-600 border-r-2 border-gray-200">
                        {formatearMoneda(emp.descuentosLey?.renta?.monto)}
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-semibold text-orange-600 border-r-2 border-gray-200">
                        {formatearMoneda(emp.otrosDescuentos?.anticipos)}
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-semibold text-orange-600 border-r-2 border-gray-200">
                        {formatearMoneda(emp.otrosDescuentos?.prestamos)}
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-semibold text-orange-600 border-r-2 border-gray-200">
                        {formatearMoneda(emp.otrosDescuentos?.otros)}
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-black text-red-900 border-r-2 border-red-300 bg-red-50">
                        {formatearMoneda(emp.totalDescuentos)}
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono font-black text-lg text-[#5D9646] bg-[#5D9646] bg-opacity-10">
                        {formatearMoneda(emp.totalAPagar)}
                      </td>
                      <td className="px-5 py-4 text-center border-l-2 border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          {puedeEditar && (
                            <button
                              onClick={() => {
                                setEmpleadoEditando({
                                  ...emp,
                                  _id: emp.empleadoId
                                });
                                setFormEmpleado({
                                  viaticos: emp.viaticos || 0,
                                  trabajoSabadoDomingo: emp.trabajoSabadoDomingo || 0,
                                  anticipos: emp.otrosDescuentos?.anticipos || 0,
                                  prestamos: emp.otrosDescuentos?.prestamos || 0,
                                  otros: emp.otrosDescuentos?.otros || 0
                                });
                                setShowModalEditar(true);
                              }}
                              className="p-2.5 text-[#5F8EAD] hover:bg-[#5F8EAD] hover:bg-opacity-10 rounded-lg transition-all border-2 border-transparent hover:border-[#5F8EAD]"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                          )}
                          {puedeEliminar && (
                            <button
                              onClick={() => eliminarEmpleadoDePlanilla(emp.empleadoId)}
                              className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all border-2 border-transparent hover:border-red-300"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          {soloLectura && (
                            <span className="text-sm text-gray-400 font-semibold">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Footer con totales */}
              {planilla && Array.isArray(planilla.empleados) && planilla.empleados.length > 0 && planilla.totales && (
                <tfoot className="bg-gradient-to-r from-[#34353A] via-[#34353A] to-[#34353A] text-white font-black border-t-4 border-[#5D9646]">
                  <tr>
                    <td colSpan="2" className="px-5 py-5 text-sm uppercase tracking-wider border-r-2 border-gray-700 bg-[#34353A]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#5D9646] rounded-full animate-pulse"></div>
                        TOTALES GENERALES
                      </div>
                    </td>
                    <td className="px-5 py-5 text-base text-right font-mono border-r-2 border-gray-700">
                      {formatearMoneda(planilla.totales?.totalSalariosQuincenales)}
                    </td>
                    <td className="px-5 py-5 text-base text-right font-mono border-r-2 border-gray-700">
                      {formatearMoneda(planilla.totales?.totalViaticos)}
                    </td>
                    <td className="px-5 py-5 text-base text-right font-mono border-r-2 border-gray-700">
                      {formatearMoneda(planilla.totales?.totalTrabajoSabadoDomingo)}
                    </td>
                    <td className="px-5 py-5 text-base text-right font-mono bg-[#5F8EAD] border-r-2 border-[#5F8EAD]">
                      {formatearMoneda(planilla.totales?.totalSalariosMasViaticos)}
                    </td>
                    <td className="px-5 py-5 text-base text-right font-mono border-r-2 border-gray-700">
                      {formatearMoneda(planilla.totales?.totalISSS)}
                    </td>
                    <td className="px-5 py-5 text-base text-right font-mono border-r-2 border-gray-700">
                      {formatearMoneda(planilla.totales?.totalAFP)}
                    </td>
                    <td className="px-5 py-5 text-base text-right font-mono border-r-2 border-gray-700">
                      {formatearMoneda(planilla.totales?.totalRenta)}
                    </td>
                    <td className="px-5 py-5 text-base text-right font-mono border-r-2 border-gray-700">
                      {formatearMoneda(planilla.totales?.totalAnticipos)}
                    </td>
                    <td className="px-5 py-5 text-base text-right font-mono border-r-2 border-gray-700">
                      {formatearMoneda(planilla.totales?.totalPrestamos)}
                    </td>
                    <td className="px-5 py-5 text-base text-right font-mono border-r-2 border-gray-700">
                      {formatearMoneda(planilla.totales?.totalOtros)}
                    </td>
                    <td className="px-5 py-5 text-base text-right font-mono bg-red-900 border-r-2 border-red-800">
                      {formatearMoneda(planilla.totales?.totalDescuentos)}
                    </td>
                    <td className="px-5 py-5 text-xl text-right font-mono font-black bg-[#5D9646]">
                      {formatearMoneda(planilla.totales?.totalAPagar)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>

      {/* Modal Agregar Empleado */}
      {showModalAgregar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#34353A]">Agregar Empleado a Planilla</h2>
              <button
                onClick={() => {
                  setShowModalAgregar(false);
                  limpiarFormulario();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Búsqueda y selección de empleado */}
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Buscar Empleado o Motorista
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#5F8EAD] focus:outline-none"
                  />
                </div>

                {searchTerm && (
                  <div className="mt-3 max-h-60 overflow-y-auto border-2 border-gray-200 rounded-xl">
                    {personalFiltrado.length > 0 ? (
                      personalFiltrado.map((persona) => (
                        <button
                          key={persona._id}
                          onClick={() => {
                            setEmpleadoSeleccionado(persona);
                            setSearchTerm('');
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-[#5F8EAD] hover:bg-opacity-10 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <p className="font-semibold text-[#34353A]">
                            {persona.name} {persona.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {persona.tipo} • Salario: {formatearMoneda(persona.salario || persona.salary || 0)}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-gray-500">No se encontraron resultados para "{searchTerm}"</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Total disponible: {todoElPersonal.length} personas ({empleados.length} empleados, {motoristas.length} motoristas)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {empleadoSeleccionado && (
                  <div className="mt-4 p-4 bg-[#5F8EAD] bg-opacity-10 border-2 border-[#5F8EAD] rounded-xl">
                    <p className="font-semibold text-[#34353A]">
                      Seleccionado: {empleadoSeleccionado.name} {empleadoSeleccionado.lastName}
                    </p>
                    <p className="text-sm text-[#5F8EAD]">
                      {empleadoSeleccionado.tipo} • Salario Quincenal: {formatearMoneda((empleadoSeleccionado.salario || empleadoSeleccionado.salary || 0) / 2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Formulario de valores adicionales */}
              <div className="grid grid-cols-3 gap-4">
                {/* Nota informativa */}
                <div className="col-span-3 p-4 bg-[#5F8EAD] bg-opacity-10 border-l-4 border-[#5F8EAD] rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-[#5F8EAD] flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-[#34353A]">Cálculo Automático</p>
                      <p className="text-xs text-gray-700 mt-1">
                        Los descuentos de ley (ISSS 3%, AFP 7.25%, Renta según tabla) se calculan automáticamente según el salario del empleado.
                      </p>
                    </div>
                  </div>
                </div>

                {/* INGRESOS ADICIONALES */}
                <div className="col-span-3">
                  <h3 className="text-lg font-bold text-[#34353A] mb-3 pb-2 border-b-2 border-[#5D9646]">
                    ✅ Ingresos Adicionales
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">
                    Viáticos
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.viaticos}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, viaticos: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#5D9646] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">
                    Trabajo Sábado/Domingo
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.trabajoSabadoDomingo}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, trabajoSabadoDomingo: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#5D9646] focus:outline-none"
                    />
                  </div>
                </div>

                {/* OTROS DESCUENTOS */}
                <div className="col-span-3 mt-4">
                  <h3 className="text-lg font-bold text-[#34353A] mb-3 pb-2 border-b-2 border-orange-500">
                    📋 Otros Descuentos
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">
                    Anticipos
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.anticipos}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, anticipos: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">
                    Préstamos
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.prestamos}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, prestamos: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">
                    Otros Descuentos
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.otros}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, otros: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModalAgregar(false);
                  limpiarFormulario();
                }}
                className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={agregarEmpleadoAPlanilla}
                disabled={!empleadoSeleccionado}
                className="px-6 py-2.5 bg-[#5F8EAD] text-white rounded-xl hover:opacity-90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar a Planilla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Empleado */}
      {showModalEditar && empleadoEditando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#5F8EAD] from-opacity-10 to-transparent">
              <div>
                <h2 className="text-2xl font-bold text-[#34353A]">Editar Empleado</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {empleadoEditando.nombreCompleto} - {empleadoEditando.tipoEmpleado}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModalEditar(false);
                  setEmpleadoEditando(null);
                  limpiarFormulario();
                }}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Nota informativa */}
                <div className="col-span-3 p-4 bg-[#5F8EAD] bg-opacity-10 border-l-4 border-[#5F8EAD] rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-[#5F8EAD] flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-[#34353A]">Cálculo Automático</p>
                      <p className="text-xs text-gray-700 mt-1">
                        Los descuentos de ley (ISSS, AFP, Renta) se recalculan automáticamente al guardar los cambios.
                      </p>
                    </div>
                  </div>
                </div>

                {/* INGRESOS ADICIONALES */}
                <div className="col-span-3">
                  <h3 className="text-lg font-bold text-[#34353A] mb-3 pb-2 border-b-2 border-[#5D9646]">
                    ✅ Ingresos Adicionales
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">
                    Viáticos
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.viaticos}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, viaticos: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#5D9646] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">
                    Trabajo Sábado/Domingo
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.trabajoSabadoDomingo}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, trabajoSabadoDomingo: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#5D9646] focus:outline-none"
                    />
                  </div>
                </div>

                {/* OTROS DESCUENTOS */}
                <div className="col-span-3 mt-4">
                  <h3 className="text-lg font-bold text-[#34353A] mb-3 pb-2 border-b-2 border-orange-500">
                    📋 Otros Descuentos
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">
                    Anticipos
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.anticipos}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, anticipos: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">
                    Préstamos
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.prestamos}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, prestamos: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">
                    Otros Descuentos
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.otros}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, otros: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModalEditar(false);
                  setEmpleadoEditando(null);
                  limpiarFormulario();
                }}
                className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={editarEmpleadoDePlanilla}
                className="px-6 py-2.5 bg-[#5F8EAD] text-white rounded-xl hover:opacity-90 font-semibold"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}