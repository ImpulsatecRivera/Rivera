import React from 'react';
import { Building, Car, Calendar } from 'lucide-react';
import FormFieldInput from '../../components/UICamiones/FieldInputAgregar';

const VehicleDetailsFields = ({ register, errors }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Marca */}
      <FormFieldInput
        id="brand"
        label="Marca"
        icon={Building}
        placeholder="Marca del camión"
        {...register("brand")}
        error={errors.brand}
      />

      {/* Modelo */}
      <FormFieldInput
        id="model"
        label="Modelo"
        icon={Car}
        placeholder="Modelo del camión"
        {...register("model")}
        error={errors.model}
      />

      {/* Año */}
      <FormFieldInput
        id="age"
        label="Año"
        icon={Calendar}
        type="number"
        placeholder="Año del camión"
        {...register("age")}
        error={errors.age}
      />
    </div>
  );
};

export default VehicleDetailsFields;