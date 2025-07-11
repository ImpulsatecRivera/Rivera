import React, { useState } from 'react';
import { ArrowLeft, FileText, User, Calendar, MapPin, Truck, CreditCard, Save } from 'lucide-react';

export default function EditarCotizacionForm() {
  const [formData, setFormData] = useState({
    cliente: 'Daniel Wilfredo',
    apellido: '',
    email: 'daniel.wilfredo@email.com',
    metodoPago: 'Efectivo',
    fechaEntrega: '2025-11-25',
    lugarDestino: 'Morazán, Chalatenango',
    tipoCamion: 'Seco',
    direccion: '',
    descripcion: 'Transporte de lotes de Diana'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-lg font-medium text-white">Editar Cotización</span>
        </div>
      </div>

      {/* Main Content - Gran bloque blanco con dimensiones similares a la imagen */}
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-8xl mx-auto" style={{height: '90vh'}}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cotización #1</h1>
              <p className="text-sm text-gray-500">Sistema de gestión - Rivera</p>
            </div>
          </div>
        </div>

        {/* Client Information Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4" defaultChecked />
            <label className="font-bold text-gray-700 text-lg">INFORMACIÓN DEL CLIENTE</label>
          </div>
          
          <div className="space-y-6">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => handleInputChange('cliente', e.target.value)}
                    placeholder="Nombre del cliente"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                  placeholder="Apellido"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Correo electrónico"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de pago
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.metodoPago}
                    onChange={(e) => handleInputChange('metodoPago', e.target.value)}
                    placeholder="Método de pago"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de entrega
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lugar de destino
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lugarDestino}
                    onChange={(e) => handleInputChange('lugarDestino', e.target.value)}
                    placeholder="Lugar de destino"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de camión
                </label>
                <div className="relative">
                  <Truck className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.tipoCamion}
                    onChange={(e) => handleInputChange('tipoCamion', e.target.value)}
                    placeholder="Tipo de camión"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Dirección"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    placeholder="Descripción del servicio"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4" defaultChecked />
            <label className="font-bold text-gray-700 text-lg">RESUMEN DE LA COTIZACIÓN</label>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-2">ESTADO ACTUAL</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-orange-600 font-medium">Pendiente</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-600 block mb-2">PRECIO TOTAL</span>
              <div className="text-3xl font-bold text-green-600">$1,000</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 font-medium">
            <Save className="w-4 h-4" />
            Guardar borrador
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
            Enviar cotización
          </button>
        </div>
      </div>
    </div>
  );
}