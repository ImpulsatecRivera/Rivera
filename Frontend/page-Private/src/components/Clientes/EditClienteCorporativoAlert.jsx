import React, { useEffect, useState } from 'react';
import { Upload, Mail, Phone, MapPin, Building2 } from 'lucide-react';

const defaultContacto = { nombre: '', cargo: '', telefono: '', email: '' };

const EditClienteCorporativoAlert = ({ isOpen, onClose, onSave, cliente, submitting = false }) => {
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    nombreComercial: '',
    ruc: '',
    giroNegocio: '',
    terminosPago: 'contado',
    email: '',
    phone: '',
    address: '',
    direccionFacturacion: '',
    contactoPrincipal: defaultContacto,
  });

  useEffect(() => {
    if (cliente && isOpen) {
      setFormData({
        nombreEmpresa: cliente.nombreEmpresa || '',
        nombreComercial: cliente.nombreComercial || '',
        ruc: cliente.ruc || '',
        giroNegocio: cliente.giroNegocio || '',
        terminosPago: cliente.terminosPago || 'contado',
        email: cliente.email || '',
        phone: cliente.phone || cliente.contactoPrincipal?.telefono || '',
        address: cliente.address || '',
        direccionFacturacion: cliente.direccionFacturacion || '',
        contactoPrincipal: {
          nombre: cliente.contactoPrincipal?.nombre || '',
          cargo: cliente.contactoPrincipal?.cargo || '',
          telefono: cliente.contactoPrincipal?.telefono || '',
          email: cliente.contactoPrincipal?.email || ''
        }
      });
    }
  }, [cliente, isOpen]);

  const handleChange = (name, value) => {
    if (name.startsWith('contactoPrincipal.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        contactoPrincipal: {
          ...prev.contactoPrincipal,
          [field]: value
        }
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave({ ...formData });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-white rounded-lg p-8 max-w-4xl w-full mx-4 shadow-xl relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        }}
      >
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200 hover:scale-110 transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ×
        </button>

        <div className="text-center mb-8">
          <h3
            className="text-2xl font-semibold text-gray-900 transition-all duration-300"
            style={{ animation: isOpen ? 'fadeInUp 0.5s ease-out 0.2s both' : 'none' }}
          >
            Editar Cliente Corporativo
          </h3>
          {cliente && (
            <p className="text-gray-600 mt-2">
              Editando: {cliente.nombreEmpresa || cliente.nombreComercial || 'Cliente'}
            </p>
          )}
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          style={{ animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none' }}
        >
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Nombre de la empresa *</label>
            <input
              value={formData.nombreEmpresa}
              onChange={(e) => handleChange('nombreEmpresa', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
              placeholder="Ej. GRUPO LOGÍSTICO"
            />

            <label className="block text-sm font-medium text-gray-700">Nombre comercial</label>
            <input
              value={formData.nombreComercial}
              onChange={(e) => handleChange('nombreComercial', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
              placeholder="Alias público"
            />

            <label className="block text-sm font-medium text-gray-700">RUC / NIT *</label>
            <input
              value={formData.ruc}
              onChange={(e) => handleChange('ruc', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
              placeholder="Documento fiscal"
            />

            <label className="block text-sm font-medium text-gray-700">Giro del negocio</label>
            <input
              value={formData.giroNegocio}
              onChange={(e) => handleChange('giroNegocio', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
              placeholder="Transporte, distribución, etc"
            />

            <label className="block text-sm font-medium text-gray-700">Términos de pago</label>
            <select
              value={formData.terminosPago}
              onChange={(e) => handleChange('terminosPago', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
            >
              <option value="contado">Contado</option>
              <option value="credito_7">Crédito 7 días</option>
              <option value="credito_15">Crédito 15 días</option>
              <option value="credito_30">Crédito 30 días</option>
              <option value="credito_60">Crédito 60 días</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Correo principal *</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <input
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full focus:outline-none"
                placeholder="correo@empresa.com"
              />
            </div>

            <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
              <Phone className="w-4 h-4 text-gray-400 mr-2" />
              <input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full focus:outline-none"
                placeholder="+503..."
              />
            </div>

            <label className="block text-sm font-medium text-gray-700">Dirección principal *</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
              <input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full focus:outline-none"
                placeholder="Dirección física"
              />
            </div>

            <label className="block text-sm font-medium text-gray-700">Dirección de facturación</label>
            <input
              value={formData.direccionFacturacion}
              onChange={(e) => handleChange('direccionFacturacion', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
              placeholder="Si difiere de la principal"
            />

            <label className="block text-sm font-medium text-gray-700">Contacto principal</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={formData.contactoPrincipal.nombre}
                onChange={(e) => handleChange('contactoPrincipal.nombre', e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
                placeholder="Nombre"
              />
              <input
                value={formData.contactoPrincipal.cargo}
                onChange={(e) => handleChange('contactoPrincipal.cargo', e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
                placeholder="Cargo"
              />
              <input
                value={formData.contactoPrincipal.telefono}
                onChange={(e) => handleChange('contactoPrincipal.telefono', e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
                placeholder="Teléfono"
              />
              <input
                value={formData.contactoPrincipal.email}
                onChange={(e) => handleChange('contactoPrincipal.email', e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
                placeholder="Email"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg text-white font-medium shadow-md"
            style={{ backgroundColor: '#5F8EAD' }}
            disabled={submitting}
          >
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
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
  );
};

export default EditClienteCorporativoAlert;
