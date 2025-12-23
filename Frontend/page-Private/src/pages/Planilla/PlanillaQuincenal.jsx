import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Save, X, DollarSign, User, Calendar, FileText, Download,
  CheckCircle, Trash2, Edit2, Lock, Unlock, Search, Filter, ChevronDown,
  Clock, AlertCircle
} from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';

export default function PlanillaQuincenal() {
  const [planilla, setPlanilla] = useState(null);
  const [loading, setLoading] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);

  // Datos del formulario para nuevo empleado o edición
  const [formEmpleado, setFormEmpleado] = useState({
    viaticos: 0,
    trabajoSabadoDomingo: 0,
    anticipos: 0,
    prestamos: 0,
    otros: 0
  });

  // Información de la planilla - se calculará dinámicamente
  const [infoPlanilla, setInfoPlanilla] = useState({
    año: 2025,
    mes: 12,
    quincena: 1
  });

  // Función para calcular la próxima quincena disponible
  const calcularProximaQuincena = (planillaActual) => {
    if (!planillaActual) {
      // Si no hay planilla, usar fecha actual
      const hoy = new Date();
      return {
        año: hoy.getFullYear(),
        mes: hoy.getMonth() + 1,
        quincena: hoy.getDate() <= 15 ? 1 : 2
      };
    }

    let { año, mes, quincena } = planillaActual;

    // Si es primera quincena, siguiente es segunda quincena del mismo mes
    if (quincena === 1) {
      return { año, mes, quincena: 2 };
    }

    // Si es segunda quincena, siguiente es primera quincena del próximo mes
    mes++;
    if (mes > 12) {
      mes = 1;
      año++;
    }

    return { año, mes, quincena: 1 };
  };

  useEffect(() => {
    cargarEmpleadosYMotoristas();
    crearPlanillaInicial();
  }, []);

  const cargarEmpleadosYMotoristas = async () => {
    try {
      // Cargar empleados
      const resEmpleados = await fetch(`${config.api.API_URL}/empleados`);
      const dataEmpleados = await resEmpleados.json();
      console.log('📥 Respuesta Empleados:', dataEmpleados);
      
      // Empleados vienen en: data.empleados (estructura anidada)
      let empleadosArray = [];
      if (dataEmpleados?.data?.empleados) {
        empleadosArray = dataEmpleados.data.empleados;
      } else if (Array.isArray(dataEmpleados)) {
        empleadosArray = dataEmpleados;
      }
      
      console.log('✅ Empleados extraídos:', empleadosArray.length, empleadosArray);
      setEmpleados(empleadosArray);

      // Cargar motoristas
      const resMotoristas = await fetch(`${config.api.API_URL}/motoristas`);
      const dataMotoristas = await resMotoristas.json();
      console.log('📥 Respuesta Motoristas:', dataMotoristas);
      
      // Motoristas vienen directamente como array
      const motoristasArray = Array.isArray(dataMotoristas) ? dataMotoristas : [];
      
      console.log('✅ Motoristas extraídos:', motoristasArray.length, motoristasArray);
      setMotoristas(motoristasArray);
    } catch (error) {
      console.error('❌ Error cargando personal:', error);
      setEmpleados([]);
      setMotoristas([]);
    }
  };

  const buscarPrimeraQuincenaDisponible = async () => {
    let { año, mes, quincena } = infoPlanilla;
    let intentos = 0;
    const maxIntentos = 24; // Buscar hasta 24 quincenas adelante (1 año)

    while (intentos < maxIntentos) {
      try {
        // Intentar crear planilla
        const response = await fetch(`${config.api.API_URL}/planillas/quincenal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            año,
            mes,
            quincena,
            empleados: []
          })
        });

        const data = await response.json();

        // Si se creó exitosamente, retornar
        if (data.success && data.data) {
          return {
            exito: true,
            planilla: data.data,
            mensaje: `Planilla creada: ${data.data.descripcion}`
          };
        }

        // Si ya existe, verificar su estado
        if (response.status === 400 && data.data?.planillaId) {
          const planillaResponse = await fetch(
            `${config.api.API_URL}/planillas/quincenal/${data.data.planillaId}`
          );
          const planillaData = await planillaResponse.json();

          if (planillaData.success && planillaData.data) {
            const planillaExistente = planillaData.data;

            // Si está disponible (borrador o pendiente), retornarla
            if (planillaExistente.estado === 'borrador' || planillaExistente.estado === 'pendiente') {
              return {
                exito: true,
                planilla: planillaExistente,
                mensaje: `Planilla encontrada: ${planillaExistente.descripcion}`
              };
            }

            // Si está cerrada/pagada/aprobada, calcular la siguiente
            const siguiente = calcularProximaQuincena({ año, mes, quincena });
            año = siguiente.año;
            mes = siguiente.mes;
            quincena = siguiente.quincena;
          }
        } else {
          // Error inesperado, calcular siguiente
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

    // Si llegamos aquí, no encontramos ninguna disponible
    return {
      exito: false,
      mensaje: 'No se encontró ninguna quincena disponible'
    };
  };

  const crearPlanillaInicial = async () => {
    setLoading(true);
    try {
      const { año, mes, quincena } = infoPlanilla;

      const response = await fetch(`${config.api.API_URL}/planillas/quincenal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          año,
          mes,
          quincena,
          empleados: []
        })
      });

      const data = await response.json();
      
      // Si la planilla ya existe (error 400)
      if (response.status === 400 && data.data?.planillaId) {
        // Buscar la planilla existente
        const planillaResponse = await fetch(
          `${config.api.API_URL}/planillas/quincenal/${data.data.planillaId}`
        );
        const planillaData = await planillaResponse.json();
        
        if (planillaData.success && planillaData.data) {
          const planillaExistente = planillaData.data;
          
          // VERIFICAR SI LA PLANILLA ESTÁ CERRADA, PAGADA O APROBADA
          if (planillaExistente.estado === 'cerrada' || 
              planillaExistente.estado === 'pagada' || 
              planillaExistente.estado === 'aprobada') {
            // Mostrar modal SOLO UNA VEZ
            const result = await Swal.fire({
              title: 'Planilla no disponible',
              html: `
                <p>La planilla de <strong>${planillaExistente.descripcion}</strong> está <strong>${planillaExistente.estado}</strong>.</p>
                <p>¿Deseas crear una nueva planilla?</p>
                <p class="text-sm text-gray-500 mt-2">Se buscará automáticamente la próxima quincena disponible.</p>
              `,
              icon: 'info',
              showCancelButton: true,
              confirmButtonColor: '#4f46e5',
              cancelButtonColor: '#6b7280',
              confirmButtonText: 'Sí, crear nueva',
              cancelButtonText: 'No, ver planilla'
            });

            if (result.isConfirmed) {
              setLoading(true);
              
              // Calcular próxima quincena como punto de partida
              const proximaQuincena = calcularProximaQuincena(planillaExistente);
              setInfoPlanilla(proximaQuincena);
              
              // Buscar automáticamente la primera disponible
              const resultado = await buscarPrimeraQuincenaDisponible();
              
              if (resultado.exito) {
                const planillaConEmpleados = {
                  ...resultado.planilla,
                  empleados: Array.isArray(resultado.planilla.empleados) 
                    ? resultado.planilla.empleados 
                    : []
                };
                setPlanilla(planillaConEmpleados);
                
                // Actualizar infoPlanilla con la planilla encontrada
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
                // Mostrar la planilla cerrada
                const planillaConEmpleados = {
                  ...planillaExistente,
                  empleados: Array.isArray(planillaExistente.empleados) 
                    ? planillaExistente.empleados 
                    : []
                };
                setPlanilla(planillaConEmpleados);
              }
            } else {
              // Mostrar la planilla cerrada (solo lectura)
              const planillaConEmpleados = {
                ...planillaExistente,
                empleados: Array.isArray(planillaExistente.empleados) 
                  ? planillaExistente.empleados 
                  : []
              };
              setPlanilla(planillaConEmpleados);
            }
          } else {
            // Planilla está en borrador o pendiente, se puede editar
            const planillaConEmpleados = {
              ...planillaExistente,
              empleados: Array.isArray(planillaExistente.empleados) 
                ? planillaExistente.empleados 
                : []
            };
            setPlanilla(planillaConEmpleados);
          }
        }
      } else if (data.success && data.data) {
        // Planilla creada exitosamente
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
      } else {
        // Crear planilla vacía localmente
        setPlanilla({
          _id: null,
          año,
          mes,
          quincena,
          empleados: [],
          totales: {}
        });
      }
    } catch (error) {
      console.error('Error creando planilla:', error);
      const { año, mes, quincena } = infoPlanilla;
      setPlanilla({
        _id: null,
        año,
        mes,
        quincena,
        empleados: [],
        totales: {}
      });
    } finally {
      setLoading(false);
    }
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
      
      // 🐛 DEBUG: Ver respuesta completa del servidor
      console.log('📥 Respuesta del servidor:', data);
      
      if (data.success && data.data) {
        // Asegurar que empleados sea un array
        const planillaActualizada = {
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        };
        
        // 🐛 DEBUG: Ver totales recibidos
        // En agregarEmpleadoAPlanilla y editarEmpleadoDePlanilla
console.log('📊 TOTALES RECIBIDOS:', planillaActualizada.totales);
console.log('📋 TODOS LOS CAMPOS:', Object.keys(planillaActualizada.totales));  // ← AGREGAR ESTA LÍNEA
console.log('   ├─ Total Trabajo Sáb/Dom:', planillaActualizada.totales?.totalTrabajoSabadoDomingo);
console.log('   ├─ Total Otros:', planillaActualizada.totales?.totalOtros);
console.log('   └─ Total Viáticos:', planillaActualizada.totales?.totalViaticos);

        
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
      
      // 🐛 DEBUG: Ver respuesta completa del servidor
      console.log('📥 Respuesta del servidor (EDITAR):', data);
      
      if (data.success && data.data) {
        const planillaActualizada = {
          ...data.data,
          empleados: Array.isArray(data.data.empleados) ? data.data.empleados : []
        };
        
        // 🐛 DEBUG: Ver totales recibidos
        // En agregarEmpleadoAPlanilla y editarEmpleadoDePlanilla
console.log('📊 TOTALES RECIBIDOS:', planillaActualizada.totales);
console.log('📋 TODOS LOS CAMPOS:', Object.keys(planillaActualizada.totales));  // ← AGREGAR ESTA LÍNEA
console.log('   ├─ Total Trabajo Sáb/Dom:', planillaActualizada.totales?.totalTrabajoSabadoDomingo);
console.log('   ├─ Total Otros:', planillaActualizada.totales?.totalOtros);
console.log('   └─ Total Viáticos:', planillaActualizada.totales?.totalViaticos);

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

    const mensajes = {
      pendiente: {
        title: '¿Marcar como Pendiente?',
        text: 'La planilla pasará a estado pendiente de aprobación',
        confirmText: 'Sí, marcar como pendiente'
      },
      aprobada: {
        title: '¿Aprobar Planilla?',
        text: 'Una vez aprobada, no se podrá editar',
        confirmText: 'Sí, aprobar'
      },
      pagada: {
        title: '¿Marcar como Pagada?',
        text: 'Confirma que la planilla ha sido pagada',
        confirmText: 'Sí, marcar como pagada'
      },
      cerrada: {
        title: '¿Cerrar Planilla?',
        text: 'Una vez cerrada, la planilla quedará bloqueada permanentemente. No se podrá eliminar.',
        confirmText: 'Sí, cerrar planilla'
      }
    };

    const mensaje = mensajes[nuevoEstado];
    
    const result = await Swal.fire({
      title: mensaje.title,
      text: mensaje.text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280',
      confirmButtonText: mensaje.confirmText,
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
      borrador: { bg: 'bg-gray-100', text: 'text-gray-700', icon: <Edit2 size={14} /> },
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock size={14} /> },
      aprobada: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <CheckCircle size={14} /> },
      pagada: { bg: 'bg-green-100', text: 'text-green-700', icon: <DollarSign size={14} /> },
      cerrada: { bg: 'bg-red-100', text: 'text-red-700', icon: <Lock size={14} /> }
    };

    const badge = badges[estado] || badges.borrador;
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${badge.bg} ${badge.text} font-semibold text-sm`}>
        {badge.icon}
        {estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : 'Borrador'}
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
    
    const personal = [...empleadosMapeados, ...motoristasMapeados];
    
    console.log('Todo el personal combinado:', {
      totalEmpleados: empleadosMapeados.length,
      totalMotoristas: motoristasMapeados.length,
      totalGeneral: personal.length,
      personal: personal
    });
    
    return personal;
  }, [empleados, motoristas]);

  const personalFiltrado = React.useMemo(() => {
    if (!searchTerm) return [];
    
    const filtrado = todoElPersonal.filter(p => {
      const nombreCompleto = `${p.name || ''} ${p.lastName || ''}`.toLowerCase();
      const busqueda = searchTerm.toLowerCase();
      return nombreCompleto.includes(busqueda);
    });
    
    console.log('Personal filtrado:', {
      searchTerm,
      resultados: filtrado.length,
      filtrado
    });
    
    return filtrado;
  }, [todoElPersonal, searchTerm]);

  // Determinar permisos según estado
  const puedeEditar = planilla?.estado === 'borrador' || planilla?.estado === 'pendiente';
  const puedeEliminar = planilla?.estado === 'borrador' || planilla?.estado === 'pendiente';
  const soloLectura = planilla?.estado === 'aprobada' || 
                      planilla?.estado === 'pagada' || 
                      planilla?.estado === 'cerrada';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Cargando planilla...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Planilla Quincenal
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span className="font-semibold">
                    {planilla?.descripcion || 
                     `${infoPlanilla.quincena === 1 ? 'Primera' : 'Segunda'} Quincena - ${getMesNombre(infoPlanilla.mes)} ${infoPlanilla.año}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Estado: </span>
                  {getEstadoBadge(planilla?.estado)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Botón Agregar Empleado */}
              <button
                onClick={() => setShowModalAgregar(true)}
                disabled={!puedeEditar}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all ${
                  !puedeEditar
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Plus size={20} />
                Agregar Empleado
              </button>

              {/* Botones de cambio de estado */}
              {planilla?.estado === 'borrador' && (
                <button
                  onClick={() => cambiarEstadoPlanilla('pendiente')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Clock size={20} />
                  Marcar Pendiente
                </button>
              )}

              {planilla?.estado === 'pendiente' && (
                <button
                  onClick={() => cambiarEstadoPlanilla('aprobada')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <CheckCircle size={20} />
                  Aprobar Planilla
                </button>
              )}

              {planilla?.estado === 'aprobada' && (
                <button
                  onClick={() => cambiarEstadoPlanilla('pagada')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <DollarSign size={20} />
                  Marcar como Pagada
                </button>
              )}

              {planilla?.estado === 'pagada' && (
                <button
                  onClick={() => cambiarEstadoPlanilla('cerrada')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Lock size={20} />
                  Cerrar Planilla
                </button>
              )}

              {/* Botón Nueva Planilla (solo cuando está cerrada, pagada o aprobada) */}
              {soloLectura && (
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Plus size={20} />
                  Nueva Planilla
                </button>
              )}
            </div>
          </div>

          {/* Banner de solo lectura */}
          {soloLectura && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
              <AlertCircle className="text-amber-600" size={24} />
              <div>
                <p className="font-semibold text-amber-900">Planilla en modo solo lectura</p>
                <p className="text-sm text-amber-700">
                  Esta planilla está <strong>{planilla?.estado}</strong> y no se puede modificar.
                  {planilla?.estado !== 'cerrada' && ' Puedes crear una nueva planilla usando el botón "Nueva Planilla".'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tabla tipo Excel */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Excel Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 border-b border-indigo-700">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <FileText size={24} />
                <div>
                  <h2 className="font-bold text-lg">Hoja de Cálculo - Planilla</h2>
                  <p className="text-xs text-indigo-100">
                    Formato: Quincenal | Período: {getMesNombre(planilla?.mes || infoPlanilla.mes)} {planilla?.año || infoPlanilla.año}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-100">Total Empleados</p>
                <p className="text-2xl font-bold">{planilla?.empleados?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Tabla Excel Style */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header de columnas estilo Excel */}
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-8">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-r border-gray-300 min-w-[200px]">Nombre Completo</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-32">Salario Quincenal</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-28">Viáticos</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-28">Sáb/Dom</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-indigo-700 uppercase border-r border-indigo-300 bg-indigo-50 w-32">Total Salario</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-24">ISSS</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-24">AFP</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-24">Renta</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-28">Anticipos</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-28">Préstamos</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-24">Otros</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-red-700 uppercase border-r border-red-300 bg-red-50 w-32">Total Desc.</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-green-700 uppercase bg-green-50 w-36">A Pagar</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase w-28">Acciones</th>
                </tr>
              </thead>

              {/* Body con datos */}
              <tbody>
                {!planilla || !Array.isArray(planilla.empleados) || planilla.empleados.length === 0 ? (
                  <tr>
                    <td colSpan="16" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-6 bg-gray-100 rounded-full">
                          <User className="text-gray-400" size={48} />
                        </div>
                        <div>
                          <p className="text-gray-600 font-semibold text-lg mb-2">
                            No hay empleados en esta planilla
                          </p>
                          <p className="text-gray-500 text-sm mb-4">
                            Comienza agregando empleados a la planilla quincenal
                          </p>
                          {puedeEditar && (
                            <button
                              onClick={() => setShowModalAgregar(true)}
                              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
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
                      className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700 border-r border-gray-200">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                        {emp.nombreCompleto}
                        <span className="ml-2 text-xs text-gray-500">({emp.tipoEmpleado})</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 border-r border-gray-200">
                        {formatearMoneda(emp.salarioQuincenal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-gray-700 border-r border-gray-200">
                        {formatearMoneda(emp.viaticos)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-gray-700 border-r border-gray-200">
                        {formatearMoneda(emp.trabajoSabadoDomingo)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono font-bold text-indigo-700 border-r border-indigo-200 bg-indigo-50">
                        {formatearMoneda(emp.totalSalarioMasViaticos)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-red-600 border-r border-gray-200">
                        {formatearMoneda(emp.descuentosLey?.isss?.monto)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-red-600 border-r border-gray-200">
                        {formatearMoneda(emp.descuentosLey?.afp?.monto)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-red-600 border-r border-gray-200">
                        {formatearMoneda(emp.descuentosLey?.renta?.monto)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-orange-600 border-r border-gray-200">
                        {formatearMoneda(emp.otrosDescuentos?.anticipos)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-orange-600 border-r border-gray-200">
                        {formatearMoneda(emp.otrosDescuentos?.prestamos)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-orange-600 border-r border-gray-200">
                        {formatearMoneda(emp.otrosDescuentos?.camisas)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-orange-600 border-r border-gray-200">
                        {formatearMoneda(emp.otrosDescuentos?.otros)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono font-bold text-red-700 border-r border-red-200 bg-red-50">
                        {formatearMoneda(emp.totalDescuentos)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono font-bold text-green-700 bg-green-50">
                        {formatearMoneda(emp.totalAPagar)}
                      </td>
                      <td className="px-4 py-3 text-center border-l border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          {puedeEditar && (
                            <button
                              onClick={() => {
                                // ✅ CORREGIDO: Agregar _id al objeto
                                setEmpleadoEditando({
                                  ...emp,
                                  _id: emp.empleadoId
                                });
                                setFormEmpleado({
                                  viaticos: emp.viaticos || 0,
                                  trabajoSabadoDomingo: emp.trabajoSabadoDomingo || 0,
                                  anticipos: emp.otrosDescuentos?.anticipos || 0,
                                  prestamos: emp.otrosDescuentos?.prestamos || 0,
                                  camisas: emp.otrosDescuentos?.camisas || 0,
                                  otros: emp.otrosDescuentos?.otros || 0
                                });
                                setShowModalEditar(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {puedeEliminar && (
                            <button
                              onClick={() => eliminarEmpleadoDePlanilla(emp.empleadoId)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {soloLectura && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Footer con totales */}
              {planilla && Array.isArray(planilla.empleados) && planilla.empleados.length > 0 && planilla.totales && (
                <tfoot className="bg-gray-800 text-white font-bold">
                  <tr>
                    <td colSpan="2" className="px-4 py-4 text-sm uppercase border-r border-gray-700">
                      TOTALES
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono border-r border-gray-700">
                      {formatearMoneda(planilla.totales?.totalSalariosQuincenales)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono border-r border-gray-700">
                      {formatearMoneda(planilla.totales?.totalViaticos)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono border-r border-gray-700">
                      {formatearMoneda(planilla.totales?.totalTrabajoSabadoDomingo)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono bg-indigo-900 border-r border-indigo-800">
                      {formatearMoneda(planilla.totales?.totalSalariosMasViaticos)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono border-r border-gray-700">
                      {formatearMoneda(planilla.totales?.totalISSS)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono border-r border-gray-700">
                      {formatearMoneda(planilla.totales?.totalAFP)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono border-r border-gray-700">
                      {formatearMoneda(planilla.totales?.totalRenta)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono border-r border-gray-700">
                      {formatearMoneda(planilla.totales?.totalAnticipos)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono border-r border-gray-700">
                      {formatearMoneda(planilla.totales?.totalPrestamos)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono border-r border-gray-700">
                      {formatearMoneda(planilla.totales?.totalOtros)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono bg-red-900 border-r border-red-800">
                      {formatearMoneda(planilla.totales?.totalDescuentos)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono text-lg bg-green-700">
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
              <h2 className="text-2xl font-bold text-gray-900">Agregar Empleado a Planilla</h2>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar Empleado o Motorista
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
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
                          className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <p className="font-semibold text-gray-900">
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
                  <div className="mt-4 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                    <p className="font-semibold text-indigo-900">
                      Seleccionado: {empleadoSeleccionado.name} {empleadoSeleccionado.lastName}
                    </p>
                    <p className="text-sm text-indigo-700">
                      {empleadoSeleccionado.tipo} • Salario Quincenal: {formatearMoneda((empleadoSeleccionado.salario || empleadoSeleccionado.salary || 0) / 2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Formulario de valores adicionales */}
              <div className="grid grid-cols-3 gap-4">
                {/* Nota informativa */}
                <div className="col-span-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Cálculo Automático</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Los descuentos de ley (ISSS 3%, AFP 7.25%, Renta según tabla) se calculan automáticamente según el salario del empleado.
                      </p>
                    </div>
                  </div>
                </div>

                {/* INGRESOS ADICIONALES */}
                <div className="col-span-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-green-500">
                    ✅ Ingresos Adicionales
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Viáticos
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.viaticos}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, viaticos: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trabajo Sábado/Domingo
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.trabajoSabadoDomingo}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, trabajoSabadoDomingo: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* OTROS DESCUENTOS */}
                <div className="col-span-3 mt-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-orange-500">
                    📋 Otros Descuentos
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Empleado</h2>
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
                <div className="col-span-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Cálculo Automático</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Los descuentos de ley (ISSS, AFP, Renta) se recalculan automáticamente al guardar los cambios.
                      </p>
                    </div>
                  </div>
                </div>

                {/* INGRESOS ADICIONALES */}
                <div className="col-span-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-green-500">
                    ✅ Ingresos Adicionales
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Viáticos
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.viaticos}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, viaticos: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trabajo Sábado/Domingo
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.trabajoSabadoDomingo}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, trabajoSabadoDomingo: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* OTROS DESCUENTOS */}
                <div className="col-span-3 mt-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-orange-500">
                    📋 Otros Descuentos
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
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