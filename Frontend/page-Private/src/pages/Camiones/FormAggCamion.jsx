import React from "react";
import { useForm } from "react-hook-form";
import {useTruckForm} from "../../components/Camiones/hooks/hookFormCamiones";
import Swal from "sweetalert2";
import "animate.css";

const FormAggCamion = () => {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    motoristasDisponibles,
    proveedoresDisponibles,
  } = useTruckForm();

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
    }
  };

  // Función para manejar errores de validación
  const handleFormErrors = (errors) => {
    if (Object.keys(errors).length > 0) {
      showIncompleteFormAlert();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <div className="bg-gray-800 rounded-lg p-2">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 8h-3l-1.5-1.5h-7L7 8H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          Agregar Camión
        </h2>
        <button
          type="button"
          onClick={() => document.querySelector('form').requestSubmit()}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Agregar
        </button>
      </div>
      
      <form
        onSubmit={handleSubmit(handleCustomSubmit, handleFormErrors)}
        className="bg-white shadow-lg rounded-xl p-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna de la imagen */}
          <div className="lg:col-span-1">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Foto del Camión</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 8h-3l-1.5-1.5h-7L7 8H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2z"/>
                  </svg>
                  <p className="text-gray-500 mb-2">Foto del camión</p>
                  <p className="text-sm text-gray-400 mb-4">Arrastra o haz clic para subir</p>
                  <label className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer">
                    <span>Seleccionar foto</span>
                    <input
                      type="file"
                      {...register("img", { required: true })}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Requisitos:</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• JPG, PNG, GIF</li>
                  <li>• Máximo: 5MB</li>
                  <li>• Recomendado: 400x400px</li>
                </ul>
              </div>
              
              {errors.img && (
                <span className="text-red-500 text-sm mt-2 block">Este campo es obligatorio</span>
              )}
            </div>
          </div>

          {/* Columnas de formulario */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Primera columna */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nombre</label>
                  <input
                    type="text"
                    {...register("name", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre del número del camión"
                  />
                  {errors.name && (
                    <span className="text-red-500 text-sm">Este campo es obligatorio</span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Marca</label>
                  <input
                    type="text"
                    {...register("brand", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Marca del camión"
                  />
                  {errors.brand && (
                    <span className="text-red-500 text-sm">Este campo es obligatorio</span>
                  )}
                </div>
              </div>

              {/* Segunda columna */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tarjeta de circulación</label>
                  <input
                    type="text"
                    {...register("ciculatioCard", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tarjeta de circulación del Camión"
                  />
                  {errors.ciculatioCard && (
                    <span className="text-red-500 text-sm">Este campo es obligatorio</span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nivel de Gasolina</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    {...register("gasolineLevel", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nivel de gasolina (0-100)"
                  />
                  {errors.gasolineLevel && (
                    <span className="text-red-500 text-sm">Este campo es obligatorio</span>
                  )}
                </div>
              </div>

              {/* Tercera columna */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Placa</label>
                  <input
                    type="text"
                    {...register("licensePlate", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Número de placa"
                  />
                  {errors.licensePlate && (
                    <span className="text-red-500 text-sm">Este campo es obligatorio</span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Descripción</label>
                  <textarea
                    {...register("description")}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                    placeholder="Descripción con breve descripción del camión"
                  ></textarea>
                </div>
              </div>

            </div>

            {/* Fila adicional para campos que faltan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Modelo</label>
                <input
                  type="text"
                  {...register("model", { required: true })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Modelo del camión"
                />
                {errors.model && (
                  <span className="text-red-500 text-sm">Este campo es obligatorio</span>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Año</label>
                <input
                  type="number"
                  {...register("age", { required: true })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Años del camión"
                />
                {errors.age && (
                  <span className="text-red-500 text-sm">Este campo es obligatorio</span>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Motorista</label>
                <select
                  {...register("driverId", { required: true })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar motorista</option>
                  {(motoristasDisponibles || []).map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {`${driver.name} ${driver.lastName}`}
                    </option>
                  ))}
                </select>
                {errors.driverId && (
                  <span className="text-red-500 text-sm">Este campo es obligatorio</span>
                )}
              </div>
            </div>

            {/* Campo de proveedor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Proveedor</label>
                <select
                  {...register("supplierId", { required: true })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar proveedor</option>
                  {(proveedoresDisponibles || []).map((proveedor) => (
                    <option key={proveedor._id} value={proveedor._id}>
                      { proveedor.companyName}
                    </option>
                  ))}
                </select>
                {errors.supplierId && (
                  <span className="text-red-500 text-sm">Este campo es obligatorio</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Botón de envío (oculto, ya que usamos el de arriba) */}
        <button type="submit" className="hidden">
          Guardar Camión
        </button>
      </form>
    </div>
  );
};

export default FormAggCamion;