import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Plus, AlertCircle
} from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';
import { useAuth } from '../../Context/authContext';
import { api } from '../../Context/authContext';
import { getDayInSalvadorTimeZone, dateStringToSalvadorDate } from '../../utils/timezoneUtils';


export default function PlanillaSemanalNueva() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && user && user.userType !== 'Administrador') {
      navigate('/no-access');
    }
  }, [user, authLoading, navigate]);
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [diasHabiles, setDiasHabiles] = useState('26');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fechaInicio) {
      // Usar la función de timezone para obtener el día en zona horaria de El Salvador
      const inicio = dateStringToSalvadorDate(fechaInicio);
      const diaSemana = getDayInSalvadorTimeZone(inicio);
      
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

      // Calcular fecha fin (sábado, 5 días después)
      const fin = new Date(inicio.getTime() + (5 * 24 * 60 * 60 * 1000));
      
      const finYear = fin.getFullYear();
      const finMonth = String(fin.getMonth() + 1).padStart(2, '0');
      const finDay = String(fin.getDate()).padStart(2, '0');
      
      setFechaFin(`${finYear}-${finMonth}-${finDay}`);
    }
  }, [fechaInicio]);

  const handleCrearPlanilla = async () => {
    if (!fechaInicio || !fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Debes seleccionar las fechas'
      });
      return;
    }

    setLoading(true);

    try {
      const responsePlanilla = await api.post(
        `${config.api.API_URL}/planillas/semanal`,
        {
          fechaInicio,
          fechaFin,
          diasHabiles: Number.parseInt(diasHabiles)
        }
      );

      const dataPlanilla = responsePlanilla.data;

      if (!dataPlanilla.success) throw new Error(dataPlanilla.message);

      const planillaId = dataPlanilla.data._id;

      // Mostrar opción de cargar datos de planilla anterior
      Swal.fire({
        icon: 'success',
        title: '¡Planilla Creada!',
        text: 'Ahora puedes cargar datos de la planilla anterior',
        confirmButtonText: 'Cargar datos anteriores',
        cancelButtonText: 'Continuar manualmente',
        showCancelButton: true,
        confirmButtonColor: '#5F8EAD'
      }).then((result) => {
        if (result.isConfirmed) {
          handleCargarDatosAnteriores(planillaId);
        } else {
          navigate(`/planilla/semanal/${planillaId}`);
        }
      });

    } catch (error) {
      console.error('Error creando planilla:', error);
      const errorMessage = error.response?.data?.message || error.message || 'No se pudo crear la planilla';
      Swal.fire({
        icon: 'error',
        title: 'Error al crear planilla',
        text: errorMessage,
        confirmButtonColor: '#5F8EAD'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCargarDatosAnteriores = async (planillaId) => {
    try {
      const response = await api.post(
        `${config.api.API_URL}/planillas/semanal/${planillaId}/copiar-datos-anteriores`
      );

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Datos Cargados',
          text: 'Los datos de la planilla anterior se han cargado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });

        navigate(`/planilla/semanal/${planillaId}`);
      }
    } catch (error) {
      console.error('Error cargando datos anteriores:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar datos',
        text: error.response?.data?.message || 'No se pudo cargar los datos de la planilla anterior'
      });
    }
  };

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
              <h1 className="text-3xl font-bold text-[#34353A]">Nueva Planilla Semanal</h1>
              <p className="text-gray-600 mt-1">Configura el período para crear la planilla</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          
          {/* CONFIGURACIÓN */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm space-y-6 max-w-xl">
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