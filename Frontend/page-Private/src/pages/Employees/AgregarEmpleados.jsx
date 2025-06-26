import React, { useState } from 'react';
import { ArrowLeft, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const AddDriverForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    dui: '',
    fechaNacimiento: '',
    contraseña: '',
    telefono: '',
    direccion: ''
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
      fechaNacimiento: formatDate(date)
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatear teléfono: 1234-5678
    if (name === 'telefono') {
      // Remover todo excepto números
      const numbers = value.replace(/\D/g, '');
      // Agregar guión después de 4 dígitos
      if (numbers.length > 4) {
        formattedValue = numbers.slice(0, 4) + '-' + numbers.slice(4, 8);
      } else {
        formattedValue = numbers;
      }
    }

    // Formatear DUI: 12345678-9
    if (name === 'dui') {
      // Remover todo excepto números
      const numbers = value.replace(/\D/g, '');
      // Agregar guión después de 8 dígitos
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);
    // Aquí iría la lógica para enviar los datos
  };

  const handleBackToMenu = () => {
    // Simular navegación hacia atrás
    if (window.history.length > 1) {
      window.history.back();
    } else {
      console.log('Navegar a la página anterior');
      // En tu aplicación real, aquí puedes usar tu sistema de navegación
    }
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#375E27';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#d1d5db';
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

      {/* Main Content - Ocupa casi toda la pantalla */}
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
            >
              Agregar
            </button>
          </div>

          {/* Form */}
          <div className="space-y-8 max-w-6xl">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Introduce el nombre del empleado"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  placeholder="Introduce el apellido del empleado"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Introduce el camión asignado"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dui
                </label>
                <input
                  type="text"
                  name="dui"
                  value={formData.dui}
                  onChange={handleInputChange}
                  placeholder="Introduce el dui del empleado"
                  maxLength="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de nacimiento
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toLocaleDateString('es-ES') : ''}
                    readOnly
                    onClick={() => setShowCalendar(!showCalendar)}
                    placeholder="Selecciona la fecha de nacimiento"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400 pr-12 cursor-pointer"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <Calendar 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer" 
                    onClick={() => setShowCalendar(!showCalendar)}
                  />
                  
                  {/* Custom Calendar */}
                  {showCalendar && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-80">
                      {/* Calendar Header with Year Selector */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={() => navigateMonth(-1)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <select
                            value={currentDate.getMonth()}
                            onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                            className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer"
                          >
                            {months.map((month, index) => (
                              <option key={index} value={index}>{month}</option>
                            ))}
                          </select>
                          
                          <select
                            value={currentDate.getFullYear()}
                            onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                            className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer"
                          >
                            {Array.from({length: 100}, (_, i) => new Date().getFullYear() - 80 + i).map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => navigateMonth(1)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Days of Week */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {daysOfWeek.map(day => (
                          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentDate).map((date, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleDateSelect(date)}
                            className={`
                              p-2 text-sm rounded transition-all duration-200 hover:scale-105
                              ${!isCurrentMonth(date) 
                                ? 'text-gray-300 hover:bg-gray-50' 
                                : isSelected(date)
                                  ? 'text-white shadow-md transform scale-105'
                                  : isToday(date)
                                    ? 'bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200'
                                    : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                            style={isSelected(date) ? { backgroundColor: '#375E27' } : {}}
                          >
                            {date.getDate()}
                          </button>
                        ))}
                      </div>

                      {/* Calendar Footer */}
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowCalendar(false)}
                          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date();
                            handleDateSelect(today);
                          }}
                          className="text-sm font-medium text-white px-3 py-1 rounded transition-colors hover:opacity-90"
                          style={{ backgroundColor: '#375E27' }}
                        >
                          Hoy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleInputChange}
                  placeholder="Introduce la contraseña del empleado"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Introduce el teléfono del empleado"
                  maxLength="9"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Introduce la dirección del empleado"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-700 placeholder-gray-400 resize-none"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDriverForm;