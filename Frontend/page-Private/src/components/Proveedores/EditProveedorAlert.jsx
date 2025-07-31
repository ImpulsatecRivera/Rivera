// EditProveedorAlert.jsx
import React, { useState, useEffect } from 'react';

const EditProveedorAlert = ({ isOpen, onClose, onSave, supplier }) => {
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
        empresa: supplier.companyName || '',
        email: supplier.email || '',
        repuesto: supplier.partDescription || '',
        telefono: supplier.phone || '',
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
              Editar Proveedor
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                  placeholder="Cooper Industries"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo electronico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                  placeholder="ff@gmail.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repuesto</label>
                <input
                  type="text"
                  name="repuesto"
                  value={formData.repuesto}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                  placeholder="Llanta, Amortiguador, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                  placeholder="7556-9709"
                />
              </div>
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
      </div>
    </>
  );
};

export default EditProveedorAlert;