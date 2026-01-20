import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  CreditCard,
  UserPlus,
  DollarSign,
} from "lucide-react";
import { config } from "../../config";
import axios from "axios";

const API_URL = config.api.API_URL;

// Importar componentes UI
import PageHeader from "../../components/UIEmpleados/PageHeader";
import HeroSection from "../../components/UIEmpleados/HeroSecction";
import SubmitButton from "../../components/UIEmpleados/SubmitButton";

// Importar componentes de formulario
import ImageUploader from "../../components/FormsEmpleados/ImageUploader";
import FormInput from "../../components/FormsEmpleados/FormInput";
import FormTextarea from "../../components/FormsEmpleados/FormTextarea";
import DatePicker from "../../components/FormsEmpleados/DatePicker";

// Importar utilidades
import {
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  showValidationAlert,
} from "../../components/UIEmpleados/SweetAlertUtils";
import {
  validateEmployeeForm,
  formatInput,
} from "../../components/UIEmpleados/FormValidation";
import { generateEmail } from "../../components/UIEmpleados/EmailGenerator";
import { useImageUpload } from "../../components/Empleados/hooks/useImageUpload";

const AgregarEmpleado = () => {
  // ✅ Opciones según tu schema (ENUM)
  const TIPOS_PLANILLA = ["Semanal", "Quincenal"];
  // OJO: tu schema dice "SUpervisor" (así tal cual). Debe coincidir EXACTO.
  const ROLES = ["Operativo", "SUpervisor"];

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    dui: "",
    birthDate: "",
    password: "",
    phone: "",
    address: "",
    salario: "",
    planillaTipo: "", // ✅ NUEVO
    rol: "", // ✅ NUEVO
    img: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Hook personalizado para manejo de imágenes
  const { imagePreview, handleImageChange, removeImage, setImagePreview } =
    useImageUpload();

  // Manejo de cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Formatear inputs específicos
    const formattedValue = formatInput(name, value);

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Manejo especial para el campo de salario
  const handleSalaryChange = (e) => {
    const value = e.target.value;
    // Permitir solo números y punto decimal
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        salario: value,
      }));

      if (errors.salario) {
        setErrors((prev) => ({
          ...prev,
          salario: "",
        }));
      }
    }
  };

  // Manejo de imagen
  const onImageChange = (e) => {
    handleImageChange(e, setFormData);
    if (errors.img) {
      setErrors((prev) => ({ ...prev, img: "" }));
    }
  };

  const onRemoveImage = () => {
    removeImage(setFormData);
  };

  // Navegación
  const handleBackToMenu = () => {
    // Mejor usar react-router para back
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Ruta existente en tu App.jsx
      // (si prefieres /dashboard o /home, cámbiala aquí)
      console.log("No hay historial. Navegando a /empleados");
      // Si quieres forzar navegación:
      // navigate("/empleados");
    }
  };

  // Validación y envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación base (tu utilidad)
    const formErrors = validateEmployeeForm(formData);

    // ✅ Validar email requerido y formato correcto
    if (!formData.email || formData.email.trim() === "") {
      formErrors.email = "El correo electrónico es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      formErrors.email = "Formato de correo electrónico inválido";
    }

    // ✅ FIX: validar salario correcto (antes estaba como salary)
    if (
      !formData.salario ||
      formData.salario === "" ||
      parseFloat(formData.salario) <= 0
    ) {
      formErrors.salario = "El salario es requerido y debe ser mayor a 0";
    }

    // ✅ Validar campos nuevos (schema)
    if (!formData.planillaTipo || !TIPOS_PLANILLA.includes(formData.planillaTipo)) {
      formErrors.planillaTipo = "Selecciona el tipo de planilla";
    }

    if (!formData.rol || !ROLES.includes(formData.rol)) {
      formErrors.rol = "Selecciona un rol válido";
    }

    // ✅ Si tu schema exige img required: true
    if (!formData.img) {
      formErrors.img = "La imagen es obligatoria";
    }

    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      const camposFaltantes = Object.keys(formErrors).map((field) => {
        const fieldNames = {
          name: "Nombre",
          lastName: "Apellido",
          email: "Correo electrónico",
          dui: "DUI",
          birthDate: "Fecha de nacimiento",
          password: "Contraseña",
          phone: "Teléfono",
          address: "Dirección",
          salario: "Salario",
          planillaTipo: "Tipo de planilla",
          rol: "Rol",
          img: "Imagen",
        };
        return fieldNames[field] || field;
      });

      showValidationAlert(camposFaltantes);
      return;
    }

    try {
      showLoadingAlert();
      setLoading(true);

      // Preparar FormData
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("lastName", formData.lastName.trim());

      // ✅ FIX: estabas generando email pero no lo enviabas
      formDataToSend.append("email", formData.email.trim());

      formDataToSend.append("dui", formData.dui.trim());
      // ✅ Convertir fecha a formato YYYY-MM-DD para evitar problemas de zona horaria
      const birthDateStr = formData.birthDate instanceof Date 
        ? formData.birthDate.toISOString().split('T')[0]
        : String(formData.birthDate).split('T')[0];
      formDataToSend.append("birthDate", birthDateStr);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("phone", formData.phone.trim());
      formDataToSend.append("address", formData.address.trim());

      // ✅ Nuevos campos
      formDataToSend.append("planillaTipo", formData.planillaTipo);
      formDataToSend.append("rol", formData.rol);

      // Salario
      const salarioValue = parseFloat(formData.salario);
      formDataToSend.append("salario", salarioValue);

      // Imagen
      if (formData.img) {
        formDataToSend.append("img", formData.img);
      }

      // Enviar petición
      const response = await axios.post(`${API_URL}/empleados`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 10000,
      });

      if (response.status === 200 || response.status === 201) {
        // Mostrar éxito
        showSuccessAlert(handleBackToMenu);

        // Reset
        setFormData({
          name: "",
          lastName: "",
          email: "",
          dui: "",
          birthDate: "",
          password: "",
          phone: "",
          address: "",
          salario: "",
          planillaTipo: "",
          rol: "",
          img: null,
        });
        setImagePreview(null);
        setErrors({});
      }
    } catch (error) {
      console.error("Error:", error);

      let errorMsg = "Error desconocido";

      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Error del servidor";
        const errorDetails =
          error.response.data?.details || error.response.data?.errors || null;

        switch (statusCode) {
          case 400:
            errorMsg = errorDetails
              ? `${errorMessage}\n\nDetalles:\n${JSON.stringify(errorDetails, null, 2)}`
              : errorMessage;
            break;
          case 401:
            errorMsg = "No tienes permisos para realizar esta acción. Verifica tus credenciales.";
            break;
          case 403:
            errorMsg = "No tienes permisos suficientes para agregar empleados.";
            break;
          case 404:
            errorMsg = "El servicio no está disponible. Contacta al administrador.";
            break;
          case 409:
            errorMsg = `Ya existe un empleado con estos datos: ${errorMessage}`;
            break;
          case 500:
            errorMsg = "Error interno del servidor. Inténtalo más tarde.";
            break;
          default:
            errorMsg = `Error del servidor (${statusCode}): ${errorMessage}`;
        }
      } else if (error.request) {
        errorMsg = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      } else {
        errorMsg = "Error al configurar la petición. Contacta al administrador.";
      }

      showErrorAlert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#34353A" }}>
      {/* Header */}
      <PageHeader onBack={handleBackToMenu} title="Volver al menú principal" />

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <HeroSection
            icon={UserPlus}
            title="Agregar Nuevo Empleado"
            subtitle="Complete la información del empleado para agregarlo al sistema"
          />

          {/* Form Container */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 xl:p-12">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Profile Image Section */}
              <ImageUploader
                imagePreview={imagePreview}
                onImageChange={onImageChange}
                onRemoveImage={onRemoveImage}
              />
              {errors.img && (
                <p className="text-red-500 text-sm font-semibold -mt-4">
                  {errors.img}
                </p>
              )}

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Nombre */}
                <FormInput
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ingrese el nombre"
                  icon={User}
                  label="Nombre"
                  required
                  error={errors.name}
                />

                {/* Apellido */}
                <FormInput
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Ingrese el apellido"
                  icon={User}
                  label="Apellido"
                  required
                  error={errors.lastName}
                />

                {/* Email */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <FormInput
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={Mail}
                    label="Correo electrónico"
                    placeholder="Ingrese el correo electrónico"
                    required
                    error={errors.email}
                  />
                </div>

                {/* DUI */}
                <FormInput
                  id="dui"
                  name="dui"
                  value={formData.dui}
                  onChange={handleInputChange}
                  placeholder="00000000-0"
                  maxLength={10}
                  icon={CreditCard}
                  label="DUI"
                  required
                  error={errors.dui}
                />

                {/* Fecha de Nacimiento */}
                <DatePicker
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  label="Fecha de nacimiento"
                  required
                  error={errors.birthDate}
                />

                {/* Contraseña */}
                <FormInput
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Ingrese una contraseña"
                  icon={Lock}
                  label="Contraseña"
                  required
                  error={errors.password}
                />

                {/* Teléfono */}
                <FormInput
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0000-0000"
                  maxLength={9}
                  icon={Phone}
                  label="Teléfono"
                  required
                  error={errors.phone}
                />

                {/* Salario */}
                <FormInput
                  id="salario"
                  name="salario"
                  type="number"
                  value={formData.salario}
                  onChange={handleSalaryChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  icon={DollarSign}
                  label="Salario"
                  required
                  error={errors.salario}
                />

                {/* ✅ Tipo de planilla */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de planilla <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="planillaTipo"
                    value={formData.planillaTipo}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors font-semibold ${
                      errors.planillaTipo
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 focus:border-indigo-500"
                    }`}
                  >
                    <option value="">Selecciona...</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Quincenal">Quincenal</option>
                  </select>
                  {errors.planillaTipo && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.planillaTipo}
                    </p>
                  )}
                </div>

                {/* ✅ Rol */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors font-semibold ${
                      errors.rol
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 focus:border-indigo-500"
                    }`}
                  >
                    <option value="">Selecciona...</option>
                    <option value="Operativo">Operativo</option>
                    <option value="SUpervisor">Supervisor</option>
                  </select>
                  {errors.rol && (
                    <p className="text-red-500 text-xs mt-1">{errors.rol}</p>
                  )}
                </div>

                {/* Dirección */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <FormTextarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ingrese la dirección completa"
                    icon={MapPin}
                    label="Dirección"
                    required
                    error={errors.address}
                    rows={3}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <SubmitButton
                loading={loading}
                onClick={handleSubmit}
                icon={UserPlus}
                text="Agregar Empleado"
                loadingText="Procesando..."
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarEmpleado;
