import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Importar imagen por defecto
import Camion from "../../images/camion.png";

// Importar hooks personalizados
import useTrucksData from '../../components/Camiones/hooks/useTrucksData';
import useTruckFilters from '../../components/Camiones/hooks/useTruckFilters';
import useTruckEdit from '../../components/Camiones/hooks/useTruckEdit';

// Importar componentes UI genéricos
import LoadingState from '../../components/UICamiones/LoadingState';
import EmptyState from '../../components/UICamiones/EmptySate';
import ErrorState from '../../components/UICamiones/ErrorState';
import DeleteConfirmModal from '../../components/UICamiones/DeleteConfirmModal';
import SuccessModal from '../../components/UICamiones/SuccessModal';

// Importar componentes específicos
import TrucksHeader from '../../components/Camiones/TrucksHeader';
import FiltersSection from '../../components/Camiones/FiltersSection';
import TrucksGrid from '../../components/Camiones/TrucksGrid';
import EditTruckModal from '../../components/Camiones/EditTruckModal';

const Camiones = () => {
  const navigate = useNavigate();
  
  // Estados para modales y acciones
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTruckForDelete, setSelectedTruckForDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: 'Operación exitosa',
    description: 'Los cambios se han guardado correctamente.'
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Hook para gestión de datos de camiones
  const {
    trucks,
    loading,
    error,
    deleteTruck,
    updateTruckInState,
    refreshTrucks,
    fetchOptions,
    trucksCount,
    hasData
  } = useTrucksData();

  // Hook para filtros y búsqueda
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    filteredTrucks,
    statusCounts,
    getStatusColor,
    getDotColor,
    clearFilters,
    isEmpty,
    hasResults,
    isSearchActive,
    isFilterActive,
    filterInfo
  } = useTruckFilters(trucks);

  // Hook para edición de camiones
  const editHook = useTruckEdit(fetchOptions, updateTruckInState);

  // Handlers para navegación
  const handleAddTruck = () => {
    navigate('/Camiones/aggCamion');
  };

  const handleCardClick = (truckId) => {
    if (truckId) {
      console.log('Navegando a camión con id:', truckId);
      navigate(`/camiones/${truckId}`);
    } else {
      console.error('No se puede navegar: ID del camión no válido');
    }
  };

  // Handlers para edición
  const handleEditTruck = async (truck) => {
    const result = await editHook.openEditModal(truck);
    if (!result.success) {
      alert(`Error al abrir editor: ${result.error}`);
    }
  };

  const handleEditSuccess = (updatedTruck) => {
    console.log('Camión actualizado exitosamente:', updatedTruck);
    setSuccessMessage({
      title: 'Camión actualizado',
      description: 'Los cambios se han guardado exitosamente.'
    });
    setShowSuccessModal(true);
  };

  const handleEditSubmit = async () => {
    const result = await editHook.submitEdit();
    if (result && result.success) {
      handleEditSuccess(result.data);
    } else if (result && !result.success) {
      alert(`Error al actualizar el camión: ${result.error}`);
    }
    return result;
  };

  // Handlers para eliminación
  const handleDeleteClick = (truck) => {
    if (!truck?.id) {
      console.error('No se puede eliminar: ID del camión no válido');
      return;
    }
    setSelectedTruckForDelete(truck);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTruckForDelete?.id) {
      console.error('No hay camión seleccionado para eliminar');
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Eliminando camión:', selectedTruckForDelete.name);
      
      const result = await deleteTruck(selectedTruckForDelete.id);
      
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedTruckForDelete(null);
        setSuccessMessage({
          title: 'Camión eliminado',
          description: 'El camión ha sido eliminado exitosamente.'
        });
        setShowSuccessModal(true);
        console.log('Camión eliminado exitosamente');
      } else {
        alert(result.error || 'Error al eliminar el camión');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error inesperado al eliminar camión:', error);
      alert('Error inesperado. Inténtalo de nuevo.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedTruckForDelete(null);
  };

  // Handlers para modales de éxito
  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    setSelectedTruckForDelete(null);
    setSuccessMessage({
      title: 'Operación exitosa',
      description: 'Los cambios se han guardado correctamente.'
    });
  };

  // Handler para retry en caso de error
  const handleRetryLoad = () => {
    console.log('Reintentando cargar camiones...');
    refreshTrucks();
  };

  // Función para renderizar el contenido principal
  const renderMainContent = () => {
    // Estado de carga
    if (loading) {
      return (
        <LoadingState 
          message="Cargando flota de camiones..." 
          primaryColor="#5F8EAD"
        />
      );
    }

    // Estado de error
    if (error) {
      return (
        <ErrorState 
          icon={Truck}
          title="Error al cargar"
          description="No se pudieron cargar los camiones. Verifica tu conexión."
          onRetry={handleRetryLoad}
        />
      );
    }

    // Estado vacío
    if (isEmpty) {
      const hasActiveFilters = isSearchActive || isFilterActive;
      
      return (
        <EmptyState
          icon={Truck}
          title={hasActiveFilters ? 'Sin resultados' : 'No hay camiones'}
          description={
            hasActiveFilters 
              ? 'No se encontraron camiones con los filtros aplicados.' 
              : 'Comienza agregando tu primer camión a la flota.'
          }
          hasFilters={hasActiveFilters}
          actionButton={
            !hasActiveFilters && (
              <button
                onClick={handleAddTruck}
                className="px-6 py-3 text-white rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg shadow-md font-medium"
                style={{background: 'linear-gradient(135deg, #5D9646 0%, #4a7a37 100%)'}}
              >
                Agregar Primer Camión
              </button>
            )
          }
        />
      );
    }

    // Renderizar grid de camiones
    return (
      <TrucksGrid
        trucks={filteredTrucks}
        viewMode={viewMode}
        onEditTruck={handleEditTruck}
        onDeleteTruck={handleDeleteClick}
        onCardClick={handleCardClick}
        defaultImage={Camion}
        getStatusColor={getStatusColor}
        getDotColor={getDotColor}
      />
    );
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b30 100%)'}}>
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header con búsqueda y controles */}
          <TrucksHeader
            filteredTrucksCount={filteredTrucks.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddTruck={handleAddTruck}
            primaryColor="#5F8EAD"
          />

          {/* Sección de filtros por estado */}
          <FiltersSection
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusCounts={statusCounts}
            primaryColor="#5F8EAD"
          />

          {/* Contenido principal */}
          <div className="p-8">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      <EditTruckModal
        isOpen={editHook.showEditModal}
        loading={editHook.editLoading}
        isSubmitting={editHook.isSubmitting}
        formData={editHook.formData}
        imagePreview={editHook.imagePreview}
        currentImage={editHook.currentImage}
        proveedores={editHook.proveedores}
        motoristas={editHook.motoristas}
        onClose={editHook.closeEditModal}
        onInputChange={editHook.handleInputChange}
        onImageChange={editHook.handleImageChange}
        onSubmit={handleEditSubmit}
        onSuccess={handleEditSuccess}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
        title="¿Eliminar camión?"
        description={`¿Estás seguro de que deseas eliminar "${selectedTruckForDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loadingText="Eliminando..."
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessContinue}
        title={successMessage.title}
        description={successMessage.description}
        buttonText="Continuar"
        successColor="#10B981"
      />
    </div>
  );
};

export default Camiones;