import React, { useState, useRef, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import * as Location from 'expo-location';
import { createQuote, fetchQuotesByClient } from '../api/quotes';

const { width, height } = Dimensions.get('window');

const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  green: '#00B140',
  lightGray: '#F5F5F5',
  darkGray: '#333333',
  mediumGray: '#767676',
  border: '#E0E0E0',
  red: '#D32F2F',
  blue: '#1E88E5',
};

const IntegratedTruckRequestScreen = () => {
  const navigation = useNavigation();
  const webViewRef = useRef(null);

  const [currentStep, setCurrentStep] = useState('setLocations');
  const [locationStep, setLocationStep] = useState(1);
  
  const [selectedTruckType, setSelectedTruckType] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const [departureTime, setDepartureTime] = useState('10:00 AM');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [quoteName, setQuoteName] = useState('');

  const [routeDistance, setRouteDistance] = useState(0);
  const [estimatedCosts, setEstimatedCosts] = useState({
    combustible: 0,
    peajes: 0,
    conductor: 0,
    otros: 0
  });

  const [showFirstQuoteAnimation, setShowFirstQuoteAnimation] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isFirstQuote, setIsFirstQuote] = useState(false);

  const [deliveryDate, setDeliveryDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [cargoWeightUnit, setCargoWeightUnit] = useState('kg');
  const [cargoType, setCargoType] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [riskClassification, setRiskClassification] = useState('normal');

  const truckTypes = [
    {
      id: 'refrigerado',
      name: 'Camión Refrigerado',
      icon: '🧊',
      description: 'Temperatura controlada',
      category: 'alimentos_perecederos',
      basePrice: 50,
      capacity: '4 personas'
    },
    {
      id: 'seco',
      name: 'Camión Seco',
      icon: '📦',
      description: 'Carga general',
      category: 'otros',
      basePrice: 35,
      capacity: '4 personas'
    }
  ];

  const weightUnits = [
    { value: 'kg', label: 'kg' },
    { value: 'lb', label: 'lb' },
    { value: 'ton', label: 'ton' }
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        Alert.alert(
          'Permisos de ubicación',
          'Para una mejor experiencia, permite el acceso a tu ubicación.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      setCurrentLocation(coords);

      if (webViewRef.current && mapReady) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateCurrentLocation',
          coords: coords
        }));
      }

      setIsLoadingLocation(false);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      setIsLoadingLocation(false);
      
      const defaultLocation = {
        latitude: 13.7942,
        longitude: -89.5564
      };
      setCurrentLocation(defaultLocation);
    }
  };

  const useCurrentLocationAsPickup = async () => {
    if (!currentLocation) {
      Alert.alert('Ubicación no disponible', 'Activando ubicación...');
      await getCurrentLocation();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.latitude}&lon=${currentLocation.longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TruckApp/1.0'
          }
        }
      );

      const data = await response.json();
      
      if (data && data.display_name) {
        setPickupAddress(data.display_name);
        setPickupCoords(currentLocation);

        if (webViewRef.current && mapReady) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'addMarker',
            coords: currentLocation,
            step: 1,
            address: data.display_name
          }));
        }

        setTimeout(() => {
          setLocationStep(2);
        }, 1000);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error con ubicación actual:', error);
      setIsLoading(false);
      Alert.alert('Error', 'No se pudo obtener la dirección actual');
    }
  };

  const initializeDefaultDates = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const requestDateStr = tomorrow.toISOString().split('T')[0];
    const arrivalTimeStr = calculateArrivalTime(departureTime, estimatedTime);
    
    setRequestDate(requestDateStr);
    setDeliveryDate(requestDateStr);
    setArrivalTime(arrivalTimeStr);
  };

  const calculateArrivalTime = (departure, estimatedMinutes) => {
    if (!departure || !estimatedMinutes) return '';
    
    try {
      const [timeStr, ampm] = departure.split(' ');
      const [hourStr, minuteStr] = timeStr.split(':');
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      
      if (ampm === 'PM' && hour !== 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }
      
      const departureDateTime = new Date();
      departureDateTime.setHours(hour, minute, 0, 0);
      
      const arrivalDateTime = new Date(departureDateTime);
      arrivalDateTime.setMinutes(arrivalDateTime.getMinutes() + estimatedMinutes);
      
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

  const convertWeightToKg = (weight, unit) => {
    const weightNum = parseFloat(weight);
    switch (unit) {
      case 'lb':
        return Math.round(weightNum * 0.453592 * 100) / 100;
      case 'ton':
        return Math.round(weightNum * 1000 * 100) / 100;
      case 'kg':
      default:
        return Math.round(weightNum * 100) / 100;
    }
  };

  const isFormValid = () => {
    return cargoWeight && 
           cargoWeight.trim() !== '' && 
           cargoType && 
           cargoType.trim() !== '' && 
           requestDate && 
           deliveryDate && 
           parseFloat(cargoWeight) > 0;
  };

  useEffect(() => {
    if (currentStep === 'details' && estimatedTime && !requestDate) {
      initializeDefaultDates();
    }
  }, [currentStep, estimatedTime]);

  useEffect(() => {
    if (departureTime && estimatedTime) {
      const newArrivalTime = calculateArrivalTime(departureTime, estimatedTime);
      setArrivalTime(newArrivalTime);
    }
  }, [departureTime, estimatedTime]);

  const fetchUserQuotes = async () => {
    try {
      const clientId = await getClientId();
      const token = await AsyncStorage.getItem('clientToken');
      const baseUrl = 'https://riveraproject-production-933e.up.railway.app';
      
      if (!clientId) {
        throw new Error('No hay datos de autenticación');
      }

      let quotes = [];
      try {
        const data = await fetchQuotesByClient({
          baseUrl,
          token,
          clientId,
        });
        
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
          return quotes;
        }
      } catch (error) {
        console.log('Intentando método fallback...');
      }

      const response = await fetch(`${baseUrl}/api/cotizaciones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const allQuotes = await response.json();
      
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
      
      const userQuotes = normalizedQuotes.filter(quote => {
        const quoteClientId = quote.clientId || quote.clienteId || quote.client_id;
        return String(quoteClientId || '') === String(clientId);
      });
      
      return userQuotes;
      
    } catch (error) {
      console.error('Error obteniendo cotizaciones:', error);
      throw error;
    }
  };

  const checkIfFirstQuoteFromBackend = async () => {
    try {
      setIsLoading(true);
      
      const userQuotes = await fetchUserQuotes();
      
      const isFirst = userQuotes.length === 0;
      const quotesCount = userQuotes.length;
      
      setIsFirstQuote(isFirst);
      return { isFirst, quotesCount };
      
    } catch (error) {
      console.error('Error verificando cotizaciones:', error);
      
      setIsFirstQuote(false);
      return { isFirst: false, quotesCount: -1 };
    } finally {
      setIsLoading(false);
    }
  };

  const markFirstQuoteCompleted = async () => {
    try {
      await AsyncStorage.setItem('hasCreatedFirstQuote', 'true');
    } catch (error) {
      console.error('Error marcando primera cotización:', error);
    }
  };

  useEffect(() => {
    checkIfFirstQuoteFromBackend();
  }, []);

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

  const generateQuoteName = () => {
    const date = new Date();
    const dateStr = date.toLocaleDateString('es-ES').replace(/\//g, '-');
    const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `Cotización ${selectedTruckType?.name} - ${dateStr} ${timeStr}`;
  };

  const createQuoteInBackend = async () => {
    try {
      setIsLoading(true);

      if (!pickupAddress || !pickupAddress.trim()) {
        throw new Error('La dirección de recogida es requerida');
      }

      if (!destinationAddress || !destinationAddress.trim()) {
        throw new Error('La dirección de destino es requerida');
      }

      if (!pickupCoords || !destinationCoords) {
        throw new Error('Las coordenadas son inválidas');
      }

      const validationErrors = validateCargoFields();
      if (validationErrors.length > 0) {
        Alert.alert('Campos requeridos', validationErrors.join('\n'));
        return;
      }

      const clientId = await getClientId();
      if (!clientId) {
        throw new Error('No se encontró información del cliente');
      }

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

      const baseUrl = 'https://riveraproject-production-933e.up.railway.app';
      const token = await AsyncStorage.getItem('clientToken');

      const response = await createQuote({
        baseUrl,
        token,
        payload: quoteData
      });

      return response;

    } catch (error) {
      console.error('Error creando cotización:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      const validationErrors = validateCargoFields();
      
      if (validationErrors.length > 0) {
        Alert.alert(
          'Campos requeridos', 
          validationErrors.join('\n'),
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Confirmar Solicitud',
        `¿Crear esta cotización?\n\n` +
        `📅 Fecha: ${requestDate}\n` +
        `🕐 Salida: ${departureTime}\n` +
        `📦 Carga: ${cargoType}\n` +
        `⚖️ Peso: ${cargoWeight} ${cargoWeightUnit}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => {
              try {
                const { isFirst, quotesCount } = await checkIfFirstQuoteFromBackend();
                
                const createdQuote = await createQuoteInBackend();
                
                if (isFirst && quotesCount === 0) {
                  await markFirstQuoteCompleted();
                  setShowFirstQuoteAnimation(true);
                  
                  setTimeout(() => {
                    setShowFirstQuoteAnimation(false);
                    setTimeout(() => {
                      navigateToSuccess(createdQuote);
                    }, 300);
                  }, 10900);
                } else {
                  setShowSuccessAnimation(true);
                  
                  setTimeout(() => {
                    setShowSuccessAnimation(false);
                    setTimeout(() => {
                      navigateToSuccess(createdQuote);
                    }, 300);
                  }, 3000);
                }
                
              } catch (error) {
                Alert.alert(
                  'Error',
                  error.message || 'Hubo un problema al crear la cotización.',
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

  const handleTruckSelection = (truckType) => {
    setSelectedTruckType(truckType);
  };

  const proceedToDetails = () => {
    if (!selectedTruckType) {
      Alert.alert('Error', 'Por favor selecciona un tipo de camión');
      return;
    }
    setCurrentStep('details');
  };

  const geocodeAddress = async (address, step, retryCount = 0) => {
    if (!address.trim()) return null;

    setIsLoading(true);

    try {
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Intentar búsqueda con y sin restricción de país
      const searchQueries = [
        `${encodeURIComponent(address)}, El Salvador`,
        `${encodeURIComponent(address)}, San Salvador`,
        `${encodeURIComponent(address)}`
      ];

      let result = null;

      for (const query of searchQueries) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1&dedupe=1`,
            {
              headers: {
                'User-Agent': 'TruckApp/1.0',
                'Accept-Language': 'es'
              }
            }
          );

          if (!response.ok) continue;

          const data = await response.json();

          if (data && data.length > 0) {
            // Priorizar resultados en El Salvador
            const salvadorResult = data.find(r => 
              r.display_name.toLowerCase().includes('el salvador') ||
              r.display_name.toLowerCase().includes('san salvador')
            );
            
            result = salvadorResult || data[0];
            break;
          }

          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.log(`Búsqueda con "${query}" falló, intentando siguiente...`);
          continue;
        }
      }

      if (result) {
        const coords = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        };

        if (step === 1) {
          setPickupCoords(coords);
        } else if (step === 2) {
          setDestinationCoords(coords);
        }

        const sendMarker = () => {
          if (webViewRef.current && mapReady) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'addMarker',
              coords: coords,
              step: step,
              address: result.display_name || address
            }));
          } else if (retryCount < 3) {
            setTimeout(sendMarker, 500);
          }
        };

        setTimeout(sendMarker, 300);
        setIsLoading(false);
        return coords;

      } else {
        if (retryCount < 1) {
          return await geocodeAddress(address, step, retryCount + 1);
        } else {
          setIsLoading(false);
          Alert.alert(
            'Ubicación no encontrada', 
            'No se pudo encontrar esta dirección. Intenta:\n• Ser más específico\n• Tocar directamente en el mapa\n• Usar tu ubicación actual',
            [{ text: 'OK' }]
          );
          return null;
        }
      }
    } catch (error) {
      console.error('Error geocoding:', error);

      if (retryCount < 1) {
        return await geocodeAddress(address, step, retryCount + 1);
      } else {
        setIsLoading(false);
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar con el servicio de mapas. Por favor:\n• Verifica tu conexión a internet\n• Intenta tocar el mapa directamente',
          [{ text: 'OK' }]
        );
        return null;
      }
    }
  };

  const confirmLocation = async () => {
    if (locationStep === 1 && pickupAddress.trim()) {
      const coords = await geocodeAddress(pickupAddress, 1);
      if (coords) {
        setPickupCoords(coords);
        setTimeout(() => {
          setLocationStep(2);
        }, 1000);
      }
    } else if (locationStep === 2 && destinationAddress.trim()) {
      const coords = await geocodeAddress(destinationAddress, 2);
      if (coords) {
        setDestinationCoords(coords);
        setTimeout(() => {
          calculateRouteDirectly(pickupCoords, coords);
        }, 1000);
      }
    }
  };

  const calculateRouteDirectly = async (pickup, destination) => {
    if (!pickup || !destination) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      if (webViewRef.current && mapReady) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'showRoute',
          origin: pickup,
          destination: destination
        }));
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
        setEstimatedTime(calculatedTime);
        
        setCurrentStep('selectTruck');
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Error calculando ruta:', error);
      setIsLoading(false);
    }
  };

  const handleMapClick = async (coords) => {
    // Solo responder a clics del mapa cuando estamos en modo de ubicaciones
    if (currentStep !== 'setLocations') return;

    setIsLoading(true);

    try {
      // Intentar con diferentes niveles de zoom para mejor precisión
      const zoomLevels = [18, 16, 14, 12];
      let addressData = null;

      for (const zoom of zoomLevels) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=${zoom}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'TruckApp/1.0',
                'Accept-Language': 'es'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              addressData = data;
              break;
            }
          }
          
          // Esperar un poco antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.log(`Intento con zoom ${zoom} falló, probando siguiente...`);
          continue;
        }
      }

      // Si no se encontró con Nominatim, crear una dirección con coordenadas
      if (!addressData) {
        const formattedCoords = `Lat: ${coords.latitude.toFixed(5)}, Lng: ${coords.longitude.toFixed(5)}`;
        addressData = {
          display_name: `Ubicación seleccionada (${formattedCoords})`,
          address: {}
        };
      }

      // Guardar la ubicación
      if (locationStep === 1) {
        setPickupAddress(addressData.display_name);
        setPickupCoords(coords);

        if (webViewRef.current && mapReady) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'addMarker',
            coords: coords,
            step: 1,
            address: addressData.display_name
          }));
        }
      } else if (locationStep === 2) {
        setDestinationAddress(addressData.display_name);
        setDestinationCoords(coords);

        if (webViewRef.current && mapReady) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'addMarker',
            coords: coords,
            step: 2,
            address: addressData.display_name
          }));
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error con selección de mapa:', error);
      
      // Incluso si hay error, usar las coordenadas
      const formattedCoords = `Lat: ${coords.latitude.toFixed(5)}, Lng: ${coords.longitude.toFixed(5)}`;
      const fallbackAddress = `Ubicación: ${formattedCoords}`;
      
      if (locationStep === 1) {
        setPickupAddress(fallbackAddress);
        setPickupCoords(coords);

        if (webViewRef.current && mapReady) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'addMarker',
            coords: coords,
            step: 1,
            address: fallbackAddress
          }));
        }
      } else if (locationStep === 2) {
        setDestinationAddress(fallbackAddress);
        setDestinationCoords(coords);

        if (webViewRef.current && mapReady) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'addMarker',
            coords: coords,
            step: 2,
            address: fallbackAddress
          }));
        }
      }
      
      setIsLoading(false);
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'mapReady') {
        setMapReady(true);
        
        if (currentLocation) {
          setTimeout(() => {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'updateCurrentLocation',
              coords: currentLocation
            }));
          }, 500);
        }
      } else if (data.type === 'mapClick') {
        handleMapClick(data.coords);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const getHeaderTitle = () => {
    if (currentStep === 'setLocations') {
      return locationStep === 1 ? 'Fija tu origen' : 'Fija tu destino';
    }
    if (currentStep === 'selectTruck') return 'Elige un viaje';
    if (currentStep === 'details') return 'Confirma tu viaje';
    return '';
  };

  const handleBackPress = () => {
    if (currentStep === 'setLocations') {
      if (locationStep > 1) {
        setLocationStep(1);
        setDestinationAddress('');
        setDestinationCoords(null);
      } else {
        navigation.goBack();
      }
    } else if (currentStep === 'selectTruck') {
      setCurrentStep('setLocations');
      setLocationStep(2);
    } else if (currentStep === 'details') {
      setCurrentStep('selectTruck');
    } else {
      navigation.goBack();
    }
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100%; cursor: pointer; }
          .leaflet-routing-container { display: none !important; }
          .current-location-dot {
            width: 16px;
            height: 16px;
            background: #1E88E5;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        
        <script>
          let map;
          let routingControl;
          let pickupMarker = null;
          let destinationMarker = null;
          let currentLocationMarker = null;
          let isMapReady = false;
          
          function initMap() {
            try {
              const sanSalvador = [13.7942, -89.5564];
              
              map = L.map('map').setView(sanSalvador, 13);
              
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19
              }).addTo(map);

              map.on('click', function(e) {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapClick',
                    coords: {
                      latitude: e.latlng.lat,
                      longitude: e.latlng.lng
                    }
                  }));
                }
              });
              
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

          function updateCurrentLocation(coords) {
            if (!isMapReady || !map) return;
            
            try {
              if (currentLocationMarker) {
                map.removeLayer(currentLocationMarker);
              }

              const currentLocationIcon = L.divIcon({
                html: '<div class="current-location-dot"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
                className: ''
              });

              currentLocationMarker = L.marker([coords.latitude, coords.longitude], {
                icon: currentLocationIcon,
                zIndexOffset: 1000
              }).addTo(map);

            } catch (error) {
              console.error('Error actualizando ubicación:', error);
            }
          }
          
          function addMarker(coords, step, address) {
            if (!isMapReady || !map) return;
            
            try {
              const lat = coords.latitude;
              const lng = coords.longitude;
              
              if (step === 1) {
                if (pickupMarker) map.removeLayer(pickupMarker);
                
                pickupMarker = L.marker([lat, lng])
                  .addTo(map)
                  .bindPopup('<b>Origen</b><br>' + address);
                  
                map.setView([lat, lng], 15, { animate: true });
                  
              } else if (step === 2) {
                if (destinationMarker) map.removeLayer(destinationMarker);
                
                destinationMarker = L.marker([lat, lng])
                  .addTo(map)
                  .bindPopup('<b>Destino</b><br>' + address);
                  
                if (pickupMarker && destinationMarker) {
                  setTimeout(() => {
                    const group = new L.featureGroup([pickupMarker, destinationMarker]);
                    map.fitBounds(group.getBounds().pad(0.15));
                  }, 300);
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
                  styles: [{ color: '#000', weight: 4, opacity: 0.8 }]
                },
                show: false
              }).addTo(map);
              
              routingControl.on('routesfound', function(e) {
                if (pickupMarker && destinationMarker) {
                  const group = new L.featureGroup([pickupMarker, destinationMarker]);
                  map.fitBounds(group.getBounds().pad(0.1));
                }
              });
              
            } catch (error) {
              console.error('Error mostrando ruta:', error);
            }
          }
          
          document.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              
              if (data.type === 'addMarker') {
                addMarker(data.coords, data.step, data.address);
              } else if (data.type === 'showRoute') {
                showRoute(data.origin, data.destination);
              } else if (data.type === 'updateCurrentLocation') {
                updateCurrentLocation(data.coords);
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
              } else if (data.type === 'updateCurrentLocation') {
                updateCurrentLocation(data.coords);
              }
            } catch (error) {
              console.error('Error procesando mensaje:', error);
            }
          });
          
          window.onload = initMap;
        </script>
      </body>
    </html>
  `;

  const TruckOption = ({ truck, selected, onPress }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(truck)}
        style={[
          styles.truckCard,
          selected && styles.truckCardSelected
        ]}
      >
        <View style={styles.truckCardContent}>
          <Text style={styles.truckIcon}>{truck.icon}</Text>
          <View style={styles.truckInfo}>
            <Text style={styles.truckName}>{truck.name}</Text>
            <Text style={styles.truckDescription}>{truck.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FirstQuoteAnimation = () => (
    <Modal visible={showFirstQuoteAnimation} transparent={false} animationType="fade" statusBarTranslucent={true}>
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../assets/lottie/Warehouse and delivery (1).json')}
          autoPlay
          loop={false}
          style={styles.lottieAnimation}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );

  const SuccessQuoteAnimation = () => (
    <Modal visible={showSuccessAnimation} transparent={false} animationType="fade" statusBarTranslucent={true}>
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../assets/lottie/Cred tick animation.json')}
          autoPlay
          loop={false}
          style={styles.lottieAnimation}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleWebViewMessage}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={COLORS.black} />
              <Text style={styles.loadingText}>Calculando...</Text>
            </View>
          </View>
        )}
      </View>

      {currentStep === 'setLocations' && (
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />

          <View style={styles.locationContent}>
            <Text style={styles.locationTitle}>Planifica tu viaje</Text>

            {locationStep === 1 && (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.locationDot} />
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Origen"
                    placeholderTextColor={COLORS.mediumGray}
                    value={pickupAddress}
                    onChangeText={setPickupAddress}
                    onFocus={() => {
                      if (pickupAddress) {
                        setPickupAddress('');
                        setPickupCoords(null);
                      }
                    }}
                  />
                </View>

                {currentLocation && (
                  <TouchableOpacity
                    style={styles.currentLocationButton}
                    onPress={useCurrentLocationAsPickup}
                    disabled={isLoadingLocation}
                  >
                    <Text style={styles.currentLocationIcon}>📍</Text>
                    <Text style={styles.currentLocationText}>Usar mi ubicación actual</Text>
                  </TouchableOpacity>
                )}

                {pickupAddress.trim().length > 5 && (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={confirmLocation}
                    disabled={isLoading}
                  >
                    <Text style={styles.primaryButtonText}>Confirmar origen</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {locationStep === 2 && (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.locationDot} />
                  <Text style={styles.fixedAddress} numberOfLines={1}>
                    {pickupAddress}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <View style={[styles.locationDot, { backgroundColor: COLORS.black }]} />
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Destino"
                    placeholderTextColor={COLORS.mediumGray}
                    value={destinationAddress}
                    onChangeText={setDestinationAddress}
                    onFocus={() => {
                      if (destinationAddress) {
                        setDestinationAddress('');
                        setDestinationCoords(null);
                      }
                    }}
                  />
                </View>

                {destinationAddress.trim().length > 5 && (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={confirmLocation}
                    disabled={isLoading}
                  >
                    <Text style={styles.primaryButtonText}>Confirmar destino</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      )}

      {currentStep === 'selectTruck' && (
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.sheetContent}>
              <Text style={styles.sectionTitle}>Elige un tipo de camión</Text>

              {truckTypes.map((truck) => (
                <TruckOption
                  key={truck.id}
                  truck={truck}
                  selected={selectedTruckType?.id === truck.id}
                  onPress={handleTruckSelection}
                />
              ))}
            </View>
          </ScrollView>

          {selectedTruckType && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={proceedToDetails}>
                <Text style={styles.primaryButtonText}>
                  Elegir {selectedTruckType.name}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {currentStep === 'details' && (
        <ScrollView style={styles.bottomSheet} contentContainerStyle={styles.detailsContent}>
          <View style={styles.dragHandle} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fechas y horarios</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha del servicio</Text>
              <TextInput
                style={styles.textInput}
                value={requestDate}
                onChangeText={setRequestDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.mediumGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hora de salida</Text>
              <TextInput
                style={styles.textInput}
                value={departureTime}
                onChangeText={setDepartureTime}
                placeholder="10:00 AM"
                placeholderTextColor={COLORS.mediumGray}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de la carga</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo de carga</Text>
              <TextInput
                style={styles.textInput}
                value={cargoType}
                onChangeText={setCargoType}
                placeholder="Ej: Electrodomésticos"
                placeholderTextColor={COLORS.mediumGray}
              />
            </View>

            <View style={styles.weightRow}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.inputLabel}>Peso</Text>
                <TextInput
                  style={styles.textInput}
                  value={cargoWeight}
                  onChangeText={setCargoWeight}
                  placeholder="0"
                  placeholderTextColor={COLORS.mediumGray}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.inputLabel}>Unidad</Text>
                <View style={styles.unitPicker}>
                  {weightUnits.map((unit) => (
                    <TouchableOpacity
                      key={unit.value}
                      style={[
                        styles.unitOption,
                        cargoWeightUnit === unit.value && styles.unitOptionSelected
                      ]}
                      onPress={() => setCargoWeightUnit(unit.value)}
                    >
                      <Text style={[
                        styles.unitText,
                        cargoWeightUnit === unit.value && styles.unitTextSelected
                      ]}>
                        {unit.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Método de pago</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentCard,
                paymentMethod === 'efectivo' && styles.paymentCardSelected
              ]}
              onPress={() => setPaymentMethod('efectivo')}
            >
              <Text style={styles.paymentIcon}>💵</Text>
              <Text style={styles.paymentText}>Efectivo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentCard,
                paymentMethod === 'transferencia' && styles.paymentCardSelected
              ]}
              onPress={() => setPaymentMethod('transferencia')}
            >
              <Text style={styles.paymentIcon}>💳</Text>
              <Text style={styles.paymentText}>Transferencia</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.finalButtonContainer}>
            {!isFormValid() && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  Completa todos los campos requeridos
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                !isFormValid() && styles.primaryButtonDisabled
              ]}
              onPress={handleConfirmBooking}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Crear cotización</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <FirstQuoteAnimation />
      <SuccessQuoteAnimation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.black,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: height * 0.75,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.mediumGray,
    opacity: 0.4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  locationContent: {
    padding: 16,
    paddingBottom: 24,
  },
  locationTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.black,
    marginRight: 12,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  fixedAddress: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  currentLocationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },

  mapHintOverlay: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    zIndex: 1000,
    pointerEvents: 'none',
  },

  mapHintBanner: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  mapHintText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    textAlign: 'center',
  },

  changeLocationButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },

  changeLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.blue,
  },
  scrollContent: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  truckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  truckCardSelected: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.black,
    borderWidth: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  truckCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  truckIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  truckInfo: {
    flex: 1,
  },
  truckName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  truckDescription: {
    fontSize: 14,
    color: COLORS.mediumGray,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryButton: {
    backgroundColor: COLORS.black,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  detailsContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weightRow: {
    flexDirection: 'row',
  },
  unitPicker: {
    flexDirection: 'row',
    gap: 4,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  unitOptionSelected: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  unitTextSelected: {
    color: COLORS.white,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentCardSelected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.black,
    borderWidth: 2,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },
  finalButtonContainer: {
    marginTop: 16,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'center',
  },
  animationContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: width,
    height: height,
  },
});

export default IntegratedTruckRequestScreen;