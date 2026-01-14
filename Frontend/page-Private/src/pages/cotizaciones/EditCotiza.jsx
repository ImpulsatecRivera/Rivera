// EditCotizacionModal.jsx - Modal OPTIMIZADO para tu hook
import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader } from 'lucide-react';

const EditCotizacionModal = ({ 
  isOpen, 
  onClose, 
  cotizacion, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    quoteName: '',
    quoteDescription: '',
    origen: '',
    destino: '',
    tipoCarga: '',
    peso: '',
    pesoUnidad: 'kg',
    volumen: '',
    volumenUnidad: 'm³',
    distanciaTotal: '',
    tiempoEstimado: '',
    precio: '',
    estado: '',
    truckType: '',
    paymentMethod: '',
    observaciones: '',
    notasInternas: '',
    valorDeclarado: '',
    valorDeclaradoMoneda: 'USD',
    categoria: '',
    esFragil: false,
    requiereRefrigeracion: false,
    temperaturaControlada: false
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos de la cotización cuando se abre el modal
  useEffect(() => {
    if (cotizacion && isOpen) {
      setFormData({
        quoteName: cotizacion.quoteName || '',
        quoteDescription: cotizacion.quoteDescription || '',
        origen: cotizacion.rutaCompleta?.origen?.nombre || cotizacion.origen || '',
        destino: cotizacion.rutaCompleta?.destino?.nombre || cotizacion.destino || '',
        tipoCarga: cotizacion.carga?.tipo || '',
        peso: cotizacion.carga?.peso?.valor || '',
        pesoUnidad: cotizacion.carga?.peso?.unidad || 'kg',
        volumen: cotizacion.carga?.volumen?.valor || '',
        volumenUnidad: cotizacion.carga?.volumen?.unidad || 'm³',
        distanciaTotal: cotizacion.distanciaTotal || '',
        tiempoEstimado: cotizacion.tiempoEstimado || '',
        precio: cotizacion.price || '',
        estado: cotizacion.status || cotizacion.estado || '',
        truckType: cotizacion.truckType || '',
        paymentMethod: cotizacion.paymentMethod || '',
        observaciones: cotizacion.observaciones || '',
        notasInternas: cotizacion.notasInternas || '',
        valorDeclarado: cotizacion.carga?.valorDeclarado?.monto || '',
        valorDeclaradoMoneda: cotizacion.carga?.valorDeclarado?.moneda || 'USD',
        categoria: cotizacion.carga?.categoria || cotizacion.categoria || '',
        esFragil: cotizacion.carga?.condicionesEspeciales?.esFragil || cotizacion.esFragil || false,
        requiereRefrigeracion: cotizacion.carga?.condicionesEspeciales?.requiereRefrigeracion || cotizacion.requiereRefrigeracion || false,
        temperaturaControlada: cotizacion.carga?.condicionesEspeciales?.temperaturaControlada || cotizacion.temperaturaControlada || false
      });
      setErrors({});
    }
  }, [cotizacion, isOpen]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.quoteName.trim()) {
      newErrors.quoteName = 'El nombre de la cotización es requerido';
    }

    if (!formData.origen.trim()) {
      newErrors.origen = 'El origen es requerido';
    }

    if (!formData.destino.trim()) {
      newErrors.destino = 'El destino es requerido';
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar guardado
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Preparar datos en el formato que espera tu API
      const datosActualizados = {
        quoteName: formData.quoteName,
        quoteDescription: formData.quoteDescription,
        price: parseFloat(formData.precio),
        status: formData.estado,
        truckType: formData.truckType,
        paymentMethod: formData.paymentMethod,
        observaciones: formData.observaciones,
        notasInternas: formData.notasInternas,
        
        // Ruta
        ruta: {
          origen: { nombre: formData.origen },
          destino: { nombre: formData.destino },
          distanciaTotal: parseFloat(formData.distanciaTotal) || 0,
          tiempoEstimado: parseFloat(formData.tiempoEstimado) || 0
        },
        
        // Carga
        carga: {
          tipo: formData.tipoCarga,
          categoria: formData.categoria,
          descripcion: formData.quoteDescription,
          peso: {
            valor: parseFloat(formData.peso) || 0,
            unidad: formData.pesoUnidad
          },
          volumen: {
            valor: parseFloat(formData.volumen) || 0,
            unidad: formData.volumenUnidad
          },
          valorDeclarado: {
            monto: parseFloat(formData.valorDeclarado) || 0,
            moneda: formData.valorDeclaradoMoneda
          },
          condicionesEspeciales: {
            esFragil: formData.esFragil,
            requiereRefrigeracion: formData.requiereRefrigeracion,
            temperaturaControlada: formData.temperaturaControlada
          }
        }
      };

      // Llamar a la función onSave que viene del hook
      await onSave(cotizacion.id || cotizacion._id, datosActualizados);
      
      // Cerrar modal
      onClose();
      
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({ general: error.message || 'Error al guardar la cotización. Intente nuevamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    if (!isSaving) {
      setFormData({});
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Editar Cotización
              </h2>
              <p className="text-sm text-white/80">
                {cotizacion?.numeroDetizacion || cotizacion?.numeroCotizacion || `#${(cotizacion?.id || '').slice(-6)}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Error General */}
        {errors.general && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-xs text-red-600">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Nombre de Cotización */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Cotización *
              </label>
              <input
                type="text"
                name="quoteName"
                value={formData.quoteName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.quoteName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Transporte de mercancía general"
              />
              {errors.quoteName && (
                <p className="mt-1 text-xs text-red-500">{errors.quoteName}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="quoteDescription"
                value={formData.quoteDescription}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe los detalles del servicio..."
              />
            </div>

            {/* Origen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origen *
              </label>
              <input
                type="text"
                name="origen"
                value={formData.origen}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.origen ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ciudad de origen"
              />
              {errors.origen && (
                <p className="mt-1 text-xs text-red-500">{errors.origen}</p>
              )}
            </div>

            {/* Destino */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destino *
              </label>
              <input
                type="text"
                name="destino"
                value={formData.destino}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.destino ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ciudad de destino"
              />
              {errors.destino && (
                <p className="mt-1 text-xs text-red-500">{errors.destino}</p>
              )}
            </div>

            {/* Distancia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distancia Total (km)
              </label>
              <input
                type="number"
                name="distanciaTotal"
                value={formData.distanciaTotal}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>

            {/* Tiempo Estimado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo Estimado (horas)
              </label>
              <input
                type="number"
                name="tiempoEstimado"
                value={formData.tiempoEstimado}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>

            {/* Tipo de Carga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Carga
              </label>
              <select
                name="tipoCarga"
                value={formData.tipoCarga}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Seleccionar tipo</option>
                <option value="general">General</option>
                <option value="refrigerada">Refrigerada</option>
                <option value="peligrosa">Peligrosa</option>
                <option value="fragil">Frágil</option>
                <option value="liquida">Líquida</option>
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <input
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ej: Electrónicos"
              />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <select
                  name="pesoUnidad"
                  value={formData.pesoUnidad}
                  onChange={handleChange}
                  className="w-24 px-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                  <option value="ton">ton</option>
                </select>
              </div>
            </div>

            {/* Volumen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volumen
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="volumen"
                  value={formData.volumen}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <select
                  name="volumenUnidad"
                  value={formData.volumenUnidad}
                  onChange={handleChange}
                  className="w-24 px-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="m³">m³</option>
                  <option value="ft³">ft³</option>
                </select>
              </div>
            </div>

            {/* Valor Declarado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Declarado
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="valorDeclarado"
                  value={formData.valorDeclarado}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <select
                  name="valorDeclaradoMoneda"
                  value={formData.valorDeclaradoMoneda}
                  onChange={handleChange}
                  className="w-24 px-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {/* Tipo de Vehículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Vehículo
              </label>
              <select
                name="truckType"
                value={formData.truckType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Seleccionar tipo</option>
                <option value="camion">Camión</option>
                <option value="camioneta">Camioneta</option>
                <option value="trailer">Tráiler</option>
                <option value="furgon">Furgón</option>
              </select>
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Total (USD) *
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.precio ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.precio && (
                <p className="mt-1 text-xs text-red-500">{errors.precio}</p>
              )}
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Seleccionar método</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="credito">Crédito</option>
              </select>
            </div>

            {/* Condiciones Especiales */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Condiciones Especiales
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="esFragil"
                    checked={formData.esFragil}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Carga Frágil</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requiereRefrigeracion"
                    checked={formData.requiereRefrigeracion}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Requiere Refrigeración</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="temperaturaControlada"
                    checked={formData.temperaturaControlada}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Temperatura Controlada</span>
                </label>
              </div>
            </div>

            {/* Observaciones */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Notas para el cliente..."
              />
            </div>

            {/* Notas Internas */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Internas
              </label>
              <textarea
                name="notasInternas"
                value={formData.notasInternas}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Notas privadas del equipo..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            * Campos requeridos
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 font-medium flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default EditCotizacionModal;