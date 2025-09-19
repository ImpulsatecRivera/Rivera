// src/screens/DashboardScreen.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, Text, TouchableOpacity,
  Dimensions, Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/authContext';
import ProjectCard from '../components/ProjectCard';
import useMyQuotes from '../hooks/useMyQuotes';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import LottieView from 'lottie-react-native';
import Summer from "../assets/lottie/Summer Vibes.json";
import Rain from "../assets/lottie/rainy icon.json";
import Cloudy from "../assets/lottie/Cloudy Animation.json";
import Location from "../assets/lottie/Add Document.json";
import { useRealWeather } from '../hooks/useRealWheather';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BG = '#F5F5F5';
const LOGO_WIDTH = Math.min(SCREEN_WIDTH * 0.6, 280);
const LOGO_HEIGHT = 80;
const API_BASE_URL = 'https://riveraproject-production.up.railway.app';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Estado para hora
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Usar el hook de clima real
  const { weather } = useRealWeather();

  // Obtener hora de El Salvador (UTC-6)
  const getSalvadorTime = useCallback(() => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const salvadorTime = new Date(utc + (-6 * 3600000));
    return salvadorTime;
  }, []);

  // Actualizar la hora cada minuto
  useEffect(() => {
    setCurrentTime(getSalvadorTime());
    
    const timer = setInterval(() => {
      setCurrentTime(getSalvadorTime());
    }, 60000);

    return () => clearInterval(timer);
  }, [getSalvadorTime]);

  // Función para obtener la animación Lottie según el clima real
  const getWeatherAnimation = useCallback((condition) => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('despejado') || 
        lowerCondition.includes('soleado') || 
        lowerCondition.includes('pocas nubes')) {
      return Summer;
    }
    
    if (lowerCondition.includes('lluv') || 
        lowerCondition.includes('tormenta')) {
      return Rain;
    }
    
    if (lowerCondition.includes('nubl') || 
        lowerCondition.includes('bruma') || 
        lowerCondition.includes('niebla')) {
      return Cloudy;
    }
    
    return Summer; // Por defecto
  }, []);

  // Cotizaciones (hook conectado al backend)
  const { quotes, loading, error, refreshing, refresh, reload } = useMyQuotes(API_BASE_URL);

  const handleProjectPress = useCallback((q) => {
    // Navegar a la pantalla de detalles en lugar de abrir modal
    navigation.navigate('QuoteDetails', { quote: q });
  }, [navigation]);

  const handleAddQuote = useCallback(() => {
    navigation.navigate('Cotizacion');
  }, [navigation]);

  // FIX del bucle de carga
  const reloadRef = useRef(reload);
  useEffect(() => { 
    reloadRef.current = reload; 
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      reloadRef.current();
      return () => {};
    }, [])
  );

  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString('es-SV', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/El_Salvador'
    });
  }, []);

  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('es-SV', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/El_Salvador'
    });
  }, []);

  const renderQuotesContent = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10AC84" />
          <Text style={styles.loadingText}>Cargando tus cotizaciones…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}. Desliza hacia abajo para reintentar.
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { marginTop: 12 }]} 
            onPress={() => reloadRef.current()}
          >
            <View style={styles.retryButtonContent}>
              <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    if (quotes.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>
            ¡Aún no tienes cotizaciones!
          </Text>
          <Text style={styles.emptySubtitle}>
            Usa el botón flotante para crear tu primera cotización y aprovechar el 30% OFF de este mes.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.projectsGrid}>
        {quotes.slice(0, 6).map((q) => (
          <ProjectCard
            key={q.id}
            project={{
              id: q.id,
              name: q.title,
              price: `${q.currency === 'USD' ? '$ ' : ''}${(q.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              status: q.status,
              icon: '📄',
            }}
            onPress={() => handleProjectPress(q)}
          />
        ))}
      </View>
    );
  }, [loading, error, quotes, handleProjectPress]);

  // Función para manejar el refresh de cotizaciones
  const handleRefresh = useCallback(() => {
    refresh(); // Solo refresh de cotizaciones
  }, [refresh]);

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Espacio extra para el botón flotante
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
          />
        }
      >
        {/* Header con logo */}
        <View style={styles.header}>
          <Image source={require('../images/logo.png')} style={styles.logo} />
          
          {/* Saludo personalizado */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              ¡Hola{user?.name ? `, ${user.name}` : ''}! 👋
            </Text>
            <Text style={styles.welcomeSubtext}>
              Bienvenido a Rivera Distribuidora
            </Text>
          </View>
        </View>

        {/* Sección de Clima y Hora - ACTUALIZADA CON CLIMA REAL */}
        <View style={styles.weatherTimeContainer}>
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <View style={styles.lottieContainer}>
                {weather.loading ? (
                  <ActivityIndicator size="small" color="#10AC84" />
                ) : (
                  <LottieView
                    source={getWeatherAnimation(weather.condition)}
                    autoPlay
                    loop
                    style={styles.weatherLottie}
                  />
                )}
              </View>
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>
                  {weather.loading ? '...' : `${weather.temperature}°C`}
                </Text>
                <Text style={styles.weatherCondition}>
                  {weather.condition}
                  {weather.error && ' (Sin conexión)'}
                </Text>
              </View>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetailItem}>
                <Text style={styles.weatherDetailLabel}>Humedad</Text>
                <Text style={styles.weatherDetailValue}>
                  {weather.loading ? '...' : weather.humidity}
                </Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Text style={styles.weatherDetailLabel}>San Salvador</Text>
                <Text style={styles.weatherDetailValue}>El Salvador</Text>
              </View>
            </View>
          </View>

          <View style={styles.timeCard}>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
            <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
            <View style={styles.clockIcon}>
              <Text style={styles.clockEmoji}>🕐</Text>
            </View>
          </View>
        </View>

        {/* Sección de cotizaciones */}
        <View style={styles.quotesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Mis Cotizaciones</Text>
            <Text style={styles.sectionSubtitle}>Últimas cotizaciones realizadas</Text>
          </View>

          {renderQuotesContent()}
        </View>
      </ScrollView>

      {/* BOTÓN FLOTANTE */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={handleAddQuote}
        activeOpacity={0.8}
      >
        <View style={styles.floatingButtonContent}>
          <LottieView
            source={Location}
            autoPlay
            loop
            style={styles.floatingButtonLottie}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BG 
  },
  content: { 
    flex: 1 
  },

  // Header mejorado
  header: { 
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    marginBottom: 20,
  },
  logo: { 
    width: LOGO_WIDTH, 
    height: LOGO_HEIGHT, 
    resizeMode: 'contain', 
    alignSelf: 'center',
    marginBottom: 15,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },

  // Sección de clima y hora
  weatherTimeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 25,
    gap: 12,
  },
  weatherCard: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lottieContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherLottie: {
    width: '100%',
    height: '100%',
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  weatherCondition: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherDetailItem: {
    alignItems: 'center',
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  weatherDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  timeCard: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  currentTime: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentDate: {
    fontSize: 12,
    color: '#E8EAFF',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  clockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  clockEmoji: {
    fontSize: 16,
    opacity: 0.7,
  },

  // Sección de cotizaciones mejorada
  quotesSection: { 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  sectionHeader: { 
    marginBottom: 20,
    paddingLeft: 4,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },

  // Botón de reintentar (para errores)
  retryButton: {
    alignSelf: 'center',
    backgroundColor: '#10AC84',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonContent: {
    alignItems: 'center',
  },
  retryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },

  // Estados de carga, error y vacío mejorados
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
    fontSize: 16,
  },

  errorContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  errorText: {
    color: '#d00',
    textAlign: 'center',
    fontSize: 16,
  },

  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },

  projectsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },

  // ESTILOS DEL BOTÓN FLOTANTE
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2DD4BF', // Verde turquesa claro
    shadowColor: '#2DD4BF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonLottie: {
    width: 36,
    height: 36,
  },
});

export default DashboardScreen;