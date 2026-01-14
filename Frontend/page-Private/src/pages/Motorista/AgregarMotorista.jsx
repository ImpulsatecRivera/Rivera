import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, CreditCard, Cake, Car, DollarSign, ClipboardList } from 'lucide-react';
import Swal from 'sweetalert2';

import { config } from '../../config';

const API_URL = config.api.API_URL;

// Componentes de formularios específicos
import HeaderNavigation from '../../components/FormsMotoristas/FormHeaderNavigation';
import FormHeroSection from '../../components/FormsMotoristas/FormHeroSecction';
import FormContainer from '../../components/FormsMotoristas/FormContainer';
import FormFieldsGrid from '../../components/FormsMotoristas/FromFieldsGrid';
import FormInput from '../../components/FormsMotoristas/FormInput';
import FormTextArea from '../../components/FormsMotoristas/FormTextArea';
import DatePicker from '../../components/FormsMotoristas/FormDatePicker';
import ImageUpload from '../../components/FormsMotoristas/ImageUpload';
import SubmitButton from '../../components/FormsMotoristas/SubmitButton';

const AgregarMotorista = () => {
  // Estados del componente
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    id: '',
    birthDate: '',
    password: '',
    phone: '',
    address: '',
    circulationCard: '',
    // ✅ NUEVOS CAMPOS DEL MODEL
    planillaTipo: '',
    salario: '',
    img: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Generar email automáticamente cuando cambien nombre o apellido
  useEffect(() => {
    if (formData.name && formData.lastName) {
      const emailGenerated = `${formData.name.toLowerCase()}.${formData.lastName.toLowerCase()}@rivera.com`;
      setFormData(prev => ({ ...prev, email: emailGenerated }));
    } else {
      setFormData(prev => ({ ...prev, email: '' }));
    }
  }, [formData.name, formData.lastName]);

  // Configuración de SweetAlert2
  const showSuccessAlert = () => {
    Swal.fire({
      title: '¡Motorista agregado con éxito!',
      text: 'Motorista agregado correctamente',
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#5D9646',
      allowOutsideClick: false,
      customClass: { popup: 'animated bounceIn' }
    }).then((result) => {
      if (result.isConfirmed) handleBackToMenu();
    });
  };

  const showLoadingAlert = () => {
    Swal.fire({
      title: 'Agregando motorista...',
      text: 'Por favor espera mientras procesamos la información',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });
  };

  const showValidationAlert = (camposFaltantes) => {
    Swal.fire({
      title: '⚠️ Formulario incompleto',
      html: `
        <p style="margin-bottom: 15px;">Los siguientes campos son obligatorios:</p>
        <ul style="text-align: left; color: #dc2626; font-weight: 500;">
          ${camposFaltantes.map(campo => `<li>• ${campo}</li>`).join('')}
        </ul>
      `,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b',
      allowOutsideClick: false,
      customClass: { popup: 'animated pulse' }
    });
  };

  // Manejo de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        Swal.fire({
          title: 'Formato no válido',
          text: 'Por favor selecciona una imagen en formato JPG, PNG o GIF',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        Swal.fire({
          title: 'Archivo muy grande',
          text: 'La imagen debe ser menor a 5MB',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }

      setFormData(prev => ({ ...prev, img: file }));
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, img: null }));
    setImagePreview(null);
    const fileInput = document.getElementById('img-input');
    if (fileInput) fileInput.value = '';
  };

  // Manejo de cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Email autogenerado (no editable)
    if (name === 'email') return;

    if (name === 'phone') {
      const numbers = value.replace(/\D/g, '');
      formattedValue = numbers.length > 4
        ? numbers.slice(0, 4) + '-' + numbers.slice(4, 8)
        : numbers;
    }

    if (name === 'id') {
      const numbers = value.replace(/\D/g, '');
      formattedValue = numbers.length > 8
        ? numbers.slice(0, 8) + '-' + numbers.slice(8, 9)
        : numbers;
    }

    if (name === 'circulationCard') {
      formattedValue = value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    }

    // ✅ salario: permitir solo número (string en el state; lo convertimos al enviar)
    if (name === 'salario') {
      formattedValue = value; // el input type=number ya ayuda
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  // Manejo específico para DatePicker
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, birthDate: date }));
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "El nombre es obligatorio";
    if (!formData.lastName) newErrors.lastName = "El apellido es obligatorio";

    if (!formData.id) newErrors.id = "El DUI es obligatorio";
    if (formData.id && formData.id.replace(/\D/g, '').length !== 9) {
      newErrors.id = "El DUI debe tener exactamente 9 dígitos";
    }

    if (!formData.birthDate) newErrors.birthDate = "La fecha de nacimiento es obligatoria";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";

    if (!formData.phone) newErrors.phone = "El teléfono es obligatorio";
    if (formData.phone && formData.phone.replace(/\D/g, '').length !== 8) {
      newErrors.phone = "El teléfono debe tener exactamente 8 dígitos";
    }

    if (!formData.address) newErrors.address = "La dirección es obligatoria";

    if (!formData.circulationCard) newErrors.circulationCard = "La tarjeta de circulación es obligatoria";
    if (formData.circulationCard && formData.circulationCard.length < 3) {
      newErrors.circulationCard = "La tarjeta de circulación debe tener al menos 3 caracteres";
    }

    // ✅ NUEVOS REQUERIDOS (del model)
    if (!formData.planillaTipo) newErrors.planillaTipo = "El tipo de planilla es obligatorio";
    if (String(formData.salario).trim() === '') newErrors.salario = "El salario es obligatorio";
    if (String(formData.salario).trim() !== '' && Number(formData.salario) <= 0) {
      newErrors.salario = "El salario debe ser mayor a 0";
    }

    if (!formData.img) newErrors.img = "La imagen es obligatoria";

    return newErrors;
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      lastName: '',
      email: '',
      id: '',
      birthDate: '',
      password: '',
      phone: '',
      address: '',
      circulationCard: '',
      planillaTipo: '',
      salario: '',
      img: null
    });
    setImagePreview(null);
    setErrors({});

    const fileInput = document.getElementById('img-input');
    if (fileInput) fileInput.value = '';
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      const camposFaltantes = Object.keys(formErrors).map(field => {
        const fieldNames = {
          name: 'Nombre',
          lastName: 'Apellido',
          id: 'DUI',
          birthDate: 'Fecha de nacimiento',
          password: 'Contraseña',
          phone: 'Teléfono',
          address: 'Dirección',
          circulationCard: 'Tarjeta de circulación',
          planillaTipo: 'Tipo de planilla',
          salario: 'Salario',
          img: 'Imagen'
        };
        return fieldNames[field] || field;
      });

      showValidationAlert(camposFaltantes);
      return;
    }

    try {
      showLoadingAlert();
      setLoading(true);

      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('lastName', formData.lastName.trim());
      formDataToSend.append('id', formData.id.trim());
      formDataToSend.append('birthDate', formData.birthDate);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phone', formData.phone.trim());
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('circulationCard', formData.circulationCard.trim());

      // ✅ enviar campos del model
      formDataToSend.append('planillaTipo', formData.planillaTipo);
      formDataToSend.append('salario', String(Number(formData.salario)));

      // (Opcional) si querés guardarlo aunque no esté en model (strict:false lo permite)
      if (formData.email?.trim()) {
        formDataToSend.append('email', formData.email.trim());
      }

      if (formData.img) {
        formDataToSend.append('img', formData.img);
      }

      const response = await fetch(`${API_URL}/motoristas`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Motorista creado exitosamente:', responseData);

        Swal.close();
        resetForm();
        showSuccessAlert();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error capturado:', error);
      Swal.close();

      Swal.fire({
        title: '❌ Error al agregar motorista',
        text: error.message || 'Hubo un error al procesar la solicitud',
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#ef4444',
        allowOutsideClick: false,
        customClass: { popup: 'animated shakeX' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Navegación
  const handleBackToMenu = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      console.log('Navegar a la página anterior');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#34353A' }}>
      {/* Header Navigation */}
      <HeaderNavigation
        onBack={handleBackToMenu}
        title="Volver al menú principal"
      />

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <FormHeroSection
            icon={Car}
            title="Agregar Nuevo Motorista"
            description="Complete la información del motorista para agregarlo al sistema"
            iconColor="#5D9646"
          />

          {/* Form Container */}
          <FormContainer onSubmit={handleSubmit}>

            {/* Profile Image Upload */}
            <ImageUpload
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onRemoveImage={removeImage}
              error={errors.img}
              label="Subir foto *"
              required={true}
            />

            {/* Form Fields Grid */}
            <FormFieldsGrid>

              {/* Nombre */}
              <FormInput
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre"
                label="Nombre"
                icon={User}
                error={errors.name}
                required={true}
              />

              {/* Apellido */}
              <FormInput
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Ingrese el apellido"
                label="Apellido"
                icon={User}
                error={errors.lastName}
                required={true}
              />

              {/* Email */}
              <FormInput
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                label="Correo electrónico"
                icon={Mail}
                readOnly={true}
                autoGenerated={true}
                className="sm:col-span-2 lg:col-span-1"
              />

              {/* DUI */}
              <FormInput
                id="id"
                name="id"
                type="text"
                value={formData.id}
                onChange={handleInputChange}
                placeholder="00000000-0"
                maxLength={10}
                label="DUI"
                icon={CreditCard}
                error={errors.id}
                required={true}
              />

              {/* Fecha de Nacimiento */}
              <DatePicker
                value={formData.birthDate}
                onChange={handleDateChange}
                placeholder="Seleccionar fecha"
                label="Fecha de nacimiento"
                icon={Cake}
                error={errors.birthDate}
                required={true}
              />

              {/* Contraseña */}
              <FormInput
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Ingrese una contraseña"
                label="Contraseña"
                icon={Lock}
                error={errors.password}
                required={true}
              />

              {/* Teléfono */}
              <FormInput
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0000-0000"
                maxLength={9}
                label="Teléfono"
                icon={Phone}
                error={errors.phone}
                required={true}
              />

              {/* Tarjeta de Circulación */}
              <FormInput
                id="circulationCard"
                name="circulationCard"
                type="text"
                value={formData.circulationCard}
                onChange={handleInputChange}
                placeholder="Ejemplo: ABC-123"
                label="Tarjeta de circulación"
                icon={Car}
                error={errors.circulationCard}
                required={true}
              />

              {/* ✅ Tipo de planilla (Semanal / Quincenal) */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de planilla *
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClipboardList className="w-5 h-5" style={{ color: '#5D9646' }} />
                  </div>

                  <select
                    name="planillaTipo"
                    value={formData.planillaTipo}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border-2 bg-white text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200
                      ${errors.planillaTipo ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="" disabled>Selecciona una opción</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Quincenal">Quincenal</option>
                  </select>
                </div>

                {errors.planillaTipo && (
                  <p className="text-xs mt-1 text-red-500">{errors.planillaTipo}</p>
                )}
              </div>

              {/* ✅ Salario */}
              <FormInput
                id="salario"
                name="salario"
                type="number"
                value={formData.salario}
                onChange={handleInputChange}
                placeholder="Ejemplo: 600"
                label="Salario ($)"
                icon={DollarSign}
                error={errors.salario}
                required={true}
              />

              {/* Dirección */}
              <FormTextArea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ingrese la dirección completa"
                rows={3}
                label="Dirección"
                icon={MapPin}
                error={errors.address}
                required={true}
                className="sm:col-span-2 lg:col-span-3"
              />

            </FormFieldsGrid>

            {/* Submit Button */}
            <SubmitButton
              loading={loading}
              loadingText="Procesando..."
              icon={Car}
              color="#5D9646"
              hoverColor="#4a7a37"
            >
              Agregar Motorista
            </SubmitButton>

          </FormContainer>
        </div>
      </div>
    </div>
  );
};

export default AgregarMotorista;
