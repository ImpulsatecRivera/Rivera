import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Plus, AlertCircle, Users, 
  ChevronRight, CheckCircle, Sparkles, Zap, Clock,
  TrendingUp, DollarSign, MousePointer, GripVertical, X,
  Search, Download, Info, Briefcase, Truck
} from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';
import { useAuth } from '../../Context/authContext';
import { api } from '../../Context/authContext';
import { useTutorial } from '../../hooks/useTutorial';
import '../../styles/tutorial-global.css';
import { HelpCircle } from 'lucide-react';

export default function PlanillaSemanalNueva() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && user && user.userType !== 'Administrador') {
      navigate('/no-access');
    }
  }, [user, authLoading, navigate]);
  
  const [step, setStep] = useState(1);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [diasHabiles, setDiasHabiles] = useState('26');
  const [loading, setLoading] = useState(false);
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
  const [busquedaEmpleados, setBusquedaEmpleados] = useState('');
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const { startTutorial } = useTutorial('planillaSemanalNueva');

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  useEffect(() => {
    if (fechaInicio) {
      // Trabajar directamente con el string sin crear Date objects que causen problemas de timezone
      const fechaParts = fechaInicio.split('-'); // ['2026', '02', '02']
      const year = parseInt(fechaParts[0]);
      const month = parseInt(fechaParts[1]) - 1; // 0-indexed
      const day = parseInt(fechaParts[2]);
      
      // Crear fecha en UTC para evitar problemas de zona horaria
      const inicio = new Date(Date.UTC(year, month, day, 12, 0, 0));
      
      console.log('📅 Fecha seleccionada:', {
        input: fechaInicio,
        fechaUTC: inicio.toISOString(),
        diaUTC: inicio.getUTCDay(),
        nombreDia: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][inicio.getUTCDay()]
      });
      
      // Validar que sea lunes (día 1) usando UTC
      if (inicio.getUTCDay() !== 1) {
        Swal.fire({
          icon: 'warning',
          title: 'Fecha inválida',
          text: 'La fecha de inicio debe ser un LUNES',
          confirmButtonColor: '#5F8EAD'
        });
        setFechaInicio('');
        setFechaFin('');
        return;
      }

      // Calcular sábado (5 días después) en UTC
      const fin = new Date(inicio);
      fin.setUTCDate(fin.getUTCDate() + 5);
      
      const finYear = fin.getUTCFullYear();
      const finMonth = String(fin.getUTCMonth() + 1).padStart(2, '0');
      const finDay = String(fin.getUTCDate()).padStart(2, '0');
      
      setFechaFin(`${finYear}-${finMonth}-${finDay}`);
      
      console.log('✅ Fechas válidas:', {
        inicio: `${day}/${month + 1}/${year}`,
        fin: `${finDay}/${finMonth}/${finYear}`
      });
    }
  }, [fechaInicio]);

  useEffect(() => {
    cargarEmpleadosDisponibles();
  }, []);

  const cargarEmpleadosDisponibles = async () => {
    setLoadingEmpleados(true);
    try {
      const resEmpleados = await api.get(`${config.api.API_URL}/empleados?limit=1000`);
      const resMotoristas = await api.get(`${config.api.API_URL}/motoristas`);

      const dataEmpleados = resEmpleados.data;
      const dataMotoristas = resMotoristas.data;

      let empleados = [];
      let motoristas = [];

      if (Array.isArray(dataEmpleados)) empleados = dataEmpleados;
      else if (dataEmpleados?.empleados) empleados = dataEmpleados.empleados;
      else if (dataEmpleados?.data) empleados = Array.isArray(dataEmpleados.data)
        ? dataEmpleados.data
        : Object.values(dataEmpleados.data).find(v => Array.isArray(v)) || [];

      if (Array.isArray(dataMotoristas)) motoristas = dataMotoristas;
      else if (dataMotoristas?.motoristas) motoristas = dataMotoristas.motoristas;
      else if (dataMotoristas?.data) motoristas = dataMotoristas.data;

      const todosPosibles = [
        ...empleados.map(e => ({
          _id: e._id,
          nombre: `${e.name || e.nombre || ''} ${e.lastName || e.apellido || ''}`.trim(),
          tipo: 'empleado',
          rol: e.rol, // ✅ INCLUIR ROL
          planillaTipo: e.planillaTipo || 'N/A',
          salario: e.salary || e.salario || 0
        })),
        ...motoristas.map(m => ({
          _id: m._id,
          nombre: `${m.name || m.nombre || ''} ${m.lastName || m.apellido || ''}`.trim(),
          tipo: 'motorista',
          rol: m.rol, // ✅ INCLUIR ROL (motorista o auxiliar)
          planillaTipo: m.planillaTipo || 'N/A',
          salario: m.salary || m.salario || 0
        }))
      ];

      setEmpleadosDisponibles(todosPosibles);
    } catch (error) {
      console.error('Error cargando empleados:', error);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const handleAgregarEmpleado = (empleado) => {
    if (!empleadosSeleccionados.find(e => e._id === empleado._id)) {
      setEmpleadosSeleccionados([...empleadosSeleccionados, empleado]);
    }
  };

  const handleRemoverEmpleado = (empleadoId) => {
    setEmpleadosSeleccionados(empleadosSeleccionados.filter(e => e._id !== empleadoId));
  };

  const calcularBaseDiaria = (salario) => {
    return (salario / parseInt(diasHabiles)).toFixed(2);
  };

  const calcularTotalEstimado = () => {
    // Solo incluir empleados que ganan semanalmente
    return empleadosSeleccionados
      .filter(emp => emp.planillaTipo === 'Semanal')
      .reduce((total, emp) => {
        return total + (parseFloat(calcularBaseDiaria(emp.salario)) * 6);
      }, 0);
  };

  const handleCrearPlanilla = async () => {
    if (!fechaInicio || !fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Debes seleccionar las fechas'
      });
      return;
    }

    // Validar días hábiles
    const diasHabilesNum = Number.parseInt(diasHabiles);
    if (isNaN(diasHabilesNum) || diasHabilesNum < 20 || diasHabilesNum > 31) {
      Swal.fire({
        icon: 'warning',
        title: 'Días hábiles inválidos',
        text: 'Los días hábiles deben estar entre 20 y 31'
      });
      return;
    }

    setLoading(true);

    try {
      // Crear fechas en UTC usando los strings directamente
      const [yearInicio, monthInicio, dayInicio] = fechaInicio.split('-').map(Number);
      const [yearFin, monthFin, dayFin] = fechaFin.split('-').map(Number);
      
      // Crear objetos Date en UTC para evitar problemas de zona horaria
      const fechaInicioDate = new Date(Date.UTC(yearInicio, monthInicio - 1, dayInicio, 12, 0, 0));
      const fechaFinDate = new Date(Date.UTC(yearFin, monthFin - 1, dayFin, 23, 59, 59));
      
      const payload = {
        fechaInicio: fechaInicioDate.toISOString(),
        fechaFin: fechaFinDate.toISOString(),
        diasHabiles: diasHabilesNum
      };

      console.log('📤 Enviando datos al backend:', payload);
      console.log('📅 Fechas legibles:', {
        inicio: `${dayInicio}/${monthInicio}/${yearInicio}`,
        fin: `${dayFin}/${monthFin}/${yearFin}`
      });

      const responsePlanilla = await api.post(
        `${config.api.API_URL}/planillas/semanal`,
        payload
      );

      const dataPlanilla = responsePlanilla.data;
      
      console.log('✅ Respuesta del backend:', dataPlanilla);

      if (!dataPlanilla.success) {
        throw new Error(dataPlanilla.message || 'Error al crear la planilla');
      }

      const planillaId = dataPlanilla.data._id;

      // Agregar empleados seleccionados
      if (empleadosSeleccionados.length > 0) {
        console.log(`📋 Agregando ${empleadosSeleccionados.length} empleados...`);
        
        for (const empleado of empleadosSeleccionados) {
          try {
            await api.post(
              `${config.api.API_URL}/planillas/semanal/${planillaId}/empleado`,
              { empleadoId: empleado._id }
            );
            console.log(`✅ Agregado: ${empleado.nombre}`);
          } catch (empError) {
            console.error(`❌ Error agregando ${empleado.nombre}:`, empError);
          }
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Planilla Creada',
        text: `Planilla creada exitosamente con ${empleadosSeleccionados.length} empleado(s)`,
        timer: 2000,
        showConfirmButton: false
      });

      navigate(`/planilla/semanal/${planillaId}`);

    } catch (error) {
      console.error('❌ Error creando planilla:', error);
      console.error('📋 Detalles completos:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        data: error.config?.data
      });

      let errorMessage = 'Error desconocido al crear la planilla';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al crear planilla',
        html: `
          <div style="text-align: left;">
            <p><strong>Mensaje:</strong></p>
            <p>${errorMessage}</p>
            ${error.response?.data?.details ? `<p><strong>Detalles:</strong> ${JSON.stringify(error.response.data.details)}</p>` : ''}
          </div>
        `,
        confirmButtonColor: '#5F8EAD'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCargarDatosAnteriores = async () => {
    try {
      Swal.fire({
        title: 'Cargando datos',
        text: 'Obteniendo empleados de planilla anterior...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      // Buscar la planilla semanal más reciente
      const response = await api.get(`${config.api.API_URL}/planillas/semanal`);
      const planillas = response.data?.data || response.data?.planillas || [];

      if (planillas.length === 0) {
        Swal.close();
        Swal.fire({
          icon: 'info',
          title: 'Sin planillas anteriores',
          text: 'No hay planillas previas para cargar empleados',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }

      // Obtener la planilla más reciente (ordenar por fecha)
      const planillaReciente = planillas.sort((a, b) => {
        const fechaA = new Date(a.fechaInicio || a.createdAt);
        const fechaB = new Date(b.fechaInicio || b.createdAt);
        return fechaB - fechaA; // Más reciente primero
      })[0];

      // Obtener los IDs de empleados de la planilla anterior
      const empleadosAnteriores = planillaReciente.empleados || [];
      const idsEmpleadosAnteriores = empleadosAnteriores.map(e => e.empleadoId || e._id);

      // Filtrar empleados disponibles que estaban en la planilla anterior
      const empleadosACargar = empleadosDisponibles.filter(emp => 
        idsEmpleadosAnteriores.includes(emp._id)
      );

      if (empleadosACargar.length === 0) {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: 'Sin coincidencias',
          text: 'No se encontraron empleados de la planilla anterior en la lista disponible',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }

      setEmpleadosSeleccionados(empleadosACargar);
      
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Datos Cargados',
        text: `${empleadosACargar.length} empleado(s) cargados desde la planilla del ${new Date(planillaReciente.fechaInicio).toLocaleDateString()}`,
        timer: 3000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error cargando planilla anterior:', error);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo cargar los datos de la planilla anterior',
        confirmButtonColor: '#5F8EAD'
      });
    }
  };

  const steps = [
    { num: 1, label: 'Período', icon: Calendar },
    { num: 2, label: 'Empleados', icon: Users },
    { num: 3, label: 'Confirmar', icon: CheckCircle }
  ];

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(cantidad || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/planilla')}
            className="group flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-[#5F8EAD] transition-all mb-6 shadow-sm"
          >
            <ArrowLeft size={20} className="text-[#34353A] group-hover:text-[#5F8EAD] group-hover:-translate-x-1 transition-all" />
            <span className="font-semibold text-[#34353A]">Volver</span>
          </button>
          <button
  onClick={startTutorial}
  className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-[#5F8EAD] to-[#5D9646] text-white rounded-full shadow-2xl hover:scale-110 transition-all z-50"
  title="Ver tutorial"
>
  <HelpCircle size={24} />
</button>
          

          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-[#5F8EAD] to-[#5D9646] rounded-2xl shadow-xl">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#34353A] mb-2">
                Nueva Planilla Semanal
              </h1>
              <p className="text-gray-600 text-lg">
                Configuración rápida e inteligente
              </p>
            </div>
          </div>
        </div>

        {/* STEPPER */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((s, idx) => {
              const StepIcon = s.icon;
              const isActive = step === s.num;
              const isCompleted = step > s.num;
              
              return (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-500 transform border-2
                      ${isActive ? 'bg-gradient-to-br from-[#5F8EAD] to-[#5D9646] text-white scale-110 shadow-2xl border-transparent' : ''}
                      ${isCompleted ? 'bg-[#5D9646] text-white border-transparent' : ''}
                      ${!isActive && !isCompleted ? 'bg-white border-gray-300 text-gray-400' : ''}
                    `}>
                      {isCompleted ? (
                        <CheckCircle size={28} />
                      ) : (
                        <StepIcon size={28} />
                      )}
                    </div>
                    <span className={`font-bold text-sm transition-colors ${
                      isActive || isCompleted ? 'text-[#34353A]' : 'text-gray-400'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-gradient-to-r from-[#5F8EAD] to-[#5D9646]' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PANEL IZQUIERDO - Formulario */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STEP 1: PERÍODO */}
            {step === 1 && (
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#5F8EAD] bg-opacity-20 rounded-xl">
                    <Calendar className="text-[#5F8EAD]" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-[#34353A]">Configurar Período</h2>
                </div>

                <div className="space-y-6">
                  {/* Fecha Inicio */}
                  <div className="group">
                    <label className="block text-sm font-bold text-[#34353A] mb-3 flex items-center gap-2">
                      <Clock size={16} />
                      Fecha de Inicio (Lunes)
                    </label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#5F8EAD] focus:bg-white focus:outline-none transition-all font-semibold text-[#34353A]"
                    />
                  </div>

                  {/* Fecha Fin */}
                  <div className="group">
                    <label className="block text-sm font-bold text-[#34353A] mb-3 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Fecha de Fin (Sábado)
                    </label>
                    <input
                      type="date"
                      value={fechaFin}
                      readOnly
                      className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-200 rounded-2xl font-semibold text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center gap-1">
                      <Info size={12} />
                      Se calcula automáticamente
                    </p>
                  </div>

                  {/* Días Hábiles */}
                  <div className="group">
                    <label className="block text-sm font-bold text-[#34353A] mb-3 flex items-center gap-2">
                      <TrendingUp size={16} />
                      Días Hábiles del Mes
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="31"
                      value={diasHabiles}
                      onChange={(e) => setDiasHabiles(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#5F8EAD] focus:bg-white focus:outline-none transition-all font-semibold text-[#34353A]"
                    />
                    <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center gap-1">
                      <Info size={12} />
                      Para calcular la base diaria
                    </p>
                  </div>

                  {/* Preview de fechas */}
                  {fechaInicio && fechaFin && (
                    <div className="bg-gradient-to-br from-[#5F8EAD]/10 to-[#5D9646]/10 border-2 border-[#5F8EAD]/30 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[#34353A] font-semibold flex items-center gap-2">
                          <Calendar size={16} />
                          Vista Previa
                        </span>
                        <Zap size={20} className="text-[#5D9646]" />
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {diasSemana.map((dia, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-2 text-center border-2 border-gray-200">
                            <div className="text-xs text-gray-600 font-medium mb-1">{dia}</div>
                            <div className="text-sm font-bold text-[#34353A]">{idx + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!fechaInicio || !fechaFin}
                    className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5F8EAD] to-[#5D9646] text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span>Continuar</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: EMPLEADOS */}
            {step === 2 && (
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#5D9646] bg-opacity-20 rounded-xl">
                      <Users className="text-[#5D9646]" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#34353A]">Agregar Empleados</h2>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                        <Briefcase size={14} />
                        {empleadosDisponibles.length} disponibles ({empleadosDisponibles.filter(e => e.tipo === 'empleado').length} empleados, {empleadosDisponibles.filter(e => e.tipo === 'motorista').length} motoristas)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCargarDatosAnteriores}
                    className="flex items-center gap-2 px-4 py-2 bg-[#5F8EAD] hover:bg-[#5D9646] text-white rounded-xl font-semibold transition-all text-sm shadow-lg"
                  >
                    <Download size={16} />
                    Cargar Anteriores
                  </button>
                </div>

                {/* Búsqueda */}
                <div className="mb-6 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar empleado por nombre..."
                    value={busquedaEmpleados}
                    onChange={(e) => setBusquedaEmpleados(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#5D9646] focus:bg-white focus:outline-none transition-all font-semibold text-[#34353A] placeholder-gray-400"
                  />
                </div>

                {/* Lista empleados disponibles */}
                <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                  {empleadosDisponibles
                    .filter(e => !empleadosSeleccionados.find(sel => sel._id === e._id))
                    .filter(e => e.nombre.toLowerCase().includes(busquedaEmpleados.toLowerCase()))
                    .map((empleado) => (
                      <div
                        key={empleado._id}
                        onClick={() => handleAgregarEmpleado(empleado)}
                        className="group bg-white hover:bg-[#5D9646]/5 border-2 border-gray-200 hover:border-[#5D9646] rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-[#34353A] text-sm truncate mb-1">
                              {empleado.nombre}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded-lg text-gray-600 flex items-center gap-1">
                                {empleado.tipo === 'motorista' ? (
                                  <>
                                    <Truck size={12} />
                                    {empleado.rol === 'auxiliar' ? 'Auxiliar' : 'Motorista'}
                                  </>
                                ) : (
                                  <>
                                    <Briefcase size={12} />
                                    Empleado
                                  </>
                                )}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-lg ${
                                empleado.planillaTipo === 'Semanal' 
                                  ? 'bg-green-100 text-green-700' 
                                  : empleado.planillaTipo === 'Quincenal'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {empleado.planillaTipo}
                              </span>
                            </div>
                          </div>
                          <Plus size={16} className="text-[#5D9646] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {empleado.planillaTipo === 'Semanal' && (
                          <div className="text-xs text-gray-600 font-medium mt-2 flex items-center gap-1">
                            <DollarSign size={12} />
                            Base: {formatearMoneda(calcularBaseDiaria(empleado.salario))} /día
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Empleados seleccionados */}
                {empleadosSeleccionados.length > 0 && (
                  <div className="bg-gradient-to-br from-[#5D9646]/10 to-[#5F8EAD]/10 border-2 border-[#5D9646]/30 rounded-2xl p-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[#34353A] font-bold flex items-center gap-2">
                        <CheckCircle size={18} className="text-[#5D9646]" />
                        Seleccionados ({empleadosSeleccionados.length})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {empleadosSeleccionados.map(emp => (
                        <div key={emp._id} className="flex items-center justify-between bg-white rounded-xl p-3 border-2 border-gray-200">
                          <span className="text-[#34353A] text-sm font-semibold truncate flex-1">
                            {emp.nombre}
                          </span>
                          <button
                            onClick={() => handleRemoverEmpleado(emp._id)}
                            className="ml-2 p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 hover:text-red-700 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 text-[#34353A] rounded-2xl font-bold transition-all"
                  >
                    <ArrowLeft size={20} />
                    <span>Atrás</span>
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5F8EAD] to-[#5D9646] text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    <span>Continuar</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRMACIÓN */}
            {step === 3 && (
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#5F8EAD] to-[#5D9646] bg-opacity-20 rounded-xl">
                    <CheckCircle className="text-[#5D9646]" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-[#34353A]">Confirmar Creación</h2>
                </div>

                <div className="space-y-6">
                  {/* Resumen período */}
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                    <h3 className="text-[#34353A] font-bold mb-4 flex items-center gap-2">
                      <Calendar size={18} />
                      Período de la Planilla
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-gray-600 text-xs font-medium mb-1 flex items-center gap-1">
                          <Clock size={12} />
                          Inicio
                        </div>
                        <div className="text-[#34353A] font-bold">{fechaInicio.split('-').reverse().join('/')}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs font-medium mb-1 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Fin
                        </div>
                        <div className="text-[#34353A] font-bold">{fechaFin.split('-').reverse().join('/')}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs font-medium mb-1 flex items-center gap-1">
                          <TrendingUp size={12} />
                          Días Hábiles
                        </div>
                        <div className="text-[#34353A] font-bold">{diasHabiles} días</div>
                      </div>
                    </div>
                  </div>

                  {/* Resumen empleados */}
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                    <h3 className="text-[#34353A] font-bold mb-4 flex items-center gap-2">
                      <Users size={18} />
                      Empleados ({empleadosSeleccionados.length})
                    </h3>
                    {empleadosSeleccionados.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {empleadosSeleccionados.map(emp => (
                          <div key={emp._id} className="flex items-center justify-between bg-white rounded-xl p-3 border-2 border-gray-200">
                            <span className="text-[#34353A] text-sm font-semibold">{emp.nombre}</span>
                            {emp.planillaTipo === 'Semanal' && (
                              <span className="text-[#5F8EAD] text-xs font-bold flex items-center gap-1">
                                <DollarSign size={12} />
                                {formatearMoneda(calcularBaseDiaria(emp.salario))} /día
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm flex items-center gap-2">
                        <Info size={16} />
                        Sin empleados (podrás agregarlos después)
                      </p>
                    )}
                  </div>

                  {/* Total estimado */}
                  {empleadosSeleccionados.length > 0 && (
                    <div className="bg-gradient-to-br from-[#5F8EAD]/20 to-[#5D9646]/20 border-2 border-[#5F8EAD]/30 rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[#34353A] text-sm font-medium mb-1 flex items-center gap-1">
                            <TrendingUp size={14} />
                            Total Estimado (6 días)
                          </div>
                          <div className="text-3xl font-black text-[#34353A]">
                            {formatearMoneda(calcularTotalEstimado())}
                          </div>
                        </div>
                        <DollarSign size={40} className="text-[#5D9646]" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 text-[#34353A] rounded-2xl font-bold transition-all"
                  >
                    <ArrowLeft size={20} />
                    <span>Atrás</span>
                  </button>
                  <button
                    onClick={handleCrearPlanilla}
                    disabled={loading}
                    className="group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creando Planilla...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        <span>Crear Planilla</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PANEL DERECHO - Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              
              {/* Card de progreso */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-xl">
                <h3 className="text-[#34353A] font-bold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Progreso
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Paso {step} de 3</span>
                    <span className="text-[#5F8EAD] font-bold">{Math.round((step/3) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#5F8EAD] to-[#5D9646] transition-all duration-500 rounded-full"
                      style={{ width: `${(step/3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card de stats */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-xl">
                <h3 className="text-[#34353A] font-bold mb-4 flex items-center gap-2">
                  <Info size={18} />
                  Resumen Rápido
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <span className="text-gray-600 text-sm flex items-center gap-2">
                      <Calendar size={16} />
                      Días
                    </span>
                    <span className="text-[#34353A] font-bold">6</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <span className="text-gray-600 text-sm flex items-center gap-2">
                      <Users size={16} />
                      Empleados
                    </span>
                    <span className="text-[#34353A] font-bold">{empleadosSeleccionados.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <span className="text-gray-600 text-sm flex items-center gap-2">
                      <DollarSign size={16} />
                      Total Base
                    </span>
                    <span className="text-[#5D9646] font-bold">
                      {formatearMoneda(calcularTotalEstimado())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tip card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[#34353A] font-bold mb-2 flex items-center gap-2">
                      <Info size={16} />
                      Consejo
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {step === 1 && "Asegúrate de seleccionar un lunes como fecha de inicio"}
                      {step === 2 && "Puedes agregar más empleados después de crear la planilla"}
                      {step === 3 && "Revisa bien los datos antes de crear la planilla"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}