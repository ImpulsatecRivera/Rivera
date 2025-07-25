import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, User, ChevronDown, ArrowLeft, ArrowRight, Plus, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import useEmployeeManagement from '../../components/Empleados/hooks/useDataEmpleado'; // Ajusta la ruta según tu estructura

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
            ¿Deseas eliminar o actualizar un empleado?
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
const ConfirmDeleteAlert = ({ isOpen, onClose, onConfirm, employeeName }) => {
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
            ¿Está seguro de que desea eliminar a este empleado?
          </h3>
          <p 
            className="text-gray-600 mb-6 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
            }}
          >
            El empleado se eliminará con esta acción
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
            {isEdit ? 'Empleado actualizado con éxito' : 'Empleado eliminado con éxito'}
          </h3>
          <p 
            className="text-gray-600 mb-6 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
            }}
          >
            {isEdit ? 'Empleado actualizado correctamente' : 'Empleado eliminado correctamente'}
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

// Edit Employee Alert Component
// Edit Employee Alert Component con subida de imágenes
// Edit Employee Alert Component con subida de imágenes
// Edit Employee Alert Component adaptado para tu backend
// Edit Employee Alert Component con generación automática de email
// Edit Employee Alert Component con generación automática de email
const EditEmployeeAlert = ({ isOpen, onClose, onSave, employee, uploading }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    address: '',
    password: '',
    img: null, // Para archivos
    email: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Función para generar email automáticamente
  const generateEmail = (name, lastName) => {
    // Si alguno está vacío, usar cadena vacía para esa parte
    const cleanName = (name || '').trim().toLowerCase().replace(/\s+/g, '');
    const cleanLastName = (lastName || '').trim().toLowerCase().replace(/\s+/g, '');
    
    // Si ambos están vacíos, retornar vacío
    if (!cleanName && !cleanLastName) return '';
    
    // Si uno está vacío, usar solo el que tiene contenido
    if (!cleanName) return `${cleanLastName}@empresa.com`;
    if (!cleanLastName) return `${cleanName}@empresa.com`;
    
    // Si ambos tienen contenido, usar formato completo
    return `${cleanName}.${cleanLastName}@empresa.com`;
  };

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        name: '',
        lastName: '',
        phone: '',
        address: '',
        password: '',
        img: null,
        email: employee.email || '' // Mostrar email actual del empleado
      });
      setShowPassword(false);
      // Mostrar imagen actual del empleado si existe
      setImagePreview(employee.img || null);
    }
  }, [employee, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      };
      
      // Si se cambió el nombre o apellido, regenerar el email automáticamente
      if (name === 'name' || name === 'lastName') {
        // Obtener el nombre actual: si está en el form usa eso, sino usa el del empleado original
        const currentName = name === 'name' 
          ? value 
          : (prev.name || employee?.name || '');
        
        // Obtener el apellido actual: si está en el form usa eso, sino usa el del empleado original
        const currentLastName = name === 'lastName' 
          ? value 
          : (prev.lastName || employee?.lastName || '');
        
        // Generar email si al menos uno de los dos tiene contenido
        if (currentName.trim() || currentLastName.trim()) {
          newFormData.email = generateEmail(currentName, currentLastName);
        }
      }
      
      return newFormData;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          img: file
        }));
        
        // Crear vista previa local
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Por favor selecciona un archivo de imagen válido');
        e.target.value = '';
      }
    }
  };

  const clearImage = () => {
    setFormData(prev => ({
      ...prev,
      img: null
    }));
    setImagePreview(employee.img || null); // Volver a la imagen original
    // Limpiar el input file
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSave = () => {
    // Crear FormData para enviar al backend
    const formDataToSend = new FormData();
    
    // Agregar todos los campos de texto que tengan contenido
    if (formData.name && formData.name.trim()) {
      formDataToSend.append('name', formData.name.trim());
    }
    if (formData.lastName && formData.lastName.trim()) {
      formDataToSend.append('lastName', formData.lastName.trim());
    }
    if (formData.phone && formData.phone.trim()) {
      formDataToSend.append('phone', formData.phone.trim());
    }
    if (formData.address && formData.address.trim()) {
      formDataToSend.append('address', formData.address.trim());
    }
    if (formData.password && formData.password.trim()) {
      formDataToSend.append('password', formData.password.trim());
    }
    
    // Agregar email generado automáticamente si se modificó nombre o apellido
    if (formData.email && formData.email.trim()) {
      formDataToSend.append('email', formData.email.trim());
    }
    
    // Solo agregar imagen si se seleccionó una nueva
    if (formData.img instanceof File) {
      formDataToSend.append('img', formData.img);
    } else if (imagePreview) {
      // Si no se seleccionó una nueva imagen, enviar la imagen existente
      formDataToSend.append('img', employee.img);
    }
    
    // Llamar a onSave con FormData
    onSave(formDataToSend);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white rounded-lg p-8 max-w-3xl w-full mx-4 shadow-xl relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
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
            Editar Empleado
          </h3>
        </div>

        <div 
          className="space-y-6"
          style={{
            animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
          }}
        >
          {/* Sección de imagen */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Imagen del empleado</h4>
            
            {/* Vista previa de imagen */}
            {imagePreview && (
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Vista previa" 
                    className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
                    onError={(e) => {
                      // Fallback si la imagen no carga
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDIxVjE5QzIwIDE3LjkzOTEgMTkuNTc4NiAxNi45MjE3IDE4LjgyODQgMTYuMTcxNkMxOC4wNzgzIDE1LjQyMTQgMTcuMDYwOSAxNSAxNiAxNUg4QzYuOTM5MTMgMTUgNS45MjE3MiAxNS40MjE0IDUuMTcxNTcgMTYuMTcxNkM0LjQyMTQzIDE2LjkyMTcgNCAxNy45MzkxIDQgMTlWMjEiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTEyIDExQzE0LjIwOTEgMTEgMTYgOS4yMDkxNCAxNiA3QzE2IDQuNzkwODYgMTQuMjA5MSAzIDEyIDNDOS43OTA4NiAzIDggNC43OTA4NiA4IDdDOCA5LjIwOTE0IDkuNzkwODYgMTEgMTIgMTEiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                    }}
                  />
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Input para seleccionar imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                La imagen se subirá automáticamente a Cloudinary cuando actualices
              </p>
            </div>
          </div>

          {/* Resto de campos */}
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
                value={employee ? new Date(employee.birthDate).toLocaleDateString() : ''}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email {formData.name || formData.lastName ? '(actualizándose automáticamente)' : '(actual)'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                placeholder={employee?.email || "Email del empleado"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.name || formData.lastName 
                  ? 'El email se actualiza automáticamente al cambiar nombre/apellido' 
                  : 'Email actual del empleado'
                }
              </p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">DUI</label>
            <input
              type="text"
              value={employee ? employee.dui : ''}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base"
              placeholder="22223366-6"
            />
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
            disabled={uploading}
            className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Actualizando...' : 'Actualizar'}
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

;const EmployeeManagementInterface = () => {
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
                        <option value="Email">Correo electronico</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-500`}>
              <div>Nombres</div>
              <div>Correo electronico   </div>
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
          onClick={closeDetailView}
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
      <div className="w-20 h-20 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
        {selectedEmpleados.img ? (
          <img 
            src={selectedEmpleados.img} 
            alt={`${selectedEmpleados.name} ${selectedEmpleados.lastName}`}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback al icono si la imagen falla al cargar
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center ${selectedEmpleados.img ? 'hidden' : ''}`}
        >
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