import React from 'react';
import { Camera, X } from 'lucide-react';

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
            className="flex flex-col items-center justify-center cursor-pointer w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 border-4 border-dashed transition-all duration-300 group-hover:shadow-xl hover:bg-gray-200"
            style={{ borderColor: '#5F8EAD' }}
          >
            <Camera className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2" style={{ color: '#5D9646' }} />
            <span className="text-xs font-medium text-center" style={{ color: '#5D9646' }}>Subir foto</span>
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