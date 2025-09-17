// Handler para cambio de imagen - COMPATIBLE CON EL HOOK
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('=== INICIO handleImageChange ===');
    console.log('Event:', e);
    console.log('Files:', e.target.files);
    console.log('File seleccionado:', file);
    
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          title: 'Formato no válido',
          text: 'Por favor selecciona una imagen en formato JPG, PNG o GIF',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }

      // Guardar el archivo en el estado
      setImageFile(file);
      
      // IMPORTANTE: El hook espera un FileList, NO un File individual
      // Creamos un FileList-like object o usamos los files originales del evento
      setValue('img', e.target.files, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true 
      });

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      console.log('=== DEBUG IMAGE CHANGE ===');
      console.log('Archivo seleccionado:', file);
      console.log('FileList completo:', e.target.files);
      console.log('Nombre:', file.name);
      console.log('Tamaño:', file.size);
      console.log('Tipo:', file.type);
    }
  };import React, { useState } from 'react';
import { Truck, CreditCard, Car, Building, Calendar, Fuel, User, FileText } from 'lucide-react';
import { useForm } from "react-hook-form";
import { useTruckForm } from "../../components/Camiones/hooks/hookFormCamiones";
import Swal from "sweetalert2";
import "animate.css";

// Importar componentes de FormsCamiones (que ya tienes)
import FormHeader from '../../components/FormsCamiones/FormHeader';
import FormHeroSection from '../../components/FormsCamiones/FormHeroSection';
import FormContainer from '../../components/FormsCamiones/FormContainer';
import ImageUploadSection from '../../components/FormsCamiones/ImageUploadSection';
import BasicInfoFields from '../../components/FormsCamiones/BasicInfoFields';
import VehicleDetailsFields from '../../components/FormsCamiones/VehicleDetailsFields';
import AssignmentFields from '../../components/FormsCamiones/AssignmentFields';
import DescriptionField from '../../components/FormsCamiones/DescriptionField';
import SubmitButton from '../../components/FormsCamiones/SubmitButton';

const FormAggCamion = ({ onNavigateBack, onSubmitSuccess }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Estado separado para el archivo
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  const {
    onSubmit,
    motoristasDisponibles,
    proveedoresDisponibles,
  } = useTruckForm();

  // Handler para volver al menú
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

  // Handler para cambio de imagen - MEJORADO
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          title: 'Formato no válido',
          text: 'Por favor selecciona una imagen en formato JPG, PNG o GIF',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }
      


      // Guardar el archivo en el estado
      setImageFile(file);
      
      // Setear el archivo en react-hook-form usando setValue
      setValue('img', file, { shouldValidate: true });

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      console.log('=== DEBUG IMAGE CHANGE ===');
      console.log('Archivo seleccionado:', file);
      console.log('Nombre:', file.name);
      console.log('Tamaño:', file.size);
      console.log('Tipo:', file.type);
    }
  };

  // Handler para remover imagen - COMPATIBLE CON EL HOOK
  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setValue('img', null, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    });
    
    // Limpiar el input file
    const fileInput = document.getElementById('img-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Función para mostrar alerta de formulario incompleto
  const showIncompleteFormAlert = (camposFaltantes) => {
    Swal.fire({
      title: '⚠️ Formulario incompleto',
      html: `
        <p style="margin-bottom: 15px;">Los siguientes campos son obligatorios:</p>
        <ul style="text-align: left; color: #dc2626; font-weight: 500;">
          ${camposFaltantes.map(campo => `<li>• ${campo}</li>`).join('')}
        </ul>
      `,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated pulse'
      }
    });
  };

  // Función para mostrar alerta de carga
  const showLoadingAlert = () => {
    Swal.fire({
      title: 'Agregando camión...',
      text: 'Por favor espera mientras procesamos la información',
      allowOutsideClick: false,
      allowEscapeKey: false,
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
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#5D9646',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated bounceIn'
      }
    }).then((result) => {
      if (result.isConfirmed && onSubmitSuccess) {
        onSubmitSuccess();
      }
    });
  };

  // Función para mostrar alerta de error
  const showErrorAlert = (errorMessage) => {
    Swal.fire({
      title: 'Error al agregar camión',
      text: errorMessage || 'Ocurrió un error inesperado',
      icon: 'error',
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: '#ef4444',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated shakeX'
      }
    });
  };

  // Handler personalizado para el submit - MEJORADO
  const handleCustomSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      console.log('=== DEBUG ANTES DEL SUBMIT ===');
      console.log('Datos del formulario:', data);
      console.log('Archivo de imagen del state:', imageFile);
      console.log('Imagen de los datos del form:', data.img);
      console.log('¿Es FileList?:', data.img instanceof FileList);
      console.log('Longitud de FileList:', data.img?.length);
      console.log('Primer archivo del FileList:', data.img?.[0]);

      // Verificar si hay imagen antes de enviar
      if (!data.img || !data.img[0]) {
        throw new Error('Debe seleccionar una imagen para el camión');
      }

      // Mostrar alerta de carga
      showLoadingAlert();

      // Preparar los datos para el envío - MANTENER TAL COMO ESPERA EL HOOK
      const dataToSubmit = {
        ...data,
        state: "disponible"
        // NO modificar data.img, dejarlo como FileList
      };

      console.log('=== DEBUG DATOS PARA ENVÍO ===');
      console.log('Datos con estado agregado:', dataToSubmit);
      console.log('FileList final:', dataToSubmit.img);
      console.log('Archivo final:', dataToSubmit.img?.[0]);

      // Llamar a la función onSubmit original
      const result = await onSubmit(dataToSubmit);
      console.log('Resultado del onSubmit:', result);

      // Si todo sale bien, mostrar alerta de éxito
      showSuccessAlert();
      
      // Resetear formulario
      reset();
      setImagePreview(null);
      setImageFile(null);

    } catch (error) {
      // Log del error para debug
      console.error('=== ERROR COMPLETO ===');
      console.error('Error:', error);
      
      // Obtener mensaje de error específico
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

      // Mostrar alerta de error
      showErrorAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para errores de validación
  const handleFormErrors = (errors) => {
    if (Object.keys(errors).length > 0) {
      const camposFaltantes = Object.keys(errors).map(field => {
        const fieldNames = {
          name: 'Nombre',
          ciculatioCard: 'Tarjeta de circulación',
          licensePlate: 'Placa',
          brand: 'Marca',
          model: 'Modelo',
          age: 'Año',
          gasolineLevel: 'Nivel de gasolina',
          driverId: 'Motorista',
          supplierId: 'Proveedor',
          img: 'Imagen del camión'
        };
        return fieldNames[field] || field;
      });

      showIncompleteFormAlert(camposFaltantes);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#34353A' }}>
      
      {/* Header */}
      <FormHeader onBack={handleBackToMenu} />

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <FormHeroSection
            icon={Truck}
            title="Agregar Nuevo Camión"
            description="Complete la información del camión para agregarlo a la flota"
          />

          {/* Form Container */}
          <FormContainer onSubmit={handleSubmit(handleCustomSubmit, handleFormErrors)}>
            
            {/* Image Upload Section */}
            <ImageUploadSection
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onRemoveImage={removeImage}
              register={register}
              error={errors.img}
            />

            {/* Basic Info Fields */}
            <BasicInfoFields register={register} errors={errors} />

            {/* Vehicle Details Fields */}
            <VehicleDetailsFields register={register} errors={errors} />

            {/* Assignment Fields */}
            <AssignmentFields 
              register={register} 
              errors={errors}
              motoristasDisponibles={motoristasDisponibles}
              proveedoresDisponibles={proveedoresDisponibles}
            />

            {/* Description Field */}
            <DescriptionField register={register} errors={errors} />

            {/* Submit Button */}
            <SubmitButton
              isSubmitting={isSubmitting}
              icon={Truck}
              loadingText="Procesando..."
            >
              Agregar Camión
            </SubmitButton>

          </FormContainer>
        </div>
      </div>
    </div>
  );
};

export default FormAggCamion;