import { useState, useEffect } from 'react';

export const useTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalTrips, setTotalTrips] = useState(23);

  const mockTrips = [
    {
      id: 1,
      tipo: 'Descarga de alimentos',
      subtitulo: 'Ayutuxtepeque, local 28',
      fecha: 'Próxima fecha',
      hora: '7:30 AM',
      cotizacion: 'Empresas gremiales',
      camion: 'P-438-MLR',
      descripcion: 'Entrega de mercancías a Usulután',
      horaLlegada: '9:00 AM',
      horaSalida: '8:00 PM',
      asistente: 'Laura Sánchez',
      icon: '📦',
      color: '#4CAF50'
    },
    {
      id: 2,
      tipo: 'Transporte de mobiliario',
      subtitulo: 'Antiguo cuscatlán, ps3, casa 26',
      fecha: 'Próxima fecha',
      hora: '1:30 PM',
      cotizacion: 'Muebles Express',
      camion: 'P-521-XYZ',
      descripcion: 'Transporte de muebles residenciales',
      horaLlegada: '1:00 PM',
      horaSalida: '6:00 PM',
      asistente: 'Carlos Mendoza',
      icon: '🚛',
      color: '#FF9800'
    }
  ];

  const proximosDestinos = [
    { id: 1, tipo: 'Ayutuxtepeque, local 28', fecha: 'Próxima fecha', hora: '7:30 AM' },
    { id: 2, tipo: 'Ayutuxtepeque, local 28', fecha: 'Próxima fecha', hora: '7:30 AM' },
    { id: 3, tipo: 'Ayutuxtepeque, local 28', fecha: 'Próxima fecha', hora: '7:30 AM' },
  ];

  const historialViajes = [
    { id: 1, tipo: 'Descarga de alimentos', subtitulo: 'Ayutuxtepeque' },
    { id: 2, tipo: 'Descarga de alimentos', subtitulo: 'Ayutuxtepeque' },
    { id: 3, tipo: 'Descarga de alimentos', subtitulo: 'Ayutuxtepeque' },
    { id: 4, tipo: 'Descarga de alimentos', subtitulo: 'Ayutuxtepeque' },
    { id: 5, tipo: 'Descarga de alimentos', subtitulo: 'Ayutuxtepeque' },
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setTrips(mockTrips);
      setLoading(false);
    }, 1000);
  }, []);

  const getTripById = (id) => {
    return mockTrips.find(trip => trip.id === id);
  };

  return {
    trips,
    loading,
    totalTrips,
    proximosDestinos,
    historialViajes,
    getTripById,
    setTrips
  };
};