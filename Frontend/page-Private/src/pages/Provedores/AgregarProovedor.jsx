import React, { useState } from 'react';
import { Building, Mail, Phone, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { config } from '../../config';

const API_URL = config.api.API_URL;

// Componentes UI genéricos para Proveedores
import LoadingState from '../../components/UIProveedores/LoadingStateAgregar';
import EmptyState from '../../components/UIProveedores/EmptyStateAgregar';
import ErrorState from '../../components/UIProveedores/ErrorStateAgregar';
import SweetAlert from '../../components/UIProveedores/SweetAlertAgregar';
import ConfirmDeleteAlert from '../../components/UIProveedores/ConfirmeDeleteAlertAgregar';
import SuccessAlert from '../../components/UIProveedores/SuccesAlertAgregar';

// Componentes de formularios específicos para Proveedores
import HeaderNavigation from '../../components/FormsProveedores/FormHeaderNavegation';
import FormHeroSection from '../../components/FormsProveedores/FormHeroSecction';
import FormContainer from '../../components/FormsProveedores/FormContainer';
import FormFieldsGrid from '../../components/FormsProveedores/FormFieldsGrid';
import FormInput from '../../components/FormsProveedores/FormImput';
import SubmitButton from '../../components/FormsProveedores/FormSubmitButton';

// Hook de Proveedores
import useSupplierManagement from '../../components/Proveedores/hooks/useAgregarProveedores';

const AgregarProveedor = () => {
  // Estados del componente
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    partDescription: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Usar el hook para navegación y refresh
  const { handleContinue, refreshProveedores } = useSupplierManagement();

  // Configuración de SweetAlert2 (mantenemos algunos para casos específicos)
  const showLoadingAlert = () => {
    Swal.fire({
      title: 'Agregando proveedor...',
      text: 'Por favor espera mientras procesamos la información',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });
  };

  const showValidationAlert = (camposFaltantes) => {
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
      customClass: { popup: 'animated pulse' }
    });
  };

  // Manejo de cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Validación y formateo de teléfono
    if (name === 'phone') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length > 4) {
        formattedValue = numbers.slice(0, 4) + '-' + numbers.slice(4, 8);
      } else {
        formattedValue = numbers;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName) newErrors.companyName = "El nombre de la empresa es obligatorio";
    if (!formData.email) newErrors.email = "El email es obligatorio";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido";
    }
    if (!formData.phone) newErrors.phone = "El teléfono es obligatorio";
    if (formData.phone && formData.phone.replace(/\D/g, '').length !== 8) {
      newErrors.phone = "El teléfono debe tener exactamente 8 dígitos";
    }
    if (!formData.partDescription) newErrors.partDescription = "La descripción del repuesto es obligatoria";

    return newErrors;
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      companyName: '',
      email: '',
      phone: '',
      partDescription: ''
    });
    setErrors({});
    setApiError(null);
  };

  // Manejo de confirmación antes de enviar
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      const camposFaltantes = Object.keys(formErrors).map(field => {
        const fieldNames = {
          companyName: 'Nombre de la empresa',
          email: 'Email',
          phone: 'Teléfono',
          partDescription: 'Repuesto'
        };
        return fieldNames[field] || field;
      });

      showValidationAlert(camposFaltantes);
      return;
    }

    // Mostrar modal de confirmación usando componente UI
    setShowConfirmDialog(true);
  };

  // Confirmar envío del formulario
  const confirmSubmit = () => {
    setShowConfirmDialog(false);
    handleSubmit();
  };

  // Cancelar envío
  const cancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  // Manejo de errores de la API
  const getErrorMessage = (error) => {
    let errorMsg = 'Error desconocido al agregar proveedor';

    if (error.message.includes('HTTP error!')) {
      const statusCode = error.message.match(/\d+/);
      if (statusCode) {
        switch (parseInt(statusCode[0])) {
          case 400:
            errorMsg = 'Los datos enviados no son válidos. Verifica la información.';
            break;
          case 401:
            errorMsg = 'No tienes permisos para realizar esta acción. Verifica tus credenciales.';
            break;
          case 403:
            errorMsg = 'No tienes permisos suficientes para agregar proveedores.';
            break;
          case 404:
            errorMsg = 'El servicio no está disponible. Contacta al administrador.';
            break;
          case 409:
            errorMsg = 'Ya existe un proveedor con estos datos. Verifica el email o nombre de empresa.';
            break;
          case 500:
            errorMsg = 'Error interno del servidor. Inténtalo más tarde.';
            break;
          default:
            errorMsg = `Error del servidor (${statusCode[0]}). Contacta al administrador.`;
        }
      }
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMsg = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    } else {
      errorMsg = 'Error al configurar la petición. Contacta al administrador.';
    }

    return errorMsg;
  };

  // Envío del formulario
  const handleSubmit = async () => {
    try {
      showLoadingAlert();
      setLoading(true);
      setApiError(null);

      const dataToSend = {
        companyName: formData.companyName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        partDescription: formData.partDescription.trim()
      };

      console.log('Enviando datos:', dataToSend);

      const response = await fetch(`${API_URL}/proveedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Proveedor creado exitosamente:', responseData);
        
        Swal.close();
        resetForm();
        
        // Refrescar la lista de proveedores
        refreshProveedores();
        
        // Mostrar modal de éxito usando componente UI
        setShowSuccessDialog(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      console.error('Error capturado:', error);
      Swal.close();
      
      const errorMessage = getErrorMessage(error);
      setApiError(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  // Manejar éxito y navegar de regreso
  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    handleBackToMenu();
  };

  // Manejar retry del error
  const handleRetryAfterError = () => {
    setApiError(null);
  };

  // Navegación
  const handleBackToMenu = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      console.log('Navegar a la página anterior');
    }
  };

  // Renderizar contenido principal
  const renderMainContent = () => {
    // Mostrar error de API si existe
    if (apiError) {
      return (
        <ErrorState
          error={apiError}
          onRetry={handleRetryAfterError}
          retryText="Intentar de nuevo"
          primaryColor="#5F8EAD"
        />
      );
    }

    // Mostrar formulario normal
    return (
      <FormContainer onSubmit={handleFormSubmit}>
        
        <FormFieldsGrid columns="2">
          
          {/* Nombre de la empresa */}
          <FormInput
            id="companyName"
            name="companyName"
            type="text"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder="Introduce el nombre de la empresa"
            label="Nombre de la empresa"
            icon={Building}
            error={errors.companyName}
            required={true}
          />

          {/* Email */}
          <FormInput
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Introduce el correo de la empresa"
            label="Email"
            icon={Mail}
            error={errors.email}
            required={true}
          />

          {/* Teléfono */}
          <FormInput
            id="phone"
            name="phone"
            type="text"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="0000-0000"
            maxLength={9}
            label="Teléfono"
            icon={Phone}
            error={errors.phone}
            required={true}
          />

          {/* Repuesto */}
          <FormInput
            id="partDescription"
            name="partDescription"
            type="text"
            value={formData.partDescription}
            onChange={handleInputChange}
            placeholder="Introduce el repuesto necesitado"
            label="Repuesto"
            icon={Package}
            error={errors.partDescription}
            required={true}
          />

        </FormFieldsGrid>

        {/* Submit Button */}
        <SubmitButton
          loading={loading}
          loadingText="Procesando..."
          icon={Building}
          color="#5D9646"
          hoverColor="#4a7a37"
        >
          Agregar Proveedor
        </SubmitButton>

      </FormContainer>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#34353A' }}>
      {/* Header Navigation */}
      <HeaderNavigation 
        onBack={handleBackToMenu}
        title="Volver al menú principal"
      />

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <FormHeroSection
            icon={Building}
            title="Agregar Nuevo Proveedor"
            description="Complete la información del proveedor para agregarlo al sistema"
            iconColor="#5D9646"
          />

          {/* Contenido principal con manejo de estados */}
          {renderMainContent()}

        </div>
      </div>

      {/* Modal de confirmación usando SweetAlert UI */}
      <SweetAlert
        isOpen={showConfirmDialog}
        onClose={cancelSubmit}
        onPrimary={cancelSubmit}
        onSecondary={confirmSubmit}
        title="¿Confirmar envío del formulario?"
        description="Se agregará el nuevo proveedor al sistema"
        primaryText="Cancelar"
        secondaryText="Confirmar"
        primaryColor="#6b7280"
        secondaryColor="#5D9646"
        icon="?"
      />

      {/* Modal de confirmación de eliminación (ejemplo de uso futuro) */}
      <ConfirmDeleteAlert
        isOpen={false} // Por ahora no se usa, pero está disponible
        onClose={() => {}}
        onConfirm={() => {}}
        itemName=""
        title="¿Eliminar datos del formulario?"
        description="Se perderán todos los datos ingresados"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de éxito usando SuccessAlert UI */}
      <SuccessAlert
        isOpen={showSuccessDialog}
        onClose={handleSuccessClose}
        type="add"
        title="¡Proveedor agregado con éxito!"
        description="El proveedor ha sido registrado correctamente en el sistema"
        buttonText="Continuar"
        successColor="#5D9646"
      />
    </div>
  );
};

export default AgregarProveedor;