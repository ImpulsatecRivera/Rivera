import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, ChevronLeft, ChevronRight, ChevronDown, Upload, X } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AddEmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '', // Solo para mostrar, no se envía al backend
    dui: '', // CAMBIO: usar 'dui' en lugar de 'id'
    birthDate: '',
    password: '',
    phone: '',
    address: '',
    img: null // Nuevo campo para la imagen
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Configuración personalizada de SweetAlert2
  const showSuccessAlert = () => {
    Swal.fire({
      title: '¡Empleado agregado con éxito!',
      text: 'Empleado agregado correctamente',
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#22c55e',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated bounceIn'
      }
    }).then((result) => {
      // Cuando el usuario hace clic en "Continuar"
      if (result.isConfirmed) {
        handleBackToMenu(); // Volver a la pantalla anterior
      }
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error al agregar empleado',
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
      title: 'Agregando empleado...',
      text: 'Por favor espera mientras procesamos la información',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const showValidationAlert = () => {
    Swal.fire({
      title: 'Formulario incompleto',
      text: 'Por favor, completa todos los campos obligatorios',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b',
      customClass: {
        popup: 'animated pulse'
      }
    });
  };

  // Generar email automáticamente cuando cambien nombre o apellido (solo para mostrar)
  useEffect(() => {
    if (formData.name && formData.lastName) {
      const emailGenerated = `${formData.name.toLowerCase()}.${formData.lastName.toLowerCase()}@rivera.com`;
      setFormData(prev => ({
        ...prev,
        email: emailGenerated
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        email: ''
      }));
    }
  }, [formData.name, formData.lastName]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      birthDate: formatDate(date)
    }));
    setShowCalendar(false);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const navigateYear = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(newDate.getFullYear() + direction);
      return newDate;
    });
  };

  // Manejar subida de imagen
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

      setFormData(prev => ({
        ...prev,
        img: file
      }));

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remover imagen
  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      img: null
    }));
    setImagePreview(null);
    
    // Limpiar el input file
    const fileInput = document.getElementById('img-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // No permitir editar el email ya que se genera automáticamente
    if (name === 'email') {
      return;
    }

    // Validación y formateo de teléfono
    if (name === 'phone') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length > 4) {
        formattedValue = numbers.slice(0, 4) + '-' + numbers.slice(4, 8);
      } else {
        formattedValue = numbers;
      }
    }

    // Validación y formateo de DUI (CAMBIO: usar 'dui' en lugar de 'id')
    if (name === 'dui') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length > 8) {
        formattedValue = numbers.slice(0, 8) + '-' + numbers.slice(8, 9);
      } else {
        formattedValue = numbers;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "El nombre es obligatorio";
    if (!formData.lastName) newErrors.lastName = "El apellido es obligatorio";
    if (!formData.dui) newErrors.dui = "El DUI es obligatorio";
    if (formData.dui && formData.dui.replace(/\D/g, '').length !== 9) {
      newErrors.dui = "El DUI debe tener exactamente 9 dígitos";
    }
    if (!formData.birthDate) newErrors.birthDate = "La fecha de nacimiento es obligatoria";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";
    if (!formData.phone) newErrors.phone = "El teléfono es obligatorio";
    if (formData.phone && formData.phone.replace(/\D/g, '').length !== 8) {
      newErrors.phone = "El teléfono debe tener exactamente 8 dígitos";
    }
    if (!formData.address) newErrors.address = "La dirección es obligatoria";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== INICIO DEL SUBMIT ===');
    
    const formErrors = validateForm();
    console.log('Errores de validación:', formErrors);
    setErrors(formErrors);

    // Si hay errores de validación, mostrar alerta específica
    if (Object.keys(formErrors).length > 0) {
      console.log('Formulario tiene errores, no se envía');
      
      // Crear lista de campos faltantes
      const camposFaltantes = Object.keys(formErrors).map(field => {
        const fieldNames = {
          name: 'Nombre',
          lastName: 'Apellido', 
          dui: 'DUI',
          birthDate: 'Fecha de nacimiento',
          password: 'Contraseña',
          phone: 'Teléfono',
          address: 'Dirección'
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

    // Si no hay errores de validación, proceder con el envío
    try {
      // Mostrar loading
      showLoadingAlert();
      setLoading(true);
      console.log('Estado de loading activado');
      
      // Crear FormData para enviar archivo
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('lastName', formData.lastName.trim());
      formDataToSend.append('dui', formData.dui.trim());
      formDataToSend.append('birthDate', formData.birthDate);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phone', formData.phone.trim());
      formDataToSend.append('address', formData.address.trim());
      
      // Agregar imagen si existe
      if (formData.img) {
        formDataToSend.append('img', formData.img);
      }

      console.log('=== DATOS A ENVIAR ===');
      console.log('Incluye imagen:', !!formData.img);
      
      console.log('=== ENVIANDO PETICIÓN ===');
      console.log('URL:', 'http://localhost:4000/api/empleados');
      
      // Llamada a la API con axios
      const response = await axios.post('http://localhost:4000/api/empleados', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // 10 segundos de timeout
      });
      
      console.log('=== RESPUESTA RECIBIDA ===');
      console.log('Status:', response.status);
      console.log('Respuesta del servidor:', response.data);
      
      // Si la respuesta es exitosa
      if (response.status === 200 || response.status === 201) {
        console.log('¡Empleado creado exitosamente!');
        
        // Cerrar loading y mostrar éxito
        Swal.close();
        showSuccessAlert();
        
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
          img: null
        });
        setSelectedDate(null);
        setImagePreview(null);
        setErrors({});
      }
      
    } catch (error) {
      console.error('=== ERROR CAPTURADO ===');
      console.error('Error completo:', error);
      console.log('Error response:', error.response);
      
      // Cerrar loading
      Swal.close();
      
      let errorMsg = 'Error desconocido';
      let errorTitle = '❌ Error al agregar empleado';
      
      // Manejo de diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un código de error
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Error del servidor';
        
        console.log('Status Code:', statusCode);
        console.log('Error Message:', errorMessage);
        console.log('Full Response Data:', error.response.data);
        
        switch (statusCode) {
          case 400:
            errorTitle = '❌ Error de validación';
            errorMsg = errorMessage;
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
        // La petición fue hecha pero no hubo respuesta
        console.error('No hubo respuesta del servidor');
        errorTitle = '🌐 Sin conexión';
        errorMsg = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        // Error en la configuración de la petición
        console.error('Error en la configuración:', error.message);
        errorTitle = '⚙️ Error de configuración';
        errorMsg = 'Error al configurar la petición. Contacta al administrador.';
      }
      
      // Mostrar error específico
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

  const handleBackToMenu = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      console.log('Navegar a la página anterior');
    }
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#375E27';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#d1d5db';
  };

  // Generar años para el selector
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  return (
    <div className="fixed inset-0 min-h-screen" style={{ backgroundColor: '#34353A' }}>
      {/* Header */}
      <div className="text-white px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4" style={{ backgroundColor: '#34353A' }}>
        <button 
          onClick={handleBackToMenu}
          className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm">Volver al menú principal</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8" style={{ height: 'calc(100vh - 60px)' }}>
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 h-full max-w-none mx-0 overflow-y-auto">
          {/* Title Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Agregar Empleado</h1>
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#34353A' }}>
                <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              className="text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors hover:opacity-90 w-full sm:w-auto"
              style={{ backgroundColor: '#375E27' }}
              disabled={loading}
            >
              Guardar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Nombre */}
            <div className="flex flex-col">
              <label htmlFor="name" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm">Nombre </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Ingrese el nombre"
                className={`border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <span className="text-red-600 text-xs mt-1">{errors.name}</span>}
            </div>

            {/* Apellido */}
            <div className="flex flex-col">
              <label htmlFor="lastName" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm">Apellido </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Ingrese el apellido"
                className={`border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.lastName && <span className="text-red-600 text-xs mt-1">{errors.lastName}</span>}
            </div>

            {/* Email - solo mostrar */}
            <div className="flex flex-col sm:col-span-2 lg:col-span-1">
              <label htmlFor="email" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm">Email (generado)</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                readOnly
                className="border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-gray-100 cursor-not-allowed border-gray-300"
              />
            </div>

            {/* DUI */}
            <div className="flex flex-col">
              <label htmlFor="dui" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm">DUI </label>
              <input
                id="dui"
                name="dui"
                type="text"
                value={formData.dui}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="00000000-0"
                maxLength={10}
                className={`border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.dui ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.dui && <span className="text-red-600 text-xs mt-1">{errors.dui}</span>}
            </div>

            {/* Fecha de Nacimiento */}
            <div className="relative flex flex-col">
              <label htmlFor="birthDate" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm">Fecha de Nacimiento </label>
              <input
                id="birthDate"
                name="birthDate"
                type="text"
                value={formData.birthDate}
                placeholder="YYYY-MM-DD"
                onFocus={() => setShowCalendar(true)}
                readOnly
                className={`border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.birthDate && <span className="text-red-600 text-xs mt-1">{errors.birthDate}</span>}

              {/* Calendario */}
              {showCalendar && (
                <div className="absolute z-10 bg-white rounded-md shadow-lg mt-2 p-3 w-64 sm:w-72 md:w-80 top-full">
                  {/* Selector de año */}
                  <div className="flex justify-between items-center mb-2">
                    <button
                      type="button"
                      onClick={() => navigateYear(-1)}
                      className="p-1 hover:bg-gray-200 rounded"
                      aria-label="Año anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowYearSelector(!showYearSelector)}
                      className="font-semibold text-gray-700 text-sm"
                    >
                      {currentDate.getFullYear()}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateYear(1)}
                      className="p-1 hover:bg-gray-200 rounded"
                      aria-label="Año siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Selector de mes */}
                  <div className="flex justify-between items-center mb-2">
                    <button
                      type="button"
                      onClick={() => navigateMonth(-1)}
                      className="p-1 hover:bg-gray-200 rounded"
                      aria-label="Mes anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-gray-700 text-sm">{months[currentDate.getMonth()]}</span>
                    <button
                      type="button"
                      onClick={() => navigateMonth(1)}
                      className="p-1 hover:bg-gray-200 rounded"
                      aria-label="Mes siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Lista de años (cuando se muestra selector) */}
                  {showYearSelector && (
                    <div className="max-h-32 sm:max-h-40 overflow-y-auto mb-2 border rounded p-1">
                      {generateYears().map(year => (
                        <button
                          key={year}
                          type="button"
                          className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-200 text-sm ${
                            year === currentDate.getFullYear() ? 'bg-green-600 text-white' : 'text-gray-700'
                          }`}
                          onClick={() => {
                            setCurrentDate(new Date(year, currentDate.getMonth(), 1));
                            setShowYearSelector(false);
                          }}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1 text-xs font-semibold text-gray-600">
                    {daysOfWeek.map(day => (
                      <div key={day}>{day}</div>
                    ))}
                  </div>

                  {/* Días del mes */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm">
                    {getDaysInMonth(currentDate).map((date, index) => {
                      const isCurrent = isCurrentMonth(date);
                      const isSelectedDay = isSelected(date);
                      const today = isToday(date);

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDateSelect(date)}
                          className={`py-1 rounded hover:bg-green-100 focus:outline-none ${
                            isSelectedDay ? 'bg-green-600 text-white' :
                            today ? 'border border-green-600 text-green-600' :
                            isCurrent ? 'text-gray-800' : 'text-gray-400'
                          }`}
                          disabled={!isCurrent}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCalendar(false)}
                    className="mt-2 w-full py-1 text-xs sm:text-sm text-center text-red-600 hover:text-red-800"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>

            {/* Contraseña */}
            <div className="flex flex-col sm:col-span-2 lg:col-span-1">
              <label htmlFor="password" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm">Contraseña </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Ingrese una contraseña"
                className={`border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.password && <span className="text-red-600 text-xs mt-1">{errors.password}</span>}
            </div>

            {/* Teléfono */}
            <div className="flex flex-col">
              <label htmlFor="phone" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm">Teléfono </label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="0000-0000"
                maxLength={9}
                className={`border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.phone && <span className="text-red-600 text-xs mt-1">{errors.phone}</span>}
            </div>

            {/* Dirección */}
            <div className="flex flex-col sm:col-span-2 lg:col-span-2">
              <label htmlFor="address" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm">Dirección </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Ingrese la dirección completa"
                rows={3}
                className={`border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.address && <span className="text-red-600 text-xs mt-1">{errors.address}</span>}
            </div>

            {/* Imagen */}
            <div className="flex flex-col sm:col-span-2 lg:col-span-3">
              <label className="mb-2 font-semibold text-gray-700 text-sm">Foto de perfil (opcional)</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {imagePreview ? (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-gray-300 flex-shrink-0">
                    <img src={imagePreview} alt="Previsualización" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 focus:outline-none"
                      aria-label="Eliminar imagen"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="img-input"
                    className="flex items-center justify-center cursor-pointer w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 border border-dashed border-gray-300 hover:bg-gray-200 transition-colors flex-shrink-0"
                  >
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    <input
                      id="img-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Sube una foto de perfil (opcional)
                  </p>
                  <p className="text-xs text-gray-500">
                    Formatos: JPG, PNG, GIF. Máximo: 5MB
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeForm;