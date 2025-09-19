// src/hooks/useRealWeather.js
// Hook personalizado para el clima real

import { useState, useEffect, useCallback } from 'react';
import { getCurrentWeather } from '../services/weatherServices';

export const useRealWeather = () => {
  const [weather, setWeather] = useState({
    temperature: '28',
    condition: 'Cargando...',
    humidity: '70%',
    loading: true,
    error: false
  });

  const fetchWeather = useCallback(async () => {
    setWeather(prev => ({ ...prev, loading: true, error: false }));
    
    try {
      const weatherData = await getCurrentWeather();
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
        condition: 'Error al cargar'
      }));
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    
    // Actualizar cada 10 minutos
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, refetchWeather: fetchWeather };
};