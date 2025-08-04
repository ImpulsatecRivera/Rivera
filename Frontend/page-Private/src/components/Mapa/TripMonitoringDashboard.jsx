// 📁 Frontend/src/components/TripMonitoringDashboard.jsx
// DASHBOARD PARA MONITOREAR VIAJES EN TIEMPO REAL

import React, { useState, useEffect } from 'react';
import RealtimeProgressBar from './RealtimeProgressBar';

const TripMonitoringDashboard = () => {
  const [activeTrips, setActiveTrips] = useState([]);
  const [serviceStatus, setServiceStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 🔄 Cargar datos iniciales y configurar polling
  useEffect(() => {
    fetchServiceStatus();
    fetchActiveTrips();

    // Polling cada 15 segundos para el dashboard general
    const interval = setInterval(() => {
      fetchActiveTrips();
      fetchServiceStatus();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // 📊 Obtener estado del servicio
  const fetchServiceStatus = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auto-update/status');
      if (response.ok) {
        const data = await response.json();
        setServiceStatus(data.data.service);
      }
    } catch (error) {
      console.error('Error obteniendo estado del servicio:', error);
    }
  };

  // 📋 Obtener viajes activos
  const fetchActiveTrips = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auto-update/active-trips');
      if (response.ok) {
        const data = await response.json();
        setActiveTrips(data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error obteniendo viajes activos:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Iniciar/detener servicio
  const toggleService = async () => {
    try {
      const action = serviceStatus.isRunning ? 'stop' : 'start';
      const response = await fetch(`http://localhost:4000/api/auto-update/${action}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchServiceStatus();
      }
    } catch (error) {
      console.error('Error toggleando servicio:', error);
    }
  };

  // 🔧 Forzar actualización
  const forceUpdate = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auto-update/force-update', {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchActiveTrips();
      }
    } catch (error) {
      console.error('Error forzando actualización:', error);
    }
  };

  // 📊 Obtener estadísticas rápidas
  const getStatusStats = () => {
    const stats = {
      pendiente: activeTrips.filter(trip => trip.status === 'pendiente').length,
      en_curso: activeTrips.filter(trip => trip.status === 'en_curso').length,
      retrasado: activeTrips.filter(trip => trip.status === 'retrasado').length,
      completado: activeTrips.filter(trip => trip.status === 'completado').length
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 📊 Header con controles */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Monitor de Viajes en Tiempo Real</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={forceUpdate}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🔄 Actualizar
            </button>
            <button
              onClick={toggleService}
              className={`px-4 py-2 rounded-lg transition-colors ${
                serviceStatus.isRunning 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {serviceStatus.isRunning ? '⏹️ Detener' : '▶️ Iniciar'} Servicio
            </button>
          </div>
        </div>

        {/* 🔴 Estado del servicio */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${serviceStatus.isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              Servicio: {serviceStatus.isRunning ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <span className="text-gray-500">|</span>
          <span className="text-gray-600">
            Intervalo: {(serviceStatus.updateInterval || 30000) / 1000}s
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-600">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* 📈 Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pendiente}</p>
            </div>
            <div className="text-yellow-500 text-2xl">⏳</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm font-medium">En Ruta</p>
              <p className="text-2xl font-bold text-blue-900">{stats.en_curso}</p>
            </div>
            <div className="text-blue-500 text-2xl">🚛</div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-800 text-sm font-medium">Retrasados</p>
              <p className="text-2xl font-bold text-orange-900">{stats.retrasado}</p>
            </div>
            <div className="text-orange-500 text-2xl">⚠️</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">Completados</p>
              <p className="text-2xl font-bold text-green-900">{stats.completado}</p>
            </div>
            <div className="text-green-500 text-2xl">✅</div>
          </div>
        </div>
      </div>

      {/* 📋 Lista de viajes activos */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Viajes Activos ({activeTrips.length})
          </h2>
        </div>

        <div className="p-6">
          {activeTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🚛</div>
              <p>No hay viajes activos en este momento</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeTrips.map((trip) => (
                <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-900 truncate">
                      {trip.description}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <div>Salida: {new Date(trip.departureTime).toLocaleTimeString()}</div>
                      <div>Llegada: {new Date(trip.arrivalTime).toLocaleTimeString()}</div>
                    </div>
                  </div>
                  
                  <RealtimeProgressBar 
                    viajeId={trip.id}
                    initialProgress={trip.progress}
                    status={trip.status}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripMonitoringDashboard;