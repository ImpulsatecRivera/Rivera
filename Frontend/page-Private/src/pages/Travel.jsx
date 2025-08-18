// TravelDashboard.jsx - Dashboard principal con estadísticas integradas
import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useTravels } from '../components/Travels/hooks/useDataTravels'; // ✅ CORREGIDO: useDataTravels → useTravels
import { useAnimations } from '../components/UITravels/Animation';

// Components
import AnimatedBarChart from '../components/UITravels/AnimatedBarChart';
import DashboardTripsSection from '../components/UITravels/DashboardTripsSection';
import EarningsCard from '../components/UITravels/EarningsCard';
import RoutesCard from '../components/UITravels/RoutesCard';
import ActionModal from '../components/UITravels/ActionModal';
import SuccessModal from '../components/UITravels/SuccessModal';
import ConfirmationModal from '../components/UITravels/ConfirmationModal';
import DeleteModal from '../components/UITravels/DeleteModal';
import EditTripModal from '../components/FormsTravels/EditTripModal';
import ProgramTripModal from '../components/FormsTravels/ProgramTripModal';

const TravelDashboard = () => {
  const navigate = useNavigate();
  useAnimations(); // Inyecta las animaciones CSS

  const {
    // Estados
    animatedBars,
    animatedProgress,
    showModal,
    selectedTrip,
    isClosing,
    showEditModal,
    isEditClosing,
    showConfirmEditModal,
    isConfirmEditClosing,
    showSuccessModal,
    isSuccessClosing,
    showDeleteModal,
    isDeleteClosing,
    showDeleteSuccessModal,
    isDeleteSuccessClosing,
    showProgramModal,
    isProgramClosing,
    showProgramSuccessModal,
    isProgramSuccessClosing,
    editForm,
    programForm,
    
    // Datos (ahora solo de la API)
    scheduledTrips,
    earningsData,
    barHeights,
    loading,
    error,
    stats,
    isRefreshing, // ✅ AGREGAR isRefreshing del hook corregido
    
    // Funciones (mantener las originales para compatibilidad)
    handleTripMenuClick,
    handleCloseModal,
    handleEdit,
    handleUpdateTrip,
    handleConfirmEdit,
    handleCancelEdit,
    handleCloseSuccessModal,
    handleCloseEditModal,
    handleInputChange,
    handleDelete,
    handleConfirmDelete,
    handleCloseDeleteSuccessModal,
    handleCancelDelete,
    handleOpenProgramModal,
    handleCloseProgramModal,
    handleProgramInputChange,
    handleProgramTrip,
    handleCloseProgramSuccessModal,
    refreshTravels,
    
    // ✅ FUNCIONES DIRECTAS PARA CONTEXTMENU (por si se necesitan)
    onEdit,
    onDelete
  } = useTravels();

  const handleAddTruck = () => navigate('/viajes/maps');

  // 🆕 DATOS PARA EL GRÁFICO BASADOS EN LA API REAL
  const chartData = React.useMemo(() => {
    if (!scheduledTrips || scheduledTrips.length === 0) {
      return Array(14).fill(0);
    }

    // Generar datos del gráfico basados en los viajes reales
    const dataPoints = [];
    const baseHeight = 40;
    
    for (let i = 0; i < 14; i++) {
      // Calcular altura basada en los datos reales
      const viajesParaEsteIndice = scheduledTrips.filter((_, index) => index % 14 === i);
      const altura = baseHeight + (viajesParaEsteIndice.length * 20);
      dataPoints.push(Math.min(altura, 140)); // Máximo 140px
    }
    
    return dataPoints;
  }, [scheduledTrips]);

  return (
    <div className="flex h-screen bg-[#34353A] overflow-hidden">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl p-8 h-full overflow-hidden">
          <div className="grid grid-cols-3 gap-8 h-full">
            
            {/* Left Column - Trips Chart and List */}
            <div className="col-span-2 bg-gray-50 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-8 h-full flex flex-col">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Viajes</h2>
                  <p className="text-gray-500 text-sm">
                    {loading ? 'Cargando datos...' : 
                     error ? 'Error en los datos' : 
                     isRefreshing ? 'Actualizando datos...' : // ✅ AGREGAR estado de refreshing
                     `${stats.total} viajes totales - ${stats.en_curso} en curso`}
                  </p>
                </div>
                
                {/* Animated Bar Chart con datos reales */}
                <AnimatedBarChart 
                  animatedBars={animatedBars} 
                  barHeights={chartData} // Usar datos reales
                />
                
                {/* Sección de viajes con estadísticas integradas */}
                <div className="flex-1 overflow-auto">
                  <DashboardTripsSection />
                </div>
                
                {/* Botón Programar Viaje */}
                <div className="mt-4 px-8">
                  <button 
                    onClick={handleOpenProgramModal}
                    disabled={loading || isRefreshing} // ✅ DESHABILITAR también durante refresh
                    className="w-full p-4 text-gray-900 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-start disabled:opacity-50"
                  >
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3">
                      <Plus size={14} className="text-white" />
                    </div>
                    <span className="font-medium">
                      {loading ? 'Cargando...' : 
                       isRefreshing ? 'Actualizando...' : 
                       'Programar un viaje'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Column - Earnings and Stats */}
            <div className="space-y-6 h-full flex flex-col">
              {/* Earnings Card */}
              <EarningsCard earningsData={earningsData} />
              
              {/* Routes Card con datos reales */}
              <RoutesCard onAddTruck={handleAddTruck} />
              
              {/* 🆕 Información de estado de la conexión MEJORADA */}
              <div className="mt-auto p-4 bg-gray-50 rounded-xl">
                <div className="text-xs text-gray-500">
                  {loading && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                      Conectando a Rivera Transport...
                    </div>
                  )}
                  {isRefreshing && !loading && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                      Actualizando datos...
                    </div>
                  )}
                  {error && !loading && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Error de conexión - 
                      <button 
                        onClick={refreshTravels}
                        className="ml-1 text-blue-500 hover:text-blue-600 underline"
                      >
                        Reintentar
                      </button>
                    </div>
                  )}
                  {!loading && !error && !isRefreshing && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Conectado - {stats.total} viajes
                      </div>
                      <button
                        onClick={refreshTravels}
                        className="text-xs text-blue-500 hover:text-blue-600"
                        title="Actualizar datos"
                      >
                        🔄
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modales */}
        <ActionModal
         show={showModal}
         isClosing={isClosing}
         onClose={handleCloseModal}
         onEdit={handleEdit}
         onDelete={handleDelete}
         />

        <EditTripModal
          show={showEditModal}
          isClosing={isEditClosing}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateTrip}
          editForm={editForm}
          onInputChange={handleInputChange}
        />

        <ConfirmationModal
          show={showConfirmEditModal}
          isClosing={isConfirmEditClosing}
          onCancel={handleCancelEdit}
          onConfirm={handleConfirmEdit}
          title="¿Desea editar los datos?"
          message="Elija la opción"
          icon="?"
          iconColor="blue"
          cancelText="Cancelar"
          confirmText="Continuar"
        />

        <SuccessModal
          show={showSuccessModal}
          isClosing={isSuccessClosing}
          onClose={handleCloseSuccessModal}
          title="Viaje actualizado con éxito"
          message="Los cambios se han guardado correctamente"
        />

        <DeleteModal
          show={showDeleteModal}
          isClosing={isDeleteClosing}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />

        <SuccessModal
          show={showDeleteSuccessModal}
          isClosing={isDeleteSuccessClosing}
          onClose={handleCloseDeleteSuccessModal}
          title="Viaje eliminado con éxito"
          message="El viaje ha sido eliminado correctamente del sistema" 
        />

        <ProgramTripModal
          show={showProgramModal}
          isClosing={isProgramClosing}
          onClose={handleCloseProgramModal}
          onProgram={handleProgramTrip}
          programForm={programForm}
          onInputChange={handleProgramInputChange}
        />

        <SuccessModal
          show={showProgramSuccessModal}
          isClosing={isProgramSuccessClosing}
          onClose={handleCloseProgramSuccessModal}
          title="Viaje programado con éxito"
          message="El nuevo viaje ha sido agregado correctamente."
        />
      </div>
    </div>
  );
};

export default TravelDashboard;