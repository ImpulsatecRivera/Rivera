import React, { useState, useEffect } from 'react';
import {
  Plus, Save, X, DollarSign, User, Calendar, FileText, Download,
  CheckCircle, Trash2, Edit2, Lock, Unlock, Search, Filter, ChevronDown
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
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  // Datos del formulario para nuevo empleado
  const [formEmpleado, setFormEmpleado] = useState({
    viaticos: 0,
    trabajoSabadoDomingo: 0,
    anticipos: 0,
    prestamos: 0,
    camisas: 0,
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
        mes: hoy.getMonth() + 1, // getMonth() devuelve 0-11
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
      setEmpleados(dataEmpleados || []);

      // Cargar motoristas
      const resMotoristas = await fetch(`${config.api.API_URL}/motoristas`);
      const dataMotoristas = await resMotoristas.json();
      setMotoristas(dataMotoristas || []);
    } catch (error) {
      console.error('Error cargando personal:', error);
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

            // Si está disponible (borrador), retornarla
            if (planillaExistente.estado !== 'cerrada' && planillaExistente.estado !== 'pagada') {
              return {
                exito: true,
                planilla: planillaExistente,
                mensaje: `Planilla encontrada: ${planillaExistente.descripcion}`
              };
            }

            // Si está cerrada/pagada, calcular la siguiente
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
          
          // ✅ VERIFICAR SI LA PLANILLA ESTÁ CERRADA O PAGADA
          if (planillaExistente.estado === 'cerrada' || planillaExistente.estado === 'pagada') {
            // Mostrar modal SOLO UNA VEZ
            const result = await Swal.fire({
              title: 'Planilla ya cerrada',
              html: `
                <p>La planilla de <strong>${planillaExistente.descripcion}</strong> ya está <strong>${planillaExistente.estado}</strong>.</p>
                <p>¿Deseas crear una nueva planilla?</p>
                <p class="text-sm text-gray-500 mt-2">Se buscará automáticamente la próxima quincena disponible.</p>
              `,
              icon: 'info',
              showCancelButton: true,
              confirmButtonColor: '#4f46e5',
              cancelButtonColor: '#6b7280',
              confirmButtonText: 'Sí, crear nueva',
              cancelButtonText: 'No, ver planilla cerrada'
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
            // Planilla está en borrador o activa, se puede editar
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
              camisas: parseFloat(formEmpleado.camisas) || 0,
              otros: parseFloat(formEmpleado.otros) || 0
            }
          })
        }
      );

      const data = await response.json();
      if (data.success && data.data) {
        // Asegurar que empleados sea un array
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
      camisas: 0,
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

  const todoElPersonal = [
    ...(Array.isArray(empleados) ? empleados.map(e => ({ ...e, tipo: 'Empleado' })) : []),
    ...(Array.isArray(motoristas) ? motoristas.map(m => ({ ...m, tipo: 'Motorista' })) : [])
  ];

  const personalFiltrado = todoElPersonal.filter(p =>
    `${p.name || ''} ${p.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <span>Estado: 
                    <span className={`font-bold ml-1 ${
                      planilla?.estado === 'pagada' ? 'text-green-600' :
                      planilla?.estado === 'cerrada' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {planilla?.estado ? 
                        planilla.estado.charAt(0).toUpperCase() + planilla.estado.slice(1) : 
                        'Borrador'
                      }
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModalAgregar(true)}
                disabled={planilla?.estado === 'cerrada' || planilla?.estado === 'pagada'}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all ${
                  planilla?.estado === 'cerrada' || planilla?.estado === 'pagada'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Plus size={20} />
                Agregar Empleado
              </button>
              <button 
                disabled={planilla?.estado === 'cerrada' || planilla?.estado === 'pagada'}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all ${
                  planilla?.estado === 'cerrada' || planilla?.estado === 'pagada'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Save size={20} />
                Guardar
              </button>
              {(planilla?.estado === 'cerrada' || planilla?.estado === 'pagada') && (
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Plus size={20} />
                  Nueva Planilla
                </button>
              )}
            </div>
          </div>
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
                  <p className="text-xs text-indigo-100">Formato: Quincenal | Período: Diciembre 1-15, 2025</p>
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
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-24">Camisas</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-r border-gray-300 w-24">Otros</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-red-700 uppercase border-r border-red-300 bg-red-50 w-32">Total Desc.</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-green-700 uppercase bg-green-50 w-36">A Pagar</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase w-24">Acciones</th>
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
                          <button
                            onClick={() => setShowModalAgregar(true)}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                          >
                            Agregar Primer Empleado
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  planilla.empleados.map((emp, index) => (
                    <tr
                      key={emp._id || index}
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
                        {formatearMoneda(emp.descuentosLey?.isss)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-red-600 border-r border-gray-200">
                        {formatearMoneda(emp.descuentosLey?.afp)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-red-600 border-r border-gray-200">
                        {formatearMoneda(emp.descuentosLey?.renta)}
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
                      <td className="px-4 py-3 text-center">
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
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
                      {formatearMoneda(planilla.totales?.totalISS)}
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
                      {formatearMoneda(planilla.totales?.totalCamisas)}
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
                    {personalFiltrado.map((persona) => (
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
                          {persona.tipo} • Salario: {formatearMoneda(persona.salary || persona.salario)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {empleadoSeleccionado && (
                  <div className="mt-4 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                    <p className="font-semibold text-indigo-900">
                      Seleccionado: {empleadoSeleccionado.name} {empleadoSeleccionado.lastName}
                    </p>
                    <p className="text-sm text-indigo-700">
                      {empleadoSeleccionado.tipo} • Salario Quincenal: {formatearMoneda((empleadoSeleccionado.salary || empleadoSeleccionado.salario) / 2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Formulario de valores adicionales */}
              <div className="grid grid-cols-2 gap-4">
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
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
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
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
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
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
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
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Camisas
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formEmpleado.camisas}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, camisas: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
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
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
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
    </div>
  );
}