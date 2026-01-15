import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Truck, FileText, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { config } from '../../config';
import { api } from '../../Context/authContext';


const CreateMantenimientoPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [camiones, setCamiones] = useState([]);
  
  const [formData, setFormData] = useState({
    fecha_mantenimiento: '',
    tipo_de_mantenimiento: '',
    descripcion: '',
    ciculatioCard: '',
    estado: 'pendiente',
    detalles: [
      { concepto: '', cantidad: 1, precioUnitario: 0 }
    ]
  });

  const tipoMantenimientoOptions = [
    { value: 'preventivo', label: 'Preventivo' },
    { value: 'correctivo', label: 'Correctivo' },
    { value: 'llantas', label: 'Llantas' },
    { value: 'rines', label: 'Rines' },
    { value: 'furgo', label: 'Furgón' },
    { value: 'madera_furgo', label: 'Madera de Furgón' },
    { value: 'torno', label: 'Torno' },
    { value: 'bomba', label: 'Bomba' },
    { value: 'reparacion_turbo', label: 'Reparación del Turbo' },
    { value: 'otros', label: 'Otros' }
  ];

  useEffect(() => {
    fetchCamiones();
  }, []);

  const fetchCamiones = async () => {
    try {
      const response = await api.get(`${config.api.API_URL}/camiones`);
setCamiones(response.data.data || []);

    } catch (err) {
      console.error('Error al cargar camiones:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDetalleChange = (index, field, value) => {
    const newDetalles = [...formData.detalles];
    newDetalles[index][field] = field === 'cantidad' || field === 'precioUnitario' 
      ? parseFloat(value) || 0 
      : value;
    
    setFormData(prev => ({
      ...prev,
      detalles: newDetalles
    }));
  };

  const agregarDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, { concepto: '', cantidad: 1, precioUnitario: 0 }]
    }));
  };

  const eliminarDetalle = (index) => {
    if (formData.detalles.length > 1) {
      const newDetalles = formData.detalles.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        detalles: newDetalles
      }));
    }
  };

  const calcularSubtotal = (cantidad, precioUnitario) => {
    return cantidad * precioUnitario;
  };

  const calcularTotal = () => {
    return formData.detalles.reduce((sum, detalle) => 
      sum + calcularSubtotal(detalle.cantidad, detalle.precioUnitario), 0
    );
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cantidad);
  };

  const handleSubmit = async () => {
    if (!formData.fecha_mantenimiento) {
      setError('La fecha es requerida');
      return;
    }
    if (!formData.tipo_de_mantenimiento) {
      setError('El tipo de mantenimiento es requerido');
      return;
    }
    if (!formData.ciculatioCard) {
      setError('Debe seleccionar un camión');
      return;
    }
    if (!formData.descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }

    const detallesValidos = formData.detalles.every(d => 
      d.concepto.trim() && d.cantidad > 0 && d.precioUnitario > 0
    );
    
    if (!detallesValidos) {
      setError('Todos los detalles deben estar completos con valores válidos');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fechaLocal = new Date(formData.fecha_mantenimiento + 'T12:00:00');

const dataToSend = {
  fecha_mantenimiento: fechaLocal.toISOString(),
  mes: fechaLocal.getMonth() + 1,
  ano: fechaLocal.getFullYear(),
  tipo_de_mantenimiento: formData.tipo_de_mantenimiento,
  descripcion: formData.descripcion,
  ciculatioCard: formData.ciculatioCard,
  estado: 'pendiente',
  detalles: formData.detalles.map(d => ({
    concepto: d.concepto,
    cantidad: d.cantidad,
    precioUnitario: d.precioUnitario,
    subTotal: calcularSubtotal(d.cantidad, d.precioUnitario)
  }))
};


      console.log('Datos enviados al backend:', dataToSend);

     const response = await api.post(
  `${config.api.API_URL}/mantenimientos`,
  dataToSend
);

const result = response.data;

      console.log('Mantenimiento creado:', result);
      
      navigate('/mantenimientos');

    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/mantenimientos')}
            className="flex items-center gap-2 text-[#5F8EAD] hover:text-[#34353A] font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Mantenimientos
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#34353A] to-[#5F8EAD] p-4 rounded-2xl shadow-lg">
              <Plus className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#34353A] mb-1">
                Nuevo Mantenimiento
              </h1>
              <p className="text-gray-600">
                Registra un nuevo mantenimiento para tu flota
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                Estado: Pendiente
              </span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Información Básica */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <Calendar className="text-[#5F8EAD]" size={22} />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Fecha de Mantenimiento *
                </label>
                <input
                  type="date"
                  name="fecha_mantenimiento"
                  value={formData.fecha_mantenimiento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Tipo de Mantenimiento *
                </label>
                <select
                  name="tipo_de_mantenimiento"
                  value={formData.tipo_de_mantenimiento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                >
                  <option value="">Seleccionar tipo...</option>
                  {tipoMantenimientoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Camión */}
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Camión *
                </label>
                <select
                  name="ciculatioCard"
                  value={formData.ciculatioCard}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                >
                  <option value="">Seleccionar camión...</option>
                  {camiones.map(camion => (
                    <option key={camion._id} value={camion._id}>
                      {camion.licensePlate} - {camion.brand} {camion.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe los trabajos realizados..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Detalles/Conceptos */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#34353A] flex items-center gap-2">
                <FileText className="text-[#5D9646]" size={22} />
                Detalles de Costos
              </h3>
              <button
                onClick={agregarDetalle}
                className="px-4 py-2 bg-[#5D9646] bg-opacity-20 text-[#5D9646] rounded-lg hover:bg-[#5D9646] hover:bg-opacity-30 transition-colors font-semibold text-sm flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.detalles.map((detalle, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Concepto */}
                    <div className="md:col-span-5">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Concepto *
                      </label>
                      <input
                        type="text"
                        value={detalle.concepto}
                        onChange={(e) => handleDetalleChange(index, 'concepto', e.target.value)}
                        placeholder="Ej: Cambio de aceite"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                      />
                    </div>

                    {/* Cantidad */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        value={detalle.cantidad}
                        onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                        min="1"
                        step="1"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                      />
                    </div>

                    {/* Precio Unitario */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Precio Unit. *
                      </label>
                      <input
                        type="number"
                        value={detalle.precioUnitario}
                        onChange={(e) => handleDetalleChange(index, 'precioUnitario', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Subtotal
                      </label>
                      <div className="px-3 py-2 bg-[#5D9646] bg-opacity-10 rounded-lg font-bold text-[#5D9646] text-sm">
                        {formatearMoneda(calcularSubtotal(detalle.cantidad, detalle.precioUnitario))}
                      </div>
                    </div>

                    {/* Botón Eliminar */}
                    <div className="md:col-span-1 flex items-end">
                      <button
                        onClick={() => eliminarDetalle(index)}
                        disabled={formData.detalles.length === 1}
                        className="w-full p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={18} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-[#34353A] to-[#5D9646] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-white text-lg font-semibold">Total del Mantenimiento</span>
              <span className="text-white text-4xl font-bold">
                {formatearMoneda(calcularTotal())}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/mantenimientos')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Guardar Mantenimiento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMantenimientoPage;