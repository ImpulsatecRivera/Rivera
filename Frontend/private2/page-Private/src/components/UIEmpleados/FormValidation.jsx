// FormValidation.js

export const validateEmployeeForm = (formData) => {
  const errors = {};

  // Validar nombre
  if (!formData.name || !formData.name.trim()) {
    errors.name = 'El nombre es obligatorio';
  }

  // Validar apellido
  if (!formData.lastName || !formData.lastName.trim()) {
    errors.lastName = 'El apellido es obligatorio';
  }

  // Validar DUI
  if (!formData.dui || !formData.dui.trim()) {
    errors.dui = 'El DUI es obligatorio';
  } else if (!/^\d{8}-\d$/.test(formData.dui)) {
    errors.dui = 'El DUI debe tener el formato 00000000-0';
  }

  // Validar fecha de nacimiento
  if (!formData.birthDate) {
    errors.birthDate = 'La fecha de nacimiento es obligatoria';
  }

  // Validar contraseña - COINCIDE CON EL BACKEND
  if (!formData.password || !formData.password.trim()) {
    errors.password = 'La contraseña es obligatoria';
  } else if (formData.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
  } else {
    // Validar requisitos específicos de contraseña (igual que el backend)
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      errors.password = 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número';
    }
  }

  // Validar teléfono
  if (!formData.phone || !formData.phone.trim()) {
    errors.phone = 'El teléfono es obligatorio';
  } else if (!/^\d{4}-\d{4}$/.test(formData.phone)) {
    errors.phone = 'El teléfono debe tener el formato 0000-0000';
  }

  // Validar dirección
  if (!formData.address || !formData.address.trim()) {
    errors.address = 'La dirección es obligatoria';
  }

  return errors;
};

export const formatInput = (name, value) => {
  switch (name) {
    case 'dui':
      // Formato DUI: 00000000-0
      const duiNumbers = value.replace(/\D/g, '');
      if (duiNumbers.length <= 8) {
        return duiNumbers;
      } else if (duiNumbers.length === 9) {
        return `${duiNumbers.slice(0, 8)}-${duiNumbers.slice(8)}`;
      }
      return value;

    case 'phone':
      // Formato teléfono: 0000-0000
      const phoneNumbers = value.replace(/\D/g, '');
      if (phoneNumbers.length <= 4) {
        return phoneNumbers;
      } else if (phoneNumbers.length <= 8) {
        return `${phoneNumbers.slice(0, 4)}-${phoneNumbers.slice(4)}`;
      }
      return value;

    case 'name':
    case 'lastName':
      // Solo permitir letras y espacios
      return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');

    default:
      return value;
  }
};