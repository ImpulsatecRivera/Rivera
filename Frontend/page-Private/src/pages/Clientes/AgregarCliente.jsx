import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Mail, Phone, MapPin, Building2, CreditCard } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { config } from '../../config';

import HeaderNavigation from '../../components/FormsMotoristas/FormHeaderNavigation';
import FormHeroSection from '../../components/FormsMotoristas/FormHeroSecction';
import FormContainer from '../../components/FormsMotoristas/FormContainer';
import FormFieldsGrid from '../../components/FormsMotoristas/FromFieldsGrid';
import FormInput from '../../components/FormsMotoristas/FormInput';
import FormTextArea from '../../components/FormsMotoristas/FormTextArea';
import SubmitButton from '../../components/FormsMotoristas/SubmitButton';

const API_URL = config.api.API_URL;

const AgregarCliente = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    contactoPrincipal: {
      nombre: '',
      cargo: '',
      telefono: '',
      email: ''
    }
  });

  const requiredFields = ['nombreEmpresa', 'ruc', 'email', 'phone', 'address'];

  const showSuccess = () => {
    Swal.fire({
      title: '¡Cliente agregado con éxito!',
      text: 'Cliente corporativo registrado correctamente',
      icon: 'success',
      confirmButtonText: 'Volver a clientes',
      confirmButtonColor: '#5D9646',
      allowOutsideClick: false,
      customClass: { popup: 'animated bounceIn' }
    }).then((result) => {
      if (result.isConfirmed) navigate('/clientes');
    });
  };

  const showValidation = (faltantes) => {
    Swal.fire({
      title: '⚠️ Formulario incompleto',
      html: `
        <p style="margin-bottom: 12px;">Los siguientes campos son obligatorios:</p>
        <ul style="text-align: left; color: #dc2626; font-weight: 600;">
          ${faltantes.map((campo) => `<li>• ${campo}</li>`).join('')}
        </ul>
      `,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b',
      allowOutsideClick: false,
      customClass: { popup: 'animated pulse' }
    });
  };

  const showLoading = () => {
    Swal.fire({
      title: 'Agregando cliente...',
      text: 'Procesando la información',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const faltantes = requiredFields.filter((field) => !String(formData[field] || '').trim());
    if (faltantes.length > 0) {
      showValidation(faltantes);
      return;
    }

    try {
      setLoading(true);
      showLoading();
      const payload = { ...formData, tipoCliente: 'corporativo' };
      await axios.post(`${API_URL}/clientes`, payload, { withCredentials: true });
      Swal.close();
      showSuccess();
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: 'Error al agregar cliente',
        text: error.response?.data?.message || 'No se pudo completar la acción',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #34353A 0%, #2a2b30 100%)' }}>
      <HeaderNavigation title="Clientes corporativos" subtitle="Registrar nuevo cliente" onBack={() => navigate('/clientes')} />

      <FormHeroSection
        title="Agregar Cliente Corporativo"
        description="Completa los datos fiscales y de contacto del cliente"
      />

      <FormContainer onSubmit={handleSubmit}>
        <FormFieldsGrid>
            <FormInput
              label="Nombre de la empresa *"
              name="nombreEmpresa"
              value={formData.nombreEmpresa}
              onChange={(e) => handleChange('nombreEmpresa', e.target.value)}
              placeholder="GRUPO LOGÍSTICO"
              icon={Building2}
              required
            />

            <FormInput
              label="Nombre comercial"
              name="nombreComercial"
              value={formData.nombreComercial}
              onChange={(e) => handleChange('nombreComercial', e.target.value)}
              placeholder="Alias público"
              icon={Building2}
            />

            <FormInput
              label="RUC / NIT *"
              name="ruc"
              value={formData.ruc}
              onChange={(e) => handleChange('ruc', e.target.value)}
              placeholder="Documento fiscal"
              icon={CreditCard}
              required
            />

            <FormInput
              label="Giro del negocio"
              name="giroNegocio"
              value={formData.giroNegocio}
              onChange={(e) => handleChange('giroNegocio', e.target.value)}
              placeholder="Transporte, distribución, etc"
              icon={Building2}
            />

            <div className="col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Términos de pago</label>
              <select
                value={formData.terminosPago}
                onChange={(e) => handleChange('terminosPago', e.target.value)}
                className="mt-2 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
              >
                <option value="contado">Contado</option>
                <option value="credito_7">Crédito 7 días</option>
                <option value="credito_15">Crédito 15 días</option>
                <option value="credito_30">Crédito 30 días</option>
                <option value="credito_60">Crédito 60 días</option>
                <option value="otros">Otros</option>
              </select>
            </div>

            <FormInput
              label="Correo principal *"
              name="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="correo@empresa.com"
              icon={Mail}
              required
            />

            <FormInput
              label="Teléfono *"
              name="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+503..."
              icon={Phone}
              required
            />

            <FormInput
              label="Dirección principal *"
              name="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Dirección física"
              icon={MapPin}
              required
            />

            <FormInput
              label="Dirección de facturación"
              name="direccionFacturacion"
              value={formData.direccionFacturacion}
              onChange={(e) => handleChange('direccionFacturacion', e.target.value)}
              placeholder="Si difiere de la principal"
              icon={MapPin}
            />

            <FormInput
              label="Contacto principal"
              name="contactoPrincipal.nombre"
              value={formData.contactoPrincipal.nombre}
              onChange={(e) => handleChange('contactoPrincipal.nombre', e.target.value)}
              placeholder="Nombre"
              icon={Building2}
            />

            <FormInput
              label="Cargo"
              name="contactoPrincipal.cargo"
              value={formData.contactoPrincipal.cargo}
              onChange={(e) => handleChange('contactoPrincipal.cargo', e.target.value)}
              placeholder="Gerente, Compras, etc"
              icon={Building2}
            />

            <FormInput
              label="Teléfono de contacto"
              name="contactoPrincipal.telefono"
              value={formData.contactoPrincipal.telefono}
              onChange={(e) => handleChange('contactoPrincipal.telefono', e.target.value)}
              placeholder="Teléfono directo"
              icon={Phone}
            />

            <FormInput
              label="Email de contacto"
              name="contactoPrincipal.email"
              value={formData.contactoPrincipal.email}
              onChange={(e) => handleChange('contactoPrincipal.email', e.target.value)}
              placeholder="correo@contacto.com"
              icon={Mail}
            />

            <FormTextArea
              label="Notas adicionales"
              name="notas"
              value={formData.notas || ''}
              onChange={(e) => handleChange('notas', e.target.value)}
              placeholder="Detalles o acuerdos relevantes"
            />
          </FormFieldsGrid>

        <SubmitButton
          loading={loading}
          disabled={loading}
          icon={Building2}
        >
          {loading ? 'Guardando...' : 'Agregar Cliente'}
        </SubmitButton>
      </FormContainer>
    </div>
  );
};

export default AgregarCliente;
