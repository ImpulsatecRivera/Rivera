import React, { useState } from 'react';
import { ArrowLeft, Upload, X, ChevronDown } from 'lucide-react';

const TruckFormScreen = ({ onNavigateBack, onSubmitSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tarjeta: '',
    placa: '',
    procedencia: '',
    descripcion: '',
    metodoEnergetico: '',
    imagen: null
  });

  const handleBackToMenu = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      window.history.back();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          imagen: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      imagen: null
    }));
    const fileInput = document.getElementById('imagen');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccessModal(true);
    
    setFormData({
      nombre: '',
      tarjeta: '',
      placa: '',
      procedencia: '',
      descripcion: '',
      metodoEnergetico: '',
      imagen: null
    });
    setImagePreview(null);
    
    const fileInput = document.getElementById('imagen');
    if (fileInput) fileInput.value = '';
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    if (onSubmitSuccess) {
      onSubmitSuccess();
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md mx-auto p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Camión agregado con éxito
        </h3>
        <p className="text-gray-600 mb-8 text-lg">
          Camión agregado correctamente
        </p>

        <button
          onClick={handleSuccessClose}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg"
        >
          Continuar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 text-white">
        <button 
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          onClick={handleBackToMenu}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm">Volver al menú principal</span>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-3c-.89 0-1.67.39-2.22 1H15V9h3.56l1.33 2H17v4z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Agregar Camión</h2>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Agregando...
                  </>
                ) : (
                  'Agregar'
                )}
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primera fila */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Nombre del número del camión"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarjeta de circulación
                </label>
                <input
                  type="text"
                  value={formData.tarjeta}
                  onChange={(e) => handleInputChange('tarjeta', e.target.value)}
                  placeholder="Tarjeta de circulación del Camión"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa
                </label>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => handleInputChange('placa', e.target.value)}
                  placeholder="Número de placa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm"
                />
              </div>

              {/* Segunda fila */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procedencia
                </label>
                <div className="relative">
                  <select
                    value={formData.procedencia}
                    onChange={(e) => handleInputChange('procedencia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors appearance-none bg-white text-sm"
                  >
                    <option value="">Selecciona los países de recopilación</option>
                    <option value="guatemala">Guatemala</option>
                    <option value="honduras">Honduras</option>
                    <option value="el-salvador">El Salvador</option>
                    <option value="nicaragua">Nicaragua</option>
                    <option value="costa-rica">Costa Rica</option>
                    <option value="panama">Panamá</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método energético
                </label>
                <div className="relative">
                  <select
                    value={formData.metodoEnergetico}
                    onChange={(e) => handleInputChange('metodoEnergetico', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors appearance-none bg-white text-sm"
                  >
                    <option value="">Método de fuente energético del camión</option>
                    <option value="gasolina">Gasolina</option>
                    <option value="diesel">Diésel</option>
                    <option value="gas">Gas Natural</option>
                    <option value="electrico">Eléctrico</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Descripción - ocupa las 3 columnas */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Descripción con breve descripción del camión"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-none text-sm"
                />
              </div>
            </div>

            {/* Upload Image Section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen del camión
              </label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-1 text-sm">Haz clic para subir una imagen</p>
                    <p className="text-xs text-gray-400">PNG, JPG hasta 10MB</p>
                    <input
                      id="imagen"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="imagen"
                      className="mt-3 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                    >
                      Seleccionar archivo
                    </label>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && <SuccessModal />}
    </div>
  );
};

export default TruckFormScreen;