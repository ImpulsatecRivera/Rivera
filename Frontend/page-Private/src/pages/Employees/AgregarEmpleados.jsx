import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, CreditCard, UserPlus, DollarSign } from 'lucide-react';
import { config } from '../../config';
import axios from 'axios';

const API_URL = config.api.API_URL;

// Importar componentes UI
import PageHeader from '../../components/UIEmpleados/PageHeader';
import HeroSection from '../../components/UIEmpleados/HeroSecction';
import SubmitButton from '../../components/UIEmpleados/SubmitButton';

// Importar componentes de formulario
import ImageUploader from '../../components/FormsEmpleados/ImageUploader';
import FormInput from '../../components/FormsEmpleados/FormInput';
import FormTextarea from '../../components/FormsEmpleados/FormTextarea';
import DatePicker from '../../components/FormsEmpleados/DatePicker';

// Importar utilidades
import { showSuccessAlert, showErrorAlert, showLoadingAlert, showValidationAlert } from '../../components/UIEmpleados/SweetAlertUtils';
import { validateEmployeeForm, formatInput } from '../../components/UIEmpleados/FormValidation';
import { generateEmail } from '../../components/UIEmpleados/EmailGenerator';
import { useImageUpload } from '../../components/Empleados/hooks/useImageUpload';

const AgregarEmpleado = () => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    dui: '',
    birthDate: '',
    password: '',
    phone: '',
    address: '',
    salario: '',
    img: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Hook personalizado para manejo de imágenes
  const { imagePreview, handleImageChange, removeImage, setImagePreview } = useImageUpload();

  // Generar email automáticamente cuando cambien nombre o apellido
  useEffect(() => {
    const email = generateEmail(formData.name, formData.lastName);
    setFormData(prev => ({
      ...prev,
      email: email
    }));
  }, [formData.name, formData.lastName]);

  // Manejo de cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // No permitir editar email
    if (name === 'email') {
      return;
    }

    // Formatear inputs específicos
    const formattedValue = formatInput(name, value);

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejo especial para el campo de salario
  const handleSalaryChange = (e) => {
    const value = e.target.value;
    // Permitir solo números y punto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        salario: value
      }));

      // Limpiar error si existe
      if (errors.salario) {
        setErrors(prev => ({
          ...prev,
          salario: ''
        }));
      }
    }
  };

  // Manejo de imagen
  const onImageChange = (e) => {
    handleImageChange(e, setFormData);
  };

  const onRemoveImage = () => {
    removeImage(setFormData);
  };

  // Validación y envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== INICIO DEL SUBMIT ===');

    // Validar formulario
    const formErrors = validateEmployeeForm(formData);
    
    // Validación adicional para salario
    if (!formData.salary || formData.salary === '' || parseFloat(formData.salary) <= 0) {
      formErrors.salary = 'El salario es requerido y debe ser mayor a 0';
    }

    console.log('Errores de validación:', formErrors);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      console.log('Formulario tiene errores, no se envía');

      const camposFaltantes = Object.keys(formErrors).map(field => {
        const fieldNames = {
          name: 'Nombre',
          lastName: 'Apellido',
          dui: 'DUI',
          birthDate: 'Fecha de nacimiento',
          password: 'Contraseña',
          phone: 'Teléfono',
          address: 'Dirección',
          salary: 'Salario'
        };
        return fieldNames[field] || field;
      });

      showValidationAlert(camposFaltantes);
      return;
    }

    try {
      showLoadingAlert();
      setLoading(true);
      console.log('Estado de loading activado');

      // Preparar FormData
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('lastName', formData.lastName.trim());
      formDataToSend.append('dui', formData.dui.trim());
      formDataToSend.append('birthDate', formData.birthDate);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phone', formData.phone.trim());
      formDataToSend.append('address', formData.address.trim());
      
      // Convertir y validar salario
      const salarioValue = parseFloat(formData.salario);
      if (!isNaN(salarioValue) && salarioValue > 0) {
        formDataToSend.append('salario', salarioValue);
        console.log('✅ Salario agregado:', salarioValue);
      } else {
        console.error('❌ Salario inválido:', formData.salario);
      }

      if (formData.img) {
        formDataToSend.append('img', formData.img);
      }

      console.log('=== DATOS A ENVIAR ===');
      console.log('Incluye imagen:', !!formData.img);
      console.log('Salario original:', formData.salario);
      console.log('Salario parseado:', salarioValue);
      
      // Mostrar todos los campos del FormData
      console.log('=== CONTENIDO DEL FORMDATA ===');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      console.log('=== ENVIANDO PETICIÓN ===');
      console.log('URL:', `${API_URL}/empleados`);

      // Enviar petición
      const response = await axios.post(`${API_URL}/empleados`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      console.log('=== RESPUESTA RECIBIDA ===');
      console.log('Status:', response.status);
      console.log('Respuesta del servidor:', response.data);

      if (response.status === 200 || response.status === 201) {
        console.log('¡Empleado creado exitosamente!');

        // Cerrar loading y mostrar éxito
        showSuccessAlert(handleBackToMenu);

        // Limpiar formulario
        setFormData({
          name: '',
          lastName: '',
          email: '',
          dui: '',
          birthDate: '',
          password: '',
          phone: '',
          address: '',
          salario: '',
          img: null
        });
        setImagePreview(null);
        setErrors({});
      }

    } catch (error) {
      console.error('=== ERROR CAPTURADO ===');
      console.error('Error completo:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);

      let errorMsg = 'Error desconocido';
      let errorTitle = '❌ Error al agregar empleado';

      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Error del servidor';
        const errorDetails = error.response.data?.details || error.response.data?.errors || null;

        console.log('Status Code:', statusCode);
        console.log('Error Message:', errorMessage);
        console.log('Error Details:', errorDetails);
        console.log('Full Response Data:', error.response.data);

        switch (statusCode) {
          case 400:
            errorTitle = '❌ Error de validación';
            if (errorDetails) {
              // Si hay detalles específicos de validación
              errorMsg = `${errorMessage}\n\nDetalles:\n${JSON.stringify(errorDetails, null, 2)}`;
            } else {
              errorMsg = errorMessage;
            }
            break;
          case 401:
            errorTitle = '🔒 No autorizado';
            errorMsg = 'No tienes permisos para realizar esta acción. Verifica tus credenciales.';
            break;
          case 403:
            errorTitle = '⛔ Acceso denegado';
            errorMsg = 'No tienes permisos suficientes para agregar empleados.';
            break;
          case 404:
            errorTitle = '🔍 Servicio no encontrado';
            errorMsg = 'El servicio no está disponible. Contacta al administrador.';
            break;
          case 409:
            errorTitle = '⚠️ Conflicto de datos';
            errorMsg = `Ya existe un empleado con estos datos: ${errorMessage}`;
            break;
          case 500:
            errorTitle = '🔥 Error del servidor';
            errorMsg = 'Error interno del servidor. Inténtalo más tarde.';
            break;
          default:
            errorTitle = '❌ Error inesperado';
            errorMsg = `Error del servidor (${statusCode}): ${errorMessage}`;
        }
      } else if (error.request) {
        console.error('No hubo respuesta del servidor');
        errorTitle = '🌐 Sin conexión';
        errorMsg = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        console.error('Error en la configuración:', error.message);
        errorTitle = '⚙️ Error de configuración';
        errorMsg = 'Error al configurar la petición. Contacta al administrador.';
      }

      showErrorAlert(errorMsg);

    } finally {
      console.log('=== FINALIZANDO ===');
      setLoading(false);
    }
  };

  // Navegación
  const handleBackToMenu = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      console.log('Navegar a la página anterior');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#34353A' }}>
      {/* Header */}
      <PageHeader 
        onBack={handleBackToMenu}
        title="Volver al menú principal"
      />

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <HeroSection 
            icon={UserPlus}
            title="Agregar Nuevo Empleado"
            subtitle="Complete la información del empleado para agregarlo al sistema"
          />

          {/* Form Container */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 xl:p-12">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              
              {/* Profile Image Section */}
              <ImageUploader 
                imagePreview={imagePreview}
                onImageChange={onImageChange}
                onRemoveImage={onRemoveImage}
              />

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Nombre */}
                <FormInput
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ingrese el nombre"
                  icon={User}
                  label="Nombre"
                  required
                  error={errors.name}
                />

                {/* Apellido */}
                <FormInput
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Ingrese el apellido"
                  icon={User}
                  label="Apellido"
                  required
                  error={errors.lastName}
                />

                {/* Email */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <FormInput
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={Mail}
                    label="Correo electrónico"
                    badge="Auto-generado"
                    readOnly
                  />
                </div>

                {/* DUI */}
                <FormInput
                  id="dui"
                  name="dui"
                  value={formData.dui}
                  onChange={handleInputChange}
                  placeholder="00000000-0"
                  maxLength={10}
                  icon={CreditCard}
                  label="DUI"
                  required
                  error={errors.dui}
                />

                {/* Fecha de Nacimiento */}
                <DatePicker
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  label="Fecha de nacimiento"
                  required
                  error={errors.birthDate}
                />

                {/* Contraseña */}
                <FormInput
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Ingrese una contraseña"
                  icon={Lock}
                  label="Contraseña"
                  required
                  error={errors.password}
                />

                {/* Teléfono */}
                <FormInput
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0000-0000"
                  maxLength={9}
                  icon={Phone}
                  label="Teléfono"
                  required
                  error={errors.phone}
                />

                {/* Salario */}
                <FormInput
                  id="salario"
                  name="salario"
                  type="number"
                  value={formData.salario}
                  onChange={handleSalaryChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  icon={DollarSign}
                  label="Salario"
                  required
                  error={errors.salario}
                />

                {/* Dirección */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <FormTextarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ingrese la dirección completa"
                    icon={MapPin}
                    label="Dirección"
                    required
                    error={errors.address}
                    rows={3}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <SubmitButton
                loading={loading}
                onClick={handleSubmit}
                icon={UserPlus}
                text="Agregar Empleado"
                loadingText="Procesando..."
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarEmpleado;