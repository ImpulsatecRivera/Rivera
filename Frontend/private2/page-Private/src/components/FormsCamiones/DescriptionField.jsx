import React from 'react';
import { FileText } from 'lucide-react';
import FormFieldInput from '../../components/UICamiones/FieldInputAgregar';

const DescriptionField = ({ register, errors }) => {
  return (
    <div className="sm:col-span-2 lg:col-span-3">
      <FormFieldInput
        id="description"
        label="Descripción"
        icon={FileText}
        type="textarea"
        placeholder="Descripción con breve descripción del camión"
        rows={3}
        {...register("description")}
        error={errors.description}
      />
    </div>
  );
};

export default DescriptionField;
