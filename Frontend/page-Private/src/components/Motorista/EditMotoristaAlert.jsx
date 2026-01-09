import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Eye, EyeOff, Upload, ClipboardList, DollarSign } from 'lucide-react';

const EditMotoristaAlert = ({ isOpen, onClose, onSave, motorista, uploading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    address: '',
    password: '',
    circulationCard: '',
    email: '',
    // ✅ CAMPOS DEL MODEL
    planillaTipo: '',
    salario: '',
    // imagen
    image: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const generateEmail = (name, lastName) => {
    const cleanName = String(name || '').trim().toLowerCase().replace(/\s+/g, '');
    const cleanLastName = String(lastName || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanName && !cleanLastName) return '';
    if (!cleanName) return `${cleanLastName}@rivera.com`;
    if (!cleanLastName) return `${cleanName}@rivera.com`;
    return `${cleanName}.${cleanLastName}@rivera.com`;
  };

  // ✅ Cargar datos del motorista al abrir
  useEffect(() => {
    if (motorista && isOpen) {
      const name = motorista.name || '';
      const lastName = motorista.lastName || '';

      setFormData({
        name: '',
        lastName: '',
        phone: '',
        address: '',
        password: '',
        circulationCard: '',
        // email se muestra (y puede auto-actualizarse si cambias nombre/apellido)
        email: motorista.email || generateEmail(name, lastName) || '',
        // ✅ model
        planillaTipo: motorista.planillaTipo || '',
        salario:
          motorista.salario === 0 || motorista.salario
            ? String(motorista.salario)
            : '',
        image: null,
      });

      setShowPassword(false);
      // ✅ tu backend usa "img"
      setImagePreview(motorista.img || null);

      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motorista, isOpen]);

  // ✅ Email autogenerado si cambias nombre/apellido (sin editar manual)
  useEffect(() => {
    if (!isOpen) return;
    const baseName = formData.name || motorista?.name || '';
    const baseLast = formData.lastName || motorista?.lastName || '';
    const email = generateEmail(baseName, baseLast);
    setFormData((prev) => ({ ...prev, email }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.name, formData.lastName, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'email') return;

    if (name === 'circulationCard') {
      formattedValue = value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    }

    if (name === 'phone') {
      const numbers = value.replace(/\D/g, '');
      formattedValue = numbers.length > 4 ? numbers.slice(0, 4) + '-' + numbers.slice(4, 8) : numbers;
    }

    if (name === 'salario') {
      // permitir vacío o números con decimal
      if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
      formattedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  // 📸 Manejar selección de imagen
  const handleImageChange = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, WEBP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('La imagen es demasiado grande. Máximo 5MB permitido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleImageChange(file);
  };

  const handleImageAreaClick = () => fileInputRef.current?.click();

  // ✅ En vez de "eliminar", volvemos a la imagen actual del motorista
  const handleRestoreImage = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(motorista?.img || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleImageChange(file);
  };

  const handleSave = () => {
    // ✅ mandamos todo; el hook ya ignora vacíos y arma multipart si hay image
    onSave(formData);
  };

  if (!isOpen) return null;

  const showAutoEmailHint = Boolean(formData.name || formData.lastName);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-white rounded-lg p-8 max-w-3xl w-full mx-4 shadow-xl relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        }}
      >
        <button
          onClick={onClose}
          disabled={uploading}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200 hover:scale-110 transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ×
        </button>

        <div className="text-center mb-8">
          <h3
            className="text-2xl font-semibold text-gray-900 transition-all duration-300"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.2s both' : 'none',
            }}
          >
            Editar Motorista
          </h3>
          {motorista && (
            <p className="text-gray-600 mt-2">
              Editando: {motorista.name} {motorista.lastName}
            </p>
          )}
        </div>

        <div
          className="space-y-6"
          style={{
            animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none',
          }}
        >
          {/* 📸 IMAGEN */}
          <div className="flex justify-center mb-8">
            <div className="text-center w-full">
              <label className="block text-lg font-semibold text-gray-800 mb-6">Imagen del motorista</label>

              {imagePreview && (
                <div className="mb-6">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    {formData.image && (
                      <button
                        onClick={handleRestoreImage}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors duration-200"
                        title="Quitar imagen nueva"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">Cambiar imagen</label>

                <div
                  onClick={handleImageAreaClick}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`relative w-full max-w-md mx-auto border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium text-green-600 hover:text-green-500 cursor-pointer">
                        Elegir archivo
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.image ? formData.image.name : 'No se ha seleccionado ningún archivo'}
                    </p>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <p className="text-xs text-gray-500 mb-2">La imagen se subirá automáticamente a Cloudinary cuando actualices</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP • Máximo 5MB</p>
            </div>
          </div>

          {/* Nombre / Apellido */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                placeholder={motorista?.name || "Nombre"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                placeholder={motorista?.lastName || "Apellido"}
              />
            </div>
          </div>

          {/* Email / Nacimiento */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email {showAutoEmailHint ? '(actualizándose automáticamente)' : '(actual)'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
                placeholder={motorista?.email || "Email"}
              />
              <p className="text-xs text-gray-500 mt-1">
                {showAutoEmailHint
                  ? 'El email se actualiza automáticamente al cambiar nombre/apellido'
                  : 'Email actual del motorista'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
              <input
                type="text"
                value={motorista?.birthDate ? new Date(motorista.birthDate).toLocaleDateString() : ''}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base"
              />
            </div>
          </div>

          {/* Contraseña / Teléfono */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                  placeholder="•••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                placeholder={motorista?.phone || "0000-0000"}
              />
            </div>
          </div>

          {/* DUI / Tarjeta */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DUI</label>
              <input
                type="text"
                value={motorista?.id || ''}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarjeta de circulación</label>
              <input
                type="text"
                name="circulationCard"
                value={formData.circulationCard}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                placeholder={motorista?.circulationCard || "ABC-123"}
                maxLength={15}
              />
            </div>
          </div>

          {/* ✅ Planilla / Salario */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de planilla</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                </div>
                <select
                  name="planillaTipo"
                  value={formData.planillaTipo}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                >
                  <option value="">{motorista?.planillaTipo ? `Actual: ${motorista.planillaTipo}` : 'Selecciona una opción'}</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Quincenal">Quincenal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salario ($)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <input
                  type="number"
                  name="salario"
                  value={formData.salario}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                  placeholder={motorista?.salario ?? '0.00'}
                />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
              placeholder={motorista?.address || "Dirección"}
            />
          </div>
        </div>

        <div
          className="mt-8 flex justify-center"
          style={{
            animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none',
          }}
        >
          <button
            onClick={handleSave}
            disabled={uploading}
            className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {uploading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        <style>{`
          @keyframes slideInUp {
            from { transform: translateY(100px) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes fadeInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default EditMotoristaAlert;
