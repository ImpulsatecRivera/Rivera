import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, User, ChevronDown, ArrowLeft, ArrowRight, Plus, MoreHorizontal, Eye, EyeOff } from 'lucide-react';

// Mock data y hook simulado para que funcione el ejemplo
const mockMotoristas = [
  {
    _id: '1',
    name: 'Yanira',
    lastName: 'Rivera',
    email: 'yanira.rivera@rivera.com',
    id: '12345678-9',
    birthDate: '2025-02-10',
    phone: '5678',
    address: 'Santa Elena',
    circulationCard: 'ABC123-DEF'
  },
  {
    _id: '2',
    name: 'Kendrick',
    lastName: 'Lopez',
    email: 'kendrick.lopez1@rivera.com',
    id: '12349876-5',
    birthDate: '2025-06-16',
    phone: '7859-6723',
    address: 'La Union',
    circulationCard: 'DEF456-GHI'
  },
  {
    _id: '3',
    name: 'brayan',
    lastName: 'granados',
    email: 'brayan.granados@rivera.com',
    id: '18273016-9',
    birthDate: '2004-05-12',
    phone: '1234-5678',
    address: 'calle ruben dario',
    circulationCard: 'GHI789-JKL'
  },
  {
    _id: '4',
    name: 'mrf',
    lastName: 'sdd',
    email: 'mrf.sdd@empresa.com',
    id: '07659231-8',
    birthDate: '2007-06-24',
    phone: '41',
    address: 'Delgadito',
    circulationCard: 'JKL012-MNO'
  },
  {
    _id: '5',
    name: 'Brayan',
    lastName: 'Miranda',
    email: 'brayan.miranda@rivera.com',
    id: '19872912-7',
    birthDate: '2025-07-10',
    phone: '5217-8991',
    address: 'Hola',
    circulationCard: 'MNO345-PQR'
  },
  {
    _id: '6',
    name: 'wili',
    lastName: 'Miranda',
    email: 'wili.miranda@rivera.com',
    id: '22032132-0',
    birthDate: '2007-07-19',
    phone: '5217-8991',
    address: 'Hola',
    circulationCard: 'PQR678-STU'
  }
];

// Hook simulado
const useMotoristaManagement = () => {
  const [motoristas, setMotoristas] = useState(mockMotoristas);
  const [selectedMotorista, setSelectedMotorista] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading] = useState(false);
  const [error] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [successType, setSuccessType] = useState('');

  const filterMotoristas = motoristas.filter(motorista =>
    motorista.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    motorista.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    motorista.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    motorista.id.includes(searchTerm)
  );

  const handleContinue = () => {
    // Esta función debe navegar al formulario de agregar motorista en tu repositorio
    // Reemplaza esto con tu lógica de navegación (React Router, Next.js Router, etc.)
    console.log('Navegando al formulario de agregar motorista...');
    // Ejemplo con React Router:
    // navigate('/agregar-motorista');
    // Ejemplo con Next.js:
    // router.push('/agregar-motorista');
    // Ejemplo con redirección simple:
    // window.location.href = '/agregar-motorista';
  };

  const handleOptionsClick = () => {
    setShowAlert(true);
  };

  const handleEdit = () => {
    setShowAlert(false);
    setShowEditAlert(true);
  };

  const handleDelete = () => {
    setShowAlert(false);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    setShowConfirmDelete(false);
    setSuccessType('delete');
    setShowSuccessAlert(true);
    setSelectedMotorista(null);
    setShowDetailView(false);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const handleSaveEdit = (formData) => {
    setShowEditAlert(false);
    setSuccessType('edit');
    setShowSuccessAlert(true);
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  const closeSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  const closeEditAlert = () => {
    setShowEditAlert(false);
  };

  const selectMotorista = (motorista) => {
    setSelectedMotorista(motorista);
    setShowDetailView(true);
  };

  const closeDetailView = () => {
    setShowDetailView(false);
    setSelectedMotorista(null);
  };

  const handleRefresh = () => {
    console.log('Refresh data');
  };

  const isLicenseValid = (motorista) => {
    return Math.random() > 0.5; // Simulación aleatoria
  };

  return {
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
  };
};

// Sweet Alert Component
const SweetAlert = ({ isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white rounded-lg p-4 sm:p-6 lg:p-8 xl:p-10 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl w-full mx-4 shadow-xl relative transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 text-gray-400 hover:text-gray-600 text-lg sm:text-xl lg:text-2xl font-bold transition-colors duration-200 hover:scale-110 transform"
        >
          ×
        </button>
        
        <div className="text-center">
          <div 
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 bg-gray-200 rounded-full mx-auto mb-3 sm:mb-4 lg:mb-6 flex items-center justify-center transition-all duration-300 hover:bg-gray-300"
            style={{
              animation: isOpen ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
            }}
          >
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-600">?</span>
          </div>
          <h3 
            className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900 mb-2 lg:mb-4 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
            }}
          >
            ¿Deseas eliminar o actualizar un motorista?
          </h3>
          <p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 lg:mb-8 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
            }}
          >
            Elija la opción
          </p>
          <div 
            className="flex space-x-2 sm:space-x-3 lg:space-x-4"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
            }}
          >
            <button
              onClick={onDelete}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3 lg:px-6 lg:py-3 xl:px-7 xl:py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Eliminar
            </button>
            <button
              onClick={onEdit}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3 lg:px-6 lg:py-3 xl:px-7 xl:py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

// Confirmation Delete Alert Component
const ConfirmDeleteAlert = ({ isOpen, onClose, onConfirm, motoristaName }) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white rounded-lg p-4 sm:p-6 lg:p-8 xl:p-10 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl w-full mx-4 shadow-xl relative transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
        }}
      >
        <div className="text-center">
          <div 
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 bg-red-500 rounded-full mx-auto mb-3 sm:mb-4 lg:mb-6 flex items-center justify-center transition-all duration-300"
            style={{
              animation: isOpen ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
            }}
          >
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white font-bold">×</span>
          </div>
          <h3 
            className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900 mb-2 lg:mb-4 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
            }}
          >
            ¿Está seguro de que desea eliminar a este motorista?
          </h3>
          <p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 lg:mb-8 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
            }}
          >
            El motorista se eliminará con esta acción
          </p>
          <div 
            className="flex space-x-2 sm:space-x-3 lg:space-x-4"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
            }}
          >
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3 lg:px-6 lg:py-3 xl:px-7 xl:py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3 lg:px-6 lg:py-3 xl:px-7 xl:py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

// Success Alert Component
const SuccessAlert = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const getMessage = () => {
    switch (type) {
      case 'delete':
        return '¡Motorista eliminado exitosamente!';
      case 'edit':
        return '¡Motorista actualizado exitosamente!';
      default:
        return '¡Operación completada exitosamente!';
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white rounded-lg p-4 sm:p-6 lg:p-8 xl:p-10 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl w-full mx-4 shadow-xl relative transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
        }}
      >
        <div className="text-center">
          <div 
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 bg-green-500 rounded-full mx-auto mb-3 sm:mb-4 lg:mb-6 flex items-center justify-center transition-all duration-300"
            style={{
              animation: isOpen ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
            }}
          >
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white font-bold">✓</span>
          </div>
          <h3 
            className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900 mb-2 lg:mb-4 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
            }}
          >
            {getMessage()}
          </h3>
          <div 
            className="flex justify-center"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
            }}
          >
            <button
              onClick={onClose}
              className="px-6 py-2 sm:px-8 sm:py-3 md:px-10 md:py-4 lg:px-12 lg:py-5 xl:px-14 xl:py-6 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

// Add Motorista Alert Component - ELIMINADO - Usar formulario del repositorio

// Edit Motorista Alert Component
const EditMotoristaAlert = ({ isOpen, onClose, onSave, motorista }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    address: '',
    password: '',
    circulationCard: '',
    email: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (motorista && isOpen) {
      setFormData({
        name: '',
        lastName: '',
        phone: '',
        address: '',
        password: '',
        circulationCard: '',
        email: ''
      });
      setShowPassword(false);
    }
  }, [motorista, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formateo para tarjeta de circulación
    if (name === 'circulationCard') {
      formattedValue = value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    }

    // Formateo para teléfono
    if (name === 'phone') {
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
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white rounded-lg p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-6xl w-full mx-4 shadow-xl relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 xl:top-10 xl:right-10 text-gray-400 hover:text-gray-600 text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold transition-colors duration-200 hover:scale-110 transform"
        >
          ×
        </button>
        
        <div className="text-center mb-6 sm:mb-8 lg:mb-10 xl:mb-12">
          <h3 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-900 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.2s both' : 'none'
            }}
          >
            Editar Motorista
          </h3>
        </div>

        <div 
          className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12"
          style={{
            animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
          }}
        >
          {/* Primera fila: Apellido y Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            <div>
              <label className="block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-gray-700 mb-1 sm:mb-2 lg:mb-3">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 xl:px-7 xl:py-6 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-900 bg-white"
                placeholder="Martinez"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-gray-700 mb-1 sm:mb-2 lg:mb-3">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 xl:px-7 xl:py-6 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-900 bg-white"
                placeholder="Martinez"
              />
            </div>
          </div>

          {/* Segunda fila: Email y Fecha de nacimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            <div>
              <label className="block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-gray-700 mb-1 sm:mb-2 lg:mb-3">
                Email {formData.name || formData.lastName ? '(actualizándose automáticamente)' : '(actual)'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                placeholder={motorista?.email || "Email del empleado"}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 xl:px-7 xl:py-6 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-700 cursor-not-allowed"
              />
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500 mt-1">
                {formData.name || formData.lastName 
                  ? 'El email se actualiza automáticamente al cambiar nombre/apellido' 
                  : 'Email actual del empleado'
                }
              </p>
            </div>
            <div>
              <label className="block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-gray-700 mb-1 sm:mb-2 lg:mb-3">Fecha de nacimiento</label>
              <input
                type="text"
                value={motorista ? new Date(motorista.birthDate).toLocaleDateString() : ''}
                disabled
                className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 xl:px-7 xl:py-6 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                placeholder="25/6/2025"
              />
            </div>
          </div>

          {/* Tercera fila: Contraseña y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            <div>
              <label className="block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-gray-700 mb-1 sm:mb-2 lg:mb-3">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 xl:px-7 xl:py-6 pr-10 sm:pr-12 md:pr-14 lg:pr-16 xl:pr-18 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-900 bg-white"
                  placeholder="•••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 md:right-4 lg:right-5 xl:right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-gray-700 mb-1 sm:mb-2 lg:mb-3">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 xl:px-7 xl:py-6 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-900 bg-white"
                placeholder="7533-4567"
              />
            </div>
          </div>

          {/* Cuarta fila: DUI y Tarjeta de Circulación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            <div>
              <label className="block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-gray-700 mb-1 sm:mb-2 lg:mb-3">DUI</label>
              <input
                type="text"
                value={motorista ? motorista.id : ''}
                disabled
                className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 xl:px-7 xl:py-6 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                placeholder="22223366-6"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-gray-700 mb-1 sm:mb-2 lg:mb-3">Tarjeta de Circulación</label>
              <input
                type="text"
                name="circulationCard"
                value={formData.circulationCard}
                onChange={handleInputChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 xl:px-7 xl:py-6 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-900 bg-white"
                placeholder="ABC123-DEF"
                maxLength="15"
              />
            </div>
          </div>

          {/* Quinta fila: Dirección (campo completo) */}
          <div>
            <label className="block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-gray-700 mb-1 sm:mb-2 lg:mb-3">Dirección</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 xl:px-7 xl:py-6 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-900 bg-white"
              placeholder="Calle Los Almendros #24, San Salvador"
            />
          </div>
        </div>

        <div 
          className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-16 flex justify-center"
          style={{
            animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
          }}
        >
          <button
            onClick={handleSave}
            className="px-8 py-2 sm:px-10 sm:py-3 md:px-12 md:py-4 lg:px-14 lg:py-5 xl:px-16 xl:py-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 font-medium text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl"
          >
            Actualizar
          </button>
        </div>
      </div>
      
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

// Componente principal único
const MotoristaManagementInterface = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex h-screen">
        {/* Motorista List */}
        <div className={`${showDetailView ? 'flex-1' : 'w-full'} bg-white text-gray-900 flex flex-col`}>
          {/* Header - Fixed */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Empleados</h1>
              <h2 className="text-lg font-medium text-gray-800 mb-1">Listado de empleados</h2>
              <div className="text-teal-500 text-sm mb-6">Empleados registrados</div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
                <div className="flex items-center space-x-4 ml-6">
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Cargando...' : 'Actualizar'}
                  </button>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <span>Sort by: <span className="text-gray-700 font-medium">{sortBy}</span></span>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1 pr-8 text-sm focus:outline-none focus:border-teal-500"
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

            {/* Table Header - Fixed */}
            <div className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-7'} gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-500`}>
              <div>Nombres</div>
              <div>Email</div>
              <div>DUI</div>
              <div className="hidden md:block">Fecha-Nacimiento</div>
              {!showDetailView && (
                <>
                  <div className="hidden md:block">Teléfono</div>
                  <div className="hidden md:block">Dirección</div>
                  <div className="hidden md:block">Licencia</div>
                </>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-1 py-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Cargando motoristas...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4 text-sm">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : filterMotoristas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay motoristas registrados.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleContinue}
                      className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
                    >
                      Agregar primer motorista
                    </button>
                  )}
                </div>
              ) : (
                filterMotoristas.map((motorista, index) => (
                  <div
                    key={motorista._id || motorista.id || index}
                    className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-7'} gap-4 py-3 px-2 rounded-lg cursor-pointer transition-colors text-sm ${
                     selectedMotorista && (selectedMotorista._id === motorista._id || selectedMotorista.id === motorista.id) ? 'bg-teal-100' : 'hover:bg-gray-50'
                   }`}
                   onClick={() => selectMotorista(motorista)}
                 >
                   <div className="font-medium truncate">{motorista.name} {motorista.lastName}</div>
                   <div className="text-gray-600 truncate">{motorista.email}</div>
                   <div className="text-gray-600 truncate">{motorista.id}</div>
                   <div className="text-gray-600 truncate hidden md:block">
                     {motorista.birthDate ? new Date(motorista.birthDate).toLocaleDateString() : 'No disponible'}
                   </div>
                   {!showDetailView && (
                     <>
                       <div className="text-gray-600 truncate hidden md:block">{motorista.phone ? motorista.phone.toString() : 'No disponible'}</div>
                       <div className="text-gray-600 truncate hidden md:block">{motorista.address || 'No disponible'}</div>
                       <div className="truncate hidden md:block">
                         {isLicenseValid(motorista) ? (
                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                             Vigente
                           </span>
                         ) : (
                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                             Vencido
                           </span>
                         )}
                       </div>
                     </>
                   )}
                 </div>
               ))
             )}
           </div>
         </div>

         {/* Footer - Fixed */}
         <div className="p-6 pt-4 flex-shrink-0 border-t border-gray-100">
           <div className="flex items-center justify-between">
             <div className="text-sm text-gray-500">
               Showing data 1 to {Math.min(filterMotoristas.length, 8)} of 256K entries
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
                 <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>
                 <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">40</button>
               </div>
               <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                 <ArrowRight className="w-4 h-4 text-gray-500" />
               </button>
             </div>
           </div>
           
           {/* Add Motorista Button */}
           <div className="mt-4">
             <button 
               onClick={handleContinue} 
               className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-50 px-3 py-2 rounded-lg"
             >
               <Plus className="w-4 h-4" />
               <span className="font-medium text-sm">Agregar empleado</span>
             </button>
           </div>
         </div>
       </div>

       {/* Motorista Info Panel */}
       {showDetailView && selectedMotorista && (
         <div className="w-80 bg-white text-gray-900 p-6 border-l border-gray-200">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center">
               <button
                 className="p-2 hover:bg-gray-100 rounded-full mr-3"
                 onClick={closeDetailView}
               >
                 <ArrowLeft className="w-5 h-5 text-gray-600" />
               </button>
               <h2 className="text-lg font-semibold">Información del motorista</h2>
             </div>
             
             <div className="relative">
               <button
                 onClick={handleOptionsClick}
                 className="p-2 hover:bg-gray-100 rounded-full transition-colors"
               >
                 <MoreHorizontal className="w-5 h-5 text-gray-600" />
               </button>
             </div>
           </div>

           <div className="text-center mb-8">
             <div className="w-20 h-20 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
               {selectedMotorista.img ? (
                 <img
                   src={selectedMotorista.img}
                   alt={`${selectedMotorista.name} ${selectedMotorista.lastName}`}
                   className="w-full h-full object-cover rounded-full"
                   onError={(e) => {
                     e.target.style.display = 'none';
                     e.target.nextSibling.style.display = 'flex';
                   }}
                 />
               ) : null}
               <div 
                 className={`w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center ${selectedMotorista.img ? 'hidden' : 'flex'}`}
                 style={{ display: selectedMotorista.img ? 'none' : 'flex' }}
               >
                 <User className="w-8 h-8 text-white" />
               </div>
             </div>
             <h3 className="font-semibold text-lg mb-1">{selectedMotorista.name} {selectedMotorista.lastName}</h3>
             <div className="text-sm text-gray-500 mb-4">Motorista</div>
             <div className="flex justify-center space-x-3">
               <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                 <Phone className="w-4 h-4 text-gray-600" />
               </button>
               <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                 <Mail className="w-4 h-4 text-gray-600" />
               </button>
             </div>
           </div>

           <div className="space-y-6">
             <div className="flex items-center space-x-3">
               <User className="w-4 h-4 text-gray-400" />
               <span className="font-medium text-base">Información Personal</span>
             </div>

             <div className="grid grid-cols-1 gap-4">
               <div>
                 <div className="text-sm text-gray-500 mb-1">Correo electrónico</div>
                 <div className="text-sm text-gray-400 break-words">{selectedMotorista.email}</div>
               </div>
               <div>
                 <div className="text-sm text-gray-500 mb-1">DUI</div>
                 <div className="text-sm text-gray-400">{selectedMotorista.id}</div>
               </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
               <div>
                 <div className="text-sm text-gray-500 mb-1">Fecha de nacimiento</div>
                 <div className="text-sm text-gray-400">
                   {selectedMotorista.birthDate ? new Date(selectedMotorista.birthDate).toLocaleDateString() : 'No disponible'}
                 </div>
               </div>
               <div>
                 <div className="text-sm text-gray-500 mb-1">Teléfono</div>
                 <div className="text-sm text-gray-400">{selectedMotorista.phone ? selectedMotorista.phone.toString() : 'No disponible'}</div>
               </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
               <div>
                 <div className="text-sm text-gray-500 mb-1">Dirección</div>
                 <div className="text-sm text-gray-400 break-words">{selectedMotorista.address || 'No disponible'}</div>
               </div>
               <div>
                 <div className="text-sm text-gray-500 mb-1">Tarjeta de Circulación</div>
                 <div className="text-sm text-gray-400">{selectedMotorista.circulationCard || 'No disponible'}</div>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>

     {/* Modals */}
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
       motoristaName={selectedMotorista ? `${selectedMotorista.name} ${selectedMotorista.lastName}` : ''}
     />

     <SuccessAlert
       isOpen={showSuccessAlert}
       onClose={closeSuccessAlert}
       type={successType}
     />

     <EditMotoristaAlert
       isOpen={showEditAlert}
       onClose={closeEditAlert}
       onSave={handleSaveEdit}
       motorista={selectedMotorista}
     />
   </div>
 );
};

export default MotoristaManagementInterface;