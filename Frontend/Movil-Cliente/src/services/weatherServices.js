// src/services/weatherService.js - OPTIMIZADO PARA EXPO GO

import * as Location from 'expo-location';

const WEATHER_API_KEY = 'eb6167d92267287c86dca55b6ae66751';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Coordenadas específicas de Colonia Morazán
const COLONIA_MORAZAN_COORDS = { lat: 13.7134, lon: -89.2073 };

// 🚀 FUNCIÓN PRINCIPAL PARA EXPO
export const getExpoWeather = async () => {
  console.log('🚀 Iniciando detección de clima en Expo...');
  
  // Método 1: Expo Location (reemplaza navigator.geolocation)
  console.log('📍 Método 1: Intentando Expo Location...');
  const expoLocationWeather = await tryExpoLocation();
  if (expoLocationWeather && expoLocationWeather.isReal && expoLocationWeather.condition !== 'undefined') {
    console.log('✅ Expo Location exitoso:', expoLocationWeather.location);
    return expoLocationWeather;
  }
  
  // Método 2: Timezone (funciona en Expo)
  console.log('⏰ Método 2: Intentando por zona horaria...');
  const timezoneWeather = await tryTimezoneLocation();
  if (timezoneWeather && timezoneWeather.isReal && timezoneWeather.condition !== 'undefined') {
    console.log('✅ Timezone exitoso:', timezoneWeather.location);
    return timezoneWeather;
  }
  
  // Método 3: Coordenadas fijas de Colonia Morazán
  console.log('🎯 Método 3: Usando Colonia Morazán específico...');
  return await tryColoniaMorazanLocation();
};

// 📍 Método 1: Expo Location (reemplaza GPS web)
const tryExpoLocation = async () => {
  try {
    console.log('📍 Verificando permisos de ubicación...');
    
    // Verificar permisos
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('❌ Permisos de ubicación denegados');
      return null;
    }
    
    console.log('✅ Permisos concedidos, obteniendo ubicación...');
    
    // Obtener ubicación con timeout
    const location = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 8000,
        maximumAge: 60000 // Cache de 1 minuto
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      )
    ]);
    
    const coords = {
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      accuracy: location.coords.accuracy
    };
    
    console.log('📍 Ubicación Expo obtenida:', coords);
    console.log('🎯 Precisión:', Math.round(coords.accuracy) + 'm');
    
    // Verificar que estemos en El Salvador
    if (coords.lat < 12.5 || coords.lat > 14.5 || 
        coords.lon < -90.5 || coords.lon > -87) {
      console.log('❌ Ubicación fuera de El Salvador, usando fallback');
      return null;
    }
    
    return await fetchWeatherData(coords, 'Expo-Location');
    
  } catch (error) {
    console.log('❌ Error Expo Location:', error.message);
    return null;
  }
};

// ⏰ Método 2: Timezone (funciona bien en Expo)
const tryTimezoneLocation = async () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('⏰ Zona horaria detectada:', timezone);
    
    const offset = new Date().getTimezoneOffset();
    console.log('🕐 Offset de zona horaria:', offset);
    
    // El Salvador: UTC-6 = 360 minutos
    if (offset >= 300 && offset <= 420) {
      console.log('✅ Zona horaria compatible con Centroamérica');
      
      // Usar coordenadas específicas de Colonia Morazán
      return await fetchWeatherData(COLONIA_MORAZAN_COORDS, 'Timezone');
    }
    
    return null;
  } catch (error) {
    console.log('❌ Error timezone detection:', error.message);
    return null;
  }
};

// 🎯 Método 3: Colonia Morazán específico
const tryColoniaMorazanLocation = async () => {
  console.log('🎯 Obteniendo clima específico de Colonia Morazán...');
  
  // Probar múltiples puntos en Colonia Morazán para mejor precisión
  const morazanPoints = [
    { lat: 13.7134, lon: -89.2073, name: 'Colonia Morazán Centro' },
    { lat: 13.7150, lon: -89.2080, name: 'Colonia Morazán Norte' },
    { lat: 13.7120, lon: -89.2060, name: 'Colonia Morazán Sur' }
  ];
  
  for (const point of morazanPoints) {
    try {
      const weather = await fetchWeatherData(point, `Fixed-${point.name}`);
      if (weather && weather.condition !== 'undefined') {
        // Forzar el nombre a Colonia Morazán
        weather.location = 'Colonia Morazán, SV';
        return weather;
      }
    } catch (error) {
      console.log(`❌ Error con ${point.name}:`, error.message);
    }
  }
  
  // Si todo falla, simulado específico para Colonia Morazán
  return getSimulatedColoniaMorazan();
};

// 🌤️ Función para obtener datos del clima
const fetchWeatherData = async (coords, method) => {
  try {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'TU_API_KEY_AQUI') {
      console.warn('⚠️ API key no configurada');
      return getSimulatedColoniaMorazan();
    }

    const url = `${WEATHER_BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=es`;
    
    console.log(`🌐 Obteniendo clima (${method}):`, coords);

    const response = await fetch(url, { 
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.main || !data.weather || !data.weather[0]) {
      throw new Error('Datos incompletos del API');
    }
    
    const condition = translateWeatherCondition(
      data.weather[0].description,
      data.weather[0].main
    );
    
    const weatherData = {
      temperature: Math.round(data.main.temp).toString(),
      condition: condition,
      humidity: `${data.main.humidity}%`,
      icon: data.weather[0].icon,
      windSpeed: `${Math.round(data.wind?.speed || 0)} km/h`,
      feelsLike: Math.round(data.main.feels_like),
      pressure: `${data.main.pressure} hPa`,
      visibility: data.visibility ? `${Math.round(data.visibility / 1000)} km` : '10 km',
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('es-SV', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('es-SV', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      location: `${data.name}, ${data.sys.country}`,
      coordinates: coords,
      detectionMethod: method,
      accuracy: coords.accuracy || null,
      isReal: true,
      isExpo: true,
      error: false,
      lastUpdated: new Date().toISOString(),
      source: `OpenWeatherMap - ${method}`
    };

    // Validación final
    if (!weatherData.condition || weatherData.condition === 'undefined') {
      console.error('❌ Condición undefined, corrigiendo...');
      weatherData.condition = 'Despejado';
    }

    console.log(`✅ Clima obtenido exitosamente (${method}):`, {
      location: weatherData.location,
      temperature: weatherData.temperature,
      condition: weatherData.condition,
      method: method
    });

    return weatherData;

  } catch (error) {
    console.error(`❌ Error fetchWeatherData (${method}):`, error.message);
    return null;
  }
};

// 🎭 Datos simulados específicos para Colonia Morazán
const getSimulatedColoniaMorazan = () => {
  const now = new Date();
  const hour = now.getHours();
  
  console.log('🎭 Generando datos simulados para Colonia Morazán...');
  
  // Temperaturas típicas de Colonia Morazán (zona urbana, tiende a ser más caliente)
  let temp;
  if (hour >= 6 && hour <= 11) temp = 25 + Math.floor(Math.random() * 3); // 25-27°C mañana
  else if (hour >= 12 && hour <= 17) temp = 28 + Math.floor(Math.random() * 5); // 28-32°C tarde
  else if (hour >= 18 && hour <= 21) temp = 26 + Math.floor(Math.random() * 3); // 26-28°C noche
  else temp = 22 + Math.floor(Math.random() * 4); // 22-25°C madrugada
  
  const conditions = ['Soleado', 'Pocas nubes', 'Parcialmente nublado'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    temperature: temp.toString(),
    condition: `${condition} (Simulado)`,
    humidity: `${65 + Math.floor(Math.random() * 20)}%`,
    windSpeed: `${5 + Math.floor(Math.random() * 8)} km/h`,
    feelsLike: temp + Math.floor(Math.random() * 4) - 1,
    pressure: `${1010 + Math.floor(Math.random() * 8)} hPa`,
    visibility: '10 km',
    sunrise: '06:00',
    sunset: '18:30',
    location: 'Colonia Morazán, SV',
    detectionMethod: 'Simulado',
    isReal: false,
    isExpo: true,
    error: false,
    lastUpdated: new Date().toISOString(),
    source: 'Simulado - Colonia Morazán específico'
  };
};

// 🔤 Traducción de condiciones
const translateWeatherCondition = (description, main) => {
  const translations = {
    'clear sky': 'Despejado',
    'few clouds': 'Pocas nubes',
    'scattered clouds': 'Parcialmente nublado',
    'broken clouds': 'Nublado',
    'overcast clouds': 'Muy nublado',
    'light rain': 'Lluvia ligera',
    'moderate rain': 'Lluvia moderada',
    'heavy intensity rain': 'Lluvia intensa',
    'shower rain': 'Aguacero',
    'thunderstorm': 'Tormenta',
    'mist': 'Bruma',
    'fog': 'Niebla',
    'nubes': 'Nublado',
    'cielo claro': 'Despejado'
  };

  if (!description) {
    return main === 'Clear' ? 'Despejado' : 'Soleado';
  }

  const lowerDescription = description.toLowerCase().trim();
  return translations[lowerDescription] || 'Despejado';
};

// 🧪 Test específico para Expo
export const testExpoWeather = async () => {
  console.clear();
  console.log('🧪 TEST EXPO - CLIMA OPTIMIZADO');
  console.log('===============================');
  
  const start = Date.now();
  
  try {
    const weather = await getExpoWeather();
    
    console.log('📊 RESULTADO FINAL:');
    console.log('==================');
    console.log('📍 Ubicación:', weather.location);
    console.log('🌡️ Temperatura:', weather.temperature + '°C');
    console.log('🌤️ Condición:', weather.condition);
    console.log('💧 Humedad:', weather.humidity);
    console.log('🔍 Método usado:', weather.detectionMethod);
    console.log('🔄 Datos reales:', weather.isReal ? '✅ SÍ' : '❌ NO');
    console.log('📱 Optimizado Expo:', weather.isExpo ? '✅ SÍ' : '❌ NO');
    console.log('⏱️ Tiempo total:', (Date.now() - start) + 'ms');
    
    if (weather.accuracy) {
      console.log('🎯 Precisión GPS:', Math.round(weather.accuracy) + 'm');
    }
    
    return weather;
  } catch (error) {
    console.error('❌ Error en test:', error);
    return null;
  }
};

// 🚀 Función principal para reemplazar getCurrentWeather
export const getCurrentWeather = async () => {
  return await getExpoWeather();
};