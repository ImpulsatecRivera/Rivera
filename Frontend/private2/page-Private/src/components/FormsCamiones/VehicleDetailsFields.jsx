import React from 'react';
import { Building, Car, Calendar, Fuel } from 'lucide-react';
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
        {...register("brand", { required: true })}
        error={errors.brand}
        required
      />

      {/* Modelo */}
      <FormFieldInput
        id="model"
        label="Modelo"
        icon={Car}
        placeholder="Modelo del camión"
        {...register("model", { required: true })}
        error={errors.model}
        required
      />

      {/* Año */}
      <FormFieldInput
        id="age"
        label="Año"
        icon={Calendar}
        type="number"
        placeholder="Año del camión"
        {...register("age", { required: true })}
        error={errors.age}
        required
      />

      {/* Nivel de gasolina */}
      <FormFieldInput
        id="gasolineLevel"
        label="Nivel de gasolina"
        icon={Fuel}
        type="number"
        min="0"
        max="100"
        placeholder="Nivel de gasolina (0-100)"
        {...register("gasolineLevel", { required: true })}
        error={errors.gasolineLevel}
        required
      />
    </div>
  );
};

export default VehicleDetailsFields;