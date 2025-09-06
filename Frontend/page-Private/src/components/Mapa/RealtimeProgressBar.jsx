// 📁 Frontend/src/components/Mapa/RealtimeProgressBar.jsx
// VERSIÓN MEJORADA CON CHECKPOINTS REALISTAS E INCIDENTES

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, CheckCircle, Circle, Navigation, Truck, Plus, 
  Play, AlertTriangle, Users, Fuel, MessageSquare,
  XCircle, PauseCircle, RotateCcw, Info
} from 'lucide-react';

const RealtimeProgressBar = ({ 
  viajeId = 'VJ240001', 
  initialProgress = 0, 
  status = 'pendiente',
  enablePolling = true,
  tripInfo = { 
    route: { 
      from: 'Terminal Rivera Santa Ana', 
      to: 'San Miguel'
    },
    driver: 'Carlos Hernández',
    vehicle: 'Bus 45'
  },
  description = 'Ruta regular Santa Ana - San Miguel'
}) => {
  const [progress, setProgress] = useState(initialProgress);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  
  // Estados para checkpoints mejorados
  const [checkpoints, setCheckpoints] = useState([]);
  const [completedCheckpoints, setCompletedCheckpoints] = useState([]);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(-1);
  const [tripStarted, setTripStarted] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [selectedIncidentType, setSelectedIncidentType] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');

  // Tipos de incidentes
  const incidentTypes = [
    { id: 'traffic', label: 'Tráfico Pesado', icon: '🚗', color: 'orange' },
    { id: 'weather', label: 'Clima Adverso', icon: '🌧️', color: 'blue' },
    { id: 'mechanical', label: 'Problema Mecánico', icon: '🔧', color: 'red' },
    { id: 'fuel', label: 'Parada de Combustible', icon: '⛽', color: 'green' },
    { id: 'break', label: 'Descanso Programado', icon: '☕', color: 'purple' },
    { id: 'police', label: 'Control Policial', icon: '👮', color: 'yellow' },
    { id: 'accident', label: 'Accidente en Vía', icon: '⚠️', color: 'red' },
    { id: 'passengers', label: 'Situación Pasajeros', icon: '👥', color: 'blue' }
  ];

  // Inicializar checkpoints al cargar el componente
  useEffect(() => {
    if (viajeId) {
      initializeRealisticCheckpoints();
    }
  }, [viajeId]);

  // Función para inicializar checkpoints realistas
  const initializeRealisticCheckpoints = () => {
    const routeKey = determineRouteFromTripInfo();
    const realisticCheckpoints = getRealisticCheckpoints(routeKey);
    
    setCheckpoints(realisticCheckpoints);
    setCompletedCheckpoints([]);
    setCurrentCheckpointIndex(-1);

    if (initialProgress > 0) {
      autoCompleteCheckpointsByProgress(realisticCheckpoints, initialProgress);
    }
  };

  // Determinar ruta desde la información del viaje
  const determineRouteFromTripInfo = () => {
    if (tripInfo?.route) {
      const from = tripInfo.route.from?.toLowerCase().replace(/\s+/g, '-');
      const to = tripInfo.route.to?.toLowerCase().replace(/\s+/g, '-');
      return `${from}-${to}`;
    }
    return 'santa-ana-san-miguel';
  };

  // Checkpoints realistas por rutas
  const getRealisticCheckpoints = (routeKey) => {
    const routes = {
      'terminal-rivera-santa-ana-san-miguel': [
        { 
          id: 'start', 
          name: 'Terminal Rivera Santa Ana', 
          description: 'Punto de partida - Verificación inicial',
          lat: 13.9942, 
          lng: -89.5592, 
          type: 'departure', 
          estimatedProgress: 0,
          estimatedTime: '06:00 AM',
          requirements: ['Documentos', 'Inspección vehículo', 'Lista pasajeros']
        },
        { 
          id: 'comalapa', 
          name: 'Peaje Comalapa', 
          description: 'Control de peaje principal',
          lat: 13.7167, 
          lng: -89.1389, 
          type: 'toll', 
          estimatedProgress: 15,
          estimatedTime: '06:25 AM',
          requirements: ['Pago peaje']
        },
        { 
          id: 'sansalvador', 
          name: 'San Salvador Centro', 
          description: 'Parada técnica - Subida/bajada pasajeros',
          lat: 13.6929, 
          lng: -89.2182, 
          type: 'stop', 
          estimatedProgress: 35,
          estimatedTime: '07:00 AM',
          requirements: ['Control pasajeros', 'Descanso 10 min']
        },
        { 
          id: 'cojutepeque', 
          name: 'Cojutepeque', 
          description: 'Checkpoint intermedio',
          lat: 13.7167, 
          lng: -88.9389, 
          type: 'checkpoint', 
          estimatedProgress: 55,
          estimatedTime: '07:45 AM',
          requirements: ['Verificación ruta']
        },
        { 
          id: 'sanvicente', 
          name: 'San Vicente', 
          description: 'Parada de descanso - Servicios',
          lat: 13.6333, 
          lng: -88.7833, 
          type: 'rest', 
          estimatedProgress: 75,
          estimatedTime: '08:30 AM',
          requirements: ['Descanso 15 min', 'Servicios sanitarios']
        },
        { 
          id: 'sanmiguel', 
          name: 'Terminal San Miguel', 
          description: 'Destino final - Llegada',
          lat: 13.4833, 
          lng: -88.1833, 
          type: 'arrival', 
          estimatedProgress: 100,
          estimatedTime: '09:15 AM',
          requirements: ['Entrega documentos', 'Reporte final']
        }
      ],
      'default': [
        { 
          id: 'start', 
          name: 'Terminal de Partida', 
          description: 'Inicio del viaje',
          lat: 13.8833, 
          lng: -89.1000, 
          type: 'departure', 
          estimatedProgress: 0,
          estimatedTime: '06:00 AM',
          requirements: ['Preparación inicial']
        },
        { 
          id: 'middle', 
          name: 'Punto Intermedio', 
          description: 'Checkpoint de control',
          lat: 13.7400, 
          lng: -89.1500, 
          type: 'checkpoint', 
          estimatedProgress: 50,
          estimatedTime: '07:30 AM',
          requirements: ['Verificación estado']
        },
        { 
          id: 'arrival', 
          name: 'Terminal de Llegada', 
          description: 'Destino final',
          lat: 13.6929, 
          lng: -89.2182, 
          type: 'arrival', 
          estimatedProgress: 100,
          estimatedTime: '09:00 AM',
          requirements: ['Finalización viaje']
        }
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

  // Iniciar viaje
  const startTrip = async () => {
    if (tripStarted) return;

    setTripStarted(true);
    setCurrentStatus('en_curso');
    setLastUpdate(new Date());

    // Completar el primer checkpoint automáticamente
    if (checkpoints.length > 0) {
      await completeCheckpoint(checkpoints[0].id, 'Viaje iniciado por conductor');
    }

    console.log('Viaje iniciado:', viajeId);
  };

  // Completar checkpoint con más realismo
  const completeCheckpoint = async (checkpointId, customNote = '') => {
    const checkpoint = checkpoints.find(cp => cp.id === checkpointId);
    if (!checkpoint) return;

    const alreadyCompleted = completedCheckpoints.some(cp => cp.checkpointId === checkpointId);
    if (alreadyCompleted) return;

    const completedCheckpoint = {
      checkpointId,
      completedAt: new Date(),
      method: 'manual',
      note: customNote || `Checkpoint ${checkpoint.name} completado`,
      location: {
        lat: checkpoint.lat,
        lng: checkpoint.lng
      }
    };

    setCompletedCheckpoints(prev => [...prev, completedCheckpoint]);

    const newProgress = checkpoint.estimatedProgress;
    setProgress(newProgress);

    const checkpointIndex = checkpoints.findIndex(cp => cp.id === checkpointId);
    if (checkpointIndex > currentCheckpointIndex) {
      setCurrentCheckpointIndex(checkpointIndex);
    }

    if (newProgress >= 100) {
      setCurrentStatus('completado');
    } else if (newProgress > 0 && currentStatus === 'pendiente') {
      setCurrentStatus('en_curso');
    }

    setLastUpdate(new Date());
  };

  // Reportar incidente
  const reportIncident = () => {
    if (!selectedIncidentType || !incidentDescription.trim()) return;

    const incident = {
      id: `incident_${Date.now()}`,
      type: selectedIncidentType,
      description: incidentDescription,
      reportedAt: new Date(),
      location: getCurrentLocation(),
      resolved: false
    };

    setIncidents(prev => [...prev, incident]);
    
    // Si es un incidente crítico, cambiar estado a retrasado
    if (['mechanical', 'accident', 'weather'].includes(selectedIncidentType)) {
      setCurrentStatus('retrasado');
    }

    setShowIncidentForm(false);
    setSelectedIncidentType('');
    setIncidentDescription('');
    setLastUpdate(new Date());
  };

  // Obtener ubicación actual estimada
  const getCurrentLocation = () => {
    const completedCount = completedCheckpoints.length;
    if (completedCount === 0) return checkpoints[0];
    if (completedCount >= checkpoints.length) return checkpoints[checkpoints.length - 1];
    
    const lastCompleted = checkpoints[completedCount - 1];
    const nextCheckpoint = checkpoints[completedCount];
    
    return {
      lat: (lastCompleted.lat + nextCheckpoint.lat) / 2,
      lng: (lastCompleted.lng + nextCheckpoint.lng) / 2,
      name: `Entre ${lastCompleted.name} y ${nextCheckpoint.name}`
    };
  };

  // Resolver incidente
  const resolveIncident = (incidentId) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, resolved: true, resolvedAt: new Date() }
        : incident
    ));

    // Si no hay más incidentes activos, volver a estado normal
    const activeIncidents = incidents.filter(i => !i.resolved && i.id !== incidentId);
    if (activeIncidents.length === 0 && currentStatus === 'retrasado') {
      setCurrentStatus('en_curso');
    }
  };

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

  const getCheckpointIcon = (checkpoint, isCompleted, isCurrent) => {
    if (isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (isCurrent) {
      return <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />;
    }
    
    switch (checkpoint.type) {
      case 'departure':
        return <Truck className="w-4 h-4 text-gray-400" />;
      case 'arrival':
        return <MapPin className="w-4 h-4 text-gray-400" />;
      case 'toll':
        return <Circle className="w-4 h-4 text-yellow-500" />;
      case 'rest':
        return <PauseCircle className="w-4 h-4 text-green-500" />;
      case 'stop':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getIncidentIcon = (type) => {
    const incidentType = incidentTypes.find(t => t.id === type);
    return incidentType ? incidentType.icon : '⚠️';
  };

  const getIncidentColor = (type) => {
    const incidentType = incidentTypes.find(t => t.id === type);
    return incidentType ? incidentType.color : 'gray';
  };

  const nextCheckpoint = checkpoints[currentCheckpointIndex + 1];
  const activeIncidents = incidents.filter(i => !i.resolved);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm max-w-md mx-auto">
      {/* Header con información del viaje */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="font-medium text-gray-900">{getStatusText()}</span>
            <span className="text-xs text-gray-400">({viajeId})</span>
          </div>
          <div className="text-sm text-gray-500 font-semibold">
            {Math.round(progress)}%
          </div>
        </div>
        
        <div className="text-xs text-gray-600 mb-2">
          🚐 {tripInfo?.vehicle} • 👨‍✈️ {tripInfo?.driver}
        </div>
        
        <div className="text-xs text-gray-600">
          📍 {tripInfo?.route?.from} → {tripInfo?.route?.to}
        </div>
      </div>

      {/* Botón de inicio del viaje */}
      {!tripStarted && currentStatus === 'pendiente' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800 mb-2 font-medium">
            ✅ Listo para iniciar viaje
          </div>
          <button
            onClick={startTrip}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Iniciar Viaje</span>
          </button>
        </div>
      )}

      {/* Incidentes activos */}
      {activeIncidents.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-sm text-orange-800 mb-2 font-medium">
            ⚠️ Incidentes Activos ({activeIncidents.length})
          </div>
          {activeIncidents.slice(0, 2).map(incident => (
            <div key={incident.id} className="flex items-center justify-between mb-2 p-2 bg-white rounded border">
              <div className="flex items-center space-x-2">
                <span>{getIncidentIcon(incident.type)}</span>
                <div>
                  <div className="text-xs font-medium">{incident.description}</div>
                  <div className="text-xs text-gray-500">
                    {incident.reportedAt.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => resolveIncident(incident.id)}
                className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Resolver
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Barra de progreso principal */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4 relative">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ease-out ${getStatusColor()}`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        >
          {currentStatus === 'en_curso' && (
            <div className="h-full w-full rounded-full opacity-75 animate-pulse"></div>
          )}
        </div>
        
        {checkpoints.map((checkpoint) => (
          <div
            key={checkpoint.id}
            className="absolute top-0 w-1 h-3 bg-white border-2 border-gray-400 rounded-sm shadow-sm"
            style={{ left: `${checkpoint.estimatedProgress}%` }}
            title={`${checkpoint.name} - ${checkpoint.estimatedProgress}%`}
          />
        ))}
      </div>

      {/* Próximo checkpoint */}
      {nextCheckpoint && tripStarted && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800 mb-2 font-medium">
            📍 Próximo Checkpoint
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{nextCheckpoint.name}</div>
              <div className="text-xs text-gray-600">{nextCheckpoint.description}</div>
              <div className="text-xs text-blue-600">ETA: {nextCheckpoint.estimatedTime}</div>
            </div>
            <button
              onClick={() => completeCheckpoint(nextCheckpoint.id)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              ✓ Llegar
            </button>
          </div>
        </div>
      )}

      {/* Lista de checkpoints */}
      <div className="space-y-2 mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">
          📋 Checkpoints del viaje ({completedCheckpoints.length}/{checkpoints.length})
        </div>
        
        <div className="max-h-48 overflow-y-auto space-y-1">
          {checkpoints.map((checkpoint, index) => {
            const isCompleted = completedCheckpoints.some(cp => cp.checkpointId === checkpoint.id);
            const isCurrent = index === currentCheckpointIndex + 1;
            const completedData = completedCheckpoints.find(cp => cp.checkpointId === checkpoint.id);
            
            return (
              <div
                key={checkpoint.id}
                className={`p-2 rounded-lg border ${
                  isCompleted ? 'bg-green-50 border-green-200' :
                  isCurrent ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
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
                        {checkpoint.description}
                      </div>
                      <div className="text-xs text-gray-400">
                        {checkpoint.estimatedTime} • {checkpoint.estimatedProgress}%
                      </div>
                    </div>
                  </div>
                  
                  {isCompleted && completedData && (
                    <div className="text-xs text-green-600">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {completedData.completedAt.toLocaleTimeString()}
                    </div>
                  )}
                </div>
                
                {/* Requisitos del checkpoint */}
                {checkpoint.requirements && (
                  <div className="mt-1 text-xs text-gray-500">
                    📋 {checkpoint.requirements.join(' • ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controles de incidentes */}
      {tripStarted && (
        <div className="mb-3">
          {!showIncidentForm ? (
            <button
              onClick={() => setShowIncidentForm(true)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Reportar Incidente</span>
            </button>
          ) : (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-sm font-medium text-orange-800 mb-2">
                ⚠️ Reportar Incidente
              </div>
              
              <div className="grid grid-cols-2 gap-1 mb-2">
                {incidentTypes.slice(0, 8).map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedIncidentType(type.id)}
                    className={`text-xs p-1 rounded border ${
                      selectedIncidentType === type.id 
                        ? 'bg-orange-200 border-orange-400' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
              
              <textarea
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                placeholder="Describe el incidente..."
                className="w-full text-xs p-2 border border-gray-300 rounded mb-2"
                rows="2"
              />
              
              <div className="flex space-x-2">
                <button
                  onClick={reportIncident}
                  disabled={!selectedIncidentType || !incidentDescription.trim()}
                  className="flex-1 px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 disabled:bg-gray-300"
                >
                  Reportar
                </button>
                <button
                  onClick={() => {
                    setShowIncidentForm(false);
                    setSelectedIncidentType('');
                    setIncidentDescription('');
                  }}
                  className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información de actualización */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Última actualización: {lastUpdate.toLocaleTimeString()}</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            <span>Demo</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <div className="flex justify-between">
            <span>Checkpoints completados:</span>
            <span className="font-medium">{completedCheckpoints.length}/{checkpoints.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Incidentes activos:</span>
            <span className="font-medium text-orange-600">{activeIncidents.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Estado del viaje:</span>
            <span className="font-medium">{tripStarted ? 'Iniciado' : 'Pendiente'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeProgressBar;