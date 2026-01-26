import React from 'react';
import { User } from 'lucide-react';
import FormFieldInput from '../../components/UICamiones/FieldInputAgregar';

const AssignmentFields = ({ register, errors, motoristasDisponibles, proveedoresDisponibles }) => {
  // Preparar opciones para motoristas - FILTRAR: Solo motoristas, excluir auxiliares
  const motoristaOptions = (motoristasDisponibles || [])
    .filter(driver => driver.rol === 'motorista') // ✅ FILTRAR POR ROL
    .map(driver => ({
    value: driver._id,
    label: `${driver.name} ${driver.lastName}`
  }));

  // Preparar opciones para proveedores
  const proveedorOptions = (proveedoresDisponibles || []).map(proveedor => ({
    value: proveedor._id,
    label: proveedor.companyName
  }));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Asignación
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Motorista */}
        <FormFieldInput
          id="driverId"
          label="Motorista Asignado"
          icon={User}
          type="select"
          placeholder="Seleccionar motorista"
          options={motoristaOptions}
          {...register("driverId")}
          error={errors.driverId}
        />
        
        {/* Mensaje cuando no hay motoristas */}
        {motoristasDisponibles.length === 0 && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ No hay motoristas disponibles.
            </p>
            <p className="text-xs text-yellow-500 mt-1">
              Puedes agregar el camión sin motorista y asignarlo después.
            </p>
          </div>
        )}
        
        {/* Contador */}
        <p className="text-xs text-gray-500 -mt-2">
          {motoristasDisponibles.length} motorista{motoristasDisponibles.length !== 1 ? 's' : ''} disponible{motoristasDisponibles.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default AssignmentFields;