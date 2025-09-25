// 📁 Frontend/src/components/RealtimeProgressBar.jsx
// VERSIÓN CORREGIDA - CON RUTAS CORRECTAS DEL BACKEND

import React, { useState, useEffect } from 'react';

const RealtimeProgressBar = ({ 
  viajeId, 
  initialProgress = 0, 
  status = 'pendiente',
  enablePolling = true 
}) => {
  const [progress, setProgress] = useState(initialProgress);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(null);
  
  // 🆕 NUEVOS ESTADOS PARA SISTEMA HÍBRIDO
  const [lastCheckpoint, setLastCheckpoint] = useState(null);
  const [totalCheckpoints, setTotalCheckpoints] = useState(0);
  const [progressMethod, setProgressMethod] = useState('time_based');
  const [timeBasedProgress, setTimeBasedProgress] = useState(0);
  const [tripDetails, setTripDetails] = useState(null);

  // 🔄 RESETEAR COMPLETAMENTE cuando cambie el viajeId
  useEffect(() => {
    console.log(`🔄 Reseteando componente para viaje: ${viajeId}`);
    setProgress(initialProgress);
    setCurrentStatus(status);
    setLastUpdate(new Date());
    setApiAvailable(null);
    setLastCheckpoint(null);
    setTotalCheckpoints(0);
    setProgressMethod('time_based');
  }, [viajeId, initialProgress, status]);

  // 🔍 Verificar API disponible usando rutas reales del backend
  useEffect(() => {
    const checkApiAvailability = async () => {
      if (!enablePolling) {
        setApiAvailable(false);
        setIsConnected(false);
        return;
      }

      try {
        // 🔧 RUTA CORRECTA: Usar el endpoint de métricas en tiempo real para verificar API
        const response = await fetch(`https://riveraproject-production-933e.up.railway.app/api/viajes/real-time-metrics`);
        if (response.ok) {
          setApiAvailable(true);
          setIsConnected(true);
          console.log(`✅ API disponible para viaje ${viajeId}`);
        } else {
          setApiAvailable(false);
          setIsConnected(false);
        }
      } catch (error) {
        setApiAvailable(false);
        setIsConnected(false);
        console.log(`🔌 API no disponible para viaje ${viajeId}:`, error.message);
      }
    };

    if (apiAvailable === null) {
      checkApiAvailability();
    }
  }, [enablePolling, apiAvailable, viajeId]);

  // 🔄 Polling mejorado usando rutas reales del backend
  useEffect(() => {
    if (!enablePolling || apiAvailable !== true) {
      return;
    }

    console.log(`🔄 Iniciando polling para viaje ${viajeId}`);

    const pollInterval = setInterval(async () => {
      try {
        // 🔧 RUTA CORRECTA: Obtener detalles específicos del viaje
        const response = await fetch(`https://riveraproject-production-933e.up.railway.app/api/viajes/${viajeId}`);
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data) {
            const tripData = result.data;
            console.log(`📊 Actualizando viaje ${viajeId}:`, tripData);
            
            // 📊 Extraer progreso del backend
            const backendProgress = tripData.tracking?.progreso?.porcentaje || 0;
            const backendStatus = tripData.estado?.actual || 'pendiente';
            
            // Actualizar datos principales
            setProgress(backendProgress);
            setCurrentStatus(backendStatus);
            setLastUpdate(new Date());
            setTripDetails(tripData);
            
            // 🆕 Actualizar datos de tracking si existen
            if (tripData.tracking?.ubicacionActual) {
              setLastCheckpoint({
                tipo: 'gps_update',
                descripcion: `Ubicación actualizada: ${tripData.tracking.ubicacionActual.lat?.toFixed(4)}, ${tripData.tracking.ubicacionActual.lng?.toFixed(4)}`,
                progreso: backendProgress,
                timestamp: new Date(tripData.tracking.progreso.fechaActualizacion || Date.now())
              });
            }
            
            // Contar checkpoints del historial de ubicaciones
            if (tripData.tracking?.historialUbicaciones) {
              setTotalCheckpoints(tripData.tracking.historialUbicaciones.length);
            }
            
            setProgressMethod(tripData.tracking?.progreso?.metodo || 'backend_calculated');
            setIsConnected(true);
          } else {
            console.log(`⚠️ Viaje ${viajeId} no encontrado o respuesta inválida`);
            setIsConnected(false);
          }
        } else {
          setIsConnected(false);
          console.log(`❌ Error HTTP ${response.status} obteniendo viaje ${viajeId}`);
        }
      } catch (error) {
        console.error(`❌ Error actualizando viaje ${viajeId}:`, error);
        setIsConnected(false);
      }
    }, 30000);

    return () => {
      console.log(`🛑 Deteniendo polling para viaje ${viajeId}`);
      clearInterval(pollInterval);
    };
  }, [viajeId, enablePolling, apiAvailable]);

  // 🎨 Obtener color según el estado
  const getStatusColor = () => {
    switch (currentStatus) {
      case 'programado': return 'bg-purple-500';
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
      case 'programado': return 'Programado';
      case 'pendiente': return 'Pendiente';
      case 'en_curso': return 'En Ruta';
      case 'completado': return 'Completado';
      case 'retrasado': return 'Retrasado';
      case 'cancelado': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  // ⚡ Controles manuales usando rutas reales del backend
  const handleManualUpdate = async (action, newProgress = null, descripcion = null) => {
    console.log(`🎮 Actualizando viaje ${viajeId} - Acción: ${action}`);
    
    if (apiAvailable === false) {
      // Simulación local mejorada
      if (action === 'start') {
        setCurrentStatus('en_curso');
        setProgress(10);
        setLastCheckpoint({
          tipo: 'inicio_manual',
          descripcion: 'Iniciado manualmente',
          progreso: 10,
          timestamp: new Date()
        });
        setTotalCheckpoints(prev => prev + 1);
      } else if (action === 'progress' && newProgress !== null) {
        const newProg = Math.min(100, Math.max(0, newProgress));
        setProgress(newProg);
        setLastCheckpoint({
          tipo: 'progreso_manual',
          descripcion: `Progreso actualizado a ${newProg}%`,
          progreso: newProg,
          timestamp: new Date()
        });
        setTotalCheckpoints(prev => prev + 1);
        if (newProg >= 100) {
          setCurrentStatus('completado');
        }
      } else if (action === 'complete') {
        setProgress(100);
        setCurrentStatus('completado');
        setLastCheckpoint({
          tipo: 'finalizacion_manual',
          descripcion: 'Completado manualmente',
          progreso: 100,
          timestamp: new Date()
        });
        setTotalCheckpoints(prev => prev + 1);
      }
      setLastUpdate(new Date());
      setProgressMethod('manual');
      return;
    }

    // 🔧 USAR RUTAS REALES DEL BACKEND
    try {
      let endpoint;
      let method = 'PATCH';
      let body = {};

      if (action === 'start') {
        // No hay endpoint específico para iniciar, usar actualización de progreso
        endpoint = `https://riveraproject-production-933e.up.railway.app/api/viajes/${viajeId}/progress`;
        body = { progreso: 10, estado: 'en_curso', observaciones: 'Iniciado manualmente' };
      } else if (action === 'progress') {
        // 🔧 RUTA CORRECTA: Actualizar progreso
        endpoint = `https://riveraproject-production-933e.up.railway.app/api/viajes/${viajeId}/progress`;
        body = { progreso: newProgress, observaciones: descripcion || `Progreso actualizado a ${newProgress}%` };
      } else if (action === 'complete') {
        // 🔧 RUTA CORRECTA: Completar viaje
        endpoint = `https://riveraproject-production-933e.up.railway.app/api/viajes/${viajeId}/complete`;
        body = { observaciones: descripcion || 'Completado manualmente' };
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Actualización exitosa para viaje ${viajeId}:`, data);
          
          // Actualizar estado local
          if (data.success && data.data) {
            const updatedTrip = data.data;
            
            // Extraer datos del formato de respuesta del backend
            if (updatedTrip.progreso !== undefined) {
              setProgress(updatedTrip.progreso);
            }
            if (updatedTrip.estado) {
              setCurrentStatus(updatedTrip.estado);
            }
            
            setLastUpdate(new Date());
            setProgressMethod('manual_update');
            
            // Agregar checkpoint local
            setLastCheckpoint({
              tipo: action,
              descripcion: descripcion || `Acción: ${action}`,
              progreso: updatedTrip.progreso || progress,
              timestamp: new Date()
            });
            setTotalCheckpoints(prev => prev + 1);
          }
        } else {
          console.error(`❌ Error en actualización para viaje ${viajeId}:`, response.status);
        }
      }
    } catch (error) {
      console.error(`❌ Error en actualización manual para viaje ${viajeId}:`, error);
    }
  };

  // 🆕 Actualizar ubicación GPS usando ruta real del backend
  const handleLocationUpdate = async (lat, lng, velocidad = null) => {
    if (apiAvailable === false) {
      // Simulación local
      setLastCheckpoint({
        tipo: 'gps_update',
        descripcion: `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        progreso: progress,
        timestamp: new Date()
      });
      setTotalCheckpoints(prev => prev + 1);
      setLastUpdate(new Date());
      return;
    }

    try {
      // 🔧 RUTA CORRECTA: Actualizar ubicación
      const response = await fetch(`https://riveraproject-production-933e.up.railway.app/api/viajes/${viajeId}/location`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lat: lat,
          lng: lng,
          velocidad: velocidad
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📍 Ubicación actualizada para viaje ${viajeId}:`, data);
        
        if (data.success && data.data) {
          // Actualizar progreso si el backend lo calcula
          if (data.data.progreso?.porcentaje !== undefined) {
            setProgress(data.data.progreso.porcentaje);
          }
          
          setLastCheckpoint({
            tipo: 'gps_update',
            descripcion: `GPS actualizado: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            progreso: data.data.progreso?.porcentaje || progress,
            timestamp: new Date()
          });
          setTotalCheckpoints(prev => prev + 1);
          setLastUpdate(new Date());
          setProgressMethod('gps_tracking');
        }
      }
    } catch (error) {
      console.error('Error actualizando ubicación GPS:', error);
    }
  };

  // 🎯 Indicador de método de progreso
  const getProgressMethodInfo = () => {
    switch (progressMethod) {
      case 'gps_tracking':
        return {
          icon: '📍',
          text: 'GPS',
          color: 'text-green-600',
          description: 'Basado en ubicación GPS'
        };
      case 'backend_calculated':
        return {
          icon: '🤖',
          text: 'Auto',
          color: 'text-blue-600',
          description: 'Calculado por el sistema'
        };
      case 'time_based':
        return {
          icon: '⏰',
          text: 'Tiempo',
          color: 'text-blue-600',
          description: 'Calculado por tiempo'
        };
      case 'manual':
      case 'manual_update':
        return {
          icon: '🎮',
          text: 'Manual',
          color: 'text-purple-600',
          description: 'Actualizado manualmente'
        };
      default:
        return {
          icon: '🔧',
          text: 'Sistema',
          color: 'text-gray-600',
          description: 'Sistema automático'
        };
    }
  };

  const connectionStatus = apiAvailable === false ? 
    { color: 'bg-yellow-400', text: 'Demo', pulse: true } :
    !isConnected ? 
    { color: 'bg-red-400', text: 'Desconectado', pulse: false } :
    { color: 'bg-green-400', text: 'En línea', pulse: true };

  const methodInfo = getProgressMethodInfo();

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      {/* 📊 Header con estado mejorado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="font-medium text-gray-900">{getStatusText()}</span>
          
          {/* 🆔 ID del viaje */}
          <span className="text-xs text-gray-400">({viajeId.slice(-4)})</span>
          
          {/* 📍 Método de progreso */}
          <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${methodInfo.color}`} title={methodInfo.description}>
            {methodInfo.icon} {methodInfo.text}
          </span>
          
          {/* 🏷️ Estado de API */}
          {apiAvailable === false && (
            <span className="text-yellow-600 text-xs px-2 py-1 bg-yellow-100 rounded-full">
              📊 Demo
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 font-semibold">
          {Math.round(progress)}%
        </div>
      </div>

      {/* 📈 Barra de progreso mejorada */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3 relative">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ease-out ${getStatusColor()}`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        >
          {/* ✨ Animación para viajes activos */}
          {(currentStatus === 'en_curso' || currentStatus === 'programado') && (
            <div className="h-full w-full rounded-full opacity-75 animate-pulse"></div>
          )}
        </div>
        
        {/* 📍 Indicador de checkpoint si existe */}
        {lastCheckpoint && progressMethod === 'gps_tracking' && (
          <div 
            className="absolute top-0 w-1 h-3 bg-white border border-gray-400 rounded-sm"
            style={{ left: `${lastCheckpoint.progreso}%` }}
            title={`Último checkpoint: ${lastCheckpoint.descripcion}`}
          ></div>
        )}
      </div>

      {/* ⏰ Información mejorada */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${connectionStatus.color} ${connectionStatus.pulse ? 'animate-pulse' : ''}`}></div>
            <span>{connectionStatus.text}</span>
          </div>
        </div>
        
        {/* 📍 Info del último checkpoint */}
        {lastCheckpoint && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <div className="flex items-center space-x-1">
              <span className="font-medium">📍 Último checkpoint:</span>
              <span>{lastCheckpoint.descripcion}</span>
            </div>
            <div className="text-gray-500 mt-1">
              {new Date(lastCheckpoint.timestamp).toLocaleString()} • {lastCheckpoint.progreso}%
            </div>
          </div>
        )}
        
        {/* 📊 Información del viaje del backend */}
        {tripDetails && (
          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            <div className="flex items-center justify-between">
              <span className="font-medium">🚛 {tripDetails.truckId?.brand} {tripDetails.truckId?.model}</span>
              <span>👤 {tripDetails.conductor?.id?.nombre || 'Conductor'}</span>
            </div>
            {tripDetails.ruta && (
              <div className="mt-1 text-gray-500">
                📍 {tripDetails.ruta.origen?.nombre} → {tripDetails.ruta.destino?.nombre}
              </div>
            )}
          </div>
        )}
        
        {/* 📊 Estadísticas de checkpoints */}
        {totalCheckpoints > 0 && (
          <div className="text-xs text-gray-500 text-center">
            📍 {totalCheckpoints} checkpoint{totalCheckpoints > 1 ? 's' : ''} registrado{totalCheckpoints > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* 🔧 Controles de desarrollo mejorados */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          {currentStatus === 'completado' ? (
            /* ✅ Estado completado */
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Viaje Completado</span>
                {totalCheckpoints > 0 && (
                  <span className="text-xs">({totalCheckpoints} checkpoints)</span>
                )}
              </div>
            </div>
          ) : (
            /* 🎮 Controles para viajes activos */
            <>
              <div className="text-xs text-gray-500 mb-2">
                Controles para viaje {viajeId.slice(-4)} (usando rutas reales):
              </div>
              
              {/* Controles básicos */}
              <div className="flex space-x-2 mb-3">
                {(currentStatus === 'programado' || currentStatus === 'pendiente') && (
                  <button
                    onClick={() => handleManualUpdate('start')}
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    🚀 Iniciar
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
                      ✅ Completar
                    </button>
                  </>
                )}
              </div>
              
              {/* 🆕 Simulación de GPS */}
              {(currentStatus === 'en_curso' || currentStatus === 'retrasado') && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">Simulación GPS:</div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => handleLocationUpdate(13.6929, -89.2182, 60)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                    >
                      📍 San Salvador
                    </button>
                    <button
                      onClick={() => handleLocationUpdate(13.4833, -88.1833, 55)}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                    >
                      📍 San Miguel
                    </button>
                    <button
                      onClick={() => handleLocationUpdate(13.9942, -89.5592, 45)}
                      className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200"
                    >
                      📍 Santa Ana
                    </button>
                    <button
                      onClick={() => handleLocationUpdate(13.7167, -89.1389, 50)}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200"
                    >
                      📍 Soyapango
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 🐛 Debug info mejorada */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-400">
            Viaje: {viajeId.slice(-4)} | Progreso: {progress}% | Estado: {currentStatus} | 
            Método: {progressMethod} | Checkpoints: {totalCheckpoints} | API: {apiAvailable?.toString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeProgressBar;