import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Users, Plus, X, 
  CheckCircle, AlertCircle, Search
} from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';

export default function PlanillaSemanalNueva() {
  const navigate = useNavigate();
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [diasHabiles, setDiasHabiles] = useState('26');
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // Auto-calcular fechaFin cuando se selecciona fechaInicio
  useEffect(() => {
    if (fechaInicio) {
      // Crear fecha correctamente sin problemas de zona horaria
      const [year, month, day] = fechaInicio.split('-');
      const inicio = new Date(year, month - 1, day);
      
      // Verificar que sea lunes (getDay() devuelve 1 para lunes)
      const diaSemana = inicio.getDay();
      
      console.log('Fecha seleccionada:', fechaInicio);
      console.log('Día de la semana:', diaSemana, '(1 = Lunes)');
      
      if (diaSemana !== 1) {
        Swal.fire({
          icon: 'warning',
          title: 'Fecha inválida',
          text: 'La fecha de inicio debe ser un lunes',
          timer: 2000,
          showConfirmButton: false
        });
        setFechaInicio('');
        return;
      }

      // Calcular sábado (5 días después)
      const fin = new Date(year, month - 1, day);
      fin.setDate(fin.getDate() + 5);
      
      const finYear = fin.getFullYear();
      const finMonth = String(fin.getMonth() + 1).padStart(2, '0');
      const finDay = String(fin.getDate()).padStart(2, '0');
      
      setFechaFin(`${finYear}-${finMonth}-${finDay}`);
    }
  }, [fechaInicio]);

  const cargarEmpleados = async () => {
    try {
      console.log('🔍 Cargando empleados...');
      
      // Cargar empleados
      const resEmpleados = await fetch(`${config.api.API_URL}/empleados`);
      console.log('📡 Status empleados:', resEmpleados.status, resEmpleados.ok);
      
      const dataEmpleados = await resEmpleados.json();
      console.log('📊 Respuesta empleados RAW:', dataEmpleados);
      console.log('📊 Tipo de respuesta empleados:', typeof dataEmpleados, Array.isArray(dataEmpleados));

      // Cargar motoristas
      const resMotoristas = await fetch(`${config.api.API_URL}/motoristas`);
      console.log('📡 Status motoristas:', resMotoristas.status, resMotoristas.ok);
      
      const dataMotoristas = await resMotoristas.json();
      console.log('📊 Respuesta motoristas RAW:', dataMotoristas);
      console.log('📊 Tipo de respuesta motoristas:', typeof dataMotoristas, Array.isArray(dataMotoristas));

      // Normalizar respuesta - puede venir como array directo o dentro de una propiedad
      let empleados = [];
      let motoristas = [];

      // Si dataEmpleados es un array directo
      if (Array.isArray(dataEmpleados)) {
        empleados = dataEmpleados;
        console.log('✅ Empleados como array directo:', empleados.length);
      } 
      // Si viene dentro de una propiedad
      else if (dataEmpleados && dataEmpleados.empleados && Array.isArray(dataEmpleados.empleados)) {
        empleados = dataEmpleados.empleados;
        console.log('✅ Empleados desde propiedad .empleados:', empleados.length);
      }
      else if (dataEmpleados && dataEmpleados.data) {
        // Si data es un array directo
        if (Array.isArray(dataEmpleados.data)) {
          empleados = dataEmpleados.data;
          console.log('✅ Empleados desde propiedad .data (array):', empleados.length);
        }
        // Si data es un objeto que contiene arrays
        else if (typeof dataEmpleados.data === 'object') {
          // Buscar el primer array dentro de data
          const keys = Object.keys(dataEmpleados.data);
          for (const key of keys) {
            if (Array.isArray(dataEmpleados.data[key])) {
              empleados = dataEmpleados.data[key];
              console.log(`✅ Empleados desde data.${key}:`, empleados.length);
              break;
            }
          }
        }
      }
      
      if (empleados.length === 0) {
        console.log('⚠️ No se pudo parsear empleados. Estructura:', Object.keys(dataEmpleados || {}));
      }

      // Si dataMotoristas es un array directo
      if (Array.isArray(dataMotoristas)) {
        motoristas = dataMotoristas;
        console.log('✅ Motoristas como array directo:', motoristas.length);
      }
      // Si viene dentro de una propiedad
      else if (dataMotoristas && dataMotoristas.motoristas && Array.isArray(dataMotoristas.motoristas)) {
        motoristas = dataMotoristas.motoristas;
        console.log('✅ Motoristas desde propiedad .motoristas:', motoristas.length);
      }
      else if (dataMotoristas && dataMotoristas.data && Array.isArray(dataMotoristas.data)) {
        motoristas = dataMotoristas.data;
        console.log('✅ Motoristas desde propiedad .data:', motoristas.length);
      }
      else {
        console.log('⚠️ No se pudo parsear motoristas. Estructura:', Object.keys(dataMotoristas || {}));
      }

      console.log('📋 Empleados parseados:', empleados.length, empleados);
      console.log('📋 Motoristas parseados:', motoristas.length, motoristas);

      // 🔍 DEBUG: Si empleados está vacío, mostrar qué contiene el objeto
      if (empleados.length === 0 && dataEmpleados) {
        console.log('🔎 Explorando estructura de empleados:');
        console.log('Keys disponibles:', Object.keys(dataEmpleados));
        Object.keys(dataEmpleados).forEach(key => {
          console.log(`  - ${key}:`, Array.isArray(dataEmpleados[key]) ? `Array(${dataEmpleados[key].length})` : typeof dataEmpleados[key]);
          if (Array.isArray(dataEmpleados[key]) && dataEmpleados[key].length > 0) {
            console.log(`    Primer elemento de ${key}:`, dataEmpleados[key][0]);
          }
          // Si es objeto, ver qué contiene
          if (typeof dataEmpleados[key] === 'object' && !Array.isArray(dataEmpleados[key]) && dataEmpleados[key] !== null) {
            console.log(`    Contenido de ${key}:`, dataEmpleados[key]);
            console.log(`    Keys dentro de ${key}:`, Object.keys(dataEmpleados[key]));
          }
        });
      }

      const todosEmpleados = [
        ...empleados.map(e => ({
          _id: e._id,
          nombre: `${e.name || e.nombre || ''} ${e.lastName || e.apellido || ''}`.trim(),
          tipo: 'empleado',
          planillaTipo: e.planillaTipo || 'N/A',
          salario: e.salary || e.salario || 0
        })),
        ...motoristas.map(m => ({
          _id: m._id,
          nombre: `${m.name || m.nombre || ''} ${m.lastName || m.apellido || ''}`.trim(),
          tipo: 'motorista',
          planillaTipo: m.planillaTipo || 'N/A',
          salario: m.salary || m.salario || 0
        }))
      ];

      console.log('✅ Total empleados cargados:', todosEmpleados.length);
      console.log('📋 Lista completa:', todosEmpleados);

      if (todosEmpleados.length === 0) {
        console.log('⚠️ ADVERTENCIA: No se cargó ningún empleado ni motorista');
      }

      setEmpleadosDisponibles(todosEmpleados);
    } catch (error) {
      console.error('❌ Error cargando empleados:', error);
      console.error('❌ Stack:', error.stack);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los empleados: ' + error.message
      });
    }
  };

  const toggleEmpleado = (empleado) => {
    if (empleadosSeleccionados.find(e => e._id === empleado._id)) {
      setEmpleadosSeleccionados(empleadosSeleccionados.filter(e => e._id !== empleado._id));
    } else {
      setEmpleadosSeleccionados([...empleadosSeleccionados, empleado]);
    }
  };

  const handleCrearPlanilla = async () => {
    // Validaciones
    if (!fechaInicio || !fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Debes seleccionar las fechas de inicio y fin'
      });
      return;
    }

    if (!diasHabiles || diasHabiles < 20 || diasHabiles > 31) {
      Swal.fire({
        icon: 'warning',
        title: 'Días hábiles inválidos',
        text: 'Los días hábiles deben estar entre 20 y 31'
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Crear planilla vacía
      const responsePlanilla = await fetch(`${config.api.API_URL}/planillas/semanal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaInicio,
          fechaFin,
          diasHabiles: parseInt(diasHabiles)
        })
      });

      const dataPlanilla = await responsePlanilla.json();

      if (!dataPlanilla.success) {
        throw new Error(dataPlanilla.message);
      }

      const planillaId = dataPlanilla.data._id;

      // 2. Agregar empleados seleccionados uno por uno
      if (empleadosSeleccionados.length > 0) {
        for (const empleado of empleadosSeleccionados) {
          await fetch(`${config.api.API_URL}/planillas/semanal/${planillaId}/empleado`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              empleadoId: empleado._id
            })
          });
        }
      }

      Swal.fire({
        icon: 'success',
        title: '¡Planilla Creada!',
        text: `Se agregaron ${empleadosSeleccionados.length} empleados`,
        timer: 2000,
        showConfirmButton: false
      });

      // Redirigir a la planilla creada
      navigate(`/planilla/semanal/${planillaId}`);

    } catch (error) {
      console.error('Error creando planilla:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo crear la planilla'
      });
    } finally {
      setLoading(false);
    }
  };

  const empleadosFiltrados = empleadosDisponibles.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.planillaTipo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/planilla')}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Planilla Semanal</h1>
              <p className="text-gray-600 mt-1">Configura el período y selecciona empleados</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CONFIGURACIÓN */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Calendar className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Configuración del Período</h2>
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Fecha de Inicio (Lunes)
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors font-semibold"
              />
              <p className="text-xs text-gray-500 mt-1">
                Debe ser un día lunes
              </p>
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Fecha de Fin (Sábado)
              </label>
              <input
                type="date"
                value={fechaFin}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-semibold text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se calcula automáticamente (5 días después del inicio)
              </p>
            </div>

            {/* Días Hábiles */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Días Hábiles del Mes
              </label>
              <input
                type="number"
                min="20"
                max="31"
                value={diasHabiles}
                onChange={(e) => setDiasHabiles(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors font-semibold"
              />
              <p className="text-xs text-gray-500 mt-1">
                Entre 20 y 31 días (para calcular la base diaria)
              </p>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>La planilla se crea de lunes a sábado</li>
                    <li>Base diaria = Salario Mensual / Días Hábiles</li>
                    <li>Puedes agregar más empleados después</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* SELECCIÓN DE EMPLEADOS */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Users className="text-emerald-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Empleados</h2>
              </div>
              <div className="px-4 py-2 bg-emerald-100 rounded-xl">
                <span className="font-bold text-emerald-700">
                  {empleadosSeleccionados.length} seleccionados
                </span>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Lista de empleados */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {empleadosFiltrados.map((empleado) => {
                const estaSeleccionado = empleadosSeleccionados.find(e => e._id === empleado._id);
                
                return (
                  <div
                    key={empleado._id}
                    onClick={() => toggleEmpleado(empleado)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      estaSeleccionado
                        ? 'bg-emerald-50 border-emerald-300 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{empleado.nombre}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                            empleado.planillaTipo === 'Semanal'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {empleado.planillaTipo}
                          </span>
                          <span className="text-xs text-gray-500">
                            {empleado.tipo === 'motorista' ? '🚗 Motorista' : '👤 Empleado'}
                          </span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        estaSeleccionado
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-gray-300'
                      }`}>
                        {estaSeleccionado && <CheckCircle className="text-white" size={16} />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {empleadosFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500 font-medium">No se encontraron empleados</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/planilla')}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all"
            >
              Cancelar
            </button>

            <button
              onClick={handleCrearPlanilla}
              disabled={loading || !fechaInicio || !fechaFin}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
                loading || !fechaInicio || !fechaFin
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando...</span>
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

      </div>
    </div>
  );
}