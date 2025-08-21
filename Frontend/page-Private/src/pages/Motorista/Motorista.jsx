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
      <div className="space-y-2 pt-2 sm:pt-4">
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
    <div className="min-h-screen motorista-container" style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b30 100%)'}}>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] gap-3 md:gap-6">
          
          {/* Panel Principal */}
          <div className={`${showDetailView ? 'lg:flex-1' : 'w-full'} bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden motorista-main-panel`}>
            
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-100">
              <MotoristaHeader
                filterMotoristas={filterMotoristas}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortBy={sortBy}
                setSortBy={setSortBy}
                handleContinue={handleContinue}
              />
            </div>

            {/* Table Header */}
            <div className="flex-shrink-0 border-b border-gray-50">
              <TableHeader showDetailView={showDetailView} />
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto motorista-scroll">
              <div className="p-3 sm:p-4 md:p-6 lg:p-8 pt-0">
                {renderTableContent()}
              </div>
            </div>

            {/* Footer with Pagination */}
            {!loading && !error && filterMotoristas.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  filterMotoristas={filterMotoristas}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </div>

          {/* Panel de Detalles - Desktop */}
          {showDetailView && selectedMotorista && (
            <div className="hidden lg:block lg:w-96 xl:w-[400px] 2xl:w-[450px]">
              <DetailPanel
                selectedMotorista={selectedMotorista}
                closeDetailView={closeDetailView}
                handleOptionsClick={handleOptionsClick}
                isLicenseValid={isLicenseValid}
              />
            </div>
          )}

          {/* Panel de Detalles - Mobile/Tablet (Modal overlay) */}
          {showDetailView && selectedMotorista && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm motorista-modal-overlay">
              <div className="h-full flex items-end sm:items-center justify-center p-2 sm:p-4">
                <div className="w-full sm:w-96 sm:max-w-lg h-full sm:h-auto sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
                  <DetailPanel
                    selectedMotorista={selectedMotorista}
                    closeDetailView={closeDetailView}
                    handleOptionsClick={handleOptionsClick}
                    isLicenseValid={isLicenseValid}
                  />
                </div>
              </div>
            </div>
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

      {/* Estilos responsive */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Scroll personalizado para la tabla */
          .motorista-scroll {
            scrollbar-width: thin;
            scrollbar-color: #5F8EAD #F1F5F9;
          }
          
          .motorista-scroll::-webkit-scrollbar {
            width: 8px;
          }
          
          .motorista-scroll::-webkit-scrollbar-track {
            background: #F1F5F9;
            border-radius: 4px;
          }
          
          .motorista-scroll::-webkit-scrollbar-thumb {
            background: #5F8EAD;
            border-radius: 4px;
            transition: background 0.2s ease;
          }
          
          .motorista-scroll::-webkit-scrollbar-thumb:hover {
            background: #4A7396;
          }

          /* Optimizaciones para móviles muy pequeños */
          @media (max-width: 375px) {
            .motorista-container .container {
              padding-left: 0.5rem !important;
              padding-right: 0.5rem !important;
            }
            
            .motorista-main-panel {
              border-radius: 0.75rem !important;
            }
          }

          /* Tablets en modo portrait */
          @media (min-width: 640px) and (max-width: 1023px) {
            .motorista-modal-overlay .bg-white {
              margin: 1rem;
              height: calc(100vh - 2rem);
              border-radius: 1rem !important;
            }
          }

          /* Móviles en modo landscape */
          @media (max-height: 500px) and (orientation: landscape) {
            .motorista-container {
              padding-top: 0.5rem !important;
              padding-bottom: 0.5rem !important;
            }
            
            .motorista-modal-overlay .bg-white {
              height: 95vh !important;
              margin: 0.5rem;
            }
          }

          /* Animaciones para el modal móvil */
          .motorista-modal-overlay {
            animation: fadeIn 0.2s ease-out;
          }
          
          .motorista-modal-overlay .bg-white {
            animation: slideUp 0.3s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              transform: translateY(100%);
              opacity: 0;
            }
            to { 
              transform: translateY(0);
              opacity: 1;
            }
          }

          /* Responsive para contenido de tabla */
          @media (max-width: 640px) {
            .motorista-scroll {
              -webkit-overflow-scrolling: touch;
            }
          }

          /* Optimizaciones de rendimiento */
          .motorista-container {
            contain: layout style paint;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
          
          .motorista-main-panel {
            contain: layout style;
          }

          /* Accesibilidad */
          @media (prefers-reduced-motion: reduce) {
            .motorista-modal-overlay,
            .motorista-modal-overlay .bg-white {
              animation: none !important;
            }
            
            .motorista-scroll::-webkit-scrollbar-thumb {
              transition: none !important;
            }
          }

          /* Mejoras para pantallas grandes */
          @media (min-width: 1536px) {
            .motorista-main-panel {
              border-radius: 1.5rem !important;
            }
          }

          /* Fix para evitar scroll horizontal en móviles */
          @media (max-width: 640px) {
            .motorista-container {
              overflow-x: hidden;
            }
          }

          /* Color personalizado para motoristas en scroll */
          @media (prefers-color-scheme: dark) {
            .motorista-scroll::-webkit-scrollbar-track {
              background: #2D3748;
            }
            
            .motorista-scroll::-webkit-scrollbar-thumb {
              background: #5F8EAD;
            }
            
            .motorista-scroll::-webkit-scrollbar-thumb:hover {
              background: #4A7396;
            }
          }
        `
      }} />
    </div>
  );
};

export default Motorista;