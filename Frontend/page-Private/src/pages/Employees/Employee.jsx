import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, User, ChevronDown, ArrowLeft, ArrowRight, Plus, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

// Sweet Alert Component

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
        className={`bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl relative transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors duration-200 hover:scale-110 transform"
        >
          ×
        </button>
        
        <div className="text-center">
          <div 
            className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300 hover:bg-gray-300"
            style={{
              animation: isOpen ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
            }}
          >
            <span className="text-2xl text-gray-600">?</span>
          </div>
          <h3 
            className="text-lg font-semibold text-gray-900 mb-2 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
            }}
          >
            ¿Deseas eliminar o actualizar un motorista?
          </h3>
          <p 
            className="text-gray-600 mb-6 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
            }}
          >
            Elija la opción
          </p>
          <div 
            className="flex space-x-3"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
            }}
          >
            <button
              onClick={onDelete}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Eliminar
            </button>
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
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
        className={`bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl relative transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
        }}
      >
        <div className="text-center">
          <div 
            className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300"
            style={{
              animation: isOpen ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
            }}
          >
            <span className="text-2xl text-white font-bold">×</span>
          </div>
          <h3 
            className="text-lg font-semibold text-gray-900 mb-2 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
            }}
          >
            ¿Está seguro de que desea eliminar a este motorista?
          </h3>
          <p 
            className="text-gray-600 mb-6 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
            }}
          >
            El motorista se eliminará con esta acción
          </p>
          <div 
            className="flex space-x-3"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
            }}
          >
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
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
const SuccessAlert = ({ isOpen, onClose, type = 'delete' }) => {
  if (!isOpen) return null;

  const isEdit = type === 'edit';

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl relative transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
        }}
      >
        <div className="text-center">
          <div 
            className="w-16 h-16 bg-green-400 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300"
            style={{
              animation: isOpen ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
            }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 
            className="text-lg font-semibold text-gray-900 mb-2 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
            }}
          >
            {isEdit ? 'Motorista actualizado con éxito' : 'Motorista eliminado con éxito'}
          </h3>
          <p 
            className="text-gray-600 mb-6 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
            }}
          >
            {isEdit ? 'Motorista actualizado correctamente' : 'Motorista eliminado correctamente'}
          </p>
          <div 
            className="flex justify-center"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
            }}
          >
            <button
              onClick={onClose}
              className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Continuar
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

// Edit Motorista Alert Component
const EditEmployeeAlert = ({ isOpen, onClose, onSave, motorista }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    address: '',
    password: '',
    circulationCard: ''
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
        circulationCard: ''
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
        className={`bg-white rounded-lg p-8 max-w-2xl w-full mx-4 shadow-xl relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200 hover:scale-110 transform"
        >
          ×
        </button>
        
        <div className="text-center mb-8">
          <h3 
            className="text-2xl font-semibold text-gray-900 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.2s both' : 'none'
            }}
          >
            Editar Motorista
          </h3>
        </div>

        <div 
          className="space-y-6"
          style={{
            animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                placeholder="Carlos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
              <input
                type="text"
                value={motorista ? new Date(motorista.birthDate).toLocaleDateString() : ''}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base"
                placeholder="25/6/2025"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                placeholder="Martinez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                  placeholder="•••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={motorista ? motorista.email : ''}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base"
                placeholder="prueba1.prueba1@rivera.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                placeholder="7533-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DUI</label>
              <input
                type="text"
                value={motorista ? motorista.id : ''}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base"
                placeholder="22223366-6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarjeta de Circulación</label>
              <input
                type="text"
                name="circulationCard"
                value={formData.circulationCard}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                placeholder="ABC123-DEF"
                maxLength="15"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
              placeholder="Calle Los Almendros #24, San Salvador"
            />
          </div>
        </div>

        <div 
          className="mt-8 flex justify-center"
          style={{
            animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
          }}
        >
          <button
            onClick={handleSave}
            className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 font-medium text-lg"
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

const EmployeeManagementInterface = () => {
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmpleados, setSelectedEmpleados] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [successType, setSuccessType] = useState('delete');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/empleados');
        setEmpleados(response.data);
      } catch (error) {
        setError("Error al cargar los empleados");
      } finally {
        setLoading(false);
      }
    };
    fetchEmpleados();
  }, []);

  const filterEmpleados = empleados.filter((empleado) => 
    [empleado.name, empleado.lastName, empleado.dui, empleado.email]
    .join(' ')
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
  );

  const handleContinue = (e) => {
    e.preventDefault();
    navigate('/empleados/agregarEmployee');
  };

  const handleOptionsClick = (e) => {
    e.stopPropagation();
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

  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    try {
      await axios.delete(`http://localhost:4000/api/empleados/${selectedEmpleados._id}`);
      setEmpleados(empleados.filter(emp => emp._id !== selectedEmpleados._id));
      console.log("Eliminando empleado:", selectedEmpleados);
      setShowDetailView(false);
      setSelectedEmpleados(null);
      setSuccessType('delete');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const closeSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  const closeEditAlert = () => {
    setShowEditAlert(false);
  };

  const handleSaveEdit = async (formData) => {
    try {
      // Solo enviar los campos que han cambiado o que tienen valor
      const updatedData = {};
      
      // Solo incluir campos que no estén vacíos
      if (formData.name && formData.name.trim()) {
        updatedData.name = formData.name;
      }
      if (formData.lastName && formData.lastName.trim()) {
        updatedData.lastName = formData.lastName;
      }
      if (formData.phone && formData.phone.trim()) {
        updatedData.phone = formData.phone;
      }
      if (formData.address && formData.address.trim()) {
        updatedData.address = formData.address;
      }
      if (formData.password && formData.password.trim()) {
        updatedData.password = formData.password;
      }

      const response = await axios.put(`http://localhost:4000/api/empleados/${selectedEmpleados._id}`, updatedData);
      
      // Actualizar solo los campos que se modificaron, mantener los demás
      setEmpleados(empleados.map(emp => 
        emp._id === selectedEmpleados._id 
          ? { ...emp, ...updatedData }
          : emp
      ));
      
      // Actualizar el empleado seleccionado solo con los campos modificados
      setSelectedEmpleados({ ...selectedEmpleados, ...updatedData });
      
      console.log("Empleado actualizado:", response.data);
      
      setShowEditAlert(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  return (
    <div className="flex h-screen text-white" style={{backgroundColor: '#34353A'}}>
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
                    onClick={() => {
                      setSelectedEmpleados(empleado);
                      setShowDetailView(true);
                    }}
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
            </div>
            
            <div className="mt-4">
              <button onClick={handleContinue} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Agregar empleado</span>
              </button>
            </div>
          </div>
        </div>

        {showDetailView && selectedEmpleados && (
          <div className="w-80 bg-white text-gray-900 rounded-r-3xl mr-4 my-4 p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  className="p-2 hover:bg-gray-100 rounded-full mr-3"
                  onClick={() => {
                    setShowDetailView(false);
                    setSelectedEmpleados(null);
                  }}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold">Información del Empleado</h2>
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
              <div className="w-20 h-20 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{selectedEmpleados.name} {selectedEmpleados.lastName}</h3>
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
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Información Personal</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Correo electrónico</div>
                  <div className="text-sm text-gray-400 break-words">{selectedEmpleados.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">DUI</div>
                  <div className="text-sm text-gray-400">{selectedEmpleados.dui}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Fecha de nacimiento</div>
                  <div className="text-sm text-gray-400">{new Date(selectedEmpleados.birthDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Teléfono</div>
                  <div className="text-sm text-gray-400">{selectedEmpleados.phone ? selectedEmpleados.phone.toString() : 'No disponible'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Dirección</div>
                  <div className="text-sm text-gray-400 break-words">{selectedEmpleados.address}</div>
                </div>
              </div>
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
        employeeName={selectedEmpleados ? `${selectedEmpleados.name} ${selectedEmpleados.lastName}` : ''}
      />

      <SuccessAlert
        isOpen={showSuccessAlert}
        onClose={closeSuccessAlert}
        type={successType}
      />

      <EditEmployeeAlert
        isOpen={showEditAlert}
        onClose={closeEditAlert}
        onSave={handleSaveEdit}
        employee={selectedEmpleados}
      />
    </div>
  );
};

export default EmployeeManagementInterface;