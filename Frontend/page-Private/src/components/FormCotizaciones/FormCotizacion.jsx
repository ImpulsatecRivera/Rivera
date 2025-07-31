// FormsTravels/CotizacionForm.jsx
import React, { useState } from 'react';
import { ArrowLeft, Save, Calculator, User, MapPin, Package, Truck, DollarSign, Calendar, FileText, Phone, Mail, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CotizacionForm = () => {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    // Información del cliente
    cliente: '',
    telefono: '',
    email: '',
    
    // Información del envío
    direccionOrigen: '',
    direccionDestino: '',
    tipoViaje: '',
    peso: '',
    volumen: '',
    descripcion: '',
    
    // Información del vehículo
    tipoVehiculo: '',
    conductor: '',
    placaVehiculo: '',
    
    // Información financiera
    montoBase: '',
    impuestos: '',
    condicionesPago: '',
    
    // Fechas
    fechaServicio: '',
    fechaVencimiento: '',
    validez: '15',
    
    // Observaciones
    observaciones: ''
  });

  // Estados para validación y UI
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Opciones para selects
  const tiposViaje = [
    'Carga pesada',
    'Mudanza',
    'Materiales',
    'Distribución',
    'Logística',
    'Transporte'
  ];

  const tiposVehiculo = [
    'Camión de carga pesada',
    'Camión de mudanza',
    'Camión de carga',
    'Camión refrigerado',
    'Camión logístico',
    'Camión especializado'
  ];

  const condicionesPago = [
    'Pago completo al finalizar el servicio',
    'Pago 50% al inicio, 50% al completar el servicio',
    'Pago 30% adelanto, 70% contraentrega',
    'Pago 40% adelanto, 60% contraentrega',
    'Pago 25% adelanto, 75% contraentrega',
    'Pago al contado'
  ];

  // Función para manejar cambios en inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Calcular total automáticamente
    if (field === 'montoBase' || field === 'impuestos') {
      calculateTotal(field, value);
    }
  };

  // Función para calcular total
  const calculateTotal = (changedField, changedValue) => {
    const montoBase = changedField === 'montoBase' ? parseFloat(changedValue) || 0 : parseFloat(formData.montoBase) || 0;
    const impuestos = changedField === 'impuestos' ? parseFloat(changedValue) || 0 : parseFloat(formData.impuestos) || 0;
    
    const total = montoBase + impuestos;
    
    setFormData(prev => ({
      ...prev,
      montoTotal: total.toFixed(2)
    }));
  };

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.cliente.trim()) newErrors.cliente = 'El nombre del cliente es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.direccionOrigen.trim()) newErrors.direccionOrigen = 'La dirección de origen es requerida';
    if (!formData.direccionDestino.trim()) newErrors.direccionDestino = 'La dirección de destino es requerida';
    if (!formData.tipoViaje) newErrors.tipoViaje = 'Selecciona un tipo de viaje';
    if (!formData.peso.trim()) newErrors.peso = 'El peso es requerido';
    if (!formData.volumen.trim()) newErrors.volumen = 'El volumen es requerido';
    if (!formData.montoBase.trim()) newErrors.montoBase = 'El monto base es requerido';
    if (!formData.fechaServicio) newErrors.fechaServicio = 'La fecha de servicio es requerida';

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    // Validación de teléfono (formato salvadoreño)
    const phoneRegex = /^\+503\s\d{4}-\d{4}$/;
    if (formData.telefono && !phoneRegex.test(formData.telefono)) {
      newErrors.telefono = 'Formato: +503 1234-5678';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica para enviar a la API
      console.log('Datos de la cotización:', formData);
      
      setShowSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/cotizaciones');
      }, 2000);
      
    } catch (error) {
      console.error('Error al crear cotización:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para volver
  const handleVolver = () => {
    navigate('/cotizaciones');
  };

  // Modal de éxito
  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Cotización Creada!</h2>
          <p className="text-gray-600 mb-6">La cotización ha sido creada exitosamente.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full min-h-screen p-4" style={{ backgroundColor: '#34353A' }}>
        <div className="w-full bg-white rounded-2xl shadow-2xl p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleVolver}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-300 flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Volver</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Nueva Cotización</h1>
                <p className="text-slate-600">Crear una nueva cotización de transporte</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Calculator className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Información del Cliente */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <User className="text-blue-600" size={24} />
                Información del Cliente
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => handleInputChange('cliente', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.cliente ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="Ej: Juan Pérez García"
                  />
                  {errors.cliente && <p className="text-red-500 text-sm mt-1">{errors.cliente}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.telefono ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="+503 1234-5678"
                  />
                  {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Información del Envío */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Package className="text-emerald-600" size={24} />
                Información del Envío
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dirección de Origen *
                  </label>
                  <input
                    type="text"
                    value={formData.direccionOrigen}
                    onChange={(e) => handleInputChange('direccionOrigen', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                      errors.direccionOrigen ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="Dirección completa de origen"
                  />
                  {errors.direccionOrigen && <p className="text-red-500 text-sm mt-1">{errors.direccionOrigen}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dirección de Destino *
                  </label>
                  <input
                    type="text"
                    value={formData.direccionDestino}
                    onChange={(e) => handleInputChange('direccionDestino', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                      errors.direccionDestino ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="Dirección completa de destino"
                  />
                  {errors.direccionDestino && <p className="text-red-500 text-sm mt-1">{errors.direccionDestino}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Viaje *
                  </label>
                  <select
                    value={formData.tipoViaje}
                    onChange={(e) => handleInputChange('tipoViaje', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                      errors.tipoViaje ? 'border-red-300' : 'border-slate-200'
                    }`}
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposViaje.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                  {errors.tipoViaje && <p className="text-red-500 text-sm mt-1">{errors.tipoViaje}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Peso *
                  </label>
                  <input
                    type="text"
                    value={formData.peso}
                    onChange={(e) => handleInputChange('peso', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                      errors.peso ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="Ej: 1,500 kg"
                  />
                  {errors.peso && <p className="text-red-500 text-sm mt-1">{errors.peso}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Volumen *
                  </label>
                  <input
                    type="text"
                    value={formData.volumen}
                    onChange={(e) => handleInputChange('volumen', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                      errors.volumen ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="Ej: 10 m³"
                  />
                  {errors.volumen && <p className="text-red-500 text-sm mt-1">{errors.volumen}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción del Servicio
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Describe los detalles del servicio de transporte"
                />
              </div>
            </div>

            {/* Información del Vehículo */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Truck className="text-purple-600" size={24} />
                Información del Vehículo
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Vehículo
                  </label>
                  <select
                    value={formData.tipoVehiculo}
                    onChange={(e) => handleInputChange('tipoVehiculo', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Seleccionar vehículo</option>
                    {tiposVehiculo.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Conductor Asignado
                  </label>
                  <input
                    type="text"
                    value={formData.conductor}
                    onChange={(e) => handleInputChange('conductor', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nombre del conductor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Placa del Vehículo
                  </label>
                  <input
                    type="text"
                    value={formData.placaVehiculo}
                    onChange={(e) => handleInputChange('placaVehiculo', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ej: P-123456"
                  />
                </div>
              </div>
            </div>

            {/* Información Financiera */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <DollarSign className="text-orange-600" size={24} />
                Información Financiera
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Monto Base * ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.montoBase}
                    onChange={(e) => handleInputChange('montoBase', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                      errors.montoBase ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.montoBase && <p className="text-red-500 text-sm mt-1">{errors.montoBase}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Impuestos ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.impuestos}
                    onChange={(e) => handleInputChange('impuestos', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Total ($)
                  </label>
                  <input
                    type="text"
                    value={formData.montoTotal || '0.00'}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Condiciones de Pago
                </label>
                <select
                  value={formData.condicionesPago}
                  onChange={(e) => handleInputChange('condicionesPago', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Seleccionar condiciones</option>
                  {condicionesPago.map(condicion => (
                    <option key={condicion} value={condicion}>{condicion}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Calendar className="text-cyan-600" size={24} />
                Fechas y Validez
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Servicio *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaServicio}
                    onChange={(e) => handleInputChange('fechaServicio', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${
                      errors.fechaServicio ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                  {errors.fechaServicio && <p className="text-red-500 text-sm mt-1">{errors.fechaServicio}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fechaVencimiento}
                    onChange={(e) => handleInputChange('fechaVencimiento', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Validez (días)
                  </label>
                  <input
                    type="number"
                    value={formData.validez}
                    onChange={(e) => handleInputChange('validez', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="15"
                  />
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <FileText className="text-yellow-600" size={24} />
                Observaciones Adicionales
              </h2>
              
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Cualquier información adicional importante para el servicio..."
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 justify-end pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleVolver}
                className="px-8 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors duration-200 font-medium"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Crear Cotización
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de éxito */}
      {showSuccess && <SuccessModal />}
    </>
  );
};

export default CotizacionForm;