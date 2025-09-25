// src/hooks/useRealWeather.js
import { useState, useEffect, useCallback } from 'react';
import { getCurrentWeather } from '../services/weatherServices';

export const useRealWeather = () => {
  const [weather, setWeather] = useState({
    temperature: '28',
    condition: 'Cargando...',
    humidity: '70%',
    locationCity: 'Cargando...', // AGREGAR ESTO
    locationFull: 'Cargando ubicación...', // AGREGAR ESTO
    loading: true,
    error: false
  });

  const fetchWeather = useCallback(async () => {
    setWeather(prev => ({ ...prev, loading: true, error: false }));
    
    try {
      const weatherData = await getCurrentWeather();
      
      // DEBUGGING: Ver qué está devolviendo el servicio
      console.log('🔍 Datos del servicio de clima:', weatherData);
      console.log('🏠 Location recibida:', weatherData.location);
      console.log('🏙️ LocationCity recibida:', weatherData.locationCity);
      
      setWeather({
        ...weatherData,
        loading: false,
        error: false
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeather(prev => ({
        ...prev,
        loading: false,
        error: true,
        condition: 'Error al cargar',
        locationCity: 'Sin ubicación'
      }));
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, refetchWeather: fetchWeather };
};