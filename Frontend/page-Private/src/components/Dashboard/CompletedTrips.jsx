import React, { useEffect, useState } from 'react';
import { Bus, Home, UtensilsCrossed, Play, Truck } from 'lucide-react';
import axios from 'axios';

const iconMap = {
  transporte: Bus,
  vivienda: Home,
  comida: UtensilsCrossed,
  entretenimiento: Play,
  otro: Truck,
};

const CompletedTrips = () => {
  const [completedTrips, setCompletedTrips] = useState([]);

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/viajes/completados');
        const viajes = res.data.data;

        // Transformamos los datos para el componente
        const mapped = viajes.map((v, i) => {
          const tipo = v.tripDescription?.toLowerCase().includes('comida') ? 'comida'
                    : v.tripDescription?.toLowerCase().includes('bus') ? 'transporte'
                    : v.tripDescription?.toLowerCase().includes('casa') ? 'vivienda'
                    : 'otro';

          return {
            id: v._id || i,
            type: tipo.charAt(0).toUpperCase() + tipo.slice(1),
            subtitle: `${new Date(v.departureTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • ${v.tripDescription || 'Viaje completado'}`,
            icon: iconMap[tipo] || Truck,
            color: tipo === 'comida' ? 'bg-red-500' :
                   tipo === 'transporte' ? 'bg-purple-500' :
                   tipo === 'vivienda' ? 'bg-orange-500' :
                   tipo === 'entretenimiento' ? 'bg-green-500' :
                   'bg-blue-500',
          };
        });

        setCompletedTrips(mapped);
      } catch (error) {
        console.error("Error al cargar viajes completados:", error);
      }
    };

    fetchCompleted();
  }, []);

  return (
    <div className="flex bg-white w-full max-w-md overflow-hidden">
      <div className="flex-1 py-2">
        <div className="space-y-4">
          {completedTrips.length === 0 ? (
            <p className="text-gray-500 text-sm px-4">No hay viajes completados aún.</p>
          ) : (
            completedTrips.map((trip) => (
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
                <div className="w-3 h-3 rounded-full flex-shrink-0 mr-2" style={{ backgroundColor: '#5D9646' }}></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedTrips;
