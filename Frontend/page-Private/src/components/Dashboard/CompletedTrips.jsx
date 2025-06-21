import React from 'react';
import { ShoppingCart, MapPin, Home, Package, MoreHorizontal } from 'lucide-react';

const CompletedTrips = () => {
  const completedTrips = [
    { id: 1, type: 'Grocery', subtitle: '5 min ago • Supermercado plaza', icon: ShoppingCart, color: 'bg-blue-500' },
    { id: 2, type: 'Transportation', subtitle: '10 min ago • Ruta los chimos', icon: ShoppingCart, color: 'bg-purple-500' },
    { id: 3, type: 'Housing', subtitle: '15 min ago • Sector norte', icon: Home, color: 'bg-orange-500' },
    { id: 4, type: 'Food and Drink', subtitle: '20 min ago • Delivery rápido', icon: Package, color: 'bg-red-500' },
    { id: 5, type: 'Food and Drink', subtitle: '25 min ago • Pedido especial', icon: Package, color: 'bg-red-500' },
    { id: 6, type: 'Food and Drink', subtitle: '30 min ago • Delivery express', icon: Package, color: 'bg-red-500' },
    { id: 7, type: 'Entertainment', subtitle: '35 min ago • Centro comercial', icon: MapPin, color: 'bg-green-500' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-900">Viajes finalizados</h3>
        <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline">Ver todos</button>
      </div>
      <div className="bg-gray-50 rounded-lg p-2 max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {completedTrips.map((trip) => (
            <div key={trip.id} className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-100">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 ${trip.color} rounded-full flex items-center justify-center`}>
                  <trip.icon size={12} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-900">{trip.type}</h4>
                  <p className="text-xs text-gray-500" style={{ fontSize: '10px' }}>{trip.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal size={12} className="text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompletedTrips;