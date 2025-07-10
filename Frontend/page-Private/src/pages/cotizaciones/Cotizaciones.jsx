import React from 'react';
import { Trash2 } from 'lucide-react';

export default function CotizacionesComponent() {
  const cotizaciones = [
    {
      id: 1,
      cliente: 'wilfrido granados',
      destino: 'MORAZÁN, CHALATENANGO',
      estado: 'Aprobada',
      colorEstado: 'bg-green-100 text-green-800'
    },
    {
      id: 2,
      cliente: 'wilfrido granados',
      destino: 'MORAZÁN, CHALATENANGO',
      estado: 'Pendiente',
      colorEstado: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 3,
      cliente: 'wilfrido granados',
      destino: 'MORAZÁN, CHALATENANGO',
      estado: 'Rechazada',
      colorEstado: 'bg-red-100 text-red-800'
    },
    {
      id: 4,
      cliente: 'wilfrido granados',
      destino: 'MORAZÁN, CHALATENANGO',
      estado: 'Aprobada',
      colorEstado: 'bg-green-100 text-green-800'
    },
    {
      id: 5,
      cliente: 'wilfrido granados',
      destino: 'MORAZÁN, CHALATENANGO',
      estado: 'Pendiente',
      colorEstado: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 6,
      cliente: 'wilfrido granados',
      destino: 'MORAZÁN, CHALATENANGO',
      estado: 'Aprobada',
      colorEstado: 'bg-green-100 text-green-800'
    }
  ];

  return (
    <div className="w-full h-screen p-4" style={{ backgroundColor: '#34353A' }}>
      <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Cotizaciones</h1>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {cotizaciones.map((cotizacion) => (
              <div 
                key={cotizacion.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow relative h-64 flex flex-col"
              >
                {/* Botón de eliminar en la esquina superior derecha */}
                <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <Trash2 size={18} />
                </button>
                
                {/* Layout vertical como en la imagen de referencia */}
                <div className="flex flex-col items-center text-center flex-1">
                  {/* Icono del camión - arriba */}
                  <div className="mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center relative">
                      {/* Cuerpo del camión */}
                      <div className="w-12 h-8 bg-yellow-600 rounded-md relative">
                        {/* Cabina */}
                        <div className="absolute -left-2 top-1 w-4 h-6 bg-yellow-700 rounded-l-md"></div>
                        {/* Ruedas */}
                        <div className="absolute -bottom-1 left-1 w-3 h-3 bg-gray-800 rounded-full"></div>
                        <div className="absolute -bottom-1 right-1 w-3 h-3 bg-gray-800 rounded-full"></div>
                      </div>
                      {/* Logo RIVIERA */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                          RIVIERA
                        </div>
                      </div>
                      {/* Hojas decorativas */}
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
                      <div className="absolute -top-1 right-1 w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Información - Layout vertical */}
                  <div className="w-full flex-1 flex flex-col justify-between">
                    {/* Parte superior con título y cliente */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800 text-base mb-2">Cotización viaje</h3>
                      <p className="text-sm text-gray-500 mb-3">
                        cliente: {cotizacion.cliente}
                      </p>
                    </div>
                    
                    {/* Parte inferior con destino y estado */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-800 uppercase leading-tight flex-1">
                        {cotizacion.destino}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ml-2 ${cotizacion.colorEstado}`}>
                        {cotizacion.estado}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}