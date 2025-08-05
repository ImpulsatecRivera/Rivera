// 📁 Frontend/src/components/RealtimeProgressBar.jsx
// VERSIÓN HÍBRIDA - CON CHECKPOINTS Y PROGRESO INTELIGENTE

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

  // 🔄 RESETEAR COMPLETAMENTE cuando cambie el viajeId
  useEffect(() => {
    console.log(`🔄 Reseteando componente híbrido para viaje: ${viajeId}`);
    setProgress(initialProgress);
    setCurrentStatus(status);
    setLastUpdate(new Date());
    setApiAvailable(null);
    setLastCheckpoint(null);
    setTotalCheckpoints(0);
    setProgressMethod('time_based');
  }, [viajeId, initialProgress, status]);

  // 🔍 Verificar API disponible
  useEffect(() => {
    const checkApiAvailability = async () => {
      if (!enablePolling) {
        setApiAvailable(false);
        setIsConnected(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:4000/api/auto-update/active-trips`);
        if (response.ok) {
          setApiAvailable(true);
          setIsConnected(true);
          console.log(`✅ API híbrida disponible para viaje ${viajeId}`);
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

  // 🔄 Polling híbrido mejorado
  useEffect(() => {
    if (!enablePolling || apiAvailable !== true) {
      return;
    }

    console.log(`🔄 Iniciando polling híbrido para viaje ${viajeId}`);

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/auto-update/active-trips`);
        
        if (response.ok) {
          const data = await response.json();
          const currentTrip = data.data.find(trip => trip.id === viajeId);
          
          if (currentTrip) {
            console.log(`📊 Actualizando viaje híbrido ${viajeId}:`, currentTrip);
            
            // Actualizar datos principales
            setProgress(currentTrip.progress || 0);
            setCurrentStatus(currentTrip.status || 'pendiente');
            setLastUpdate(new Date(currentTrip.lastUpdate || Date.now()));
            
            // 🆕 Actualizar datos híbridos
            if (currentTrip.lastCheckpoint) {
              setLastCheckpoint(currentTrip.lastCheckpoint);
            }
            setTotalCheckpoints(currentTrip.totalCheckpoints || 0);
            setProgressMethod(currentTrip.progressMethod || 'time_based');
            
            setIsConnected(true);
          } else {
            console.log(`⚠️ Viaje híbrido ${viajeId} no encontrado en datos activos`);
          }
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error(`❌ Error actualizando viaje híbrido ${viajeId}:`, error);
        setIsConnected(false);
      }
    }, 30000);

    return () => {
      console.log(`🛑 Deteniendo polling híbrido para viaje ${viajeId}`);
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

  // ⚡ Controles manuales mejorados con checkpoints
  const handleManualUpdate = async (action, newProgress = null, descripcion = null) => {
    console.log(`🎮 Actualizando viaje híbrido ${viajeId} - Acción: ${action}`);
    
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

    // API híbrida real
    try {
      const body = { action };
      if (newProgress !== null) {
        body.progress = newProgress;
      }
      if (descripcion) {
        body.descripcion = descripcion;
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
        console.log(`✅ Actualización híbrida exitosa para viaje ${viajeId}:`, data);
        
        setProgress(data.data.progress);
        setCurrentStatus(data.data.status);
        setLastUpdate(new Date());
        
        // Actualizar info de checkpoints
        if (data.data.checkpointAdded) {
          setLastCheckpoint(data.data.checkpointAdded);
        }
        setTotalCheckpoints(data.data.totalCheckpoints || 0);
        setProgressMethod(data.data.progressMethod || 'manual_update');
        
      } else {
        console.error(`❌ Error en actualización híbrida para viaje ${viajeId}:`, response.status);
      }
    } catch (error) {
      console.error(`❌ Error en actualización manual híbrida para viaje ${viajeId}:`, error);
    }
  };

  // 🆕 Agregar checkpoint personalizado
  const handleCustomCheckpoint = async (tipo, progreso, descripcion) => {
    if (apiAvailable === false) {
      // Simulación local
      setLastCheckpoint({
        tipo: tipo,
        descripcion: descripcion,
        progreso: progreso,
        timestamp: new Date()
      });
      setProgress(progreso);
      setTotalCheckpoints(prev => prev + 1);
      setLastUpdate(new Date());
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/auto-update/trip/${viajeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'checkpoint',
          tipo: tipo,
          progreso: progreso,
          descripcion: descripcion
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.data.progress);
        setLastCheckpoint(data.data.checkpointAdded);
        setTotalCheckpoints(data.data.totalCheckpoints);
        setLastUpdate(new Date());
        console.log(`📍 Checkpoint personalizado agregado: ${tipo}`);
      }
    } catch (error) {
      console.error('Error agregando checkpoint personalizado:', error);
    }
  };

  // 🎯 Indicador de método de progreso
  const getProgressMethodInfo = () => {
    switch (progressMethod) {
      case 'checkpoint':
        return {
          icon: '📍',
          text: 'Checkpoint',
          color: 'text-green-600',
          description: 'Basado en último reporte'
        };
      case 'time_based':
        return {
          icon: '⏰',
          text: 'Tiempo',
          color: 'text-blue-600',
          description: 'Calculado automáticamente'
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
          icon: '🤖',
          text: 'Auto',
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
        {lastCheckpoint && progressMethod === 'checkpoint' && (
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
                Controles híbridos para viaje {viajeId.slice(-4)}:
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
              
              {/* 🆕 Checkpoints predefinidos */}
              {(currentStatus === 'en_curso' || currentStatus === 'retrasado') && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">Checkpoints rápidos:</div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => handleCustomCheckpoint('salida_terminal', 15, 'Salió del terminal')}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                    >
                      🏢 Terminal
                    </button>
                    <button
                      onClick={() => handleCustomCheckpoint('mitad_ruta', 50, 'Mitad del recorrido')}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200"
                    >
                      🛣️ Mitad
                    </button>
                    <button
                      onClick={() => handleCustomCheckpoint('llegada_destino', 85, 'Llegó al destino')}
                      className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200"
                    >
                      🏁 Llegada
                    </button>
                    <button
                      onClick={() => handleCustomCheckpoint('descarga_completa', 95, 'Descarga completada')}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                    >
                      📦 Descarga
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