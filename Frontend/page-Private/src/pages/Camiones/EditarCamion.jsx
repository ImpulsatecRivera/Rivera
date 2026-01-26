import React, { useState, useEffect } from 'react';
import { ChevronDown, X, Check, Truck } from 'lucide-react';

export default function EditarCamion() {
  const [formData, setFormData] = useState({
    nombre: '',
    tarjetaCirculacion: '',
    placa: '',
    proveedor: '',
    descripcion: '',
    motorista: '',
    marca: '',
    modelo: '',
    año: '',
    estado: ''
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proveedores, setProveedores] = useState([
    { _id: '1', companyName: 'Proveedor A' },
    { _id: '2', companyName: 'Proveedor B' },
    { _id: '3', companyName: 'Proveedor C' }
  ]);
  const [motoristas, setMotoristas] = useState([
    { _id: '1', name: 'Juan', lastName: 'Pérez' },
    { _id: '2', name: 'María', lastName: 'González' },
    { _id: '3', name: 'Carlos', lastName: 'Rodríguez' }
  ]);

  // Estados disponibles
  const estadosDisponibles = [
    { value: 'DISPONIBLE', label: 'Disponible', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'EN RUTA', label: 'En Ruta', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'MANTENIMIENTO', label: 'Mantenimiento', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'NO DISPONIBLE', label: 'No Disponible', color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'SIN ESTADO', label: 'Sin Estado', color: 'bg-gray-100 text-gray-800 border-gray-300' }
  ];

  const handleInputChange = (field, value) => {
    console.log(`Cambiando ${field} a:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const updateData = {
        name: formData.nombre,
        circulationCard: formData.tarjetaCirculacion,
        licensePlate: formData.placa,
        supplierId: formData.proveedor,
        description: formData.descripcion,
        driverId: formData.motorista,
        brand: formData.marca,
        model: formData.modelo,
        age: formData.año,
        state: formData.estado
      };

      console.log('Enviando datos:', updateData);

      // Simular envío al backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar el camión: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    console.log('Volver a lista de camiones');
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    console.log('Continuar - volver a lista');
  };

  // Obtener el color del estado seleccionado
  const getEstadoColor = (estado) => {
    const estadoObj = estadosDisponibles.find(e => e.value === estado);
    return estadoObj ? estadoObj.color : 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del camión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-40 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in shadow-2xl">
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Truck className="w-6 h-6 mr-3" />
            <h2 className="text-lg font-semibold">Editar Camión</h2>
          </div>
          <button onClick={handleGoBack} className="p-1 hover:bg-gray-700 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del camión
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Nombre del camión"
              />
            </div>

            {/* Tarjeta de circulación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarjeta de circulación
              </label>
              <input
                type="text"
                value={formData.tarjetaCirculacion}
                onChange={(e) => handleInputChange('tarjetaCirculacion', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Número de tarjeta"
              />
            </div>

            {/* Placa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placa *
              </label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) => handleInputChange('placa', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="ABC-123"
              />
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Ford, Chevrolet, etc."
              />
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="F-150, Silverado, etc."
              />
            </div>

            {/* Año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <input
                type="text"
                value={formData.año}
                onChange={(e) => handleInputChange('año', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="2020"
              />
              <p className="text-xs text-gray-500 mt-1">Año de fabricación (1900-2030)</p>
            </div>

            {/* ESTADO DEL CAMIÓN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🚦 Estado del camión
              </label>
              <div className="relative">
                <select
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium cursor-pointer"
                  style={{ paddingRight: '40px' }}
                >
                  <option value="">Seleccionar estado</option>
                  {estadosDisponibles.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {formData.estado && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(formData.estado)}`}>
                    {estadosDisponibles.find(e => e.value === formData.estado)?.label || formData.estado}
                  </span>
                </div>
              )}
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor
              </label>
              <div className="relative">
                <select
                  value={formData.proveedor}
                  onChange={(e) => handleInputChange('proveedor', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.companyName || p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Motorista */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motorista
              </label>
              <div className="relative">
                <select
                  value={formData.motorista}
                  onChange={(e) => handleInputChange('motorista', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">Seleccionar motorista</option>
                  {motoristas
                    .filter(m => m.rol === 'motorista') // ✅ FILTRAR: Solo motoristas, excluir auxiliares
                    .map((m) => (
                    <option key={m._id} value={m._id}>
                      {(m.name || m.firstName || '') + ' ' + (m.lastName || m.apellido || '')}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Descripción */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm h-24 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Descripción adicional del camión, características especiales, etc."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-md font-medium text-white transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95 shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Actualizando...
                </div>
              ) : (
                '✓ Actualizar Camión'
              )}
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center animate-bounce-in shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">¡Camión actualizado!</h3>
            <p className="text-gray-600 mb-8">Los cambios se han guardado exitosamente</p>
            <button
              onClick={handleContinue}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium w-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}