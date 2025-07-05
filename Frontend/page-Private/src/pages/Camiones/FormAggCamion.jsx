import React, { useState } from 'react';
import { ArrowLeft, Upload, X, ChevronDown, User, Calendar } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gray-700 text-white">
        <button 
          className="p-1 hover:bg-gray-600 rounded transition-colors"
          onClick={handleBackToMenu}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm">Volver al menú principal</span>
      </div>

      {/* Form Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-3c-.89 0-1.67.39-2.22 1H15V9h3.56l1.33 2H17v4z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Agregar Camión</h2>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column - Image Upload */}
              <div className="w-full md:w-80 flex-shrink-0">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto del Camión
                    </label>
                    
                    {!imagePreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors h-64">
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-3c-.89 0-1.67.39-2.22 1H15V9h3.56l1.33 2H17v4z"/>
                            </svg>
                          </div>
                          <p className="text-gray-600 mb-1 text-sm font-medium">Foto del camión</p>
                          <p className="text-xs text-gray-400 mb-4">Arrastra o haz clic para subir</p>
                          <input
                            id="imagen"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="imagen"
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer text-sm flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Seleccionar foto
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-64">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg border border-gray-300"
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

                  {/* Requirements */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      <span className="text-sm font-medium text-blue-800">Requisitos:</span>
                    </div>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• JPG, PNG, GIF</li>
                      <li>• Máximo: 5MB</li>
                      <li>• Recomendado: 400x400px</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="flex-1 w-full">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors appearance-none bg-white text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors appearance-none bg-white text-sm"
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

                  {/* Descripción */}
                  <div className="md:row-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      placeholder="Descripción con breve descripción del camión"
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-none text-sm h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && <SuccessModal />}
    </div>
  );
};

export default TruckFormScreen;
