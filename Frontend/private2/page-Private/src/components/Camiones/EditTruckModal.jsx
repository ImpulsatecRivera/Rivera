import React from 'react';
import { X, Truck } from 'lucide-react';
import LoadingState from '../../components/UICamiones/LoadingState';
import EditFormFields from '../../components/Camiones/EditFormFields';
import ImageUpload from '../Camiones/ImageUpload';

const EditTruckModal = ({
  isOpen,
  loading,
  isSubmitting,
  formData,
  imagePreview,
  currentImage,
  proveedores = [],
  motoristas = [],
  onClose,
  onInputChange,
  onImageChange,
  onSubmit,
  onSuccess
}) => {
  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!onSubmit) return;
    
    try {
      const result = await onSubmit();
      if (result && result.success && onSuccess) {
        onSuccess(result.data);
      } else if (result && !result.success) {
        console.error('Error en edición:', result.error);
        // El error se maneja en el componente padre
      }
    } catch (error) {
      console.error('Error inesperado en edición:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && onClose) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    // Cerrar solo si se hace click en el overlay, no en el modal
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    // Cerrar con Escape
    if (e.key === 'Escape' && !isSubmitting) {
      handleClose();
    }
  };

  return (
    <>
      {/* Estilos de animación */}
      <style>
        {`
          @keyframes slideInUp {
            from {
              transform: translateY(100px) scale(0.9);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes fadeInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .modal-overlay {
            animation: fadeIn 0.3s ease-out;
          }

          .modal-content {
            animation: slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .modal-header {
            animation: fadeInUp 0.5s ease-out 0.2s both;
          }

          .modal-body {
            animation: fadeInUp 0.5s ease-out 0.3s both;
          }

          .modal-button {
            animation: fadeInUp 0.5s ease-out 0.5s both;
          }
        `}
      </style>
      
      {/* Overlay del modal */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40 modal-overlay"
        onClick={handleOverlayClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Contenedor del modal */}
        <div 
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header del modal */}
          <div className="p-6 border-b border-gray-100" style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #4a7ba7 100%)'}}>
            <div className="flex items-center justify-between modal-header">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-xl p-3 mr-4">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Editar Camión</h2>
                  <p className="text-blue-100 text-sm">Actualiza la información del vehículo</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                disabled={isSubmitting}
                className={`p-2 rounded-xl transition-colors ${
                  isSubmitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-white hover:bg-opacity-20'
                }`}
                title="Cerrar modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Contenido del modal */}
          {loading ? (
            <div className="p-12">
              <LoadingState 
                message="Cargando datos del camión..." 
                primaryColor="#5F8EAD"
              />
            </div>
          ) : (
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] modal-body">
              <div className="space-y-6">
                
                {/* Campos del formulario */}
                <EditFormFields
                  formData={formData}
                  proveedores={proveedores}
                  motoristas={motoristas}
                  onInputChange={onInputChange}
                  disabled={isSubmitting}
                />

                {/* Subida de imagen */}
                <ImageUpload
                  imagePreview={imagePreview}
                  currentImage={currentImage}
                  onImageChange={onImageChange}
                  fileName={formData.imagen?.name}
                  disabled={isSubmitting}
                />

                {/* Botón de envío */}
                <div className="flex justify-center pt-6 modal-button">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || loading}
                    className={`px-10 py-4 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                      isSubmitting || loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                    }`}
                    style={{
                      background: (isSubmitting || loading) ? undefined : 'linear-gradient(135deg, #5D9646 0%, #4a7a37 100%)'
                    }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Actualizando...
                      </div>
                    ) : (
                      'Actualizar Camión'
                    )}
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditTruckModal;