import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

// Componentes UI genéricos
import LoadingState from '../../components/UIMotoristas/LoadingState';
import EmptyState from '../../components/UIMotoristas/EmptyState';
import ErrorState from '../../components/UIMotoristas/ErrorState';
import SweetAlert from '../../components/UIMotoristas/SweetAlert';
import ConfirmDeleteAlert from '../../components/UIMotoristas/ConfirmDeleteAlert';
import SuccessAlert from '../../components/UIMotoristas/SuccesAlert';

// Componentes específicos de Motoristas
import MotoristaHeader from '../../components/Motorista/MotoristaHeader';
import TableHeader from '../../components/Motorista/TableHeader';
import MotoristaRow from '../../components/Motorista/MotoristaRow';
import Pagination from '../../components/Motorista/Pagination';
import DetailPanel from '../../components/Motorista/DetailsPanel';
import EditMotoristaAlert from '../../components/Motorista/EditMotoristaAlert';

// Hook de Motorista
import useMotoristaManagement from '../../components/Motorista/hooks/useDataMotorista';

const Motorista = () => {
  const {
    motoristas,
    selectedMotorista,
    showDetailView,
    loading,
    error,
    searchTerm,
    sortBy,
    setSearchTerm,
    setSortBy,
    showAlert,
    showConfirmDelete,
    showSuccessAlert,
    showEditAlert,
    successType,
    filterMotoristas,
    handleContinue,
    handleOptionsClick,
    handleEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    handleSaveEdit,
    closeAlert,
    closeSuccessAlert,
    closeEditAlert,
    selectMotorista,
    closeDetailView,
    handleRefresh,
    isLicenseValid
  } = useMotoristaManagement();

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Función para ordenar motoristas
  const getSortedMotoristas = () => {
    let sorted = [...filterMotoristas];
    
    if (sortBy === 'Newest') {
      sorted.sort((a, b) => new Date(b.createdAt || b.birthDate) - new Date(a.createdAt || a.birthDate));
    } else if (sortBy === 'Oldest') {
      sorted.sort((a, b) => new Date(a.createdAt || a.birthDate) - new Date(b.createdAt || b.birthDate));
    }
    
    return sorted;
  };

  // Obtener motoristas para la página actual
  const getCurrentPageMotoristas = () => {
    const sortedMotoristas = getSortedMotoristas();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedMotoristas.slice(startIndex, endIndex);
  };

  // Calcular número total de páginas
  const totalPages = Math.ceil(filterMotoristas.length / itemsPerPage);

  // Función para cambiar página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  // Función para renderizar el contenido de la tabla
  const renderTableContent = () => {
    if (loading) {
      return (
        <LoadingState 
          message="Cargando motoristas..."
          color="#5F8EAD"
        />
      );
    }

    if (error) {
      return (
        <ErrorState
          error={error}
          onRetry={handleRefresh}
          retryText="Intentar de Nuevo"
          primaryColor="#5F8EAD"
        />
      );
    }

    if (filterMotoristas.length === 0) {
      return (
        <EmptyState
          icon={User}
          title={searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay motoristas registrados.'}
          description={searchTerm ? 'Intenta ajustar los filtros de búsqueda.' : 'Comienza agregando tu primer motorista.'}
          searchTerm={searchTerm}
          actionButton="Agregar Primer Motorista"
          onAction={handleContinue}
        />
      );
    }

    return (
      <div className="space-y-2 pt-4">
        {getCurrentPageMotoristas().map((motorista, index) => (
          <MotoristaRow
            key={motorista._id || motorista.id || index}
            motorista={motorista}
            index={index}
            showDetailView={showDetailView}
            selectedMotorista={selectedMotorista}
            selectMotorista={selectMotorista}
            isLicenseValid={isLicenseValid}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b30 100%)'}}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Panel Principal */}
          <div className={`${showDetailView ? 'flex-1' : 'w-full'} bg-white rounded-2xl shadow-2xl ${showDetailView ? 'mr-6' : ''} flex flex-col overflow-hidden`}>
            
            {/* Header */}
            <MotoristaHeader
              filterMotoristas={filterMotoristas}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              handleContinue={handleContinue}
            />

            {/* Table Header */}
            <TableHeader showDetailView={showDetailView} />

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 pt-0">
                {renderTableContent()}
              </div>
            </div>

            {/* Footer with Pagination */}
            {!loading && !error && filterMotoristas.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                filterMotoristas={filterMotoristas}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>

          {/* Panel de Detalles */}
          {showDetailView && selectedMotorista && (
            <DetailPanel
              selectedMotorista={selectedMotorista}
              closeDetailView={closeDetailView}
              handleOptionsClick={handleOptionsClick}
              isLicenseValid={isLicenseValid}
            />
          )}
        </div>
      </div>

      {/* Modales usando componentes UI genéricos */}
      <SweetAlert
        isOpen={showAlert}
        onClose={closeAlert}
        onPrimary={handleDelete}
        onSecondary={handleEdit}
        title="¿Deseas eliminar o actualizar un motorista?"
        description="Elija la opción"
        primaryText="Eliminar"
        secondaryText="Actualizar"
        primaryColor="#dc2626"
        secondaryColor="#16a34a"
      />

      <ConfirmDeleteAlert
        isOpen={showConfirmDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={selectedMotorista ? `${selectedMotorista.name} ${selectedMotorista.lastName}` : ''}
        title="¿Está seguro de que desea eliminar a este motorista?"
        description="El motorista se eliminará con esta acción"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      <SuccessAlert
        isOpen={showSuccessAlert}
        onClose={closeSuccessAlert}
        type={successType}
        title={successType === 'edit' ? 'Motorista actualizado con éxito' : 'Motorista eliminado con éxito'}
        description={successType === 'edit' ? 'Motorista actualizado correctamente' : 'Motorista eliminado correctamente'}
        buttonText="Continuar"
      />

      {/* Modal de Edición específico para Motoristas */}
      <EditMotoristaAlert
        isOpen={showEditAlert}
        onClose={closeEditAlert}
        onSave={handleSaveEdit}
        motorista={selectedMotorista}
      />
    </div>
  );
};

export default Motorista;