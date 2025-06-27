
import React from 'react';
import { User, MapPin, Users, Briefcase, Car, Truck, Home, LogOut, Plus } from 'lucide-react';

const TravelDashboard = () => {
  const menuItems = [
    { name: 'Inicio', icon: Home, active: false },
    { name: 'Viajes', icon: MapPin, active: true },
    { name: 'Cotizaciones', icon: Briefcase, active: false },
    { name: 'Empleados', icon: Users, active: false },
    { name: 'Motoristas', icon: User, active: false },
    { name: 'Proveedores', icon: Truck, active: false },
    { name: 'Camiones', icon: Car, active: false }
  ];

  const scheduledTrips = [
    { 
      type: 'Grocery', 
      color: 'bg-blue-500', 
      status: 'bg-green-400',
      time: '6:00 am - 8:00 am',
      description: 'Grocery store run'
    },
    { 
      type: 'Transportation', 
      color: 'bg-purple-500', 
      status: 'bg-red-400',
      time: '9:00 am - 11:00 am',
      description: 'Client pickup'
    },
    { 
      type: 'Housing', 
      color: 'bg-orange-500', 
      status: 'bg-yellow-400',
      time: '11:30 am - 1:00 pm',
      description: 'Property inspection'
    },
    { 
      type: 'Housing', 
      color: 'bg-orange-500', 
      status: 'bg-green-400',
      time: '2:00 pm - 4:00 pm',
      description: 'House viewing'
    },
    { 
      type: 'Housing', 
      color: 'bg-orange-500', 
      status: 'bg-yellow-400',
      time: '4:30 pm - 6:00 pm',
      description: 'Property meeting'
    },
    { 
      type: 'Housing', 
      color: 'bg-orange-500', 
      status: 'bg-red-400',
      time: '6:30 pm - 8:00 pm',
      description: 'Final inspection'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3">
              <User size={20} className="text-white" />
            </div>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors text-sm ${
                    item.active 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} className="mr-3" />
                  <span>{item.name}</span>
                </div>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md cursor-pointer text-sm">
            <LogOut size={18} className="mr-3" />
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="grid grid-cols-3 gap-6 p-6 h-full">
          
          {/* Left Column - Trips Chart and List */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Viajes</h2>
                  <p className="text-sm text-gray-500 mt-1">Porcentaje de viajes</p>
                </div>
              </div>
              
              {/* Bar Chart */}
              <div className="mb-8">
                <div className="flex items-end justify-center space-x-2 h-32">
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-blue-400 rounded-t" style={{height: '60px'}}></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-blue-400 rounded-t" style={{height: '80px'}}></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-blue-400 rounded-t" style={{height: '45px'}}></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-blue-400 rounded-t" style={{height: '90px'}}></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-blue-500 rounded-t" style={{height: '120px'}}></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-blue-400 rounded-t" style={{height: '70px'}}></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-blue-400 rounded-t" style={{height: '50px'}}></div>
                  </div>
                </div>
              </div>
              
              {/* Scheduled Trips */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Viajes programados de este día</h3>
                <div className="space-y-3">
                  {scheduledTrips.map((trip, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full ${trip.color} flex items-center justify-center mr-4`}>
                          <span className="text-white text-xs font-semibold">
                            {trip.type.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{trip.type}</div>
                          <div className="text-sm text-gray-500">{trip.time}</div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${trip.status}`}></div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center">
                  <Plus size={20} className="mr-2" />
                  Programar un viaje
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column - Earnings and Stats */}
          <div className="space-y-6">
            {/* Earnings Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Porcentaje de ganancias</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hoy</span>
                  <span className="font-semibold text-blue-600">₡15,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Semana</span>
                  <span className="font-semibold text-green-600">₡179,250</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mensual</span>
                  <span className="font-semibold text-purple-600">₡512,950</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transportación</span>
                  <span className="font-semibold text-orange-600">₡250,950</span>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-black text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors font-medium">
                VER MÁS
              </button>
            </div>
            
            {/* Routes Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Ver rutas frecuentes</h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <MapPin className="text-white" size={20} />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">24</span>
                  </div>
                  <p className="text-sm text-gray-600">Rutas esta semana</p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Car className="text-white" size={20} />
                    </div>
                    <span className="text-2xl font-bold text-orange-600">8</span>
                  </div>
                  <p className="text-sm text-gray-600">Vehículos activos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelDashboard;