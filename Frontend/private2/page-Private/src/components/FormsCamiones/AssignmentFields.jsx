import React from 'react';
import { User, Building } from 'lucide-react';
import FormFieldInput from '../../components/UICamiones/FieldInputAgregar';

const AssignmentFields = ({ register, errors, motoristasDisponibles, proveedoresDisponibles }) => {
  // Preparar opciones para motoristas
  const motoristaOptions = (motoristasDisponibles || []).map(driver => ({
    value: driver._id,
    label: `${driver.name} ${driver.lastName}`
  }));

  // Preparar opciones para proveedores
  const proveedorOptions = (proveedoresDisponibles || []).map(proveedor => ({
    value: proveedor._id,
    label: proveedor.companyName
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Motorista */}
      <FormFieldInput
        id="driverId"
        label="Motorista"
        icon={User}
        type="select"
        placeholder="Seleccionar motorista"
        options={motoristaOptions}
        {...register("driverId", { required: true })}
        error={errors.driverId}
        required
      />

      {/* Proveedor */}
      <FormFieldInput
        id="supplierId"
        label="Proveedor"
        icon={Building}
        type="select"
        placeholder="Seleccionar proveedor"
        options={proveedorOptions}
        {...register("supplierId", { required: true })}
        error={errors.supplierId}
        required
      />
    </div>
  );
};

export default AssignmentFields;