// src/services/weatherService.js
// Servicio para obtener el clima real de El Salvador

// Tu API key de OpenWeatherMap
const WEATHER_API_KEY = 'eb6167d92267287c86dca55b6ae66751'; // Tu API key real
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Coordenadas de San Salvador
const SAN_SALVADOR_COORDS = {
  lat: 13.6929,
  lon: -89.2182
};

// Función para obtener el clima actual
export const getCurrentWeather = async () => {
  try {
    // Verificar si la API key está configurada
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'TU_API_KEY_AQUI') {
      console.warn('API key de clima no configurada, usando datos simulados');
      return getSimulatedWeather();
    }

    const url = `${WEATHER_BASE_URL}/weather?lat=${SAN_SALVADOR_COORDS.lat}&lon=${SAN_SALVADOR_COORDS.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=es`;
    
    console.log('Solicitando clima desde:', url.replace(WEATHER_API_KEY, 'API_KEY_HIDDEN'));

    const response = await fetch(url);

    console.log('Response status:', response.status);

    if (response.status === 401) {
      console.error('Error 401: API key inválida o no configurada');
      return getSimulatedWeather();
    }

    if (response.status === 403) {
      console.error('Error 403: API key sin permisos o plan agotado');
      return getSimulatedWeather();
    }

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp).toString(),
      condition: translateWeatherCondition(data.weather[0].description),
      humidity: `${data.main.humidity}%`,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      isReal: true
    };

  } catch (error) {
    console.error('Error obteniendo clima:', error);
    return getSimulatedWeather();
  }
};

// Función para datos simulados de clima típico de El Salvador
const getSimulatedWeather = () => {
  const hour = new Date().getHours();
  
  // Datos típicos de San Salvador por hora del día
  const weatherPatterns = {
    morning: [
      { temp: 22, condition: 'Despejado', humidity: 75 },
      { temp: 24, condition: 'Pocas nubes', humidity: 70 },
      { temp: 26, condition: 'Parcialmente nublado', humidity: 68 }
    ],
    afternoon: [
      { temp: 32, condition: 'Soleado', humidity: 60 },
      { temp: 35, condition: 'Muy soleado', humidity: 55 },
      { temp: 29, condition: 'Parcialmente nublado', humidity: 65 }
    ],
    evening: [
      { temp: 28, condition: 'Nublado', humidity: 70 },
      { temp: 25, condition: 'Lluvia ligera', humidity: 80 },
      { temp: 27, condition: 'Parcialmente nublado', humidity: 72 }
    ],
    night: [
      { temp: 20, condition: 'Despejado', humidity: 78 },
      { temp: 22, condition: 'Pocas nubes', humidity: 75 },
      { temp: 19, condition: 'Nublado', humidity: 80 }
    ]
  };

  let pattern;
  if (hour >= 6 && hour <= 11) pattern = 'morning';
  else if (hour >= 12 && hour <= 17) pattern = 'afternoon';
  else if (hour >= 18 && hour <= 21) pattern = 'evening';
  else pattern = 'night';

  const options = weatherPatterns[pattern];
  const selected = options[Math.floor(Math.random() * options.length)];

  return {
    temperature: selected.temp.toString(),
    condition: selected.condition + ' (Simulado)',
    humidity: `${selected.humidity}%`,
    isReal: false,
    error: false
  };
};

// Función para traducir las condiciones del clima
const translateWeatherCondition = (condition) => {
  const translations = {
    'clear sky': 'Despejado',
    'few clouds': 'Pocas nubes',
    'scattered clouds': 'Nublado parcial',
    'broken clouds': 'Nublado',
    'overcast clouds': 'Muy nublado',
    'shower rain': 'Lluvia ligera',
    'light rain': 'Lluvia ligera',
    'moderate rain': 'Lluvia moderada',
    'heavy intensity rain': 'Lluvia intensa',
    'very heavy rain': 'Lluvia muy intensa',
    'extreme rain': 'Lluvia extrema',
    'freezing rain': 'Lluvia helada',
    'light intensity shower rain': 'Llovizna ligera',
    'shower rain': 'Aguacero',
    'heavy intensity shower rain': 'Aguacero intenso',
    'ragged shower rain': 'Aguacero irregular',
    'rain': 'Lluvioso',
    'thunderstorm': 'Tormenta',
    'thunderstorm with light rain': 'Tormenta con lluvia ligera',
    'thunderstorm with rain': 'Tormenta con lluvia',
    'thunderstorm with heavy rain': 'Tormenta con lluvia intensa',
    'light thunderstorm': 'Tormenta ligera',
    'heavy thunderstorm': 'Tormenta intensa',
    'ragged thunderstorm': 'Tormenta irregular',
    'thunderstorm with light drizzle': 'Tormenta con llovizna',
    'thunderstorm with drizzle': 'Tormenta con llovizna',
    'thunderstorm with heavy drizzle': 'Tormenta con llovizna intensa',
    'snow': 'Nieve',
    'mist': 'Bruma',
    'smoke': 'Humo',
    'haze': 'Calina',
    'sand/dust whirls': 'Remolinos de arena',
    'fog': 'Niebla',
    'sand': 'Arena',
    'dust': 'Polvo',
    'volcanic ash': 'Ceniza volcánica',
    'squalls': 'Ráfagas',
    'tornado': 'Tornado'
  };

  return translations[condition.toLowerCase()] || condition;
};

// Función para verificar si la API key es válida
export const checkWeatherAPIKey = async () => {
  if (!WEATHER_API_KEY || WEATHER_API_KEY === 'TU_API_KEY_AQUI') {
    return { valid: false, message: 'API key no configurada' };
  }

  try {
    const response = await fetch(
      `${WEATHER_BASE_URL}/weather?lat=${SAN_SALVADOR_COORDS.lat}&lon=${SAN_SALVADOR_COORDS.lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (response.status === 401) {
      return { valid: false, message: 'API key inválida' };
    }

    if (response.status === 403) {
      return { valid: false, message: 'API key sin permisos o plan agotado' };
    }

    if (response.ok) {
      return { valid: true, message: 'API key válida' };
    }

    return { valid: false, message: `Error: ${response.status}` };

  } catch (error) {
    return { valid: false, message: `Error de conexión: ${error.message}` };
  }
};