import React from 'react';
import { Truck, CreditCard, Car } from 'lucide-react';
import FormFieldInput from '../../components/UICamiones/FieldInputAgregar';

const BasicInfoFields = ({ register, errors }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Nombre */}
      <FormFieldInput
        id="name"
        label="Nombre"
        icon={Truck}
        placeholder="Nombre del número del camión"
        {...register("name", { required: true })}
        error={errors.name}
        required
      />

      {/* Tarjeta de circulación */}
      <FormFieldInput
        id="ciculatioCard"
        label="Tarjeta de circulación"
        icon={CreditCard}
        placeholder="Tarjeta de circulación del Camión"
        {...register("ciculatioCard", { required: true })}
        error={errors.ciculatioCard}
        required
      />

      {/* Placa */}
      <FormFieldInput
        id="licensePlate"
        label="Placa"
        icon={Car}
        placeholder="Número de placa"
        {...register("licensePlate", { required: true })}
        error={errors.licensePlate}
        required
      />
    </div>
  );
};

export default BasicInfoFields;