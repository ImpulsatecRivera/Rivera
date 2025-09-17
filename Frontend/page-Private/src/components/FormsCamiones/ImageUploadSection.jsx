import React from 'react';
import { Camera, X } from 'lucide-react';
import Lottie from 'lottie-react';
import uploadFilesAnimation from '../../assets/lotties/Upload Files.json';

const ImageUploadSection = ({ 
  imagePreview, 
  onImageChange, 
  onRemoveImage, 
  register, 
  error 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Camera className="w-6 h-6 mr-3" style={{ color: '#5F8EAD' }} />
        <h3 className="text-lg font-semibold text-gray-800">
          Imagen del Camión
        </h3>
        <span className="text-red-500 ml-1">*</span>
      </div>
      
      <div className="flex justify-center mb-4">
        <div className="relative group">
          {imagePreview ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 shadow-xl" style={{ borderColor: '#5F8EAD' }}>
              <img 
                src={imagePreview} 
                alt="Vista previa del camión" 
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
              htmlFor="img-input"
              className="flex flex-col items-center justify-center cursor-pointer w-32 h-32 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 transition-all duration-300 hover:shadow-xl hover:bg-gray-100 hover:border-blue-400 hover:scale-105"
            >
              {/* Animación Lottie de Upload Files */}
              <div className="w-16 h-16 mb-2">
                <Lottie 
                  animationData={uploadFilesAnimation}
                  loop={true}
                  autoplay={true}
                  className="w-full h-full"
                />
              </div>
              
              <span className="text-sm font-medium text-center px-2" style={{ color: '#5D9646' }}>
                Subir imagen
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Input de archivo - MEJORADO */}
      <input
        id="img-input"
        type="file"
        accept="image/*"
        {...register('img', { 
          required: 'La imagen del camión es obligatoria',
          validate: {
            fileType: (file) => {
              if (!file) return true; // Si no hay archivo, required ya se encarga
              const fileObj = file instanceof FileList ? file[0] : file;
              if (!fileObj) return true;
              
              return fileObj.type.startsWith('image/') || 'Solo se permiten archivos de imagen';
            },
            fileSize: (file) => {
              if (!file) return true;
              const fileObj = file instanceof FileList ? file[0] : file;
              if (!fileObj) return true;
              
              return fileObj.size <= 5 * 1024 * 1024 || 'La imagen debe ser menor a 5MB';
            }
          }
        })}
        onChange={onImageChange}
        className="hidden"
      />

      {/* Mensaje de error */}
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">
          {error.message}
        </p>
      )}

      {/* Instrucciones */}
      <div className="text-center text-gray-500 text-xs mt-3">
        <p>Formatos permitidos: JPG, PNG, GIF</p>
        <p>Tamaño máximo: 5MB</p>
      </div>
    </div>
  );
};

export default ImageUploadSection;