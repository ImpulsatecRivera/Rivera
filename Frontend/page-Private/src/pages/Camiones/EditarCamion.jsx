import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, Truck } from 'lucide-react';

export default function TruckEditForm() {
  const [formData, setFormData] = useState({
    nombre: 'Nissan Frontier 2022 de gasolina',
    tarjetaCirculacion: '4464459',
    placa: '7134-4967',
    proveedor: 'Requerido poner valor',
    descripcion: 'vghjsvhgjsj',
    motorista: 'Cristomas'
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Datos actualizados:', formData);
    setShowSuccessModal(true);
  };

  const handleGoToMenu = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <button onClick={handleGoToMenu} className="flex items-center text-sm hover:underline focus:outline-none">
          <ChevronLeft className="w-5 h-5 mr-2" />
          <span>Volver al menú principal</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <h1 className="text-xl font-medium text-gray-800 mr-4">Editar Camión</h1>
            <Truck className="w-8 h-8 text-gray-600" />
          </div>
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Actualizar
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Nombre del camión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del camión</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm"
              placeholder="Nissan Frontier 2022 de gasolina"
            />
          </div>

          {/* Tarjeta de circulación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tarjeta de circulación</label>
            <input
              type="text"
              value={formData.tarjetaCirculacion}
              onChange={(e) => handleInputChange('tarjetaCirculacion', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm"
              placeholder="4464459"
            />
          </div>

          {/* Placa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
            <input
              type="text"
              value={formData.placa}
              onChange={(e) => handleInputChange('placa', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm"
              placeholder="7134-4967"
            />
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
            <div className="relative">
              <select 
                value={formData.proveedor}
                onChange={(e) => handleInputChange('proveedor', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm appearance-none bg-white text-gray-500"
              >
                <option>Requerido poner valor</option>
                <option>Proveedor 1</option>
                <option>Proveedor 2</option>
                <option>Proveedor 3</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm h-24 resize-none"
              placeholder="vghjsvhgjsj"
            />
          </div>

          {/* Motorista */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motorista</label>
            <div className="relative">
              <select 
                value={formData.motorista}
                onChange={(e) => handleInputChange('motorista', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm appearance-none bg-white text-gray-500"
              >
                <option>Cristomas</option>
                <option>Juan Pérez</option>
                <option>María López</option>
                <option>Carlos Ruiz</option>
                <option>Ana García</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Camión actualizado con éxito</h3>
            <p className="text-gray-600 mb-8">Camión actualizado correctamente</p>
            <button
              onClick={handleGoToMenu}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-medium w-full"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
