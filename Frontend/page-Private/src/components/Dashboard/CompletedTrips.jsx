import React from 'react';
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompletedTrips;