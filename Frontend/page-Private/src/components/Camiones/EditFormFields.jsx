import React from 'react';
import { ChevronDown, Building, User, Truck, Calendar, FileText, CreditCard, AlertCircle } from 'lucide-react';

const EditFormFields = ({
  formData,
  proveedores = [],
  motoristas = [],
  onInputChange,
  disabled = false
}) => {
  // Debug: ver qué datos recibe el componente
  console.log('=== EditFormFields RECIBIENDO ===');
  console.log('formData completo:', formData);
  console.log('formData.nombre:', formData?.nombre);
  console.log('formData.placa:', formData?.placa);
  console.log('formData.marca:', formData?.marca);
  console.log('formData.modelo:', formData?.modelo);
  console.log('proveedores count:', proveedores?.length);
  console.log('motoristas count:', motoristas?.length);
  
  const inputClassName = `w-full p-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] transition-all duration-200 ${
    disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
  }`;
  
  const labelClassName = "flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2";

  const handleChange = (field, value) => {
    if (!disabled && onInputChange) {
      onInputChange(field, value);
    }
  };

  // Validación de longitud de campos
  const getCharCount = (value, maxLength) => {
    if (!maxLength) return null;
    const count = value ? value.length : 0;
    const isNearLimit = count > maxLength * 0.8;
    return (
      <span className={`text-xs ${isNearLimit ? 'text-orange-500' : 'text-gray-400'}`}>
        {count}/{maxLength}
      </span>
    );
  };

  // Estados disponibles con sus colores
  const estadosDisponibles = [
    { 
      value: 'DISPONIBLE', 
      label: 'Disponible', 
      color: 'bg-green-100 text-green-700 border-green-300',
      dotColor: 'bg-green-500',
      icon: '✓'
    },
    { 
      value: 'EN RUTA', 
      label: 'En Ruta', 
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      dotColor: 'bg-blue-500',
      icon: '→'
    },
    { 
      value: 'MANTENIMIENTO', 
      label: 'Mantenimiento', 
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      dotColor: 'bg-yellow-500',
      icon: '⚙'
    },
    { 
      value: 'NO DISPONIBLE', 
      label: 'No disponible', 
      color: 'bg-red-100 text-red-700 border-red-300',
      dotColor: 'bg-red-500',
      icon: '✕'
    }
  ];

  // Obtener el estado seleccionado
  const estadoSeleccionado = estadosDisponibles.find(
    e => e.value === formData.estado || e.value.toLowerCase().replace(/\s+/g, '_') === formData.estado?.toLowerCase()
  ) || estadosDisponibles[0];

  return (
    <div className="grid grid-cols-2 gap-6">
      
      {/* Nombre del camión */}
      <div className="col-span-2">
        <label className={labelClassName}>
          <Truck className="w-4 h-4 text-[#5F8EAD]" />
          <span>Nombre del camión *</span>
        </label>
        <input
          type="text"
          value={formData.nombre || ''}
          onChange={(e) => handleChange('nombre', e.target.value)}
          className={inputClassName}
          placeholder="Introduce el nombre del camión"
          disabled={disabled}
          maxLength={50}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Campo obligatorio</span>
          {getCharCount(formData.nombre, 50)}
        </div>
      </div>

      {/* Fecha de vencimiento de tarjeta de circulación */}
      <div>
        <label className={labelClassName}>
          <Calendar className="w-4 h-4 text-[#5F8EAD]" />
          <span>Fecha vencimiento tarjeta</span>
        </label>
        <input
          type="date"
          value={formData.tarjetaCirculacion || ''}
          onChange={(e) => handleChange('tarjetaCirculacion', e.target.value)}
          className={inputClassName}
          disabled={disabled}
        />
      </div>

      {/* Placa */}
      <div>
        <label className={labelClassName}>
          <FileText className="w-4 h-4 text-[#5F8EAD]" />
          <span>Placa *</span>
        </label>
        <input
          type="text"
          value={formData.placa || ''}
          onChange={(e) => handleChange('placa', e.target.value.toUpperCase())}
          className={inputClassName}
          placeholder="ABC-123"
          disabled={disabled}
          maxLength={9}
          style={{ textTransform: 'uppercase' }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Campo obligatorio</span>
          {getCharCount(formData.placa, 9)}
        </div>
      </div>

      {/* Marca */}
      <div>
        <label className={labelClassName}>
          <Building className="w-4 h-4 text-[#5F8EAD]" />
          <span>Marca</span>
        </label>
        <input
          type="text"
          value={formData.marca || ''}
          onChange={(e) => handleChange('marca', e.target.value)}
          className={inputClassName}
          placeholder="Ford, Chevrolet, etc."
          disabled={disabled}
          maxLength={30}
        />
        {getCharCount(formData.marca, 30) && (
          <div className="flex justify-end mt-1">
            {getCharCount(formData.marca, 30)}
          </div>
        )}
      </div>

      {/* Modelo */}
      <div>
        <label className={labelClassName}>
          <Truck className="w-4 h-4 text-[#5F8EAD]" />
          <span>Modelo</span>
        </label>
        <input
          type="text"
          value={formData.modelo || ''}
          onChange={(e) => handleChange('modelo', e.target.value)}
          className={inputClassName}
          placeholder="F-150, Silverado, etc."
          disabled={disabled}
          maxLength={30}
        />
        {getCharCount(formData.modelo, 30) && (
          <div className="flex justify-end mt-1">
            {getCharCount(formData.modelo, 30)}
          </div>
        )}
      </div>

      {/* Año */}
      <div>
        <label className={labelClassName}>
          <Calendar className="w-4 h-4 text-[#5F8EAD]" />
          <span>Año</span>
        </label>
        <input
          type="number"
          value={formData.año || ''}
          onChange={(e) => handleChange('año', e.target.value)}
          className={inputClassName}
          placeholder="2020"
          disabled={disabled}
          min="1900"
          max="2030"
        />
        <span className="text-xs text-gray-500 mt-1 block">
          Año de fabricación (1900-2030)
        </span>
      </div>

      {/* NUEVO: Estado del camión */}
      <div>
        <label className={labelClassName}>
          <AlertCircle className="w-4 h-4 text-[#5F8EAD]" />
          <span>Estado del camión *</span>
        </label>
        <div className="relative">
          <select
            value={formData.estado || 'DISPONIBLE'}
            onChange={(e) => handleChange('estado', e.target.value)}
            className={`${inputClassName} appearance-none pr-10 font-medium cursor-pointer`}
            disabled={disabled}
          >
            {estadosDisponibles.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-4 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        
        <span className="text-xs text-gray-500 mt-1 block">
          Indica el estado operativo actual del vehículo
        </span>
      </div>

      {/* Proveedor */}
      <div>
        <label className={labelClassName}>
          <Building className="w-4 h-4 text-[#5F8EAD]" />
          <span>Proveedor</span>
        </label>
        <div className="relative">
          <select
            value={formData.proveedor || ''}
            onChange={(e) => handleChange('proveedor', e.target.value)}
            className={`${inputClassName} appearance-none pr-10`}
            disabled={disabled}
          >
            <option value="">Seleccionar proveedor</option>
            {proveedores.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>
                {p.companyName || p.name || 'Proveedor sin nombre'}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-4 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        {proveedores.length === 0 && (
          <span className="text-xs text-orange-500 mt-1 block">
            No hay proveedores disponibles
          </span>
        )}
      </div>

      {/* Motorista */}
      <div>
        <label className={labelClassName}>
          <User className="w-4 h-4 text-[#5F8EAD]" />
          <span>Motorista</span>
        </label>
        <div className="relative">
          <select
            value={formData.motorista || ''}
            onChange={(e) => handleChange('motorista', e.target.value)}
            className={`${inputClassName} appearance-none pr-10`}
            disabled={disabled}
          >
            <option value="">Seleccionar motorista</option>
            {motoristas
              .filter(m => m.rol === 'motorista') // ✅ FILTRAR: Solo motoristas, excluir auxiliares
              .map((m) => {
              const motoristaNombre = `${m.name || m.firstName || ''} ${m.lastName || m.apellido || ''}`.trim() || 'Motorista sin nombre';
              const motoristaId = m._id || m.id;
              
              // Determinar el texto a mostrar basado en el estado
              let displayText = motoristaNombre;
              if (m.isCurrentDriver) {
                displayText = `✓ ${motoristaNombre} (Asignado actualmente)`;
              } else if (m.isAsignado && m.asignacionInfo) {
                displayText = `${motoristaNombre} (Asignado a: ${m.asignacionInfo.camionNombre})`;
              }
              
              return (
                <option 
                  key={motoristaId} 
                  value={motoristaId}
                  style={{
                    backgroundColor: m.isCurrentDriver ? '#dbeafe' : (m.isAsignado ? '#fef3c7' : 'white'),
                    fontWeight: m.isCurrentDriver ? 'bold' : 'normal',
                    color: m.isCurrentDriver ? '#1e40af' : (m.isAsignado ? '#92400e' : 'inherit')
                  }}
                >
                  {displayText}
                </option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-4 top-4 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        {motoristas.length === 0 ? (
          <span className="text-xs text-orange-500 mt-1 block">
            No hay motoristas disponibles
          </span>
        ) : (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">✓ Azul:</span> Motorista asignado a este camión
              {motoristas.some(m => m.isAsignado) && (
                <> • <span className="font-semibold text-yellow-700">⚠ Amarillo:</span> Asignado a otro camión</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Descripción */}
      <div className="col-span-2">
        <label className={labelClassName}>
          <FileText className="w-4 h-4 text-[#5F8EAD]" />
          <span>Descripción</span>
        </label>
        <textarea
          value={formData.descripcion || ''}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          className={`${inputClassName} h-24 resize-none`}
          placeholder="Descripción adicional del camión, características especiales, etc."
          disabled={disabled}
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Información adicional sobre el camión</span>
          {getCharCount(formData.descripcion, 500)}
        </div>
      </div>

      {/* Información adicional */}
      <div className="col-span-2 mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <FileText className="w-4 h-4 mr-2 text-[#5F8EAD]" />
          Información del formulario
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <p className="font-medium mb-1">Campos obligatorios:</p>
            <ul className="space-y-1">
              <li>• Nombre del camión</li>
              <li>• Placa del vehículo</li>
              <li>• Estado del camión</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Validaciones:</p>
            <ul className="space-y-1">
              <li>• La placa se convierte automáticamente a mayúsculas</li>
              <li>• El año debe estar entre 1900 y 2030</li>
              <li>• Los campos tienen límite de caracteres</li>
              <li>• El estado determina la disponibilidad del vehículo</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

    </div>
  );
};

export default EditFormFields;