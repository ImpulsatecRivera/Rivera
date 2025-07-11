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
    <div className="min-h-screen bg-[#34353A] p-6">
      <div className="max-w-full mx-auto px-4">
        {/* Header */}
        <div className="text-white mb-6">
          <button 
            onClick={handleBackToMenu}
            className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver al menú principal</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl p-10 shadow-lg">
          {/* Title Section */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">Agregar Camión</h1>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#34353A' }}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-3c-.89 0-1.67.39-2.22 1H15V9h3.56l1.33 2H17v4z"/>
                </svg>
              </div>
            </div>
            <button 
              onClick={() => document.querySelector('form').requestSubmit()}
              className="text-white px-7 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#375E27' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Agregando...' : 'Agregar'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleCustomSubmit, handleFormErrors)}>
            <div className="space-y-7">
              {/* First Row */}
              <div className="grid grid-cols-3 gap-7">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    {...register("name", { required: true })}
                    placeholder="Nombre del número del camión"
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
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
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
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
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.licensePlate && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-3 gap-7">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                  <input
                    type="text"
                    {...register("brand", { required: true })}
                    placeholder="Marca del camión"
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
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
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.model && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">Año</label>
                  <input
                    type="number"
                    {...register("age", { required: true })}
                    placeholder="Año del camión"
                    className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none text-base text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.age && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-3 gap-7">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">Nivel de Gasolina</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    {...register("gasolineLevel", { required: true })}
                    placeholder="Nivel de gasolina (0-100)"
                    className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none text-base text-gray-700 placeholder-gray-400"
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
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 appearance-none bg-white"
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
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 appearance-none bg-white"
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

              {/* Fourth Row - Description and Photo */}
              <div className="grid grid-cols-1 gap-7">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    {...register("description")}
                    placeholder="Descripción con breve descripción del camión"
                    rows={5}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400 resize-none"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Photo Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto del Camión (opcional)</label>
                <div className="flex items-center space-x-5">
                  {/* Photo Circle */}
                  <div className="relative">
                    <div className="w-22 h-22 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-gray-400 transition-colors">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Upload className="w-7 h-7 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      id="img-input"
                      accept="image/*"
                      {...register("img", { required: true })}
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Photo Text */}
                  <div className="flex-1">
                    <label
                      htmlFor="img-input"
                      className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 font-medium"
                    >
                      Sube una foto del camión (opcional)
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos: JPG, PNG, GIF. Máximo: 5MB
                    </p>
                  </div>

                  {/* Remove Button */}
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {errors.img && (
                  <span className="text-red-500 text-xs mt-2 block">Este campo es obligatorio</span>
                )}
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