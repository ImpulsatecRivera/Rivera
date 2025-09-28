// src/screens/QuoteDetailsScreen.jsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

// Import Lottie animations
import DeliveryTruck from "../assets/lottie/Car _ Ignite Animation.json";
import CheckSuccess from "../assets/lottie/success tick.json";
import ClockPending from "../assets/lottie/Waiting (1).json";
import CancelError from "../assets/lottie/cancel animation.json";

// Lottie configuration for each status
const statusLottieConfig = {
  pendiente: {
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#F59E0B',
    icon: 'time-outline',
    lottie: ClockPending,
    loop: false
  },
  enviada: {
    bg: '#DBEAFE',
    text: '#1D4ED8',
    border: '#3B82F6',
    icon: 'paper-plane-outline',
    lottie: DeliveryTruck,
    loop: true
  },
  'en ruta': {
    bg: '#DBEAFE',
    text: '#0369A1',
    border: '#0EA5E9',
    icon: 'sync-outline',
    lottie: DeliveryTruck,
    loop: true
  },
  aceptada: {
    bg: '#D1FAE5',
    text: '#065F46',
    border: '#10B981',
    icon: 'checkmark-circle-outline',
    lottie: CheckSuccess,
    loop: false
  },
  completado: {
    bg: '#D1FAE5',
    text: '#065F46',
    border: '#10B981',
    icon: 'checkmark-circle-outline',
    lottie: CheckSuccess,
    loop: false
  },
  rechazada: {
    bg: '#FEE2E2',
    text: '#991B1B',
    border: '#EF4444',
    icon: 'close-circle-outline',
    lottie: CancelError,
    loop: true
  },
  cancelada: {
    bg: '#F3F4F6',
    text: '#374151',
    border: '#6B7280',
    icon: 'ban-outline',
    lottie: CancelError,
    loop: true
  },
  'en_proceso': {
    bg: '#E0F2FE',
    text: '#0369A1',
    border: '#0EA5E9',
    icon: 'sync-outline',
    lottie: DeliveryTruck,
    loop: true
  }
};

const QuoteDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  
  // FIXED: Accept both 'quote' and 'item' parameters for better compatibility
  const { quote, item } = route.params || {};
  const data = quote || item; // Use whichever one is provided

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#DC2626" />
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorText}>No se pudo cargar la información de la cotización</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
            <Text style={styles.errorButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Mapeo robusto que maneja múltiples estructuras de datos
  const createRobustMapping = (quoteData) => {
  console.log('=== DEBUGGING QUOTE DETAILS ===');
  console.log('Quote recibido:', JSON.stringify(quoteData, null, 2));
  console.log('Quote keys:', Object.keys(quoteData || {}));
  console.log('================================');
  
  // Función auxiliar para obtener el primer valor válido
  const getFirstAvailable = (...values) => {
    return values.find(val => 
      val !== null && 
      val !== undefined && 
      val !== '' && 
      val !== '—' && 
      val !== 'No especificado'
    ) || 'No especificado';
  };

  // FIXED: Function to safely convert any value to string for rendering
  const safeStringify = (value) => {
    if (value === null || value === undefined) return 'No especificado';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object') {
      // If it's a date
      if (value instanceof Date) return value.toISOString();
      // If it's an object with common ID patterns
      if (value._id) return String(value._id);
      if (value.id) return String(value.id);
      // If it has a name property
      if (value.name) return String(value.name);
      // If it has email (for client objects)
      if (value.email) return String(value.email);
      // Otherwise try to stringify it safely
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  };

  // Función auxiliar para obtener precios
  const getPrice = () => {
    const priceOptions = [
      quoteData.price,
      quoteData.totalPrice,
      quoteData.estimatedPrice,
      quoteData.amount,
      quoteData.total, // Added this for HistorialCard compatibility
      quoteData.costos?.total,
      quoteData.costos?.subtotal
    ].filter(price => price && typeof price === 'number' && price > 0);
    
    return priceOptions.length > 0 ? priceOptions[0] : 0;
  };

  // Función para obtener coordenadas
  const getCoordinates = (locationObj) => {
    if (!locationObj) return null;
    if (locationObj.coordenadas) {
      return {
        lat: locationObj.coordenadas.lat || locationObj.coordenadas.latitude,
        lng: locationObj.coordenadas.lng || locationObj.coordenadas.longitude
      };
    }
    if (locationObj.coordinates) {
      return {
        lat: locationObj.coordinates.lat || locationObj.coordinates.latitude,
        lng: locationObj.coordinates.lng || locationObj.coordinates.longitude
      };
    }
    return null;
  };

  // Mapeo de tipos de camión del backend a nombres amigables
  const truckTypeMap = {
    'alimentos_perecederos': 'Camión Refrigerado',
    'alimentos_no_perecederos': 'Camión Seco',
    'otros': 'Camión Seco',
    'materiales_construccion': 'Camión de Construcción',
    'bebidas': 'Camión para Bebidas',
    'textiles': 'Camión para Textiles',
    'electronicos': 'Camión para Electrónicos',
    'medicamentos': 'Camión para Medicamentos',
    'maquinaria': 'Camión para Maquinaria',
    'vehiculos': 'Camión Porta-vehículos',
    'quimicos': 'Camión para Químicos',
    'combustibles': 'Camión Cisterna',
    'papel_carton': 'Camión para Papel y Cartón',
    'muebles': 'Camión para Muebles',
    'productos_agricolas': 'Camión Agrícola',
    'metales': 'Camión para Metales',
    'plasticos': 'Camión para Plásticos',
    'vidrio_ceramica': 'Camión para Vidrio y Cerámica',
    'productos_limpieza': 'Camión para Productos de Limpieza',
    'cosmeticos': 'Camión para Cosméticos',
    'juguetes': 'Camión para Juguetes'
  };

  // Obtener el tipo de camión del backend
  const rawTruckType = quoteData.truckType || quoteData.carga?.categoria || 'otros';
  const friendlyTruckType = truckTypeMap[rawTruckType] || rawTruckType;

  const mappedData = {
    // Identificación - FIXED: Handle both data structures
    id: quoteData._id || quoteData.id || 'sin-id',
    
    // Estado
    status: (quoteData.status || 'pendiente').toLowerCase(),
    
    // Información básica - FIXED: Add more fallbacks for HistorialCard data
    title: safeStringify(getFirstAvailable(
      quoteData.title,           // From HistorialCard
      quoteData.quoteName,
      quoteData.quoteDescription,
      quoteData.description,
      'Cotización sin título'
    )),
    
    description: safeStringify(getFirstAvailable(
      quoteData.quoteDescription,
      quoteData.description,
      quoteData.observaciones,
      quoteData.notes,
      'Sin descripción disponible'
    )),
    
    // Precio
    price: getPrice(),
    
    // Método de pago - FIXED: Add metodoPago for HistorialCard compatibility
    paymentMethod: safeStringify(getFirstAvailable(
      quoteData.paymentMethod,
      quoteData.metodoPago,       // From HistorialCard
      quoteData.payment_method,
      'Efectivo'
    )),
    
    // Tipo de camión - CORREGIDO con nombre amigable
    truckType: safeStringify(friendlyTruckType),
    truckTypeRaw: safeStringify(rawTruckType),
    
    // Ubicaciones - FIXED: Add lugarEntrega for HistorialCard compatibility
    pickupLocation: safeStringify(getFirstAvailable(
      quoteData.pickupLocation,
      quoteData.ruta?.origen?.nombre,
      quoteData.pickupAddress,
      quoteData.origin?.name,
      'Ubicación de recogida no especificada'
    )),
    
    destinationLocation: safeStringify(getFirstAvailable(
      quoteData.destinationLocation,
      quoteData.lugarEntrega,     // From HistorialCard
      quoteData.ruta?.destino?.nombre,
      quoteData.destinationAddress,
      quoteData.destination?.name,
      'Ubicación de destino no especificada'
    )),
    
    // Coordenadas
    pickupCoordinates: getCoordinates(quoteData.ruta?.origen) || getCoordinates(quoteData.origin),
    destinationCoordinates: getCoordinates(quoteData.ruta?.destino) || getCoordinates(quoteData.destination),
    
    // Descripción del viaje
    travelLocations: safeStringify(getFirstAvailable(
      quoteData.travelLocations,
      quoteData.travel_locations,
      `De ${safeStringify(getFirstAvailable(quoteData.pickupLocation, quoteData.ruta?.origen?.nombre, 'origen'))} a ${safeStringify(getFirstAvailable(quoteData.destinationLocation, quoteData.lugarEntrega, quoteData.ruta?.destino?.nombre, 'destino'))}`
    )),
    
    // Horarios - FIXED: Add HistorialCard field names
    departureTime: safeStringify(getFirstAvailable(
      quoteData.departureTime,
      quoteData.horaSalida,       // From HistorialCard
      quoteData.horarios?.fechaSalida,
      quoteData.scheduledDepartureTime,
      quoteData.departure_time
    )),
    
    arrivalTime: safeStringify(getFirstAvailable(
      quoteData.arrivalTime,
      quoteData.horaLlegada,      // From HistorialCard
      quoteData.horarios?.fechaLlegadaEstimada,
      quoteData.scheduledArrivalTime,
      quoteData.estimatedArrivalTime,
      quoteData.arrival_time
    )),
    
    deliveryDate: safeStringify(getFirstAvailable(
      quoteData.deliveryDate,
      quoteData.horarios?.fechaLlegadaEstimada,
      quoteData.arrivalTime,
      quoteData.scheduledDeliveryDate,
      quoteData.delivery_date
    )),
    
    // Tiempo y distancia
    estimatedTime: quoteData.estimatedTime || 
                  quoteData.horarios?.tiempoEstimadoViaje || 
                  quoteData.estimated_time || 
                  0,
    
    distance: quoteData.estimatedDistance ||
              quoteData.ruta?.distanciaTotal || 
              quoteData.distance || 
              0,
    
    // Fechas del sistema - FIXED: Handle _raw structure from HistorialCard
    createdAt: safeStringify(quoteData.createdAt || quoteData._raw?.createdAt || quoteData.created_at),
    updatedAt: safeStringify(quoteData.updatedAt || quoteData._raw?.updatedAt || quoteData.updated_at),
    
    // Costos detallados
    costos: quoteData.costos || quoteData.costs || {},
    
    // Información de carga
    carga: quoteData.carga || quoteData.cargo || {},
    
    // Datos adicionales
    observaciones: safeStringify(getFirstAvailable(
      quoteData.observaciones,
      quoteData.notes,
      quoteData.comments,
      ''
    )),
    
    // FIXED: Add clienteId for HistorialCard compatibility - handle objects
    clientId: (() => {
      const clientIdValue = quoteData.clientId || quoteData.clienteId || quoteData.client_id;
      // If it's an object with _id, email, phone, extract the _id
      if (clientIdValue && typeof clientIdValue === 'object') {
        return safeStringify(clientIdValue._id || clientIdValue.id || clientIdValue);
      }
      return safeStringify(clientIdValue || '');
    })(),
    
    // Metadata
    createdFrom: safeStringify(quoteData.createdFrom || quoteData.created_from || 'unknown'),
    version: safeStringify(quoteData.version || '1.0')
  };

  console.log('=== DATOS MAPEADOS ===');
  console.log('ID:', mappedData.id);
  console.log('Title:', mappedData.title);
  console.log('TruckType:', mappedData.truckType, '(raw:', mappedData.truckTypeRaw, ')');
  console.log('Pickup:', mappedData.pickupLocation);
  console.log('Destination:', mappedData.destinationLocation);
  console.log('Price:', mappedData.price);
  console.log('Distance:', mappedData.distance);
  console.log('=====================');

  return mappedData;
};

  // Aplicar el mapeo robusto
  const mappedQuote = createRobustMapping(data);

  // Función para aceptar cotización
  const handleAcceptQuote = async () => {
    try {
      const quoteId = mappedQuote.id;
      
      if (!quoteId || quoteId === 'sin-id') {
        Alert.alert("Error", "No se puede identificar la cotización para aceptarla");
        return;
      }

      Alert.alert(
        "Confirmar Aceptación",
        `¿Estás seguro de que quieres aceptar esta cotización por $${mappedQuote.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}?`,
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Aceptar",
            style: "default",
            onPress: async () => {
              setIsLoading(true);
              try {
                console.log('Intentando aceptar cotización con ID:', quoteId);
                
                const response = await fetch(`https://riveraproject-production-933e.up.railway.app/api/cotizaciones/${quoteId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    status: 'aceptada'
                  })
                });

                console.log('Respuesta del servidor:', response.status, response.statusText);

                if (response.ok) {
                  const responseData = await response.json();
                  console.log('Cotización aceptada exitosamente:', responseData);
                  
                  Alert.alert(
                    "¡Éxito!", 
                    "La cotización ha sido aceptada correctamente",
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          // Actualizar el estado local y regresar
                          navigation.navigate('Main', { 
                            screen: 'Dashboard',
                            params: { refresh: true }
                          });
                        }
                      }
                    ]
                  );
                } else {
                  const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                  console.error('Error en respuesta:', errorData);
                  throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
                }
              } catch (error) {
                console.error('Error completo al aceptar cotización:', error);
                Alert.alert(
                  "Error", 
                  `No se pudo aceptar la cotización:\n${error.message}`,
                  [{ text: "OK" }]
                );
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al mostrar alerta:', error);
      Alert.alert("Error", "Hubo un problema al procesar la solicitud");
    }
  };

  // Función para rechazar cotización
  const handleRejectQuote = async () => {
    try {
      const quoteId = mappedQuote.id;
      
      if (!quoteId || quoteId === 'sin-id') {
        Alert.alert("Error", "No se puede identificar la cotización para rechazarla");
        return;
      }

      Alert.alert(
        "Confirmar Rechazo",
        "¿Estás seguro de que quieres rechazar esta cotización?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Rechazar",
            style: "destructive",
            onPress: async () => {
              setIsLoading(true);
              try {
                console.log('Intentando rechazar cotización con ID:', quoteId);
                
                const response = await fetch(`https://riveraproject-production-933e.up.railway.app/api/cotizaciones/${quoteId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    status: 'rechazada'
                  })
                });

                if (response.ok) {
                  Alert.alert(
                    "Cotización Rechazada", 
                    "La cotización ha sido rechazada",
                    [
                      {
                        text: "OK",
                        onPress: () => navigation.goBack()
                      }
                    ]
                  );
                } else {
                  const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                  throw new Error(errorData.message || `Error ${response.status}`);
                }
              } catch (error) {
                console.error('Error al rechazar cotización:', error);
                Alert.alert("Error", `No se pudo rechazar la cotización: ${error.message}`);
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al mostrar alerta de rechazo:', error);
    }
  };

  // Función para obtener colores y configuración Lottie según el estado
  const getStatusColor = (status) => {
    return statusLottieConfig[status?.toLowerCase()] || { 
      bg: '#E6FFFA', 
      text: '#0F766E', 
      border: '#14B8A6', 
      icon: 'information-circle-outline',
      lottie: ClockPending,
      loop: false
    };
  };

  // Funciones de formateo de fecha y hora
  const formatTime = (iso) => {
    if (!iso || iso === 'No especificado') return '—';
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleTimeString('es-SV', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formateando hora:', error);
      return '—';
    }
  };

  const formatDate = (iso) => {
    if (!iso || iso === 'No especificado') return '—';
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('es-SV', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '—';
    }
  };

  const formatDateTime = (iso) => {
    if (!iso || iso === 'No especificado') return '—';
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('es-SV', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '—';
    }
  };

  const statusColors = getStatusColor(mappedQuote.status);
  const shouldShowAcceptButton = mappedQuote.status === 'pendiente' && mappedQuote.price > 0;
  const shouldShowRejectButton = mappedQuote.status === 'pendiente';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de Cotización</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              // Refrescar datos si es necesario
              console.log('Refrescando datos de cotización');
            }}
          >
            <Ionicons name="refresh" size={20} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Debug info - solo en desarrollo */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>Debug Info</Text>
            <Text style={styles.debugText}>ID: {mappedQuote.id}</Text>
            <Text style={styles.debugText}>Status: {mappedQuote.status}</Text>
            <Text style={styles.debugText}>Price: ${mappedQuote.price}</Text>
            <Text style={styles.debugText}>Source: {mappedQuote.createdFrom}</Text>
            <Text style={styles.debugText}>Data Source: {quote ? 'quote param' : 'item param'}</Text>
          </View>
        )}

        {/* Estado de la cotización con animación Lottie */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { 
            backgroundColor: statusColors.bg, 
            borderColor: statusColors.border 
          }]}>
            <View style={styles.statusLottieContainer}>
              <LottieView
                source={statusColors.lottie}
                autoPlay={true}
                loop={statusColors.loop}
                style={styles.statusLottieAnimation}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {mappedQuote.status.charAt(0).toUpperCase() + mappedQuote.status.slice(1).replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Información principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Título</Text>
            <Text style={styles.value}>{mappedQuote.title}</Text>
          </View>

          {mappedQuote.description !== mappedQuote.title && mappedQuote.description !== 'No especificado' && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Descripción</Text>
              <Text style={styles.value}>{mappedQuote.description}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Precio Estimado</Text>
            <Text style={[styles.value, styles.priceText]}>
              ${mappedQuote.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Método de Pago</Text>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentIcon}>
                {mappedQuote.paymentMethod.toLowerCase().includes('efectivo') ? '💵' : '💳'}
              </Text>
              <Text style={styles.paymentText}>{mappedQuote.paymentMethod}</Text>
            </View>
          </View>

          {mappedQuote.truckType !== 'No especificado' && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tipo de Camión</Text>
              <View style={styles.truckBadge}>
                <Text style={styles.truckIcon}>🚛</Text>
                <Text style={styles.truckText}>{mappedQuote.truckType}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Información de ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicaciones</Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Punto de Recogida</Text>
                <Text style={styles.routeAddress}>{mappedQuote.pickupLocation}</Text>
                {mappedQuote.pickupCoordinates && (
                  <Text style={styles.coordinates}>
                    {mappedQuote.pickupCoordinates.lat?.toFixed(4)}, {mappedQuote.pickupCoordinates.lng?.toFixed(4)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Punto de Destino</Text>
                <Text style={styles.routeAddress}>{mappedQuote.destinationLocation}</Text>
                {mappedQuote.destinationCoordinates && (
                  <Text style={styles.coordinates}>
                    {mappedQuote.destinationCoordinates.lat?.toFixed(4)}, {mappedQuote.destinationCoordinates.lng?.toFixed(4)}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Descripción del Viaje</Text>
            <Text style={styles.value}>{mappedQuote.travelLocations}</Text>
          </View>

          {mappedQuote.distance > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Distancia Estimada</Text>
              <Text style={styles.distanceText}>{mappedQuote.distance} km</Text>
            </View>
          )}
        </View>

        {/* Información de horarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horarios</Text>
          
          <View style={styles.timeGrid}>
            <View style={styles.timeCard}>
              <Ionicons name="play-outline" size={20} color="#10B981" />
              <Text style={styles.timeLabel}>Salida</Text>
              <Text style={styles.timeValue}>{formatTime(mappedQuote.departureTime)}</Text>
            </View>

            <View style={styles.timeCard}>
              <Ionicons name="flag-outline" size={20} color="#EF4444" />
              <Text style={styles.timeLabel}>Llegada</Text>
              <Text style={styles.timeValue}>{formatTime(mappedQuote.arrivalTime)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de Entrega</Text>
            <Text style={styles.value}>{formatDate(mappedQuote.deliveryDate)}</Text>
          </View>

          {mappedQuote.estimatedTime > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tiempo Estimado</Text>
              <Text style={styles.timeEstimated}>
                {mappedQuote.estimatedTime >= 60 
                  ? `${Math.round(mappedQuote.estimatedTime / 60)} horas`
                  : `${mappedQuote.estimatedTime} minutos`
                }
              </Text>
            </View>
          )}
        </View>

        {/* Desglose de costos */}
        {mappedQuote.costos && Object.keys(mappedQuote.costos).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Desglose de Costos</Text>
            
            <View style={styles.costContainer}>
              {Object.entries(mappedQuote.costos).map(([key, value]) => {
                if (!value || value === 0) return null;
                
                const costLabels = {
                  combustible: { label: 'Combustible', icon: '⛽' },
                  peajes: { label: 'Peajes', icon: '🛣️' },
                  conductor: { label: 'Conductor', icon: '👨‍💼' },
                  otros: { label: 'Otros Gastos', icon: '📦' },
                  subtotal: { label: 'Subtotal', icon: '📊' },
                  impuestos: { label: 'Impuestos (IVA)', icon: '🧾' },
                  total: { label: 'Total', icon: '💵' }
                };
                
                const costInfo = costLabels[key] || { label: key.charAt(0).toUpperCase() + key.slice(1), icon: '💸' };
                const isTotal = key === 'total';
                
                return (
                  <View key={key} style={[styles.costRow, isTotal && styles.totalRow]}>
                    <View style={styles.costLabel}>
                      <Text style={styles.costIcon}>{costInfo.icon}</Text>
                      <Text style={[styles.costText, isTotal && styles.totalText]}>
                        {costInfo.label}
                      </Text>
                    </View>
                    <Text style={[styles.costValue, isTotal && styles.totalValue]}>
                      ${typeof value === 'number' 
                        ? value.toLocaleString('en-US', { minimumFractionDigits: 2 }) 
                        : value}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Información de carga */}
        {mappedQuote.carga && Object.keys(mappedQuote.carga).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Carga</Text>
            
            {mappedQuote.carga.descripcion && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Descripción</Text>
                <Text style={styles.value}>{mappedQuote.carga.descripcion}</Text>
              </View>
            )}

            {mappedQuote.carga.peso && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Peso Estimado</Text>
                <Text style={styles.value}>
                  {mappedQuote.carga.peso.valor} {mappedQuote.carga.peso.unidad || 'kg'}
                </Text>
              </View>
            )}

            {mappedQuote.carga.clasificacionRiesgo && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Clasificación de Riesgo</Text>
                <Text style={[styles.value, { textTransform: 'capitalize' }]}>
                  {mappedQuote.carga.clasificacionRiesgo}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Observaciones */}
        {mappedQuote.observaciones && mappedQuote.observaciones !== 'No especificado' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <Text style={styles.observacionesText}>{mappedQuote.observaciones}</Text>
          </View>
        )}

        {/* Información del sistema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Sistema</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID de Cotización</Text>
            <Text style={styles.idText}>{mappedQuote.id}</Text>
          </View>

          {mappedQuote.clientId && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>ID de Cliente</Text>
              <Text style={styles.idText}>{mappedQuote.clientId}</Text>
            </View>
          )}

          {mappedQuote.createdAt && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha de Creación</Text>
              <Text style={styles.value}>{formatDateTime(mappedQuote.createdAt)}</Text>
            </View>
          )}

          {mappedQuote.updatedAt && mappedQuote.updatedAt !== mappedQuote.createdAt && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Última Actualización</Text>
              <Text style={styles.value}>{formatDateTime(mappedQuote.updatedAt)}</Text>
            </View>
          )}

          {mappedQuote.createdFrom && mappedQuote.createdFrom !== 'unknown' && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Creado Desde</Text>
              <Text style={styles.value}>
                {mappedQuote.createdFrom === 'mobile_app' ? 'Aplicación móvil' : mappedQuote.createdFrom}
              </Text>
            </View>
          )}

          {mappedQuote.version && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Versión</Text>
              <Text style={styles.value}>{mappedQuote.version}</Text>
            </View>
          )}
        </View>

        {/* Espaciado para botones flotantes */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10AC84" />
            <Text style={styles.loadingText}>Procesando...</Text>
          </View>
        </View>
      )}

      {/* Footer con botones de acción */}
      <View style={styles.footer}>
        {shouldShowAcceptButton && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptQuote}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>
              Aceptar Cotización
            </Text>
          </TouchableOpacity>
        )}

        {shouldShowRejectButton && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleRejectQuote}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>
              Rechazar
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.backActionButton]}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
          <Text style={styles.backActionButtonText}>Volver al Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  refreshButton: {
    padding: 8,
  },

  // Content styles
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // Debug section
  debugSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'monospace',
    marginBottom: 2,
  },

  // Status section
  statusSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLottieContainer: {
    width: 24,
    height: 24,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLottieAnimation: {
    width: '100%',
    height: '100%',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },

  // Section styles
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },

  // Info row styles
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    lineHeight: 22,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10AC84',
  },
  idText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
  },
  observacionesText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    fontStyle: 'italic',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10AC84',
  },

  // Badge styles
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  paymentIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10AC84',
  },
  truckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  truckIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  truckText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },

  // Route styles
  routeContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 16,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    lineHeight: 20,
  },
  coordinates: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#D1D5DB',
    marginLeft: 7,
    marginVertical: 8,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },

  // Time styles
  timeGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  timeEstimated: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Cost styles
  costContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#10AC84',
    borderBottomWidth: 0,
    paddingTop: 12,
    marginTop: 8,
    backgroundColor: '#ECFDF5',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  costLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  costIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  costText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  totalText: {
    fontSize: 16,
    color: '#065F46',
    fontWeight: 'bold',
  },
  costValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: '#10AC84',
    fontWeight: 'bold',
  },

  // Footer styles
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButton: {
    backgroundColor: '#10AC84',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  backActionButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backActionButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },

  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  errorButton: {
    backgroundColor: '#10AC84',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Utility styles
  bottomPadding: {
    height: 120,
  },
});

export default QuoteDetailsScreen;