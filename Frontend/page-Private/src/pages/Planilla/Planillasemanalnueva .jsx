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

  useEffect(() => {
    if (fechaInicio) {
      const [year, month, day] = fechaInicio.split('-');
      const inicio = new Date(year, month - 1, day);
      
      const diaSemana = inicio.getDay();
      
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
      const resEmpleados = await fetch(`${config.api.API_URL}/empleados`);
      const dataEmpleados = await resEmpleados.json();

      const resMotoristas = await fetch(`${config.api.API_URL}/motoristas`);
      const dataMotoristas = await resMotoristas.json();

      let empleados = [];
      let motoristas = [];

      if (Array.isArray(dataEmpleados)) {
        empleados = dataEmpleados;
      } else if (dataEmpleados && dataEmpleados.empleados && Array.isArray(dataEmpleados.empleados)) {
        empleados = dataEmpleados.empleados;
      } else if (dataEmpleados && dataEmpleados.data) {
        if (Array.isArray(dataEmpleados.data)) {
          empleados = dataEmpleados.data;
        } else if (typeof dataEmpleados.data === 'object') {
          const keys = Object.keys(dataEmpleados.data);
          for (const key of keys) {
            if (Array.isArray(dataEmpleados.data[key])) {
              empleados = dataEmpleados.data[key];
              break;
            }
          }
        }
      }

      if (Array.isArray(dataMotoristas)) {
        motoristas = dataMotoristas;
      } else if (dataMotoristas && dataMotoristas.motoristas && Array.isArray(dataMotoristas.motoristas)) {
        motoristas = dataMotoristas.motoristas;
      } else if (dataMotoristas && dataMotoristas.data && Array.isArray(dataMotoristas.data)) {
        motoristas = dataMotoristas.data;
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

      setEmpleadosDisponibles(todosEmpleados);
    } catch (error) {
      console.error('❌ Error cargando empleados:', error);
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
              onClick={() => navigate('/planillas')}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#34353A]">Nueva Planilla Semanal</h1>
              <p className="text-gray-600 mt-1">Configura el período y selecciona empleados</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CONFIGURACIÓN */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#5F8EAD] bg-opacity-20 rounded-xl">
                <Calendar className="text-[#5F8EAD]" size={24} />
              </div>
              <h2 className="text-xl font-bold text-[#34353A]">Configuración del Período</h2>
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-bold text-[#34353A] mb-2">
                Fecha de Inicio (Lunes)
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#5F8EAD] focus:outline-none transition-colors font-semibold"
              />
              <p className="text-xs text-gray-500 mt-1">
                Debe ser un día lunes
              </p>
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-bold text-[#34353A] mb-2">
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
              <label className="block text-sm font-bold text-[#34353A] mb-2">
                Días Hábiles del Mes
              </label>
              <input
                type="number"
                min="20"
                max="31"
                value={diasHabiles}
                onChange={(e) => setDiasHabiles(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#5F8EAD] focus:outline-none transition-colors font-semibold"
              />
              <p className="text-xs text-gray-500 mt-1">
                Entre 20 y 31 días (para calcular la base diaria)
              </p>
            </div>

            {/* Info Card */}
            <div className="bg-[#5F8EAD] bg-opacity-10 border-2 border-[#5F8EAD] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-[#5F8EAD] flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-[#34353A]">
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
                <div className="p-3 bg-[#5D9646] bg-opacity-20 rounded-xl">
                  <Users className="text-[#5D9646]" size={24} />
                </div>
                <h2 className="text-xl font-bold text-[#34353A]">Empleados</h2>
              </div>
              <div className="px-4 py-2 bg-[#5D9646] bg-opacity-20 rounded-xl">
                <span className="font-bold text-[#5D9646]">
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
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#5F8EAD] focus:outline-none transition-colors"
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
                        ? 'bg-[#5D9646] bg-opacity-10 border-[#5D9646] shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:border-[#5D9646] hover:bg-[#5D9646] hover:bg-opacity-5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-[#34353A]">{empleado.nombre}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                            empleado.planillaTipo === 'Semanal'
                              ? 'bg-[#5D9646] bg-opacity-20 text-[#5D9646]'
                              : 'bg-[#5F8EAD] bg-opacity-20 text-[#5F8EAD]'
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
                          ? 'bg-[#5D9646] border-[#5D9646]'
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
              onClick={() => navigate('/planillas')}
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
                  : 'bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white hover:opacity-90 hover:shadow-xl'
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