import React from 'react';
import { X } from 'lucide-react';
import Lottie from 'lottie-react';
import uploadFilesAnimation from '../../assets/lotties/Upload Files.json';

const ImageUploader = ({ imagePreview, onImageChange, onRemoveImage }) => {
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
            className="flex flex-col items-center justify-center cursor-pointer w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 transition-all duration-300 group-hover:shadow-xl hover:bg-gray-200 hover:scale-105"
          >
            {/* Animación Lottie de Upload Files - Más grande */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-1">
              <Lottie 
                animationData={uploadFilesAnimation}
                loop={true}
                autoplay={true}
                className="w-full h-full"
              />
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