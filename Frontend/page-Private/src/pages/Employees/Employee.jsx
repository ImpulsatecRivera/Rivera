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
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600">{error}</p>
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
      <div className="space-y-2 pt-4">
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
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b30 100%)'}}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Panel Principal */}
          <div className={`${showDetailView ? 'flex-1' : 'w-full'} bg-white rounded-2xl shadow-2xl ${showDetailView ? 'mr-6' : ''} flex flex-col overflow-hidden`}>
            
            {/* Header */}
            <EmployeeHeader
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filterEmpleados={filterEmpleados}
              handleContinue={handleContinue}
            />

            {/* Table Header */}
            <EmployeeTableHeader showDetailView={showDetailView} />

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 pt-0">
                {renderTableContent()}
              </div>
            </div>

            {/* Footer con Paginación */}
            {filterEmpleados.length > 0 && !loading && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                getPageNumbers={getPageNumbers}
                itemsPerPage={itemsPerPage}
                totalItems={filterEmpleados.length}
              />
            )}
          </div>

          {/* Panel de Detalles */}
          {showDetailView && selectedEmpleados && (
            <EmployeeDetailPanel
              selectedEmpleados={selectedEmpleados}
              closeDetailView={closeDetailView}
              handleOptionsClick={handleOptionsClick}
            />
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
    </div>
  );
};

export default Employee;