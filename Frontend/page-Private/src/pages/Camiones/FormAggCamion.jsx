import React, { useState } from 'react';
import { ArrowLeft, Upload, X, ChevronDown } from 'lucide-react';
import { useForm } from "react-hook-form";
import {useTruckForm} from "../../components/Camiones/hooks/hookFormCamiones";
import Swal from "sweetalert2";
import "animate.css";

const FormAggCamion = ({ onNavigateBack, onSubmitSuccess }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  const {
    onSubmit,
    motoristasDisponibles,
    proveedoresDisponibles,
  } = useTruckForm();

  const handleBackToMenu = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        console.log('Navegar a la página anterior');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('img', null);
    const fileInput = document.getElementById('img-input');
    if (fileInput) fileInput.value = '';
  };

  // Función para mostrar alerta de formulario incompleto
  const showIncompleteFormAlert = () => {
    Swal.fire({
      title: 'Formulario incompleto',
      text: 'Por favor, completa todos los campos obligatorios',
      icon: 'warning',
      confirmButtonColor: '#f59e0b',
      showClass: {
        popup: 'animate__animated animate__pulse'
      }
    });
  };

  // Función para mostrar alerta de carga
  const showLoadingAlert = () => {
    Swal.fire({
      title: 'Agregando camión...',
      text: 'Por favor espera mientras procesamos la información',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  // Función para mostrar alerta de éxito
  const showSuccessAlert = () => {
    Swal.fire({
      title: '¡Camión agregado con éxito!',
      text: 'Camión agregado correctamente',
      icon: 'success',
      confirmButtonColor: '#22c55e',
      showClass: {
        popup: 'animate__animated animate__bounceIn'
      }
    });
  };

  // Función para mostrar alerta de error
  const showErrorAlert = (errorMessage) => {
    Swal.fire({
      title: 'Error al agregar camión',
      text: errorMessage || 'Ocurrió un error inesperado',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      showClass: {
        popup: 'animate__animated animate__shakeX'
      }
    });
  };

  // Función personalizada para manejar el submit
  const handleCustomSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Mostrar alerta de carga
      showLoadingAlert();

      // Agregar automáticamente el estado "disponible"
      const dataWithState = {
        ...data,
        state: "disponible"
      };

      // Log detallado para debug
      console.log('=== DEBUG FORMULARIO CAMIÓN ===');
      console.log('Datos originales del formulario:', data);
      console.log('Datos con estado agregado:', dataWithState);
      console.log('Tipo de archivo imagen:', data.img?.[0]?.type);
      console.log('Tamaño de archivo imagen:', data.img?.[0]?.size);
      console.log('Motoristas disponibles:', motoristasDisponibles);
      console.log('===========================');

      // Llamar a la función onSubmit original con el estado incluido
      const result = await onSubmit(dataWithState);
      console.log('Resultado del onSubmit:', result);

      // Si todo sale bien, mostrar alerta de éxito
      showSuccessAlert();
      
      // Resetear formulario
      reset();
      setImagePreview(null);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

    } catch (error) {
      // Log del error completo para debug
      console.error('=== ERROR COMPLETO ===');
      console.error('Error objeto:', error);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      
      if (error.request) {
        console.error('Request object:', error.request);
      }
      console.error('==================');
      
      // Obtener mensaje de error más específico
      let errorMessage = 'Ocurrió un error inesperado';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.statusText) {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.message && error.message !== "Error al enviar el formulario") {
        errorMessage = error.message;
      } else {
        errorMessage = 'Error 500: Problema interno del servidor. Revisa la consola para más detalles.';
      }

      // Mostrar alerta de error con mensaje específico
      showErrorAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para manejar errores de validación
  const handleFormErrors = (errors) => {
    if (Object.keys(errors).length > 0) {
      showIncompleteFormAlert();
    }
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#375E27';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#d1d5db';
  };

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: '#34353A' }}>
      {/* Header */}
      <div className="text-white px-8 py-4" style={{ backgroundColor: '#34353A' }}>
        <button 
          onClick={handleBackToMenu}
          className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Volver al menú principal</span>
        </button>
      </div>

      {/* Main Content with proper scroll */}
      <div className="px-8 pb-8 h-full overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="bg-white rounded-2xl p-8 max-w-none mx-0">
          {/* Title Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Agregar Camión</h1>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#34353A' }}>
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-3c-.89 0-1.67.39-2.22 1H15V9h3.56l1.33 2H17v4z"/>
                </svg>
              </div>
            </div>
            <button 
              onClick={() => document.querySelector('form').requestSubmit()}
              className="text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#375E27' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Agregando...' : 'Agregar'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleCustomSubmit, handleFormErrors)}>
            <div className="space-y-6">
              {/* First Row - Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    {...register("name", { required: true })}
                    placeholder="Nombre del número del camión"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarjeta de circulación</label>
                  <input
                    type="text"
                    {...register("ciculatioCard", { required: true })}
                    placeholder="Tarjeta de circulación del Camión"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.ciculatioCard && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
                  <input
                    type="text"
                    {...register("licensePlate", { required: true })}
                    placeholder="Número de placa"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.licensePlate && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                  <input
                    type="text"
                    {...register("brand", { required: true })}
                    placeholder="Marca del camión"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.brand && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                  <input
                    type="text"
                    {...register("model", { required: true })}
                    placeholder="Modelo del camión"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.model && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                  <input
                    type="number"
                    {...register("age", { required: true })}
                    placeholder="Año del camión"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.age && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de gasolina</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    {...register("gasolineLevel", { required: true })}
                    placeholder="Nivel de gasolina (0-100)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.gasolineLevel && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motorista</label>
                  <div className="relative">
                    <select
                      {...register("driverId", { required: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 appearance-none bg-white"
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    >
                      <option value="">Seleccionar motorista</option>
                      {(motoristasDisponibles || []).map((driver) => (
                        <option key={driver._id} value={driver._id}>
                          {`${driver.name} ${driver.lastName}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.driverId && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
                  <div className="relative">
                    <select
                      {...register("supplierId", { required: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 appearance-none bg-white"
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    >
                      <option value="">Seleccionar proveedor</option>
                      {(proveedoresDisponibles || []).map((proveedor) => (
                        <option key={proveedor._id} value={proveedor._id}>
                          {proveedor.companyName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.supplierId && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>
              </div>

              {/* Fourth Row - Description and Image */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Description - takes left column */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    {...register("description")}
                    placeholder="Descripción con breve descripción del camión"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400 resize-none"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Image Upload Section - takes right column */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto del Camión</label>
                  <div className="space-y-3">
                    {/* Preview de la imagen */}
                    <div className="relative group">
                      <div
                        className="w-full h-48 border-2 border-dashed rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden transition-all duration-300 hover:from-blue-50 hover:to-blue-100 hover:border-blue-300"
                        style={{ borderColor: imagePreview ? '#375E27' : '#d1d5db' }}
                      >
                        {imagePreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                              <button
                                type="button"
                                onClick={removeImage}
                                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-4">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white shadow-md flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-3c-.89 0-1.67.39-2.22 1H15V9h3.56l1.33 2H17v4z"/>
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Foto del camión</p>
                            <p className="text-xs text-gray-500">Arrastra o haz clic para subir</p>
                          </div>
                        )}
                      </div>

                      {/* Overlay para drag & drop visual */}
                      <input
                        type="file"
                        id="img-input"
                        accept="image/*"
                        {...register("img", { required: true })}
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                    </div>

                    {/* Botón de acción */}
                    <label
                      htmlFor="img-input"
                      className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 text-white text-sm font-medium shadow-md hover:shadow-lg"
                      style={{ backgroundColor: imagePreview ? '#375E27' : '#6B7280' }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      <span>{imagePreview ? 'Cambiar foto' : 'Seleccionar foto'}</span>
                    </label>

                    {/* Información de ayuda */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      <div className="flex items-start space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-blue-800 mb-1">Requisitos:</p>
                          <div className="text-xs text-blue-700 space-y-0.5">
                            <div>• JPG, PNG, GIF</div>
                            <div>• Máximo: 5MB</div>
                            <div>• Recomendado: 400x400px</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {errors.img && (
                      <span className="text-red-500 text-xs mt-2 block">Este campo es obligatorio</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de envío oculto */}
            <button type="submit" className="hidden">
              Guardar Camión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormAggCamion;