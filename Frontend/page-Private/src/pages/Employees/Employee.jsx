import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmployeeManagement from '../../components/Empleados/hooks/useDataEmpleado';

// Importar componentes UI
import SweetAlert from '../../components/UIEmpleados/SweetAlert';
import ConfirmDeleteAlert from '../../components/UIEmpleados/ConfirmDeleteAlert';
import SuccessAlert from '../../components/UIEmpleados/SuccessAlert';
import Pagination from '../../components/UIEmpleados/Pagination';
import LoadingSpinner, { EmptyState } from '../../components/UIEmpleados/LoadingSpinner';

// Importar componentes específicos de empleados
import EmployeeHeader from '../../components/Empleados/EmployeeHeader';
import EmployeeTableHeader from '../../components/Empleados/EmployeeTableHeader';
import EmployeeRow from '../../components/Empleados/EmployeeRow';
import EmployeeDetailPanel from '../../components/Empleados/EmployeDetailsPanel';
import EditEmployeeModal from '../../components/Empleados/EditEmployeeModal';

const Employee = () => {
  const {
    empleados,
    selectedEmpleados,
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
    filterEmpleados,
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
    selectEmpleado,
    closeDetailView
  } = useEmployeeManagement();

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Función para ordenar empleados
  const getSortedEmployees = () => {
    let sorted = [...filterEmpleados];
    
    if (sortBy === 'Newest') {
      sorted.sort((a, b) => new Date(b.createdAt || b.birthDate) - new Date(a.createdAt || a.birthDate));
    } else if (sortBy === 'Oldest') {
      sorted.sort((a, b) => new Date(a.createdAt || a.birthDate) - new Date(b.createdAt || b.birthDate));
    }
    
    return sorted;
  };

  // Obtener empleados para la página actual
  const getCurrentPageEmployees = () => {
    const sortedEmployees = getSortedEmployees();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedEmployees.slice(startIndex, endIndex);
  };

  // Calcular número total de páginas
  const totalPages = Math.ceil(filterEmpleados.length / itemsPerPage);

  // Función para cambiar página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  // Renderizar contenido de la tabla
  const renderTableContent = () => {
    if (loading) {
      return <LoadingSpinner message="Cargando empleados..." />;
    }

    if (error) {
      return (
        <div className="text-center py-6 sm:py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
            <p className="text-red-600 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      );
    }

    if (filterEmpleados.length === 0) {
      return (
        <EmptyState 
          title="No se encontraron empleados"
          description="Intenta ajustar los filtros de búsqueda."
        />
      );
    }

    return (
      <div className="space-y-2 pt-2 sm:pt-4">
        {getCurrentPageEmployees().map((empleado, index) => (
          <EmployeeRow
            key={empleado._id || index}
            empleado={empleado}
            showDetailView={showDetailView}
            selectedEmpleados={selectedEmpleados}
            selectEmpleado={selectEmpleado}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen employee-container" style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b30 100%)'}}>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] gap-3 md:gap-6">
          
          {/* Panel Principal */}
          <div className={`${showDetailView ? 'lg:flex-1' : 'w-full'} bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden employee-main-panel`}>
            
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-100">
              <EmployeeHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filterEmpleados={filterEmpleados}
                handleContinue={handleContinue}
              />
            </div>

            {/* Table Header */}
            <div className="flex-shrink-0 border-b border-gray-50">
              <EmployeeTableHeader showDetailView={showDetailView} />
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto employee-scroll">
              <div className="p-3 sm:p-4 md:p-6 lg:p-8 pt-0">
                {renderTableContent()}
              </div>
            </div>

            {/* Footer con Paginación */}
            {filterEmpleados.length > 0 && !loading && (
              <div className="flex-shrink-0 border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  getPageNumbers={getPageNumbers}
                  itemsPerPage={itemsPerPage}
                  totalItems={filterEmpleados.length}
                />
              </div>
            )}
          </div>

          {/* Panel de Detalles - Desktop */}
          {showDetailView && selectedEmpleados && (
            <div className="hidden lg:block lg:w-96 xl:w-[400px] 2xl:w-[450px]">
              <EmployeeDetailPanel
                selectedEmpleados={selectedEmpleados}
                closeDetailView={closeDetailView}
                handleOptionsClick={handleOptionsClick}
              />
            </div>
          )}

          {/* Panel de Detalles - Mobile/Tablet (Modal overlay) */}
          {showDetailView && selectedEmpleados && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm employee-modal-overlay">
              <div className="h-full flex items-end sm:items-center justify-center p-2 sm:p-4">
                <div className="w-full sm:w-96 sm:max-w-lg h-full sm:h-auto sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
                  <EmployeeDetailPanel
                    selectedEmpleados={selectedEmpleados}
                    closeDetailView={closeDetailView}
                    handleOptionsClick={handleOptionsClick}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <SweetAlert
        isOpen={showAlert}
        onClose={closeAlert}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ConfirmDeleteAlert
        isOpen={showConfirmDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        employeeName={selectedEmpleados ? `${selectedEmpleados.name} ${selectedEmpleados.lastName}` : ''}
      />

      <SuccessAlert
        isOpen={showSuccessAlert}
        onClose={closeSuccessAlert}
        type={successType}
      />

      <EditEmployeeModal
        isOpen={showEditAlert}
        onClose={closeEditAlert}
        onSave={handleSaveEdit}
        employee={selectedEmpleados}
      />

      {/* Estilos responsive */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Scroll personalizado para la tabla */
          .employee-scroll {
            scrollbar-width: thin;
            scrollbar-color: #CBD5E1 #F1F5F9;
          }
          
          .employee-scroll::-webkit-scrollbar {
            width: 8px;
          }
          
          .employee-scroll::-webkit-scrollbar-track {
            background: #F1F5F9;
            border-radius: 4px;
          }
          
          .employee-scroll::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 4px;
            transition: background 0.2s ease;
          }
          
          .employee-scroll::-webkit-scrollbar-thumb:hover {
            background: #94A3B8;
          }

          /* Optimizaciones para móviles muy pequeños */
          @media (max-width: 375px) {
            .employee-container .container {
              padding-left: 0.5rem !important;
              padding-right: 0.5rem !important;
            }
            
            .employee-main-panel {
              border-radius: 0.75rem !important;
            }
          }

          /* Tablets en modo portrait */
          @media (min-width: 640px) and (max-width: 1023px) {
            .employee-modal-overlay .bg-white {
              margin: 1rem;
              height: calc(100vh - 2rem);
              border-radius: 1rem !important;
            }
          }

          /* Móviles en modo landscape */
          @media (max-height: 500px) and (orientation: landscape) {
            .employee-container {
              padding-top: 0.5rem !important;
              padding-bottom: 0.5rem !important;
            }
            
            .employee-modal-overlay .bg-white {
              height: 95vh !important;
              margin: 0.5rem;
            }
          }

          /* Animaciones para el modal móvil */
          .employee-modal-overlay {
            animation: fadeIn 0.2s ease-out;
          }
          
          .employee-modal-overlay .bg-white {
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
            .employee-scroll {
              -webkit-overflow-scrolling: touch;
            }
          }

          /* Optimizaciones de rendimiento */
          .employee-container {
            contain: layout style paint;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
          
          .employee-main-panel {
            contain: layout style;
          }

          /* Accesibilidad */
          @media (prefers-reduced-motion: reduce) {
            .employee-modal-overlay,
            .employee-modal-overlay .bg-white {
              animation: none !important;
            }
            
            .employee-scroll::-webkit-scrollbar-thumb {
              transition: none !important;
            }
          }

          /* Mejoras para pantallas grandes */
          @media (min-width: 1536px) {
            .employee-main-panel {
              border-radius: 1.5rem !important;
            }
          }

          /* Fix para evitar scroll horizontal en móviles */
          @media (max-width: 640px) {
            .employee-container {
              overflow-x: hidden;
            }
          }
        `
      }} />
    </div>
  );
};

export default Employee;