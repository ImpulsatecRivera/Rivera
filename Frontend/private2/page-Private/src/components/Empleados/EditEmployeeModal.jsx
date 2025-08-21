import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const EditEmployeeModal = ({ isOpen, onClose, onSave, employee, uploading }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    address: '',
    password: '',
    img: null,
    email: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const generateEmail = (name, lastName) => {
    const cleanName = (name || '').trim().toLowerCase().replace(/\s+/g, '');
    const cleanLastName = (lastName || '').trim().toLowerCase().replace(/\s+/g, '');
    
    if (!cleanName && !cleanLastName) return '';
    if (!cleanName) return `${cleanLastName}@empresa.com`;
    if (!cleanLastName) return `${cleanName}@empresa.com`;
    
    return `${cleanName}.${cleanLastName}@empresa.com`;
  };

  // USEEFFECT PRINCIPAL - Cargar datos del empleado
  useEffect(() => {
    if (employee && isOpen) {
      console.log('🔄 Cargando datos del empleado en el modal:', employee);
      
      setFormData({
        name: employee.name || '',
        lastName: employee.lastName || '',
        phone: employee.phone || '',
        address: employee.address || '',
        password: '', // La contraseña siempre empieza vacía por seguridad
        img: null,    // Para nuevas imágenes
        email: employee.email || ''
      });
      
      setShowPassword(false);
      setImagePreview(employee.img || null);
      
      console.log('✅ Datos cargados en el formulario:', {
        name: employee.name || '',
        lastName: employee.lastName || '',
        phone: employee.phone || '',
        address: employee.address || '',
        email: employee.email || ''
      });
    }
  }, [employee, isOpen]);

  // USEEFFECT ADICIONAL - Sincronizar con actualizaciones externas
  useEffect(() => {
    // Sincronizar cuando el empleado se actualiza externamente
    if (employee && isOpen && !uploading) {
      console.log('🔄 Sincronizando modal con datos actualizados del empleado:', employee);
      
      setFormData({
        name: employee.name || '',
        lastName: employee.lastName || '',
        phone: employee.phone || '',
        address: employee.address || '',
        password: '',
        img: null,
        email: employee.email || ''
      });
      
      setImagePreview(employee.img || null);
    }
  }, [employee, isOpen, uploading]); // Incluir uploading para evitar conflictos

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      };
      
      if (name === 'name' || name === 'lastName') {
        const currentName = name === 'name' ? value : (prev.name || employee?.name || '');
        const currentLastName = name === 'lastName' ? value : (prev.lastName || employee?.lastName || '');
        
        if (currentName.trim() || currentLastName.trim()) {
          newFormData.email = generateEmail(currentName, currentLastName);
        }
      }
      
      return newFormData;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          img: file
        }));
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Por favor selecciona un archivo de imagen válido');
        e.target.value = '';
      }
    }
  };

  const clearImage = () => {
    setFormData(prev => ({
      ...prev,
      img: null
    }));
    setImagePreview(employee.img || null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // FUNCIÓN HANDLESAVE OPTIMIZADA
  const handleSave = () => {
    console.log('💾 Preparando datos para guardar...');
    console.log('📋 FormData actual:', formData);
    console.log('👤 Empleado original:', employee);
    
    const formDataToSend = new FormData();
    
    // Solo agregar campos que han cambiado o que tienen valor
    if (formData.name && formData.name.trim()) {
      formDataToSend.append('name', formData.name.trim());
      console.log('✅ Agregando nombre:', formData.name.trim());
    }
    if (formData.lastName && formData.lastName.trim()) {
      formDataToSend.append('lastName', formData.lastName.trim());
      console.log('✅ Agregando apellido:', formData.lastName.trim());
    }
    if (formData.phone && formData.phone.trim()) {
      formDataToSend.append('phone', formData.phone.trim());
      console.log('✅ Agregando teléfono:', formData.phone.trim());
    }
    if (formData.address && formData.address.trim()) {
      formDataToSend.append('address', formData.address.trim());
      console.log('✅ Agregando dirección:', formData.address.trim());
    }
    if (formData.password && formData.password.trim()) {
      formDataToSend.append('password', formData.password.trim());
      console.log('✅ Agregando contraseña: [OCULTA]');
    }
    if (formData.email && formData.email.trim()) {
      formDataToSend.append('email', formData.email.trim());
      console.log('✅ Agregando email:', formData.email.trim());
    }
    if (formData.img instanceof File) {
      formDataToSend.append('img', formData.img);
      console.log('✅ Agregando nueva imagen:', formData.img.name);
    }
    
    // Debug: mostrar todos los campos que se van a enviar
    console.log('📤 Campos a enviar:');
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? `Archivo: ${pair[1].name}` : pair[1]));
    }
    
    // Verificar que se está enviando algo
    if (formDataToSend.entries().next().done) {
      console.warn('⚠️ No hay campos para actualizar');
      alert('No hay cambios para guardar');
      return;
    }
    
    // Llamar la función de guardado
    onSave(formDataToSend);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
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
            animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200 hover:scale-110 transform"
          >
            ×
          </button>
          
          <div className="text-center mb-8">
            <h3 
              className="text-2xl font-semibold text-gray-900 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.2s both' : 'none'
              }}
            >
              Editar Empleado
            </h3>
            {employee && (
              <p className="text-gray-600 mt-2">
                Editando: {employee.name} {employee.lastName}
              </p>
            )}
          </div>

          <div 
            className="space-y-6"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
            }}
          >
            {/* Sección de imagen */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Imagen del empleado</h4>
              
              {imagePreview && (
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDIxVjE5QzIwIDE3LjkzOTEgMTkuNTc4NiAxNi45MjE3IDE4LjgyODQgMTYuMTcxNkMxOC4wNzgzIDE1LjQyMTQgMTcuMDYwOSAxNSAxNiAxNUg4QzYuOTM5MTMgMTUgNS45MjE3MiAxNS40MjE0IDUuMTcxNTcgMTYuMTcxNkM0LjQyMTQzIDE2LjkyMTcgNCAxNy45MzkxIDQgMTlWMjEiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTEyIDExQzE0LjIwOTEgMTEgMTYgOS4yMDkxNCAxNiA3QzE2IDQuNzkwODYgMTQuMjA5MSAzIDEyIDNDOS43OTA4NiAzIDggNC43OTA4NiA4IDdDOCA5LjIwOTE0IDkuNzkwODYgMTEgMTIgMTEiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                      }}
                    />
                    <button
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  La imagen se subirá automáticamente a Cloudinary cuando actualices
                </p>
              </div>
            </div>

            {/* Resto de campos */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                  placeholder={employee?.name || "Nombre del empleado"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
                <input
                  type="text"
                  value={employee ? new Date(employee.birthDate).toLocaleDateString() : ''}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base"
                  placeholder="25/6/2025"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                  placeholder={employee?.lastName || "Apellido del empleado"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                    placeholder="•••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email {formData.name || formData.lastName ? '(actualizándose automáticamente)' : '(actual)'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  placeholder={employee?.email || "Email del empleado"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.name || formData.lastName 
                    ? 'El email se actualiza automáticamente al cambiar nombre/apellido' 
                    : 'Email actual del empleado'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                  placeholder={employee?.phone || "7533-4567"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DUI</label>
              <input
                type="text"
                value={employee ? employee.dui : ''}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base"
                placeholder="22223366-6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                placeholder={employee?.address || "Calle Los Almendros #24, San Salvador"}
              />
            </div>
          </div>

          <div 
            className="mt-8 flex justify-center space-x-4"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
            }}
          >
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </span>
              ) : (
                'Actualizar'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditEmployeeModal;