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
        {...register("name", { required: "El nombre del camión es obligatorio" })}
        error={errors.name}
        required
      />

      {/* Tarjeta de circulación - Fecha de vencimiento */}
      <FormFieldInput
        id="ciculatioCard"
        label="Fecha de vencimiento tarjeta circulación"
        icon={CreditCard}
        type="date"
        {...register("ciculatioCard")}
        error={errors.ciculatioCard}
      />

      {/* Placa */}
      <FormFieldInput
        id="licensePlate"
        label="Placa"
        icon={Car}
        placeholder="Número de placa"
        {...register("licensePlate", { required: "La placa es obligatoria" })}
        error={errors.licensePlate}
        required
      />
    </div>
  );
};

export default BasicInfoFields;