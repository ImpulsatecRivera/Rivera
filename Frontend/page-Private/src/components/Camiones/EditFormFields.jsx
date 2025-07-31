import React from 'react';
import { ChevronDown, Building, User, Truck, Calendar, FileText, CreditCard } from 'lucide-react';

const EditFormFields = ({
  formData,
  proveedores = [],
  motoristas = [],
  onInputChange,
  disabled = false
}) => {
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

      {/* Tarjeta de circulación */}
      <div>
        <label className={labelClassName}>
          <CreditCard className="w-4 h-4 text-[#5F8EAD]" />
          <span>Tarjeta de circulación</span>
        </label>
        <input
          type="text"
          value={formData.tarjetaCirculacion || ''}
          onChange={(e) => handleChange('tarjetaCirculacion', e.target.value)}
          className={inputClassName}
          placeholder="Número de tarjeta"
          disabled={disabled}
          maxLength={20}
        />
        {getCharCount(formData.tarjetaCirculacion, 20) && (
          <div className="flex justify-end mt-1">
            {getCharCount(formData.tarjetaCirculacion, 20)}
          </div>
        )}
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
          maxLength={10}
          style={{ textTransform: 'uppercase' }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Campo obligatorio</span>
          {getCharCount(formData.placa, 10)}
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
            {motoristas.map((m) => (
              <option key={m._id || m.id} value={m._id || m.id}>
                {`${m.name || m.firstName || ''} ${m.lastName || m.apellido || ''}`.trim() || 'Motorista sin nombre'}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-4 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        {motoristas.length === 0 && (
          <span className="text-xs text-orange-500 mt-1 block">
            No hay motoristas disponibles
          </span>
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
      <div className="col-span-2 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
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
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Validaciones:</p>
            <ul className="space-y-1">
              <li>• La placa se convierte automáticamente a mayúsculas</li>
              <li>• El año debe estar entre 1900 y 2030</li>
              <li>• Los campos tienen límite de caracteres</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EditFormFields;