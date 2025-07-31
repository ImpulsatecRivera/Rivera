import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Cake } from 'lucide-react';

const DatePicker = ({ 
  id, 
  name, 
  value, 
  onChange, 
  label, 
  required = false, 
  error,
  placeholder = "Seleccionar fecha"
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showYearSelector, setShowYearSelector] = useState(false);

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
    const formattedDate = formatDate(date);
    onChange({
      target: {
        name: name,
        value: formattedDate
      }
    });
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

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  const handleFocus = (e) => {
    setShowCalendar(true);
    if (!error) {
      e.target.style.borderColor = '#5D9646';
      e.target.style.boxShadow = '0 0 0 4px #5D964640';
    }
  };

  const handleBlur = (e) => {
    if (!error) {
      e.target.style.borderColor = '#d1d5db';
      e.target.style.boxShadow = 'none';
    }
  };

  return (
    <div className="relative space-y-2">
      <label htmlFor={id} className="flex items-center space-x-2 text-sm font-semibold" style={{ color: '#34353A' }}>
        <Cake className="w-4 h-4" style={{ color: '#5D9646' }} />
        <span>{label} {required && '*'}</span>
      </label>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        placeholder={placeholder}
        readOnly
        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 ${
          error
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {error && (
        <p className="text-red-500 text-xs flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}

      {/* Calendario */}
      {showCalendar && (
        <div className="absolute z-50 bg-white rounded-xl sm:rounded-2xl shadow-2xl border mt-2 p-4 sm:p-6 w-72 sm:w-80" style={{ borderColor: '#5F8EAD' }}>
          {/* Selector de año */}
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => navigateYear(-1)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#5D9646' }} />
            </button>
            <button
              type="button"
              onClick={() => setShowYearSelector(!showYearSelector)}
              className="font-bold transition-colors hover:opacity-75"
              style={{ color: '#34353A' }}
            >
              {currentDate.getFullYear()}
            </button>
            <button
              type="button"
              onClick={() => navigateYear(1)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#5D9646' }} />
            </button>
          </div>

          {/* Selector de mes */}
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#5D9646' }} />
            </button>
            <span className="font-bold" style={{ color: '#34353A' }}>{months[currentDate.getMonth()]}</span>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#5D9646' }} />
            </button>
          </div>

          {/* Lista de años */}
          {showYearSelector && (
            <div className="max-h-40 overflow-y-auto mb-4 border rounded-lg p-2 bg-gray-50">
              {generateYears().map(year => (
                <button
                  key={year}
                  type="button"
                  className={`block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors ${
                    year === currentDate.getFullYear() ? 'text-white' : ''
                  }`}
                  style={year === currentDate.getFullYear() ? { backgroundColor: '#5D9646', color: 'white' } : { color: '#34353A' }}
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
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-xs font-semibold py-2" style={{ color: '#5D9646' }}>{day}</div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {getDaysInMonth(currentDate).map((date, index) => {
              const isCurrent = isCurrentMonth(date);
              const isSelectedDay = isSelected(date);
              const today = isToday(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={`py-2 rounded-lg transition-all duration-200 ${
                    isSelectedDay ? 'text-white shadow-lg' :
                    today ? 'font-bold border-2' :
                    isCurrent ? 'hover:bg-gray-200' : 'text-gray-400'
                  }`}
                  style={
                    isSelectedDay ? { backgroundColor: '#5D9646' } :
                    today ? { borderColor: '#5D9646', color: '#5D9646' } :
                    isCurrent ? { color: '#34353A' } : {}
                  }
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
            className="mt-4 w-full py-2 text-sm text-center text-red-600 hover:text-red-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default DatePicker;