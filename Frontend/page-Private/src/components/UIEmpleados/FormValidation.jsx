export const validateEmployeeForm = (formData) => {
  const newErrors = {};
  
  if (!formData.name) newErrors.name = "El nombre es obligatorio";
  if (!formData.lastName) newErrors.lastName = "El apellido es obligatorio";
  if (!formData.dui) newErrors.dui = "El DUI es obligatorio";
  if (formData.dui && formData.dui.replace(/\D/g, '').length !== 9) {
    newErrors.dui = "El DUI debe tener exactamente 9 dígitos";
  }
  if (!formData.birthDate) newErrors.birthDate = "La fecha de nacimiento es obligatoria";
  if (!formData.password) newErrors.password = "La contraseña es obligatoria";
  if (!formData.phone) newErrors.phone = "El teléfono es obligatorio";
  if (formData.phone && formData.phone.replace(/\D/g, '').length !== 8) {
    newErrors.phone = "El teléfono debe tener exactamente 8 dígitos";
  }
  if (!formData.address) newErrors.address = "La dirección es obligatoria";

  return newErrors;
};

export const formatInput = (name, value) => {
  let formattedValue = value;

  if (name === 'phone') {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length > 4) {
      formattedValue = numbers.slice(0, 4) + '-' + numbers.slice(4, 8);
    } else {
      formattedValue = numbers;
    }
  }

  if (name === 'dui') {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length > 8) {
      formattedValue = numbers.slice(0, 8) + '-' + numbers.slice(8, 9);
    } else {
      formattedValue = numbers;
    }
  }

  return formattedValue;
};