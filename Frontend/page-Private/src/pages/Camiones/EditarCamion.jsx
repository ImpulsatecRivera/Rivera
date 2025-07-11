import React, { useState, useEffect } from 'react';
import { ChevronDown, X, Check, Truck } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export default function TruckEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    tarjetaCirculacion: '',
    placa: '',
    proveedor: '',
    descripcion: '',
    motorista: '',
    marca: '',
    modelo: '',
    año: ''
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [motoristas, setMotoristas] = useState([]);

  useEffect(() => {
    const fetchTruckData = async () => {
      try {
        setLoading(true);

        const truckResponse = await fetch(`http://localhost:4000/api/camiones/${id}`);
        const truckData = await truckResponse.json();

        const proveedoresResponse = await fetch('http://localhost:4000/api/proveedores');
        const proveedoresData = await proveedoresResponse.json();

        const motoristasResponse = await fetch('http://localhost:4000/api/motoristas');
        const motoristasData = await motoristasResponse.json();

        setFormData({
          nombre: truckData.name || '',
          tarjetaCirculacion: truckData.ciculatioCard || truckData.circulationCard || '',
          placa: truckData.licensePlate || '',
          proveedor: truckData.supplierId?._id || truckData.supplierId || '',
          descripcion: truckData.description || '',
          motorista: truckData.driverId?._id || truckData.driverId || '',
          marca: truckData.brand || '',
          modelo: truckData.model || '',
          año: truckData.age || truckData.year || ''
        });

        setProveedores(proveedoresData);
        setMotoristas(motoristasData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTruckData();
    }
  }, [id]);

  const handleInputChange = (field, value) => {
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
        age: formData.año
      };

      const response = await fetch(`http://localhost:4000/api/camiones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        throw new Error('Error al actualizar el camión');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar el camión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/camiones');
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    navigate('/camiones');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del camión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Truck className="w-6 h-6 mr-3" />
            <h2 className="text-lg font-semibold">Editar Camión</h2>
          </div>
          <button onClick={handleGoBack} className="p-1 hover:bg-gray-700 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del camión</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Nombre del camión"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarjeta de circulación</label>
              <input
                type="text"
                value={formData.tarjetaCirculacion}
                onChange={(e) => handleInputChange('tarjetaCirculacion', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Tarjeta de circulación"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) => handleInputChange('placa', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Placa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Marca"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Modelo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
              <div className="relative">
                <select
                  value={formData.proveedor}
                  onChange={(e) => handleInputChange('proveedor', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motorista</label>
              <div className="relative">
                <select
                  value={formData.motorista}
                  onChange={(e) => handleInputChange('motorista', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="">Seleccionar motorista</option>
                  {motoristas.map((m) => (
                    <option key={m._id} value={m._id}>
                      {(m.name || m.firstName || '') + ' ' + (m.lastName || m.apellido || '')}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm h-24 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Descripción del camión"
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
                  : 'bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Actualizando...
                </div>
              ) : (
                'Actualizar'
              )}
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg w-full max-w-sm p-8 text-center animate-bounce-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">¡Camión actualizado!</h3>
            <p className="text-gray-600 mb-8">Los cambios se han guardado exitosamente</p>
            <button
              onClick={handleContinue}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-medium w-full transition-all duration-200 hover:scale-105 active:scale-95"
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