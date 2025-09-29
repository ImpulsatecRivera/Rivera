import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { createQuote, fetchQuotesByClient } from '../api/quotes';

const { width, height } = Dimensions.get('window');
const GREEN = '#10AC84';
const RED = '#EA4335';

const IntegratedTruckRequestScreen = () => {
  const navigation = useNavigation();
  const webViewRef = useRef(null);

  // Estados principales
  const [currentStep, setCurrentStep] = useState('selectTruck');
  const [selectedTruckType, setSelectedTruckType] = useState(null);
  const [pointStep, setPointStep] = useState(1);
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Estados para datos del formulario
  const [departureTime, setDepartureTime] = useState('10:00 AM');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [quoteName, setQuoteName] = useState('');

  // Estados para datos calculados
  const [routeDistance, setRouteDistance] = useState(0);
  const [estimatedCosts, setEstimatedCosts] = useState({
    combustible: 0,
    peajes: 0,
    conductor: 0,
    otros: 0
  });

  // Estados para las animaciones de cotización
  const [showFirstQuoteAnimation, setShowFirstQuoteAnimation] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isFirstQuote, setIsFirstQuote] = useState(false);

  // NUEVOS ESTADOS PARA FECHA, HORA Y CARGA
  const [deliveryDate, setDeliveryDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [cargoWeightUnit, setCargoWeightUnit] = useState('kg');
  const [cargoType, setCargoType] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [riskClassification, setRiskClassification] = useState('normal');

  const [currentLocation] = useState({
    latitude: 13.7942,
    longitude: -89.5564,
  });

  // Tipos de camión con categorías válidas del backend
  const truckTypes = [
    {
      id: 'refrigerado',
      name: 'Camión Refrigerado',
      icon: '🧊',
      description: 'Para productos que requieren temperatura controlada',
      category: 'alimentos_perecederos',
      basePrice: 50
    },
    {
      id: 'seco',
      name: 'Camión Seco',
      icon: '📦',
      description: 'Para carga general sin refrigeración',
      category: 'otros',
      basePrice: 35
    }
  ];

  // Opciones para clasificación de riesgo
  const riskOptions = [
    { value: 'normal', label: 'Normal', icon: '📦' },
    { value: 'fragil', label: 'Frágil', icon: '🔍' },
    { value: 'peligroso', label: 'Peligroso', icon: '⚠️' },
    { value: 'perecedero', label: 'Perecedero', icon: '❄️' }
  ];

  // Opciones para unidades de peso
  const weightUnits = [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'lb', label: 'Libras (lb)' },
    { value: 'ton', label: 'Toneladas (ton)' }
  ];

  // Función para inicializar fechas por defecto
  const initializeDefaultDates = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const requestDateStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
    const arrivalTimeStr = calculateArrivalTime(departureTime, estimatedTime);
    
    setRequestDate(requestDateStr);
    setDeliveryDate(requestDateStr);
    setArrivalTime(arrivalTimeStr);
  };

  // Función para calcular hora de llegada estimada
  const calculateArrivalTime = (departure, estimatedMinutes) => {
    if (!departure || !estimatedMinutes) return '';
    
    try {
      const [timeStr, ampm] = departure.split(' ');
      const [hourStr, minuteStr] = timeStr.split(':');
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      
      // Convertir AM/PM a 24 horas
      if (ampm === 'PM' && hour !== 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }
      
      // Crear fecha con hora de salida
      const departureDateTime = new Date();
      departureDateTime.setHours(hour, minute, 0, 0);
      
      // Agregar tiempo estimado
      const arrivalDateTime = new Date(departureDateTime);
      arrivalDateTime.setMinutes(arrivalDateTime.getMinutes() + estimatedMinutes);
      
      // Formatear a 12 horas
      return arrivalDateTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(/^0/, '');
      
    } catch (error) {
      console.error('Error calculando hora de llegada:', error);
      return '';
    }
  };

  // Función para validar campos obligatorios
  const validateCargoFields = () => {
    const errors = [];
    
    if (!cargoWeight || cargoWeight.trim() === '') {
      errors.push('El peso de la carga es obligatorio');
    }
    
    if (!cargoType || cargoType.trim() === '') {
      errors.push('El tipo de carga es obligatorio');
    }
    
    if (!requestDate) {
      errors.push('La fecha de realización es obligatoria');
    }
    
    if (parseFloat(cargoWeight) <= 0) {
      errors.push('El peso debe ser mayor a 0');
    }
    
    return errors;
  };

  // Función para convertir peso a kilogramos (para el backend)
  const convertWeightToKg = (weight, unit) => {
    const weightNum = parseFloat(weight);
    switch (unit) {
      case 'lb':
        return Math.round(weightNum * 0.453592 * 100) / 100; // libras a kg
      case 'ton':
        return Math.round(weightNum * 1000 * 100) / 100; // toneladas a kg
      case 'kg':
      default:
        return Math.round(weightNum * 100) / 100; // ya en kg
    }
  };

  // Función para verificar si todos los campos están completos
  const isFormValid = () => {
    return cargoWeight && 
           cargoWeight.trim() !== '' && 
           cargoType && 
           cargoType.trim() !== '' && 
           requestDate && 
           deliveryDate && 
           parseFloat(cargoWeight) > 0;
  };

  // useEffect para inicializar fechas cuando se calcula la ruta
  useEffect(() => {
    if (pointStep === 3 && estimatedTime && !requestDate) {
      initializeDefaultDates();
    }
  }, [pointStep, estimatedTime]);

  // useEffect para recalcular hora de llegada cuando cambia la hora de salida o tiempo estimado
  useEffect(() => {
    if (departureTime && estimatedTime) {
      const newArrivalTime = calculateArrivalTime(departureTime, estimatedTime);
      setArrivalTime(newArrivalTime);
    }
  }, [departureTime, estimatedTime]);

  // === LÓGICA CORREGIDA PARA VERIFICAR COTIZACIONES EN EL BACKEND ===

  // Función para obtener cotizaciones del usuario - USANDO LA LÓGICA QUE FUNCIONA EN HISTORIALSCREEN
  const fetchUserQuotes = async () => {
    try {
      const clientId = await getClientId();
      const token = await AsyncStorage.getItem('clientToken');
      const baseUrl = 'https://riveraproject-production-933e.up.railway.app';
      
      console.log('🔍 Verificando datos de autenticación:');
      console.log('- clientId:', clientId);
      console.log('- token existe:', !!token);
      
      if (!clientId) {
        console.log('❌ No hay clientId disponible');
        throw new Error('No hay datos de autenticación');
      }

      // 🎯 MÉTODO 1: Usar la función API que funciona en HistorialScreen
      let quotes = [];
      try {
        console.log('📡 Intentando fetchQuotesByClient (método que funciona en HistorialScreen)...');
        const data = await fetchQuotesByClient({
          baseUrl,
          token,
          clientId,
        });
        
        // Normalizar respuesta como en HistorialScreen
        if (Array.isArray(data)) {
          quotes = data;
        } else {
          const keys = ['items', 'results', 'data', 'cotizaciones', 'quotes', 'rows', 'list'];
          for (const k of keys) {
            if (data && Array.isArray(data[k])) {
              quotes = data[k];
              break;
            }
          }
        }
        
        if (quotes.length > 0) {
          console.log('✅ fetchQuotesByClient funcionó! Cotizaciones encontradas:', quotes.length);
          return quotes;
        }
      } catch (error) {
        console.log('⚠️ fetchQuotesByClient falló, intentando método fallback...');
      }

      // 🎯 MÉTODO 2: Fallback - usar endpoint que funciona en HistorialScreen
      console.log('📡 Intentando método fallback: /api/cotizaciones...');
      const response = await fetch(`${baseUrl}/api/cotizaciones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const allQuotes = await response.json();
      console.log('📡 Respuesta de /api/cotizaciones:', allQuotes);
      
      // Normalizar y filtrar por clientId como en HistorialScreen
      let normalizedQuotes = [];
      if (Array.isArray(allQuotes)) {
        normalizedQuotes = allQuotes;
      } else {
        const keys = ['items', 'results', 'data', 'cotizaciones', 'quotes', 'rows', 'list'];
        for (const k of keys) {
          if (allQuotes && Array.isArray(allQuotes[k])) {
            normalizedQuotes = allQuotes[k];
            break;
          }
        }
      }
      
      // Filtrar por clientId
      const userQuotes = normalizedQuotes.filter(quote => {
        const quoteClientId = quote.clientId || quote.clienteId || quote.client_id;
        return String(quoteClientId || '') === String(clientId);
      });
      
      console.log('📊 Total cotizaciones en BD:', normalizedQuotes.length);
      console.log('📊 Cotizaciones del usuario:', userQuotes.length);
      console.log('✅ Método fallback exitoso!');
      
      return userQuotes;
      
    } catch (error) {
      console.error('❌ Error obteniendo cotizaciones:', error);
      throw error; // Re-lanzar el error para manejo en checkIfFirstQuoteFromBackend
    }
  };

  // Función CORREGIDA para verificar si es la primera cotización - AHORA USANDO LA LÓGICA QUE FUNCIONA
  const checkIfFirstQuoteFromBackend = async () => {
    try {
      setIsLoading(true);
      
      // Obtener cotizaciones del usuario usando la lógica que funciona en HistorialScreen
      const userQuotes = await fetchUserQuotes();
      
      // Si no tiene cotizaciones, es primera vez
      const isFirst = userQuotes.length === 0;
      const quotesCount = userQuotes.length;
      
      console.log(`📊 Usuario tiene ${quotesCount} cotizaciones. Es primera vez: ${isFirst}`);
      
      setIsFirstQuote(isFirst);
      return { isFirst, quotesCount };
      
    } catch (error) {
      console.error('❌ Error verificando cotizaciones:', error);
      
      // En caso de error REAL, asumir que NO es primera vez para seguridad
      // Esto evita mostrar la animación si hay problemas de conectividad
      console.log('⚠️ Por seguridad, asumiendo que NO es primera vez debido a error de conexión');
      
      setIsFirstQuote(false);
      return { isFirst: false, quotesCount: -1 };
    } finally {
      setIsLoading(false);
    }
  };

  // Función para marcar que ya no es la primera cotización (solo guarda localmente como respaldo)
  const markFirstQuoteCompleted = async () => {
    try {
      await AsyncStorage.setItem('hasCreatedFirstQuote', 'true');
      console.log('✅ Primera cotización marcada como completada (respaldo local)');
    } catch (error) {
      console.error('❌ Error marcando primera cotización:', error);
    }
  };

  // === FUNCIÓN ADICIONAL PARA DEBUGGING ===
  const debugQuotesState = async () => {
    if (__DEV__) {
      try {
        const userQuotes = await fetchUserQuotes();
        const localFlag = await AsyncStorage.getItem('hasCreatedFirstQuote');
        
        console.log('🐛 DEBUG - Estado de cotizaciones:');
        console.log('- Cotizaciones en backend:', userQuotes.length);
        console.log('- Flag local:', localFlag);
        console.log('- isFirstQuote (estado):', isFirstQuote);
        
        Alert.alert(
          'Debug Info',
          `Backend: ${userQuotes.length} cotizaciones\nLocal flag: ${localFlag}\nEstado: ${isFirstQuote ? 'Primera vez' : 'No es primera vez'}`,
          [{ text: 'OK' }]
        );
      } catch (error) {
        console.error('Error en debug:', error);
      }
    }
  };

  // === FUNCIÓN PARA RESET MANUAL (SOLO PARA TESTING) ===
  const resetFirstQuoteFlag = async () => {
    try {
      await AsyncStorage.removeItem('hasCreatedFirstQuote');
      console.log('🔄 Flag de primera cotización reseteado');
      
      // Volver a verificar desde el backend
      await checkIfFirstQuoteFromBackend();
    } catch (error) {
      console.error('❌ Error reseteando flag:', error);
    }
  };

  // useEffect modificado para usar la nueva lógica
  useEffect(() => {
    checkIfFirstQuoteFromBackend();
  }, []);

  // Función para obtener cliente ID del storage
  const getClientId = async () => {
    try {
      const clientData = await AsyncStorage.getItem('clientData');
      if (clientData) {
        const parsedData = JSON.parse(clientData);
        return parsedData.id || parsedData._id;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo clientId:', error);
      return null;
    }
  };

  // Función para calcular costos estimados basados en distancia
  const calculateEstimatedCosts = (distance, truckType) => {
    const baseFuelCost = 0.8;
    const tollsPerKm = 0.1;
    const driverBaseCost = truckType.basePrice * 0.4;

    const combustible = Math.round(distance * baseFuelCost);
    const peajes = Math.round(distance * tollsPerKm);
    const conductor = Math.round(driverBaseCost);
    const otros = Math.round(truckType.basePrice * 0.2);

    return {
      combustible,
      peajes,
      conductor,
      otros
    };
  };

  // Función para generar nombre automático de cotización
  const generateQuoteName = () => {
    const date = new Date();
    const dateStr = date.toLocaleDateString('es-ES').replace(/\//g, '-');
    const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `Cotización ${selectedTruckType?.name} - ${dateStr} ${timeStr}`;
  };

  // Función CORREGIDA - Crear la cotización en el backend
const createQuoteInBackend = async () => {
  try {
    setIsLoading(true);

    // VALIDACIÓN CRÍTICA AGREGADA
    console.log('🔍 VALIDACIÓN PRE-ENVÍO:', {
      pickupAddress,
      destinationAddress,
      pickupCoords,
      destinationCoords
    });

    if (!pickupAddress || !pickupAddress.trim()) {
      throw new Error('La dirección de recogida es requerida');
    }

    if (!destinationAddress || !destinationAddress.trim()) {
      throw new Error('La dirección de destino es requerida');
    }

    if (!pickupCoords || !pickupCoords.latitude || !pickupCoords.longitude) {
      throw new Error('Las coordenadas de recogida son inválidas');
    }

    if (!destinationCoords || !destinationCoords.latitude || !destinationCoords.longitude) {
      throw new Error('Las coordenadas de destino son inválidas');
    }

    // Validar campos de carga
    const validationErrors = validateCargoFields();
    if (validationErrors.length > 0) {
      Alert.alert('Campos requeridos', validationErrors.join('\n'));
      return;
    }

    const clientId = await getClientId();
    if (!clientId) {
      throw new Error('No se encontró información del cliente');
    }

    const now = new Date();
    const fechaNecesaria = new Date(requestDate + 'T08:00:00.000Z');
    const deliveryDateParsed = new Date(deliveryDate + 'T00:00:00.000Z');

    const [timeStr, ampm] = departureTime.split(' ');
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }

    const departureDate = new Date(deliveryDateParsed);
    departureDate.setHours(hour, minute, 0, 0);

    const arrivalDate = new Date(departureDate);
    arrivalDate.setMinutes(arrivalDate.getMinutes() + estimatedTime);

    console.log('📍 Ubicaciones confirmadas:', {
      pickup: pickupAddress,
      destination: destinationAddress,
      pickupCoords: pickupCoords,
      destinationCoords: destinationCoords
    });

    // Preparar datos con validación explícita de ubicaciones
    const quoteData = {
      clientId,
      quoteDescription: quoteDescription || `Transporte de carga con ${selectedTruckType.name}`,
      quoteName: quoteName || generateQuoteName(),
      travelLocations: `De ${pickupAddress} a ${destinationAddress}`,
      truckType: selectedTruckType.category,
      fechaNecesaria: fechaNecesaria.toISOString(),
      deliveryDate: arrivalDate.toISOString(),
      requestDate: requestDate,
      paymentMethod: paymentMethod,
      
      // CAMPOS CRÍTICOS - ASEGURAR QUE TENGAN VALORES
      pickupLocation: pickupAddress.trim(),
      destinationLocation: destinationAddress.trim(),
      estimatedDistance: routeDistance,

      ruta: {
        origen: {
          nombre: pickupAddress.trim(),
          coordenadas: {
            lat: pickupCoords.latitude,
            lng: pickupCoords.longitude
          },
          tipo: 'cliente'
        },
        destino: {
          nombre: destinationAddress.trim(),
          coordenadas: {
            lat: destinationCoords.latitude,
            lng: destinationCoords.longitude
          },
          tipo: 'cliente'
        },
        distanciaTotal: routeDistance,
        tiempoEstimado: estimatedTime
      },

      carga: {
        categoria: selectedTruckType.category,
        tipo: cargoType || 'general',
        descripcion: cargoDescription || quoteDescription || `Carga para transporte con ${selectedTruckType.name}`,
        peso: {
          valor: convertWeightToKg(cargoWeight, cargoWeightUnit),
          unidad: 'kg',
          valorOriginal: parseFloat(cargoWeight),
          unidadOriginal: cargoWeightUnit
        },
        clasificacionRiesgo: riskClassification,
        observaciones: cargoDescription || 'Sin observaciones adicionales'
      },

      horarios: {
        fechaSalida: departureDate.toISOString(),
        horaSalida: departureTime,
        fechaLlegadaEstimada: arrivalDate.toISOString(),
        horaLlegadaEstimada: arrivalTime,
        tiempoEstimadoViaje: estimatedTime,
        flexibilidadHoraria: {
          permitida: true,
          rangoTolerancia: 2
        }
      },

      observaciones: `Cotización generada desde app móvil. Método de pago: ${paymentMethod}. Tipo: ${selectedTruckType.name}. Peso: ${cargoWeight} ${cargoWeightUnit}`,
      createdFrom: 'mobile_app',
      version: '1.0'
    };

    console.log('📦 Payload final a enviar:', JSON.stringify(quoteData, null, 2));

    const baseUrl = 'https://riveraproject-production-933e.up.railway.app';
    const token = await AsyncStorage.getItem('clientToken');

    const response = await createQuote({
      baseUrl,
      token,
      payload: quoteData
    });

    console.log('✅ Respuesta del backend:', response);
    return response;

  } catch (error) {
    console.error('❌ Error creando cotización:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  // === LÓGICA CORREGIDA EN handleConfirmBooking - DOS ANIMACIONES DIFERENTES ===
  const handleConfirmBooking = async () => {
    try {
      // Validar campos requeridos antes de mostrar el Alert
      const validationErrors = validateCargoFields();
      
      if (validationErrors.length > 0) {
        Alert.alert(
          'Campos requeridos', 
          validationErrors.join('\n'),
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Validaciones adicionales específicas
      if (!requestDate) {
        Alert.alert('Campo requerido', 'Por favor selecciona la fecha cuando necesitas el servicio');
        return;
      }
      
      if (!deliveryDate) {
        Alert.alert('Campo requerido', 'Por favor selecciona la fecha de entrega');
        return;
      }
      
      // Validar que la fecha no sea en el pasado
      const today = new Date();
      const selectedDate = new Date(requestDate);
      
      if (selectedDate < today) {
        Alert.alert('Fecha inválida', 'La fecha del servicio no puede ser en el pasado');
        return;
      }

      Alert.alert(
        'Confirmar Solicitud',
        `¿Estás seguro de que quieres crear esta cotización?\n\n` +
        `📅 Fecha: ${requestDate}\n` +
        `🕐 Salida: ${departureTime}\n` +
        `🏁 Llegada estimada: ${arrivalTime}\n` +
        `📦 Carga: ${cargoType || 'No especificado'}\n` +
        `⚖️ Peso: ${cargoWeight} ${cargoWeightUnit}\n` +
        `💰 Pago: ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia'}`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Confirmar',
            onPress: async () => {
              try {
                // ✅ Verificar ANTES de crear y guardar el conteo
                const { isFirst, quotesCount } = await checkIfFirstQuoteFromBackend();
                
                console.log(`🔍 Antes de crear: Es primera vez: ${isFirst}, Cotizaciones existentes: ${quotesCount}`);
                
                // Crear la cotización en el backend
                const createdQuote = await createQuoteInBackend();
                
                // ✅ Mostrar animación correspondiente según el tipo de usuario
                if (isFirst && quotesCount === 0) {
                  // 🌟 PRIMERA COTIZACIÓN - Animación especial para nuevos usuarios
                  console.log('🎉 Mostrando animación de PRIMERA cotización (nuevos usuarios)');
                  await markFirstQuoteCompleted();
                  setShowFirstQuoteAnimation(true);
                  
                  setTimeout(() => {
                    setShowFirstQuoteAnimation(false);
                    setTimeout(() => {
                      navigateToSuccess(createdQuote);
                    }, 300);
                  }, 10900);
                } else {
                  // 🎊 COTIZACIONES POSTERIORES - Animación de éxito para usuarios recurrentes
                  console.log('🎊 Mostrando animación de ÉXITO (usuarios recurrentes)');
                  setShowSuccessAnimation(true);
                  
                  // Duración para la animación de éxito (ajusta según tu archivo Lottie)
                  setTimeout(() => {
                    setShowSuccessAnimation(false);
                    setTimeout(() => {
                      navigateToSuccess(createdQuote);
                    }, 300);
                  }, 3000); // 3 segundos para la animación de éxito (ajústalo según necesites)
                }
                
              } catch (error) {
                Alert.alert(
                  'Error',
                  error.message || 'Hubo un problema al crear la cotización. Intenta de nuevo.',
                  [{ text: 'OK' }]
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error en confirmación:', error);
      Alert.alert('Error', 'Hubo un problema. Intenta de nuevo.');
    }
  };

  // Función para navegar a la pantalla de éxito
  const navigateToSuccess = (createdQuote) => {
    navigation.navigate('PaymentSuccessScreen', {
      metodoPago: paymentMethod === 'efectivo' ? 'Efectivo' : paymentMethod,
      truckTypeName: selectedTruckType.name,
      price: 0,
      estimatedTime: estimatedTime,
      pickupLocation: pickupAddress,
      destinationLocation: destinationAddress,
      departureTime: departureTime,
      quoteId: (createdQuote.cotizacion || createdQuote)._id,
      quoteData: createdQuote.cotizacion || createdQuote
    });
  };

  // Funciones para manejar la selección de camiones
  const handleTruckSelection = (truckType) => {
    setSelectedTruckType(truckType);
  };

  const proceedToPointSelection = () => {
    if (!selectedTruckType) {
      Alert.alert('Error', 'Por favor selecciona un tipo de camión');
      return;
    }
    setCurrentStep('selectPoints');
    setPointStep(1);
  };

  // Función mejorada para geocodificar una dirección con reintentos
  const geocodeAddress = async (address, step, retryCount = 0) => {
    if (!address.trim()) return null;

    setIsLoading(true);

    try {
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}, El Salvador&limit=3&addressdetails=1&dedupe=1`,
        {
          headers: {
            'User-Agent': 'TruckApp/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const coords = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        };

        if (coords.latitude < 13.0 || coords.latitude > 14.5 ||
          coords.longitude < -90.5 || coords.longitude > -87.5) {
          throw new Error('Las coordenadas están fuera de El Salvador');
        }

        if (step === 1) {
          setPickupCoords(coords);
        } else if (step === 2) {
          setDestinationCoords(coords);
        }

        const sendMarker = () => {
          if (webViewRef.current && mapReady) {
            const message = JSON.stringify({
              type: 'addMarker',
              coords: coords,
              step: step,
              address: result.display_name || address
            });

            console.log('Enviando mensaje al WebView:', message);
            webViewRef.current.postMessage(message);
          } else if (retryCount < 3) {
            setTimeout(sendMarker, 500);
          }
        };

        setTimeout(sendMarker, 300);
        setIsLoading(false);
        return coords;

      } else {
        if (retryCount < 2) {
          console.log(`Reintentando geocodificación... Intento ${retryCount + 1}`);
          return await geocodeAddress(address, step, retryCount + 1);
        } else {
          setIsLoading(false);
          Alert.alert('Error', 'No se pudo encontrar la dirección. Por favor verifica que esté correcta y sea específica (ej: "Centro Comercial Metrocentro, San Salvador").');
          return null;
        }
      }
    } catch (error) {
      console.error('Error geocoding address:', error);

      if (retryCount < 2) {
        console.log(`Reintentando después de error... Intento ${retryCount + 1}`);
        return await geocodeAddress(address, step, retryCount + 1);
      } else {
        setIsLoading(false);
        Alert.alert('Error', 'Error de conexión al buscar la dirección. Por favor verifica tu conexión a internet e intenta de nuevo.');
        return null;
      }
    }
  };

  // Funciones para manejar la selección de puntos
  const confirmPoint = async () => {
    if (pointStep === 1 && pickupAddress.trim()) {
      const coords = await geocodeAddress(pickupAddress, 1);
      if (coords) {
        setPickupCoords(coords);
        setTimeout(() => {
          setPointStep(2);
        }, 1500);
      }
    } else if (pointStep === 2 && destinationAddress.trim()) {
      const coords = await geocodeAddress(destinationAddress, 2);
      if (coords) {
        setDestinationCoords(coords);

        const currentPickupCoords = pickupCoords;
        const currentDestinationCoords = coords;

        setTimeout(() => {
          calculateRouteDirectly(currentPickupCoords, currentDestinationCoords);
        }, 1000);
      }
    }
  };

  // Nueva función que recibe las coordenadas directamente
  const calculateRouteDirectly = async (pickup, destination) => {
    console.log('calculateRouteDirectly llamado, pickup:', pickup, 'destination:', destination);

    if (!pickup || !destination ||
      !pickup.latitude || !pickup.longitude ||
      !destination.latitude || !destination.longitude) {
      console.error('Coordenadas inválidas en calculateRouteDirectly');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Coordenadas válidas, procediendo con la ruta directamente');

      if (webViewRef.current && mapReady) {
        const message = JSON.stringify({
          type: 'showRoute',
          origin: {
            latitude: parseFloat(pickup.latitude),
            longitude: parseFloat(pickup.longitude)
          },
          destination: {
            latitude: parseFloat(destination.latitude),
            longitude: parseFloat(destination.longitude)
          }
        });

        console.log('Enviando mensaje de ruta al WebView:', message);
        webViewRef.current.postMessage(message);
      }

      const R = 6371;
      const dLat = (destination.latitude - pickup.latitude) * Math.PI / 180;
      const dLon = (destination.longitude - pickup.longitude) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pickup.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      setRouteDistance(Math.round(distance));

      setTimeout(() => {
        const calculatedTime = Math.round(distance * 1.5 + 15);
        const costs = calculateEstimatedCosts(distance, selectedTruckType);
        const totalPrice = costs.combustible + costs.peajes + costs.conductor + costs.otros;

        setEstimatedCosts(costs);
        setEstimatedPrice(totalPrice);
        setEstimatedTime(calculatedTime);
        setPointStep(3);
        setIsLoading(false);
        console.log('Ruta calculada exitosamente');
      }, 2000);

    } catch (error) {
      console.error('Error calculando ruta directamente:', error);
      setIsLoading(false);
    }
  };

  // Manejar mensajes del WebView
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Mensaje recibido del WebView:', data);

      if (data.type === 'mapReady') {
        setMapReady(true);
        console.log('Mapa listo para recibir mensajes');
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Funciones auxiliares para títulos y descripciones
  const getHeaderTitle = () => {
    if (currentStep === 'selectTruck') return 'Solicitar Camión';
    if (currentStep === 'selectPoints') {
      switch (pointStep) {
        case 1: return 'Punto de recogida';
        case 2: return 'Punto de destino';
        case 3: return 'Confirma tu solicitud';
        default: return '';
      }
    }
    return '';
  };

  const handleBackPress = () => {
    if (currentStep === 'selectPoints') {
      if (pointStep > 1) {
        setPointStep(pointStep - 1);
      } else {
        setCurrentStep('selectTruck');
        if (webViewRef.current && mapReady) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'clearMap'
          }));
        }
        setPickupAddress('');
        setDestinationAddress('');
        setPickupCoords(null);
        setDestinationCoords(null);
      }
    } else {
      navigation.goBack();
    }
  };

  // HTML mejorado para el mapa con mejor manejo de mensajes
  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
          #map { height: 100vh; width: 100%; }
          .location-point {
            position: absolute;
            bottom: 30px;
            left: 20px;
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .location-dot {
            width: 16px;
            height: 16px;
            border-radius: 8px;
            background: ${GREEN};
            border: 2px solid white;
          }
          .leaflet-routing-container {
            display: none !important;
          }
          .pickup-marker, .destination-marker {
            width: 40px;
            height: 50px;
            position: relative;
            cursor: pointer;
            animation: pulse 2s infinite ease-in-out;
          }
          .pickup-marker::before {
            content: '';
            position: absolute;
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, ${GREEN}, #0FA768);
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            top: 6px;
            left: 4px;
            box-shadow: 0 6px 20px rgba(16, 172, 132, 0.4);
            z-index: 1;
          }
          .destination-marker::before {
            content: '';
            position: absolute;
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, ${RED}, #C62828);
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            top: 6px;
            left: 4px;
            box-shadow: 0 6px 20px rgba(234, 67, 53, 0.4);
            z-index: 1;
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="location-point">
          <div class="location-dot"></div>
        </div>
        <div id="map"></div>
        
        <script>
          let map;
          let routingControl;
          let pickupMarker = null;
          let destinationMarker = null;
          let isMapReady = false;
          
          function initMap() {
            try {
              const sanSalvador = [13.7942, -89.5564];
              
              map = L.map('map').setView(sanSalvador, 13);
              
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
              }).addTo(map);
              
              map.whenReady(function() {
                isMapReady = true;
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapReady'
                  }));
                }
              });
              
            } catch (error) {
              console.error('Error inicializando mapa:', error);
            }
          }
          
          function addMarker(coords, step, address) {
            if (!isMapReady || !map) return;
            
            try {
              const lat = coords.latitude;
              const lng = coords.longitude;
              
              if (step === 1) {
                if (pickupMarker) map.removeLayer(pickupMarker);
                
                const pickupIcon = L.divIcon({
                  html: '<div class="pickup-marker"></div>',
                  iconSize: [40, 50],
                  iconAnchor: [20, 45],
                  popupAnchor: [0, -45],
                  className: 'custom-pickup-marker'
                });
                
                pickupMarker = L.marker([lat, lng], { icon: pickupIcon })
                  .addTo(map)
                  .bindPopup('<div style="text-align: center; padding: 12px;"><b style="color: ${GREEN};">Punto de recogida</b><br><span style="color: #666; font-size: 12px;">' + address + '</span></div>');
                  
                map.setView([lat, lng], 15, { animate: true, duration: 1 });
                  
              } else if (step === 2) {
                if (destinationMarker) map.removeLayer(destinationMarker);
                
                const destinationIcon = L.divIcon({
                  html: '<div class="destination-marker"></div>',
                  iconSize: [40, 50],
                  iconAnchor: [20, 45],
                  popupAnchor: [0, -45],
                  className: 'custom-destination-marker'
                });
                
                destinationMarker = L.marker([lat, lng], { icon: destinationIcon })
                  .addTo(map)
                  .bindPopup('<div style="text-align: center; padding: 12px;"><b style="color: ${RED};">Punto de destino</b><br><span style="color: #666; font-size: 12px;">' + address + '</span></div>');
                  
                if (pickupMarker && destinationMarker) {
                  setTimeout(() => {
                    const group = new L.featureGroup([pickupMarker, destinationMarker]);
                    map.fitBounds(group.getBounds().pad(0.15), { animate: true, duration: 1.5 });
                  }, 300);
                } else {
                  map.setView([lat, lng], 15, { animate: true, duration: 1 });
                }
              }
            } catch (error) {
              console.error('Error añadiendo marcador:', error);
            }
          }
          
          function showRoute(origin, destination) {
            if (!isMapReady || !map) return;
            
            try {
              if (routingControl) {
                map.removeControl(routingControl);
              }
              
              routingControl = L.Routing.control({
                waypoints: [
                  L.latLng(origin.latitude, origin.longitude),
                  L.latLng(destination.latitude, destination.longitude)
                ],
                routeWhileDragging: false,
                createMarker: function() { return null; },
                lineOptions: {
                  styles: [
                    { color: '#FFFFFF', weight: 8, opacity: 0.8 },
                    { color: '#2196F3', weight: 5, opacity: 1, dashArray: null }
                  ]
                },
                router: L.Routing.osrmv1({
                  serviceUrl: 'https://router.project-osrm.org/route/v1'
                }),
                show: false,
                addWaypoints: false,
                routeWhileDragging: false
              }).addTo(map);
              
              routingControl.on('routesfound', function(e) {
                const routingContainer = document.querySelector('.leaflet-routing-container');
                if (routingContainer) {
                  routingContainer.style.display = 'none';
                }
                
                if (pickupMarker && destinationMarker) {
                  const group = new L.featureGroup([pickupMarker, destinationMarker]);
                  map.fitBounds(group.getBounds().pad(0.1));
                }
              });
              
            } catch (error) {
              console.error('Error mostrando ruta:', error);
            }
          }
          
          function clearMap() {
            try {
              if (pickupMarker) {
                map.removeLayer(pickupMarker);
                pickupMarker = null;
              }
              if (destinationMarker) {
                map.removeLayer(destinationMarker);
                destinationMarker = null;
              }
              if (routingControl) {
                map.removeControl(routingControl);
                routingControl = null;
              }
              if (map) {
                map.setView([13.7942, -89.5564], 13);
              }
            } catch (error) {
              console.error('Error limpiando mapa:', error);
            }
          }
          
          document.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              
              if (data.type === 'addMarker') {
                addMarker(data.coords, data.step, data.address);
              } else if (data.type === 'showRoute') {
                showRoute(data.origin, data.destination);
              } else if (data.type === 'clearMap') {
                clearMap();
              }
            } catch (error) {
              console.error('Error procesando mensaje:', error);
            }
          });
          
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              
              if (data.type === 'addMarker') {
                addMarker(data.coords, data.step, data.address);
              } else if (data.type === 'showRoute') {
                showRoute(data.origin, data.destination);
              } else if (data.type === 'clearMap') {
                clearMap();
              }
            } catch (error) {
              console.error('Error procesando mensaje (window):', error);
            }
          });
          
          window.onload = function() {
            initMap();
          };
          
          if (document.readyState === 'complete') {
            initMap();
          }
        </script>
      </body>
    </html>
  `;

  // Componente para opción de camión
  const TruckOption = ({ truck, selected, onPress }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(truck)}
      style={[
        styles.truckOption,
        selected && styles.truckOptionSelected
      ]}
    >
      <View style={styles.truckIconContainer}>
        <Text style={styles.truckIcon}>{truck.icon}</Text>
      </View>

      <View style={styles.truckInfo}>
        <Text style={[styles.truckName, selected && styles.truckNameSelected]}>
          {truck.name}
        </Text>
        <Text style={styles.truckDescription}>{truck.description}</Text>
        <View style={styles.truckMeta}>
          <Text style={styles.truckTime}>⏱ Disponible</Text>
          <Text style={styles.truckPrice}>${truck.basePrice}/base</Text>
        </View>
      </View>

      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  // NUEVOS COMPONENTES PARA FECHA, HORA Y CARGA

  // Componente para selección de fecha
  const DateInput = ({ label, value, onChange, icon = '📅' }) => (
    <View style={styles.timeInputContainer}>
      <Text style={styles.timeLabel}>{icon} {label}</Text>
      <TextInput
        style={styles.timeInput}
        value={value}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#999"
      />
    </View>
  );

  // Componente para selección de tiempo
  const TimeInput = ({ label, value, onChange, icon = '🕐', editable = true }) => (
    <View style={styles.timeInputContainer}>
      <Text style={styles.timeLabel}>{icon} {label}</Text>
      <TextInput
        style={[styles.timeInput, !editable && styles.timeInputDisabled]}
        value={value}
        onChangeText={onChange}
        placeholder="10:00 AM"
        placeholderTextColor="#999"
        editable={editable}
      />
      {!editable && (
        <Text style={styles.calculatedLabel}>Calculado automáticamente</Text>
      )}
    </View>
  );

  // Componente para peso de carga
  const WeightInput = () => (
    <View style={styles.weightContainer}>
      <Text style={styles.sectionLabel}>⚖️ Peso de la carga</Text>
      
      <View style={styles.weightInputRow}>
        <TextInput
          style={[styles.weightInput, styles.weightValueInput]}
          value={cargoWeight}
          onChangeText={setCargoWeight}
          placeholder="0"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
        
        <View style={styles.weightUnitContainer}>
          <Text style={styles.weightUnitLabel}>Unidad:</Text>
          {weightUnits.map((unit) => (
            <TouchableOpacity
              key={unit.value}
              style={[
                styles.weightUnitOption,
                cargoWeightUnit === unit.value && styles.weightUnitSelected
              ]}
              onPress={() => setCargoWeightUnit(unit.value)}
            >
              <View style={[
                styles.weightRadio,
                cargoWeightUnit === unit.value && styles.weightRadioSelected
              ]}>
                {cargoWeightUnit === unit.value && <View style={styles.weightRadioInner} />}
              </View>
              <Text style={[
                styles.weightUnitText,
                cargoWeightUnit === unit.value && styles.weightUnitTextSelected
              ]}>
                {unit.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {cargoWeight && cargoWeightUnit !== 'kg' && (
        <Text style={styles.weightConversionText}>
          ≈ {convertWeightToKg(cargoWeight, cargoWeightUnit)} kg
        </Text>
      )}
    </View>
  );

  // Componente para clasificación de riesgo
  const RiskClassification = () => (
    <View style={styles.riskContainer}>
      <Text style={styles.sectionLabel}>⚠️ Clasificación de riesgo</Text>
      
      <View style={styles.riskOptionsContainer}>
        {riskOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.riskOption,
              riskClassification === option.value && styles.riskOptionSelected
            ]}
            onPress={() => setRiskClassification(option.value)}
          >
            <Text style={styles.riskIcon}>{option.icon}</Text>
            <Text style={[
              styles.riskText,
              riskClassification === option.value && styles.riskTextSelected
            ]}>
              {option.label}
            </Text>
            <View style={[
              styles.riskRadio,
              riskClassification === option.value && styles.riskRadioSelected
            ]}>
              {riskClassification === option.value && <View style={styles.riskRadioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Componente de animación para primera cotización - PARA NUEVOS USUARIOS
  const FirstQuoteAnimation = () => (
    <Modal
      visible={showFirstQuoteAnimation}
      transparent={false}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.cinematicContainer}>
        <LottieView
          source={require('../assets/lottie/Warehouse and delivery (1).json')}
          autoPlay
          loop={false}
          style={styles.cinematicLottieAnimation}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );

  // Componente de animación para cotizaciones posteriores - PARA USUARIOS RECURRENTES
  const SuccessQuoteAnimation = () => (
    <Modal
      visible={showSuccessAnimation}
      transparent={false}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.cinematicContainer}>
        <LottieView
          source={require('../assets/lottie/Cred tick animation.json')}
          autoPlay
          loop={false}
          style={styles.cinematicLottieAnimation}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );

  // === COMPONENTE DEBUG MEJORADO ===
  const DebugButton = () => (
    __DEV__ && (
      <View style={{ position: 'absolute', top: 100, right: 20, zIndex: 9999 }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'red',
            padding: 10,
            borderRadius: 5,
            marginBottom: 5
          }}
          onPress={debugQuotesState}
        >
          <Text style={{ color: 'white', fontSize: 10 }}>DEBUG STATE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            backgroundColor: 'orange',
            padding: 10,
            borderRadius: 5,
            marginBottom: 5
          }}
          onPress={() => {
            console.log('🔄 Verificando cotizaciones manualmente...');
            checkIfFirstQuoteFromBackend();
          }}
        >
          <Text style={{ color: 'white', fontSize: 10 }}>CHECK QUOTES</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            backgroundColor: 'purple',
            padding: 10,
            borderRadius: 5,
          }}
          onPress={async () => {
            await AsyncStorage.removeItem('hasCreatedFirstQuote');
            console.log('🔄 Flag local reseteado');
            Alert.alert('Reset', 'Flag local reseteado');
          }}
        >
          <Text style={{ color: 'white', fontSize: 10 }}>RESET FLAG</Text>
        </TouchableOpacity>
      </View>
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          {selectedTruckType && (
            <Text style={styles.headerSubtitle}>{selectedTruckType.name}</Text>
          )}
        </View>

        {currentStep === 'selectPoints' && (
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>{pointStep}/3</Text>
          </View>
        )}

        {currentStep === 'selectTruck' && <View style={{ width: 40 }} />}
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
          allowsInlineMediaPlaybook={true}
          mediaPlaybackRequiresUserAction={false}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => console.log('WebView cargado')}
          onError={(error) => console.error('Error en WebView:', error)}
        />

        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={GREEN} />
              <Text style={styles.loadingText}>
                {pointStep === 3 ? 'Calculando ruta y creando cotización...' : 'Buscando dirección...'}
              </Text>
            </View>
          </View>
        )}

        {/* Debug indicator */}
        {__DEV__ && (
          <View style={styles.debugIndicator}>
            <Text style={styles.debugText}>
              Map Ready: {mapReady ? '✅' : '❌'}
            </Text>
          </View>
        )}

        {/* Debug button para testing */}
        <DebugButton />
      </View>

      {/* Bottom Sheet - Selección de Camión */}
      {currentStep === 'selectTruck' && (
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />

          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Elige tu tipo de camión</Text>

            {truckTypes.map((truck) => (
              <TruckOption
                key={truck.id}
                truck={truck}
                selected={selectedTruckType?.id === truck.id}
                onPress={handleTruckSelection}
              />
            ))}

            <View style={styles.bottomPadding} />
          </ScrollView>

          {selectedTruckType && (
            <View style={styles.continueContainer}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={proceedToPointSelection}
              >
                <Text style={styles.continueButtonText}>
                  Seleccionar puntos de recogida
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Bottom Panel - Selección de Puntos */}
      {currentStep === 'selectPoints' && (
        <View style={styles.bottomPanel}>
          {pointStep === 1 && (
            <View style={styles.addressContainer}>
              <View style={styles.addressRow}>
                <View style={[styles.addressDot, { backgroundColor: GREEN }]} />
                <Text style={styles.addressLabel}>Dirección de recogida</Text>
              </View>

              <TextInput
                style={styles.addressInput}
                placeholder="Ej: Plaza Mundo, San Salvador"
                placeholderTextColor="#999"
                value={pickupAddress}
                onChangeText={setPickupAddress}
                multiline={true}
                numberOfLines={2}
                autoFocus={true}
              />

              {pickupAddress.trim().length > 5 && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={confirmPoint}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmButtonText}>
                    {isLoading ? 'Buscando dirección...' : 'Buscar y confirmar dirección'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {pointStep === 2 && (
            <View style={styles.addressContainer}>
              <View style={styles.addressRow}>
                <View style={[styles.addressDot, { backgroundColor: GREEN }]} />
                <Text style={styles.addressText}>{pickupAddress}</Text>
              </View>

              <View style={styles.addressRow}>
                <View style={[styles.addressDot, { backgroundColor: RED }]} />
                <Text style={styles.addressLabel}>Dirección de destino:</Text>
              </View>

              <TextInput
                style={styles.addressInput}
                placeholder="Ej: Centro Comercial Metrocentro, San Salvador"
                placeholderTextColor="#999"
                value={destinationAddress}
                onChangeText={setDestinationAddress}
                multiline={true}
                numberOfLines={2}
                autoFocus={true}
              />

              {destinationAddress.trim().length > 5 && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={confirmPoint}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmButtonText}>
                    {isLoading ? 'Buscando dirección...' : 'Calcular ruta'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {pointStep === 3 && (
            <ScrollView
              style={styles.summaryScrollContainer}
              contentContainerStyle={styles.summaryScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                  <View style={styles.truckInfoSummary}>
                    <Text style={styles.truckIconSummary}>{selectedTruckType.icon}</Text>
                    <View style={styles.truckInfoText}>
                      <Text style={styles.truckNameSummary}>{selectedTruckType.name}</Text>
                      <Text style={styles.distanceInfo}>Distancia: {routeDistance} km</Text>
                    </View>
                  </View>

                  <View style={styles.routeInfo}>
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: GREEN }]} />
                      <Text style={styles.routeAddress}>{pickupAddress}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: RED }]} />
                      <Text style={styles.routeAddress}>{destinationAddress}</Text>
                    </View>
                  </View>

                  {/* NUEVAS SECCIONES DE FECHAS Y CARGA */}
                  
                  {/* Sección de Fechas y Horarios - ACTUALIZADA */}
                  <View style={styles.timeSection}>
                    <Text style={styles.sectionTitle}>📅 Fechas y Horarios</Text>

                    <DateInput
                      label="Fecha cuando necesita el servicio"
                      value={requestDate}
                      onChange={setRequestDate}
                      icon="📋"
                    />

                    <DateInput
                      label="Fecha de entrega/realización"
                      value={deliveryDate}
                      onChange={setDeliveryDate}
                      icon="🚚"
                    />

                    <View style={styles.timeRow}>
                      <View style={styles.timeColumn}>
                        <TimeInput
                          label="Hora de salida"
                          value={departureTime}
                          onChange={setDepartureTime}
                          icon="🚀"
                          editable={true}
                        />
                      </View>
                      
                      <View style={styles.timeColumn}>
                        <TimeInput
                          label="Hora de llegada estimada"
                          value={arrivalTime}
                          onChange={setArrivalTime}
                          icon="🏁"
                          editable={false}
                        />
                      </View>
                    </View>

                    {estimatedTime && (
                      <View style={styles.estimatedTimeContainer}>
                        <Text style={styles.estimatedTimeLabel}>⏱️ Tiempo estimado de viaje:</Text>
                        <Text style={styles.estimatedTimeValue}>
                          {estimatedTime} minutos ({Math.round(estimatedTime / 60 * 100) / 100} horas)
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Sección de Información de Carga - NUEVA */}
                  <View style={styles.cargoSection}>
                    <Text style={styles.sectionTitle}>📦 Información de la Carga</Text>

                    {/* Tipo de carga */}
                    <View style={styles.cargoInputContainer}>
                      <Text style={styles.cargoLabel}>🏷️ Tipo de carga</Text>
                      <TextInput
                        style={styles.cargoInput}
                        value={cargoType}
                        onChangeText={setCargoType}
                        placeholder="Ej: Electrodomésticos, Alimentos, Muebles, etc."
                        placeholderTextColor="#999"
                      />
                    </View>

                    {/* Peso de la carga */}
                    <WeightInput />

                    {/* Clasificación de riesgo */}
                    <RiskClassification />

                    {/* Descripción de carga */}
                    <View style={styles.cargoInputContainer}>
                      <Text style={styles.cargoLabel}>📝 Descripción de la carga (opcional)</Text>
                      <TextInput
                        style={styles.cargoDescriptionInput}
                        value={cargoDescription}
                        onChangeText={setCargoDescription}
                        placeholder="Describe detalles importantes sobre la carga, dimensiones, cuidados especiales, etc."
                        placeholderTextColor="#999"
                        multiline={true}
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* Resumen de carga */}
                    {(cargoWeight || cargoType) && (
                      <View style={styles.cargoSummary}>
                        <Text style={styles.cargoSummaryTitle}>📋 Resumen de la carga:</Text>
                        {cargoType && (
                          <Text style={styles.cargoSummaryItem}>• Tipo: {cargoType}</Text>
                        )}
                        {cargoWeight && (
                          <Text style={styles.cargoSummaryItem}>
                            • Peso: {cargoWeight} {cargoWeightUnit}
                            {cargoWeightUnit !== 'kg' && ` (${convertWeightToKg(cargoWeight, cargoWeightUnit)} kg)`}
                          </Text>
                        )}
                        {riskClassification && (
                          <Text style={styles.cargoSummaryItem}>
                            • Clasificación: {riskOptions.find(r => r.value === riskClassification)?.label || riskClassification}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Información adicional para descripción */}
                  <View style={styles.additionalInfoSection}>
                    <Text style={styles.sectionLabel}>Información adicional</Text>

                    <TextInput
                      style={styles.descriptionInput}
                      placeholder="Descripción general del servicio (opcional)"
                      placeholderTextColor="#999"
                      value={quoteDescription}
                      onChangeText={setQuoteDescription}
                      multiline={true}
                      numberOfLines={3}
                    />
                  </View>

                  {/* Sección de Método de Pago */}
                  <View style={styles.paymentSection}>
                    <Text style={styles.sectionLabel}>Elige tu método de pago</Text>

                    <TouchableOpacity
                      style={[
                        styles.paymentOption,
                        paymentMethod === 'efectivo' && styles.paymentOptionSelected
                      ]}
                      onPress={() => setPaymentMethod('efectivo')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.paymentIconContainer}>
                        <Text style={styles.paymentIcon}>💵</Text>
                      </View>
                      <Text style={[
                        styles.paymentText,
                        paymentMethod === 'efectivo' && styles.paymentTextSelected
                      ]}>
                        Pagar con efectivo
                      </Text>
                      <View style={[
                        styles.radioCircle,
                        paymentMethod === 'efectivo' && styles.radioCircleSelected
                      ]}>
                        {paymentMethod === 'efectivo' && <View style={styles.radioInnerCircle} />}
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.paymentOption,
                        paymentMethod === 'transferencia' && styles.paymentOptionSelected
                      ]}
                      onPress={() => setPaymentMethod('transferencia')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.paymentIconContainer}>
                        <Text style={styles.paymentIcon}>💳</Text>
                      </View>
                      <Text style={[
                        styles.paymentText,
                        paymentMethod === 'transferencia' && styles.paymentTextSelected
                      ]}>
                        Pagar con transferencia
                      </Text>
                      <View style={[
                        styles.radioCircle,
                        paymentMethod === 'transferencia' && styles.radioCircleSelected
                      ]}>
                        {paymentMethod === 'transferencia' && <View style={styles.radioInnerCircle} />}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Botón Crear Cotización - ACTUALIZADO CON VALIDACIÓN */}
                <View style={styles.bookButtonContainer}>
                  {/* Indicador de campos faltantes */}
                  {!isFormValid() && (
                    <View style={styles.missingFieldsContainer}>
                      <Text style={styles.missingFieldsTitle}>⚠️ Campos requeridos:</Text>
                      {!cargoWeight && <Text style={styles.missingFieldItem}>• Peso de la carga</Text>}
                      {!cargoType && <Text style={styles.missingFieldItem}>• Tipo de carga</Text>}
                      {!requestDate && <Text style={styles.missingFieldItem}>• Fecha del servicio</Text>}
                      {!deliveryDate && <Text style={styles.missingFieldItem}>• Fecha de entrega</Text>}
                      {cargoWeight && parseFloat(cargoWeight) <= 0 && <Text style={styles.missingFieldItem}>• El peso debe ser mayor a 0</Text>}
                    </View>
                  )}

                  {/* Botón principal */}
                  <TouchableOpacity
                    style={[
                      styles.bookButton, 
                      (isLoading || !isFormValid()) && styles.bookButtonDisabled
                    ]}
                    onPress={handleConfirmBooking}
                    disabled={isLoading || !isFormValid()}
                  >
                    {isLoading ? (
                      <View style={styles.loadingButtonContent}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.bookButtonText}>Creando cotización...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.bookButtonText}>
                          {isFormValid() ? 'Crear cotización' : 'Completa todos los campos'}
                        </Text>
                        {isFormValid() && <Text style={styles.buttonSubtext}>Toca para continuar</Text>}
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Información adicional */}
                  {isFormValid() && (
                    <View style={styles.finalInfoContainer}>
                      <Text style={styles.finalInfoTitle}>📋 Resumen final:</Text>
                      <View style={styles.finalInfoGrid}>
                        <View style={styles.finalInfoItem}>
                          <Text style={styles.finalInfoLabel}>📅 Servicio:</Text>
                          <Text style={styles.finalInfoValue}>{requestDate}</Text>
                        </View>
                        <View style={styles.finalInfoItem}>
                          <Text style={styles.finalInfoLabel}>🚚 Entrega:</Text>
                          <Text style={styles.finalInfoValue}>{deliveryDate}</Text>
                        </View>
                        <View style={styles.finalInfoItem}>
                          <Text style={styles.finalInfoLabel}>🕐 Horario:</Text>
                          <Text style={styles.finalInfoValue}>{departureTime} - {arrivalTime}</Text>
                        </View>
                        <View style={styles.finalInfoItem}>
                          <Text style={styles.finalInfoLabel}>📦 Carga:</Text>
                          <Text style={styles.finalInfoValue}>{cargoWeight} {cargoWeightUnit}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* Animaciones de cotización */}
      <FirstQuoteAnimation />
      <SuccessQuoteAnimation />
    </SafeAreaView>
  );
};

// Estilos completos con todas las nuevas funcionalidades
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34353A',
  },

  // === HEADER ===
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 53, 58, 0.1)',
    shadowColor: '#34353A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34353A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  headerInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34353A',
    textAlign: 'center',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#5F8EAD',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },

  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(93, 150, 70, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#5D9646',
  },

  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D9646',
  },

  // === MAPA ===
  mapContainer: {
    flex: 1,
    backgroundColor: '#34353A',
  },

  map: {
    flex: 1,
  },

  // === DEBUG ===
  debugIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 8,
    zIndex: 1000,
  },

  debugText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },

  // === BOTTOM SHEET ===
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    shadowColor: '#34353A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    maxHeight: height * 0.7,
  },

  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#34353A',
    opacity: 0.3,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#34353A',
    marginBottom: 20,
    textAlign: 'center',
  },

  // === OPCIONES DE CAMIÓN ===
  truckOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 53, 58, 0.1)',
    shadowColor: '#34353A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  truckOptionSelected: {
    backgroundColor: 'rgba(93, 150, 70, 0.05)',
    borderColor: '#5D9646',
    borderWidth: 2,
    shadowColor: '#5D9646',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },

  truckIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(95, 142, 173, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(95, 142, 173, 0.2)',
  },

  truckIcon: {
    fontSize: 26,
  },

  truckInfo: {
    flex: 1,
    marginRight: 12,
  },

  truckName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34353A',
    marginBottom: 4,
  },

  truckNameSelected: {
    color: '#5D9646',
  },

  truckDescription: {
    fontSize: 13,
    color: '#5F8EAD',
    lineHeight: 18,
    marginBottom: 10,
    fontWeight: '500',
  },

  truckMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  truckTime: {
    fontSize: 12,
    color: '#5F8EAD',
    backgroundColor: 'rgba(95, 142, 173, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    fontWeight: '500',
  },

  truckPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5D9646',
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(52, 53, 58, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioOuterActive: {
    borderColor: '#5D9646',
    backgroundColor: 'rgba(93, 150, 70, 0.1)',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5D9646',
  },

  bottomPadding: {
    height: 80,
  },

  // === BOTÓN CONTINUAR ===
  continueContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 53, 58, 0.1)',
  },

  continueButton: {
    backgroundColor: '#5D9646',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#5D9646',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // === BOTTOM PANEL PARA PUNTOS ===
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    shadowColor: '#34353A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },

  // === DIRECCIONES ===
  addressContainer: {
    paddingTop: 8,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  addressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 14,
    shadowColor: '#5D9646',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },

  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F8EAD',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  addressText: {
    fontSize: 15,
    color: '#34353A',
    flex: 1,
    fontWeight: '500',
  },

  addressInput: {
    backgroundColor: 'rgba(95, 142, 173, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#34353A',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(95, 142, 173, 0.2)',
    minHeight: 50,
  },

  confirmButton: {
    backgroundColor: '#5D9646',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#5D9646',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },

  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // === RESUMEN ===
  summaryScrollContainer: {
    maxHeight: height * 0.6,
  },

  summaryScrollContent: {
    paddingBottom: 20,
  },

  summaryContainer: {
    paddingTop: 8,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 53, 58, 0.1)',
    shadowColor: '#34353A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  truckInfoSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 53, 58, 0.1)',
  },

  truckIconSummary: {
    fontSize: 32,
    marginRight: 16,
    padding: 14,
    backgroundColor: 'rgba(95, 142, 173, 0.1)',
    borderRadius: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(95, 142, 173, 0.2)',
  },

  truckInfoText: {
    flex: 1,
  },

  truckNameSummary: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34353A',
    marginBottom: 4,
  },

  distanceInfo: {
    fontSize: 14,
    color: '#5F8EAD',
    fontWeight: '500',
  },

  // === RUTA ===
  routeInfo: {
    marginBottom: 22,
  },

  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  routeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 16,
    marginTop: 6,
    shadowColor: '#5D9646',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },

  routeAddress: {
    fontSize: 15,
    color: '#34353A',
    flex: 1,
    lineHeight: 22,
    backgroundColor: 'rgba(95, 142, 173, 0.05)',
    padding: 14,
    borderRadius: 10,
    fontWeight: '500',
  },

  routeLine: {
    width: 2,
    height: 22,
    backgroundColor: 'rgba(93, 150, 70, 0.4)',
    marginLeft: 6,
    marginVertical: 4,
    borderRadius: 1,
  },

  // === FECHAS Y HORARIOS - NUEVOS ESTILOS ===
  timeSection: {
    marginBottom: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 53, 58, 0.1)',
  },

  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34353A',
    marginBottom: 14,
  },

  timeInputContainer: {
    marginBottom: 14,
  },

  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F8EAD',
    marginBottom: 8,
  },

  timeInput: {
    backgroundColor: 'rgba(95, 142, 173, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#34353A',
    borderWidth: 1,
    borderColor: 'rgba(95, 142, 173, 0.2)',
    fontWeight: '500',
  },

  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },

  timeColumn: {
    flex: 1,
  },

  timeInputDisabled: {
    backgroundColor: 'rgba(95, 142, 173, 0.02)',
    color: '#5F8EAD',
    fontStyle: 'italic',
  },

  calculatedLabel: {
    fontSize: 11,
    color: '#5F8EAD',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },

  estimatedTimeContainer: {
    backgroundColor: 'rgba(93, 150, 70, 0.05)',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(93, 150, 70, 0.2)',
  },

  estimatedTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D9646',
    marginBottom: 4,
  },

  estimatedTimeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34353A',
  },

  // === INFORMACIÓN DE CARGA - NUEVOS ESTILOS ===
  cargoSection: {
    marginBottom: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 53, 58, 0.1)',
  },

  cargoInputContainer: {
    marginBottom: 16,
  },

  cargoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F8EAD',
    marginBottom: 8,
  },

  cargoInput: {
    backgroundColor: 'rgba(95, 142, 173, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#34353A',
    borderWidth: 1,
    borderColor: 'rgba(95, 142, 173, 0.2)',
    fontWeight: '500',
  },

  cargoDescriptionInput: {
    backgroundColor: 'rgba(95, 142, 173, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#34353A',
    borderWidth: 1,
    borderColor: 'rgba(95, 142, 173, 0.2)',
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // === PESO DE CARGA ===
  weightContainer: {
    marginBottom: 16,
  },

  weightInputRow: {
    marginBottom: 12,
  },

  weightValueInput: {
    flex: 1,
    marginBottom: 12,
  },

  weightInput: {
    backgroundColor: 'rgba(95, 142, 173, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#34353A',
    borderWidth: 1,
    borderColor: 'rgba(95, 142, 173, 0.2)',
    fontWeight: '500',
  },

  weightUnitContainer: {
    marginTop: 8,
  },

  weightUnitLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5F8EAD',
    marginBottom: 8,
  },

  weightUnitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(95, 142, 173, 0.05)',
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(95, 142, 173, 0.1)',
  },

  weightUnitSelected: {
    backgroundColor: 'rgba(93, 150, 70, 0.1)',
    borderColor: '#5D9646',
    borderWidth: 1.5,
  },

  weightRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(52, 53, 58, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  weightRadioSelected: {
    borderColor: '#5D9646',
    backgroundColor: 'rgba(93, 150, 70, 0.1)',
  },

  weightRadioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5D9646',
  },

  weightUnitText: {
    fontSize: 14,
    color: '#34353A',
    fontWeight: '500',
  },

  weightUnitTextSelected: {
    color: '#5D9646',
    fontWeight: '600',
  },

  weightConversionText: {
    fontSize: 12,
    color: '#5F8EAD',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(95, 142, 173, 0.05)',
    borderRadius: 6,
  },

  // === CLASIFICACIÓN DE RIESGO ===
  riskContainer: {
    marginBottom: 16,
  },

  riskOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  riskOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(95, 142, 173, 0.05)',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(95, 142, 173, 0.1)',
    flex: 1,
    minWidth: '48%',
  },

  riskOptionSelected: {
    backgroundColor: 'rgba(93, 150, 70, 0.1)',
    borderColor: '#5D9646',
    borderWidth: 1.5,
  },

  riskIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  riskText: {
    fontSize: 13,
    color: '#34353A',
    fontWeight: '500',
    flex: 1,
  },

  riskTextSelected: {
    color: '#5D9646',
    fontWeight: '600',
  },

  riskRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(52, 53, 58, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  riskRadioSelected: {
    borderColor: '#5D9646',
    backgroundColor: 'rgba(93, 150, 70, 0.1)',
  },

  riskRadioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5D9646',
  },

  // === RESUMEN DE CARGA ===
  cargoSummary: {
    backgroundColor: 'rgba(93, 150, 70, 0.05)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(93, 150, 70, 0.2)',
    marginTop: 12,
  },

  cargoSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5D9646',
    marginBottom: 8,
  },

  cargoSummaryItem: {
    fontSize: 13,
    color: '#34353A',
    marginBottom: 4,
    fontWeight: '500',
    lineHeight: 18,
  },

  // === INFORMACIÓN ADICIONAL ===
  additionalInfoSection: {
    marginBottom: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 53, 58, 0.1)',
  },

  descriptionInput: {
    backgroundColor: 'rgba(95, 142, 173, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#34353A',
    borderWidth: 1,
    borderColor: 'rgba(95, 142, 173, 0.2)',
    marginBottom: 12,
    textAlignVertical: 'top',
    minHeight: 80,
  },

  // === MÉTODOS DE PAGO ===
  paymentSection: {
    marginBottom: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 53, 58, 0.1)',
  },

  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(95, 142, 173, 0.05)',
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(95, 142, 173, 0.2)',
  },

  paymentOptionSelected: {
    backgroundColor: 'rgba(93, 150, 70, 0.1)',
    borderColor: '#5D9646',
    borderWidth: 2,
    shadowColor: '#5D9646',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(52, 53, 58, 0.1)',
  },

  paymentIcon: {
    fontSize: 22,
  },

  paymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34353A',
    flex: 1,
  },

  paymentTextSelected: {
    color: '#5D9646',
  },

  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(52, 53, 58, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioCircleSelected: {
    borderColor: '#5D9646',
    backgroundColor: 'rgba(93, 150, 70, 0.1)',
  },

  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5D9646',
  },

  // === VALIDACIÓN Y BOTÓN FINAL ===
  bookButtonContainer: {
    marginTop: 10,
  },

  missingFieldsContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },

  missingFieldsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 6,
  },

  missingFieldItem: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 2,
    marginLeft: 8,
  },

  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonContent: {
    alignItems: 'center',
  },

  buttonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },

  finalInfoContainer: {
    backgroundColor: 'rgba(93, 150, 70, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(93, 150, 70, 0.2)',
  },

  finalInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5D9646',
    marginBottom: 12,
    textAlign: 'center',
  },

  finalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  finalInfoItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(93, 150, 70, 0.1)',
  },

  finalInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5F8EAD',
    marginBottom: 2,
  },

  finalInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34353A',
  },

  // === BOTÓN PRINCIPAL ===
  bookButton: {
    backgroundColor: '#5D9646',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#5D9646',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  bookButtonDisabled: {
    backgroundColor: 'rgba(52, 53, 58, 0.3)',
    shadowColor: 'transparent',
    elevation: 0,
  },

  bookButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  // === LOADING ===
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(52, 53, 58, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 36,
    alignItems: 'center',
    shadowColor: '#34353A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(93, 150, 70, 0.2)',
  },

  loadingText: {
    marginTop: 18,
    fontSize: 16,
    color: '#34353A',
    fontWeight: '600',
    textAlign: 'center',
  },

  // === ESTILOS CINEMATOGRÁFICOS ===
  cinematicContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cinematicLottieAnimation: {
    width: width * 1.0,
    height: height * 1.0,
  },
});

export default IntegratedTruckRequestScreen;