// 📁 Frontend/src/components/RealtimeProgressBar.jsx
// COMPONENTE DE BARRA DE PROGRESO EN TIEMPO REAL

import React, { useState, useEffect } from 'react';

const RealtimeProgressBar = ({ viajeId, initialProgress = 0, status = 'pendiente' }) => {
  const [progress, setProgress] = useState(initialProgress);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);

  // 🔄 Polling para actualizar progreso cada 30 segundos
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/auto-update/active-trips`);
        
        if (response.ok) {
          const data = await response.json();
          const currentTrip = data.data.find(trip => trip.id === viajeId);
          
          if (currentTrip) {
            setProgress(currentTrip.progress);
            setCurrentStatus(currentTrip.status);
            setLastUpdate(new Date(currentTrip.lastUpdate));
            setIsConnected(true);
          }
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Error actualizando progreso:', error);
        setIsConnected(false);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(pollInterval);
  }, [viajeId]);

  // 🎨 Obtener color según el estado
  const getStatusColor = () => {
    switch (currentStatus) {
      case 'pendiente': return 'bg-yellow-500';
      case 'en_curso': return 'bg-blue-500';
      case 'completado': return 'bg-green-500';
      case 'retrasado': return 'bg-orange-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // 📱 Obtener texto del estado
  const getStatusText = () => {
    switch (currentStatus) {
      case 'pendiente': return 'Pendiente';
      case 'en_curso': return 'En Ruta';
      case 'completado': return 'Completado';
      case 'retrasado': return 'Retrasado';
      case 'cancelado': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  // ⚡ Funciones para control manual (solo para testing)
  const handleManualUpdate = async (action, newProgress = null) => {
    try {
      const body = { action };
      if (newProgress !== null) {
        body.progress = newProgress;
      }

      const response = await fetch(`http://localhost:4000/api/auto-update/trip/${viajeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.data.progress);
        setCurrentStatus(data.data.status);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error en actualización manual:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      {/* 📊 Header con estado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="font-medium text-gray-900">{getStatusText()}</span>
          {!isConnected && (
            <span className="text-red-500 text-sm">⚠️ Sin conexión</span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {progress}%
        </div>
      </div>

      {/* 📈 Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ease-out ${getStatusColor()}`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        >
          {/* ✨ Animación de "pulsing" para viajes activos */}
          {currentStatus === 'en_curso' && (
            <div className="h-full w-full rounded-full opacity-75 animate-pulse"></div>
          )}
        </div>
      </div>

      {/* ⏰ Información adicional */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </span>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''}`}></div>
          <span>{isConnected ? 'En línea' : 'Desconectado'}</span>
        </div>
      </div>

      {/* 🔧 Controles manuales (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && currentStatus !== 'completado' && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Controles de desarrollo:</div>
          <div className="flex space-x-2">
            {currentStatus === 'pendiente' && (
              <button
                onClick={() => handleManualUpdate('start')}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Iniciar
              </button>
            )}
            {(currentStatus === 'en_curso' || currentStatus === 'retrasado') && (
              <>
                <button
                  onClick={() => handleManualUpdate('progress', progress + 10)}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                >
                  +10%
                </button>
                <button
                  onClick={() => handleManualUpdate('complete')}
                  className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                >
                  Completar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeProgressBar;