import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const AddMotoristaForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '', // Solo para mostrar, no se envía al backend
    id: '', // Campo DUI según el modelo
    birthDate: '',
    password: '',
    phone: '',
    address: '',
    circulationCard: '' // Tarjeta de circulación según el modelo
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

  // Generar email automáticamente cuando cambien nombre o apellido
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

    // Validación y formateo de DUI
    if (name === 'id') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length > 8) {
        formattedValue = numbers.slice(0, 8) + '-' + numbers.slice(8, 9);
      } else {
        formattedValue = numbers;
      }
    }

    // Validación y formateo de tarjeta de circulación
    if (name === 'circulationCard') {
      // Permitir letras, números y guiones, eliminar caracteres especiales
      formattedValue = value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
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
    if (!formData.id) newErrors.id = "El DUI es obligatorio";
    if (formData.id && formData.id.replace(/\D/g, '').length !== 9) {
      newErrors.id = "El DUI debe tener exactamente 9 dígitos";
    }
    if (!formData.birthDate) newErrors.birthDate = "La fecha de nacimiento es obligatoria";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";
    if (!formData.phone) newErrors.phone = "El teléfono es obligatorio";
    if (formData.phone && formData.phone.replace(/\D/g, '').length !== 8) {
      newErrors.phone = "El teléfono debe tener exactamente 8 dígitos";
    }
    if (!formData.address) newErrors.address = "La dirección es obligatoria";
    if (!formData.circulationCard) newErrors.circulationCard = "La tarjeta de circulación es obligatoria";
    if (formData.circulationCard && formData.circulationCard.length < 3) {
      newErrors.circulationCard = "La tarjeta de circulación debe tener al menos 3 caracteres";
    }

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
          id: formData.id.trim(), // DUI según el modelo
          birthDate: formData.birthDate,
          password: formData.password,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          circulationCard: formData.circulationCard.trim() // Tarjeta de circulación
        };

        console.log('=== DATOS A ENVIAR ===');
        console.log('Datos completos:', dataToSend);
        
        // Verificar que todos los campos estén presentes
        const camposVacios = Object.entries(dataToSend).filter(([key, value]) => !value);
        if (camposVacios.length > 0) {
          console.error('Campos vacíos detectados:', camposVacios);
          alert('Todos los campos son obligatorios');
          setLoading(false);
          return;
        }

        console.log('=== ENVIANDO PETICIÓN ===');
        console.log('URL:', 'http://localhost:4000/api/motoristas');
        
        // Llamada a la API con fetch
        const response = await fetch('http://localhost:4000/api/motoristas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
        
        console.log('=== RESPUESTA RECIBIDA ===');
        console.log('Status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);
        
        console.log('¡Motorista creado exitosamente!');
        alert('¡Motorista agregado exitosamente!');
        
        // Limpiar formulario
        setFormData({
          name: '',
          lastName: '',
          email: '',
          id: '',
          birthDate: '',
          password: '',
          phone: '',
          address: '',
          circulationCard: ''
        });
        setSelectedDate(null);
        setErrors({});
        
      } catch (error) {
        console.error('=== ERROR CAPTURADO ===');
        console.error('Error completo:', error);
        
        // Manejo de diferentes tipos de errores
        if (error.message.includes('HTTP error!')) {
          const statusCode = error.message.match(/\d+/);
          if (statusCode) {
            switch (parseInt(statusCode[0])) {
              case 400:
                alert(`Error de validación: ${error.message}`);
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
                alert(`Conflicto: ${error.message}`);
                break;
              case 500:
                alert(`Error interno del servidor: ${error.message}`);
                break;
              default:
                alert(`Error del servidor: ${error.message}`);
            }
          } else {
            alert(`Error: ${error.message}`);
          }
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          alert('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          alert('Error al agregar el motorista. Contacta al administrador.');
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
              <h1 className="text-2xl font-bold text-gray-900">Agregar Motorista</h1>
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
          <div>
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
                    placeholder="Introduce el nombre del motorista"
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
                    placeholder="Introduce el apellido del motorista"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    readOnly
                    placeholder="Introduce el camion asignado"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dui</label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="Introduce el dui del motorista"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
                  <div
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer flex items-center justify-between"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <span className="text-gray-400">{formData.birthDate ? formData.birthDate : 'Selecciona la fecha de nacimiento'}</span>
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
                    placeholder="Introduce la contraseña del motorista"
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
                    placeholder="Introduce el teléfono del motorista"
                    maxLength="9"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Introduce la dirección del motorista"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400 resize-none"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarjeta de circulación</label>
                  <input
                    type="text"
                    name="circulationCard"
                    value={formData.circulationCard}
                    onChange={handleInputChange}
                    placeholder="Ej: ABC123-DEF o 123456-ABC"
                    maxLength="15"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.circulationCard && <p className="text-red-500 text-xs mt-1">{errors.circulationCard}</p>}
                  <p className="text-xs text-gray-500 mt-1">Puede contener letras, números y guiones</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMotoristaForm;