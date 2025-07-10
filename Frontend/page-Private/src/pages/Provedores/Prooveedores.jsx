import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, User, ChevronDown, ArrowLeft, ArrowRight, Plus, MoreHorizontal, Building2, Package, Eye, EyeOff } from 'lucide-react';

// Simulando el hook para el demo
const useSupplierManagement = () => {
  const [proveedores, setProveedores] = useState([
    {
      _id: '1',
      companyName: 'Cooper Industries',
      email: 'contact@cooper.com',
      partDescription: 'Llanta',
      phone: '7556-9709',
      direccion: 'San Salvador',
      rubro: 'Automotriz'
    },
    {
      _id: '2',
      companyName: 'AutoParts SA',
      email: 'info@autoparts.com',
      partDescription: 'Amortiguador',
      phone: '2234-5678',
      direccion: 'Santa Ana',
      rubro: 'Repuestos'
    }
  ]);
  
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [successType, setSuccessType] = useState('delete');
  
  const filterProveedores = proveedores.filter(p => 
    p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return {
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
    handleContinue: () => console.log('Agregar proveedor'),
    handleOptionsClick: () => setShowAlert(true),
    handleEdit: () => { setShowAlert(false); setShowEditAlert(true); },
    handleDelete: () => { setShowAlert(false); setShowConfirmDelete(true); },
    confirmDelete: () => { setShowConfirmDelete(false); setSuccessType('delete'); setShowSuccessAlert(true); },
    cancelDelete: () => setShowConfirmDelete(false),
    handleSaveEdit: () => { setShowEditAlert(false); setSuccessType('edit'); setShowSuccessAlert(true); },
    closeAlert: () => setShowAlert(false),
    closeSuccessAlert: () => setShowSuccessAlert(false),
    closeEditAlert: () => setShowEditAlert(false),
    selectProveedor: (proveedor) => { setSelectedProveedor(proveedor); setShowDetailView(true); },
    closeDetailView: () => setShowDetailView(false),
    refreshProveedores: () => console.log('Refresh')
  };
};

// Sweet Alert Component
const SweetAlert = ({ isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideInUp {
            from {
              transform: translateY(100px) scale(0.9);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes bounceIn {
            0% {
              transform: scale(0.3);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes fadeInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 px-4 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className={`bg-white rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-xl relative transform transition-all duration-300 ${
            isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          style={{
            animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 text-lg sm:text-xl font-bold transition-colors duration-200 hover:scale-110 transform"
          >
            ×
          </button>
          
          <div className="text-center">
            <div 
              className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center transition-all duration-300 hover:bg-gray-300"
              style={{
                animation: isOpen ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
              }}
            >
              <span className="text-xl sm:text-2xl text-gray-600">?</span>
            </div>
            <h3 
              className="text-base sm:text-lg font-semibold text-gray-900 mb-2 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
              }}
            >
              ¿Deseas eliminar o actualizar un proveedor?
            </h3>
            <p 
              className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
              }}
            >
              Elija la opción
            </p>
            <div 
              className="flex space-x-2 sm:space-x-3"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
              }}
            >
              <button
                onClick={onDelete}
                className="flex-1 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 text-sm sm:text-base"
              >
                Eliminar
              </button>
              <button
                onClick={onEdit}
                className="flex-1 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 text-sm sm:text-base"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Confirmation Delete Alert Component
const ConfirmDeleteAlert = ({ isOpen, onClose, onConfirm, supplierName }) => {
  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideInUp {
            from {
              transform: translateY(100px) scale(0.9);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes bounceIn {
            0% {
              transform: scale(0.3);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes fadeInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 px-4 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className={`bg-white rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-xl relative transform transition-all duration-300 ${
            isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          style={{
            animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
          }}
        >
          <div className="text-center">
            <div 
              className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center transition-all duration-300"
              style={{
                animation: isOpen ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
              }}
            >
              <span className="text-xl sm:text-2xl text-white font-bold">×</span>
            </div>
            <h3 
              className="text-base sm:text-lg font-semibold text-gray-900 mb-2 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
              }}
            >
              ¿Está seguro de que desea eliminar a este proveedor?
            </h3>
            <p 
              className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
              }}
            >
              El proveedor se eliminará con esta acción
            </p>
            <div 
              className="flex space-x-2 sm:space-x-3"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
              }}
            >
              <button
                onClick={onClose}
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 text-sm sm:text-base"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Success Alert Component
const SuccessAlert = ({ isOpen, onClose, type = 'delete' }) => {
  if (!isOpen) return null;

  const isEdit = type === 'edit';

  return (
    <>
      <style>
        {`
          @keyframes slideInUp {
            from {
              transform: translateY(100px) scale(0.9);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes bounceIn {
            0% {
              transform: scale(0.3);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes fadeInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 px-4 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className={`bg-white rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-xl relative transform transition-all duration-300 ${
            isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          style={{
            animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
          }}
        >
          <div className="text-center">
            <div 
              className="w-12 h-12 sm:w-16 sm:h-16 bg-green-400 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center transition-all duration-300"
              style={{
                animation: isOpen ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
              }}
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 
              className="text-base sm:text-lg font-semibold text-gray-900 mb-2 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
              }}
            >
              {isEdit ? 'Proveedor actualizado con éxito' : 'Proveedor eliminado con éxito'}
            </h3>
            <p 
              className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
              }}
            >
              {isEdit ? 'Proveedor actualizado correctamente' : 'Proveedor eliminado correctamente'}
            </p>
            <div 
              className="flex justify-center"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
              }}
            >
              <button
                onClick={onClose}
                className="px-6 sm:px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 text-sm sm:text-base"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Edit Supplier Alert Component - CORREGIDO
const EditSupplierAlert = ({ isOpen, onClose, onSave, supplier }) => {
  const [formData, setFormData] = useState({
    empresa: '',
    email: '',
    repuesto: '',
    telefono: '',
    direccion: '',
    rubro: ''
  });

  useEffect(() => {
    if (supplier && isOpen) {
      setFormData({
        empresa: supplier.companyName || '',      // ✅ CORREGIDO
        email: supplier.email || '',             
        repuesto: supplier.partDescription || '', // ✅ CORREGIDO
        telefono: supplier.phone || '',          // ✅ CORREGIDO
        direccion: supplier.direccion || '',     
        rubro: supplier.rubro || ''              
      });
    }
  }, [supplier, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formateo para teléfono
    if (name === 'telefono') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length > 4) {
        formattedValue = numbers.slice(0, 4) + '-' + numbers.slice(4, 8);
      } else {
        formattedValue = numbers;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSave = () => {
    // ✅ CORREGIDO: Mapear campos del formulario a nombres correctos de la API
    const mappedData = {
      companyName: formData.empresa,
      email: formData.email,
      partDescription: formData.repuesto,
      phone: formData.telefono,
      direccion: formData.direccion,
      rubro: formData.rubro
    };
    onSave(mappedData);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideInUp {
            from {
              transform: translateY(100px) scale(0.9);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes fadeInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 px-4 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className={`bg-white rounded-lg p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-xl lg:max-w-2xl w-full shadow-xl relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
            isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          style={{
            animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-600 text-xl sm:text-2xl font-bold transition-colors duration-200 hover:scale-110 transform"
          >
            ×
          </button>
          
          <div className="text-center mb-6 sm:mb-8">
            <h3 
              className="text-xl sm:text-2xl font-semibold text-gray-900 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.2s both' : 'none'
              }}
            >
              Editar Proveedor
            </h3>
          </div>

          <div 
            className="space-y-4 sm:space-y-6"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa} // ✅ CORREGIDO
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white"
                  placeholder="Cooper Industries"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white"
                  placeholder="ff@gmail.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repuesto</label>
                <input
                  type="text"
                  name="repuesto"
                  value={formData.repuesto} // ✅ CORREGIDO
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white"
                  placeholder="Llanta, Amortiguador, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono} // ✅ CORREGIDO
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white"
                  placeholder="7556-9709"
                />
              </div>
            </div>

            
          </div>

          <div 
            className="mt-6 sm:mt-8 flex justify-center"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
            }}
          >
            <button
              onClick={handleSave}
              className="px-8 sm:px-10 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 font-medium text-base sm:text-lg"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const SupplierManagementInterface = () => {
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

  return (
    <div className="flex flex-col lg:flex-row h-screen text-white overflow-hidden" style={{backgroundColor: '#34353A'}}>
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className={`${showDetailView ? 'flex-1' : 'w-full'} bg-white text-gray-900 ${showDetailView ? 'rounded-none lg:rounded-l-3xl' : 'rounded-none lg:rounded-3xl'} mx-2 sm:mx-4 my-2 sm:my-4 flex flex-col min-h-0`}>
          <div className="p-4 sm:p-6 lg:p-8 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Proveedores</h1>
            </div>
            
            <div className="mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Listado de proveedores</h2>
              <div className="text-teal-500 text-xs sm:text-sm mb-3 sm:mb-4">Proveedores registrados</div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                <div className="relative flex-1 w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  />
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="text-xs sm:text-sm text-gray-500">
                    Sort by: <span className="text-gray-700 font-medium">Newest</span>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 pr-6 sm:pr-8 text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                      >
                        <option value="Newest">Newest</option>
                        <option value="Oldest">Oldest</option>
                        <option value="Company">Company</option>
                        <option value="Email">Email</option>
                      </select>
                      <ChevronDown className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`hidden sm:grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-4'} gap-4 pb-3 border-b border-gray-200 text-xs sm:text-sm font-medium text-gray-500`}>
              <div>Empresa</div>
              <div>Email de la empresa</div>
              <div>Repuesto</div>
              <div>Teléfono</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-2 py-4">
              {loading ? (
                <p className="text-gray-500 text-sm sm:text-base">Cargando proveedores...</p>
              ) : error ? (
                <p className="text-red-500 text-sm sm:text-base">{error}</p>
              ) : filterProveedores.length === 0 ? (
                <p className="text-gray-500 text-sm sm:text-base">No se encontraron resultados.</p>
              ) : (
                filterProveedores.map((proveedor, index) => (
                  <div
                    key={proveedor._id || index}
                    className={`grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 py-3 px-2 rounded-lg cursor-pointer transition-colors border sm:border-none ${
                      selectedProveedor && selectedProveedor._id === proveedor._id ? 'bg-teal-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectProveedor(proveedor)}
                  >
                    <div className="font-medium truncate">
                      <span className="sm:hidden text-xs text-gray-500 block">Empresa:</span>
                      {proveedor.companyName}
                    </div>
                    <div className="text-gray-600 truncate">
                      <span className="sm:hidden text-xs text-gray-500 block">Email:</span>
                      {proveedor.email}
                    </div>
                    <div className="text-gray-600 truncate">
                      <span className="sm:hidden text-xs text-gray-500 block">Repuesto:</span>
                      {proveedor.partDescription}
                    </div>
                    <div className="text-gray-600 truncate">
                      <span className="sm:hidden text-xs text-gray-500 block">Teléfono:</span>
                      {proveedor.phone}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 pt-4 flex-shrink-0 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                Showing data 1 to 8 of 256K entries
              </div>
              <div className="flex items-center space-x-1 order-1 sm:order-2">
                <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                </button>
                <div className="flex space-x-1">
                  <button className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-500 text-white rounded-lg text-xs sm:text-sm font-medium">1</button>
                  <button className="w-6 h-6 sm:w-8 sm:h-8 hover:bg-gray-100 rounded-lg text-xs sm:text-sm text-gray-700">2</button>
                  <button className="w-6 h-6 sm:w-8 sm:h-8 hover:bg-gray-100 rounded-lg text-xs sm:text-sm text-gray-700">3</button>
                  <button className="w-6 h-6 sm:w-8 sm:h-8 hover:bg-gray-100 rounded-lg text-xs sm:text-sm text-gray-700">4</button>
                  <span className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 text-xs sm:text-sm">...</span>
                  <button className="w-6 h-6 sm:w-8 sm:h-8 hover:bg-gray-100 rounded-lg text-xs sm:text-sm text-gray-700">40</button>
                </div>
                <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <button onClick={handleContinue} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">Agregar proveedor</span>
              </button>
            </div>
          </div>
        </div>

        {showDetailView && selectedProveedor && (
          <div className="w-full lg:w-80 bg-white text-gray-900 rounded-none lg:rounded-r-3xl mx-2 sm:mx-0 mr-2 sm:mr-4 my-2 sm:my-4 p-4 sm:p-6 relative overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center">
                <button
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full mr-2 sm:mr-3"
                  onClick={closeDetailView}
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <h2 className="text-base sm:text-lg font-semibold">Información del Proveedor</h2>
              </div>
              
              <div className="relative">
                <button
                  onClick={handleOptionsClick}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-400 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-300 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">{selectedProveedor.companyName}</h3>
              <div className="flex justify-center space-x-2 sm:space-x-3">
                <button className="p-1.5 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </button>
                <button className="p-1.5 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-2">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <span className="font-medium text-sm sm:text-base">Información de la Empresa</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Email de la empresa</div>
                  <div className="text-xs sm:text-sm text-gray-400 break-words">{selectedProveedor.email}</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Teléfono</div>
                  <div className="text-xs sm:text-sm text-gray-400">{selectedProveedor.phone}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Repuesto principal</div>
                  <div className="text-xs sm:text-sm text-gray-400 flex items-center">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400" />
                    {selectedProveedor.partDescription}
                  </div>
                </div>
              </div>

              {/* Campos adicionales si existen */}
              {selectedProveedor.direccion && (
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Dirección</div>
                  <div className="text-xs sm:text-sm text-gray-400">{selectedProveedor.direccion}</div>
                </div>
              )}

              {selectedProveedor.rubro && (
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Rubro</div>
                  <div className="text-xs sm:text-sm text-gray-400">{selectedProveedor.rubro}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
        supplierName={selectedProveedor ? selectedProveedor.companyName : ''}
      />

      <SuccessAlert
        isOpen={showSuccessAlert}
        onClose={closeSuccessAlert}
        type={successType}
      />

      <EditSupplierAlert
        isOpen={showEditAlert}
        onClose={closeEditAlert}
        onSave={handleSaveEdit}
        supplier={selectedProveedor}
      />
    </div>
  );
};

export default SupplierManagementInterface;