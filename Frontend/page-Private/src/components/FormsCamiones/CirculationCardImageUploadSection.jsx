import React from 'react';
import { CreditCard, X } from 'lucide-react';
import Lottie from 'lottie-react';
import uploadFilesAnimation from '../../assets/lotties/Upload Files.json';

const CirculationCardImageUploadSection = ({
  imagePreview,
  onImageChange,
  onRemoveImage,
  register,
  error
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <CreditCard className="w-6 h-6 mr-3" style={{ color: '#5F8EAD' }} />
        <h3 className="text-lg font-semibold text-gray-800">
          Imagen de Tarjeta de Circulación
        </h3>
        <span className="text-gray-500 ml-2 text-sm">(Opcional)</span>
      </div>

      <div className="flex justify-center mb-4">
        <div className="relative group">
          {imagePreview ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 shadow-xl" style={{ borderColor: '#5F8EAD' }}>
              <img
                src={imagePreview}
                alt="Vista previa de tarjeta de circulación"
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 transform hover:scale-110"
                aria-label="Eliminar imagen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="circulation-card-img-input"
              className="flex flex-col items-center justify-center cursor-pointer w-32 h-32 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 transition-all duration-300 hover:shadow-xl hover:bg-gray-100 hover:border-blue-400 hover:scale-105"
            >
              {/* Animación Lottie de Upload Files */}
              <div className="w-16 h-16 mb-2">
                <Lottie
                  animationData={uploadFilesAnimation}
                  loop={true}
                />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                Subir Imagen
              </span>
              <span className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Input oculto para el archivo */}
      <input
        id="circulation-card-img-input"
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="hidden"
      />

      {/* Mensaje de error */}
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">
          {error.message}
        </p>
      )}

      {/* Información adicional */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          Sube una foto clara de la tarjeta de circulación para mantener tus documentos organizados
        </p>
      </div>
    </div>
  );
};

export default CirculationCardImageUploadSection;