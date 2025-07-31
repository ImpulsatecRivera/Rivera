import React, { useState } from 'react';
import { Upload, X, Image, AlertCircle, Check } from 'lucide-react';

const ImageUpload = ({
  imagePreview,
  currentImage,
  onImageChange,
  fileName,
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif']
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Validar archivo
  const validateFile = (file) => {
    if (!file) return { valid: false, error: 'No se seleccionó ningún archivo' };

    // Validar tamaño
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return { valid: false, error: `El archivo es demasiado grande. Máximo ${maxSizeMB}MB.` };
    }

    // Validar tipo
    if (!acceptedTypes.includes(file.type)) {
      const typesStr = acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ');
      return { valid: false, error: `Formato no soportado. Use: ${typesStr}` };
    }

    return { valid: true };
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  // Procesar archivo seleccionado
  const processFile = (file) => {
    if (!file || disabled) return;

    setError(null);
    setUploadStatus('processing');

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      setUploadStatus('error');
      return;
    }

    if (onImageChange) {
      onImageChange(file);
      setUploadStatus('success');
      
      // Limpiar estado de éxito después de 2 segundos
      setTimeout(() => {
        setUploadStatus(null);
      }, 2000);
    }
  };

  // Manejar drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  // Remover imagen
  const handleRemoveImage = () => {
    if (disabled) return;
    
    if (onImageChange) {
      onImageChange(null);
    }
    setError(null);
    setUploadStatus(null);
    
    // Limpiar input
    const input = document.getElementById('imageInput');
    if (input) {
      input.value = '';
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtener imagen a mostrar
  const displayImage = imagePreview || currentImage;
  const hasImage = !!displayImage;

  return (
    <div className="space-y-4">
      
      {/* Label */}
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
        <Image className="w-4 h-4 text-[#5F8EAD]" />
        <span>Imagen del camión</span>
      </label>
      
      {/* Mostrar imagen actual o preview */}
      {hasImage && (
        <div className="relative group">
          <img
            src={displayImage}
            alt="Imagen del camión"
            className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
          />
          
          {/* Overlay con información */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-sm font-medium mb-2">
                {imagePreview ? 'Nueva imagen seleccionada' : 'Imagen actual'}
              </p>
              {!disabled && (
                <button
                  onClick={handleRemoveImage}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors flex items-center space-x-1 mx-auto"
                >
                  <X className="w-3 h-3" />
                  <span>Remover</span>
                </button>
              )}
            </div>
          </div>

          {/* Indicador de estado */}
          {uploadStatus === 'success' && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      )}

      {/* Área de subida */}
      <div className="relative">
        <input
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
          id="imageInput"
          disabled={disabled}
        />
        
        <label
          htmlFor="imageInput"
          className={`
            w-full p-8 border-2 border-dashed rounded-xl text-sm cursor-pointer transition-all duration-200 
            flex flex-col items-center justify-center space-y-3 min-h-[120px]
            ${dragOver 
              ? 'border-[#5F8EAD] bg-blue-50' 
              : error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-gray-50 hover:border-[#5F8EAD] hover:bg-gray-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Icono */}
          <div className={`p-3 rounded-full ${error ? 'bg-red-100' : 'bg-gray-200'}`}>
            {uploadStatus === 'processing' ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#5F8EAD] border-t-transparent" />
            ) : error ? (
              <AlertCircle className="w-6 h-6 text-red-500" />
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}
          </div>

          {/* Texto principal */}
          <div className="text-center">
            <p className="font-medium text-gray-700 mb-1">
              {fileName ? fileName : hasImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </p>
            <p className="text-gray-500 text-xs">
              Arrastra y suelta o haz click para seleccionar
            </p>
          </div>
        </label>
      </div>

      {/* Información de error */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Información de estado de éxito */}
      {uploadStatus === 'success' && !error && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="text-green-700 text-sm">Imagen cargada exitosamente</span>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Requisitos de imagen:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• <strong>Formatos soportados:</strong> {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}</p>
          <p>• <strong>Tamaño máximo:</strong> {formatFileSize(maxSize)}</p>
          <p>• <strong>Resolución recomendada:</strong> 800x600px o superior</p>
          <p>• <strong>Orientación:</strong> Horizontal preferida para mejor visualización</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;