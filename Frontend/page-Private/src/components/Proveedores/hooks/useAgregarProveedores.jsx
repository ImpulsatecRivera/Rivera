import { useState } from 'react';
import { config } from '../../../config';
import Swal from 'sweetalert2';
const API_URL = config.api.API_URL;

const useSupplierForm = () => {
  // Estados del componente
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    partDescription: '',
    contactoNombre: '',
    contactoCargo: '',
    contactoTelefono: '',
    contactoEmail: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Configuración personalizada de SweetAlert2
  const showSuccessAlert = () => {
    Swal.fire({
      title: '¡Proveedor agregado con éxito!',
      text: 'Proveedor agregado correctamente',
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#5D9646',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated bounceIn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleBackToMenu();
      }
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error al agregar proveedor',
      text: message || 'Hubo un error al procesar la solicitud',
      icon: 'error',
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: '#ef4444',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated shakeX'
      }
    });
  };

  const showLoadingAlert = () => {
    Swal.fire({
      title: 'Agregando proveedor...',
      text: 'Por favor espera mientras procesamos la información',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  // Manejo de cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Validación y formateo de teléfono
    if (name === 'phone' || name === 'contactoTelefono') {
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
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido";
    }
    // Teléfono ahora es opcional; valida solo si se ingresa
    if (formData.phone && formData.phone.replace(/\D/g, '').length !== 8) {
      newErrors.phone = "El teléfono debe tener exactamente 8 dígitos";
    }
    // partDescription ahora es opcional
    // Validaciones opcionales del contacto principal
    if (formData.contactoEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactoEmail)) {
      newErrors.contactoEmail = "El formato del email de contacto no es válido";
    }
    if (formData.contactoTelefono && formData.contactoTelefono.replace(/\D/g, '').length !== 0 && formData.contactoTelefono.replace(/\D/g, '').length !== 8) {
      newErrors.contactoTelefono = "El teléfono de contacto debe tener 8 dígitos";
    }

    return newErrors;
  };

  // Función para refrescar proveedores (placeholder)
  const refreshProveedores = async () => {
    try {
      console.log('Refrescando lista de proveedores...');
      // Aquí puedes agregar lógica para refrescar la lista
      // Por ejemplo, llamar a una API o disparar un evento
      
      // Si tienes acceso a un contexto global o estado compartido:
      // dispatch({ type: 'REFRESH_PROVEEDORES' });
      
      // O si tienes una función callback:
      // if (onRefresh && typeof onRefresh === 'function') {
      //   await onRefresh();
      // }
      
    } catch (error) {
      console.error('Error al refrescar proveedores:', error);
    }
  };

  // Función para continuar/navegar (alias de handleBackToMenu)
  const handleContinue = () => {
    handleBackToMenu();
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== INICIO DEL SUBMIT ===');

    const formErrors = validateForm();
    console.log('Errores de validación:', formErrors);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      console.log('Formulario tiene errores, no se envía');

      const camposFaltantes = Object.keys(formErrors).map(field => {
        const fieldNames = {
          companyName: 'Nombre de la empresa',
          email: 'Email',
          phone: 'Teléfono',
          contactoNombre: 'Nombre del contacto',
          contactoCargo: 'Cargo del contacto',
          contactoTelefono: 'Teléfono del contacto',
          contactoEmail: 'Email del contacto'
        };
        return fieldNames[field] || field;
      });

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
      return;
    }

    try {
      showLoadingAlert();
      setLoading(true);
      console.log('Estado de loading activado');

      const contactoPrincipal = {
        nombre: formData.contactoNombre.trim(),
        cargo: formData.contactoCargo.trim(),
        telefono: formData.contactoTelefono.trim(),
        email: formData.contactoEmail.trim()
      };

      const hasContacto = Object.values(contactoPrincipal).some((value) => value);

      const dataToSend = {
        companyName: formData.companyName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        partDescription: formData.partDescription.trim(),
        ...(hasContacto ? { contactoPrincipal } : {})
      };

      console.log('=== DATOS A ENVIAR ===');
      console.log('Datos completos:', dataToSend);

      console.log('=== ENVIANDO PETICIÓN ===');
      console.log('URL:', `${API_URL}/proveedores`);

      const response = await fetch(`${API_URL}/proveedores`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      console.log('=== RESPUESTA RECIBIDA ===');
      console.log('Status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);
        console.log('¡Proveedor creado exitosamente!');

        Swal.close();
        
        // Refrescar la lista de proveedores
        await refreshProveedores();
        
        showSuccessAlert();

        setFormData({
          companyName: '',
          email: '',
          phone: '',
          partDescription: '',
          contactoNombre: '',
          contactoCargo: '',
          contactoTelefono: '',
          contactoEmail: ''
        });
        setErrors({});
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      console.error('=== ERROR CAPTURADO ===');
      console.error('Error completo:', error);

      Swal.close();

      let errorMsg = 'Error desconocido';
      let errorTitle = '❌ Error al agregar proveedor';

      if (error.message.includes('HTTP error!')) {
        const statusCode = error.message.match(/\d+/);
        if (statusCode) {
          switch (parseInt(statusCode[0])) {
            case 400:
              errorTitle = '❌ Error de validación';
              errorMsg = 'Los datos enviados no son válidos. Verifica la información.';
              break;
            case 401:
              errorTitle = '🔒 No autorizado';
              errorMsg = 'No tienes permisos para realizar esta acción. Verifica tus credenciales.';
              break;
            case 403:
              errorTitle = '⛔ Acceso denegado';
              errorMsg = 'No tienes permisos suficientes para agregar proveedores.';
              break;
            case 404:
              errorTitle = '🔍 Servicio no encontrado';
              errorMsg = 'El servicio no está disponible. Contacta al administrador.';
              break;
            case 409:
              errorTitle = '⚠️ Conflicto de datos';
              errorMsg = 'Ya existe un proveedor con estos datos. Verifica el email o nombre de empresa.';
              break;
            case 500:
              errorTitle = '🔥 Error del servidor';
              errorMsg = 'Error interno del servidor. Inténtalo más tarde.';
              break;
            default:
              errorTitle = '❌ Error inesperado';
              errorMsg = `Error del servidor (${statusCode[0]}). Contacta al administrador.`;
          }
        } else {
          errorMsg = error.message;
        }
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorTitle = '🌐 Sin conexión';
        errorMsg = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        errorTitle = '⚙️ Error de configuración';
        errorMsg = 'Error al configurar la petición. Contacta al administrador.';
      }

      Swal.fire({
        title: errorTitle,
        text: errorMsg,
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#ef4444',
        allowOutsideClick: false,
        customClass: {
          popup: 'animated shakeX'
        }
      });

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

  // Retornar los valores y funciones necesarias
  return {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    handleBackToMenu,
    // Nuevas funciones que tu componente necesita:
    handleContinue,
    refreshProveedores
  };
};

export default useSupplierForm;