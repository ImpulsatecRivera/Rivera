// TravelDashboard.jsx - Componente principal refactorizado
import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useTravels } from '../components/Travels/hooks/useDataTravels';
import { useAnimations } from '../components/UITravels/Animation';

// Components
import AnimatedBarChart from '../components/UITravels/AnimatedBarChart';
import TripListItem from '../components/UITravels/TripListItem';
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
    
    // Datos
    scheduledTrips,
    earningsData,
    barHeights,
    
    // Funciones
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
    handleCloseProgramSuccessModal
  } = useTravels();

  const handleAddTruck = () => navigate('/viajes/maps');

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
                  <p className="text-gray-500 text-sm">Porcentaje de viajes</p>
                </div>
                
                {/* Animated Bar Chart */}
                <AnimatedBarChart 
                  animatedBars={animatedBars} 
                  barHeights={barHeights} 
                />
                
                {/* Scheduled Trips */}
                <div className="flex-1 overflow-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Viajes programados de este día</h3>
                  
                  <div className="space-y-3 mb-6">
                    {scheduledTrips.map((trip, index) => (
                      <TripListItem
                        key={index}
                        trip={trip}
                        index={index}
                        onMenuClick={handleTripMenuClick}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Botón Programar Viaje */}
                <div className="mt-4 px-8">
                  <button 
                    onClick={handleOpenProgramModal}
                    className="w-full p-4 text-gray-900 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-start"
                  >
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3">
                      <Plus size={14} className="text-white" />
                    </div>
                    <span className="font-medium">Programar un viaje</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Column - Earnings and Stats */}
            <div className="space-y-6 h-full flex flex-col">
              {/* Earnings Card */}
              <EarningsCard earningsData={earningsData} />
              
              {/* Routes Card */}
              <RoutesCard onAddTruck={handleAddTruck} />
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
          title="Viaje agregado con éxito"
          message="Viaje agregado correctamente"
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
          message="Viaje eliminado correctamente"
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
          title="Viaje agregado con éxito"
          message="Viaje agregado correctamente."
        />
      </div>
    </div>
  );
};

export default TravelDashboard;