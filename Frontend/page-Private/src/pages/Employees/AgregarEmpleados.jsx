import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';

const AddEmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '', // Solo para mostrar, no se envía al backend
    dui: '', // CAMBIO: usar 'dui' en lugar de 'id'
    birthDate: '',
    password: '',
    phone: '',
    address: ''
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
    if (!formData.dui) newErrors.dui = "El DUI es obligatorio"; // CAMBIO: usar 'dui'
    if (formData.dui && formData.dui.replace(/\D/g, '').length !== 9) {
      newErrors.dui = "El DUI debe tener exactamente 9 dígitos"; // CAMBIO: usar 'dui'
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

    if (Object.keys(formErrors).length === 0) {
      try {
        setLoading(true);
        console.log('Estado de loading activado');
        
        // Preparar los datos para enviar (sin email, se genera en el backend)
        const dataToSend = {
          name: formData.name.trim(),
          lastName: formData.lastName.trim(),
          dui: formData.dui.trim(), // CAMBIO: usar formData.dui directamente
          birthDate: formData.birthDate,
          password: formData.password,
          phone: formData.phone.trim(),
          address: formData.address.trim()
        };

        console.log('=== DATOS A ENVIAR ===');
        console.log('Datos completos:', dataToSend);
        console.log('DUI específicamente:', dataToSend.dui);
        console.log('Fecha de nacimiento:', dataToSend.birthDate);
        
        // Verificar que todos los campos estén presentes
        const camposVacios = Object.entries(dataToSend).filter(([key, value]) => !value);
        if (camposVacios.length > 0) {
          console.error('Campos vacíos detectados:', camposVacios);
          alert('Todos los campos son obligatorios');
          setLoading(false);
          return;
        }

        console.log('=== ENVIANDO PETICIÓN ===');
        console.log('URL:', 'http://localhost:4000/api/empleados');
        
        // Llamada a la API con axios
        const response = await axios.post('http://localhost:4000/api/empleados', dataToSend, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 segundos de timeout
        });
        
        console.log('=== RESPUESTA RECIBIDA ===');
        console.log('Status:', response.status);
        console.log('Respuesta del servidor:', response.data);
        
        // Si la respuesta es exitosa
        if (response.status === 200 || response.status === 201) {
          console.log('¡Empleado creado exitosamente!');
          alert('¡Empleado agregado exitosamente!');
          
          // Limpiar formulario
          setFormData({
            name: '',
            lastName: '',
            email: '',
            dui: '', // CAMBIO: usar 'dui'
            birthDate: '',
            password: '',
            phone: '',
            address: ''
          });
          setSelectedDate(null);
          setErrors({});
        }
        
      } catch (error) {
        console.error('=== ERROR CAPTURADO ===');
        console.error('Error completo:', error);
        console.log('Error response:', error.response);
        
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
              alert(`Error de validación: ${errorMessage}`);
              break;
            case 401:
              alert('No autorizado. Verifica tus credenciales.');
              break;
            case 403:
              alert('No tienes permisos para realizar esta acción.');
              break;
            case 404:
              alert('Endpoint no encontrado. Verifica la URL de la API.');
              break;
            case 409:
              alert(`Conflicto: ${errorMessage}`);
              break;
            case 500:
              alert(`Error interno del servidor: ${errorMessage}`);
              break;
            default:
              alert(`Error del servidor: ${errorMessage}`);
          }
        } else if (error.request) {
          // La petición fue hecha pero no hubo respuesta
          console.error('No hubo respuesta del servidor');
          console.error('Request:', error.request);
          alert('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          // Error en la configuración de la petición
          console.error('Error en la configuración:', error.message);
          alert('Error al configurar la petición. Contacta al administrador.');
        }
      } finally {
        console.log('=== FINALIZANDO ===');
        setLoading(false);
      }
    } else {
      console.log('Formulario tiene errores, no se envía');
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
      <div className="text-white px-8 py-4" style={{ backgroundColor: '#34353A' }}>
        <button 
          onClick={handleBackToMenu}
          className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Volver al menú principal</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-8" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="bg-white rounded-2xl p-8 h-full max-w-none mx-0">
          {/* Title Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Agregar Empleado</h1>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#34353A' }}>
                <User className="w-7 h-7 text-white" />
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              className="text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#375E27' }}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Agregar'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-8 max-w-6xl">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Introduce el nombre del empleado"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Introduce el apellido del empleado"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DUI</label>
                  <input
                    type="text"
                    name="dui"
                    value={formData.dui}
                    onChange={handleInputChange}
                    placeholder="12345678-9"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.dui && <p className="text-red-500 text-xs mt-1">{errors.dui}</p>}
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (generado automáticamente)
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    readOnly
                    placeholder="Se generará automáticamente"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">El email se genera automáticamente basado en el nombre y apellido</p>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                  <div
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer flex items-center justify-between"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <span>{formData.birthDate ? formData.birthDate : 'Selecciona una fecha'}</span>
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  {showCalendar && (
                    <div className="absolute mt-2 z-50 p-4 bg-white shadow-xl rounded-lg border">
                      {/* Header del calendario */}
                      <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold">
                            {months[currentDate.getMonth()]}
                          </span>
                          <div className="relative">
                            <button 
                              type="button"
                              onClick={() => setShowYearSelector(!showYearSelector)}
                              className="flex items-center space-x-1 text-sm font-semibold hover:bg-gray-100 px-2 py-1 rounded"
                            >
                              <span>{currentDate.getFullYear()}</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            
                            {showYearSelector && (
                              <div className="absolute top-full left-0 mt-1 bg-white border shadow-lg rounded max-h-40 overflow-y-auto z-60">
                                {generateYears().map(year => (
                                  <button
                                    key={year}
                                    type="button"
                                    onClick={() => {
                                      setCurrentDate(prev => {
                                        const newDate = new Date(prev);
                                        newDate.setFullYear(year);
                                        return newDate;
                                      });
                                      setShowYearSelector(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                  >
                                    {year}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button type="button" onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100 rounded">
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                      
                      {/* Días de la semana */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="text-xs text-center font-semibold text-gray-600 py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* Días del mes */}
                      <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentDate).map((day, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => isCurrentMonth(day) && handleDateSelect(day)}
                            disabled={!isCurrentMonth(day)}
                            className={`
                              text-xs text-center py-2 rounded-full transition-colors
                              ${!isCurrentMonth(day) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                              ${isToday(day) ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                              ${isSelected(day) ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                            `}
                          >
                            {day.getDate()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Introduce la contraseña"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="1234-5678"
                    maxLength="9"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Introduce la dirección"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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