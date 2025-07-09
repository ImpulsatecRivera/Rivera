import React from 'react';
<<<<<<< HEAD
import { ShoppingCart, Bus, Home, UtensilsCrossed, Play } from 'lucide-react';

const CompletedTrips = () => {
  const completedTrips = [
    { id: 1, type: 'Grocery', subtitle: '5:12 pm • Belanja di pasar', icon: ShoppingCart, color: 'bg-blue-500' },
    { id: 2, type: 'Transportation', subtitle: '5:12 pm • Naik bus umum', icon: Bus, color: 'bg-purple-500' },
    { id: 3, type: 'Housing', subtitle: '5:12 pm • Bayar Listrik', icon: Home, color: 'bg-orange-500' },
    { id: 4, type: 'Food and Drink', subtitle: '5:12 pm • Makan Steak', icon: UtensilsCrossed, color: 'bg-red-500' },
    { id: 5, type: 'Food and Drink', subtitle: '5:12 pm • Makan Steak', icon: UtensilsCrossed, color: 'bg-red-500' },
    { id: 6, type: 'Food and Drink', subtitle: '5:12 pm • Makan Steak', icon: UtensilsCrossed, color: 'bg-red-500' },
    { id: 7, type: 'Entertainment', subtitle: '5:12 pm • Nonton Bioskop', icon: Play, color: 'bg-green-500' }
  ];

  return (
    <div className="flex bg-white w-full max-w-md overflow-hidden">
      {/* Lista de elementos */}
      <div className="flex-1 py-2">
        <div className="space-y-4">
          {completedTrips.map((trip) => (
            <div key={trip.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${trip.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <trip.icon size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900">{trip.type}</h4>
                  <p className="text-sm text-gray-500">{trip.subtitle}</p>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full flex-shrink-0 mr-2" style={{backgroundColor: '#5D9646'}}></div>
=======
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
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-900">Viajes finalizados</h3>
        <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline">Ver todos</button>
      </div>
      <div className="bg-gray-50 rounded-lg p-2 flex-1 overflow-auto">
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
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompletedTrips;