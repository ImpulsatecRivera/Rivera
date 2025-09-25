import React, { useState, useEffect, useRef } from 'react';
import {
  View,
<<<<<<< HEAD
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  ActivityIndicator,
=======
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

// Importa las mismas animaciones Lottie
import DeliveryTruck from "../assets/lottie/Car _ Ignite Animation.json";
import CheckSuccess from "../assets/lottie/success tick.json";
import ClockPending from "../assets/lottie/Tourists by car.json";
import CancelError from "../assets/lottie/cancel animation.json";
import EditSuccess from "../assets/lottie/Blue successful login.json"; // Tu animación de éxito

const { width } = Dimensions.get('window');

// Configuración de estados con Lottie
const statusConfig = {
  pendiente: {
    bg: '#FEF3C7',
    borderColor: '#F59E0B',
    color: '#92400E',
    label: 'Pendiente',
    lottie: ClockPending,
  },
  enviada: {
    bg: '#DBEAFE',
    borderColor: '#3B82F6',
    color: '#1D4ED8',
    label: 'Enviada',
    lottie: DeliveryTruck,
  },
  'en ruta': {
    bg: '#DBEAFE',
    borderColor: '#3B82F6',
    color: '#1E40AF',
    label: 'En Ruta',
    lottie: DeliveryTruck,
  },
  aceptada: {
    bg: '#D1FAE5',
    borderColor: '#10B981',
    color: '#065F46',
    label: 'Aceptada',
    lottie: CheckSuccess,
  },
  completado: {
    bg: '#D1FAE5',
    borderColor: '#10B981',
    color: '#047857',
    label: 'Completado',
    lottie: CheckSuccess,
  },
  ejecutada: {
    bg: '#D1FAE5',
    borderColor: '#10B981',
    color: '#047857',
    label: 'Ejecutada',
    lottie: CheckSuccess,
  },
  rechazada: {
    bg: '#FEE2E2',
    borderColor: '#EF4444',
    color: '#991B1B',
    label: 'Rechazada',
    lottie: CancelError,
  },
  cancelada: {
    bg: '#F3F4F6',
    borderColor: '#6B7280',
    color: '#374151',
    label: 'Cancelada',
    lottie: CancelError,
  },
};

// Funciones de utilidad
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '—') return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-SV', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const formatTime = (iso) => {
  if (!iso || iso === '—') return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
};

const formatCurrency = (amount, currency = 'USD') => {
  if (!amount || amount === '—' || amount === 0) return '—';
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '—';
    const symbol = currency === 'USD' ? '$' : '';
    return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  } catch {
    return `$${amount}`;
  }
};

export default function DetalleQuoteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item, quote } = route.params || {};
  
  // Usar quote si viene del QuoteDetailsScreen, sino usar item del HistorialCard
  const data = quote || item;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  
  // Animaciones sutiles
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const editSuccessScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Efecto para mostrar animación de éxito de edición
  useEffect(() => {
    if (showEditSuccess) {
      Animated.sequence([
        Animated.spring(editSuccessScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(editSuccessScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowEditSuccess(false);
      });
    }
  }, [showEditSuccess]);

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

<<<<<<< HEAD
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

  // Función auxiliar para obtener precios
  const getPrice = () => {
    const priceOptions = [
      quoteData.price,
      quoteData.totalPrice,
      quoteData.estimatedPrice,
      quoteData.amount,
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
    // Identificación
    id: quoteData._id || quoteData.id || 'sin-id',
    
    // Estado
    status: (quoteData.status || 'pendiente').toLowerCase(),
    
    // Información básica
    title: getFirstAvailable(
      quoteData.quoteName,
      quoteData.title,
      quoteData.quoteDescription,
      quoteData.description,
      'Cotización sin título'
    ),
    
    description: getFirstAvailable(
      quoteData.quoteDescription,
      quoteData.description,
      quoteData.observaciones,
      quoteData.notes,
      'Sin descripción disponible'
    ),
    
    // Precio
    price: getPrice(),
    
    // Método de pago
    paymentMethod: getFirstAvailable(
      quoteData.paymentMethod,
      quoteData.metodoPago,
      quoteData.payment_method,
      'Efectivo'
    ),
    
    // Tipo de camión - CORREGIDO con nombre amigable
    truckType: friendlyTruckType,
    truckTypeRaw: rawTruckType, // Guardamos el valor original por si se necesita
    
    // Ubicaciones - CORREGIDO con orden de prioridad correcto
    pickupLocation: getFirstAvailable(
      quoteData.pickupLocation,        // Campo directo del backend
      quoteData.ruta?.origen?.nombre,
      quoteData.pickupAddress,
      quoteData.origin?.name,
      'Ubicación de recogida no especificada'
    ),
    
    destinationLocation: getFirstAvailable(
      quoteData.destinationLocation,   // Campo directo del backend
      quoteData.ruta?.destino?.nombre,
      quoteData.destinationAddress,
      quoteData.destination?.name,
      'Ubicación de destino no especificada'
    ),
    
    // Coordenadas
    pickupCoordinates: getCoordinates(quoteData.ruta?.origen) || getCoordinates(quoteData.origin),
    destinationCoordinates: getCoordinates(quoteData.ruta?.destino) || getCoordinates(quoteData.destination),
    
    // Descripción del viaje
    travelLocations: getFirstAvailable(
      quoteData.travelLocations,
      quoteData.travel_locations,
      `De ${getFirstAvailable(quoteData.pickupLocation, quoteData.ruta?.origen?.nombre, 'origen')} a ${getFirstAvailable(quoteData.destinationLocation, quoteData.ruta?.destino?.nombre, 'destino')}`
    ),
    
    // Horarios
    departureTime: getFirstAvailable(
      quoteData.departureTime,
      quoteData.horarios?.fechaSalida,
      quoteData.scheduledDepartureTime,
      quoteData.departure_time
    ),
    
    arrivalTime: getFirstAvailable(
      quoteData.arrivalTime,
      quoteData.horarios?.fechaLlegadaEstimada,
      quoteData.scheduledArrivalTime,
      quoteData.estimatedArrivalTime,
      quoteData.arrival_time
    ),
    
    deliveryDate: getFirstAvailable(
      quoteData.deliveryDate,
      quoteData.horarios?.fechaLlegadaEstimada,
      quoteData.arrivalTime,
      quoteData.scheduledDeliveryDate,
      quoteData.delivery_date
    ),
    
    // Tiempo y distancia - CORREGIDO
    estimatedTime: quoteData.estimatedTime || 
                  quoteData.horarios?.tiempoEstimadoViaje || 
                  quoteData.estimated_time || 
                  0,
    
    distance: quoteData.estimatedDistance ||     // Campo directo del backend
              quoteData.ruta?.distanciaTotal || 
              quoteData.distance || 
              0,
    
    // Fechas del sistema
    createdAt: quoteData.createdAt || quoteData.created_at,
    updatedAt: quoteData.updatedAt || quoteData.updated_at,
    
    // Costos detallados
    costos: quoteData.costos || quoteData.costs || {},
    
    // Información de carga
    carga: quoteData.carga || quoteData.cargo || {},
    
    // Datos adicionales
    observaciones: getFirstAvailable(
      quoteData.observaciones,
      quoteData.notes,
      quoteData.comments,
      ''
    ),
    
    clientId: quoteData.clientId || quoteData.client_id || '',
    
    // Metadata
    createdFrom: quoteData.createdFrom || quoteData.created_from || 'unknown',
    version: quoteData.version || '1.0'
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
  const mappedQuote = createRobustMapping(quote);

=======
  // Mapear campos para compatibilidad entre ambas estructuras
  const mappedData = {
    id: data.id || data._id,
    title: data.title || data.quoteName || data.quoteDescription || 'Sin título',
    status: data.status,
    amount: data.total || data.amount || data.price,
    currency: data.currency || 'USD',
    paymentMethod: data.metodoPago || data.paymentMethod,
    deliveryPlace: data.lugarEntrega || data.deliveryPlace || data.travelLocations,
    departureTime: data.horaSalida || data.departureTime,
    arrivalTime: data.horaLlegada || data.arrivalTime,
    deliveryDate: data.deliveryDate,
    travelLocations: data.travelLocations,
    truckType: data.truckType,
    quoteDescription: data.quoteDescription || data._raw?.quoteDescription,
    createdAt: data.createdAt || data._raw?.createdAt,
    updatedAt: data.updatedAt || data._raw?.updatedAt,
    clientId: data.clienteId || data.clientId,
  };

>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
  // Función para aceptar cotización
  const handleAcceptQuote = async () => {

  const config = statusConfig[mappedData.status?.toLowerCase()] || {
    bg: '#F3F4F6',
    borderColor: '#6B7280',
    color: '#374151',
    label: mappedData.status || 'Sin estado',
    lottie: ClockPending,
  };

  // Función para editar cotización
  const handleEditQuote = async () => {
    Alert.alert(
      "Editar Cotización",
      "¿Deseas editar esta cotización? Podrás modificar los datos disponibles.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Editar",
          style: "default",
          onPress: async () => {
            setIsEditing(true);
            try {
              // Aquí puedes agregar campos editables o navegar a una pantalla de edición
              // Por ahora simularemos una edición exitosa
              await new Promise(resolve => setTimeout(resolve, 1500)); // Simular call al backend
              
              // Ejemplo de call real al backend (descomenta cuando esté listo):
              /*
              const response = await fetch(`https://riveraproject-production.up.railway.app/api/cotizaciones/${mappedData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  // Los campos que quieras editar
                  status: mappedData.status,
                  title: mappedData.title,
                  // ... otros campos
                })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al editar la cotización');
              }
              */

              // Mostrar animación de éxito
              setShowEditSuccess(true);
              
            } catch (error) {
              Alert.alert("Error", `No se pudo editar la cotización: ${error.message}`);
            } finally {
              setIsEditing(false);
            }
          }
        }
      ]
    );
  };

  // Función para eliminar cotización  
  const handleDeleteQuote = async () => {
    Alert.alert(
      "Eliminar Cotización",
      `¿Estás seguro de que deseas eliminar la cotización "${mappedData.title}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await fetch(`https://riveraproject-production.up.railway.app/api/cotizaciones/${mappedData.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
              });

              if (response.ok) {
                Alert.alert(
                  "Eliminada", 
                  "La cotización se ha eliminado correctamente", 
                  [
                    { 
                      text: "OK", 
                      onPress: () => navigation.goBack() // Volver al listado
                    }
                  ]
                );
              } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar la cotización');
              }
            } catch (error) {
              Alert.alert("Error", `No se pudo eliminar la cotización: ${error.message}`);
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };
    if (mappedData.status !== 'pendiente' || !mappedData.amount || mappedData.amount <= 0) return;

    try {
      const quoteId = mappedQuote.id;
      
      if (!quoteId || quoteId === 'sin-id') {
        Alert.alert("Error", "No se puede identificar la cotización para aceptarla");
        return;
      }

      Alert.alert(
<<<<<<< HEAD
        "Confirmar Aceptación",
        `¿Estás seguro de que quieres aceptar esta cotización por $${mappedQuote.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}?`,
=======
        "Aceptar Cotización",
        `¿Estás seguro de aceptar esta cotización por ${formatCurrency(mappedData.amount, mappedData.currency)}?`,
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Aceptar",
            style: "default",
            onPress: async () => {
              setIsLoading(true);
              try {
<<<<<<< HEAD
                console.log('Intentando aceptar cotización con ID:', quoteId);
                
                const response = await fetch(`https://riveraproject-production.up.railway.app/api/cotizaciones/${quoteId}`, {
=======
                const response = await fetch(`https://riveraproject-production.up.railway.app/api/cotizaciones/${mappedData.id}`, {
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'aceptada' })
                });

                console.log('Respuesta del servidor:', response.status, response.statusText);

                if (response.ok) {
<<<<<<< HEAD
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
=======
                  Alert.alert("Éxito", "Cotización aceptada correctamente", [
                    { text: "OK", onPress: () => navigation.goBack() }
                  ]);
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
                } else {
                  const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                  console.error('Error en respuesta:', errorData);
                  throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
                }
              } catch (error) {
<<<<<<< HEAD
                console.error('Error completo al aceptar cotización:', error);
                Alert.alert(
                  "Error", 
                  `No se pudo aceptar la cotización:\n${error.message}`,
                  [{ text: "OK" }]
                );
=======
                Alert.alert("Error", `No se pudo aceptar la cotización: ${error.message}`);
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
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

<<<<<<< HEAD
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
                
                const response = await fetch(`https://riveraproject-production.up.railway.app/api/cotizaciones/${quoteId}`, {
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

  // Función para obtener colores según el estado
  const getStatusColor = (status) => {
    const statusColors = {
      'pendiente': { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B', icon: 'time-outline' },
      'enviada': { bg: '#DBEAFE', text: '#1D4ED8', border: '#3B82F6', icon: 'paper-plane-outline' },
      'aceptada': { bg: '#D1FAE5', text: '#065F46', border: '#10B981', icon: 'checkmark-circle-outline' },
      'rechazada': { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444', icon: 'close-circle-outline' },
      'ejecutada': { bg: '#E0E7FF', text: '#3730A3', border: '#8B5CF6', icon: 'checkmark-done-outline' },
      'cancelada': { bg: '#F3F4F6', text: '#374151', border: '#6B7280', icon: 'ban-outline' },
      'en_proceso': { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9', icon: 'sync-outline' }
    };
    
    return statusColors[status?.toLowerCase()] || { 
      bg: '#E6FFFA', 
      text: '#0F766E', 
      border: '#14B8A6', 
      icon: 'information-circle-outline' 
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
=======
  const handleShare = async () => {
    try {
      const shareContent = `
🧾 Cotización: ${mappedData.title}
📍 Destino: ${mappedData.deliveryPlace || 'No especificado'}
📅 Fecha de entrega: ${formatDate(mappedData.deliveryDate)}
💰 Total: ${formatCurrency(mappedData.amount, mappedData.currency)}
📋 Estado: ${config.label.toUpperCase()}
💳 Método de pago: ${mappedData.paymentMethod || 'No especificado'}
🆔 ID: ${mappedData.id?.slice(-6) || 'N/A'}
      `.trim();

      await Share.share({
        message: shareContent,
        title: 'Detalles de Cotización',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la información');
    }
  };

  const shouldShowAcceptButton = mappedData.status === 'pendiente' && mappedData.amount && mappedData.amount > 0;
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2

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
<<<<<<< HEAD
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
          </View>
        )}

        {/* Estado de la cotización */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { 
            backgroundColor: statusColors.bg, 
            borderColor: statusColors.border 
          }]}>
            <Ionicons name={statusColors.icon} size={20} color={statusColors.text} />
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
=======
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <Animated.View style={[
        styles.content, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Estado de la cotización con Lottie */}
          <View style={styles.statusSection}>
            <View style={styles.statusContainer}>
              <View style={styles.lottieContainer}>
                <LottieView
                  source={config.lottie}
                  autoPlay
                  loop={mappedData.status === 'en ruta'}
                  style={styles.statusLottie}
                />
              </View>
              <View style={[styles.statusBadge, { 
                backgroundColor: config.bg, 
                borderColor: config.borderColor 
              }]}>
                <Text style={[styles.statusText, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Información principal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información General</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Descripción</Text>
              <Text style={styles.value}>{mappedData.title}</Text>
            </View>

            {mappedData.amount && mappedData.amount > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Precio</Text>
                <Text style={[styles.value, styles.priceText]}>
                  {formatCurrency(mappedData.amount, mappedData.currency)}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.label}>Método de pago</Text>
              <Text style={styles.value}>{mappedData.paymentMethod || 'No especificado'}</Text>
            </View>
          </View>

          {/* Información de horarios */}
          {(mappedData.departureTime || mappedData.arrivalTime || mappedData.deliveryDate) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Horarios</Text>
              
              {mappedData.departureTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Hora de salida</Text>
                  <Text style={styles.value}>{formatTime(mappedData.departureTime)}</Text>
                </View>
              )}

              {mappedData.arrivalTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Hora de llegada</Text>
                  <Text style={styles.value}>{formatTime(mappedData.arrivalTime)}</Text>
                </View>
              )}

              {mappedData.deliveryDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Fecha de entrega</Text>
                  <Text style={styles.value}>{formatDate(mappedData.deliveryDate)}</Text>
                </View>
              )}
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
            </View>
          )}

<<<<<<< HEAD
        {/* Espaciado para botones flotantes */}
        <View style={styles.bottomPadding} />
      </ScrollView>
=======
          {/* Información de ubicación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Lugar de entrega</Text>
              <Text style={styles.value}>{mappedData.deliveryPlace || 'No especificado'}</Text>
            </View>

            {mappedData.travelLocations && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Destinos de viaje</Text>
                <Text style={styles.value}>{mappedData.travelLocations}</Text>
              </View>
            )}
          </View>

          {/* Información adicional */}
          {(mappedData.truckType || mappedData.quoteDescription) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Adicional</Text>
              
              {mappedData.truckType && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Tipo de camión</Text>
                  <Text style={styles.value}>{mappedData.truckType}</Text>
                </View>
              )}

              {mappedData.quoteDescription && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Descripción detallada</Text>
                  <Text style={styles.value}>{mappedData.quoteDescription}</Text>
                </View>
              )}
            </View>
          )}

          {/* Información del sistema */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Sistema</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>ID de cotización</Text>
              <Text style={[styles.value, styles.idText]}>{mappedData.id}</Text>
            </View>

            {mappedData.createdAt && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Fecha de creación</Text>
                <Text style={styles.value}>{formatDate(mappedData.createdAt)}</Text>
              </View>
            )}

            {mappedData.updatedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Última actualización</Text>
                <Text style={styles.value}>{formatDate(mappedData.updatedAt)}</Text>
              </View>
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2

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
<<<<<<< HEAD
            disabled={isLoading}
            activeOpacity={0.8}
=======
            disabled={isLoading || isEditing || isDeleting}
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
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

        {/* Botones de Editar y Eliminar */}
        <View style={styles.editDeleteContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEditQuote}
            disabled={isLoading || isEditing || isDeleting}
          >
            {isEditing ? (
              <Text style={styles.editButtonText}>Editando...</Text>
            ) : (
              <>
                <Ionicons name="create-outline" size={20} color="#1D4ED8" style={{ marginRight: 8 }} />
                <Text style={styles.editButtonText}>Editar</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteQuote}
            disabled={isLoading || isEditing || isDeleting}
          >
            {isDeleting ? (
              <Text style={styles.deleteButtonText}>Eliminando...</Text>
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          disabled={isEditing || isDeleting}
        >
          <Ionicons name="share-outline" size={20} color="#374151" style={{ marginRight: 8 }} />
          <Text style={styles.shareButtonText}>Compartir Detalles</Text>
        </TouchableOpacity>
        
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

      {/* Overlay de éxito de edición */}
      {showEditSuccess && (
        <Animated.View 
          style={[
            styles.editSuccessOverlay,
            { transform: [{ scale: editSuccessScale }] }
          ]}
        >
          <View style={styles.editSuccessContainer}>
            <View style={styles.editSuccessLottie}>
              <LottieView
                source={EditSuccess}
                autoPlay
                loop={false}
                style={styles.successLottieStyle}
              />
            </View>
            <Text style={styles.editSuccessText}>Cotización editada correctamente</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

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
<<<<<<< HEAD
  headerActions: {
    flexDirection: 'row',
  },
  refreshButton: {
    padding: 8,
  },
=======
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2

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

  // Status section with Lottie
  statusSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  statusContainer: {
    alignItems: 'center',
  },
  lottieContainer: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  statusLottie: {
    width: '100%',
    height: '100%',
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
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginLeft: 8,
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
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
<<<<<<< HEAD
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
=======
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
  },
  acceptButton: {
    backgroundColor: '#10AC84',
  },
<<<<<<< HEAD
  rejectButton: {
    backgroundColor: '#EF4444',
=======
  editDeleteContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    flex: 1,
  },
  editButtonText: {
    color: '#1D4ED8',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
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
  shareButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  backActionButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },

<<<<<<< HEAD
  // Loading overlay
  loadingOverlay: {
=======
  // Estilos para overlay de éxito de edición
  editSuccessOverlay: {
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
<<<<<<< HEAD
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
=======
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editSuccessContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    maxWidth: width * 0.8,
  },
  editSuccessLottie: {
    width: 100,
    height: 100,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successLottieStyle: {
    width: '100%',
    height: '100%',
  },
  editSuccessText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10AC84',
    textAlign: 'center',
  },

  // Error state
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
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
<<<<<<< HEAD

  // Utility styles
  bottomPadding: {
    height: 120,
  },
});

export default QuoteDetailsScreen;
        
=======
});
>>>>>>> b777704bc0a3657d55602eecb68950858a25a4b2
