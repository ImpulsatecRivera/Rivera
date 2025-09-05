// 📁 Frontend/src/components/Mapa/RealtimeProgressBar.jsx
// VERSIÓN CON CHECKPOINTS - SOLO FRONTEND

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, Circle, Navigation, Truck, Plus } from 'lucide-react';

const RealtimeProgressBar = ({ 
  viajeId, 
  initialProgress = 0, 
  status = 'pendiente',
  enablePolling = true,
  tripInfo = null,
  description = ''
}) => {
  const [progress, setProgress] = useState(initialProgress);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(null);
  
  // Estados para checkpoints (manejados localmente)
  const [checkpoints, setCheckpoints] = useState([]);
  const [completedCheckpoints, setCompletedCheckpoints] = useState([]);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(-1);
  const [progressMethod, setProgressMethod] = useState('checkpoints');

  // Inicializar checkpoints al cargar el componente
  useEffect(() => {
    if (viajeId) {
      initializeCheckpoints();
    }
  }, [viajeId]);

  // Función para inicializar checkpoints predefinidos
  const initializeCheckpoints = () => {
    // Determinar ruta basada en la información del viaje
    const routeKey = determineRouteFromTripInfo();
    const defaultCheckpoints = getDefaultCheckpoints(routeKey);
    
    setCheckpoints(defaultCheckpoints);
    setCompletedCheckpoints([]);
    setCurrentCheckpointIndex(-1);
    setProgressMethod('checkpoints');

    // Si hay progreso inicial, marcar checkpoints correspondientes como completados
    if (initialProgress > 0) {
      autoCompleteCheckpointsByProgress(defaultCheckpoints, initialProgress);
    }
  };

  // Determinar ruta desde la información del viaje
  const determineRouteFromTripInfo = () => {
    if (tripInfo?.route) {
      const from = tripInfo.route.from?.toLowerCase().replace(/\s+/g, '-');
      const to = tripInfo.route.to?.toLowerCase().replace(/\s+/g, '-');
      return `${from}-${to}`;
    }
    return 'default';
  };

  // Checkpoints predefinidos por rutas
  const getDefaultCheckpoints = (routeKey) => {
    const routes = {
      'terminal-rivera-santa-ana-san-miguel': [
        { id: 'cp1', name: 'Terminal Rivera Santa Ana', lat: 13.9942, lng: -89.5592, type: 'departure', estimatedProgress: 0 },
        { id: 'cp2', name: 'Peaje Comalapa', lat: 13.7167, lng: -89.1389, type: 'checkpoint', estimatedProgress: 25 },
        { id: 'cp3', name: 'San Salvador Centro', lat: 13.6929, lng: -89.2182, type: 'checkpoint', estimatedProgress: 50 },
        { id: 'cp4', name: 'Soyapango', lat: 13.7167, lng: -89.1389, type: 'checkpoint', estimatedProgress: 75 },
        { id: 'cp5', name: 'San Miguel', lat: 13.4833, lng: -88.1833, type: 'arrival', estimatedProgress: 100 }
      ],
      'default': [
        { id: 'cp1', name: 'Punto de Partida', lat: 13.8833, lng: -89.1000, type: 'departure', estimatedProgress: 0 },
        { id: 'cp2', name: 'Punto Medio', lat: 13.7400, lng: -89.1500, type: 'checkpoint', estimatedProgress: 50 },
        { id: 'cp3', name: 'Punto de Llegada', lat: 13.6929, lng: -89.2182, type: 'arrival', estimatedProgress: 100 }
      ]
    };
    
    return routes[routeKey] || routes.default;
  };

  // Auto-completar checkpoints basado en progreso actual
  const autoCompleteCheckpointsByProgress = (checkpointList, currentProgress) => {
    const shouldBeCompleted = checkpointList.filter(cp => cp.estimatedProgress <= currentProgress);
    const completedData = shouldBeCompleted.map(cp => ({
      checkpointId: cp.id,
      completedAt: new Date(),
      method: 'auto_sync'
    }));
    
    setCompletedCheckpoints(completedData);
    
    // Actualizar índice actual
    const nextIncompleteIndex = checkpointList.findIndex(cp => cp.estimatedProgress > currentProgress);
    setCurrentCheckpointIndex(nextIncompleteIndex > 0 ? nextIncompleteIndex - 1 : checkpointList.length - 1);
  };

  // Completar checkpoint manualmente
  const completeCheckpoint = async (checkpointId) => {
    const checkpoint = checkpoints.find(cp => cp.id === checkpointId);
    if (!checkpoint) return;

    // Verificar que no esté ya completado
    const alreadyCompleted = completedCheckpoints.some(cp => cp.checkpointId === checkpointId);
    if (alreadyCompleted) return;

    console.log(`Completando checkpoint: ${checkpointId} para viaje ${viajeId}`);

    // Marcar como completado localmente
    const completedCheckpoint = {
      checkpointId,
      completedAt: new Date(),
      method: 'manual'
    };

    setCompletedCheckpoints(prev => [...prev, completedCheckpoint]);

    // Actualizar progreso al del checkpoint
    const newProgress = checkpoint.estimatedProgress;
    setProgress(newProgress);

    // Actualizar índice actual
    const checkpointIndex = checkpoints.findIndex(cp => cp.id === checkpointId);
    if (checkpointIndex > currentCheckpointIndex) {
      setCurrentCheckpointIndex(checkpointIndex);
    }

    // Actualizar estado si llega al 100%
    if (newProgress >= 100) {
      setCurrentStatus('completado');
    } else if (newProgress > 0 && currentStatus === 'pendiente') {
      setCurrentStatus('en_curso');
    }

    // Enviar al backend si la API está disponible
    if (apiAvailable) {
      try {
        const response = await fetch(`https://riveraproject-5.onrender.com/api/viajes/${viajeId}/progress`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            progreso: newProgress,
            estado: newProgress >= 100 ? 'completado' : newProgress > 0 ? 'en_curso' : 'pendiente',
            observaciones: `Checkpoint completado: ${checkpoint.name}`
          })
        });

        if (response.ok) {
          console.log(`Checkpoint ${checkpointId} sincronizado con backend`);
        }
      } catch (error) {
        console.error('Error sincronizando con backend:', error);
      }
    }

    setLastUpdate(new Date());
  };

  // Agregar checkpoint dinámico
  const addDynamicCheckpoint = (name, estimatedProgress) => {
    const newCheckpoint = {
      id: `dynamic_${Date.now()}`,
      name,
      lat: 13.7 + Math.random() * 0.1,
      lng: -89.2 + Math.random() * 0.1,
      type: 'dynamic',
      estimatedProgress: estimatedProgress || progress + 10
    };

    setCheckpoints(prev => {
      const newList = [...prev, newCheckpoint];
      return newList.sort((a, b) => a.estimatedProgress - b.estimatedProgress);
    });
  };

  // Verificar API disponible
  useEffect(() => {
    const checkApiAvailability = async () => {
      if (!enablePolling) {
        setApiAvailable(false);
        setIsConnected(false);
        return;
      }

      try {
        const response = await fetch(`https://riveraproject-5.onrender.com/api/viajes/real-time-metrics`);
        if (response.ok) {
          setApiAvailable(true);
          setIsConnected(true);
        } else {
          setApiAvailable(false);
          setIsConnected(false);
        }
      } catch (error) {
        setApiAvailable(false);
        setIsConnected(false);
      }
    };

    if (apiAvailable === null) {
      checkApiAvailability();
    }
  }, [enablePolling, apiAvailable]);

  // Polling para actualizar desde backend
  useEffect(() => {
    if (!enablePolling || apiAvailable !== true) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`https://riveraproject-5.onrender.com/api/viajes/${viajeId}`);
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data) {
            const tripData = result.data;
            const backendProgress = tripData.tracking?.progreso?.porcentaje || 0;
            const backendStatus = tripData.estado?.actual || 'pendiente';
            
            // Solo actualizar si hay cambios significativos
            if (Math.abs(backendProgress - progress) > 5) {
              setProgress(backendProgress);
              autoCompleteCheckpointsByProgress(checkpoints, backendProgress);
            }
            
            setCurrentStatus(backendStatus);
            setLastUpdate(new Date());
            setIsConnected(true);
          }
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        setIsConnected(false);
      }
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [viajeId, enablePolling, apiAvailable, checkpoints, progress]);

  // Obtener color según estado
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

  // Obtener texto del estado
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

  // Obtener icono del checkpoint
  const getCheckpointIcon = (checkpoint, isCompleted, isCurrent) => {
    if (isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (isCurrent) {
      return <Navigation className="w-4 h-4 text-blue-600" />;
    }
    
    switch (checkpoint.type) {
      case 'departure':
        return <Truck className="w-4 h-4 text-gray-400" />;
      case 'arrival':
        return <MapPin className="w-4 h-4 text-gray-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const connectionStatus = apiAvailable === false ? 
    { color: 'bg-yellow-400', text: 'Demo', pulse: true } :
    !isConnected ? 
    { color: 'bg-red-400', text: 'Desconectado', pulse: false } :
    { color: 'bg-green-400', text: 'En línea', pulse: true };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      {/* Header con estado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="font-medium text-gray-900">{getStatusText()}</span>
          
          <span className="text-xs text-gray-400">({viajeId.slice(-4)})</span>
          
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
            📍 Checkpoints
          </span>
          
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

      {/* Barra de progreso principal */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4 relative">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ease-out ${getStatusColor()}`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        >
          {(currentStatus === 'en_curso' || currentStatus === 'programado') && (
            <div className="h-full w-full rounded-full opacity-75 animate-pulse"></div>
          )}
        </div>
        
        {/* Marcadores de checkpoints en la barra */}
        {checkpoints.map((checkpoint) => (
          <div
            key={checkpoint.id}
            className="absolute top-0 w-1 h-3 bg-white border-2 border-gray-400 rounded-sm shadow-sm"
            style={{ left: `${checkpoint.estimatedProgress}%` }}
            title={`${checkpoint.name} - ${checkpoint.estimatedProgress}%`}
          />
        ))}
      </div>

      {/* Lista de checkpoints */}
      <div className="space-y-2 mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">
          📍 Checkpoints del viaje ({completedCheckpoints.length}/{checkpoints.length})
        </div>
        
        <div className="max-h-40 overflow-y-auto space-y-1">
          {checkpoints.map((checkpoint, index) => {
            const isCompleted = completedCheckpoints.some(cp => cp.checkpointId === checkpoint.id);
            const isCurrent = index === currentCheckpointIndex + 1;
            const completedData = completedCheckpoints.find(cp => cp.checkpointId === checkpoint.id);
            
            return (
              <div
                key={checkpoint.id}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  isCompleted ? 'bg-green-50 border-green-200' :
                  isCurrent ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2 flex-1">
                  {getCheckpointIcon(checkpoint, isCompleted, isCurrent)}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${
                      isCompleted ? 'text-green-800' :
                      isCurrent ? 'text-blue-800' :
                      'text-gray-700'
                    }`}>
                      {checkpoint.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {checkpoint.estimatedProgress}% • {checkpoint.type}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isCompleted && completedData && (
                    <div className="text-xs text-green-600">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {completedData.completedAt.toLocaleTimeString()}
                    </div>
                  )}
                  
                  {!isCompleted && (currentStatus === 'en_curso' || currentStatus === 'retrasado') && (
                    <button
                      onClick={() => completeCheckpoint(checkpoint.id)}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      ✓ Completar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Información de actualización */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Última actualización: {lastUpdate.toLocaleTimeString()}</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${connectionStatus.color} ${connectionStatus.pulse ? 'animate-pulse' : ''}`}></div>
            <span>{connectionStatus.text}</span>
          </div>
        </div>
        
        {/* Progreso por checkpoints */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <div className="flex justify-between">
            <span>Progreso por checkpoints:</span>
            <span className="font-medium">{Math.round((completedCheckpoints.length / Math.max(checkpoints.length, 1)) * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Método:</span>
            <span className="font-medium">{progressMethod}</span>
          </div>
        </div>
      </div>

      {/* Controles de desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">
            Controles de checkpoints (solo frontend):
          </div>
          
          <div className="space-y-2">
            {/* Completar próximo checkpoint */}
            {currentCheckpointIndex + 1 < checkpoints.length && (
              <button
                onClick={() => completeCheckpoint(checkpoints[currentCheckpointIndex + 1].id)}
                className="w-full px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                ✅ Completar próximo checkpoint
              </button>
            )}
            
            {/* Agregar checkpoint dinámico */}
            <button
              onClick={() => addDynamicCheckpoint(`Checkpoint adicional`, progress + 15)}
              className="w-full px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
            >
              ➕ Agregar checkpoint dinámico
            </button>
            
            {/* Simular llegada a checkpoints */}
            <div className="grid grid-cols-2 gap-1">
              {checkpoints.slice(0, 4).map(checkpoint => (
                <button
                  key={checkpoint.id}
                  onClick={() => completeCheckpoint(checkpoint.id)}
                  className="px-1 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                  disabled={completedCheckpoints.some(cp => cp.checkpointId === checkpoint.id)}
                >
                  📍 {checkpoint.name.substring(0, 10)}...
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-400">
            Viaje: {viajeId.slice(-4)} | Progreso: {progress}% | 
            Checkpoints: {completedCheckpoints.length}/{checkpoints.length} | 
            Método: {progressMethod} | API: {apiAvailable?.toString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeProgressBar;