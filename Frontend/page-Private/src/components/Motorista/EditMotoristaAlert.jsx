import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
          {/* Primera fila: Apellido y Nombre */}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                placeholder="Martinez"
              />
            </div>
          </div>

          {/* Segunda fila: Email y Fecha de nacimiento */}
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
                placeholder={motorista?.email || "Email del empleado"}
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

          {/* Tercera fila: Contraseña y Teléfono */}
          <div className="grid grid-cols-2 gap-6">
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

          {/* Cuarta fila: DUI y Tarjeta de Circulación */}
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

          {/* Quinta fila: Dirección (campo completo) */}
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

export default EditMotoristaAlert;