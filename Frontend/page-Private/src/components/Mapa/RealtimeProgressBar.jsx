// 📁 Frontend/src/components/Mapa/RealtimeProgressBar.jsx
// VERSIÓN COMPATIBLE CON TU BACKEND EXISTENTE - SIN CAMBIOS AL BACKEND

import React, { useState, useEffect, useCallback } from 'react';
import { config } from '../../config';
import { 
  MapPin, Clock, CheckCircle, Circle, Navigation, Truck, Plus, 
  Play, AlertTriangle, Users, Fuel, MessageSquare, Loader,
  XCircle, PauseCircle, RotateCcw, Info, Wifi, WifiOff
} from 'lucide-react';

const API_URL = config.api.API_URL;

const RealtimeProgressBar = ({ 
  viajeId,
  onStatusChange,
  apiConfig = {
    baseUrl: process.env.REACT_APP_API_URL || `${API_URL}`,
    endpoints: {
      getTripDetails: '/viajes/:id',
      updateProgress: '/viajes/:id/progress',
      completeTrip: '/viajes/:id/complete',
      getMapData: '/viajes/map-data'
    }
  },
  enablePolling = true,
  pollingInterval = 30000 // 30 segundos
}) => {
  // Estados principales
  const [viajeData, setViajeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Estados del viaje derivados de tu esquema
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('pendiente');
  const [checkpoints, setCheckpoints] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [tripStarted, setTripStarted] = useState(false);
  
  // Estados de UI
  const [isStarting, setIsStarting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [selectedIncidentType, setSelectedIncidentType] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');

  // Tipos de incidentes (simplificados para tu sistema)
  const incidentTypes = [
    { id: 'traffic', label: 'Tráfico Pesado', icon: '🚗', color: 'orange' },
    { id: 'weather', label: 'Clima Adverso', icon: '🌧️', color: 'blue' },
    { id: 'mechanical', label: 'Problema Mecánico', icon: '🔧', color: 'red' },
    { id: 'fuel', label: 'Parada Combustible', icon: '⛽', color: 'green' },
    { id: 'break', label: 'Descanso', icon: '☕', color: 'purple' },
    { id: 'delay', label: 'Retraso General', icon: '⏰', color: 'yellow' }
  ];

  // Checkpoints realistas para El Salvador basados en tu esquema
  const getRouteCheckpoints = useCallback((origen, destino) => {
    const normalizeLocation = (location) => {
      if (!location) return '';
      return location.toLowerCase().replace(/[^a-z]/g, '');
    };

    const origenNorm = normalizeLocation(origen);
    const destinoNorm = normalizeLocation(destino);

    // Rutas principales de El Salvador
    if (origenNorm.includes('santaana') && destinoNorm.includes('sanmiguel')) {
      return [
        {
          id: 'inicio',
          name: 'Terminal Rivera Santa Ana',
          description: 'Punto de partida',
          municipio: 'Santa Ana',
          departamento: 'Santa Ana',
          estimatedProgress: 0,
          isOptional: false
        },
        {
          id: 'texistepeque',
          name: 'Texistepeque',
          description: 'Control de ruta',
          municipio: 'Texistepeque',
          departamento: 'Santa Ana',
          estimatedProgress: 15,
          isOptional: true
        },
        {
          id: 'comalapa',
          name: 'Peaje Comalapa',
          description: 'Estación de peaje',
          municipio: 'Comalapa',
          departamento: 'La Paz',
          estimatedProgress: 30,
          isOptional: false
        },
        {
          id: 'sansalvador',
          name: 'San Salvador',
          description: 'Parada técnica',
          municipio: 'San Salvador',
          departamento: 'San Salvador',
          estimatedProgress: 50,
          isOptional: false
        },
        {
          id: 'cojutepeque',
          name: 'Cojutepeque',
          description: 'Checkpoint intermedio',
          municipio: 'Cojutepeque',
          departamento: 'Cuscatlán',
          estimatedProgress: 70,
          isOptional: true
        },
        {
          id: 'sanvicente',
          name: 'San Vicente',
          description: 'Parada de servicios',
          municipio: 'San Vicente',
          departamento: 'San Vicente',
          estimatedProgress: 85,
          isOptional: false
        },
        {
          id: 'destino',
          name: 'Terminal San Miguel',
          description: 'Destino final',
          municipio: 'San Miguel',
          departamento: 'San Miguel',
          estimatedProgress: 100,
          isOptional: false
        }
      ];
    }

    // Ruta por defecto
    return [
      {
        id: 'inicio',
        name: origen || 'Terminal de Partida',
        description: 'Punto de partida',
        estimatedProgress: 0,
        isOptional: false
      },
      {
        id: 'intermedio',
        name: 'Punto Intermedio',
        description: 'Control de ruta',
        estimatedProgress: 50,
        isOptional: true
      },
      {
        id: 'destino',
        name: destino || 'Terminal de Llegada',
        description: 'Destino final',
        estimatedProgress: 100,
        isOptional: false
      }
    ];
  }, []);

  // Función para hacer llamadas a la API usando tus endpoints existentes
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      setIsConnected(true);
      const url = `${apiConfig.baseUrl}${endpoint}`.replace(':id', viajeId);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setLastUpdate(new Date());
      return data;
    } catch (error) {
      console.error('API Call Error:', error);
      setIsConnected(false);
      setError(error.message);
      throw error;
    }
  }, [apiConfig.baseUrl, viajeId]);

  // Cargar datos del viaje usando tu endpoint existente
  const loadTripData = useCallback(async () => {
    if (!viajeId) return;

    try {
      setLoading(true);
      setError(null);

      // Usar tu endpoint getTripDetails existente
      const response = await apiCall(apiConfig.endpoints.getTripDetails);
      const viaje = response.data || response;

      setViajeData(viaje);
      
      // Mapear tu esquema al estado del componente
      const estadoActual = viaje.estado?.actual || 'pendiente';
      const progresoActual = viaje.tracking?.progreso?.porcentaje || 0;
      
      setCurrentStatus(estadoActual);
      setProgress(progresoActual);
      setTripStarted(estadoActual !== 'pendiente');

      // Procesar checkpoints desde tu tracking
      const trackingCheckpoints = viaje.tracking?.checkpoints || [];
      setCheckpoints(trackingCheckpoints);

      // Procesar alertas desde tu esquema
      const alertasActivas = viaje.alertas?.filter(alert => !alert.resuelta) || [];
      setIncidents(alertasActivas.map(alert => ({
        id: alert._id || Math.random().toString(36).substr(2, 9),
        type: alert.tipo || 'delay',
        description: alert.mensaje || alert.descripcion,
        reportedAt: new Date(alert.fecha),
        resolved: alert.resuelta || false,
        severity: alert.prioridad || 'medium'
      })));

    } catch (error) {
      console.error('Error loading trip data:', error);
      setError('Error al cargar datos del viaje');
    } finally {
      setLoading(false);
    }
  }, [viajeId, apiCall, apiConfig.endpoints.getTripDetails]);

  // Iniciar viaje usando tu endpoint de actualización de progreso
  const startTrip = async () => {
    if (isStarting || currentStatus !== 'pendiente') return;

    try {
      setIsStarting(true);
      setError(null);

      const now = new Date();
      const salidaProgramada = new Date(viajeData.departureTime);
      
      // Determinar si hay retraso
      const minutosRetraso = Math.round((now - salidaProgramada) / (1000 * 60));
      const hayRetraso = minutosRetraso > 15; // Más de 15 minutos = retraso

      const nuevoEstado = hayRetraso ? 'retrasado' : 'en_curso';
      
      // Usar tu endpoint updateTripProgress existente
      const response = await apiCall(apiConfig.endpoints.updateProgress, {
        method: 'PATCH',
        body: JSON.stringify({
          progreso: 5, // Progreso inicial pequeño
          estado: nuevoEstado,
          observaciones: hayRetraso ? 
            `Viaje iniciado con ${minutosRetraso} minutos de retraso. Programado: ${salidaProgramada.toLocaleTimeString()}, Iniciado: ${now.toLocaleTimeString()}` :
            `Viaje iniciado a tiempo a las ${now.toLocaleTimeString()}`
        })
      });

      // Actualizar estado local
      setCurrentStatus(nuevoEstado);
      setProgress(5);
      setTripStarted(true);
      setLastUpdate(new Date());

      // Agregar checkpoint de inicio
      const inicioCheckpoint = {
        tipo: 'inicio_manual',
        progreso: 5,
        descripcion: hayRetraso ? 
          `🚛 Viaje iniciado con ${minutosRetraso} min de retraso` :
          '🚛 Viaje iniciado a tiempo',
        timestamp: now,
        reportadoPor: 'manual',
        estadoViaje: nuevoEstado
      };

      setCheckpoints(prev => [...prev, inicioCheckpoint]);

      // Notificar cambio de estado
      if (onStatusChange) {
        onStatusChange(nuevoEstado, { 
          ...response, 
          retraso: hayRetraso ? minutosRetraso : 0 
        });
      }

      console.log('✅ Viaje iniciado:', nuevoEstado, hayRetraso ? `(${minutosRetraso} min retraso)` : '(a tiempo)');

    } catch (error) {
      console.error('❌ Error al iniciar viaje:', error);
      setError('No se pudo iniciar el viaje. Inténtalo de nuevo.');
    } finally {
      setIsStarting(false);
    }
  };

  // Actualizar progreso usando tu endpoint existente
  const updateProgress = async (newProgress) => {
    try {
      setIsUpdating(true);

      const response = await apiCall(apiConfig.endpoints.updateProgress, {
        method: 'PATCH',
        body: JSON.stringify({
          progreso: newProgress,
          observaciones: `Progreso actualizado manualmente a ${newProgress}%`
        })
      });

      setProgress(newProgress);
      
      // Agregar checkpoint de progreso
      const progresoCheckpoint = {
        tipo: 'progreso_manual',
        progreso: newProgress,
        descripcion: `📈 Progreso actualizado a ${newProgress}%`,
        timestamp: new Date(),
        reportadoPor: 'manual'
      };

      setCheckpoints(prev => [...prev, progresoCheckpoint]);

      // Si llega a 100%, completar automáticamente
      if (newProgress >= 100) {
        await completeTrip();
      }

    } catch (error) {
      console.error('Error actualizando progreso:', error);
      setError('Error al actualizar progreso');
    } finally {
      setIsUpdating(false);
    }
  };

  // Completar viaje usando tu endpoint existente
  const completeTrip = async () => {
    try {
      const response = await apiCall(apiConfig.endpoints.completeTrip, {
        method: 'PATCH',
        body: JSON.stringify({
          observaciones: 'Viaje completado desde panel de progreso'
        })
      });

      setCurrentStatus('completado');
      setProgress(100);

      // Agregar checkpoint de finalización
      const finalizacionCheckpoint = {
        tipo: 'finalizacion_manual',
        progreso: 100,
        descripcion: '✅ Viaje completado exitosamente',
        timestamp: new Date(),
        reportadoPor: 'manual'
      };

      setCheckpoints(prev => [...prev, finalizacionCheckpoint]);

      if (onStatusChange) {
        onStatusChange('completado', response);
      }

    } catch (error) {
      console.error('Error completando viaje:', error);
      setError('Error al completar viaje');
    }
  };

  // Reportar incidente simple (sin backend, solo local)
  const reportIncident = () => {
    if (!selectedIncidentType || !incidentDescription.trim()) return;

    const newIncident = {
      id: `incident_${Date.now()}`,
      type: selectedIncidentType,
      description: incidentDescription,
      reportedAt: new Date(),
      resolved: false,
      severity: 'medium'
    };

    setIncidents(prev => [...prev, newIncident]);

    // Agregar checkpoint del incidente
    const incidenteCheckpoint = {
      tipo: 'incidente_reportado',
      progreso: progress,
      descripcion: `⚠️ ${incidentDescription}`,
      timestamp: new Date(),
      reportadoPor: 'manual',
      tipoIncidente: selectedIncidentType
    };

    setCheckpoints(prev => [...prev, incidenteCheckpoint]);

    // Limpiar formulario
    setShowIncidentForm(false);
    setSelectedIncidentType('');
    setIncidentDescription('');
    setLastUpdate(new Date());
  };

  // Resolver incidente
  const resolveIncident = (incidentId) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, resolved: true, resolvedAt: new Date() }
        : incident
    ));

    // Agregar checkpoint de resolución
    const resolucionCheckpoint = {
      tipo: 'incidente_resuelto',
      progreso: progress,
      descripcion: '✅ Incidente resuelto',
      timestamp: new Date(),
      reportadoPor: 'manual'
    };

    setCheckpoints(prev => [...prev, resolucionCheckpoint]);
  };

  // Polling para actualizaciones (usa tu AutoUpdateService)
  useEffect(() => {
    if (!enablePolling || !viajeId || currentStatus === 'completado') return;

    const interval = setInterval(async () => {
      try {
        await loadTripData();
      } catch (error) {
        console.warn('Error en polling:', error);
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enablePolling, viajeId, currentStatus, pollingInterval, loadTripData]);

  // Cargar datos iniciales
  useEffect(() => {
    loadTripData();
  }, [loadTripData]);

  // Funciones de utilidad para UI
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

  const getCheckpointIcon = (checkpoint) => {
    const tipo = checkpoint.tipo || '';
    
    if (tipo.includes('inicio')) return <Truck className="w-4 h-4 text-green-600" />;
    if (tipo.includes('finalizacion')) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (tipo.includes('progreso')) return <Navigation className="w-4 h-4 text-blue-600" />;
    if (tipo.includes('incidente')) return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  // Calcular retraso actual
  const calculateCurrentDelay = () => {
    if (!viajeData?.departureTime) return null;
    
    const now = new Date();
    const programmed = new Date(viajeData.departureTime);
    const delayMinutes = Math.round((now - programmed) / (1000 * 60));
    
    if (delayMinutes > 15) {
      return {
        minutes: delayMinutes,
        text: `${delayMinutes} min de retraso`
      };
    }
    
    return null;
  };

  // Si está cargando
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm max-w-md mx-auto">
        <div className="flex items-center justify-center space-x-2">
          <Loader className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-gray-600">Cargando datos del viaje...</span>
        </div>
      </div>
    );
  }

  // Si no hay datos del viaje
  if (!viajeData && !loading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm max-w-md mx-auto">
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <div className="font-medium">Viaje no encontrado</div>
          <div className="text-sm">ID: {viajeId}</div>
        </div>
      </div>
    );
  }

  const activeIncidents = incidents.filter(i => !i.resolved);
  const currentDelay = calculateCurrentDelay();

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
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500 font-semibold">
              {Math.round(progress)}%
            </div>
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-600 mb-2">
          🚐 {viajeData.truckId?.brand || viajeData.truckId?.marca || 'Camión'} {viajeData.truckId?.model || viajeData.truckId?.modelo || ''}
          {' • '}
          👨‍✈️ {viajeData.conductorId?.name || viajeData.conductorId?.nombre || 'Conductor'}
        </div>
        
        <div className="text-xs text-gray-600">
          📍 {viajeData.quoteId?.ruta?.origen?.nombre || 'Origen'} → {viajeData.quoteId?.ruta?.destino?.nombre || 'Destino'}
        </div>

        {/* Mostrar retraso si existe */}
        {currentDelay && (
          <div className="text-xs text-orange-600 mt-1 font-medium">
            ⏰ {currentDelay.text}
          </div>
        )}
      </div>

      {/* Errores */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <div className="text-xs text-red-600 mt-1">{error}</div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-500 hover:text-red-700 mt-1"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Botón de inicio del viaje */}
      {!tripStarted && currentStatus === 'pendiente' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800 mb-2 font-medium">
            ✅ Listo para iniciar viaje
          </div>
          {currentDelay && (
            <div className="text-xs text-orange-700 mb-2">
              ⚠️ Iniciará con {currentDelay.minutes} minutos de retraso
            </div>
          )}
          <button
            onClick={startTrip}
            disabled={isStarting}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
          >
            {isStarting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Iniciando...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Iniciar Viaje</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Incidentes activos */}
      {activeIncidents.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-sm text-orange-800 mb-2 font-medium">
            ⚠️ Incidentes Activos ({activeIncidents.length})
          </div>
          {activeIncidents.slice(0, 2).map(incident => {
            const incidentType = incidentTypes.find(t => t.id === incident.type);
            return (
              <div key={incident.id} className="flex items-center justify-between mb-2 p-2 bg-white rounded border">
                <div className="flex items-center space-x-2">
                  <span>{incidentType?.icon || '⚠️'}</span>
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
            );
          })}
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
      </div>

      {/* Controles de progreso manual */}
      {tripStarted && currentStatus !== 'completado' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800 mb-2 font-medium">
            📈 Actualizar Progreso
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => updateProgress(25)}
              disabled={isUpdating || progress >= 25}
              className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              25%
            </button>
            <button
              onClick={() => updateProgress(50)}
              disabled={isUpdating || progress >= 50}
              className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              50%
            </button>
            <button
              onClick={() => updateProgress(75)}
              disabled={isUpdating || progress >= 75}
              className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              75%
            </button>
            <button
              onClick={() => updateProgress(100)}
              disabled={isUpdating}
              className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              Completar
            </button>
          </div>
        </div>
      )}

      {/* Lista de checkpoints */}
      <div className="space-y-2 mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">
          📋 Historial del viaje ({checkpoints.length} eventos)
        </div>
        
        <div className="max-h-48 overflow-y-auto space-y-1">
          {checkpoints
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10)
            .map((checkpoint, index) => (
              <div
                key={`${checkpoint.tipo}-${checkpoint.timestamp}-${index}`}
                className="p-2 rounded-lg border bg-gray-50 border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    {getCheckpointIcon(checkpoint)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-gray-700">
                        {checkpoint.descripcion}
                      </div>
                      <div className="text-xs text-gray-500">
                        Progreso: {checkpoint.progreso}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(checkpoint.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Controles de incidentes */}
      {tripStarted && currentStatus !== 'completado' && (
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
                {incidentTypes.map(type => (
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
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''}`}></div>
            <span>{isConnected ? 'AutoUpdate Activo' : 'Sin conexión'}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <div className="flex justify-between">
            <span>Eventos registrados:</span>
            <span className="font-medium">{checkpoints.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Incidentes activos:</span>
            <span className="font-medium text-orange-600">{activeIncidents.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Estado del viaje:</span>
            <span className="font-medium">{tripStarted ? 'Iniciado' : 'Pendiente'}</span>
          </div>
          {viajeData?.departureTime && (
            <div className="flex justify-between">
              <span>Hora programada:</span>
              <span className="font-medium">{new Date(viajeData.departureTime).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeProgressBar;