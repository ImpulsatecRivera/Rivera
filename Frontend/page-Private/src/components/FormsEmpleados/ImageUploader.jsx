import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Lottie from 'lottie-react';

const ImageUploader = ({ imagePreview, onImageChange, onRemoveImage }) => {
  const [uploadFilesAnimation, setUploadFilesAnimation] = useState(null);

  // Cargar la animación Lottie
  useEffect(() => {
    fetch('../../assets/lotties/Upload Files.json')
      .then(response => response.json())
      .then(data => setUploadFilesAnimation(data))
      .catch(err => console.log('Error loading Upload Files animation:', err));
  }, []);

  return (
    <div className="flex justify-center mb-6 sm:mb-8">
      <div className="relative group">
        {imagePreview ? (
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 shadow-xl" style={{ borderColor: '#5F8EAD' }}>
            <img src={imagePreview} alt="Previsualización" className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-300 transform hover:scale-110"
              aria-label="Eliminar imagen"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="img-input"
            className="flex flex-col items-center justify-center cursor-pointer w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 border-4 border-dashed transition-all duration-300 group-hover:shadow-xl hover:bg-gray-200 hover:scale-105"
            style={{ borderColor: '#5F8EAD' }}
          >
            {/* Animación Lottie de Upload Files */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 mb-1">
              {uploadFilesAnimation ? (
                <Lottie 
                  animationData={uploadFilesAnimation}
                  loop={true}
                  autoplay={true}
                  className="w-full h-full"
                />
              ) : (
                // Fallback mientras carga la animación
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg animate-pulse flex items-center justify-center">
                  <span className="text-white text-xs font-bold">📁</span>
                </div>
              )}
            </div>
            
            <span className="text-xs font-medium text-center px-2" style={{ color: '#5D9646' }}>
              Subir foto
            </span>
            
            <input
              id="img-input"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;