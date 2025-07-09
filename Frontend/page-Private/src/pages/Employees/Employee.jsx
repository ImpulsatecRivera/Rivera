import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, User, ChevronDown, ArrowLeft, ArrowRight, Plus, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import useEmployeeManagement from '../../components/Empleados/hooks/useDataEmpleado';

const EmployeeManagementInterface = () => {
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

  return (
    <div className="flex h-screen text-white" style={{ backgroundColor: '#34353A' }}>
      <div className="flex-1 flex">
        <div className={`${showDetailView ? 'flex-1' : 'w-full'} bg-white text-gray-900 ${showDetailView ? 'rounded-l-3xl' : 'rounded-3xl'} ml-4 my-4 flex flex-col`}>
          <div className="p-8 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Listado de empleados</h2>
              <div className="text-teal-500 text-sm mb-4">Empleados registrados</div>

              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <div className="text-sm text-gray-500">
                    Sort by: <span className="text-gray-700 font-medium">Newest</span>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:border-teal-500"
                      >
                        <option value="Newest">Newest</option>
                        <option value="Oldest">Oldest</option>
                        <option value="Name">Name</option>
                        <option value="Email">Email</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-500`}>
              <div>Nombres</div>
              <div>Email</div>
              <div>DUI</div>
              <div>Fecha-Nacimiento</div>
              {!showDetailView && (
                <>
                  <div>Teléfono</div>
                  <div>Dirección</div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8">
            <div className="space-y-2 py-4">
              {loading ? (
                <p className="text-gray-500">Cargando empleados...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : filterEmpleados.length === 0 ? (
                <p className="text-gray-500">No se encontraron resultados.</p>
              ) : (
                filterEmpleados.map((empleado, index) => (
                  <div
                    key={empleado._id || index}
                    className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-4 py-3 px-2 rounded-lg cursor-pointer transition-colors ${
                      selectedEmpleados && selectedEmpleados._id === empleado._id ? 'bg-teal-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectEmpleado(empleado)}
                  >
                    <div className="font-medium truncate">{empleado.name} {empleado.lastName}</div>
                    <div className="text-gray-600 truncate">{empleado.email}</div>
                    <div className="text-gray-600 truncate">{empleado.dui}</div>
                    <div className="text-gray-600 truncate">{new Date(empleado.birthDate).toLocaleDateString()}</div>
                    {!showDetailView && (
                      <>
                        <div className="text-gray-600 truncate">{empleado.phone ? empleado.phone.toString() : 'No disponible'}</div>
                        <div className="text-gray-600 truncate">{empleado.address}</div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-8 pt-4 flex-shrink-0 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing data 1 to 8 of 256K entries
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-4 h-4 text-gray-500" />
                </button>
                <div className="flex space-x-1">
                  <button className="w-8 h-8 bg-teal-500 text-white rounded-lg text-sm font-medium">1</button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">2</button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">3</button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">4</button>
                  <span className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">40</button>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="mt-4">
                <button onClick={handleContinue} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Agregar empleado</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagementInterface;
