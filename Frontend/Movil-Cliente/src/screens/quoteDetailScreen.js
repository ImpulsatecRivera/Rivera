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
  TextInput,
  Modal,
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

// Mapeo de unidades de peso
const weightUnitLabels = {
  'kg': 'Kilogramos',
  'lb': 'Libras',
  'ton': 'Toneladas'
};

// Mapeo de clasificación de riesgo con iconos
const riskClassificationMap = {
  'normal': { label: 'Normal', icon: '📦', color: '#10B981' },
  'fragil': { label: 'Frágil', icon: '🔍', color: '#F59E0B' },
  'peligroso': { label: 'Peligroso', icon: '⚠️', color: '#EF4444' },
  'perecedero': { label: 'Perecedero', icon: '❄️', color: '#3B82F6' }
};

const QuoteDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // FIXED: Accept both 'quote' and 'item' parameters for better compatibility
  const { quote, item } = route.params || {};
  const data = quote || item;

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

  // Función auxiliar para convertir cualquier valor a string de forma segura
  const safeStringify = (value) => {
    if (value === null || value === undefined) return 'No especificado';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object') {
      if (value instanceof Date) return value.toISOString();
      if (value._id) return String(value._id);
      if (value.id) return String(value.id);
      if (value.name) return String(value.name);
      if (value.email) return String(value.email);
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  };

  // Función para obtener el primer valor válido
  const getFirstAvailable = (...values) => {
    return values.find(val =>
      val !== null &&
      val !== undefined &&
      val !== '' &&
      val !== '—' &&
      val !== 'No especificado'
    ) || 'No especificado';
  };

  // Función para formatear peso con unidad
  const formatWeight = (pesoObj) => {
    if (!pesoObj) return 'No especificado';

    if (typeof pesoObj === 'object') {
      const valor = pesoObj.valor || pesoObj.valorOriginal || 0;
      const unidad = pesoObj.unidad || pesoObj.unidadOriginal || 'kg';
      const unidadLabel = weightUnitLabels[unidad] || unidad;

      // Si hay valor original diferente, mostrarlo
      if (pesoObj.valorOriginal && pesoObj.unidadOriginal &&
        pesoObj.unidadOriginal !== 'kg') {
        return `${pesoObj.valorOriginal} ${weightUnitLabels[pesoObj.unidadOriginal] || pesoObj.unidadOriginal} (${valor} kg)`;
      }

      return `${valor} ${unidadLabel}`;
    }

    return `${pesoObj} kg`;
  };

  const createRobustMapping = (quoteData) => {
    console.log('=== DEBUGGING QUOTE DETAILS ===');
    console.log('Quote recibido:', JSON.stringify(quoteData, null, 2));
    console.log('================================');

    // Función auxiliar para obtener precios
    const getPrice = () => {
      const priceOptions = [
        quoteData.price,
        quoteData._raw?.price,
        quoteData.totalPrice,
        quoteData.estimatedPrice,
        quoteData.amount,
        quoteData.total,
        quoteData._raw?.total,
        quoteData.costos?.total,
        quoteData._raw?.costos?.total,
        quoteData.costos?.subtotal,
        quoteData._raw?.costos?.subtotal
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

    const rawTruckType = quoteData.truckType || 
                         quoteData._raw?.truckType || 
                         quoteData.carga?.categoria || 
                         quoteData._raw?.carga?.categoria || 
                         'otros';
    const friendlyTruckType = truckTypeMap[rawTruckType] || rawTruckType;

    const mappedData = {
      // Identificación
      id: quoteData._id || quoteData.id || quoteData._raw?._id || 'sin-id',

      // Estado
      status: (quoteData.status || quoteData._raw?.status || 'pendiente').toLowerCase(),

      // Información básica
      title: safeStringify(getFirstAvailable(
        quoteData.title,
        quoteData._raw?.title,
        quoteData.quoteName,
        quoteData._raw?.quoteName,
        quoteData.quoteDescription,
        quoteData._raw?.quoteDescription,
        quoteData.description,
        'Cotización sin título'
      )),

      description: safeStringify(getFirstAvailable(
        quoteData.quoteDescription,
        quoteData._raw?.quoteDescription,
        quoteData.description,
        quoteData.observaciones,
        quoteData._raw?.observaciones,
        quoteData.notes,
        'Sin descripción disponible'
      )),

      // Precio
      price: getPrice(),

      // Método de pago
      paymentMethod: safeStringify(getFirstAvailable(
        quoteData.paymentMethod,
        quoteData._raw?.paymentMethod,
        quoteData.metodoPago,
        quoteData.payment_method,
        'Efectivo'
      )),

      // Tipo de camión
      truckType: safeStringify(friendlyTruckType),
      truckTypeRaw: safeStringify(rawTruckType),

      // UBICACIONES
      pickupLocation: safeStringify(
        quoteData.pickupLocation ||
        quoteData._raw?.pickupLocation ||
        quoteData._raw?.ruta?.origen?.nombre ||
        quoteData.ruta?.origen?.nombre ||
        quoteData.pickupAddress ||
        'Ubicación de recogida no especificada'
      ),

      destinationLocation: safeStringify(
        quoteData.destinationLocation ||
        quoteData._raw?.destinationLocation ||
        quoteData._raw?.ruta?.destino?.nombre ||
        quoteData.ruta?.destino?.nombre ||
        quoteData.destinationAddress ||
        'Ubicación de destino no especificada'
      ),

      // Coordenadas
      pickupCoordinates: getCoordinates(quoteData._raw?.ruta?.origen || quoteData.ruta?.origen),
      destinationCoordinates: getCoordinates(quoteData._raw?.ruta?.destino || quoteData.ruta?.destino),

      // Descripción del viaje
      travelLocations: safeStringify(getFirstAvailable(
        quoteData.travelLocations,
        quoteData._raw?.travelLocations,
        quoteData.travel_locations,
        quoteData.lugarEntrega,
        `De ${quoteData._raw?.pickupLocation || quoteData.pickupLocation || 'origen'} a ${quoteData._raw?.destinationLocation || quoteData.destinationLocation || 'destino'}`
      )),

      // Horarios
      departureTime: safeStringify(getFirstAvailable(
        quoteData.departureTime,
        quoteData.horaSalida,
        quoteData._raw?.horaSalida,
        quoteData._raw?.horarios?.horaSalida,
        quoteData._raw?.horarios?.fechaSalida,
        quoteData.horarios?.horaSalida,
        quoteData.horarios?.fechaSalida,
        quoteData.scheduledDepartureTime,
        quoteData.departure_time
      )),

      arrivalTime: safeStringify(getFirstAvailable(
        quoteData.arrivalTime,
        quoteData.horaLlegada,
        quoteData._raw?.horaLlegada,
        quoteData._raw?.horarios?.horaLlegadaEstimada,
        quoteData._raw?.horarios?.fechaLlegadaEstimada,
        quoteData.horarios?.horaLlegadaEstimada,
        quoteData.horarios?.fechaLlegadaEstimada,
        quoteData.scheduledArrivalTime,
        quoteData.estimatedArrivalTime,
        quoteData.arrival_time
      )),

      requestDate: safeStringify(getFirstAvailable(
        quoteData.requestDate,
        quoteData._raw?.requestDate,
        quoteData.fechaNecesaria,
        quoteData._raw?.fechaNecesaria
      )),

      deliveryDate: safeStringify(getFirstAvailable(
        quoteData.deliveryDate,
        quoteData._raw?.deliveryDate,
        quoteData._raw?.horarios?.fechaLlegadaEstimada,
        quoteData.horarios?.fechaLlegadaEstimada,
        quoteData.arrivalTime,
        quoteData.scheduledDeliveryDate,
        quoteData.delivery_date
      )),

      departureDateFull: safeStringify(
        quoteData._raw?.horarios?.fechaSalida || 
        quoteData.horarios?.fechaSalida
      ),
      arrivalDateFull: safeStringify(
        quoteData._raw?.horarios?.fechaLlegadaEstimada || 
        quoteData.horarios?.fechaLlegadaEstimada
      ),

      // Tiempo y distancia
      estimatedTime: 
        quoteData.estimatedTime || 
        quoteData._raw?.estimatedTime ||
        quoteData._raw?.ruta?.tiempoEstimado ||
        quoteData.ruta?.tiempoEstimado ||
        quoteData._raw?.horarios?.tiempoEstimadoViaje ||
        quoteData.horarios?.tiempoEstimadoViaje || 
        0,

      distance: quoteData.estimatedDistance ||
        quoteData._raw?.estimatedDistance ||
        quoteData._raw?.ruta?.distanciaTotal ||
        quoteData.ruta?.distanciaTotal ||
        quoteData.distance ||
        0,

      // Información de horarios completa
      horarios: {
        fechaSalida: quoteData._raw?.horarios?.fechaSalida || quoteData.horarios?.fechaSalida,
        horaSalida: quoteData._raw?.horarios?.horaSalida || quoteData.horarios?.horaSalida,
        fechaLlegadaEstimada: quoteData._raw?.horarios?.fechaLlegadaEstimada || quoteData.horarios?.fechaLlegadaEstimada,
        horaLlegadaEstimada: quoteData._raw?.horarios?.horaLlegadaEstimada || quoteData.horarios?.horaLlegadaEstimada,
        tiempoEstimadoViaje: quoteData._raw?.horarios?.tiempoEstimadoViaje || quoteData.horarios?.tiempoEstimadoViaje,
        flexibilidadHoraria: quoteData._raw?.horarios?.flexibilidadHoraria || quoteData.horarios?.flexibilidadHoraria || {}
      },

      // Fechas del sistema
      createdAt: safeStringify(quoteData.createdAt || quoteData._raw?.createdAt || quoteData.created_at),
      updatedAt: safeStringify(quoteData.updatedAt || quoteData._raw?.updatedAt || quoteData.updated_at),

      // Costos detallados
      costos: quoteData._raw?.costos || quoteData.costos || quoteData.costs || {},

      // Información de carga completa
      carga: {
        categoria: quoteData._raw?.carga?.categoria || quoteData.carga?.categoria || rawTruckType,
        tipo: quoteData._raw?.carga?.tipo || quoteData.carga?.tipo || 'general',
        descripcion: quoteData._raw?.carga?.descripcion || quoteData.carga?.descripcion || quoteData.carga?.description || '',
        peso: quoteData._raw?.carga?.peso || quoteData.carga?.peso || {},
        clasificacionRiesgo: quoteData._raw?.carga?.clasificacionRiesgo || quoteData.carga?.clasificacionRiesgo || 'normal',
        observaciones: quoteData._raw?.carga?.observaciones || quoteData.carga?.observaciones || quoteData.carga?.notes || ''
      },

      // Datos adicionales
      observaciones: safeStringify(getFirstAvailable(
        quoteData.observaciones,
        quoteData._raw?.observaciones,
        quoteData.notes,
        quoteData.comments,
        ''
      )),

      // Cliente ID
      clientId: (() => {
        const clientIdValue = quoteData.clientId || quoteData._raw?.clientId || quoteData.clienteId || quoteData.client_id;
        if (clientIdValue && typeof clientIdValue === 'object') {
          return safeStringify(clientIdValue._id || clientIdValue.id || clientIdValue);
        }
        return safeStringify(clientIdValue || '');
      })(),

      // Metadata
      createdFrom: safeStringify(quoteData.createdFrom || quoteData._raw?.createdFrom || quoteData.created_from || 'unknown'),
      version: safeStringify(quoteData.version || quoteData._raw?.version || '1.0')
    };

    console.log('=== DATOS MAPEADOS ===');
    console.log('pickupLocation:', mappedData.pickupLocation);
    console.log('destinationLocation:', mappedData.destinationLocation);
    console.log('travelLocations:', mappedData.travelLocations);
    console.log('distance:', mappedData.distance);
    console.log('estimatedTime:', mappedData.estimatedTime);
    console.log('carga:', mappedData.carga);
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
          { text: "Cancelar", style: "cancel" },
          {
            text: "Aceptar",
            style: "default",
            onPress: async () => {
              setIsLoading(true);
              try {
                console.log('Intentando aceptar cotización con ID:', quoteId);

                const response = await fetch(`https://riveraproject-production-933e.up.railway.app/api/cotizaciones/${quoteId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'aceptada' })
                });

                if (response.ok) {
                  const responseData = await response.json();
                  console.log('Cotización aceptada exitosamente:', responseData);

                  Alert.alert(
                    "¡Éxito!",
                    "La cotización ha sido aceptada correctamente",
                    [{
                      text: "OK",
                      onPress: () => {
                        navigation.navigate('Main', {
                          screen: 'Dashboard',
                          params: { refresh: true }
                        });
                      }
                    }]
                  );
                } else {
                  const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                  throw new Error(errorData.message || `Error ${response.status}`);
                }
              } catch (error) {
                console.error('Error al aceptar cotización:', error);
                Alert.alert("Error", `No se pudo aceptar la cotización:\n${error.message}`);
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

      // Mostrar modal para ingresar motivo de rechazo
      setShowRejectModal(true);
    } catch (error) {
      console.error('Error al mostrar modal de rechazo:', error);
    }
  };

  // Nueva función para confirmar el rechazo con motivo
  const confirmRejectWithReason = async () => {
    if (!rejectReason.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa un motivo de rechazo");
      return;
    }

    setShowRejectModal(false);
    setIsLoading(true);

    try {
      const quoteId = mappedQuote.id;

      const response = await fetch(
        `https://riveraproject-production-933e.up.railway.app/api/cotizaciones/${quoteId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'rechazada',
            motivoRechazo: rejectReason.trim()
          })
        }
      );

      if (response.ok) {
        setRejectReason('');
        Alert.alert(
          "Cotización Rechazada",
          "La cotización ha sido rechazada correctamente",
          [{ 
            text: "OK", 
            onPress: () => {
              navigation.navigate('Main', {
                screen: 'Dashboard',
                params: { refresh: true }
              });
            }
          }]
        );
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
    } catch (error) {
      console.error('Error al rechazar cotización:', error);
      Alert.alert("Error", `No se pudo rechazar la cotización:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones de formato
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

  // Función para formatear tiempo estimado de viaje
  const formatEstimatedTime = (minutes) => {
    if (!minutes || minutes <= 0) return '—';

    if (minutes < 60) {
      return `${Math.round(minutes)} minutos`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);

    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }

    return `${hours} ${hours === 1 ? 'hora' : 'horas'} y ${remainingMinutes} minutos`;
  };

  // Función para obtener colores del estado
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
            onPress={() => console.log('Refrescando datos')}
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
        {/* Estado de la cotización con animación */}
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

        {/* Ubicaciones */}
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

          {mappedQuote.distance > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Distancia Estimada</Text>
              <Text style={styles.distanceText}>{mappedQuote.distance} km</Text>
            </View>
          )}
        </View>

        {/* Sección de Horarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Fechas y Horarios</Text>

          {mappedQuote.deliveryDate && mappedQuote.deliveryDate !== 'No especificado' && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>🚚 Fecha de Entrega</Text>
              <Text style={styles.value}>{formatDate(mappedQuote.deliveryDate)}</Text>
            </View>
          )}

          {((mappedQuote.departureTime && mappedQuote.departureTime !== 'No especificado') ||
            (mappedQuote.arrivalTime && mappedQuote.arrivalTime !== 'No especificado')) && (
            <View style={styles.timeGrid}>
              {mappedQuote.departureTime && mappedQuote.departureTime !== 'No especificado' && (
                <View style={styles.timeCard}>
                  <Ionicons name="play-outline" size={20} color="#10B981" />
                  <Text style={styles.timeLabel}>Hora de Salida</Text>
                  <Text style={styles.timeValue}>{formatTime(mappedQuote.departureTime)}</Text>
                </View>
              )}

              {mappedQuote.arrivalTime && mappedQuote.arrivalTime !== 'No especificado' && (
                <View style={styles.timeCard}>
                  <Ionicons name="flag-outline" size={20} color="#EF4444" />
                  <Text style={styles.timeLabel}>Hora de Llegada</Text>
                  <Text style={styles.timeValue}>{formatTime(mappedQuote.arrivalTime)}</Text>
                </View>
              )}
            </View>
          )}

          {mappedQuote.estimatedTime > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>⏱️ Tiempo Estimado de Viaje</Text>
              <Text style={styles.timeEstimated}>
                {formatEstimatedTime(mappedQuote.estimatedTime)}
              </Text>
            </View>
          )}
        </View>

        {/* Información de Carga Completa */}
        {mappedQuote.carga && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Información de Carga</Text>

            {mappedQuote.carga.tipo && mappedQuote.carga.tipo !== 'general' && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>🏷️ Tipo de Carga</Text>
                <Text style={[styles.value, { textTransform: 'capitalize' }]}>
                  {mappedQuote.carga.tipo}
                </Text>
              </View>
            )}

            {mappedQuote.carga.categoria && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>📂 Categoría</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{mappedQuote.truckType}</Text>
                </View>
              </View>
            )}

            {mappedQuote.carga.peso && Object.keys(mappedQuote.carga.peso).length > 0 && (
              <View style={styles.cargoWeightContainer}>
                <Text style={styles.label}>⚖️ Peso de la Carga</Text>
                <View style={styles.weightInfoCard}>
                  <View style={styles.weightMainInfo}>
                    <Text style={styles.weightValue}>
                      {formatWeight(mappedQuote.carga.peso)}
                    </Text>
                  </View>

                  {mappedQuote.carga.peso.unidadOriginal &&
                    mappedQuote.carga.peso.unidadOriginal !== 'kg' &&
                    mappedQuote.carga.peso.valorOriginal && (
                      <View style={styles.weightConversion}>
                        <Ionicons name="swap-horizontal" size={14} color="#6B7280" />
                        <Text style={styles.weightConversionText}>
                          Original: {mappedQuote.carga.peso.valorOriginal} {weightUnitLabels[mappedQuote.carga.peso.unidadOriginal]}
                        </Text>
                      </View>
                    )}
                </View>
              </View>
            )}

            {mappedQuote.carga.clasificacionRiesgo && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>⚠️ Clasificación de Riesgo</Text>
                <View style={[
                  styles.riskBadge,
                  {
                    backgroundColor: `${riskClassificationMap[mappedQuote.carga.clasificacionRiesgo]?.color || '#6B7280'}15`,
                    borderColor: riskClassificationMap[mappedQuote.carga.clasificacionRiesgo]?.color || '#6B7280'
                  }
                ]}>
                  <Text style={styles.riskIcon}>
                    {riskClassificationMap[mappedQuote.carga.clasificacionRiesgo]?.icon || '📦'}
                  </Text>
                  <Text style={[
                    styles.riskText,
                    { color: riskClassificationMap[mappedQuote.carga.clasificacionRiesgo]?.color || '#6B7280' }
                  ]}>
                    {riskClassificationMap[mappedQuote.carga.clasificacionRiesgo]?.label || mappedQuote.carga.clasificacionRiesgo}
                  </Text>
                </View>
              </View>
            )}

            {mappedQuote.carga.descripcion && mappedQuote.carga.descripcion !== 'No especificado' && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>📝 Descripción</Text>
                <Text style={styles.cargoDescription}>
                  {mappedQuote.carga.descripcion}
                </Text>
              </View>
            )}

            {mappedQuote.carga.observaciones && mappedQuote.carga.observaciones !== 'No especificado' && (
              <View style={styles.cargoObservationsContainer}>
                <Text style={styles.label}>💬 Observaciones</Text>
                <Text style={styles.cargoObservations}>
                  {mappedQuote.carga.observaciones}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modal para ingresar motivo de rechazo */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rejectModalContainer}>
            <View style={styles.rejectModalHeader}>
              <Ionicons name="close-circle" size={32} color="#EF4444" />
              <Text style={styles.rejectModalTitle}>Rechazar Cotización</Text>
            </View>

            <Text style={styles.rejectModalLabel}>
              Por favor, indica el motivo del rechazo:
            </Text>

            <TextInput
              style={styles.rejectReasonInput}
              placeholder="Ej: Precio muy alto, Fecha no disponible, etc."
              placeholderTextColor="#9CA3AF"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />

            <Text style={styles.characterCount}>
              {rejectReason.length}/500 caracteres
            </Text>

            <View style={styles.rejectModalButtons}>
              <TouchableOpacity
                style={[styles.rejectModalButton, styles.cancelModalButton]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rejectModalButton, 
                  styles.confirmRejectButton,
                  !rejectReason.trim() && styles.confirmRejectButtonDisabled
                ]}
                onPress={confirmRejectWithReason}
                disabled={!rejectReason.trim()}
              >
                <Text style={styles.confirmRejectButtonText}>
                  Confirmar Rechazo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10AC84" />
            <Text style={styles.loadingText}>Procesando...</Text>
          </View>
        </View>
      )}

      {/* Footer con botones */}
      <View style={styles.footer}>
        {shouldShowAcceptButton && (
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptQuote}
            disabled={isLoading}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Aceptar Cotización</Text>
          </TouchableOpacity>
        )}

        {shouldShowRejectButton && (
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleRejectQuote}
            disabled={isLoading}
          >
            <Ionicons name="close-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Rechazar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.backActionButton]}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
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
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  cargoWeightContainer: {
    marginBottom: 16,
  },
  weightInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  weightMainInfo: {
    marginBottom: 8,
  },
  weightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  weightConversion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  weightConversionText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  riskIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cargoDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  cargoObservationsContainer: {
    marginTop: 8,
  },
  cargoObservations: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    fontStyle: 'italic',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rejectModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  rejectModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rejectModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  rejectModalLabel: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 22,
  },
  rejectReasonInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#111827',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 20,
  },
  rejectModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmRejectButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmRejectButtonDisabled: {
    backgroundColor: '#FCA5A5',
    opacity: 0.6,
  },
  confirmRejectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
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
  bottomPadding: {
    height: 120,
  },
});

export default QuoteDetailsScreen;