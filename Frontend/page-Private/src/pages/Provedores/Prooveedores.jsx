import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

// Componentes UI genéricos para Proveedores
import LoadingState from '../../components/UIProveedores/LoadingState';
import EmptyState from '../../components/UIProveedores/EmptyState';
import ErrorState from '../../components/UIProveedores/ErrorState';
import SweetAlert from '../../components/UIProveedores/SweetAlert';
import ConfirmDeleteAlert from '../../components/UIProveedores/ConfirmDeleteAlert';
import SuccessAlert from '../../components/UIProveedores/SuccesAlert';

// Componentes específicos de Proveedores
import ProveedorHeader from '../../components/Proveedores/ProveedorHeader';
import ProveedorTableHeader from '../../components/Proveedores/ProveedorTableHeader';
import ProveedorRow from '../../components/Proveedores/ProveedorRow';
import ProveedorPagination from '../../components/Proveedores/ProveedorPagination';
import ProveedorDetailPanel from '../../components/Proveedores/ProveedorDetailsPanel';
import EditProveedorAlert from '../../components/Proveedores/EditProveedorAlert';

// Hook de Proveedores
import useSupplierManagement from '../../components/Proveedores/hooks/useDataProveedores';

const Proveedores = () => {
  const {
    proveedores,
    selectedProveedor,
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
    filterProveedores,
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
    selectProveedor,
    closeDetailView,
    refreshProveedores
  } = useSupplierManagement();

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Función para ordenar proveedores
  const getSortedProveedores = () => {
    let sorted = [...filterProveedores];
    
    if (sortBy === 'Newest') {
      sorted.sort((a, b) => new Date(b.createdAt || b.companyName) - new Date(a.createdAt || a.companyName));
    } else if (sortBy === 'Oldest') {
      sorted.sort((a, b) => new Date(a.createdAt || a.companyName) - new Date(b.createdAt || b.companyName));
    }
    
    return sorted;
  };

  // Obtener proveedores para la página actual
  const getCurrentPageProveedores = () => {
    const sortedProveedores = getSortedProveedores();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProveedores.slice(startIndex, endIndex);
  };

  // Calcular número total de páginas
  const totalPages = Math.ceil(filterProveedores.length / itemsPerPage);

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
          message="Cargando proveedores..."
          color="#5F8EAD"
          size="h-10 w-10"
        />
      );
    }

    if (error) {
      return (
        <ErrorState
          error={error}
          onRetry={refreshProveedores}
          retryText="Intentar de nuevo"
          primaryColor="#5F8EAD"
        />
      );
    }

    if (filterProveedores.length === 0) {
      return (
        <EmptyState
          icon={Building2}
          title={searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay proveedores registrados.'}
          description={searchTerm ? 'Intenta ajustar los filtros de búsqueda.' : 'Comienza agregando tu primer proveedor.'}
          searchTerm={searchTerm}
          actionButton="Agregar Primer Proveedor"
          onAction={handleContinue}
        />
      );
    }

    return (
      <div className="space-y-2 pt-4">
        {getCurrentPageProveedores().map((proveedor, index) => (
          <ProveedorRow
            key={proveedor._id || index}
            proveedor={proveedor}
            index={index}
            selectedProveedor={selectedProveedor}
            selectProveedor={selectProveedor}
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
            <ProveedorHeader
              filterProveedores={filterProveedores}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              handleContinue={handleContinue}
            />

            {/* Table Header */}
            <ProveedorTableHeader showDetailView={showDetailView} />

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 pt-0">
                {renderTableContent()}
              </div>
            </div>

            {/* Footer with Pagination */}
            {!loading && !error && filterProveedores.length > 0 && (
              <ProveedorPagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                filterProveedores={filterProveedores}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>

          {/* Panel de Detalles */}
          {showDetailView && selectedProveedor && (
            <ProveedorDetailPanel
              selectedProveedor={selectedProveedor}
              closeDetailView={closeDetailView}
              handleOptionsClick={handleOptionsClick}
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
        title="¿Deseas eliminar o actualizar un proveedor?"
        description="Elija la opción"
        primaryText="Eliminar"
        secondaryText="Actualizar"
        primaryColor="#dc2626"
        secondaryColor="#16a34a"
        icon="?"
      />

      <ConfirmDeleteAlert
        isOpen={showConfirmDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={selectedProveedor ? selectedProveedor.companyName : ''}
        title="¿Está seguro de que desea eliminar a este proveedor?"
        description="El proveedor se eliminará con esta acción"
        confirmText="Eliminar"
        cancelText="Cancelar"
        dangerColor="#dc2626"
        neutralColor="#6b7280"
      />

      <SuccessAlert
        isOpen={showSuccessAlert}
        onClose={closeSuccessAlert}
        type={successType}
        title={successType === 'edit' ? 'Proveedor actualizado con éxito' : 'Proveedor eliminado con éxito'}
        description={successType === 'edit' ? 'Proveedor actualizado correctamente' : 'Proveedor eliminado correctamente'}
        buttonText="Continuar"
        successColor="#16a34a"
      />

      {/* Modal de Edición específico para Proveedores */}
      <EditProveedorAlert
        isOpen={showEditAlert}
        onClose={closeEditAlert}
        onSave={handleSaveEdit}
        supplier={selectedProveedor}
      />
    </div>
  );
};

export default Proveedores;