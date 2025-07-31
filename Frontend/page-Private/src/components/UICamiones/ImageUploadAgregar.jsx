import React from 'react';
import { Camera, X, Upload } from 'lucide-react';

const ImageUploadForm = ({
  imagePreview,
  onImageChange,
  onRemoveImage,
  error,
  required = false,
  size = 'large', // 'small', 'medium', 'large'
  borderColor = '#5F8EAD',
  iconColor = '#5D9646',
  shape = 'circle', // 'circle' or 'rectangle'
  // ✅ Extraer props de react-hook-form
  name,
  onChange: rhfOnChange,
  onBlur,
  ref,
  ...props
}) => {
  const sizes = {
    small: shape === 'circle' ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-20 h-16 sm:w-24 sm:h-20',
    medium: shape === 'circle' ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-32 h-24 sm:w-40 sm:h-32',
    large: shape === 'circle' ? 'w-24 h-24 sm:w-32 sm:h-32' : 'w-40 h-32 sm:w-48 sm:h-40'
  };

  const iconSizes = {
    small: 'w-4 h-4 sm:w-5 sm:h-5',
    medium: 'w-5 h-5 sm:w-6 sm:h-6',
    large: 'w-6 h-6 sm:w-8 sm:h-8'
  };

  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  // ✅ Manejar el cambio de archivo
  const handleFileChange = (event) => {
    // Llamar primero al onChange de react-hook-form
    if (rhfOnChange) {
      rhfOnChange(event);
    }
    
    // Luego llamar al onChange personalizado si existe
    if (onImageChange) {
      onImageChange(event);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        {imagePreview ? (
          <div
            className={`relative ${sizes[size]} ${roundedClass} overflow-hidden border-4 shadow-xl`}
            style={{ borderColor }}
          >
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
            className={`flex flex-col items-center justify-center cursor-pointer ${sizes[size]} ${roundedClass} bg-gray-100 border-4 border-dashed transition-all duration-300 group-hover:shadow-xl hover:bg-gray-200`}
            style={{ borderColor }}
          >
            {shape === 'circle' ? (
              <Camera className={`${iconSizes[size]} mb-1 sm:mb-2`} style={{ color: iconColor }} />
            ) : (
              <Upload className={`${iconSizes[size]} mb-1 sm:mb-2`} style={{ color: iconColor }} />
            )}
            <span className="text-xs font-medium text-center px-2" style={{ color: iconColor }}>
              {shape === 'circle' ? 'Subir foto' : 'Subir imagen'} {required && '*'}
            </span>
            <input
              id="img-input"
              type="file"
              accept="image/*"
              name={name}
              onChange={handleFileChange}
              onBlur={onBlur}
              ref={ref}
              className="hidden"
              {...props}
            />
          </label>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-xs flex items-center justify-center space-x-1 mt-2">
          <span>⚠️</span>
          <span>La imagen es obligatoria</span>
        </p>
      )}
    </div>
  );
};

export default ImageUploadForm;