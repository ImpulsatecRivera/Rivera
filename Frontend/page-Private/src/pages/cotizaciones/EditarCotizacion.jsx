import React, { useState } from 'react';
import { ArrowLeft, User, Calendar, MapPin, Truck, CreditCard, FileText } from 'lucide-react';

export default function CotizacionForm() {
  const [formData, setFormData] = useState({
    cliente: 'Daniel Wilfredo',
    metodoPago: 'Efectivo',
    lugarDestino: 'Morazán, Chalatenango',
    tipoCamion: 'Seco',
    fechaEntrega: '2025-11-25',
    descripcion: 'Transporte de lotes de Diana'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoBack = () => {
    // Opción 1: Usar history.back() del navegador
    window.history.back();
    
    // Opción 2: Si usas React Router, descomenta estas líneas:
    // const navigate = useNavigate();
    // navigate(-1);
    
    // Opción 3: Redirigir a una ruta específica
    // window.location.href = '/menu-principal';
  };

  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: '#34353A'}}>
      {/* Header */}
      <div className="text-white p-4 cursor-pointer" style={{backgroundColor: '#34353A'}} onClick={handleGoBack}>
        <div className="flex items-center gap-3">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Volver al menú principal</span>
        </div>
      </div>

      {/* Main Content - Expandido a toda la pantalla */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-full overflow-y-auto w-full">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cotización #1</h1>
            <p className="text-gray-500">Sistema de gestión - Rivera</p>
          </div>

          {/* Client Information Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 border-2 border-gray-400 rounded bg-gray-100"></div>
              <label className="font-semibold text-gray-700">INFORMACIÓN DEL CLIENTE</label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => handleInputChange('cliente', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.metodoPago}
                    onChange={(e) => handleInputChange('metodoPago', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lugar de destino</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lugarDestino}
                    onChange={(e) => handleInputChange('lugarDestino', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de camión</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.tipoCamion}
                    onChange={(e) => handleInputChange('tipoCamion', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de entrega</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 border-2 border-gray-400 rounded bg-gray-100"></div>
              <label className="font-semibold text-gray-700">RESUMEN DE LA COTIZACIÓN</label>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-2">ESTADO ACTUAL</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600 font-medium">Pendiente</span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-sm font-medium text-gray-700 block mb-2">PRECIO TOTAL</span>
                  <div className="text-2xl font-bold text-green-600">$1,000</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Guardar borrador
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Enviar cotización
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}