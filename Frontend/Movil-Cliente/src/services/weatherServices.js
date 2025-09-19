// src/services/weatherService.js
// Servicio MEJORADO para obtener el clima real de El Salvador

// Tu API key de OpenWeatherMap
const WEATHER_API_KEY = 'eb6167d92267287c86dca55b6ae66751'; // Tu API key real
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Coordenadas de San Salvador
const SAN_SALVADOR_COORDS = {
  lat: 13.6929,
  lon: -89.2182
};

// 🌤️ Función principal para obtener el clima actual
export const getCurrentWeather = async () => {
  try {
    // Verificar si la API key está configurada
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'TU_API_KEY_AQUI') {
      console.warn('⚠️ API key de clima no configurada, usando datos simulados');
      return getSimulatedWeather();
    }

    const url = `${WEATHER_BASE_URL}/weather?lat=${SAN_SALVADOR_COORDS.lat}&lon=${SAN_SALVADOR_COORDS.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=es`;
    
    console.log('🌐 Solicitando clima desde OpenWeatherMap...');
    console.log('📍 Coordenadas: San Salvador, El Salvador');
    console.log('🔗 URL:', url.replace(WEATHER_API_KEY, 'API_KEY_HIDDEN'));

    const response = await fetch(url, {
      timeout: 10000, // 10 segundos de timeout
    });

    console.log('📡 Response status:', response.status);

    // Manejar errores específicos de la API
    if (response.status === 401) {
      console.error('❌ Error 401: API key inválida o no configurada');
      return getSimulatedWeather();
    }

    if (response.status === 403) {
      console.error('❌ Error 403: API key sin permisos o plan agotado');
      return getSimulatedWeather();
    }

    if (response.status === 429) {
      console.error('❌ Error 429: Demasiadas peticiones, usando datos simulados');
      return getSimulatedWeather();
    }

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Datos de clima recibidos:', data);
    
    const weatherData = {
      temperature: Math.round(data.main.temp).toString(),
      condition: translateWeatherCondition(data.weather[0].description, data.weather[0].main),
      humidity: `${data.main.humidity}%`,
      icon: data.weather[0].icon,
      windSpeed: `${Math.round(data.wind?.speed || 0)} km/h`,
      feelsLike: Math.round(data.main.feels_like),
      pressure: `${data.main.pressure} hPa`,
      visibility: data.visibility ? `${Math.round(data.visibility / 1000)} km` : 'N/A',
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('es-SV', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('es-SV', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isReal: true,
      error: false,
      lastUpdated: new Date().toISOString(),
      source: 'OpenWeatherMap'
    };

    console.log('🌤️ Datos procesados:', weatherData);
    return weatherData;

  } catch (error) {
    console.error('💥 Error obteniendo clima real:', error.message);
    console.log('🔄 Usando datos simulados como respaldo...');
    return getSimulatedWeather();
  }
};

// 🎭 Función para datos simulados realistas de El Salvador
const getSimulatedWeather = () => {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1; // 1-12
  
  console.log('🎭 Generando datos simulados para San Salvador...');
  console.log('⏰ Hora actual:', hour);
  console.log('📅 Mes actual:', month);
  
  // Patrones climáticos típicos de El Salvador por época del año
  const isRainySeason = month >= 5 && month <= 10; // Mayo a Octubre
  const isDrySeason = !isRainySeason; // Noviembre a Abril
  
  // Datos típicos de San Salvador según época y hora
  let weatherOptions;
  
  if (isDrySeason) {
    // Época seca (Nov-Abr): Más soleado, menos humedad
    if (hour >= 6 && hour <= 11) { // Mañana
      weatherOptions = [
        { temp: 22, condition: 'Despejado', humidity: 65, wind: 8 },
        { temp: 24, condition: 'Pocas nubes', humidity: 60, wind: 10 },
        { temp: 26, condition: 'Soleado', humidity: 55, wind: 12 }
      ];
    } else if (hour >= 12 && hour <= 17) { // Tarde
      weatherOptions = [
        { temp: 32, condition: 'Muy soleado', humidity: 45, wind: 15 },
        { temp: 35, condition: 'Soleado', humidity: 40, wind: 18 },
        { temp: 29, condition: 'Pocas nubes', humidity: 50, wind: 12 }
      ];
    } else if (hour >= 18 && hour <= 21) { // Noche
      weatherOptions = [
        { temp: 26, condition: 'Despejado', humidity: 60, wind: 8 },
        { temp: 24, condition: 'Pocas nubes', humidity: 65, wind: 6 },
        { temp: 25, condition: 'Parcialmente nublado', humidity: 62, wind: 7 }
      ];
    } else { // Madrugada
      weatherOptions = [
        { temp: 19, condition: 'Despejado', humidity: 70, wind: 5 },
        { temp: 21, condition: 'Pocas nubes', humidity: 68, wind: 4 },
        { temp: 18, condition: 'Bruma', humidity: 75, wind: 3 }
      ];
    }
  } else {
    // Época lluviosa (May-Oct): Más nublado, más humedad
    if (hour >= 6 && hour <= 11) { // Mañana
      weatherOptions = [
        { temp: 24, condition: 'Parcialmente nublado', humidity: 75, wind: 6 },
        { temp: 22, condition: 'Nublado', humidity: 80, wind: 8 },
        { temp: 26, condition: 'Pocas nubes', humidity: 70, wind: 10 }
      ];
    } else if (hour >= 12 && hour <= 17) { // Tarde (hora de lluvia típica)
      weatherOptions = [
        { temp: 28, condition: 'Lluvia ligera', humidity: 85, wind: 12 },
        { temp: 30, condition: 'Tormenta', humidity: 90, wind: 20 },
        { temp: 26, condition: 'Muy nublado', humidity: 80, wind: 15 },
        { temp: 29, condition: 'Nublado', humidity: 75, wind: 10 }
      ];
    } else if (hour >= 18 && hour <= 21) { // Noche
      weatherOptions = [
        { temp: 24, condition: 'Lluvia ligera', humidity: 85, wind: 8 },
        { temp: 26, condition: 'Nublado', humidity: 80, wind: 6 },
        { temp: 25, condition: 'Muy nublado', humidity: 78, wind: 7 }
      ];
    } else { // Madrugada
      weatherOptions = [
        { temp: 20, condition: 'Nublado', humidity: 85, wind: 4 },
        { temp: 22, condition: 'Bruma', humidity: 88, wind: 3 },
        { temp: 19, condition: 'Niebla', humidity: 90, wind: 2 }
      ];
    }
  }

  // Seleccionar una opción aleatoria
  const selected = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
  
  const simulatedData = {
    temperature: selected.temp.toString(),
    condition: `${selected.condition} (Simulado)`,
    humidity: `${selected.humidity}%`,
    windSpeed: `${selected.wind} km/h`,
    feelsLike: selected.temp + Math.floor(Math.random() * 4) - 2, // +/- 2°C
    pressure: `${1013 + Math.floor(Math.random() * 20) - 10} hPa`, // Variación realista
    visibility: '10 km',
    sunrise: '06:00',
    sunset: '18:30',
    isReal: false,
    error: false,
    lastUpdated: new Date().toISOString(),
    source: 'Simulado - Patrón típico de El Salvador',
    season: isDrySeason ? 'Época seca' : 'Época lluviosa'
  };

  console.log('🎭 Datos simulados generados:', simulatedData);
  return simulatedData;
};

// 🔤 Función MEJORADA para traducir condiciones del clima
const translateWeatherCondition = (description, main) => {
  console.log('🔤 Traduciendo condición:', { description, main });
  
  // Traducciones específicas y precisas
  const translations = {
    // Cielos despejados
    'clear sky': 'Despejado',
    'cielo claro': 'Despejado',
    
    // Nubes
    'few clouds': 'Pocas nubes',
    'pocas nubes': 'Pocas nubes',
    'scattered clouds': 'Parcialmente nublado',
    'nubes dispersas': 'Parcialmente nublado',
    'broken clouds': 'Nublado',
    'nubes rotas': 'Nublado',
    'overcast clouds': 'Muy nublado',
    'nublado': 'Nublado',
    'muy nublado': 'Muy nublado',
    
    // Lluvia
    'light rain': 'Lluvia ligera',
    'lluvia ligera': 'Lluvia ligera',
    'moderate rain': 'Lluvia moderada',
    'lluvia moderada': 'Lluvia moderada',
    'heavy intensity rain': 'Lluvia intensa',
    'lluvia intensa': 'Lluvia intensa',
    'very heavy rain': 'Lluvia muy intensa',
    'extreme rain': 'Lluvia extrema',
    'freezing rain': 'Lluvia helada',
    'shower rain': 'Aguacero',
    'chubasco': 'Aguacero',
    'light intensity shower rain': 'Llovizna',
    'llovizna': 'Llovizna',
    'heavy intensity shower rain': 'Aguacero intenso',
    'ragged shower rain': 'Aguacero irregular',
    
    // Tormentas
    'thunderstorm': 'Tormenta',
    'tormenta': 'Tormenta',
    'thunderstorm with light rain': 'Tormenta con lluvia ligera',
    'thunderstorm with rain': 'Tormenta con lluvia',
    'thunderstorm with heavy rain': 'Tormenta con lluvia intensa',
    'light thunderstorm': 'Tormenta ligera',
    'heavy thunderstorm': 'Tormenta intensa',
    'ragged thunderstorm': 'Tormenta irregular',
    'thunderstorm with light drizzle': 'Tormenta con llovizna',
    'thunderstorm with drizzle': 'Tormenta con llovizna',
    'thunderstorm with heavy drizzle': 'Tormenta con llovizna intensa',
    
    // Atmosféricas
    'mist': 'Bruma',
    'bruma': 'Bruma',
    'smoke': 'Humo',
    'haze': 'Calina',
    'sand/dust whirls': 'Remolinos de polvo',
    'fog': 'Niebla',
    'niebla': 'Niebla',
    'sand': 'Arena en suspensión',
    'dust': 'Polvo en suspensión',
    'volcanic ash': 'Ceniza volcánica',
    'squalls': 'Ráfagas de viento',
    'tornado': 'Tornado',
    
    // Nieve (raro en El Salvador pero por completitud)
    'light snow': 'Nevada ligera',
    'snow': 'Nieve',
    'heavy snow': 'Nevada intensa',
    'sleet': 'Aguanieve'
  };

  const lowerDescription = description.toLowerCase().trim();
  const translated = translations[lowerDescription];
  
  if (translated) {
    console.log(`✅ Traducción encontrada: "${description}" → "${translated}"`);
    return translated;
  }

  // Si no hay traducción exacta, usar el main como fallback
  const mainTranslations = {
    'Clear': 'Despejado',
    'Clouds': 'Nublado',
    'Rain': 'Lluvioso',
    'Drizzle': 'Llovizna',
    'Thunderstorm': 'Tormenta',
    'Snow': 'Nieve',
    'Mist': 'Bruma',
    'Smoke': 'Humo',
    'Haze': 'Calina',
    'Dust': 'Polvo',
    'Fog': 'Niebla',
    'Sand': 'Arena',
    'Ash': 'Ceniza',
    'Squall': 'Ráfagas',
    'Tornado': 'Tornado'
  };

  if (main && mainTranslations[main]) {
    console.log(`⚠️ Usando traducción de main: "${main}" → "${mainTranslations[main]}"`);
    return mainTranslations[main];
  }

  console.log(`❌ Sin traducción para: "${description}" (main: "${main}"), usando original`);
  return description; // Retornar original si no hay traducción
};

// 🔍 Función para verificar si la API key es válida
export const checkWeatherAPIKey = async () => {
  console.log('🔑 Verificando API key...');
  
  if (!WEATHER_API_KEY || WEATHER_API_KEY === 'TU_API_KEY_AQUI') {
    return { 
      valid: false, 
      message: 'API key no configurada',
      details: 'Necesitas configurar WEATHER_API_KEY en weatherService.js'
    };
  }

  try {
    const response = await fetch(
      `${WEATHER_BASE_URL}/weather?lat=${SAN_SALVADOR_COORDS.lat}&lon=${SAN_SALVADOR_COORDS.lon}&appid=${WEATHER_API_KEY}&units=metric`,
      { timeout: 5000 }
    );

    if (response.status === 401) {
      return { 
        valid: false, 
        message: 'API key inválida',
        details: 'La API key proporcionada no es válida'
      };
    }

    if (response.status === 403) {
      return { 
        valid: false, 
        message: 'API key sin permisos',
        details: 'La API key no tiene permisos o el plan está agotado'
      };
    }

    if (response.status === 429) {
      return { 
        valid: false, 
        message: 'Límite de peticiones excedido',
        details: 'Has superado el límite de peticiones por minuto/día'
      };
    }

    if (response.ok) {
      const data = await response.json();
      return { 
        valid: true, 
        message: 'API key válida y funcionando',
        details: `Conectado a OpenWeatherMap. Ubicación: ${data.name}, ${data.sys.country}`
      };
    }

    return { 
      valid: false, 
      message: `Error HTTP: ${response.status}`,
      details: response.statusText
    };

  } catch (error) {
    return { 
      valid: false, 
      message: 'Error de conexión',
      details: error.message
    };
  }
};

// 📊 Función para obtener pronóstico de 5 días (opcional)
export const getForecast = async () => {
  try {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'TU_API_KEY_AQUI') {
      console.warn('⚠️ API key no configurada para pronóstico');
      return null;
    }

    const url = `${WEATHER_BASE_URL}/forecast?lat=${SAN_SALVADOR_COORDS.lat}&lon=${SAN_SALVADOR_COORDS.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=es`;
    
    const response = await fetch(url, { timeout: 10000 });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // Procesar los datos del pronóstico
    const forecast = data.list.slice(0, 5).map(item => ({
      datetime: new Date(item.dt * 1000),
      temperature: Math.round(item.main.temp),
      condition: translateWeatherCondition(item.weather[0].description, item.weather[0].main),
      humidity: item.main.humidity,
      icon: item.weather[0].icon
    }));

    return forecast;

  } catch (error) {
    console.error('💥 Error obteniendo pronóstico:', error);
    return null;
  }
};

// 🧪 Función para forzar datos de prueba (desarrollo)
export const getTestWeatherData = (type = 'sunny') => {
  const testData = {
    sunny: {
      temperature: '32',
      condition: 'Muy soleado',
      humidity: '45%',
      windSpeed: '12 km/h',
      isReal: false,
      source: 'Datos de prueba - Soleado'
    },
    cloudy: {
      temperature: '26',
      condition: 'Muy nublado',
      humidity: '75%',
      windSpeed: '8 km/h',
      isReal: false,
      source: 'Datos de prueba - Nublado'
    },
    rainy: {
      temperature: '24',
      condition: 'Lluvia intensa',
      humidity: '90%',
      windSpeed: '15 km/h',
      isReal: false,
      source: 'Datos de prueba - Lluvioso'
    }
  };

  return testData[type] || testData.sunny;
};

// 🌡️ Función para convertir temperaturas
export const convertTemperature = (temp, from = 'C', to = 'F') => {
  const temperature = parseFloat(temp);
  
  if (from === 'C' && to === 'F') {
    return Math.round((temperature * 9/5) + 32);
  }
  
  if (from === 'F' && to === 'C') {
    return Math.round((temperature - 32) * 5/9);
  }
  
  return temperature;
};

// 📍 Función para obtener ubicación personalizada (opcional)
export const getWeatherByCoords = async (latitude, longitude) => {
  try {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'TU_API_KEY_AQUI') {
      console.warn('⚠️ API key no configurada');
      return getSimulatedWeather();
    }

    const url = `${WEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=es`;
    
    const response = await fetch(url, { timeout: 10000 });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp).toString(),
      condition: translateWeatherCondition(data.weather[0].description, data.weather[0].main),
      humidity: `${data.main.humidity}%`,
      location: `${data.name}, ${data.sys.country}`,
      isReal: true,
      coordinates: { lat: latitude, lon: longitude }
    };

  } catch (error) {
    console.error('💥 Error obteniendo clima por coordenadas:', error);
    return getSimulatedWeather();
  }
};