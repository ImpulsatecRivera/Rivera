import React, { useState } from 'react';
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
import CirculationCardImageUploadSection from '../../components/FormsCamiones/CirculationCardImageUploadSection';
import BasicInfoFields from '../../components/FormsCamiones/BasicInfoFields';
import VehicleDetailsFields from '../../components/FormsCamiones/VehicleDetailsFields';
import AssignmentFields from '../../components/FormsCamiones/AssignmentFields';
import DescriptionField from '../../components/FormsCamiones/DescriptionField';
import SubmitButton from '../../components/FormsCamiones/SubmitButton';

const FormAggCamion = ({ onNavigateBack, onSubmitSuccess }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [circulationCardImagePreview, setCirculationCardImagePreview] = useState(null);
  const [circulationCardImageFile, setCirculationCardImageFile] = useState(null);
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
  } = useTruckForm(onSubmitSuccess);

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

  // Handler para cambio de imagen - CON DEBUG EXTENSIVO
  const handleImageChange = (e) => {
    console.log('🔥 === INICIO handleImageChange ===');
    console.log('🔥 Event completo:', e);
    console.log('🔥 e.target:', e.target);
    console.log('🔥 e.target.files:', e.target.files);
    console.log('🔥 Tipo de e.target.files:', typeof e.target.files);
    console.log('🔥 Es FileList?:', e.target.files instanceof FileList);
    console.log('🔥 Longitud:', e.target.files?.length);
    
    const file = e.target.files[0];
    console.log('🔥 File extraído:', file);
    console.log('🔥 Tipo de file:', typeof file);
    console.log('🔥 Es File?:', file instanceof File);
    
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        console.log('❌ Tipo de archivo inválido:', file.type);
        Swal.fire({
          title: 'Formato no válido',
          text: 'Por favor selecciona una imagen en formato JPG, PNG o GIF',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }

      console.log('✅ Archivo válido, procediendo...');
      
      // Guardar el archivo en el estado
      setImageFile(file);
      console.log('🔥 ImageFile guardado en state:', file);
      
      // PROBAR MÚLTIPLES MÉTODOS PARA SETEAR
      console.log('🔥 Intentando setValue con FileList completo...');
      setValue('img', e.target.files, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true 
      });
      
      // Verificar inmediatamente después de setValue
      const currentFormValue = watch('img');
      console.log('🔥 Valor en formulario después de setValue:', currentFormValue);
      console.log('🔥 Tipo del valor en formulario:', typeof currentFormValue);
      console.log('🔥 Es FileList el valor en formulario?:', currentFormValue instanceof FileList);
      console.log('🔥 Longitud del valor en formulario:', currentFormValue?.length);
      console.log('🔥 Primer archivo del valor en formulario:', currentFormValue?.[0]);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('🔥 Preview creado exitosamente');
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      console.log('🔥 === DEBUG IMAGE CHANGE COMPLETO ===');
      console.log('🔥 Archivo seleccionado:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
    } else {
      console.log('❌ No se seleccionó ningún archivo');
    }
    
    console.log('🔥 === FIN handleImageChange ===');
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

  // Handler para cambio de imagen de tarjeta de circulación
  const handleCirculationCardImageChange = (e) => {
    console.log('🔥 === INICIO handleCirculationCardImageChange ===');
    const file = e.target.files[0];
    console.log('🔥 File extraído:', file);
    
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        console.log('❌ Tipo de archivo inválido:', file.type);
        Swal.fire({
          title: 'Formato no válido',
          text: 'Por favor selecciona una imagen en formato JPG, PNG o GIF para la tarjeta de circulación',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }

      console.log('✅ Archivo válido, procediendo...');
      
      // Guardar el archivo en el estado
      setCirculationCardImageFile(file);
      console.log('🔥 CirculationCardImageFile guardado en state:', file);
      
      // Setear en el formulario usando setValue manualmente
      setValue('circulationCardImage', file, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true 
      });
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        console.log('🔥 Preview de tarjeta de circulación creado exitosamente');
        setCirculationCardImagePreview(readerEvent.target.result);
      };
      reader.readAsDataURL(file);

      console.log('🔥 Archivo seleccionado:', file.name, file.size, 'bytes');
    } else {
      console.log('❌ No se seleccionó ningún archivo para tarjeta de circulación');
    }
    
    console.log('🔥 === FIN handleCirculationCardImageChange ===');
  };

  // Handler para remover imagen de tarjeta de circulación
  const removeCirculationCardImage = () => {
    setCirculationCardImagePreview(null);
    setCirculationCardImageFile(null);
    setValue('circulationCardImage', null, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    });
    
    // Limpiar el input file
    const fileInput = document.getElementById('circulation-card-img-input');
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
      if (result.isConfirmed) {
        // Marcar que se agregó un camión para que la página principal refresque
        localStorage.setItem('truckAdded', 'true');
        
        // Llamar al callback si existe
        if (onSubmitSuccess) {
          onSubmitSuccess();
        } else {
          // Navegar de vuelta a la página principal
          if (onNavigateBack) {
            onNavigateBack();
          } else {
            window.history.back();
          }
        }
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

  // Handler personalizado para el submit - SOLUCIÓN DEFINITIVA
  const handleCustomSubmit = async (data) => {
    console.log('🚀 === INICIO DEL SUBMIT ===');
    console.log('Datos recibidos:', data);

    try {
      setIsSubmitting(true);

      console.log('=== DEBUG ANTES DEL SUBMIT ===');
      console.log('Datos del formulario:', data);
      console.log('Archivo de imagen del state:', imageFile);
      console.log('Imagen de los datos del form:', data.img);
      console.log('¿Es FileList?:', data.img instanceof FileList);
      console.log('¿Es File?:', data.img instanceof File);
      console.log('Tipo de data.img:', typeof data.img);

      // VERIFICACIÓN INTELIGENTE DE LAS IMÁGENES (ahora opcionales)
      let finalImageFile = null;
      if (data.img instanceof FileList && data.img.length > 0) {
        finalImageFile = data.img[0];
      } else if (data.img instanceof File) {
        finalImageFile = data.img;
      }

      let finalCirculationCardImage = null;
      if (data.circulationCardImage instanceof FileList && data.circulationCardImage.length > 0) {
        finalCirculationCardImage = data.circulationCardImage[0];
      } else if (data.circulationCardImage instanceof File) {
        finalCirculationCardImage = data.circulationCardImage;
      }

      console.log('🖼️ Imagen principal procesada:', finalImageFile?.name || 'ninguna');
      console.log('🖼️ Imagen tarjeta procesada:', finalCirculationCardImage?.name || 'ninguna');

      // Mostrar alerta de carga
      showLoadingAlert();

      // CONVERTIR A FORMATO QUE ESPERA EL HOOK
      const dataToSubmit = {
        ...data,
        state: "disponible",
        img: finalImageFile ? [finalImageFile] : undefined,
        circulationCardImage: finalCirculationCardImage ? [finalCirculationCardImage] : undefined
      };

      // Llamar a la función onSubmit original
      console.log('📡 Enviando datos a API:', dataToSubmit);
      const result = await onSubmit(dataToSubmit);
      console.log('✅ Respuesta de API:', result);

      // Si todo sale bien, mostrar alerta de éxito
      showSuccessAlert();
      
      // Resetear formulario
      reset();
      setImagePreview(null);
      setImageFile(null);
      setCirculationCardImagePreview(null);
      setCirculationCardImageFile(null);

    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);

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
    console.log('⚠️ === ERRORES DE VALIDACIÓN ===');
    console.log('Errores encontrados:', errors);
    console.log('Campos con error:', Object.keys(errors));

    if (Object.keys(errors).length > 0) {
      const camposFaltantes = Object.keys(errors).map(field => {
        const fieldNames = {
          name: 'Nombre',
          ciculatioCard: 'Tarjeta de circulación',
          licensePlate: 'Placa',
          brand: 'Marca',
          model: 'Modelo',
          age: 'Año',
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

            {/* Circulation Card Image Upload Section */}
            <CirculationCardImageUploadSection
              imagePreview={circulationCardImagePreview}
              onImageChange={handleCirculationCardImageChange}
              onRemoveImage={removeCirculationCardImage}
              register={register}
              error={errors.circulationCardImage}
            />

            {/* Vehicle Details Fields */}
            <VehicleDetailsFields register={register} errors={errors} />

            {/* Assignment Fields */}
            <AssignmentFields 
              register={register} 
              errors={errors}
              motoristasDisponibles={motoristasDisponibles}
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